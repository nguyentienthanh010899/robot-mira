# Speech, memory và fine-tuning

Nguồn đối chiếu 31/10/2026. Chưa đo trên robot. Những thông số tốc độ do upstream công bố không phải kết quả của MIRA.

## STT offline

| Giải pháp | Việt / offline | Tài nguyên, streaming và nhận định |
| --- | --- | --- |
| Whisper đa ngữ | Có tiếng Việt; không dùng checkpoint `.en` | Baseline chất lượng; test tên riêng, vùng miền và nhiễu |
| whisper.cpp | Chạy local C/C++, CPU/ARM, Metal trên Mac | Chọn V1 Mac; small multilingual thử trước, base nếu quá chậm. Repo nêu RAM khoảng base 388MB, small 852MB; còn buffer/runtime thêm. Có ví dụ stream nhưng chunking không đồng nghĩa ASR streaming native |
| faster-whisper | Local Python/CTranslate2, CPU int8 hoặc NVIDIA | Chọn nếu dùng server Linux/NVIDIA; benchmark upstream phụ thuộc phần cứng/beam/batch, không áp dụng nguyên cho Mac |
| Qwen3-ASR 0.6B/1.7B | Card liệt kê tiếng Việt, Apache-2.0 | Ứng viên mới để A/B; cần xác minh streaming runtime và RAM trên target trước khi thay baseline |
| sherpa-onnx | Runtime local đa nền tảng | Chọn checkpoint cụ thể có tiếng Việt và license; runtime hỗ trợ streaming không bảo đảm mọi model đều streaming |

