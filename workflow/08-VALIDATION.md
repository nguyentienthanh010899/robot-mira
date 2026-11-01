> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 08 — Kiểm tra toàn bộ MIRA trên Mac

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Vòng hội thoại, trí nhớ, giọng nói và điều phối đã tích hợp.

## Thực hiện

1. Chạy typecheck, test, build và lint nếu có; sửa lỗi phát sinh thuộc phạm vi dự án.
2. Thử phiên hội thoại 15–20 phút trên Mac: nói, gõ, đổi chủ đề, nhớ thông tin, dừng tiếng, tạo phiên mới.
3. Thử thiếu key, mất mạng, quota, quyền micro bị từ chối, tab ẩn và giảm chuyển động.
4. Kiểm tra console, request trùng, timer/listener và nguy cơ tăng lịch sử vô hạn.
5. Ghi thời gian nhận dạng, chờ AI và phát tiếng khi đo được; không bịa số đo.
6. Viết `docs/TESTING.md`: cấu hình máy, trình duyệt, model/provider, kết quả thật và giới hạn.
7. Cập nhật README với cách chạy mới nhất.

## Hoàn thành

Các kiểm tra bắt buộc đạt, phiên thử thực tế được ghi nhận và lỗi ảnh hưởng luồng chính đã sửa. Nếu không thể thử micro/trình duyệt thật, ghi `waiting_input` cho phần nghiệm thu đó.

Bàn giao `09-HARDWARE.md` khi người dùng muốn kết nối robot.
