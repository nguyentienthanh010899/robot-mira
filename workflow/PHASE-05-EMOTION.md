# Phase 05 — Emotion state

## Mục tiêu và đầu vào

Memory và phiên/người dùng đã ổn. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

State happiness/sadness/annoyance/energy/trust/attachment/curiosity 0..1; event update + clamp + decay → lời nói/giọng/mặt.

## Cài đặt

Dùng code thuần trước; không thêm sentiment model khi chưa cần. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

brain/emotion, mapping voice_style/expression; giữ reaction từ khóa như heuristic có giới hạn. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Chạy chuỗi event khen/chê/buồn/im lặng, kiểm tra clamp, decay, reset và không lẫn người.

## Kết quả mong đợi

Cảm xúc mô phỏng nhất quán, không nhảy loạn; không can thiệp lệnh dừng hoặc quyền xóa.

## Debug thường gặp

Keyword phủ định, quá nhạy, state tích lũy vô hạn, TTS không hỗ trợ style; không giả là đo cảm xúc thật.

## Hardware cần mua

Không mua.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
