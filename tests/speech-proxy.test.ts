import { afterEach, expect, it, vi } from 'vitest';
import { speechInfo, synthesizeSpeech } from '../server/speech';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('reports missing local TTS without trying paid providers', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('offline')); vi.stubGlobal('fetch', fetcher);
  expect(await speechInfo(new AbortController().signal)).toMatchObject({ ready: false });
  expect(fetcher.mock.calls[0][0]).toBe('http://127.0.0.1:3002/voices');
});
it('rejects invalid text before calling TTS', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  await expect(synthesizeSpeech({ text: 'a'.repeat(601), voice: 'test' }, new AbortController().signal)).rejects.toMatchObject({ status: 400 });
  expect(fetcher).not.toHaveBeenCalled();
});
it('rejects non-loopback TTS and incorrect audio payloads', async () => {
  vi.stubEnv('LOCAL_TTS_URL', 'https://example.com');
  await expect(synthesizeSpeech({ text: 'Hi', voice: 'test' }, new AbortController().signal)).rejects.toMatchObject({ status: 503 });
  vi.stubEnv('LOCAL_TTS_URL', 'http://127.0.0.1:3002');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-wav', { headers: { 'content-type': 'audio/wav' } })));
  await expect(synthesizeSpeech({ text: 'Hi', voice: 'test' }, new AbortController().signal)).rejects.toMatchObject({ status: 502 });
});
it('returns WAV bytes unchanged and normalizes engine busy errors', async () => {
  const bytes = Buffer.alloc(44); bytes.write('RIFF');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(bytes, { headers: { 'content-type': 'audio/wav' } })).mockResolvedValueOnce(new Response('{}', { status: 429 })));
  expect(await synthesizeSpeech({ text: 'Hi', voice: 'test' }, new AbortController().signal)).toEqual(bytes);
  await expect(synthesizeSpeech({ text: 'Hi', voice: 'test' }, new AbortController().signal)).rejects.toMatchObject({ status: 429 });
});
it('forwards only supported PCM audio frames and requires a completion event', async () => {
  const { streamSpeech } = await import('../server/speech');
  const events = [{ type: 'audio', sampleRate: 48000, pcm: 'AAAAAA==' }, { type: 'done' }];
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(events.map(e => JSON.stringify(e)).join('\n') + '\n')));
  const emit = vi.fn(); await streamSpeech({ text: 'Chào', voice: 'test' }, new AbortController().signal, emit);
  expect(emit.mock.calls.map(c => c[0])).toEqual(events);
});
it('rejects unsupported or interrupted audio streams', async () => {
  const { streamSpeech } = await import('../server/speech');
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('{"type":"audio","sampleRate":1,"pcm":"bad"}\n')).mockResolvedValueOnce(new Response('{"type":"audio","sampleRate":48000,"pcm":"AAAA"}\n'));
  vi.stubGlobal('fetch', fetcher);
  await expect(streamSpeech({ text: 'Chào', voice: 'test' }, new AbortController().signal, vi.fn())).rejects.toMatchObject({ status: 502 });
  await expect(streamSpeech({ text: 'Chào', voice: 'test' }, new AbortController().signal, vi.fn())).rejects.toThrow('ngắt');
});
