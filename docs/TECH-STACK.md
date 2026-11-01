# Stack triển khai cập nhật 01/11/2026

Đã thêm Qwen3.5:2b-q4_K_M cho Fast mode; giữ 4B cho Quality. Cả hai dùng CPU local, cloud tắt. Có độ dài trả lời, streaming NDJSON, sentence queue và VieNeu-TTS 3.8.3 v3 Turbo ONNX fp32 (Python 3.11, 25 giọng). Model/cache, venv và dữ liệu audio nằm ngoài Git. Giọng preset không đồng nghĩa cloning/emotion đã có. Chi tiết: speech/README.md và docs/TESTING.md.

Các lựa chọn từng ghi “chưa cài” về VieNeu/2B ở lịch sử phía dưới đã được thay thế bởi cập nhật này; STT offline, memory lâu dài và phần cứng vẫn chưa có.

---

# Stack hiện hành — MIRA local-first

Quyết định 31/10/2026 theo ROBOT-PROMPT.md; đọc PROMPT-REVIEW.md trước. Mac hiện tại ARM, RAM 16GB. Mục tiêu prototype ≤5 triệu, robot để bàn trước; chưa mua hardware.

| Lớp | Chọn V1 | Trạng thái |
| --- | --- | --- |
| Face/UI | React + TypeScript + Vite, SVG/CSS | Đã triển khai, còn nghiệm thu trình duyệt |
| AI controller | Node + TypeScript hiện có | Đã triển khai; không viết lại Python khi chưa có nhu cầu |
| LLM runtime | Ollama loopback | Adapter có; chưa kết nối được runtime trên máy |
| LLM model | Qwen3.5:4b ứng viên, context 4096, thinking tắt | Chưa tải/chạy/benchmark; không phải lựa chọn đã nghiệm thu |
| Model A/B | Qwen3:4b, Qwen nhỏ hơn, Gemma 4 E2B/E4B | Chưa cài; xem research/LOCAL-AI.md |
| Cloud | Gemini/Groq opt-in | Adapter có nhưng ALLOW_CLOUD_AI=false mặc định |
| Personality | config/personality.json + context builder | Bình tĩnh, hơi lạnh lùng, cà khịa nhẹ; chưa đánh giá với model thật |
| Response | speech/emotion/actions/voice_style, giữ text/action cũ | Schema Ollama + runtime validation; actions chưa dispatch |
| Browser voice | Web Speech API opt-in | Bản thử có thể dùng mạng, không phải voice offline |
| Local VAD | Silero ONNX | Chọn để thử Phase 2, chưa cài |
| Local STT | whisper.cpp small multilingual | Chọn để thử trên Mac; faster-whisper cho server phù hợp, Qwen3-ASR ứng viên A/B |
| Local TTS | Piper vi_VN/vais1000 baseline | Chưa tích hợp; kiểm tra attribution/voice license trước tải |
| Character TTS | VieNeu v3 Turbo ứng viên | Cần benchmark/kiểm tra checkpoint; v4 proprietary không chọn |
| Speech service | Python khi triển khai Phase 2 | Chưa tạo service rỗng hoặc requirements suy đoán |
| Memory | SQLite | Phase 4, chưa lưu lâu dài; hiện chỉ lịch sử tab |
| Emotion | State 0..1 + decay dự kiến | Hiện có heuristic nội dung và nhãn cảm xúc, chưa state đầy đủ |
| Robot protocol | USB Serial → ESP32 → giới hạn cơ cấu | Phase 6; chưa firmware/servo thật |
| Fine-tuning | Chưa làm; LoRA/QLoRA nếu cần sau eval | Phase 10 |
| Test | Vitest, React Testing Library, TypeScript/build | Đã thiết lập; kết quả ở TESTING.md |

Nguồn và so sánh chi tiết: [Local LLM/runtime](research/LOCAL-AI.md), [Speech/memory/train](research/SPEECH-MEMORY.md), [BOM và A/B](HARDWARE-PLAN.md). Phiên bản JS thực tế nằm trong package-lock.json; chưa pin model digest khi chưa tải.

Không bảo đảm model mới nhất là tốt nhất; không coi artifact size là RAM chạy; không suy diễn chất lượng tiếng Việt từ số ngôn ngữ. Mỗi quyết định cần nguồn chính thức, license, thiết bị, số đo và tiêu chí nghiệm thu.
