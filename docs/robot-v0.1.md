# MASTER PROMPT — BUILD MIRA AI

## 1. Vai trò

Bạn là kỹ sư phần mềm cấp cao, chuyên về AI hội thoại, giao diện hoạt hình, xử lý giọng nói và hệ thống robot nhúng.

Hãy trực tiếp xây dựng dự án **MIRA AI** trong workspace hiện tại. Không chỉ giải thích hoặc đưa ví dụ; hãy tạo file, viết mã nguồn, cài đặt dependency cần thiết, chạy ứng dụng và kiểm thử trong phạm vi môi trường cho phép.

Nếu workspace đã có mã nguồn, hãy kiểm tra trước và giữ lại các phần đang hoạt động. Không ghi đè tùy tiện.

## 2. Tầm nhìn sản phẩm

MIRA là robot AI đồng hành có khả năng:

- Trò chuyện bằng tiếng Việt tự nhiên.
- Hiển thị khuôn mặt hoạt hình với mắt, mũi, miệng và lông mày.
- Chớp mắt, nhìn quanh và thay đổi biểu cảm.
- Đồng bộ khẩu hình với giọng nói.
- Phân tích ngữ cảnh hội thoại để chọn cảm xúc phù hợp.
- Về sau kết nối camera, ESP32, servo và cảm biến để thực hiện hành động vật lý.

Thiết bị phát triển hiện tại: MacBook hoặc Mac.

Ưu tiên: công cụ miễn phí, kiến trúc đơn giản, mã nguồn dễ bảo trì, có thể mở rộng thành robot thật.

Không huấn luyện mô hình AI riêng ở giai đoạn đầu.

## 3. Công nghệ mục tiêu

- Frontend: React, TypeScript, Vite.
- Giao diện: CSS responsive, SVG cho khuôn mặt và hoạt ảnh.
- Backend: Node.js với TypeScript khi cần kết nối API AI.
- Kiểm thử: Vitest và React Testing Library nếu phù hợp.
- Giao tiếp phần cứng tương lai: REST hoặc WebSocket qua một lớp adapter riêng.
- Quản lý cấu hình: biến môi trường, có `.env.example`.
- Quản lý phiên bản: Git nếu có sẵn.

Chọn phiên bản package ổn định và tương thích. Không thêm thư viện nếu JavaScript hoặc CSS thuần đã giải quyết tốt yêu cầu.

## 4. Quy tắc làm việc bắt buộc

1. Khảo sát workspace và kiểm tra môi trường trước khi chỉnh sửa.
2. Viết `docs/ROADMAP.md` và `docs/ARCHITECTURE.md`.
3. Chia công việc thành các bước nhỏ, ưu tiên hoàn thành phiên bản chạy được.
4. Sau mỗi phần, chạy kiểm tra phù hợp: lint, typecheck, test và build nếu các script tương ứng tồn tại.
5. Sửa các lỗi phát sinh do phần mã vừa viết trước khi tiếp tục.
6. Không tuyên bố test thành công nếu chưa thực sự chạy và xác nhận kết quả.
7. Không đặt API key trong frontend, source code công khai hoặc Git.
8. Không tự ý mua hàng, tạo tài khoản trả phí hoặc phát sinh chi phí dịch vụ.
9. Nếu dịch vụ AI cần API key, hãy tạo giao diện cấu hình và `.env.example`; vẫn phải có chế độ demo không cần key.
10. Không triển khai tính năng chưa cần thiết chỉ để làm kiến trúc phức tạp hơn.

## 5. Giai đoạn 0.1 — Digital Face

Đây là nhiệm vụ đầu tiên và phải hoàn thành trước khi xây dựng AI thật.

### Giao diện

Tạo giao diện robot hiện đại, thân thiện, nền tối, màu nhấn xanh cyan.

Khuôn mặt phải được vẽ bằng SVG hoặc kỹ thuật đồ họa phù hợp, không phụ thuộc vào ảnh tĩnh.

Các thành phần bắt buộc:

- Hai mắt có tròng mắt, đồng tử và điểm phản sáng.
- Mí mắt và lông mày.
- Mũi tối giản.
- Miệng có nhiều hình dạng.
- Má có thể đổi màu khi vui.
- Hiệu ứng ánh sáng nhẹ.
- Bảng điều khiển cảm xúc.
- Khung hội thoại và ô nhập văn bản.
- Trạng thái hiện tại của robot.

