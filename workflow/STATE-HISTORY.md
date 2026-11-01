# Trạng thái MIRA

## Checkpoint — 31/10/2026, Asia/Ho_Chi_Minh

- Phạm vi được giao: bắt đầu triển khai MIRA và thêm lựa chọn thay AI.
- Trạng thái: waiting_input cho nghiệm thu AI thật; bản Demo đã triển khai và kiểm tra tự động.
- Đã tạo React/TypeScript/Vite, khuôn mặt SVG sáu cảm xúc, hoạt ảnh, chat Demo, bộ chọn provider và backend Node.
- Provider: Demo, Gemini, Groq, Ollama. Chưa có key/model thật; không tự bật thanh toán.
- Persona hài hước nhẹ ở server/persona.ts.
- Lịch sử hiện ở tab, không có trí nhớ bền vững hoặc phiên server.
- Kiểm tra đạt: 14 test, typecheck, build; 5 HTTP smoke checks. Cài dependency cuối báo 0 vulnerabilities.
- Chưa thử: trình duyệt thật, kết nối provider thật, STT/TTS, phần cứng.
- Cách chạy: npm run dev; mở URL Vite in ra, thường http://127.0.0.1:5173.
- Tiến trình dev dùng kiểm tra đã được dừng sau smoke test; người dùng có thể chạy lại.
- Thao tác tiếp theo: thử UI trên Mac, điền GEMINI_API_KEY và GEMINI_MODEL trong .env local, khởi động lại và thử hội thoại nhiều lượt.
- Không yêu cầu gửi key vào chat.

## Tiến độ

| ID | Workflow | Trạng thái |
| --- | --- | --- |
| 00 | Setup | done |
| 01 | Digital Face | in_progress — mã/test đạt, chờ nghiệm thu trình duyệt |
| 02 | Persona | in_progress — có prompt, chưa đánh giá AI thật |
| 03 | AI Brain | waiting_input — adapter/mock đạt, cần key/model để thử thật |
| 04 | Memory | pending |
| 05 | Voice Output | pending |
| 06 | Voice Input | pending |
| 07 | Orchestration | pending — có phần điều phối văn bản cơ bản |
| 08 | Validation | pending — có kiểm tra tự động/HTTP, chưa đủ toàn bộ |
| 09 | Hardware | pending |

## File và bằng chứng

- Mã nguồn: src/, server/; test: tests/; smoke test: scripts/smoke.mjs.
- Cấu hình: package.json, package-lock.json, tsconfig.json, vite.config.ts, .env.example, .gitignore.
- Tài liệu: README.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/TESTING.md.
- Chi tiết lệnh và giới hạn: docs/TESTING.md.
- Dependency cũ được giữ dự phòng tại /private/tmp/mira-node-modules-before-upgrade-20261031 và /private/tmp/mira-package-lock-before-upgrade-20261031.json; bản đang dùng đã cập nhật.

Khi tiếp tục, đối chiếu workspace và tiến trình thực tế trước. Không đánh dấu API thật hoặc UI trực quan là đã đạt dựa trên test mock.

## Cập nhật — ưu tiên nói chuyện bằng giọng

- Người dùng yêu cầu nói chuyện, không dùng chat làm luồng chính.
- Đã thêm SpeechInput/SpeechOutput tại src/services/voice.ts và giao diện micro chính; bản chép lời và nhập văn bản chuyển vào mục thu gọn.
- Nhận tiếng Việt một lượt bằng Web Speech API; phản hồi tự phát bằng speechSynthesis khi có giọng Việt.
- Có nút nói xong, dừng, nghe lại và ngắt tiếng để nói lượt mới; đổi AI/hủy gỡ callback và bỏ kết quả cũ.
- Khẩu hình bắt đầu/dừng theo sự kiện TTS, chuyển động gần đúng; chưa phân tích audio/âm vị.
- 19 test đạt (gồm luồng micro → Demo → TTS bằng mock), typecheck và build đạt.
- Workflow 05/06/07: in_progress; chờ nghiệm thu micro, giọng Việt và autoplay thực tế trên Mac. Chưa coi mock là đã nghe/nói thành công trên thiết bị.
- Thao tác tiếp theo: npm run dev, kiểm tra hỗ trợ micro và giọng Việt, thử một lượt nói bằng Demo trước rồi cấu hình AI thật.

## Cập nhật biểu cảm tự động

- Thêm src/engine/emotion.ts, phản ứng ngay theo transcript tạm; bắt đầu nghe tò mò, chờ AI suy tư, trả lời theo cảm xúc đã validate.
- Demo cũng dùng bộ phân loại nội dung; không cần chọn cảm xúc thủ công.
- 26 test đạt; typecheck/build đạt. Chưa thử trực quan/micro thật; phân loại từ khóa không phải phân tích ngữ điệu.
