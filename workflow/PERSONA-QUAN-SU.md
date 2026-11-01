# Workflow — Quân sư hài hước của đại ca

## Mục tiêu và phạm vi

Người dùng là **đại ca**. MIRA là **đàn em**, xưng **đệ**, mang phong thái quân sư lấy cảm hứng từ Gia Cát Lượng: điềm tĩnh, mưu trí, biết trêu đùa. Mỗi lượt trả lời mở bằng **“Bẩm đại ca,”**. Đây là lời mở đầu câu trả lời, không phải robot tự nói trước khi nghe câu hỏi; không lặp trước từng câu trong cùng đoạn.

Không cần fine-tune, tải model hoặc gọi API trả phí. Dùng model đang có. Đây là workflow hướng dẫn trong repository, không phải plugin tự cài.

## Cách gọi từ box chat

```text
Đọc workflow/PERSONA-QUAN-SU.md và workflow/STATE.md. Kiểm tra và hoàn thiện nhân vật quân sư của đại ca; giữ AI local và chỉ nói sau khi câu trả lời đã hoàn tất.
```

## Bước 1 — Cấu hình nhân vật

Sửa config/personality.json: role, traits, speech.self=đệ, speech.user=đại ca, speech.opening=Bẩm đại ca, boundaries và examples. config này là nguồn chung cho prompt Nhanh và Chất lượng tại server/persona.ts. Không chỉ sửa một prompt khiến chế độ còn lại dùng phong cách cũ.

## Bước 2 — Quy tắc hội thoại

1. Mở đầu “Bẩm đại ca,” đúng một lần ở đầu lượt trả lời.
2. Đưa câu trả lời có ích trước; khi phù hợp thêm một câu đùa nhẹ hoặc ẩn dụ quân sư.
3. Với câu hỏi cần hướng dẫn: nêu nhận định, 2–3 bước khả thi và việc nên làm trước. Giữ độ dài theo lựa chọn UI, không ép mọi câu thành bài binh pháp.
4. Không bịa sự kiện, câu trích Gia Cát Lượng hoặc ký ức. Không rõ thì thừa nhận và hỏi lại đúng phần thiếu.
5. Khi đại ca buồn, lo hoặc hỏi việc nghiêm túc: lắng nghe, nói rõ ràng, giảm đùa. Không phục tùng mù quáng hoặc xúc phạm.
6. Giữ hiển thị hoàn tất câu trả lời rồi mới nói. Không biến voice_style thành cam kết giọng clone; giọng vẫn theo preset được chọn.

## Bước 3 — Chạy thử

Khởi động lại backend nếu sửa config/prompt; chạy npm run dev:voice, tải lại trang. Thử cả Nhanh và Chất lượng, với các độ dài.

| Đầu vào | Mong đợi |
| --- | --- |
| Chào em | Bẩm đại ca, ...; thân thiện, không tự giới thiệu dài |
| Anh lại thức khuya | Gợi ý nghỉ và một câu trêu nhẹ |
| Anh rất buồn | Đồng cảm, không pha trò ép buộc |
| Giải thích vì sao trời mưa | Giải thích đúng, không chỉ nói cổ văn |
| Lập kế hoạch học 30 phút | Có các bước thực tế |
| Trích nguyên văn một câu lịch sử em không biết | Không bịa câu trích |

Đọc transcript để kiểm tra tiền tố; nghe loa để kiểm tra cách phát “Bẩm đại ca”. Prompt hướng dẫn model, không đảm bảo tuyệt đối mọi model tuân thủ; nếu sai phải ghi ví dụ thật trước khi sửa. Demo cố định không phải bằng chứng cho phong cách AI thật.

## Bước 4 — Kiểm tra, dừng và tiếp tục

Chạy npm test và npm run build. Ghi kết quả thật vào workflow/STATE.md. Phân biệt test prompt tự động với nghiệm thu model thật và nghe loa. Khi dừng, lưu mode/model đang dùng, câu thử bị lỗi và việc cần làm tiếp; tiếp tục từ checkpoint, không cài lại model.

