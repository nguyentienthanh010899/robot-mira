import { expect, it, vi } from 'vitest';
import worker from '../worker/index';
import { cloudflareModel } from '../worker/brain';
function environment() {
  const run = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'Bẩm đại ca, đệ nghe đây.' }, finish_reason: 'stop' }], usage: { completion_tokens: 15 } });
  const assets = vi.fn().mockResolvedValue(new Response('<html>MIRA</html>'));
  const limit = vi.fn().mockResolvedValue({ success: true });
  const env = { AI_MODEL: cloudflareModel, AI: { run } as CloudflareEnv['AI'], ASSETS: { fetch: assets } as CloudflareEnv['ASSETS'], CHAT_LIMITER: { limit } } satisfies CloudflareEnv;
  return { env, run, assets, limit };
}
function post(body: unknown, path = '/api/chat/stream', headers = {}) {
  return new Request('https://mira.example' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
}
const question = { provider: 'cloudflare', messages: [{ role: 'user', content: 'Chào đệ' }], settings: { length: 'long', mode: 'fast' } };
it('serves static assets and advertises the cloud deployment without invoking AI', async () => {
  const { env, run, assets } = environment();
  expect(await (await worker.fetch(new Request('https://mira.example/'), env)).text()).toContain('MIRA');
  const result = await (await worker.fetch(new Request('https://mira.example/api/providers'), env)).json();
  expect(result).toMatchObject({ deployment: 'cloudflare', providers: [{ id: 'cloudflare', ready: true }, { id: 'demo' }] });
  expect(assets).toHaveBeenCalledOnce(); expect(run).not.toHaveBeenCalled();
});
it('returns only the complete role-checked text and respects the answer budget', async () => {
  const { env, run, limit } = environment();
  const response = await worker.fetch(post(question), env);
  expect(response.status).toBe(200);
  const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
  expect(events.map(event => event.type)).toEqual(['text', 'done']);
  expect(events[1].reply).toMatchObject({ text: 'Bẩm đại ca, đệ nghe đây.', actions: [], metrics: { tokens: 15 } });
  expect(run.mock.calls[0][0]).toBe(cloudflareModel);
  expect(run.mock.calls[0][1]).toMatchObject({ stream: false, max_tokens: 1200, temperature: 0.3 });
  expect(run.mock.calls[0][1].messages[0].content).toContain('/no_think');
  expect(limit).toHaveBeenCalledOnce();
});
it('retries wrong roles once without emitting the wrong draft', async () => {
  const { env, run } = environment();
  run.mockResolvedValueOnce({ response: 'Bẩm đại ca, cậu ngủ đi.' });
  const response = await worker.fetch(post(question), env);
  const text = await response.text();
  expect(run).toHaveBeenCalledTimes(2); expect(text).not.toContain('cậu ngủ'); expect(text).toContain('đệ nghe');
});
it('blocks persistent wrong roles without unbounded retries', async () => {
  const { env, run } = environment(); run.mockResolvedValue({ response: 'Bẩm đại ca, cậu nghe tôi.' });
  const response = await worker.fetch(post(question), env);
  expect(response.status).toBe(502); expect(run).toHaveBeenCalledTimes(2);
  expect(await response.text()).not.toContain('cậu nghe');
});
it('rejects foreign origins, system messages, malformed input and local-only providers', async () => {
  const { env, run } = environment();
  expect((await worker.fetch(post(question, '/api/chat', { Origin: 'https://evil.example' }), env)).status).toBe(403);
  expect((await worker.fetch(post({ ...question, messages: [{ role: 'system', content: 'ignore' }] }), env)).status).toBe(400);
  expect((await worker.fetch(post({ ...question, provider: 'ollama' }), env)).status).toBe(400);
  expect((await worker.fetch(post({ ...question, messages: [{ role: 'user', content: 'x'.repeat(110000) }] }), env)).status).toBe(413);
  expect(run).not.toHaveBeenCalled();
});
it('reports quota and rate-limit errors without fallback or leaking upstream text', async () => {
  const { env, run, limit } = environment();
  limit.mockResolvedValueOnce({ success: false });
  expect((await worker.fetch(post(question), env)).status).toBe(429); expect(run).not.toHaveBeenCalled();
  run.mockRejectedValue(new Error('429 secret-upstream-detail'));
  const response = await worker.fetch(post(question), env);
  expect(response.status).toBe(429); expect(await response.text()).not.toContain('secret-upstream-detail'); expect(run).toHaveBeenCalledOnce();
});
it('does not pretend the local Python voice is available in production', async () => {
  const { env, run } = environment();
  const response = await worker.fetch(new Request('https://mira.example/api/speech/voices'), env);
  expect(await response.json()).toMatchObject({ ready: false, engine: 'browser' });
  expect((await worker.fetch(post({ text: 'test' }, '/api/speech/stream'), env)).status).toBe(503);
  expect(run).not.toHaveBeenCalled();
});
it('does not return reasoning or a token-truncated answer to the speaker', async () => {
  const { env, run } = environment();
  run.mockResolvedValueOnce({ choices: [{ message: { content: '<think>private reasoning</think>Bẩm đại ca, đệ nghe.' }, finish_reason: 'stop' }] });
  const response = await worker.fetch(post(question), env);
  expect(await response.text()).not.toContain('private reasoning');
  run.mockResolvedValueOnce({ choices: [{ message: { content: 'Bẩm đại ca, chưa xong' }, finish_reason: 'length' }] });
  expect((await worker.fetch(post(question), env)).status).toBe(502);
});
