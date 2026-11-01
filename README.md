# MIRA — robot nói chuyện tiếng Việt

Chạy AI và giọng trả lời trên máy, không phí token/API hoặc thuê bao. Cloud mặc định tắt. Mac hiện tại dùng CPU vì GPU runner lỗi trên macOS 13.4.

## Chạy trên máy hiện tại

Dependency và model local đã cài/tải. Dừng dev cũ bằng Ctrl+C trong terminal của bạn, rồi:

```sh
npm run dev:voice
```

Lệnh mở backend, frontend và VieNeu-TTS local. Mở địa chỉ Vite in ra (thường http://127.0.0.1:5173). Đợi TTS báo ready, bấm **Làm mới giọng** nếu trang tải trước service.

- **Chế độ AI → Nhanh**: Qwen3.5 2B GGUF, prompt hội thoại gọn và streaming lời nói. Có thể kém chính xác hơn 4B.
- **Chất lượng**: Qwen3.5 4B GGUF, phản hồi JSON có validate, thường cần chờ lâu hơn.
- **Độ dài → Chi tiết** mặc định: hướng dẫn trả lời đủ ý, thường 6–10 câu khi cần; có Ngắn và Vừa đủ. Không ép câu chào thành bài dài.
- **Giọng Việt local**: 25 preset, chọn Hải Đăng/Mai Anh/Trúc Ly/Thùy Dung… rồi **Nghe lại**. Chưa có import/clone giọng riêng.
- **Thời điểm nói**: đợi AI trả lời xong, hiện đầy đủ nội dung rồi tạo đủ audio của toàn đoạn trước khi phát liên tục. Có thêm thời gian chờ chuẩn bị giọng. Trong lúc AI tải chữ, robot chưa nói.
- **Dừng / Ngắt lời và nói**: hủy request, dừng audio và bỏ callback cũ.

Nút micro hiện vẫn dùng nhận dạng của trình duyệt và cần bạn bật checkbox cho phép; có thể gửi audio tới dịch vụ trình duyệt và cần Internet. **STT offline chưa có**. Giọng trả lời mới chạy local; không cần bật TTS trình duyệt để dùng VieNeu. Có transcript/nhập văn bản dự phòng.

## Thiết lập trên checkout mới

Node 22.12+ thuộc nhánh 22 hoặc bản dependency hỗ trợ; Python 3.11 cho speech.

```sh
npm install
python3.11 -m venv .venv-speech
.venv-speech/bin/python -m pip install -r speech/requirements.txt
npm run speech:prepare
```

Prepare tải weights public một lần về `data/huggingface`, tạo WAV thử. Sau đó `speech:serve` dùng cache offline. Không cần tài khoản/key TTS. Snapshot dependency Mac đã thử ở speech/requirements-macos.lock.

Ollama phải chạy local-only và có model đã tải:

```sh
export PATH="/Applications/Ollama.app/Contents/Resources:$PATH"
OLLAMA_NO_CLOUD=1 ollama serve
```

Giữ terminal này mở. Ở terminal khác, nếu model chưa có:

```sh
ollama pull qwen3.5:4b-q4_K_M
ollama pull qwen3.5:2b-q4_K_M
```

Lần đầu tải model cần Internet/dung lượng ổ đĩa. Nếu chưa có `.env`, copy `.env.example`; không ghi đè file đang có. Cấu hình hiện tại:

```dotenv
ALLOW_CLOUD_AI=false
OLLAMA_MODEL=qwen3.5:4b-q4_K_M
OLLAMA_FAST_MODEL=qwen3.5:2b-q4_K_M
OLLAMA_NUM_GPU=0
OLLAMA_NUM_THREAD=4
OLLAMA_BASE_URL=http://127.0.0.1:11434
LOCAL_TTS_URL=http://127.0.0.1:3002
```

Restart backend sau khi sửa môi trường. Ollama GUI yêu cầu macOS mới hơn máy hiện tại; CLI đã kiểm tra chạy được. Tag `:4b` đã chọn MLX và thất bại trên máy; dùng tag GGUF cụ thể.

## Deploy lên Cloudflare Workers

Trong Settings → Build của Worker kết nối Git, đặt:

- Root directory: thư mục gốc repo (`/`).
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy`.

Build tạo `dist/` trước khi deploy assets. Không cần commit `dist/` vào Git.
Workers Builds không dùng custom build trong `wrangler.jsonc`, vì vậy phải đặt Build command trên dashboard.
Khi chạy local, `npm run deploy` hoặc `npm run cf:check` tự build qua cấu hình Wrangler.
Bản Worker dùng binding Workers AI, không cần key Gemini/Groq hay Ollama/VieNeu local.

## Kiểm tra / đo

```sh
npm run test
npm run build
npm run brain:check -- --infer
npm run brain:benchmark -- --fast-only
```

Build bao gồm TypeScript. Benchmark gồm hai lượt, không phải p50/p95 hoặc kiểm chứng tính đúng đắn. Dev cần mở để chạy:

```sh
node scripts/smoke.mjs
node scripts/check-voice.mjs
node scripts/check-conversation.mjs
```

WAV nghe thử: data/voice-preview.wav và data/voice-stream-preview.wav. Số đo ở data/*benchmark.json và docs/TESTING.md. Browser autoplay có thể yêu cầu bấm Nghe lại. Chưa browser QA hoặc đánh giá chất lượng bằng tai người dùng.

## Giới hạn thực tế

- Streaming giảm thời gian bắt đầu có chữ/âm thanh; đoạn dài vẫn cần nhiều compute. TTS/LLM cùng dùng CPU có thể tạo khoảng nghỉ giữa các đoạn/chunk.
- Fast mode sinh text thuần, server gắn emotion heuristic và actions=[]; Quality giữ JSON có validate. Không có điều khiển phần cứng thật.
- UI giữ lịch sử ngắn trong tab; server chọn vài cặp gần nhất trong ngân sách context. Chưa memory SQLite lâu dài.
- Micro chưa offline, chưa voice cloning/emotional TTS đầy đủ, chưa robot độc lập hoặc pin.
- API chỉ bind loopback, chưa xác thực để public/LAN. Không đưa key vào frontend/Git. Không tự chuyển sang API tính phí.
- `dist/` chỉ gồm frontend. CPU/macOS/browser khác phải kiểm chứng lại.

Tài liệu: [kiến trúc](docs/ARCHITECTURE.md), [giọng local](speech/README.md), [kiểm tra](docs/TESTING.md), [workflow](workflow/README.md), [checkpoint](workflow/STATE.md), [BOM](docs/HARDWARE-PLAN.md).
