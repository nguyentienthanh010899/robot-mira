# Phase 1 — Local AI Brain

## Mục tiêu

Text → Ollama local → structured response tiếng Việt; không cần key, không gọi cloud. Giữ UI voice làm bản thử phụ; mục tiêu toàn dự án vẫn là nói chuyện.

## Kiến trúc

React/controller hiện có → local adapter → Ollama loopback → model → validator. Personality lấy từ config/personality.json, context dựng tại server/persona.ts. Actions mới là đề xuất đã lọc, không thực thi servo.

Máy kiểm tra hiện tại ARM, 16GB RAM. Ứng viên qwen3.5:4b-q4_K_M, context 4096; model ~vài GB, cần dung lượng trống và Internet cho lần tải đầu. Chưa có inference benchmark, không hứa <2s.

## Cài đặt từng bước

1. Cài Ollama theo https://docs.ollama.com/quickstart và hướng dẫn macOS chính thức. Đây là ứng dụng hệ thống, không được cài bởi npm. Xác nhận phiên bản hỗ trợ qwen3.5.
2. Mở Ollama. Nếu chạy CLI và dịch vụ chưa mở, dùng `ollama serve`: lệnh khởi động API local, giữ terminal đó; không mở ra Internet.
3. Chạy `ollama pull qwen3.5:4b-q4_K_M`: tải model về máy, không train. Kiểm tra license và dung lượng trước. Nếu runtime chưa hỗ trợ thì cập nhật theo tài liệu hoặc A/B qwen3:4b sau khi sửa cấu hình tương ứng.
4. `cp .env.example .env`: tạo cấu hình local **chỉ khi .env chưa tồn tại**; nếu có thì sửa từng biến, không ghi đè key/cấu hình người dùng.
5. Đặt OLLAMA_MODEL=qwen3.5:4b-q4_K_M, OLLAMA_BASE_URL=http://127.0.0.1:11434, ALLOW_CLOUD_AI=false.
6. `npm install`: cài dependency ứng dụng theo lockfile. Đã cài thì không cần chạy lại khi đầu vào chưa đổi.

## Mã cần kiểm tra

- server/local.ts: loopback only, kiểm tra model đã tải.
- server/providers.ts: think=false, context/output giới hạn, parse/validate structured output, không tool execution.
- server/persona.ts và config/personality.json: personality nhỏ có thể chỉnh, memory context có giới hạn.
- server/check-local.ts: CLI kiểm tra và inference thử.
- src/App.tsx: ưu tiên Ollama sẵn sàng khi mới mở, giữ Demo nếu local chưa có; cloud chỉ opt-in.

## Chạy thử

```sh
npm run brain:check
npm run brain:check -- --infer
npm run dev
```

Lệnh đầu chỉ hỏi danh sách model; lệnh hai gọi inference local một lượt và in JSON/thời gian total; lệnh ba mở ứng dụng. Không lệnh nào tự pull model hoặc gọi cloud.

Mở URL Vite in ra. Nếu chưa bật voice trình duyệt, dùng phần nhập văn bản dự phòng để thử Brain riêng. Chạy khoảng 30 tình huống theo `config/brain-eval.json` và ghi kết quả thật.

## Kết quả mong đợi

- reachable=true, modelReady=true.
- Inference trả speech/text tiếng Việt, emotion hợp lệ, actions an toàn và voice_style.
- Không có request tới nhà cung cấp cloud khi ALLOW_CLOUD_AI=false.
- Sau khi tải đủ model, thử ngắt WAN nhưng giữ loopback và xác nhận text inference vẫn chạy; thử này chưa chứng minh voice trình duyệt offline.

## Debug

- Chưa kết nối: kiểm tra Ollama đang chạy/port/base URL; không tự bật cloud để lách lỗi.
- Model chưa có: `ollama list` xem tag chính xác, rồi pull model nếu bạn chọn.
- Hết RAM/chậm: đóng ứng dụng nặng, giảm context/model; ghi cold/warm riêng, không suy diễn từ size artifact.
- JSON lỗi: ghi loại lỗi không kèm thông tin riêng, thử prompt/output budget/runtime support; không dispatch raw JSON tới MCU.
- Cloud bị khóa dù có key: đúng thiết kế; chỉ bật ALLOW_CLOUD_AI=true khi chủ động muốn dùng.

## Xác nhận hoàn thành

Test/typecheck/build đạt, inference thật nhiều lượt đạt, bộ câu Việt được chấm, đo p50/p95 total cold/warm và thử không WAN. Ghi model/tag/digest, runtime, thiết bị và kết quả trong TESTING.md/STATE.md. Chưa đủ thì lưu waiting_input, chưa chuyển Phase 2.

### Chặn cloud của chính Ollama

ALLOW_CLOUD_AI chỉ khóa adapter Gemini/Groq của MIRA. Để Ollama cũng chạy local-only, cấu hình `disable_ollama_cloud: true` trong server.json của Ollama hoặc khởi động daemon CLI bằng `OLLAMA_NO_CLOUD=1 ollama serve`, rồi restart theo [FAQ chính thức](https://docs.ollama.com/faq#how-do-i-disable-ollamas-cloud-features). Biến này phải đặt cho tiến trình Ollama, không chỉ trong .env của MIRA. MIRA chặn tên model có “cloud” và endpoint ngoài loopback; với custom model vẫn cần cấu hình daemon và thử không WAN để xác nhận.

## macOS 13.4: MLX kernel load error

Tag qwen3.5:4b trên máy này đã tải bản runner=mlx/format=safetensors. Chạy bị lỗi v_Expfloat32float32; chưa xác minh nguyên nhân chính xác, có khả năng liên quan backend/Metal trên OS cũ. Dùng tag GGUF cụ thể để thử backend llama.cpp: `ollama pull qwen3.5:4b-q4_K_M`, rồi `ollama run qwen3.5:4b-q4_K_M --think=false`. Đây là tải thêm bản khoảng 3.3GB, không tái sử dụng hoàn toàn weights MLX 4GB. Giữ bản cũ đến khi bản mới chạy được. Đổi OLLAMA_MODEL trong .env sang qwen3.5:4b-q4_K_M và restart MIRA. Chưa kiểm chứng inference bản GGUF trên máy; không tuyên bố đã sửa xong. Không xóa cache/model hoặc sửa hệ điều hành để thử lách lỗi.
