# Phase 03 — Personality nhất quán

## Mục tiêu và đầu vào

Phase 2 chạy thật; không làm mất bộ đánh giá Phase 1. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

Base traits + current emotion + relationship + relevant memories + situation + context → LLM; một lượt gọi.

## Cài đặt

Không thêm training framework; dùng cấu hình hiện có. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

config/personality.json, server/persona.ts; thêm preset/selector chỉ khi cần. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Chạy bộ 30 câu và hội thoại nhiều lượt; so cùng model/context.

## Kết quả mong đợi

Giữ xưng hô, ngắn gọn, không cà khịa khi người dùng cần đồng cảm; ghi điểm và lỗi.

## Debug thường gặp

Style trôi, lặp câu cửa miệng, quá lạnh lùng, khen xã giao; sửa ví dụ trước fine-tune.

## Hardware cần mua

Không mua.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
