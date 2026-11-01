import { actionTypes, voiceStyles, emotions, type Reply } from '../src/types/index';
export class ProviderError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function normalizeReply(raw: string): Reply {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed: unknown;
  try { parsed = JSON.parse(cleaned); } catch { parsed = null; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    // Plain text is useful, malformed JSON should not be read aloud as a reply.
    if (!cleaned || cleaned.startsWith('{') || cleaned.startsWith('[')) throw new ProviderError(502, 'AI trả dữ liệu không hợp lệ. Hãy thử lại.');
    return { text: cleaned.slice(0, 4000), speech: cleaned.slice(0, 4000), emotion: 'curious', action: 'idle', actions: [], voice_style: 'neutral' };
  }
  const value = parsed as Record<string, unknown>;
  const speech = typeof value.speech === 'string' ? value.speech : value.text;
  if (typeof speech !== 'string' || !speech.trim()) throw new ProviderError(502, 'AI không có câu trả lời hợp lệ.');
  const aliases: Record<string, Reply['emotion']> = { neutral: 'curious', annoyed: 'angry', excited: 'happy', sleepy: 'thinking', worried: 'sad' };
  const emotion = typeof value.emotion === 'string' ? aliases[value.emotion] || value.emotion : 'curious';
  const actions: NonNullable<Reply['actions']> = [];
  if (Array.isArray(value.actions)) for (const action of value.actions.slice(0, 16)) {
    if (!action || typeof action !== 'object' || !actionTypes.includes(action.type) || Object.keys(action).some(k => !['type', 'count'].includes(k))) continue;
    if (action.count !== undefined && (action.type !== 'BLINK' || !Number.isInteger(action.count) || action.count < 1 || action.count > 3)) continue;
    if (action.type === 'STOP') { actions.splice(0, actions.length, { type: 'STOP' }); break; }
    if (actions.length >= 4) continue;
    actions.push(action.type === 'BLINK' ? { type: action.type, count: action.count ?? 1 } : { type: action.type });
  }
  return { text: speech.trim().slice(0, 4000), speech: speech.trim().slice(0, 4000), emotion: emotions.includes(emotion as never) ? emotion as Reply['emotion'] : 'curious', action: 'idle', actions, voice_style: voiceStyles.includes(value.voice_style as never) ? value.voice_style as Reply['voice_style'] : 'neutral' };
}
