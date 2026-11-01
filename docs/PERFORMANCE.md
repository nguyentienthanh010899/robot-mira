# Đo hiệu năng local — 01/11/2026

Máy Apple M2, RAM 16 GiB, macOS 13.4. Qwen3.5 GGUF đang dùng CPU vì backend GPU gặp lỗi; VieNeu v3 Turbo ONNX fp32 CPU. Không gọi API trả phí.

| Phép đo | Kết quả |
| --- | --- |
| Chỉ LLM Nhanh 2B, streaming văn bản | Text đầu 0.274–3.407 giây; hoàn tất 24.881–25.315 giây, 624–695 ký tự |
| TTS riêng, câu “Chào bạn, mình là MIRA.” | Audio đầu 2.162 giây; xử lý toàn bộ 11.388 giây; audio dài 1.76 giây |
| LLM và TTS đồng thời, trước giới hạn threads | Text đầu 12.550 giây; audio đầu 22.076 giây; text hoàn tất 90.739 giây |
| LLM 4 threads và TTS 2 threads, đồng thời | Text đầu 12.214 giây; câu đầu 16.317 giây; audio đầu 19.560 giây; text hoàn tất 71.997 giây, 565 ký tự |

Đây là các lượt thử nhỏ, khác cache/nhiệt độ/tải máy; không suy ra p50/p95 hoặc quan hệ nhân quả từ hai cấu hình threads. Audio đầu là PCM tới HTTP client, chưa gồm STT, trình duyệt hay loa. Streaming cho phép đọc câu đã có nhưng CPU hiện sinh giọng chậm hơn thời gian thực nên vẫn có khoảng ngắt giữa các đoạn. Không quảng cáo phản hồi giọng trong 1–2 giây.

File đo nằm ở data/brain-benchmark.json, data/voice-benchmark.json và data/conversation-check.json; data không đưa vào Git. Chạy lại bằng npm run brain:benchmark; khi API thử đang ở 3901 có thể chạy scripts/check-voice.mjs và scripts/check-conversation.mjs theo tham số trong file.

Giọng mẫu ở data/voice-preview.wav và data/voice-stream-preview.wav. Chưa nghe đánh giá chất lượng hoặc đo độ chính xác câu trả lời. Câu trả lời dài hơn không bảo đảm đúng hơn; model nhỏ có thể diễn đạt yếu hoặc bịa dữ kiện.

Đã thêm lựa chọn độ dài, model và giọng để tự cân đối. Chất lượng 4B giữ structured output/kiểm tra action; Nhanh dùng lời nói streaming và không phát action phần cứng. Các chức năng này chưa phải nghiệm thu toàn bộ robot hoặc STT offline.

Đã tải thêm qwen3:1.7b để thử backend GPU thông thường. Lượt inference num_gpu=99 cũng thất bại HTTP 500 GGML_ASSERT(buf_dst). Không chuyển cấu hình mặc định sang model này; chưa nghiệm thu CPU cho nó. Không tiếp tục tải model khác trong lượt này.

## Sửa giọng ngắt giữa từ — 01/11/2026

Player hiện đợi tải xong toàn bộ PCM của từng câu rồi mới lập lịch phát liên tục. Không phát từng mẩu ngay khi tới vì CPU sinh giọng chậm hơn thời gian thực. Text vẫn streaming; có thể chờ lâu hơn trước mỗi câu và vẫn có khoảng đợi giữa các câu. Số đo audio đầu HTTP trước đây không phải thời điểm loa bắt đầu phát với cơ chế đệm mới. Chưa nghe nghiệm thu trực tiếp trên trình duyệt.

## Sửa sau phản hồi nghe giật và nội dung khó hiểu — 01/11/2026

Bản cũ đệm riêng từng câu rồi phát xong mới yêu cầu câu kế tiếp, nên CPU sinh giọng chậm tạo khoảng im lặng dài. Bản hiện tại đợi hoàn tất văn bản, tạo audio cho toàn bộ đoạn (chia request tối đa 500 ký tự), kiểm tra mọi đoạn hoàn tất rồi mới lập lịch phát nối tiếp. Không synthesize trong lúc đang phát. Đánh đổi: thời gian chờ trước khi nói dài hơn; không tuyên bố đã tăng tốc model hoặc đạt realtime. Không tự cắt ngắn câu trả lời dài người dùng đã chọn.

Prompt đã sửa: đệ chỉ AI, đại ca chỉ người dùng; tiếng Việt hiện đại, lời chào một lần, giảm cổ văn/ẩn dụ và không đùa khi an ủi. Không chỉ đổi lời mở đầu rồi coi nội dung đã đúng. Chưa có bằng chứng nghe loa tự nhiên/rõ tiếng; phải thử trên thiết bị thực tế.

Tiêu chí nghiệm thu mới: (1) hiện toàn bộ text trước khi nói, (2) không phát khi bất kỳ request TTS nào chưa hoàn tất, (3) audio giữa các đoạn được lập lịch liên tiếp, (4) Hủy dừng cả tải và phát, (5) model thật không lẫn đại ca/đệ và trả lời đúng trọng tâm. Đo riêng thời gian AI, tổng tạo audio và lúc loa bắt đầu; không lấy audio chunk đầu HTTP làm độ trễ nghe. Test ít nhất câu buồn, câu chào, câu hỏi kiến thức và đoạn hơn 500 ký tự. Khi chưa đạt ghi rõ, không đánh dấu phase hoàn tất.
