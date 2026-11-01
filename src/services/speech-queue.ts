import { createLocalAudioPlayer } from './local-audio';
import { browserSpeechOutput } from './voice';
export interface VoiceInfo { ready: boolean; voices: string[]; message?: string }
export async function localVoices(signal: AbortSignal): Promise<VoiceInfo> {
  const response = await fetch('/api/speech/voices', { signal });
  if (!response.ok) throw new Error('Chưa kết nối được giọng local.');
  return response.json();
}
export function nextSpeechChunk(text: string, final: boolean): string | undefined {
  const boundary = /[.!?。！？](?:[”"']?)(?=\s|$)|\n/.exec(text);
  if (boundary && boundary.index < 280) return text.slice(0, boundary.index + boundary[0].length);
  if (text.length > 280) {
    const space = text.lastIndexOf(' ', 280);
    return text.slice(0, space > 80 ? space : 280);
  }
  return final && text.trim() ? text : undefined;
}
export interface SpeechQueue { update(fullText: string, final?: boolean): void; cancel(): void }
/** One queue per turn. Speak only finalized replies; actions are never executed. */
export function createSpeechQueue(engine: { kind: 'local'; voice: string } | { kind: 'browser'; voice: SpeechSynthesisVoice }, callbacks: { start(): void; pause?(): void; end(): void; error(message: string): void }): SpeechQueue {
  const controller = new AbortController();
  let full = '', consumed = 0, final = false, running = false, cancelled = false, failed = false;
  let release: (() => void) | undefined;
  const localPlayer = createLocalAudioPlayer(callbacks);
  async function say(text: string) {
    if (engine.kind === 'browser') {
      await new Promise<void>((resolve, reject) => { release = resolve; browserSpeechOutput.speak(text, engine.voice, { start: callbacks.start, end: resolve, error: message => reject(new Error(message)) }); });
      return;
    }
    await localPlayer.say(text, engine.voice, controller.signal);
  }
  async function drain() {
    if (!final || running || cancelled || failed) return;
    running = true;
    try {
      while (!cancelled) {
        const chunk = full.slice(consumed);
        if (!chunk) break;
        consumed += chunk.length;
        if (chunk.trim()) { await say(chunk.trim()); if (!cancelled) callbacks.pause?.(); }
      }
      if (final && !cancelled && !full.slice(consumed).trim()) callbacks.end();
    } catch (error) {
      if (!cancelled) { failed = true; localPlayer.cancel(); callbacks.error(error instanceof Error ? error.message : 'Giọng nói bị lỗi.'); }
    } finally { running = false; }
  }
  return {
    update(text, done = false) { if (cancelled || failed) return; if (done && text.trim() === full.trim()) text = full; if (!text.startsWith(full)) { this.cancel(); callbacks.error('Nội dung AI thay đổi trong lúc đọc. Hãy bấm Nghe lại.'); return; } full = text; final ||= done; void drain(); },
    cancel() { cancelled = true; controller.abort(); release?.(); localPlayer.cancel(); browserSpeechOutput.cancel(); },
  };
}
