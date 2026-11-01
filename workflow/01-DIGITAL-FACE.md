> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 01 — Digital Face và hội thoại Demo

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Setup hoàn tất; frontend chạy được. Không cần AI thật.

## Thực hiện

1. Dựng giao diện tối, cyan, responsive theo `docs/robot.md`.
2. Vẽ khuôn mặt SVG có mắt, đồng tử, phản sáng, mí mắt, lông mày, mũi, miệng và má.
3. Triển khai sáu cảm xúc có hình dạng khác nhau: happy, curious, surprised, sad, angry, thinking.
4. Thêm chớp mắt ngẫu nhiên, nhìn quanh, chuyển cảm xúc và hoạt ảnh nói demo.
5. Dọn timer/listener; giảm chuyển động khi tab ẩn và theo `prefers-reduced-motion`.
6. Tạo conversationEngine riêng trả dữ liệu có kiểu; thêm ô chat và phản hồi mẫu, ghi rõ Demo.
7. Kiểm tra chức năng cốt lõi: đổi cảm xúc, chat, vòng đời timer và chế độ giảm chuyển động nếu phù hợp.

## Hoàn thành

Đạt toàn bộ tiêu chí 0.1 trong `docs/robot.md`. Chạy test, typecheck, build và lint nếu có. Thử giao diện thực tế nếu môi trường hỗ trợ; ghi rõ phần chưa thử.

Bàn giao `02-PERSONA.md`.
