# Phase 04 — Trí nhớ có kiểm soát

## Mục tiêu và đầu vào

Personality đã được đánh giá; có nhận diện phiên/người dùng rõ. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

SQLite short-term/episodic/semantic/relationship; extraction candidates → consent/provenance → lưu; retrieval top-k trước LLM.

## Cài đặt

Chọn SQLite binding phù hợp runtime; chỉ thêm embedding khi keyword/FTS không đủ. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

brain/memory hoặc server/memory; migration, retention, xem/xóa và giới hạn context. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Lưu sở thích được cho phép, khởi động lại, hỏi lại, đổi người, xóa rồi hỏi lại.

## Kết quả mong đợi

Nhớ đúng, không trộn người, xóa thực sự, không lưu toàn bộ conversation vào prompt.

## Debug thường gặp

Sai facts, stale memory, injection trong memory, mất dữ liệu khi restart; kiểm tra source và migration.

## Hardware cần mua

Không mua; dùng ổ hiện có.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
