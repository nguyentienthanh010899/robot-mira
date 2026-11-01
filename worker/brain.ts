import type { Message, Reply, ReplySettings } from '../src/types';
import { buildSpokenPersona } from '../server/persona';
import { boundedHistory, replyBudgets } from '../server/reply-options';
import { normalizeReply, ProviderError } from '../server/reply';
import { roleIssues } from '../server/role-check';
import { reactToInput } from '../src/engine/emotion';

export const cloudflareModel = '@cf/qwen/qwen3-30b-a3b-fp8';
export function configuredModel(value: string) {
  if (value !== cloudflareModel) throw new ProviderError(503, 'AI_MODEL chưa được hỗ trợ. Chọn model trong worker/brain.ts trước khi đổi cấu hình.');
  return cloudflareModel;
}
function contentFromResult(value: unknown): { text: string; tokens?: number } {
  if (!value || typeof value !== 'object') throw new ProviderError(502, 'Workers AI không trả nội dung hợp lệ.');
  const data = value as { response?: unknown; choices?: { message?: { content?: unknown }; finish_reason?: string }[]; usage?: { completion_tokens?: number } };
  if (data.choices?.[0]?.finish_reason === 'length') throw new ProviderError(502, 'AI chưa viết xong trong giới hạn câu trả lời. Hãy chọn độ dài khác hoặc hỏi cụ thể hơn.');
  const raw = data.choices?.[0]?.message?.content ?? data.response;
  if (typeof raw !== 'string' || !raw.trim()) throw new ProviderError(502, 'Workers AI không trả lời. Hãy thử lại.');
  const text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (/<\/?think>/i.test(text) || !text) throw new ProviderError(502, 'AI chưa hoàn tất câu trả lời.');
  return { text, tokens: data.usage?.completion_tokens };
}
function aiError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
  const message = error instanceof Error ? error.message : '';
  if (status === 429 || /(?:429|quota|neuron|rate.?limit|capacity|3040)/i.test(message)) return new ProviderError(429, 'Workers AI hết hạn mức hoặc đang bận. Chờ rồi thử lại; không tự chuyển sang dịch vụ tính phí.');
  if ([401, 403].includes(status) || /(?:401|403|5035)/.test(message)) return new ProviderError(503, 'Workers AI chưa được cấp quyền cho tài khoản hoặc model này. Kiểm tra gói Free và quyền AI trong Cloudflare.');
  return new ProviderError(502, 'Chưa nhận được phản hồi từ Workers AI. Hãy thử lại.');
}
/** Only returns a complete, role-checked response; at most two inference calls. */
export async function cloudflareReply(ai: CloudflareEnv['AI'], model: string, history: Message[], settings: ReplySettings, signal: AbortSignal): Promise<Reply> {
  const started = performance.now();
  let messages = boundedHistory(history, settings.mode);
  if (messages.some(m => m.role === 'assistant' && roleIssues(m.content).length)) messages = messages.slice(-1);
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    let system = buildSpokenPersona(settings.length);
    if (attempt) system += '\nViết lại đúng vai: AI=đệ, người hỏi=đại ca. Không dùng cậu/tôi/mình/bạn/anh/em để xưng hô. Không nhắc việc sửa.';
    system += '\n/no_think';
    try {
      // Binding supports abort via extra fetch options, without exposing credentials to the client.
      const output = await ai.run(configuredModel(model), {
        messages: [{ role: 'system', content: system }, ...messages],
        stream: false, max_tokens: replyBudgets[settings.length].tokens, temperature: 0.3,
      }, { extraHeaders: {}, signal });
      signal.throwIfAborted();
      const { text, tokens } = contentFromResult(output);
      if (roleIssues(text).length) {
        if (!attempt) continue;
        throw new ProviderError(502, 'AI chưa giữ đúng xưng hô đại ca/đệ. Đã chặn câu sai vai; hãy thử lại.');
      }
      const reply = normalizeReply(JSON.stringify({ speech: text, emotion: reactToInput(history.at(-1)!.content), actions: [], voice_style: 'neutral' }));
      return { ...reply, metrics: { totalMs: Math.round(performance.now() - started), ...(Number.isFinite(tokens) ? { tokens } : {}) } };
    } catch (error) { if (signal.aborted) throw error; throw aiError(error); }
  }
  throw new ProviderError(502, 'AI chưa hoàn thành câu trả lời.');
}
