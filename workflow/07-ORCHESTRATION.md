> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 07 — Điều phối hội thoại và biểu cảm

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Chat, TTS, STT và khuôn mặt đã có.

## Thực hiện

1. Tạo bộ điều phối idle/listening/thinking/speaking/error; tách khỏi sáu cảm xúc.
2. Gắn ID cho mỗi lượt, bỏ phản hồi cũ khi hủy hoặc bắt đầu lượt mới.
3. Validate cảm xúc do AI gợi ý và chọn biểu cảm dự phòng.
4. Đồng bộ miệng theo biên độ nếu truy cập được audio; nếu không, dùng nhịp gần đúng và ghi rõ giới hạn.
5. Dừng hoạt ảnh nói khi âm thanh dừng/lỗi. Không tạo vòng nhận tiếng robot.
6. Nút ngắt lời phải dừng phát và hủy tác vụ liên quan; chỉ thêm ngắt bằng giọng khi stack hỗ trợ và đã thử.
7. Test chuyển trạng thái, hủy, phản hồi đến muộn, phát lỗi và gửi nhiều lượt nhanh.

## Hoàn thành

Không kẹt trạng thái, không phát chồng, không dùng phản hồi đã hủy; khuôn mặt theo đúng trạng thái và cảm xúc. Test/typecheck/build đạt.

Bàn giao `08-VALIDATION.md`.
