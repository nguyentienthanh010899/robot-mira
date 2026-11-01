# Cách sử dụng workflow MIRA trong box chat

Đây là bộ hướng dẫn dạng file để giao việc cho trợ lý trong workspace này. Không phải plugin hay lệnh slash được cài tự động. Bạn dùng bằng cách gửi câu lệnh bên dưới vào chat; trợ lý đọc file và thực hiện.

## Bắt đầu bằng MASTER

```text
Đọc workflow/MASTER.md và chạy MASTER cho dự án MIRA.
```

MASTER kiểm tra tiến độ, chọn bước cần làm và thực hiện một workflow. Khi bước hoàn tất, MASTER ghi kết quả rồi dừng để bạn kiểm tra.

## Tiếp tục sau khi nghỉ hoặc mở box chat mới

```text
Đọc workflow/MASTER.md và workflow/STATE.md. Tiếp tục từ checkpoint hiện tại, kiểm tra mã thực tế trước khi làm và không làm lại phần đã hoàn thành.
```

## Chạy một workflow cụ thể

```text
Đọc workflow/MASTER.md, sau đó thực hiện workflow/03-AI-BRAIN.md. Kiểm tra điều kiện đầu vào trước khi triển khai.
```

## Dừng và lưu tiến độ

```text
Dừng công việc ở điểm an toàn gần nhất và cập nhật workflow/STATE.md: việc đã làm, file đã sửa, kiểm tra đã chạy, lỗi còn lại và thao tác tiếp theo.
```

Nếu dừng cưỡng bức khi một thao tác đang chạy, checkpoint có thể chưa kịp cập nhật. Khi tiếp tục, yêu cầu MASTER đối chiếu trạng thái file và tiến trình thực tế.

## Xem trạng thái, chưa triển khai

```text
Đọc workflow/STATE.md và kiểm tra workspace. Báo cáo bước hiện tại, việc còn thiếu và bước tiếp theo. Chưa sửa mã.
```

## Danh sách workflow

| File | Công việc |
| --- | --- |
| `MASTER.md` | Điều phối và lưu checkpoint |
| `00-SETUP.md` | Khảo sát, khởi tạo, tài liệu |
| `01-DIGITAL-FACE.md` | Khuôn mặt, cảm xúc, hội thoại Demo |
| `02-PERSONA.md` | Cấu hình tính cách nhân vật |
| `03-AI-BRAIN.md` | Backend và AI thật |
| `04-MEMORY.md` | Lịch sử, trí nhớ và xóa dữ liệu |
| `05-VOICE-OUTPUT.md` | Đọc phản hồi thành tiếng |
| `06-VOICE-INPUT.md` | Nhận dạng tiếng Việt |
| `07-ORCHESTRATION.md` | Điều phối, cảm xúc, khẩu hình |
| `08-VALIDATION.md` | Kiểm tra toàn bộ trên Mac |
| `09-HARDWARE.md` | Adapter giả lập và kết nối robot |
| `STATE.md` | Tiến độ và checkpoint để tiếp tục |

Nguồn yêu cầu: `docs/robot.md`. Hướng dẫn tổng thể: `docs/WORKFLOW.md`.

Danh sách công nghệ, AI và các lựa chọn chưa chốt: `docs/TECH-STACK.md`.
