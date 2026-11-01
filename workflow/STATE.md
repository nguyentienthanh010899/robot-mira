# Dừng theo yêu cầu người dùng — 01/11/2026

Người dùng đóng máy đi ngủ, tiếp tục ngày mai. Giữ nguyên source, .env và model đã tải. Dừng dev web/API/VieNeu và Ollama; không gỡ cài đặt.

Điểm tiếp tục: người dùng muốn AI nhanh hơn và vừa thảo luận Cloudflare Workers AI. CHƯA triển khai adapter Cloudflare, CHƯA deploy, CHƯA cấu hình tài khoản/token, không bật cloud hoặc thanh toán. Hướng đề xuất: thêm lựa chọn Cloudflare bên cạnh Ollama để benchmark text trước, giữ TTS là nút thắt riêng. Kiểm tra lại hạn mức/model miễn phí chính thức khi triển khai. Các sửa xưng hô và đệm audio đã ghi trong checkpoint dưới; không cài lại dependency/model.

Mai đọc workflow/STATE.md và workflow/PERSONA-QUAN-SU.md để tiếp tục. Nếu chỉ chạy bản local hiện tại: khởi động Ollama local-only bằng đường dẫn CLI trong README, rồi npm run dev:voice. Không tự tiếp tục công việc khi người dùng đã yêu cầu dừng.

--- Checkpoint trước ---

# Checkpoint kiểm tra xưng hô — 01/11/2026

Thêm server/role-check.ts: kiểm tra trước khi xuất text, retry một lần nếu sai vai, báo lỗi nếu vẫn sai. Không gửi text nháp ra UI/TTS; không thay đại từ hàng loạt. Lịch sử assistant bị phát hiện sai vai khiến context lượt đó chỉ giữ câu hỏi cuối. Sửa greeting và Demo, prompt bảng vai và temperature=0.3. Bộ mẫu còn giới hạn ngữ nghĩa, không bảo đảm mọi câu phức tạp. 64 test và build đạt.

Hai lượt AI thật với người dùng xưng anh/em và tôi/bạn: output đều giữ đại ca/đệ, 17.255 giây và 12.283 giây. Câu thức khuya còn suy diễn tâm trạng buồn; sau đó đã gỡ ví dụ buồn nhúng trong boundaries và thêm quy tắc không suy diễn, chưa đo lại thay đổi nội dung cuối này. Workflow PERSONA-QUAN-SU.md và docs/WORKFLOW.md cập nhật cơ chế/giới hạn/retry. Tiếp theo restart backend, tải lại trang, thử đa lượt; chưa nghiệm thu tất cả câu hoặc giọng loa.

--- Checkpoint trước ---

# Checkpoint sửa giọng và nhân vật — 01/11/2026

Lỗi xác nhận từ code: queue tạo/phát từng câu tuần tự, khiến có khoảng chờ tổng hợp giọng giữa các câu. Đã đổi queue gửi cả đoạn, player chia request <=500 ký tự, đệm mọi audio trước khi lập lịch phát liên tục; vẫn chỉ nói sau khi text hoàn tất. CPU vẫn chậm, thời gian chờ trước giọng tăng; không tuyên bố giảm tổng độ trễ. Prompt mới dùng tiếng Việt hiện đại, đệ=AI/đại ca=người dùng, bỏ ẩn dụ rối và giảm đùa khi buồn.

Lượt inference local thật Fast/short câu “Hôm nay anh hơi buồn.”: 12.608 giây, trả “Bẩm đại ca, nghe có vẻ hôm nay đại ca không vui. Đại ca muốn kể cho đệ nghe chuyện gì đã xảy ra không? Đệ luôn ở đây lắng nghe.” Đây là một câu thử, không nghiệm thu toàn bộ nhân vật. Đã cập nhật docs/WORKFLOW.md và workflow/PERSONA-QUAN-SU.md cùng tiêu chí kiểm tra. 60 test và build đạt; có test đợi mọi request TTS xong trước khi phát. Chưa nghe trực tiếp loa, chưa đo lại latency audio toàn đoạn. Tiếp theo: restart backend, tải lại trang và thử giọng thực tế; không đánh dấu toàn phase đạt.

