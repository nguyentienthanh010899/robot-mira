> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 09 — Adapter phần cứng và robot thật

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

MIRA trên Mac đã được kiểm tra. Phần giả lập không cần thiết bị; phần thật cần xác định bo mạch, servo, nguồn, giới hạn cơ khí và cách kết nối.

## Phần A — Giả lập

1. Tạo HardwareAdapter: connect, disconnect, getStatus, executeAction.
2. Triển khai adapter giả lập, hiển thị hành động và kết nối trên UI.
3. Whitelist turn_head_left, turn_head_right, wave_hand, stop; validate mọi đề xuất AI.
4. Mô phỏng timeout, mất kết nối, xác nhận lệnh và dừng; kiểm tra tự động.

## Phần B — Thiết bị thật

1. Chỉ tiếp tục khi có thông số thiết bị và người dùng giao việc tích hợp thực tế; không tự mua hoặc suy đoán chân đấu/nguồn điện.
2. Xây firmware và giao thức REST/WebSocket theo phần cứng đã xác định.
3. Firmware thực thi giới hạn góc/tốc độ, timeout, xác nhận và trạng thái an toàn khi mất kết nối.
4. AI chỉ đề xuất hành động trong danh sách; không gửi PWM/góc servo tùy ý.
5. Thử từng cơ cấu trong giới hạn trước khi nối vào hội thoại. Ghi kết quả thật và cách dừng robot.

## Hoàn thành

Ghi riêng kết quả giả lập và thiết bị thật. Chỉ đánh dấu toàn workflow done sau khi lệnh hợp lệ chạy đúng, lệnh sai bị chặn và mất kết nối dừng an toàn trên thiết bị đã chọn. Nếu mới có giả lập, lưu checkpoint chờ thông số/phần cứng; không coi là robot thật đã chạy.
