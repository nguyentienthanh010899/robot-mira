import { expect, it } from 'vitest';
import { reactToInput } from '../src/engine/emotion';
import { demoReply } from '../src/engine/conversation';
it.each([
  ['Bạn là ai?', 'curious'], ['Hôm nay mình cô đơn', 'sad'],
  ['Mình bực quá', 'angry'], ['Wow, không thể tin được!', 'surprised'],
  ['Kể chuyện hài đi', 'happy'], ['Tính giúp mình bao nhiêu tiền', 'thinking'],
  ['Mình buồn, đừng kể chuyện vui', 'sad'],
])('reacts to %s with %s in both input and demo response', (input, emotion) => {
  expect(reactToInput(input)).toBe(emotion); expect(demoReply(input).emotion).toBe(emotion);
});
