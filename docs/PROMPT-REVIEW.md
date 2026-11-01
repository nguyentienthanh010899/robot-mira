# Đánh giá prompt và phạm vi chỉnh dự án

Ngày đối chiếu: 31/10/2026. Nguồn mới được lưu nguyên văn ở ROBOT-PROMPT.md.

## Quyết định thay thế yêu cầu cũ

Ưu tiên mới: local AI, free/open-weight có license phù hợp, riêng tư, prototype để bàn ≤5.000.000 VNĐ. Robot độc lập là đích đến; dùng Mac/PC server trong giai đoạn phát triển chỉ là bước trung gian. Cloud là tùy chọn chủ động, không tự fallback khi local lỗi. Trải nghiệm cuối là nói chuyện, dù Phase 1 dùng văn bản để kiểm chứng bộ não độc lập với âm thanh.

Giữ React/SVG và các adapter đã chạy, không viết lại toàn bộ bằng Python chỉ vì prompt đưa ví dụ cấu trúc Python. Dịch vụ speech local ở phase sau có thể dùng Python; firmware dùng C/C++. Quyết định viết lại controller chỉ sau khi đo và thấy cần.

## Những điểm cần chỉnh trong prompt

1. Pipeline tuyến tính LLM → Personality → Memory chưa đúng cho truy xuất ngữ cảnh: personality, memory liên quan và trạng thái cảm xúc phải đi vào prompt trước inference; cập nhật memory/cảm xúc sau lượt. Không cần gọi nhiều LLM cho mỗi lớp.
2. “Local/free/open source” là ba thuộc tính riêng. Runtime, checkpoint, dữ liệu và voice có thể khác license. Không mặc định model tải được là dùng thương mại được.
3. <1–2 giây là mục tiêu đo, không phải cam kết trên SBC CPU hoặc mọi câu tiếng Việt. Phải phân biệt cold start, first token, first audio và thời gian phát hết câu.
4. Model mới nhất/lớn nhất không tự động tốt nhất cho robot. So sánh cùng bộ câu Việt, context, quantization và thiết bị; không lấy benchmark GPU làm tốc độ Raspberry Pi.
5. Robot một nắm tay + local LLM + emotional TTS + pin lâu + ≤5 triệu là nhiều ràng buộc cạnh tranh. Chốt prototype để bàn trước, chưa hứa phiên bản thu nhỏ đạt cùng chất lượng.
6. Cảm xúc/trust/attachment là biến mô phỏng; không phải phép đo tâm lý hoặc cảm xúc thật. Người dùng có quyền reset/xóa memory.
7. Trí nhớ dài hạn cần lựa chọn lưu, nguồn gốc, thời gian, chống lẫn người và xóa. Nhận diện bằng camera/giọng nói chưa phải xác thực an toàn.
8. Giọng nhân vật, voice cloning và điều khiển cảm xúc là ba tính năng riêng. Dùng sample tự thu hoặc có quyền sử dụng; chưa fine-tune ở MVP.
9. Ngắt lời tự nhiên cần VAD + chống vọng âm; VAD không tự thay thế AEC. Nút nhấn để nói là bước kiểm chứng trước full-duplex.
10. LLM chỉ đề xuất action. Desktop V1 không bật di chuyển. Firmware và nút dừng phải đảm bảo giới hạn ngay cả khi AI/backend lỗi.

## Đối chiếu mã hiện có

| Phần | Hiện trạng | Điều chỉnh |
| --- | --- | --- |
| UI/khuôn mặt | Có SVG, cảm xúc, mic và transcript dự phòng | Giữ |
| AI | Demo + Ollama + Gemini + Groq | Ưu tiên local, cloud opt-in |
| Personality | Một chuỗi prompt vui vẻ | Tách cấu hình nhân vật và bộ dựng prompt, theo phong cách bình tĩnh/cà khịa nhẹ |
| Voice | STT/TTS trình duyệt, có thể cần mạng | Ghi rõ chế độ thử, không gọi là offline; phase 2 thay bằng local VAD/STT/TTS |
| Emotion | Từ khóa + cảm xúc AI | Giữ bản mô phỏng; phase 5 thêm state 0..1, decay và tách theo người/phiên |
| Memory | Lịch sử tab tối đa 10 cặp | Chưa có persistent memory; phase 4 SQLite và retrieval có giới hạn |
| Action | Chỉ idle | Phase 1 chuẩn hóa output; phase 6 mới validate/dispatch tới MCU |
| Đo đạc | Chưa có số đo inference local | Phase 1 thêm kiểm tra local và thống kê; chưa suy diễn first audio |

## Phạm vi thực hiện phiên này

Nghiên cứu và tài liệu quyết định trước, sau đó sửa nền Phase 1 Local AI Brain, cấu hình local/cloud và personality. Không triển khai tất cả mười phase trong một lượt. Chưa tự cài ứng dụng hệ thống, tải nhiều GB model, mua phần cứng hoặc fine-tune. Ghi rõ bước cần chạy trên máy để hoàn tất nghiệm thu thật.
