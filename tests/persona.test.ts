import { expect, it } from 'vitest';
import { buildPersona, buildSpokenPersona } from '../server/persona';
it('keeps the same commander and humorous strategist roles in both AI modes', () => {
  for (const prompt of [buildPersona(), buildSpokenPersona('long')]) {
    expect(prompt).toContain('Bẩm đại ca,');
    expect(prompt).toContain('xưng đệ');
    expect(prompt).toContain('đại ca');
    expect(prompt).toContain('Gia Cát Lượng');
    expect(prompt).toContain('không hạ nhục');
    expect(prompt).toContain('không tự nhận là nhân vật lịch sử thật');
  }
});