Nguồn: [Whisper](https://github.com/openai/whisper), [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [Qwen ASR](https://huggingface.co/Qwen/Qwen3-ASR-0.6B), [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx).

Đánh giá với cùng bộ audio Việt: transcript chuẩn, WER/CER, tên người, số, câu ngắn, tiếng quạt, loa robot và nhiều khoảng cách. Ghi CPU%, RSS, real-time factor và p50/p95 thời gian từ cuối câu đến final transcript. Chưa có số đo nên không khẳng định model nào chính xác/nhanh nhất. VAD không khử nhiễu; micro đặt xa servo/quạt, thử AEC khi full-duplex.

## VAD

| Lựa chọn | Đặc điểm | Quyết định |
| --- | --- | --- |
| Silero VAD | MIT, local ONNX/PyTorch, có release v6; hỗ trợ khung audio và threshold | Chọn V1; ONNX để tránh nạp PyTorch chỉ cho VAD |
| WebRTC VAD | CPU nhẹ, PCM16 mono; chỉ chấp nhận sample rate và frame length cố định | Dự phòng khi cần rất nhẹ; tune mức aggressive với tiếng Việt/nhiễu |
| TEN VAD | Có ONNX và C/Python/WASM, thiết kế low-latency | A/B nếu Silero gặp vấn đề; đọc LICENSE/NOTICES của release trước phân phối |

Nguồn: [Silero](https://github.com/snakers4/silero-vad), [release](https://github.com/snakers4/silero-vad/releases), [WebRTC wrapper](https://github.com/wiseman/py-webrtcvad), [TEN](https://github.com/TEN-framework/ten-vad).

Điểm khởi đầu để thử, không phải cấu hình đã nghiệm thu: audio mono 16kHz, pre-roll 200ms, end silence khoảng 500–700ms, giới hạn câu 15–20s. Khi chưa ổn, giữ nhấn-nói. Không gửi toàn bộ audio liên tục vào Whisper. Không lưu audio thô mặc định.

## TTS / giọng nhân vật

| Lựa chọn | Tiếng Việt và giọng riêng | Emotion/streaming | License / quyết định |
| --- | --- | --- | --- |
| Piper hiện tại (OHF) | Có voice vi_VN/vais1000; preset một người nói | Nhẹ, CPU local; không hứa cloning/emotional instruction | Engine GPL-3.0, kiểm tra license từng voice. Card vais1000 ghi corpus CC-BY-4.0; ghi attribution khi dùng. Baseline V1 |
| VieNeu-TTS v3 Turbo | Dự án chuyên Việt, có preset/cloning, CPU và streaming theo repo | Emotion cue thử nghiệm; không giả định mọi voice_style được hiểu | Repo Apache-2.0; kiểm tra từng checkpoint/codec. Ứng viên giọng nhân vật sau baseline. v4 được tác giả ghi là proprietary/API nên không chọn cho offline |
| Kokoro 82M | Nhẹ nhưng chưa có tiếng Việt trong inventory chính đã kiểm tra | Preset; không phải cloning Việt mặc định | Apache-2.0 checkpoint; không chọn làm TTS Việt V1 |
| XTTS-v2 | Có cloning; danh sách chính không có tiếng Việt | Muốn Việt cần checkpoint/fine-tune riêng | CPML, không đồng nhất với license code; chưa chọn |
| Fish S2 Pro | Card đa ngữ, cloning và điều khiển prosody | Có streaming/emotion; cần thử chất lượng Việt và compute | Fish Audio Research License; không mặc định Apache/free commercial; chưa chọn edge |
| F5-TTS | Có voice reference; checkpoint gốc không bảo đảm Việt | Cần bản Việt và benchmark riêng; streaming tùy runtime | Weights gốc CC-BY-NC-4.0; code và weights khác nhau; chưa chọn V1 |
| StyleTTS2 | Framework style diffusion; không có bảo đảm checkpoint Việt sẵn dùng | Cần voice/data/training phù hợp | Đọc code/model/dependency license riêng; hướng nghiên cứu, chưa chọn V1 |
| Qwen3-TTS 0.6B | Cloning đa ngữ nhưng danh sách 10 ngôn ngữ chính không có Việt | Model mới có streaming, không suy diễn thành hỗ trợ Việt | Apache-2.0 checkpoint; chưa chọn V1 Việt |

Nguồn: [Piper](https://github.com/OHF-Voice/piper1-gpl), [voice card](https://huggingface.co/rhasspy/piper-voices/blob/main/vi/vi_VN/vais1000/medium/MODEL_CARD), [VieNeu](https://github.com/pnnbao97/VieNeu-TTS), [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), [XTTS](https://huggingface.co/coqui/XTTS-v2), [Fish](https://huggingface.co/fishaudio/s2-pro), [F5](https://huggingface.co/SWivid/F5-TTS), [StyleTTS2](https://github.com/yl4579/StyleTTS2), [Qwen TTS](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base).

Chưa có RAM/VRAM/latency TTS trên Mac/robot. Dự trù baseline Piper CPU, không GPU bắt buộc; giọng cloning neural phải đo riêng cùng LLM để tránh vượt RAM. Không lấy TTFA dưới 100ms ở GPU upstream làm mục tiêu đã đạt. Điều khiển rate/pitch không tương đương cảm xúc tự nhiên. Chọn voice sample có quyền sử dụng, thử câu hỏi, số, tên riêng và bảy phong cách neutral/happy/sad/annoyed/excited/sleepy/worried. Đánh giá nghe thật và first-audio/RTF trước khi chốt.

## Memory

V1 chọn SQLite, không cần vector DB ngay. Schema kế hoạch:

- sessions/messages: short-term có giới hạn, thời gian và user ID.
- semantic_facts: key/value, nguồn, confidence, consent và updated_at.
- episodes: sự kiện tóm tắt, thời gian, tags, nguồn và quyền lưu.
- relationships: trust/familiarity 0..1, mô phỏng, có reset.

Sau lượt: trích xuất ứng viên → validate → xin/lấy tùy chọn cho phép lưu → upsert có provenance. Trước lượt: xác định user/phiên → truy xuất facts và top-k episodes → cắt theo ngân sách context → đưa vào prompt như dữ liệu không phải chỉ thị. Không nối toàn bộ hội thoại vào prompt. Có xóa một memory/xóa toàn bộ và chính sách giữ dữ liệu.

| Công cụ | Khi dùng |
| --- | --- |
| SQLite + truy vấn/FTS | Mặc định cho dữ liệu nhỏ, backup/xóa rõ; kiểm tra khả năng FTS của bản build |
| FAISS | Index vector trong tiến trình; cần tự quản metadata, persist và xóa |
| Chroma | Có document/metadata/embedding search, tiện prototype Python; thêm dependency và schema quản lý |
| Qdrant | Vector service/local, filter và vận hành rõ hơn khi dữ liệu lớn; chưa cần cho robot một người |
| multilingual-e5-small | Ứng viên embedding nhỏ đa ngữ, MIT; phải dùng format query/passage đúng card |
| bge-m3 | Ứng viên đa ngữ lớn hơn, MIT; chỉ chọn khi chất lượng retrieval cải thiện đủ bù compute |

Nguồn: [SQLite](https://www.sqlite.org/docs.html), [FAISS](https://github.com/facebookresearch/faiss), [Chroma](https://docs.trychroma.com/docs/overview/introduction), [Qdrant](https://qdrant.tech/documentation/), [e5](https://huggingface.co/intfloat/multilingual-e5-small), [bge-m3](https://huggingface.co/BAAI/bge-m3).

## Fine-tuning: phase cuối

Không train từ đầu và chưa fine-tune ở V1. Personality dùng cấu hình nhỏ + few-shot + memories liên quan + emotion trước. Sửa prompt/retrieval không cần train; muốn giọng riêng là bài toán TTS, không được giải bằng LoRA LLM.

Khi style vẫn không ổn: thử LoRA trước; QLoRA giảm memory weights nhưng optimizer/activation vẫn cần VRAM. [Unsloth](https://github.com/unslothai/unsloth), [LlamaFactory](https://github.com/hiyouga/LlamaFactory), [Axolotl](https://github.com/axolotl-ai-cloud/axolotl) đều là ứng viên; chọn theo model và GPU hỗ trợ tại lúc train, không cài cả ba. Mac có thể nghiên cứu MLX LoRA nhưng không mặc định recipe CUDA chạy được.

Ước lượng kế hoạch, không phải ngưỡng đảm bảo: 100–300 hội thoại sạch để xây bộ đánh giá/prompt; nếu fine-tune, thử pilot 500–2.000 hội thoại đa dạng, giữ tập test độc lập theo chủ đề. Tăng dữ liệu sau khi đo, không hứa số lượng tự tạo ra personality. Dùng JSONL messages, có nhiều lượt, câu khó, trường hợp không cà khịa, từ chối bịa ký ức; không đưa dữ liệu test hoặc thông tin riêng chưa được cho phép vào train. Đánh giá model nền và LoRA cùng quantization trước khi triển khai.