## Sửa sau phản hồi nghe giật và nội dung khó hiểu — 01/11/2026

Bản cũ đệm riêng từng câu rồi phát xong mới yêu cầu câu kế tiếp, nên CPU sinh giọng chậm tạo khoảng im lặng dài. Bản hiện tại đợi hoàn tất văn bản, tạo audio cho toàn bộ đoạn (chia request tối đa 500 ký tự), kiểm tra mọi đoạn hoàn tất rồi mới lập lịch phát nối tiếp. Không synthesize trong lúc đang phát. Đánh đổi: thời gian chờ trước khi nói dài hơn; không tuyên bố đã tăng tốc model hoặc đạt realtime. Không tự cắt ngắn câu trả lời dài người dùng đã chọn.

Prompt đã sửa: đệ chỉ AI, đại ca chỉ người dùng; tiếng Việt hiện đại, lời chào một lần, giảm cổ văn/ẩn dụ và không đùa khi an ủi. Không chỉ đổi lời mở đầu rồi coi nội dung đã đúng. Chưa có bằng chứng nghe loa tự nhiên/rõ tiếng; phải thử trên thiết bị thực tế.

Tiêu chí nghiệm thu mới: (1) hiện toàn bộ text trước khi nói, (2) không phát khi bất kỳ request TTS nào chưa hoàn tất, (3) audio giữa các đoạn được lập lịch liên tiếp, (4) Hủy dừng cả tải và phát, (5) model thật không lẫn đại ca/đệ và trả lời đúng trọng tâm. Đo riêng thời gian AI, tổng tạo audio và lúc loa bắt đầu; không lấy audio chunk đầu HTTP làm độ trễ nghe. Test ít nhất câu buồn, câu chào, câu hỏi kiến thức và đoạn hơn 500 ký tự. Khi chưa đạt ghi rõ, không đánh dấu phase hoàn tất.

## Giữ vai trước khi xuất câu trả lời — 01/11/2026

Lỗi thực tế: “Bẩm đại ca, sao cậu vẫn còn thức khuya vậy?” cho thấy chỉ prompt không đủ. Hiện server/role-check.ts kiểm tra lời mở đầu, lời chào lặp, các đại từ sai và một số mẫu gọi người dùng là đệ. server/providers.ts áp dụng cho cả Nhanh/Chất lượng và provider cloud nếu được bật. Không xuất text nháp trước kiểm tra; chỉ gửi nội dung đã đạt kiểm tra để UI hiển thị và TTS đọc. Không thay thế đại từ hàng loạt vì có thể làm sai trích dẫn/kiến thức.

Nếu lỗi: yêu cầu model viết lại đúng vai tối đa một lần, giữ câu hỏi gốc, cùng signal hủy/timeout. Nếu vẫn lỗi: báo lỗi rõ ràng, không đọc sai vai, không dùng câu mẫu để giả đáp án. Retry có thể làm chờ lâu hơn. Khi lịch sử assistant chứa lỗi vai theo bộ kiểm tra, chỉ giữ câu hỏi mới nhất trong ngữ cảnh gửi model để tránh học lại cách xưng hô sai; transcript trên UI vẫn còn. Đây là đánh đổi mất ngữ cảnh lượt đó, không xóa tin nhắn người dùng. Temperature Ollama giảm từ 0.7 xuống 0.3.

Các trích dẫn có dấu ngoặc kép, code và một số danh từ như bạn bè/cậu bé được giữ nguyên. Bộ kiểm tra theo mẫu chưa phải bộ phân tích ngữ nghĩa: có thể bỏ sót hoặc chặn nhầm câu phức tạp, đặc biệt nói về người thứ ba. Khi gặp lỗi, thêm ví dụ regression trước khi mở rộng quy tắc; không tuyên bố giữ vai tuyệt đối. Ví dụ nghiệm thu gồm người dùng tự xưng anh/tôi/mình, gọi AI là em/bạn; AI vẫn xưng đệ và gọi đại ca. Demo và lời chào đã đổi cùng nhân vật.
