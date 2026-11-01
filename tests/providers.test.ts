import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProvider } from '../server/providers';
afterEach(() => vi.unstubAllGlobals());
describe('AI adapters with mocked HTTP', () => {
  it.each(['gemini', 'groq', 'ollama'] as const)('sends persona and parses %s responses', async id => {
    const reply = '{"text":"Bẩm đại ca, đệ nghe.","emotion":"happy","action":"wave"}';
    const payload = id === 'gemini' ? { candidates: [{ content: { parts: [{ text: reply }] } }] } : id === 'groq' ? { choices: [{ message: { content: reply } }] } : { message: { content: reply } };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))); vi.stubGlobal('fetch', fetcher);
    const result = await createProvider(id, { ALLOW_CLOUD_AI: 'true', GEMINI_API_KEY: 'test', GEMINI_MODEL: 'test', GROQ_API_KEY: 'test', GROQ_MODEL: 'test', OLLAMA_MODEL: 'test' }).chat([{ role: 'user', content: 'Chào' }], new AbortController().signal);
    expect(result).toMatchObject({ text: 'Bẩm đại ca, đệ nghe.', emotion: 'happy', action: 'idle' });
    expect(fetcher.mock.calls[0][1].body).toContain('MIRA');
    expect(fetcher.mock.calls[0][1].body).toContain('Chào');
  });
  it('reports quota instead of silently using demo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));
    await expect(createProvider('groq', { ALLOW_CLOUD_AI: 'true', GROQ_API_KEY: 'test', GROQ_MODEL: 'test' }).chat([{ role: 'user', content: 'Hi' }], new AbortController().signal)).rejects.toMatchObject({ status: 429 });
  });
  it('requires model and credentials', () => { expect(() => createProvider('gemini', {})).toThrow('chưa được cấu hình'); });
});
it('keeps cloud disabled by default even if keys exist', () => {
  expect(() => createProvider('groq', { GROQ_API_KEY: 'test', GROQ_MODEL: 'test' })).toThrow();
});
it('validates desktop action proposals and maps extended emotions', async () => {
  const { normalizeReply } = await import('../server/providers');
  const reply = normalizeReply(JSON.stringify({ speech: 'Lại thức khuya à?', emotion: 'annoyed', voice_style: 'slightly_annoyed', actions: [{ type: 'BLINK', count: 2 }, { type: 'LOOK_LEFT', pwm: 1000 }, { type: 'MOVE_FORWARD_SHORT' }, { type: 'BLINK', count: 99 }, { type: 'STOP' }] }));
  expect(reply.text).toBe('Lại thức khuya à?'); expect(reply.emotion).toBe('angry'); expect(reply.actions).toEqual([{ type: 'STOP' }]);
  expect(reply.voice_style).toBe('slightly_annoyed');
});

it('drops unsafe proposals while preserving valid bounded desktop actions', async () => {
  const { normalizeReply } = await import('../server/providers');
  const reply = normalizeReply(JSON.stringify({ speech: 'Chào', actions: [{type:'BLINK',count:2},{type:'LOOK_LEFT',pwm:999},{type:'MOVE_FORWARD_SHORT'},{type:'BLINK',count:99},{type:'LOOK_RIGHT'}] }));
  expect(reply.actions).toEqual([{type:'BLINK',count:2},{type:'LOOK_RIGHT'}]);
});
it('refuses Ollama cloud model tags even at a loopback endpoint', () => {
  expect(() => createProvider('ollama', { OLLAMA_MODEL: 'gemma4:cloud' })).toThrow('model cloud');
});
it('can explicitly request CPU inference for the local provider', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { content: '{"speech":"Bẩm đại ca, đệ nghe.","emotion":"happy","actions":[],"voice_style":"happy"}' } })));
  vi.stubGlobal('fetch', fetcher);
  await createProvider('ollama', { OLLAMA_MODEL: 'qwen3.5:4b-q4_K_M', OLLAMA_NUM_GPU: '0', OLLAMA_NUM_THREAD: '4' }).chat([{ role: 'user', content: 'Chào' }], new AbortController().signal);
  expect(JSON.parse(fetcher.mock.calls[0][1].body).options.num_gpu).toBe(0);
  expect(JSON.parse(fetcher.mock.calls[0][1].body).options.num_thread).toBe(4);
  expect(() => createProvider('ollama', { OLLAMA_MODEL: 'test', OLLAMA_NUM_GPU: 'invalid' })).toThrow('OLLAMA_NUM_GPU');
});
