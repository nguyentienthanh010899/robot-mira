import { localStatus } from './local';
import { createProvider } from './providers';
const status = await localStatus();
console.log(JSON.stringify(status, null, 2));
if (!status.modelReady) {
  console.error('Chưa đạt Phase 1. Xem workflow/PHASE-01-LOCAL-BRAIN.md. Không tải model hoặc gọi cloud tự động.');
  process.exitCode = 1;
} else if (process.argv.includes('--infer')) {
  try {
    const reply = await createProvider('ollama').chat([{ role: 'user', content: 'Mình lại thức khuya. Nhắc mình nghỉ theo tính cách của bạn.' }], AbortSignal.timeout(90000));
    console.log(JSON.stringify(reply, null, 2));
    console.log('Đã nhận phản hồi local. Đây là total request latency, không phải first-token/first-audio. Actions chỉ là đề xuất chưa thực thi.');
  } catch (error) { console.error(error instanceof Error ? error.message : 'Local inference lỗi.'); process.exitCode = 1; }
} else { console.log('Model đã có. Thêm -- --infer để thử inference thực tế qua Ollama local.'); }
