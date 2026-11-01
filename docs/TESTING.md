# Kiểm tra hiện hành — 01/11/2026: streaming và TTS local

- 55 test / 9 file đạt; TypeScript + Vite build đạt; Python service compile đạt.
- Có kiểm tra streaming UTF-8/JSON, thiếu done, hủy request/audio, giới hạn history, chọn model/độ dài, xác thực PCM và khóa cloud.
- HTTP smoke 7 kiểm tra đạt. VieNeu khởi động offline bằng cache, trả 25 preset và sinh PCM/WAV có tín hiệu thật.
- Chưa QA trực tiếp trình duyệt, micro, loa hoặc nghe đánh giá độ tự nhiên. STT offline chưa triển khai.
- Benchmark toàn luồng cho thấy audio đầu khoảng 19.6 giây và text hoàn tất khoảng 72 giây trong một lượt; chưa đạt mục tiêu phản xạ nhanh. Xem PERFORMANCE.md.

--- Lịch sử kiểm tra ---


## 01/11/2026 — Local Brain trả lời thành công bằng CPU

Đã tạo .env khi chưa có, chọn qwen3.5:4b-q4_K_M, ALLOW_CLOUD_AI=false. GPU GGUF thất bại GGML_ASSERT(buf_dst); thử num_gpu=0 thành công. Adapter hỗ trợ OLLAMA_NUM_GPU, .env local đặt 0; .env.example để tùy chọn trống.

`npm run brain:check -- --infer` đạt: reachable=true, modelReady=true; model trả câu personality tiếng Việt và structured output hợp lệ. Total một lượt 15.737ms, generation 3.610ms, 62 tokens; đây không phải TTFT hoặc benchmark p50/p95. 38 test đạt, typecheck/build đạt. Cần restart backend đang chạy để đọc .env mới. Phase 1 còn bộ 30 câu và thử không WAN; chưa đánh dấu hoàn thành toàn phase.

# Kết quả hiện hành — local-first

31/10/2026, Asia/Ho_Chi_Minh. Sau khi áp dụng prompt mới:

- `npm run test`: **37 test / 6 file đạt**.
- `npm run build`: TypeScript và Vite build đạt.
- HTTP smoke: frontend/proxy/providers, local status, cloud khóa (503), Demo (200), provider sai (400), origin ngoài (403): **7 kiểm tra đạt**. Dùng API 3901/web 5174 để không dừng tiến trình đang chiếm cổng mặc định.
- `npm run brain:check`: đã chạy ngoài sandbox để tránh nhầm lỗi quyền; thực tế reachable=false, modelReady=false, chưa có .env.
- Chưa có inference model thật, TTFT, first audio, tokens/s, WER/CER hoặc benchmark trên robot. Metrics totalMs trong adapter không phải streaming TTFT.
- Test mới: cloud opt-in, loopback URL, model local có/không, từ chối Ollama cloud tag, schema/normalizer actions, giới hạn BLINK, STOP ưu tiên, context/personality giới hạn, ưu tiên local lúc mở và browser voice mặc định tắt.
- Các action trong response chỉ là đề xuất; chưa có hardware execution. voice_style là metadata, chưa có emotional TTS thực tế.
- Browser QA/micro/loa, VAD/STT/TTS local, memory SQLite và firmware chưa nghiệm thu.
- Có bước dev bị EADDRINUSE tại 3001 do tiến trình khác; đã chuyển sang cổng thử riêng, không kill tiến trình đó. Smoke script không gửi inference cloud khi provider đã bật (skip kiểm tra đó).

Chi tiết nghiệm thu tiếp theo: workflow/PHASE-01-LOCAL-BRAIN.md. Bên dưới là lịch sử kiểm tra trước khi chuyển local-first; các mô tả “chưa triển khai” cũ phải đọc theo thời điểm đó.

---

# Kết quả kiểm tra MIRA

Ngày: 31/10/2026, múi giờ Asia/Ho_Chi_Minh.

## Môi trường

- Workspace Mac local; Node.js 22.23.2, npm 10.9.8.
- Bộ công cụ đã cài: Vite 8.3.5, Vitest 5.0.5; phiên bản đầy đủ nằm trong package-lock.json.
- Không cấu hình key cloud hoặc model Ollama, không gọi AI tính phí.

## Đã chạy và đạt

- `npm run test`: 3 file, 14 test đạt.
- `npm run build`: typecheck đạt và build frontend thành công.
- `npm install` sau cập nhật dependency: audit báo 0 vulnerabilities tại thời điểm cài.
- `npm run dev`: frontend 127.0.0.1:5173 và backend 127.0.0.1:3001 khởi động được sau khi cấp quyền mở cổng local.
- `node scripts/smoke.mjs`: 5 kiểm tra đạt: frontend HTTP 200, provider qua proxy HTTP 200, Demo chat HTTP 200, provider sai HTTP 400, origin ngoài HTTP 403.

