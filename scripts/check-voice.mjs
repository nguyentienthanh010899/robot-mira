import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.MIRA_API_URL || 'http://127.0.0.1:3001';
const info = await fetch(base + '/api/speech/voices').then(r => r.json());
if (!info.ready || !info.voices.length) throw new Error('Local TTS not ready');
const voice = info.voices.includes('Hải Đăng') ? 'Hải Đăng' : info.voices[0];
const started = performance.now(); let firstAudioMs; let done = false; const chunks = [];
const response = await fetch(base + '/api/speech/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Chào bạn, mình là MIRA.', voice }), signal: AbortSignal.timeout(120000) });
if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);
const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
while (true) {
  const { value, done: end } = await reader.read(); buffer += decoder.decode(value, { stream: !end });
  const lines = buffer.split('\n'); buffer = lines.pop();
  for (const line of lines) if (line.trim()) {
    const event = JSON.parse(line); if (event.type === 'error') throw new Error(event.error);
    if (event.type === 'audio') { firstAudioMs ??= Math.round(performance.now() - started); chunks.push(Buffer.from(event.pcm, 'base64')); }
    if (event.type === 'done') done = true;
  }
  if (end) break;
}
if (!done || !chunks.length) throw new Error('Incomplete audio');
const pcm = Buffer.concat(chunks); let peak = 0;
for (let i = 0; i + 1 < pcm.length; i += 2) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i)));
if (peak < 10) throw new Error('Audio appears silent');
const header = Buffer.alloc(44); header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(48000, 24); header.writeUInt32LE(96000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
await mkdir('data', { recursive: true }); await writeFile('data/voice-stream-preview.wav', Buffer.concat([header, pcm]));
const result = { voice, voiceCount: info.voices.length, firstAudioMs, totalMs: Math.round(performance.now() - started), audioSeconds: +(pcm.length / 96000).toFixed(2), peak, note: 'One local streaming synthesis through Node proxy, not browser playback or a listening-quality evaluation.' };
await writeFile('data/voice-benchmark.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
