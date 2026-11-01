# Tiến độ bổ sung theo yêu cầu mới

Người dùng yêu cầu miễn phí, nhanh hơn, giọng tốt hơn và trả lời dài hơn. Đã thực hiện phần Fast/Long streaming và local TTS dù bộ nghiệm thu 30 câu Phase 1 chưa hoàn tất. Đây là phạm vi được người dùng giao mới, không phải tự coi toàn Phase 1–2 đã đạt. Phase 2 còn STT offline/VAD và nghiệm thu micro/loa; giọng local đã tạo audio thật nhưng cần người dùng nghe. Memory/emotion state/firmware chưa triển khai thêm.

---

# Roadmap local-first

Phase hiện tại: 1, chưa nghiệm thu local inference. UI và giọng trình duyệt đã có được giữ; không coi đó là các phase offline đã hoàn thành. Mỗi phase chỉ chuyển khi có bằng chứng thực tế.

## 1 — Local AI Brain

- Mục tiêu: text → local LLM → JSON tiếng Việt, không key/cloud.
- Công nghệ: Ollama, Qwen3.5:4b ứng viên, Node controller hiện có.
- Module: server/local.ts, server/providers.ts, server/persona.ts, config/personality.json, server/check-local.ts.
- Hardware: Mac ARM 16GB hiện có, chưa mua.
- Hoàn thành: bộ câu Việt, inference thật nhiều lượt, số đo cold/warm và thử không WAN; tests/build đạt.
- Lỗi thường gặp: Ollama chưa chạy, tag model sai, JSON lỗi, RAM/context hoặc timeout.
- Workflow: workflow/PHASE-01-LOCAL-BRAIN.md.

## 2 — Voice offline

- Mục tiêu/kiến trúc: Micro → Silero VAD → whisper.cpp multilingual → LLM → Piper Việt → loa; Python service tách khỏi UI. Thử VieNeu v3 Turbo sau baseline và kiểm tra license checkpoint.
- Công nghệ/cài đặt: Cài từng runtime/model từ nguồn chính thức vào môi trường riêng, pin phiên bản; không cài mọi ứng viên.
- Module: speech/vad, speech/stt, speech/tts và adapter controller khi thật sự triển khai; giữ browser voice opt-in để so sánh.
- Hardware: Không mua; dùng micro/loa Mac trước.
- Hoàn thành: Nghe/nói Việt offline trên máy thật, có dừng và fallback rõ; đo STT final, first audio, CPU/RAM.
- Lỗi thường gặp: Mic không có quyền, sample rate sai, nhiễu/echo, ASR nhầm, giọng TTS thiếu hoặc phát bị chặn.
- Workflow: workflow/PHASE-02-LOCAL-VOICE.md.

## 3 — Personality nhất quán

- Mục tiêu/kiến trúc: Base traits + current emotion + relationship + relevant memories + situation + context → LLM; một lượt gọi.
- Công nghệ/cài đặt: Không thêm training framework; dùng cấu hình hiện có.
- Module: config/personality.json, server/persona.ts; thêm preset/selector chỉ khi cần.
- Hardware: Không mua.
- Hoàn thành: Giữ xưng hô, ngắn gọn, không cà khịa khi người dùng cần đồng cảm; ghi điểm và lỗi.
- Lỗi thường gặp: Style trôi, lặp câu cửa miệng, quá lạnh lùng, khen xã giao; sửa ví dụ trước fine-tune.
- Workflow: workflow/PHASE-03-PERSONALITY.md.

## 4 — Trí nhớ có kiểm soát

- Mục tiêu/kiến trúc: SQLite short-term/episodic/semantic/relationship; extraction candidates → consent/provenance → lưu; retrieval top-k trước LLM.
- Công nghệ/cài đặt: Chọn SQLite binding phù hợp runtime; chỉ thêm embedding khi keyword/FTS không đủ.
- Module: brain/memory hoặc server/memory; migration, retention, xem/xóa và giới hạn context.
- Hardware: Không mua; dùng ổ hiện có.
- Hoàn thành: Nhớ đúng, không trộn người, xóa thực sự, không lưu toàn bộ conversation vào prompt.
- Lỗi thường gặp: Sai facts, stale memory, injection trong memory, mất dữ liệu khi restart; kiểm tra source và migration.
- Workflow: workflow/PHASE-04-MEMORY.md.

## 5 — Emotion state

- Mục tiêu/kiến trúc: State happiness/sadness/annoyance/energy/trust/attachment/curiosity 0..1; event update + clamp + decay → lời nói/giọng/mặt.
- Công nghệ/cài đặt: Dùng code thuần trước; không thêm sentiment model khi chưa cần.
- Module: brain/emotion, mapping voice_style/expression; giữ reaction từ khóa như heuristic có giới hạn.
- Hardware: Không mua.
- Hoàn thành: Cảm xúc mô phỏng nhất quán, không nhảy loạn; không can thiệp lệnh dừng hoặc quyền xóa.
- Lỗi thường gặp: Keyword phủ định, quá nhạy, state tích lũy vô hạn, TTS không hỗ trợ style; không giả là đo cảm xúc thật.
- Workflow: workflow/PHASE-05-EMOTION.md.