## Nội dung test tự động

- Demo hỗ trợ phản hồi đồng cảm khi người dùng buồn.
- Sáu cảm xúc có đường miệng SVG khác nhau.
- Chuyển provider xóa lịch sử; lựa chọn chưa cấu hình bị vô hiệu hóa.
- Kết quả AI đến muộn sau khi đổi provider bị bỏ qua.
- Lỗi AI giữ lại nội dung để gửi lại, không dùng Demo âm thầm.
- Timer hoạt ảnh được dọn khi unmount; reduced motion không tạo timer nền.
- Validate lịch sử, provider, role, thứ tự lượt và số lượng tin nhắn.
- Normalize JSON/plain text, dự phòng cảm xúc và loại hành động ngoài phạm vi.
- Ba adapter gửi persona và parse phản hồi đúng với HTTP giả lập.
- Lỗi quota và thiếu cấu hình được báo rõ; metadata không chứa key.

## Chưa kiểm chứng

- Chưa có công cụ browser QA trong phiên này: chưa quan sát giao diện, độ mượt, responsive và thao tác bàn phím trên trình duyệt thật. HTTP 200 không thay thế kiểm tra hình ảnh.
- Chưa gọi Gemini/Groq/Ollama thật; adapter mới kiểm tra bằng mock. Chưa xác nhận model, quota hoặc chất lượng hài hước/tiếng Việt.
- Chưa có STT/TTS, kiểm tra micro/loa, trí nhớ lâu dài hoặc phần cứng.
- Chưa chạy phiên hội thoại thực tế 15–20 phút.

## Thử tiếp trên Mac

1. Chạy `npm run dev`, mở URL Vite in ra.
2. Chọn đủ sáu cảm xúc, thử Demo, thử khẩu hình, resize và reduced motion.
3. Tạo `.env` theo README, cấu hình một model có free tier, khởi động lại và tải lại trang.
4. Đổi AI, thử hội thoại nhiều lượt, hủy yêu cầu và tạo cuộc trò chuyện mới.
5. Ghi lại model, trình duyệt và kết quả thực tế trước khi đánh dấu nghiệm thu.

## Cập nhật kiểm tra voice

- `npm run test`: 4 file, 19 test đạt sau khi thêm giọng nói.
- `npm run build`: typecheck và build đạt.
- Test thêm: interim/final tiếng Việt, gửi một lần khi kết thúc nghe, quyền micro bị từ chối, hủy và dọn callback/timer, lọc giọng Việt, sự kiện bắt đầu phát và ngắt lời.
- Test tích hợp mock: nhấn micro → nhận “Xin chào” → phản hồi Demo → gọi TTS → speaking → ngắt tiếng để nghe lượt mới.
- Chưa thử micro/loa và SpeechRecognition/speechSynthesis trên trình duyệt thật. Phần “chưa có STT/TTS” ở báo cáo ban đầu đã được thay bằng adapter trình duyệt, nhưng khả năng thiết bị và chất lượng tiếng Việt vẫn chưa kiểm chứng.
- Nguồn tham khảo API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition và https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis .

## Kiểm tra biểu cảm tự động

- 26 test / 5 file đạt sau thay đổi; typecheck và build đạt.
- Kiểm tra bảy tình huống phản ứng nội dung và Demo, gồm ưu tiên đồng cảm khi câu có cả buồn và vui.
- Test UI: bắt đầu nghe chuyển tò mò; transcript tạm buồn đổi khuôn mặt; chờ AI thật chuyển suy tư; phản hồi cũ sau đổi AI không cập nhật UI.
- Chưa kiểm chứng hình ảnh và giọng nói trên thiết bị thật.

## Chẩn đoán Ollama trên macOS 13.4

- Máy: macOS 13.4, Apple M2, RAM 16GiB. Ollama.app khai báo minimum OS 14.0 nên GUI báo -10825.
- CLI Ollama 0.40.13 đã cài và `ollama serve` chạy được qua kiểm tra thực tế, nhận Metal Apple M2.
- GET /api/tags trả HTTP 200 với models: []; chưa tải model hoặc thử inference.
- Dịch vụ dùng chẩn đoán đã dừng. Chạy lại `OLLAMA_NO_CLOUD=1 ollama serve` ở terminal riêng để giữ local-only, rồi tải model ở tab khác. GUI chưa dùng được; không sửa Info.plist để vượt kiểm tra OS.

## Cài lại Ollama theo yêu cầu mới

Đã cài lại 0.40.13, chạy CLI local-only thành công, log cloud disabled=true, Metal Apple M2; API /api/tags HTTP 200 với models rỗng. GUI vẫn không tương thích macOS 13.4. Không chạy inference, không tải model. Liên kết CLI trong /usr/local/bin cần quyền quản trị; đường dẫn đầy đủ chạy được.
