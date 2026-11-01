import { readNDJSON } from '../src/engine/streaming';
import { ProviderError } from './providers';
function base() {
  const url = new URL(process.env.LOCAL_TTS_URL || 'http://127.0.0.1:3002');
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new ProviderError(503, 'LOCAL_TTS_URL cần là HTTP loopback.');
  return url.origin;
}
export async function speechInfo(signal: AbortSignal) {
  try {
    const response = await fetch(`${base()}/voices`, { signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]), redirect: 'error' });
    if (!response.ok) throw new Error('not ready');
    const data = await response.json() as { voices?: unknown };
    if (!Array.isArray(data.voices)) throw new Error('invalid');
    return { ready: true, engine: 'VieNeu local', voices: data.voices.filter((v: unknown) => typeof v === 'string').slice(0, 100) };
  } catch { return { ready: false, engine: 'VieNeu local', voices: [], message: 'Chạy npm run speech:serve để mở giọng Việt local.' }; }
}
export async function synthesizeSpeech(body: unknown, signal: AbortSignal) {
  const value = body as { text?: unknown; voice?: unknown } | null;
  if (!value || typeof value.text !== 'string' || !value.text.trim() || value.text.length > 600 || typeof value.voice !== 'string' || value.voice.length > 100) throw new ProviderError(400, 'Đoạn giọng nói không hợp lệ (tối đa 600 ký tự).');
  try {
    const response = await fetch(`${base()}/speech`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: value.text, voice: value.voice }), signal, redirect: 'error' });
    if (!response.ok) throw new ProviderError(response.status === 429 ? 429 : 503, 'Giọng local chưa sẵn sàng hoặc đang bận. Hãy thử lại.');
    if (!response.headers.get('content-type')?.startsWith('audio/wav')) throw new ProviderError(502, 'Dữ liệu giọng nói không hợp lệ.');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 44 || bytes.length > 20_000_000 || bytes.toString('ascii', 0, 4) !== 'RIFF') throw new ProviderError(502, 'Âm thanh WAV không hợp lệ.');
    return bytes;
  } catch (error) { if (error instanceof ProviderError || signal.aborted) throw error; throw new ProviderError(503, 'Chưa kết nối được giọng Việt local. Chạy npm run speech:serve.'); }
}

export async function streamSpeech(body: unknown, signal: AbortSignal, emit: (event: unknown) => void) {
  const value = body as { text?: unknown; voice?: unknown } | null;
  if (!value || typeof value.text !== 'string' || !value.text.trim() || value.text.length > 600 || typeof value.voice !== 'string' || value.voice.length > 100) throw new ProviderError(400, 'Đoạn giọng nói không hợp lệ.');
  let response: Response;
  try { response = await fetch(`${base()}/speech/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value), signal, redirect: 'error' }); }
  catch (error) { if (signal.aborted) throw error; throw new ProviderError(503, 'Chưa mở giọng Việt local. Chạy npm run speech:serve.'); }
  if (!response.ok) throw new ProviderError(response.status === 429 ? 429 : 503, 'Giọng local đang bận hoặc chưa sẵn sàng.');
  let done = false; let total = 0;
  await readNDJSON(response, signal, event => {
    if (event.type === 'audio' && event.sampleRate === 48000 && typeof event.pcm === 'string' && event.pcm.length < 500000 && /^[A-Za-z0-9+/=]*$/.test(event.pcm)) {
      total += event.pcm.length; if (total > 30000000) throw new ProviderError(502, 'Đoạn âm thanh quá dài.');
      emit({ type: 'audio', sampleRate: 48000, pcm: event.pcm });
    } else if (event.type === 'done') { done = true; emit({ type: 'done' }); }
    else throw new ProviderError(502, 'Giọng local trả dữ liệu không hợp lệ.');
  });
  if (!done) throw new ProviderError(502, 'Giọng local ngắt trước khi xong.');
}
