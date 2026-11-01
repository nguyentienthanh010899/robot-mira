# MIRA — yêu cầu hiện hành

Ưu tiên từ 31/10/2026: **Local AI + free/open-weight có license phù hợp + privacy + chi phí thấp**. Prototype để bàn mục tiêu ≤5.000.000 VNĐ, sau đó mới di chuyển và thu nhỏ. Mac là máy phát triển; mục tiêu cuối là robot tự hoạt động.

## Nguồn yêu cầu

- `ROBOT-PROMPT.md`: prompt người dùng cung cấp, lưu nguyên văn.
- `PROMPT-REVIEW.md`: đối chiếu hiện trạng, sửa pipeline và giải thích quyết định.
- `ARCHITECTURE.md`: kiến trúc và stack V1.
- `research/LOCAL-AI.md`, `research/SPEECH-MEMORY.md`: nghiên cứu có nguồn chính thức.
- `HARDWARE-PLAN.md`: A/B, BOM dự toán và giới hạn ngân sách.
- `ROADMAP.md`, `WORKFLOW.md`: mười phase và cách triển khai từng bước.

## Quy tắc áp dụng

1. Làm từng phase, chỉ chuyển khi tiêu chí đã kiểm chứng. Chưa fine-tune, mua phần cứng hoặc làm robot di chuyển ở Phase 1.
2. Ưu tiên local; Gemini/Groq là tùy chọn phải cho phép rõ, không tự fallback hoặc bật thanh toán.
3. Trải nghiệm cuối là nói chuyện tiếng Việt. Văn bản ở Phase 1 dùng để kiểm chứng bộ não, không thay đổi mục tiêu voice.
4. Giữ phần UI/SVG và code đang hoạt động. Không mặc định phải viết lại Node/React bằng Python; Python cho speech/controller khi có nhu cầu thực tế, C/C++ cho MCU.
5. Personality, relevant memories và trạng thái đưa vào trước LLM. Structured output được validate trước UI/TTS/action.
6. Không để LLM gửi điện áp, PWM, góc servo không giới hạn hoặc chạy shell. Phần cứng có controller/firmware safety độc lập.
7. Giọng trình duyệt là bản thử opt-in, có thể gửi audio ra ngoài; chưa coi là offline.
8. Test mock/build không thay thế nghiệm thu AI local, micro/loa hoặc robot thật. Ghi kết quả và giới hạn vào TESTING.md/STATE.md.
9. Không train từ đầu. Fine-tune chỉ ở phase cuối sau đo chất lượng, license và dữ liệu.

Yêu cầu Digital Face cũ được giữ tại `robot-v0.1.md` làm lịch sử; các chỉ thị bắt đầu lại Giai đoạn 0.1 trong đó không áp dụng cho MASTER hiện tại. Nếu tài liệu cũ mâu thuẫn về cloud-first hoặc thứ tự, dùng yêu cầu hiện hành này.
