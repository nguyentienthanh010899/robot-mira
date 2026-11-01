# Phase 09 — Thu nhỏ

## Mục tiêu và đầu vào

Robot di chuyển đã đạt và có số đo compute/điện/nhiệt. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

A local nhỏ 0.8–2B hoặc B client/server LAN; so chất lượng, độ trễ, pin và kích thước.

## Cài đặt

Chỉ đổi runtime/board sau benchmark; có regression test. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

Deployment config, resource limits, thermal/battery monitoring và packaging. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Đo RSS, nhiệt, thời lượng pin và latency dài hạn trong vỏ thực tế.

## Kết quả mong đợi

Chốt tradeoff rõ; không gọi client cần server là hoàn toàn độc lập.

## Debug thường gặp

Thermal throttle, pin hụt, loa hồi tiếp, chất lượng model nhỏ giảm.

## Hardware cần mua

Board/vỏ/pin mới sau báo giá, không bảo đảm ngân sách prototype vẫn giữ nguyên.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
