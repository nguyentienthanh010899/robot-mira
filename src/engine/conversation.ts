import { reactToInput } from './emotion';
import type { Reply } from '../types';
function sampleReply(input: string): Reply {
  const text = input.toLocaleLowerCase('vi');
  const emotion = reactToInput(input);
  if (emotion === 'sad') return { text: 'Bẩm đại ca, đệ nghe đây. Đại ca muốn kể chuyện hay nghỉ một chút? Đệ sẽ lắng nghe, không pha trò đâu.', emotion: 'sad', action: 'idle' };
  if (/chào|hello/.test(text)) return { text: 'Bẩm đại ca, đệ là MIRA. Đại ca cần đệ giúp việc gì? Đệ có tài chớp mắt rất chuyên nghiệp!', emotion: 'happy', action: 'idle' };
  if (/đùa|hài|vui/.test(text)) return { text: 'Bẩm đại ca, đại ca biết vì sao robot không giỏi giữ bí mật không? Vì cứ có chuyện là lại muốn chia sẻ dữ liệu!', emotion: 'happy', action: 'idle' };
  if (emotion === 'surprised') return { text: 'Bẩm đại ca, chuyện này làm đệ mở to mắt! Đại ca kể tiếp cho đệ nghe nhé?', emotion: 'surprised', action: 'idle' };
  if (emotion === 'angry') return { text: 'Bẩm đại ca, có chuyện làm đại ca bực à? Đệ nghe đây. Đại ca kể nhé, rồi cùng tìm cách giải quyết.', emotion: 'angry', action: 'idle' };
  if (emotion === 'thinking') return { text: 'Bẩm đại ca, đây là Demo nên đệ chưa giải bài thật. Đại ca chọn AI đã cấu hình để hỏi tiếp nhé.', emotion: 'thinking', action: 'idle' };
  return { text: 'Bẩm đại ca, đại ca kể thêm cho đệ nghe nhé? Đây là phản hồi Demo có sẵn; hãy chọn AI đã cấu hình để trò chuyện thật.', emotion, action: 'idle' };
}

export function demoReply(input: string): Reply {
  const reply = sampleReply(input);
  return { ...reply, speech: reply.text, actions: [], voice_style: reply.emotion === 'sad' ? 'sad' : reply.emotion === 'angry' ? 'slightly_annoyed' : reply.emotion === 'happy' ? 'happy' : 'neutral' };
}
