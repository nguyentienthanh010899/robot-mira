import type { Message, ProviderId, ProviderOption, Reply, ReplySettings } from '../types';
import { emotions } from '../types';
import { readNDJSON } from '../engine/streaming';
export async function getProviders(signal: AbortSignal): Promise<ProviderOption[]> {
  const response = await fetch('/api/providers', { signal });
  if (!response.ok) throw new Error('Không tải được danh sách AI. Demo vẫn dùng được.');
  return (await response.json() as { providers: ProviderOption[] }).providers;
}
function validReply(data: any): Reply {
  if (typeof data?.text !== 'string' || !emotions.includes(data.emotion) || data.action !== 'idle') throw new Error('Phản hồi AI không hợp lệ.');
  return data;
}
export async function chat(provider: ProviderId, messages: Message[], signal: AbortSignal, settings?: ReplySettings, onText?: (text: string) => void): Promise<Reply> {
  const response = await fetch(onText ? '/api/chat/stream' : '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, messages: messages.slice(-21), settings }), signal });
  if (!response.ok) { const data = await response.json() as { error?: unknown }; throw new Error(typeof data.error === 'string' ? data.error : 'Không kết nối được AI.'); }
  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) return validReply(await response.json());
  let reply: Reply | undefined;
  await readNDJSON(response, signal, event => {
    if (event.type === 'error') throw new Error(event.error || 'Luồng AI bị gián đoạn.');
    if (event.type === 'text' && typeof event.text === 'string') onText?.(event.text);
    if (event.type === 'done') reply = validReply(event.reply);
  });
  if (!reply) throw new Error('AI chưa hoàn thành câu trả lời.');
  return reply;
}
