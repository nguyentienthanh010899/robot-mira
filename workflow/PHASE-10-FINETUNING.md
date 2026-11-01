# Phase 10 — Fine-tune nếu thật sự cần

## Mục tiêu và đầu vào

Hệ ổn định và có lỗi style/voice được đo mà prompt/memory chưa giải quyết. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

LoRA/QLoRA cho style LLM hoặc training TTS cho voice là hai bài toán riêng; không train từ đầu.

## Cài đặt

Chọn một trong MLX LoRA/Unsloth/LlamaFactory/Axolotl theo model/hardware, pin recipe. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

Dataset JSONL có quyền dùng, split theo chủ đề, training config và eval report; chưa tạo dataset bịa bằng cách lặp câu. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

So model nền với adapter cùng bộ test độc lập và quantization; kiểm tra regression reasoning/JSON/safety.

## Kết quả mong đợi

Cải thiện đo được, không memorization dữ liệu riêng, license hợp lệ, có rollback; nếu không cần thì ghi skipped có lý do.

## Debug thường gặp

Overfit, style lặp, giảm tiếng Việt/JSON, OOM và license checkpoint.

## Hardware cần mua

Không tự thuê GPU hoặc phát sinh phí; chọn tài nguyên đã được cho phép.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