--- Checkpoint trước ---

# Checkpoint nhân vật quân sư — 01/11/2026

Đã tạo workflow/PERSONA-QUAN-SU.md và liên kết vào MASTER/README. Đã đổi config/personality.json và cả prompt Nhanh/Chất lượng: người dùng là đại ca; AI xưng đệ, quân sư lấy cảm hứng Gia Cát Lượng, trêu đùa nhẹ, mở mỗi lượt “Bẩm đại ca,”. Giữ chờ hoàn tất text rồi mới nói. Không fine-tune, không tải thêm model. 58 test đạt, build đạt; chưa nghiệm thu inference nhân vật và nghe loa. Prompt không phải cơ chế cưỡng chế tuyệt đối tiền tố; Demo cố định chưa đổi nhân vật. Tiếp theo: restart backend và chạy các câu thử trong workflow trên cả hai chế độ.

--- Checkpoint trước ---

# Checkpoint hiện hành — 01/11/2026: hội thoại và giọng local

- Không phí API/thuê bao: ALLOW_CLOUD_AI=false; vẫn dùng điện, RAM và dung lượng máy.
- Chất lượng: qwen3.5:4b-q4_K_M CPU. Nhanh: qwen3.5:2b-q4_K_M CPU, streaming lời nói; không phát lệnh phần cứng trong chế độ Nhanh.
- Chọn độ dài Ngắn/Vừa đủ/Chi tiết; mặc định Chi tiết, hướng dẫn 6–10 câu khi câu hỏi cần giải thích. Có thể ngắt lời đang phát.
- VieNeu v3 Turbo ONNX fp32 đã cài, tải model, khởi động từ cache offline và sinh WAV/PCM thật; 25 preset tiếng Việt. Chưa nghe loa để nghiệm thu chất lượng chủ quan.
- Chạy npm run dev:voice. STT hiện vẫn là Web Speech của trình duyệt, chưa phải nhận dạng giọng nói offline.
- 55 test / 9 file đạt; typecheck, build, Python compile đạt. HTTP smoke 7 kiểm tra đạt.
- Đo đồng thời LLM+TTS trên máy này: text đầu 12.214 giây, audio đầu 19.560 giây, hoàn thành text 71.997 giây. Đây là một lượt đo, không phải p50/p95; không gồm STT/phát loa.
- Chưa đạt hội thoại phản xạ nhanh. Cần nghe thử, kiểm tra trình duyệt/micro và đo thêm trước khi nghiệm thu Phase 2. Phase 1 còn bộ 30 câu và kiểm tra không WAN.
- Thử thêm qwen3:1.7b đã tải thành công nhưng GPU vẫn lỗi GGML_ASSERT(buf_dst); giữ cấu hình 2B/4B CPU đã chạy.
- Chi tiết số đo: docs/PERFORMANCE.md. Lịch sử phía dưới không thay thế checkpoint này.

--- Lịch sử ---


## 01/11/2026 — Local Brain trả lời thành công bằng CPU

Đã tạo .env khi chưa có, chọn qwen3.5:4b-q4_K_M, ALLOW_CLOUD_AI=false. GPU GGUF thất bại GGML_ASSERT(buf_dst); thử num_gpu=0 thành công. Adapter hỗ trợ OLLAMA_NUM_GPU, .env local đặt 0; .env.example để tùy chọn trống.

`npm run brain:check -- --infer` đạt: reachable=true, modelReady=true; model trả câu personality tiếng Việt và structured output hợp lệ. Total một lượt 15.737ms, generation 3.610ms, 62 tokens; đây không phải TTFT hoặc benchmark p50/p95. 38 test đạt, typecheck/build đạt. Cần restart backend đang chạy để đọc .env mới. Phase 1 còn bộ 30 câu và thử không WAN; chưa đánh dấu hoàn thành toàn phase.

# Checkpoint mới nhất — model MLX chưa chạy được

