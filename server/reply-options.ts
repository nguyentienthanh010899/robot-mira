import type { ReplySettings } from '../src/types';
export const defaultSettings: ReplySettings = { length: 'long', mode: 'quality' };
export function replySettings(value: unknown): ReplySettings {
  const input = value && typeof value === 'object' ? value as Partial<ReplySettings> : {};
  return { length: ['short', 'normal', 'long'].includes(input.length || '') ? input.length! : 'long', mode: input.mode === 'fast' ? 'fast' : 'quality' };
}
export const replyBudgets = { short: { tokens: 256, instruction: 'Trả lời 1–3 câu, đi thẳng vào ý.' }, normal: { tokens: 640, instruction: 'Trả lời khoảng 3–6 câu, giải thích đủ ý và cho một ví dụ nếu hữu ích.' }, long: { tokens: 1200, instruction: 'Trả lời đủ ý, thường 6–10 câu khi câu hỏi cần giải thích; có lý do và ví dụ cụ thể. Chào hỏi/câu đơn giản vẫn ngắn. Không kéo dài vô nghĩa hoặc lặp ý.' } } as const;

/** Keep whole recent turns within a character budget; latest user input is never dropped. */
export function boundedHistory(messages: import('../src/types').Message[], mode: ReplySettings['mode']) {
  if (!messages.length) return [];
  const kept = [messages[messages.length - 1]];
  let characters = kept[0].content.length;
  const maxPairs = mode === 'fast' ? 2 : 4;
  const budget = mode === 'fast' ? 4000 : 5000;
  for (let i = messages.length - 3, pairs = 0; i >= 0 && pairs < maxPairs; i -= 2, pairs++) {
    const pair = messages.slice(i, i + 2);
    const size = pair.reduce((sum, item) => sum + item.content.length, 0);
    if (characters + size > budget) break;
    kept.unshift(...pair); characters += size;
  }
  return kept;
}
