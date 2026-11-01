import { readNDJSON } from '../engine/streaming';
/** Bounded requests, buffered together before any playback. */
export function speechSegments(text: string): string[] {
  const parts: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 500) {
    const prefix = remaining.slice(0, 500);
    const boundary = [...prefix.matchAll(/[.!?。！？](?=\s)/g)].at(-1);
    const end = boundary ? boundary.index! + 1 : (prefix.lastIndexOf(' ') > 0 ? prefix.lastIndexOf(' ') : 500);
    parts.push(remaining.slice(0, end)); remaining = remaining.slice(end).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}
let context: AudioContext | undefined;
export function unlockLocalAudio() {
  if (!context || context.state === 'closed') context = new AudioContext();
  void context.resume().catch(() => {});
}
export function closeLocalAudio() { void context?.close().catch(() => {}); context = undefined; }
export function createLocalAudioPlayer(callbacks: { start(): void; pause?(): void }) {
  const sources = new Set<AudioBufferSourceNode>();
  let cancelled = false, cursor = 0, release: (() => void) | undefined;
  return {
    async say(text: string, voice: string, signal: AbortSignal) {
      unlockLocalAudio();
      const ctx = context!;
      // Some browsers suspend audio until a direct user gesture. Do not wait forever.
      let timer: ReturnType<typeof setTimeout> | undefined;
      try { await Promise.race([ctx.resume(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Bấm Nghe lại để cho phép phát âm thanh.')), 5000); })]); }
      finally { clearTimeout(timer); }
      if (cancelled || signal.aborted) return;
      let done = false;
      const buffers: AudioBuffer[] = [];
      let duration = 0;
      for (const segment of speechSegments(text)) {
      if (cancelled || signal.aborted) return;
      done = false;
      const response = await fetch('/api/speech/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: segment, voice }), signal });
      if (!response.ok) { const data = await response.json() as { error?: unknown }; throw new Error(typeof data.error === 'string' ? data.error : 'Không phát được giọng local.'); }
      await readNDJSON(response, signal, event => {
        if (cancelled) return;
        if (event.type === 'error') throw new Error(event.error || 'Giọng nói bị gián đoạn.');
        if (event.type === 'done') { done = true; return; }
        if (event.type !== 'audio' || event.sampleRate !== 48000 || typeof event.pcm !== 'string') throw new Error('Âm thanh local không hợp lệ.');
        const binary = atob(event.pcm);
        if (binary.length % 2 || binary.length > 400000) throw new Error('Khối âm thanh không hợp lệ.');
        if (!binary.length) return;
        const buffer = ctx.createBuffer(1, binary.length / 2, 48000); const channel = buffer.getChannelData(0);
        for (let i = 0; i < channel.length; i++) { const value = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8); channel[i] = (value >= 32768 ? value - 65536 : value) / 32768; }
        duration += buffer.duration;
        if (duration > 120) throw new Error('Hàng đợi âm thanh quá dài.');
        buffers.push(buffer);
      });
      if (cancelled || signal.aborted) return;
      if (!done) throw new Error('Giọng local chưa tạo xong âm thanh.');
      }
      if (cancelled || signal.aborted) return;
      if (!done || !buffers.length) throw new Error('Giọng local chưa tạo xong âm thanh.');
      // CPU synthesis can be slower than realtime. Buffer the complete reply
      // before scheduling so network/model delays cannot interrupt its words.
      cursor = ctx.currentTime + .06;
      for (const buffer of buffers) {
        const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination); sources.add(source);
        source.onended = () => { source.disconnect(); sources.delete(source); if (!sources.size) { callbacks.pause?.(); release?.(); } };
        source.start(cursor); cursor += buffer.duration;
      }
      callbacks.start();
      if (sources.size) await new Promise<void>(resolve => { release = resolve; });
    },
    cancel() { cancelled = true; for (const source of sources) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); } sources.clear(); release?.(); },
  };
}
