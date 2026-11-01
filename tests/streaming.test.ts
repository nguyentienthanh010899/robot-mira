import { afterEach, expect, it, vi } from 'vitest';
import { readNDJSON, speechPrefix } from '../src/engine/streaming';
import { createProvider } from '../server/providers';
import { replySettings, replyBudgets } from '../server/reply-options';
import { nextSpeechChunk, createSpeechQueue } from '../src/services/speech-queue';
function streamResponse(lines: unknown[]) {
  return new Response(lines.map(l => JSON.stringify(l)).join('\n') + '\n', { headers: { 'Content-Type': 'application/x-ndjson' } });
}
afterEach(() => vi.unstubAllGlobals());
it('extracts speech safely across escapes and does not read action metadata', () => {
  expect(speechPrefix('{"speech":"Chào bạn')).toBe('Chào bạn');
  expect(speechPrefix('{"speech":"Xin \\"chào\\".\\nBạn')).toBe('Xin "chào".\nBạn');
  expect(speechPrefix('{"speech":"Xin chào.","actions":[{"type":"STOP"}]}')).toBe('Xin chào.');
  expect(speechPrefix('{"actions":[],"speech":"wrong order"}')).toBe('');
  expect(speechPrefix('{"speech":"Hi\\u12')).toBe('Hi');
});
it('reads NDJSON split within Unicode bytes', async () => {
  const bytes = new TextEncoder().encode('{"text":"Chào"}\n{"done":true}\n');
  const response = new Response(new ReadableStream({ start(c) { c.enqueue(bytes.slice(0, 12)); c.enqueue(bytes.slice(12)); c.close(); } }));
  const receive = vi.fn(); await readNDJSON(response, new AbortController().signal, receive);
  expect(receive.mock.calls.map(c => c[0])).toEqual([{ text: 'Chào' }, { done: true }]);
});
it('streams speech before returning a validated reply and honors long/fast options', async () => {
  const fetcher = vi.fn().mockResolvedValue(streamResponse([
    { message: { content: 'Bẩm đại ca, ' } },
    { message: { content: 'đệ nghe.' } },
    { done: true, eval_count: 20, eval_duration: 1000000 },
  ])); vi.stubGlobal('fetch', fetcher);
  const text = vi.fn();
  const reply = await createProvider('ollama', { OLLAMA_MODEL: 'quality', OLLAMA_FAST_MODEL: 'small', OLLAMA_NUM_GPU: '0' }).chat([{ role: 'user', content: 'Hi' }], new AbortController().signal, { length: 'long', mode: 'fast' }, text);
  expect(text.mock.calls.map(c => c[0])).toEqual(['Bẩm đại ca, đệ nghe.']);
  expect(reply.text).toBe('Bẩm đại ca, đệ nghe.'); expect(reply.metrics?.firstTextMs).toBeTypeOf('number');
  const body = JSON.parse(fetcher.mock.calls[0][1].body); expect(body.model).toBe('small'); expect(body.options.num_predict).toBe(replyBudgets.long.tokens); expect(body.stream).toBe(true); expect(body.format).toBeUndefined(); expect(reply.actions).toEqual([]);
});
it('rejects a truncated stream instead of committing a partial answer', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([{ message: { content: '{"speech":"partial' } }])));
  await expect(createProvider('ollama', { OLLAMA_MODEL: 'test' }).chat([{ role: 'user', content: 'Hi' }], new AbortController().signal, {}, vi.fn())).rejects.toThrow('ngắt');
});
it('uses bounded settings and splits long speech into sentence chunks', () => {
  expect(replySettings({ length: 'unbounded', mode: 'cloud' })).toEqual({ length: 'long', mode: 'quality' });
  expect(nextSpeechChunk('Một câu. Câu tiếp theo', false)).toBe('Một câu.');
  expect(nextSpeechChunk('Chưa xong', false)).toBeUndefined();
  expect(nextSpeechChunk('Chưa xong', true)).toBe('Chưa xong');
  expect(nextSpeechChunk('a'.repeat(700), false)?.length).toBe(280);
});
it('cancels a pending local synthesis without playing stale audio', async () => {
  let resolve!: (r: Response) => void;
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(r => { resolve = r; })));
  const callbacks = { start: vi.fn(), end: vi.fn(), error: vi.fn() };
  const audio = vi.fn(); vi.stubGlobal('Audio', audio);
  vi.stubGlobal('AudioContext', class { state = 'running'; resume = async () => {}; close = async () => {}; });
  const queue = createSpeechQueue({ kind: 'local', voice: 'test' }, callbacks);
  queue.update('Chào bạn.', true); await vi.waitFor(() => expect(resolve).toBeTypeOf('function')); queue.cancel(); resolve(new Response('audio'));
  await new Promise(r => setTimeout(r, 0));
  expect(audio).not.toHaveBeenCalled(); expect(callbacks.start).not.toHaveBeenCalled(); expect(callbacks.error).not.toHaveBeenCalled();
});
it('bounds context by complete recent turns and preserves the current question', async () => {
  const { boundedHistory } = await import('../server/reply-options');
  const messages = Array.from({ length: 11 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: String(i) }));
  expect(boundedHistory(messages, 'fast').map(m => m.content)).toEqual(['6', '7', '8', '9', '10']);
  const long = [{ role: 'user' as const, content: 'old'.repeat(1000) }, { role: 'assistant' as const, content: 'x'.repeat(3000) }, { role: 'user' as const, content: 'latest question' }];
  expect(boundedHistory(long, 'fast')).toEqual([long[2]]);
});

it('does not synthesize partial sentences until the entire reply is finalized', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('test synthesis stop'));
  vi.stubGlobal('fetch', fetcher);
  const callbacks = { start: vi.fn(), end: vi.fn(), error: vi.fn() };
  vi.stubGlobal('AudioContext', class { state = 'running'; resume = async () => {}; close = async () => {}; });
  const queue = createSpeechQueue({ kind: 'local', voice: 'test' }, callbacks);
  queue.update('Câu đầu.');
  queue.update('Câu đầu. Câu sau.');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(fetcher).not.toHaveBeenCalled();
  expect(callbacks.start).not.toHaveBeenCalled();
  queue.update('Câu đầu. Câu sau.', true);
  await vi.waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  expect(JSON.parse(fetcher.mock.calls[0][1].body).text).toBe('Câu đầu. Câu sau.');
  queue.cancel();
});
