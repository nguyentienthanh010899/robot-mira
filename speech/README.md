# Giọng Việt local cho MIRA

Backend: VieNeu-TTS **3.8.3**, v3 Turbo ONNX CPU fp32, 48kHz, 2 threads mặc định (đổi MIRA_TTS_THREADS nếu đã benchmark). Không dùng VieNeu v4/API trả phí. Không cần tài khoản/API key để chạy model public đã tải.

## Máy hiện tại

Đã cài môi trường `.venv-speech` bằng Python 3.11, tải weights và tạo `data/voice-preview.wav`. Có 25 preset gồm Hải Đăng, Mai Anh, Trúc Ly, Thùy Dung… Bạn cần nghe để chọn; chưa có đánh giá nghe thực tế của người dùng.

Dừng dev cũ bằng Ctrl+C trong terminal đang chạy nó, sau đó:

```sh
npm run dev:voice
```

Lệnh mở backend + Vite + giọng local ở 127.0.0.1:3002. Mặc định service dùng cache offline; nếu thiếu weights sẽ báo lỗi thay vì gọi API trả phí. Mở URL Vite in ra. Chọn **Giọng Việt local**, chọn preset, bấm **Nghe lại**. Nếu giọng chưa sẵn sàng lúc trang tải, đợi service báo ready rồi bấm **Làm mới giọng**.

Giọng trả lời local không yêu cầu bật giọng trình duyệt. Nút micro hiện vẫn dùng Web Speech API và cần bạn bật checkbox cho phép; audio đầu vào có thể được xử lý bởi dịch vụ trình duyệt. STT offline là việc riêng, chưa triển khai ở thay đổi này.

## Cài lại trên checkout/máy khác

```sh
python3.11 -m venv .venv-speech
.venv-speech/bin/python -m pip install -r speech/requirements.txt
npm run speech:prepare
npm run dev:voice
```

Lệnh prepare tải model một lần từ nguồn public vào data/huggingface và tạo WAV mẫu. Cần Internet và dung lượng ổ đĩa cho lần đầu, không mất phí token/thuê bao. `requirements-macos.lock` là snapshot dependency đã cài trên Mac hiện tại; requirements.txt pin SDK, không bảo đảm cùng wheel trên mọi OS. Không dùng Python 3.15 mặc định của máy cho môi trường này khi chưa xác minh các native dependency.

## Pipeline

LLM stream → bộ chia câu/đoạn tối đa 280 ký tự → Node /api/speech/stream → Python ONNX infer_stream → PCM16/48kHz → Web Audio. Không gửi nội dung sang cloud TTS. Có endpoint WAV /api/speech để kiểm tra hoặc xuất audio. Model chỉ tạo text, không quyết định URL/path được đọc hoặc chạy lệnh hệ điều hành.

Các event audio có rate/kích thước giới hạn. Cancel hủy fetch, dừng audio source đã lập lịch và bỏ callback cũ. Python có thể cần tới lần ghi chunk kế tiếp để nhận thấy client ngắt; không cam kết ngừng compute ngay lập tức. Mouth theo trạng thái phát âm thanh gần đúng, chưa âm vị.

Do LLM và TTS cùng dùng CPU, giọng có thể có khoảng nghỉ giữa chunk khi không sinh kịp thời gian thực. Streaming giảm thời gian tới âm thanh đầu, không làm tổng compute biến mất. Có thể chọn giọng trình duyệt nếu cần so sánh, hoặc Tắt tiếng; không tự chuyển sang nhà cung cấp tính phí.

## Đo và nghe thử

Sau khi dev đang mở:

```sh
node scripts/check-voice.mjs
```

Script gọi local proxy, đo first PCM chunk/total, xác nhận dữ liệu không im lặng và lưu data/voice-stream-preview.wav. Không đo độ trễ microphone→loa hoặc chất lượng tự nhiên bằng tai. Không so con số CPU Mac với benchmark GPU tác giả.

Nguồn: [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS), [streaming upstream](https://github.com/pnnbao97/VieNeu-TTS/blob/main/docs/streaming.md), [model v3 Turbo](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo). Code upstream Apache-2.0; kiểm tra license/attribution của checkpoint, codec và voice khi phân phối. V4 proprietary không được sử dụng ở đây.

Hiện chưa có import/clone voice cá nhân; preset là bước đầu để chọn giọng và kiểm tra latency. Không nhầm preset/style với điều khiển cảm xúc hoặc cloning đã triển khai.

## Sửa giọng ngắt giữa từ — 01/11/2026

Player hiện đợi tải xong toàn bộ PCM của từng câu rồi mới lập lịch phát liên tục. Không phát từng mẩu ngay khi tới vì CPU sinh giọng chậm hơn thời gian thực. Text vẫn streaming; có thể chờ lâu hơn trước mỗi câu và vẫn có khoảng đợi giữa các câu. Số đo audio đầu HTTP trước đây không phải thời điểm loa bắt đầu phát với cơ chế đệm mới. Chưa nghe nghiệm thu trực tiếp trên trình duyệt.

## Sửa sau phản hồi nghe giật và nội dung khó hiểu — 01/11/2026

Bản cũ đệm riêng từng câu rồi phát xong mới yêu cầu câu kế tiếp, nên CPU sinh giọng chậm tạo khoảng im lặng dài. Bản hiện tại đợi hoàn tất văn bản, tạo audio cho toàn bộ đoạn (chia request tối đa 500 ký tự), kiểm tra mọi đoạn hoàn tất rồi mới lập lịch phát nối tiếp. Không synthesize trong lúc đang phát. Đánh đổi: thời gian chờ trước khi nói dài hơn; không tuyên bố đã tăng tốc model hoặc đạt realtime. Không tự cắt ngắn câu trả lời dài người dùng đã chọn.

Prompt đã sửa: đệ chỉ AI, đại ca chỉ người dùng; tiếng Việt hiện đại, lời chào một lần, giảm cổ văn/ẩn dụ và không đùa khi an ủi. Không chỉ đổi lời mở đầu rồi coi nội dung đã đúng. Chưa có bằng chứng nghe loa tự nhiên/rõ tiếng; phải thử trên thiết bị thực tế.

Tiêu chí nghiệm thu mới: (1) hiện toàn bộ text trước khi nói, (2) không phát khi bất kỳ request TTS nào chưa hoàn tất, (3) audio giữa các đoạn được lập lịch liên tiếp, (4) Hủy dừng cả tải và phát, (5) model thật không lẫn đại ca/đệ và trả lời đúng trọng tâm. Đo riêng thời gian AI, tổng tạo audio và lúc loa bắt đầu; không lấy audio chunk đầu HTTP làm độ trễ nghe. Test ít nhất câu buồn, câu chào, câu hỏi kiến thức và đoạn hơn 500 ký tự. Khi chưa đạt ghi rõ, không đánh dấu phase hoàn tất.
