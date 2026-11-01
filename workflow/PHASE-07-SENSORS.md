# Phase 07 — Camera và sensors

## Mục tiêu và đầu vào

Robot để bàn và safety đã ổn. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

Sensor → event manager → context → policy → speak/ignore/action; quiet hours, cooldown và opt-in.

## Cài đặt

Chỉ cài driver/model cho sensor đã chọn, xác minh license. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

sensor adapters, event manager, presence và schedule policy. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Thử presence giả, lặp event, im lặng ban đêm, tắt chủ động; không tự lưu hình/giọng.

## Kết quả mong đợi

Robot biết không nói, không spam, mất sensor không sinh hành động nguy hiểm; nhận diện không bị coi là xác thực.

## Debug thường gặp

False positives, camera permissions, ánh sáng, privacy, event storm.

## Hardware cần mua

Camera/distance/IMU tùy mục tiêu, cập nhật BOM trước.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