- Người dùng tải qwen3.5:4b 4GB thành công nhưng run trả HTTP 500, MLX không load được kernel v_Expfloat32float32.
- Kiểm tra manifest local xác nhận runner=mlx, format=safetensors.
- Chọn hướng thử GGUF cụ thể qwen3.5:4b-q4_K_M (~3.3GB) để dùng backend khác, chưa tự tải thêm và chưa nghiệm thu inference.
- .env.example đã đổi tag; người dùng cần đổi .env thực tế nếu có rồi restart.
- Phase 1 vẫn chưa done. Giữ model MLX cũ cho tới khi phương án mới được thử.

--- Lịch sử ---

# Checkpoint hiện hành — Ollama đã cài lại

- Người dùng yêu cầu cài lại Ollama, thay thế quyết định gỡ trước đó.
- Đã cài /Applications/Ollama.app bằng script chính thức; bỏ qua GUI vì macOS 13.4 không tương thích GUI yêu cầu 14.
- CLI 0.40.13 chạy được bằng /Applications/Ollama.app/Contents/Resources/ollama.
- Dịch vụ đang chạy local-only tại 127.0.0.1:11434 trong phiên kiểm tra 27218; log xác nhận Ollama cloud disabled: true và Metal Apple M2.
- GET /api/tags trả HTTP 200, models: []; chưa tải model, chưa inference.
- Installer chưa tạo /usr/local/bin/ollama vì cần mật khẩu quản trị. Có thể dùng đường dẫn đầy đủ hoặc thêm /Applications/Ollama.app/Contents/Resources vào PATH trong Terminal, không bắt buộc sudo.
- .env.example khôi phục OLLAMA_MODEL=qwen3.5:4b; .env thực tế chưa tạo trong lượt này.
- Tiếp theo: tải model đã chọn rồi kiểm tra Brain. Không đánh dấu Phase 1 done trước khi inference thật.

--- Lịch sử ---

# Quyết định mới nhất — cài lại Ollama

Người dùng đã yêu cầu cài lại Ollama; yêu cầu này thay thế chỉ thị không cài lại ở lịch sử phía dưới. Đang cài bằng script chính thức với OLLAMA_NO_START=1 để không mở GUI không tương thích. Chỉ dùng CLI local-only; chưa tải model hoặc nghiệm thu inference. Kết quả cài đặt sẽ ghi ở checkpoint tiếp theo.

---

# Quyết định mới nhất — gỡ Ollama

Người dùng yêu cầu gỡ Ollama và chỉ dùng AI chạy miễn phí, không thuê bao/API tính phí. Quyết định này thay thế lựa chọn Ollama trong tài liệu phía dưới; MASTER không tự cài lại Ollama.

- Đã gỡ /Applications/Ollama.app và ~/.ollama (dữ liệu lúc gỡ khoảng 12KB, chưa có model).
- Còn symlink /usr/local/bin/ollama do root sở hữu; thử sudo không tương tác không được cấp quyền. Cần người dùng chạy `sudo rm /usr/local/bin/ollama` trong Terminal của họ.
- Ứng viên thay thế: llama.cpp + Qwen3-4B GGUF Q4_K_M, không dùng dịch vụ cloud. Chưa cài/build/model và chưa xác minh inference trên macOS 13.4.
- Adapter local hiện vẫn dành cho Ollama; chuyển sang API llama.cpp là việc cần làm tiếp, chưa tuyên bố tương thích.
- Giữ Demo hoạt động. Không tự tải model nhiều GB hoặc tuyên bố model/runtime mới đã chạy.

---

# MIRA — checkpoint hiện hành

Ngày: 31/10/2026, Asia/Ho_Chi_Minh. Lịch sử trước thay đổi local-first: STATE-HISTORY.md.

## Phạm vi và phase

- Người dùng yêu cầu đối chiếu prompt đính kèm và sửa dự án theo đó.
- Đã lưu nguyên văn docs/ROBOT-PROMPT.md; đánh giá ở docs/PROMPT-REVIEW.md.
- Ưu tiên mới: local/free/privacy, prototype để bàn ≤5 triệu; cloud opt-in, không tự fallback.
- Phase hiện tại: **1 — Local AI Brain**.
- Trạng thái: **waiting_input** cho cài/chạy Ollama và model thực tế; chưa đánh dấu Phase 1 done.
- Máy xác minh: ARM, RAM 17.179.869.184 bytes (16GiB). Node 22.23.2, npm 10.9.8.

