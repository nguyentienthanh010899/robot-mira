import type { Message, ProviderId } from '../src/types';
import { ProviderError } from './reply';
export function validateChat(body: unknown): { provider: ProviderId; messages: Message[] } {
  if (!body || typeof body !== 'object') throw new ProviderError(400, 'Thiếu nội dung.');
  const { provider, messages } = body as Record<string, unknown>;
  if (!['demo', 'gemini', 'groq', 'ollama', 'cloudflare'].includes(provider as string) || !Array.isArray(messages) || messages.length < 1 || messages.length > 21) throw new ProviderError(400, 'AI hoặc lịch sử không hợp lệ.');
  let previous = 'assistant';
  for (const m of messages) {
    if (!m || !['user', 'assistant'].includes(m.role) || m.role === previous || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 4000) throw new ProviderError(400, 'Tin nhắn không hợp lệ hoặc quá dài.');
    previous = m.role;
  }
  if (previous !== 'user') throw new ProviderError(400, 'Lượt cuối phải là tin nhắn người dùng.');
  return { provider: provider as ProviderId, messages };
}
