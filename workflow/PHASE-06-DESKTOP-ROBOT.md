# Phase 06 — ESP32 + servo + screen

## Mục tiêu và đầu vào

Phase 1–5 nghiệm thu, có báo giá và BOM tổng ≤5 triệu hoặc nêu rõ không đạt. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

Action whitelist → validator → safety controller → USB Serial → MCU limits/watchdog → servo/LED/screen.

## Cài đặt

Chọn SDK/firmware theo board thực tế, kiểm tra nguồn/driver; không suy đoán pin đấu. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

robot/actions, robot/controller, robot/protocol, hardware/esp32; có simulator trước. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Test simulator, ACK/NACK, TTL, ID trùng, STOP, mất heartbeat; thử từng servo trước nối AI.

## Kết quả mong đợi

STOP ưu tiên, mất kết nối dừng, giới hạn cơ khí/tốc độ có hiệu lực trên MCU, không PWM từ LLM.

## Debug thường gặp

Nguồn sụt, servo kẹt, reset MCU, chậm ACK, mức logic sai; xử lý phần điện/cơ khí trước.

## Hardware cần mua

Theo HARDWARE-PLAN.md; mua chỉ khi được giao và thông số đã chốt.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
