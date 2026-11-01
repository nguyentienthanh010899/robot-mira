> Tham khảo workflow web cũ. Thứ tự hiện hành dùng PHASE-01…PHASE-10 trong README.md; ưu tiên local-first theo docs/robot.md.

# 00 — Setup

Đọc `MASTER.md` và cập nhật `STATE.md` theo quy trình chung.

## Đầu vào

Workspace hiện tại và `docs/robot.md`. Không cần API key.

## Thực hiện

1. Khảo sát repository, hướng dẫn nội bộ, Node.js, npm, macOS và cấu hình Mac có thể đọc được.
2. Giữ mã đã có. Nếu chưa có, khởi tạo React + TypeScript + Vite tương thích với Node hiện tại.
3. Tạo cấu trúc tối thiểu cho UI, engine, services và types khi thực sự dùng đến.
4. Viết `docs/ARCHITECTURE.md`, `docs/ROADMAP.md` và README với lệnh cài đặt/chạy/kiểm tra thực tế.
5. Thiết lập script build, typecheck và test; bổ sung lint nếu phù hợp.
6. Kiểm tra quy tắc bỏ qua dependency, file môi trường chứa secret và output build trong Git.

## Hoàn thành

Ứng dụng khởi động và build được; typecheck đạt; README đủ để chạy lại. Không tạo test chỉ để kiểm tra một trang giữ chỗ.

Ghi kết quả và bàn giao bước `01-DIGITAL-FACE.md`.