### Sáu trạng thái cảm xúc

Tạo enum hoặc kiểu dữ liệu TypeScript rõ ràng cho:

- `happy`
- `curious`
- `surprised`
- `sad`
- `angry`
- `thinking`

Mỗi trạng thái phải điều khiển đồng bộ mắt, lông mày, miệng, má và nhãn cảm xúc.

Không chỉ thay đổi nhãn hoặc màu sắc; hình dạng khuôn mặt phải thay đổi thực sự.

### Hoạt ảnh

Triển khai:

- Chớp mắt tự nhiên với khoảng thời gian ngẫu nhiên hợp lý.
- Nhìn trái, phải và trở về trung tâm.
- Hiệu ứng suy nghĩ khi đang xử lý.
- Chuyển đổi biểu cảm mượt.
- Chế độ nói với miệng chuyển động.
- Dừng hoặc giảm hoạt ảnh khi tab không hoạt động.
- Hỗ trợ `prefers-reduced-motion`.

Đảm bảo không tạo nhiều timer hoặc event listener trùng lặp sau mỗi lần component render.

### Hội thoại demo

Cho phép người dùng nhập văn bản và nhận phản hồi mẫu.

Tạo một lớp `conversationEngine` riêng để nhận nội dung đầu vào và trả về dữ liệu có cấu trúc gồm câu trả lời, cảm xúc và trạng thái.

Không giả vờ rằng phản hồi mẫu là kết quả của AI thật. Hiển thị rõ chế độ Demo.

## 6. Giai đoạn 0.2 — AI Brain

Sau khi 0.1 hoàn thành và kiểm thử đạt yêu cầu, xây dựng tích hợp AI thực sự.

Yêu cầu:

- Tạo interface `AIProvider`.
- Có adapter cho một nhà cung cấp AI hỗ trợ API hội thoại.
- Cho phép đổi nhà cung cấp mà không phải viết lại giao diện.
- Đọc API key từ biến môi trường phía server.
- Tạo endpoint backend để gửi tin nhắn và nhận phản hồi.
- Xử lý lỗi mạng, timeout, giới hạn sử dụng và phản hồi không hợp lệ.
- Hỗ trợ hội thoại nhiều lượt.
- Hỗ trợ tiếng Việt.
- Giữ chế độ Demo khi không có API key.

Chuẩn hóa kết quả của AI thành một cấu trúc dữ liệu có kiểu, ví dụ:

{
  "text": "Xin chào! Rất vui được gặp bạn.",
  "emotion": "happy",
  "action": "idle"
}

Đây là cấu trúc nội bộ tham khảo, không yêu cầu nhà cung cấp phải trả về chính xác định dạng này. Hãy validate dữ liệu trước khi sử dụng và có fallback an toàn khi đầu ra sai định dạng.

Không cho mô hình AI quyền thực thi trực tiếp lệnh hệ điều hành hoặc điều khiển động cơ tùy ý.

## 7. Giai đoạn 0.3 — Voice

Thiết kế lớp dịch vụ độc lập cho:

- Speech-to-Text.
- Text-to-Speech.
- Phát và dừng âm thanh.
- Trạng thái nghe, suy nghĩ, nói và lỗi.
- Ngắt lời khi người dùng nói trong lúc robot đang phát âm thanh, nếu công nghệ được chọn hỗ trợ.

Ưu tiên phương án miễn phí hoặc có mức sử dụng miễn phí phù hợp. Kiểm tra khả năng hỗ trợ tiếng Việt và trình duyệt macOS trước khi chọn.

Không giả định Web Speech API được hỗ trợ giống nhau trên mọi trình duyệt. Nếu dịch vụ không khả dụng, cung cấp thông báo và phương án nhập văn bản.

Tách lớp đồng bộ khẩu hình khỏi nhà cung cấp TTS. Khi có thông tin thời gian hoặc âm vị từ TTS, có thể dùng thông tin đó để cải thiện độ chính xác. Nếu không có, dùng hoạt ảnh mở miệng theo biên độ âm thanh hoặc nhịp nói như phương án đơn giản.

## 8. Giai đoạn 0.4 — Emotion Engine

