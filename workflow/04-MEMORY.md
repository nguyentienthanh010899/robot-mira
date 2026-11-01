> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 04 — Lịch sử và trí nhớ

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

AI Brain có quản lý phiên và hội thoại nhiều lượt.

## Thực hiện

1. Tách persona, ngữ cảnh ngắn hạn và trí nhớ dài hạn.
2. Giới hạn số lượt/kích thước ngữ cảnh để tránh tăng prompt vô hạn.
3. Cho phép người dùng chủ động lưu tên, sở thích hoặc thông tin cần nhớ; không tự lưu mọi câu nói.
4. Dùng SQLite khi cần giữ dữ liệu qua khởi động lại; chọn thư viện tương thích môi trường hiện có.
5. Thêm xem/xóa trí nhớ, xóa lịch sử và tạo phiên mới; gắn dữ liệu với đúng phiên/người dùng.
6. Không mặc định ghi âm thanh hoặc toàn bộ hội thoại vào log.
7. Kiểm tra lưu/đọc/xóa, khởi động lại và không trộn dữ liệu giữa các phiên.

## Hoàn thành

Thông tin đã lưu được nhớ đúng và xóa được; giới hạn ngữ cảnh có hiệu lực; kiểm tra phù hợp đạt. Ghi rõ bản local có hay chưa có xác thực; chưa triển khai công khai.

Bàn giao `05-VOICE-OUTPUT.md`.
