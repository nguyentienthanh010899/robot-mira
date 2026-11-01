# Workflow MIRA local-first trong box chat

Đây là hướng dẫn dạng file, không phải plugin hoặc slash command được cài tự động.

Bắt đầu / tiếp tục:

```text
Đọc workflow/MASTER.md và workflow/STATE.md. Tiếp tục phase hiện tại, kiểm tra workspace trước khi sửa.
```

Dừng:

```text
Dừng ở điểm an toàn, lưu checkpoint vào workflow/STATE.md.
```

Chỉ xem tiến độ:

```text
Đọc workflow/STATE.md, kiểm tra workspace và báo phần còn thiếu; chưa sửa mã.
```

## Thứ tự chính

| Phase | Workflow |
| --- | --- |
| 1 | [Local Brain](PHASE-01-LOCAL-BRAIN.md) |
| 2 | [Voice offline](PHASE-02-LOCAL-VOICE.md) |
| 3 | [Personality nhất quán](PHASE-03-PERSONALITY.md) |
| 4 | [Trí nhớ có kiểm soát](PHASE-04-MEMORY.md) |
| 5 | [Emotion state](PHASE-05-EMOTION.md) |
| 6 | [ESP32 + servo + screen](PHASE-06-DESKTOP-ROBOT.md) |
| 7 | [Camera và sensors](PHASE-07-SENSORS.md) |
| 8 | [Robot di chuyển](PHASE-08-MOBILITY.md) |
| 9 | [Thu nhỏ](PHASE-09-MINIATURIZATION.md) |
| 10 | [Fine-tune nếu thật sự cần](PHASE-10-FINETUNING.md) |

Mỗi file có mục tiêu, kiến trúc, cài đặt, mã, chạy thử, expected result, debug và xác nhận. MASTER mặc định chỉ làm phase hiện tại; không coi mock là nghiệm thu thật.

Các workflow 00–09 trước đây và README-LEGACY.md là tham khảo cho mã web đã có, không còn là thứ tự chính. Nguồn mới: docs/ROBOT-PROMPT.md; đánh giá: docs/PROMPT-REVIEW.md; stack: docs/TECH-STACK.md.

## Nhân vật quân sư

Dùng [PERSONA-QUAN-SU.md](PERSONA-QUAN-SU.md) để cấu hình MIRA là đàn em của đại ca, phong thái Gia Cát Lượng hài hước.