## Đã thay đổi

- Nghiên cứu LLM/runtime, speech/VAD/TTS, memory/train; kiến trúc A/B và BOM dự toán có điều kiện.
- MASTER/README/roadmap chuyển sang PHASE-01…PHASE-10. File 00–09 cũ chỉ là tham khảo.
- Tách config/personality.json và server/persona.ts context builder; personality bình tĩnh, hơi lạnh lùng, cà khịa nhẹ.
- Ollama loopback, schema structured output, thinking=false, context 4096 và output giới hạn; kiểm tra model local trước khi bật UI.
- Cloud khóa mặc định bằng ALLOW_CLOUD_AI; chặn tag Ollama có cloud, ghi hướng dẫn tắt cloud trên daemon riêng.
- Response speech/emotion/actions/voice_style; giữ text/action tương thích; lọc action whitelist, STOP ưu tiên; không dispatch phần cứng.
- Giữ UI/mặt/voice cũ; browser voice chỉ hoạt động khi opt-in, không gọi là offline.
- Có CLI npm run brain:check và -- --infer; không tự tải model/gọi cloud.

## Kiểm tra thực tế

- npm run test: **37 test / 6 file đạt**.
- npm run build: typecheck + Vite build đạt.
- HTTP smoke: **7 kiểm tra đạt**, trên API 3901/web 5174, vì cổng mặc định có tiến trình khác. Không gọi cloud inference.
- npm run brain:check (đã cấp quyền local): reachable=false, modelReady=false; .env chưa có. Chưa có local inference thật, số đo tokens/s hoặc chất lượng tiếng Việt.
- Chưa browser QA, mic/loa thật, local speech service, SQLite, cảm xúc state 0..1, firmware hoặc robot.

## Tiến trình

Bản dev do phiên này mở trên 3901/5174 dùng cho smoke được dừng sau kiểm tra. Các tiến trình đã có trên 3001/5173 không bị dừng. Kiểm tra lại thực tế khi tiếp tục; không kill tiến trình lạ.

## Thao tác tiếp theo

1. Theo workflow/PHASE-01-LOCAL-BRAIN.md: cài/mở Ollama, cấu hình daemon local-only, tải qwen3.5:4b nếu chọn và đủ dung lượng.
2. Tạo .env từ .env.example nếu chưa có; không ghi đè file đã tồn tại. ALLOW_CLOUD_AI=false.
3. npm run brain:check rồi npm run brain:check -- --infer.
4. Thử bộ config/brain-eval.json, đo cold/warm và thử không WAN. Ghi model/tag/digest/runtime/kết quả.
5. Chỉ chuyển Phase 2 sau nghiệm thu Brain. Không tự fine-tune/mua phần cứng.

## Tiến độ phase

| Phase | Trạng thái |
| --- | --- |
| 1 Local Brain | waiting_input — mã và mock đạt, thiếu runtime/model thật |
| 2 Local Voice | pending — browser voice là bản thử, không phải nghiệm thu offline |
| 3 Personality | pending — có nền cấu hình, chưa eval model thật |
| 4 Memory | pending |
| 5 Emotion state | pending — có heuristic/UI trước đó |
| 6 Desktop robot | pending |
| 7 Sensors/events | pending |
| 8 Mobility | pending |
| 9 Miniaturization | pending |
| 10 Fine-tuning | pending — chỉ nếu cần |

## Chẩn đoán Ollama trên macOS 13.4

- Máy: macOS 13.4, Apple M2, RAM 16GiB. Ollama.app khai báo minimum OS 14.0 nên GUI báo -10825.
- CLI Ollama 0.40.13 đã cài và `ollama serve` chạy được qua kiểm tra thực tế, nhận Metal Apple M2.
- GET /api/tags trả HTTP 200 với models: []; chưa tải model hoặc thử inference.
- Dịch vụ dùng chẩn đoán đã dừng. Chạy lại `OLLAMA_NO_CLOUD=1 ollama serve` ở terminal riêng để giữ local-only, rồi tải model ở tab khác. GUI chưa dùng được; không sửa Info.plist để vượt kiểm tra OS.
