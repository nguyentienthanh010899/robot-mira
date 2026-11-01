> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 06 — Nhận giọng nói

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Chat và TTS đã hoạt động; cần quyền micro và thiết bị thử thực tế.

## Thực hiện

1. Tạo SpeechInput độc lập; bắt đầu bằng nhấn nút để nói.
2. Xác minh hỗ trợ tiếng Việt trên trình duyệt đích. Đánh giá Web Speech API trước; nếu không phù hợp, xem xét Whisper local hoặc STT có free quota.
3. Giữ key phía server nếu dùng cloud; ghi rõ âm thanh được xử lý local hay gửi dịch vụ ngoài.
4. Hiển thị văn bản nhận dạng và trạng thái listening.
5. Xử lý từ chối micro, im lặng, lỗi, hủy và kết quả trùng; giữ phương án nhập bàn phím.
6. Dừng TTS trước khi mở micro để tránh robot nghe lại chính nó.
7. Thử nhiều câu tiếng Việt thực tế, ghi kết quả và hạn chế. Chưa triển khai nghe nền liên tục.

## Hoàn thành

Nhấn nói → nhận văn bản → AI trả lời → phát tiếng hoạt động; không gửi trùng lượt. Thiếu micro/quyền thử thì lưu phần chưa kiểm chứng.

Bàn giao `07-ORCHESTRATION.md`.
