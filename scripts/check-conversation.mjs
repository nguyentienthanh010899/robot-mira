import { writeFile } from 'node:fs/promises';
const base = process.env.MIRA_API_URL || 'http://127.0.0.1:3001';
const started = performance.now();
let firstTextMs, firstSentenceMs, firstAudioMs, reply, voiceTask, voiceError;
async function lines(response, receive) {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = '';
  try { while (true) { const { value, done } = await reader.read(); pending += decoder.decode(value, { stream: !done }); const list = pending.split('\n'); pending = list.pop(); for (const line of list) if (line.trim()) receive(JSON.parse(line)); if (done) { if (pending.trim()) receive(JSON.parse(pending)); break; } } }
  finally { await reader.cancel().catch(() => {}); }
}
const post = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(180000) });
const response = await fetch(base + '/api/chat/stream', post({ provider: 'ollama', messages: [{ role: 'user', content: 'Nói khoảng 6 câu về lợi ích của việc đọc sách và cách bắt đầu thói quen này.' }], settings: { mode: 'fast', length: 'long' } }));
await lines(response, event => {
  if (event.type === 'error') throw new Error(event.error);
  if (event.type === 'done') reply = event.reply;
  if (event.type !== 'text' || !event.text.trim()) return;
  firstTextMs ??= Math.round(performance.now() - started);
  const sentence = /[.!?](?=\s|$)/.exec(event.text);
  if (!voiceTask && sentence) {
    firstSentenceMs = Math.round(performance.now() - started);
    voiceTask = fetch(base + '/api/speech/stream', post({ text: event.text.slice(0, sentence.index + 1), voice: 'Hải Đăng' })).then(r => lines(r, e => { if (e.type === 'error') throw new Error(e.error); if (e.type === 'audio') firstAudioMs ??= Math.round(performance.now() - started); })).catch(error => { voiceError = String(error); });
  }
});
const generationMs = Math.round(performance.now() - started);
await voiceTask;
if (!reply || !firstAudioMs || voiceError) throw new Error(voiceError || 'Missing reply/audio');
const result = { firstTextMs, firstSentenceMs, firstAudioMs, generationMs, characters: reply.text.length, actions: reply.actions, note: 'One real fast/long LLM + first-sentence TTS test. Audio arrival at HTTP client, not microphone-to-speaker or human listening quality.' };
await writeFile('data/conversation-check.json', JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
