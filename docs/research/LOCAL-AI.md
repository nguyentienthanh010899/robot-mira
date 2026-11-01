# Nghiên cứu local AI cho MIRA

Đối chiếu nguồn chính thức ngày 31/10/2026. Đây là shortlist kỹ thuật, chưa phải benchmark trên robot. “RAM dự kiến” bên dưới là ngân sách kỹ thuật ước lượng cho inference Q4 và context ngắn, không phải yêu cầu chính thức; cần đo RSS/VRAM thực tế.

## LLM

| Dòng / checkpoint tham chiếu | Quy mô / context được công bố | License checkpoint | Nhận định cho MIRA |
| --- | --- | --- | --- |
| Qwen3.5 0.8B / 2B / 4B | 0.8–4B; bản 4B native 262K | Apache-2.0 ở model card 4B; kiểm tra từng artifact khi tải | 4B là ứng viên Mac 16GB; 0.8/2B cho edge nhưng phải thử tiếng Việt |
| Qwen3 1.7B / 4B / 8B | Dải nhỏ đến 8B; 8B có 32K native, mở rộng theo cấu hình | Apache-2.0 ở 8B | Phương án text-only trưởng thành; 4B dự phòng nếu runtime Qwen3.5 chưa phù hợp |
| Gemma 4 E2B / E4B | E2B effective 2.3B nhưng tổng 5.1B; E4B effective 4.5B nhưng tổng 8B; context 128K | Apache-2.0 theo card hiện tại | Ứng viên mới đáng A/B; không tính RAM chỉ bằng effective params |
| Gemma 3 1B / 4B | 1B nhỏ; 4B đa phương thức và context dài | Gemma terms, khác Gemma 4 | Dự phòng, không mặc định là bản mới nhất |
| Llama 3.2 1B / 3B | 128K bản gốc; quantized chính thức có cấu hình 8K | Llama 3.2 Community License | Model nhỏ, instruction/tool use; tiếng Việt không nằm trong nhóm hỗ trợ chính nên chưa ưu tiên |
| Phi-4-mini-instruct | 3.8B, context 128K | MIT | Reasoning/code là điểm đáng thử; tiếng Việt không nằm trong danh sách ngôn ngữ chính của card |
| SmolLM3-3B | 3B, context 128K | Apache-2.0 | Có reasoning/tool use, nhưng benchmark/ngôn ngữ chính không tập trung tiếng Việt |

