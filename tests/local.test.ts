import { afterEach, expect, it, vi } from 'vitest';
import { localBaseUrl, localStatus } from '../server/local';
import { buildPersona } from '../server/persona';
afterEach(() => vi.unstubAllGlobals());
it('accepts loopback only and rejects credentials, remote endpoints or URL suffixes', () => {
  expect(localBaseUrl({})).toBe('http://127.0.0.1:11434');
  for (const url of ['https://ollama.com', 'http://example.com', 'http://user:pass@localhost:11434', 'http://localhost:11434/api', 'http://localhost:11434?remote=true']) expect(() => localBaseUrl({ OLLAMA_BASE_URL: url })).toThrow();
});
it('reports model availability rather than assuming env means installed', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: [{ name: 'qwen3.5:4b' }] }))));
  expect((await localStatus({ OLLAMA_MODEL: 'qwen3.5:4b' })).modelReady).toBe(true);
  expect((await localStatus({ OLLAMA_MODEL: 'missing' })).modelReady).toBe(false);
});
it('reports unavailable local service without cloud fallback', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  expect(await localStatus({})).toMatchObject({ reachable: false, modelReady: false });
});
it('bounds personality memory context and relationship values', () => {
  const prompt = buildPersona({ memories: Array(20).fill('a'.repeat(500)), relationship: { trust: 99, familiarity: -1 } });
  expect(prompt).toContain('"trust":1'); expect(prompt).toContain('"familiarity":0'); expect(prompt).not.toContain('a'.repeat(301)); expect(prompt).toContain('bình tĩnh');
});
it('does not count Ollama cloud tags as downloaded local models', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: [{ name: 'gemma4:cloud' }] }))));
  expect((await localStatus({ OLLAMA_MODEL: 'gemma4:cloud' })).modelReady).toBe(false);
});