Xây dựng bộ quản lý trạng thái cảm xúc có kiểu dữ liệu rõ ràng.

Đầu vào có thể gồm:

- Nội dung phản hồi.
- Trạng thái hội thoại.
- Trạng thái nghe hoặc nói.
- Cảm xúc được mô hình AI đề xuất.

Đầu ra gồm:

- Cảm xúc được chọn.
- Biểu cảm khuôn mặt.
- Cường độ biểu cảm.
- Hoạt ảnh hoặc cử chỉ đề xuất.

Phân biệt trạng thái vận hành như `listening`, `thinking`, `speaking` với cảm xúc như `happy`, `sad`, `curious`.

Không khẳng định robot thực sự có cảm xúc hay ý thức. Đây là hệ thống biểu đạt cảm xúc được mô phỏng.

## 9. Giai đoạn 0.5 — Hardware Adapter

Chưa cần mua phần cứng hoặc triển khai điều khiển vật lý trong phiên bản đầu.

Hãy thiết kế interface để sau này tích hợp ESP32, ví dụ:

- `connect()`
- `disconnect()`
- `getStatus()`
- `executeAction(action)`

Chỉ cho phép các hành động nằm trong danh sách được phê duyệt, chẳng hạn `turn_head_left`, `turn_head_right`, `wave_hand` và `stop`.

Cần có timeout, xác nhận trạng thái, giới hạn chuyển động và cơ chế dừng an toàn. Mất kết nối phải đưa hệ thống về trạng thái an toàn.

Không để AI gửi trực tiếp giá trị PWM hoặc góc servo không giới hạn.

## 10. Cấu trúc dự án mong muốn

Hãy tạo cấu trúc tương đương với:

- `src/components/`: giao diện robot, khuôn mặt và bảng điều khiển.
- `src/engine/`: hoạt ảnh, cảm xúc và hội thoại.
- `src/services/`: AI, giọng nói và kết nối robot.
- `src/types/`: các kiểu dữ liệu chung.
- `src/styles/`: CSS.
- `server/`: backend nếu cần.
- `tests/`: unit test và integration test.
- `docs/`: kiến trúc và lộ trình.

Có thể thay đổi cấu trúc nếu có lý do kỹ thuật tốt hơn. Tránh tạo file rỗng hoặc abstraction không cần thiết.

## 11. Tiêu chí nghiệm thu 0.1

Phiên bản 0.1 chỉ được coi là hoàn thành khi:

- Ứng dụng chạy được trên Mac bằng trình duyệt.
- Sáu cảm xúc hoạt động và có hình dạng khuôn mặt khác nhau.
- Chớp mắt và nhìn quanh hoạt động.
- Người dùng nhập tin nhắn và nhận phản hồi demo.
- Không có lỗi TypeScript hoặc lỗi build chưa được xử lý.
- Các chức năng cốt lõi có kiểm thử.
- Có README hướng dẫn cài đặt, chạy, kiểm thử và build.
- Không cần API key để dùng phiên bản demo.
- Không có secret hoặc thông tin nhạy cảm trong repository.

## 12. Cách thực hiện ngay bây giờ

Hãy bắt đầu bằng việc khảo sát workspace, sau đó thực hiện toàn bộ Giai đoạn 0.1.

Thứ tự công việc:

1. Kiểm tra Node.js, npm và cấu trúc thư mục.
2. Khởi tạo dự án nếu cần.
3. Viết tài liệu kiến trúc và lộ trình.
4. Xây dựng khuôn mặt và hoạt ảnh.
5. Xây dựng bảng cảm xúc và hội thoại demo.
6. Viết test.
7. Chạy test và build; sửa các lỗi có thể khắc phục.
8. Cung cấp hướng dẫn chạy trên macOS.

Không dừng lại ở việc đưa ra kế hoạch. Hãy thực sự triển khai 0.1 trong workspace.

Sau khi 0.1 đạt tiêu chí nghiệm thu, hãy báo cáo những gì đã làm, những lệnh đã chạy, kết quả thực tế và những việc còn lại. Chưa tự động chuyển sang các giai đoạn có thể phát sinh chi phí hoặc yêu cầu thông tin xác thực.

Bắt đầu ngay với việc kiểm tra workspace và triển khai MIRA AI 0.1.