## 6 — ESP32 + servo + screen

- Mục tiêu/kiến trúc: Action whitelist → validator → safety controller → USB Serial → MCU limits/watchdog → servo/LED/screen.
- Công nghệ/cài đặt: Chọn SDK/firmware theo board thực tế, kiểm tra nguồn/driver; không suy đoán pin đấu.
- Module: robot/actions, robot/controller, robot/protocol, hardware/esp32; có simulator trước.
- Hardware: Theo HARDWARE-PLAN.md; mua chỉ khi được giao và thông số đã chốt.
- Hoàn thành: STOP ưu tiên, mất kết nối dừng, giới hạn cơ khí/tốc độ có hiệu lực trên MCU, không PWM từ LLM.
- Lỗi thường gặp: Nguồn sụt, servo kẹt, reset MCU, chậm ACK, mức logic sai; xử lý phần điện/cơ khí trước.
- Workflow: workflow/PHASE-06-DESKTOP-ROBOT.md.

## 7 — Camera và sensors

- Mục tiêu/kiến trúc: Sensor → event manager → context → policy → speak/ignore/action; quiet hours, cooldown và opt-in.
- Công nghệ/cài đặt: Chỉ cài driver/model cho sensor đã chọn, xác minh license.
- Module: sensor adapters, event manager, presence và schedule policy.
- Hardware: Camera/distance/IMU tùy mục tiêu, cập nhật BOM trước.
- Hoàn thành: Robot biết không nói, không spam, mất sensor không sinh hành động nguy hiểm; nhận diện không bị coi là xác thực.
- Lỗi thường gặp: False positives, camera permissions, ánh sáng, privacy, event storm.
- Workflow: workflow/PHASE-07-SENSORS.md.

## 8 — Robot di chuyển

- Mục tiêu/kiến trúc: Planner chỉ đề xuất preset; safety MCU/sensor quyết định di chuyển, STOP và e-stop độc lập.
- Công nghệ/cài đặt: Chọn motor driver/firmware theo tải và nguồn thật.
- Module: Motion presets, obstacle check, physical E-stop và watchdog.
- Hardware: Motor, driver, chassis, cảm biến khoảng cách, pin/BMS/sạc; ngân sách phải tính lại.
- Hoàn thành: Giới hạn quãng ngắn/tốc độ, dừng khi lỗi, không bật MOVE_FORWARD_SHORT chỉ vì model đề xuất.
- Lỗi thường gặp: Dòng khởi động, tipping, kẹt bánh, sensor mù và lệnh lặp.
- Workflow: workflow/PHASE-08-MOBILITY.md.

## 9 — Thu nhỏ

- Mục tiêu/kiến trúc: A local nhỏ 0.8–2B hoặc B client/server LAN; so chất lượng, độ trễ, pin và kích thước.
- Công nghệ/cài đặt: Chỉ đổi runtime/board sau benchmark; có regression test.
- Module: Deployment config, resource limits, thermal/battery monitoring và packaging.
- Hardware: Board/vỏ/pin mới sau báo giá, không bảo đảm ngân sách prototype vẫn giữ nguyên.
- Hoàn thành: Chốt tradeoff rõ; không gọi client cần server là hoàn toàn độc lập.
- Lỗi thường gặp: Thermal throttle, pin hụt, loa hồi tiếp, chất lượng model nhỏ giảm.
- Workflow: workflow/PHASE-09-MINIATURIZATION.md.

## 10 — Fine-tune nếu thật sự cần

- Mục tiêu/kiến trúc: LoRA/QLoRA cho style LLM hoặc training TTS cho voice là hai bài toán riêng; không train từ đầu.
- Công nghệ/cài đặt: Chọn một trong MLX LoRA/Unsloth/LlamaFactory/Axolotl theo model/hardware, pin recipe.
- Module: Dataset JSONL có quyền dùng, split theo chủ đề, training config và eval report; chưa tạo dataset bịa bằng cách lặp câu.
- Hardware: Không tự thuê GPU hoặc phát sinh phí; chọn tài nguyên đã được cho phép.
- Hoàn thành: Cải thiện đo được, không memorization dữ liệu riêng, license hợp lệ, có rollback; nếu không cần thì ghi skipped có lý do.
- Lỗi thường gặp: Overfit, style lặp, giảm tiếng Việt/JSON, OOM và license checkpoint.
- Workflow: workflow/PHASE-10-FINETUNING.md.