Nguồn: [Qwen3.5 card](https://huggingface.co/Qwen/Qwen3.5-4B), [Ollama tags](https://ollama.com/library/qwen3.5), [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B), [Gemma 4](https://huggingface.co/google/gemma-4-E2B-it), [Gemma 3](https://huggingface.co/google/gemma-3-4b-it), [Llama](https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2), [Phi](https://huggingface.co/microsoft/Phi-4-mini-instruct), [SmolLM](https://huggingface.co/HuggingFaceTB/SmolLM3-3B).

Có Qwen mới hơn trong dòng 3.8, nhưng release lớn không tự thích hợp ngân sách edge; chưa thấy lý do chọn checkpoint hàng chục/hàng nghìn tỷ tham số cho robot này. Dòng nhỏ Qwen3.5 được công bố tháng 3/2026; Gemma 4 là ứng viên mới hơn Gemma 3, Phi-4-mini phát hành 2/2025. Model card còn tồn tại không bảo đảm checkpoint còn được tác giả cập nhật; runtime phải kiểm tra release hỗ trợ kiến trúc ở lúc cài. Xem [release Qwen](https://github.com/QwenLM/Qwen3.8/blob/main/README.md) và [Gemma 4 report](https://arxiv.org/abs/2607.02770).

### Ngân sách bộ nhớ và compute

| Mức | Weights Q4 lý thuyết (chưa overhead) | RAM máy nên dự trù cho LLM + OS/UI | VRAM rời nếu offload hoàn toàn, ước lượng |
| --- | --- | --- | --- |
| ~1B | ~0.5GB | 4–6GB | ~2–3GB |
| 2B | ~1GB | 6–8GB | ~3–4GB |
| 3B | ~1.5GB | 8GB trở lên | ~4–5GB |
| 4B | ~2GB | 12–16GB cho development/speech | ~5–6GB |
| 7/8B | ~3.5–4GB | 16GB trở lên, cân nhắc 24GB nếu speech nặng | ~7–10GB |

Công thức weights gần đúng: params × bits / 8; GGUF có metadata, block scales, tensor precision khác nhau. Qwen3.5:4b ở Ollama được niêm yết khoảng 3.3–4.0GB artifact, không phải RSS. KV cache, vision encoder, context, batch, OS và STT/TTS cộng thêm. Trên Apple Silicon RAM dùng chung CPU/GPU, không cộng hai ngân sách như máy VRAM rời. Quantization Q4_K_M là điểm bắt đầu để thử; Q5/Q8 tăng RAM, Q2 có thể làm giảm chất lượng. Chỉ tải artifact có nguồn và license rõ.

### Hiệu năng và chất lượng

Chưa có tokens/s, WER hay điểm tiếng Việt trên máy người dùng. Không xếp hạng “tốt nhất” từ quảng cáo model card. Khởi đầu context 4096, câu trả lời 1–3 câu, tắt thinking khi model/runtime hỗ trợ để giảm độ trễ. Model biết function calling không đồng nghĩa được phép chạy tool; structured output cần schema/runtime constraint và validate lại.

A/B ít nhất 30 câu Việt: cách xưng hô, câu hài tự nhiên, ngữ cảnh nhiều lượt, câu phủ định, tên riêng, JSON lỗi và yêu cầu hành động sai. Chấm instruction following, đúng ý, độ lặp, tính cách và JSON hợp lệ; đo cold/warm riêng. Chọn model nhỏ nhất đạt chất lượng, không chỉ tokens/s cao nhất.

CPU x86/ARM và NVIDIA có thể dùng runtime hỗ trợ checkpoint/quantization phù hợp. Raspberry Pi/Orange Pi không có CUDA; NPU TOPS không chứng minh model GGUF chạy được trên NPU. Fine-tune cần checkpoint gốc, training stack và GPU/RAM khác inference; không train trực tiếp file GGUF như model gốc.

## Runtime

| Runtime | Nên dùng | Hạn chế / quyết định |
| --- | --- | --- |
| Ollama | Mac development, API local đơn giản, quản lý model | Chọn V1; pin tag/digest khi nghiệm thu, không dùng tag cloud cho chế độ local |
| llama.cpp | Prototype Linux/ARM và production cần kiểm soát GGUF, context, thread/offload | Ứng viên deploy robot; phải build đúng backend/kiến trúc model |
| MLX / mlx-lm | Apple Silicon, inference và LoRA | Tốt để A/B trên Mac; không phải runtime chuyển nguyên sang SBC Linux |
| vLLM | AI server có GPU, nhiều request/batching | Có backend CPU theo tài liệu, nhưng chưa cần độ phức tạp đó cho robot một người dùng |
| ONNX Runtime | VAD/STT/TTS và model export được hỗ trợ | Chọn cho Silero/Piper khi tích hợp; không tự biến mọi LLM thành model NPU |
| LiteRT-LM / sherpa-onnx | Ứng viên edge / speech | Chỉ thêm sau khi xác minh checkpoint, tiếng Việt và target; không thay stack chỉ vì mới |

Nguồn: [Ollama](https://docs.ollama.com/api/chat), [llama.cpp](https://github.com/ggml-org/llama.cpp), [MLX LM](https://github.com/ml-explore/mlx-lm), [vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/), [ONNX](https://onnxruntime.ai/docs/), [LiteRT Gemma](https://developers.google.com/edge/litert-lm/models/gemma-4), [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx).

**Chọn theo giai đoạn:** Mac 16GB → Ollama Qwen3.5:4b thử trước; prototype CPU yếu → thử Qwen 2B/Q4; robot nhỏ → model 0.8–2B hoặc server LAN, chấp nhận tradeoff. NVIDIA server → Ollama trước, vLLM khi thật sự cần concurrency. Chưa mua phần cứng trước benchmark.
