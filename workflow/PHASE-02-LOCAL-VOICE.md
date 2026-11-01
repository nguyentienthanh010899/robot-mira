> Cập nhật 01/11/2026 theo yêu cầu giọng tự nhiên hơn: đã tích hợp VieNeu-TTS v3 Turbo local thay cho baseline Piper dự kiến; có 25 preset và audio streaming. Xem speech/README.md và docs/TESTING.md. STT vẫn là browser opt-in, chưa local VAD/Whisper; không cài lại TTS hoặc đánh dấu toàn phase done chỉ vì đã tạo WAV.

# Phase 02 — Voice offline

## Mục tiêu và đầu vào

Local Brain đã nghiệm thu. Đọc MASTER.md và STATE.md; không nhảy qua nghiệm thu phase trước.

## Kiến trúc

Micro → Silero VAD → whisper.cpp multilingual → LLM → Piper Việt → loa; Python service tách khỏi UI. Thử VieNeu v3 Turbo sau baseline và kiểm tra license checkpoint.

## Cài đặt

Cài từng runtime/model từ nguồn chính thức vào môi trường riêng, pin phiên bản; không cài mọi ứng viên. Kiểm tra tài liệu chính thức hiện hành trước khi đưa lệnh, giải thích mỗi lệnh làm gì.

## Mã cần viết/sửa

speech/vad, speech/stt, speech/tts và adapter controller khi thật sự triển khai; giữ browser voice opt-in để so sánh. Khi sửa, nêu file/vị trí, hành vi cũ/mới và lý do; chỉ triển khai phần đang làm.

## Chạy thử

Thu các câu Việt có transcript chuẩn, thử nút nói trước rồi endpointing; thử không WAN.

## Kết quả mong đợi

Nghe/nói Việt offline trên máy thật, có dừng và fallback rõ; đo STT final, first audio, CPU/RAM.

## Debug thường gặp

Mic không có quyền, sample rate sai, nhiễu/echo, ASR nhầm, giọng TTS thiếu hoặc phát bị chặn.

## Hardware cần mua

Không mua; dùng micro/loa Mac trước.

## Xác nhận

Chạy test phù hợp, ghi số đo/kết quả thật và phần chưa kiểm chứng trong TESTING.md/STATE.md. Chỉ chuyển phase khi tiêu chí đã đạt. Không xem test mock là nghiệm thu thiết bị.
