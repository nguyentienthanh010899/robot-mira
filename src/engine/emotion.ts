import type { Emotion } from '../types';

/** Lightweight text cues for immediate simulated reactions, not voice-tone analysis. */
export function reactToInput(input: string): Emotion {
  const text = input.toLocaleLowerCase('vi').normalize('NFC').trim();
  if (/buồn|mệt|chán|cô đơn|khóc|lo lắng|sợ|thất vọng/.test(text)) return 'sad';
  if (/bực|tức giận|giận quá|khó chịu|cáu/.test(text)) return 'angry';
  if (/bất ngờ|wow|ôi trời|không thể tin|kinh ngạc/.test(text)) return 'surprised';
  if (/vui|đùa|hài|cảm ơn|chào|yêu|thích|tuyệt|haha/.test(text)) return 'happy';
  if (/suy nghĩ|tính toán|giải bài|bao nhiêu|tính giúp/.test(text)) return 'thinking';
  return 'curious';
}
