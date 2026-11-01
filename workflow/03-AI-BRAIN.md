> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 03 — Backend và AI thật

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Demo và persona đã có. Cần provider/model khả dụng và key trong môi trường server để thử API thật. Mặc định xem xét Gemini free tier; người dùng có thể chọn Ollama local.

## Thực hiện

1. Kiểm tra tài liệu chính thức hiện hành của provider, model, SDK và free tier trước khi lựa chọn.
2. Tạo AIProvider và một adapter; không xây nhiều adapter khi chưa cần.
3. Tạo backend TypeScript và POST /api/chat. Key chỉ tồn tại phía server.
4. Tạo `.env.example`, hướng dẫn cấu hình local và lệnh chạy frontend/backend.
5. Server quản lý persona và ngữ cảnh nhiều lượt có giới hạn, tách theo phiên.
6. Chuẩn hóa và validate text/emotion/action; giới hạn input, timeout, hủy request, lỗi quota và lỗi mạng.
7. Duy trì Demo không key; không âm thầm giả phản hồi Demo là AI thật.
8. Test adapter/endpoint với dữ liệu giả lập: lỗi, dữ liệu sai, phiên độc lập và timeout. Khi có key, thử hội thoại thật khoảng 10 lượt.

## Hoàn thành

API thật hoạt động, giữ ngữ cảnh và tính cách; test/typecheck/build đạt; không lộ key ở frontend. Nếu thiếu key hoặc dịch vụ không khả dụng, lưu `waiting_input` và chỉ rõ kiểm tra thật còn thiếu.

Bàn giao `04-MEMORY.md`.
