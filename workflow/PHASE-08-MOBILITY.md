# Phase 08 — Robot di chuyển

## Mục tiêu và đầu vào

Desktop safety và sensors đạt; có bản vẽ cơ khí/nguồn. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

Planner chỉ đề xuất preset; safety MCU/sensor quyết định di chuyển, STOP và e-stop độc lập.

## Cài đặt

Chọn motor driver/firmware theo tải và nguồn thật. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

Motion presets, obstacle check, physical E-stop và watchdog. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Thử bánh nhấc khỏi mặt đất trước, sau đó khu vực kiểm soát; test vật cản/mất mạng/pin yếu.

## Kết quả mong đợi

Giới hạn quãng ngắn/tốc độ, dừng khi lỗi, không bật MOVE_FORWARD_SHORT chỉ vì model đề xuất.

## Debug thường gặp

Dòng khởi động, tipping, kẹt bánh, sensor mù và lệnh lặp.

## Hardware cần mua

Motor, driver, chassis, cảm biến khoảng cách, pin/BMS/sạc; ngân sách phải tính lại.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
