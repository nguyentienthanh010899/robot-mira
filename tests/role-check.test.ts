import { afterEach, expect, it, vi } from 'vitest';
import { roleIssues } from '../server/role-check';
import { createProvider } from '../server/providers';
afterEach(() => vi.unstubAllGlobals());
it('detects the reported role drift and duplicate greetings', () => {
  expect(roleIssues('Bẩm đại ca, sao cậu vẫn còn thức khuya vậy?')).not.toHaveLength(0);
  expect(roleIssues('Bẩm đại ca, tôi nghĩ bạn nên ngủ.')).not.toHaveLength(0);
  expect(roleIssues('Bẩm đại ca, đệ nghe. Bẩm đại ca, nghỉ nhé.')).not.toHaveLength(0);
  expect(roleIssues('Bẩm đại ca, sao đệ buồn?')).not.toHaveLength(0);
});
it('preserves quoted text, code, third-party nouns and reflexives', () => {
  expect(roleIssues('Bẩm đại ca, câu “tôi và bạn” là ví dụ. Đại ca có thể gặp bạn bè hoặc tự làm một mình. Đệ sẽ giải thích từ `cậu`.')).toEqual([]);
  expect(roleIssues('Bẩm đại ca, cậu bé trong truyện rất vui.')).toEqual([]);
});
function response(text: string) { return new Response(JSON.stringify({ message: { content: JSON.stringify({ speech: text, actions: [], emotion: 'happy' }) } })); }
it('repairs once and removes contaminated assistant history', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response('Bẩm đại ca, sao cậu thức khuya?')).mockResolvedValueOnce(response('Bẩm đại ca, đại ca nghỉ sớm nhé. Đệ sẽ chờ.'));
  vi.stubGlobal('fetch', fetcher);
  const result = await createProvider('ollama', { OLLAMA_MODEL: 'test' }).chat([{ role: 'user', content: 'Chào' }, { role: 'assistant', content: 'Tôi nghe bạn.' }, { role: 'user', content: 'Anh chưa ngủ.' }], new AbortController().signal);
  expect(result.text).toContain('đại ca nghỉ sớm');
  expect(fetcher).toHaveBeenCalledTimes(2);
  const body = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(body.messages.slice(1)).toEqual([{ role: 'user', content: 'Anh chưa ngủ.' }]);
});
it('blocks persistent role errors after one repair rather than reading them', async () => {
  const fetcher = vi.fn().mockImplementation(async () => response('Bẩm đại ca, cậu nghe tôi.'));
  vi.stubGlobal('fetch', fetcher);
  await expect(createProvider('ollama', { OLLAMA_MODEL: 'test' }).chat([{ role: 'user', content: 'Chào' }], new AbortController().signal)).rejects.toThrow('chặn');
  expect(fetcher).toHaveBeenCalledTimes(2);
});
