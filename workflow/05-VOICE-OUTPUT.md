> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 05 — Giọng nói đầu ra

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Vòng chat hoạt động; có trình duyệt macOS để thử phát âm thanh.

## Thực hiện

1. Tạo dịch vụ SpeechOutput: phát, dừng, trạng thái và lỗi.
2. Kiểm tra giọng vi-VN thực tế; thử speechSynthesis khi có giọng phù hợp, không giả định mọi Mac đều có.
3. Nếu cần provider khác, xác minh tiếng Việt, giấy phép và chi phí trước khi dùng; không bật dịch vụ trả phí.
4. Thêm bật/tắt tiếng, nút dừng, xử lý hàng đợi và tránh phát chồng.
5. Cập nhật speaking theo sự kiện âm thanh, không chỉ theo lúc nhận text.
6. Giữ text hiển thị khi TTS không khả dụng. Kiểm tra lỗi, hủy và kết thúc với test phù hợp, sau đó nghe thử thực tế.

## Hoàn thành

Đọc được phản hồi tiếng Việt trên trình duyệt đã ghi nhận; dừng được; trạng thái về đúng khi lỗi/kết thúc. Chưa nghe thử thực tế thì ghi phần còn thiếu, không khẳng định chất lượng đạt.

Bàn giao `06-VOICE-INPUT.md`.
