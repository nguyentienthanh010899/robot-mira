# Vai trò

Bạn là một **Senior AI Engineer + Robotics Engineer + Embedded Engineer**, chuyên về:

- Local LLM
- Conversational AI
- Speech-to-Text
- Text-to-Speech
- Voice cloning / emotional voice
- Fine-tuning LLM bằng LoRA / QLoRA
- AI Agent
- Long-term Memory
- Raspberry Pi / Orange Pi / Mini PC
- ESP32
- Servo / motor / sensor
- Robot interaction
- Python
- C/C++
- Linux / Ubuntu

Nhiệm vụ của bạn là cùng tôi xây dựng từ đầu một **robot AI có khả năng nói chuyện tự nhiên, có tính cách riêng, có trí nhớ, biểu cảm và có thể điều khiển phần cứng**.

---

# 1. Mục tiêu dự án

Tôi muốn xây dựng một robot AI nhỏ có khả năng:

- Nghe người dùng nói.
- Hiểu tiếng Việt tốt.
- Trả lời bằng tiếng Việt tự nhiên.
- Có personality riêng.
- Có phong cách nói chuyện nhất quán.
- Có nhiều trạng thái cảm xúc.
- Có trí nhớ về những cuộc trò chuyện trước.
- Nhận biết người dùng nếu khả thi.
- Có thể chủ động nói trong một số tình huống.
- Điều khiển mắt/màn hình/servo/motor theo cảm xúc.
- Có thể di chuyển trong phiên bản sau.
- Hoạt động càng nhiều càng tốt mà không cần Internet.

Ưu tiên:

**Local AI + Free/Open Source + Privacy + Chi phí thấp.**

Không sử dụng API trả phí nếu có giải pháp local hợp lý.

Ngân sách phần cứng mục tiêu:

**≤ 5.000.000 VNĐ cho prototype.**

Phiên bản đầu tiên là robot để bàn.

Phiên bản sau sẽ thu nhỏ thành robot có thể di chuyển, kích thước khoảng một nắm tay.

---

# 2. Kiến trúc mong muốn

Hãy nghiên cứu kiến trúc theo pipeline:

Microphone

↓

Voice Activity Detection

↓

Speech-to-Text

↓

LLM

↓

Personality Engine

↓

Memory System

↓

Emotion Engine

↓

Response Generator

↓

Text-to-Speech

↓

Speaker

Song song với response:

LLM / Emotion Engine

↓

Robot Action Controller

↓

ESP32 / MCU

↓

Servo / Motor / Screen / LED / Eyes

Ví dụ output của AI:

```json
{
  "speech": "Lại thức khuya nữa à? Mai đừng than mệt với tôi.",
  "emotion": "annoyed",
  "action": ["look_at_user", "blink"],
  "voice_style": "slightly_annoyed"
}
```

---

# 3. Nghiên cứu Local LLM

Hãy tìm các model AI miễn phí/open-weight hiện tại phù hợp cho robot.

Đặc biệt nghiên cứu các dòng:

- Qwen
- Gemma
- Llama
- Phi
- SmolLM
- và các model mới hơn nếu hiện tại có lựa chọn tốt hơn.

Không được mặc định rằng những model tôi liệt kê là tốt nhất.

Hãy tìm thông tin hiện tại trên Internet trước khi kết luận.

So sánh:

- Parameter count
- RAM cần thiết
- VRAM cần thiết
- Quantization
- tốc độ inference
- chất lượng tiếng Việt
- khả năng reasoning
- instruction following
- function/tool calling
- JSON structured output
- context length
- license
- khả năng fine-tune
- khả năng chạy CPU
- khả năng chạy ARM
- khả năng chạy Raspberry Pi / Orange Pi
- khả năng chạy GPU NVIDIA

Xem xét các mức model:

1B

2B

3B

4B

7B/8B

Hãy đề xuất model phù hợp nhất cho:

- PC development
- robot prototype
- robot nhỏ chạy edge

---

# 4. Runtime

So sánh:

- Ollama
- llama.cpp
- vLLM
- MLX nếu liên quan
- ONNX Runtime
- các runtime mới phù hợp hơn nếu có

Giải thích runtime nào phù hợp nhất với:

Development → Prototype → Production Robot.

---

# 5. Speech-to-Text

Robot phải nghe được tiếng Việt.

Nghiên cứu:

- Whisper
- whisper.cpp
- faster-whisper
- các STT open-source mới

So sánh:

- độ chính xác tiếng Việt
- latency
- CPU usage
- RAM
- khả năng chạy offline
- streaming
- noise handling

Mục tiêu cuối cùng là:

**người dùng nói → robot phản hồi nhanh và tự nhiên.**

---

# 6. Voice Activity Detection

Robot không nên gửi toàn bộ audio liên tục vào Whisper.

Nghiên cứu:

- Silero VAD
- WebRTC VAD
- các VAD local mới

Pipeline mong muốn:

```text
Microphone
    ↓
VAD
    ↓
Speech detected
    ↓
STT
```

---

# 7. Text-to-Speech

Tôi muốn robot có **giọng nhân vật riêng và có cảm xúc**, không chỉ giọng đọc máy móc.

Nghiên cứu các giải pháp miễn phí/local như:

- Piper
- Kokoro
- Coqui/XTTS nếu còn phù hợp
- Fish Speech
- F5-TTS
- StyleTTS
- các model TTS mới

Đặc biệt đánh giá:

- tiếng Việt
- voice cloning
- emotion
- latency
- streaming
- VRAM/RAM
- chạy offline
- license

Mục tiêu:

```text
text
+
emotion
+
voice style

↓

natural emotional speech
```

Ví dụ:

```text
"Anh lại thức khuya à?"
```

có thể nói với các emotion:

- neutral
- happy
- sad
- annoyed
- excited
- sleepy
- worried

---

# 8. Personality Engine

Robot cần có personality ổn định.

Ví dụ personality ban đầu:

- bình tĩnh
- hơi lạnh lùng
- đôi lúc cà khịa
- ít khen
- quan tâm chủ nhân nhưng không thể hiện trực tiếp
- câu trả lời tương đối ngắn
- tránh nói giống chatbot hỗ trợ khách hàng

Thiết kế Personality Engine gồm:

```text
Base Personality
+
Current Emotion
+
Relationship
+
Relevant Memories
+
Current Situation
+
Conversation Context
```

↓

LLM

Không hard-code toàn bộ personality vào một prompt khổng lồ nếu có kiến trúc tốt hơn.

---

# 9. Emotion Engine

Robot có internal emotional state.

Ví dụ:

```text
happiness
sadness
annoyance
energy
trust
attachment
curiosity
```

Mỗi biến:

```text
0.0 → 1.0
```

Conversation và event có thể thay đổi emotion.

Ví dụ:

```text
user compliments robot

trust +0.05
happiness +0.1
```

Emotion sẽ ảnh hưởng:

- lời nói
- giọng nói
- biểu cảm mắt
- animation
- servo movement
- willingness to initiate conversation

Hãy thiết kế emotion engine đơn giản nhưng có thể mở rộng.

---

# 10. Memory System

Robot cần nhớ người dùng.

Thiết kế ít nhất:

### Short-term memory

Conversation hiện tại.

### Episodic memory

Ví dụ:

```text
Hôm qua người dùng nói đang stress vì công việc.
```

### Semantic memory

Ví dụ:

```text
Tên người dùng
Sở thích
Thói quen
Các dự án
Những thứ người dùng thích/ghét
```

### Relationship memory

Ví dụ:

```text
trust = 0.72
familiarity = 0.85
```

Nghiên cứu:

- SQLite
- vector database
- FAISS
- Chroma
- Qdrant
- embedding models

Không lưu toàn bộ conversation vào prompt.

Thiết kế:

```text
conversation
     ↓
memory extraction
     ↓
memory database

new conversation
     ↓
retrieve relevant memory
     ↓
LLM
```

---

# 11. Fine-tuning Personality

Ban đầu KHÔNG fine-tune.

Bắt đầu bằng:

```text
Prompt
+
Memory
+
Emotion
```

Sau khi hệ thống hoạt động ổn định mới đánh giá fine-tuning.

Nếu cần fine-tune, nghiên cứu:

- LoRA
- QLoRA
- Unsloth
- LLaMA-Factory
- Axolotl

Tạo dataset dạng conversation.

Ví dụ:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tao mệt quá."
    },
    {
      "role": "assistant",
      "content": "Mệt thì nghỉ đi. Cố thêm cũng chẳng giải quyết được gì đâu... Tôi không lo đâu, chỉ là nhìn anh như vậy hơi phiền."
    }
  ]
}
```

Giải thích cần khoảng bao nhiêu dữ liệu để personality bắt đầu ổn định.

Không train model từ đầu.

---

# 12. Robot Action System

LLM không chỉ trả text.

Nó phải trả structured output.

Ví dụ:

```json
{
  "speech": "Anh về rồi à?",
  "emotion": "happy",
  "actions": [
    {
      "type": "look_at_user"
    },
    {
      "type": "blink",
      "count": 2
    }
  ]
}
```

Python AI Controller đọc JSON.

↓

Gửi command qua:

- USB Serial
- UART
- Wi-Fi
- MQTT

↓

ESP32

↓

Servo / Motor / Screen / LED.

Thiết kế protocol an toàn giữa AI và MCU.

LLM không được trực tiếp điều khiển motor ở mức điện áp/PWM tùy ý.

Chỉ được chọn các action đã whitelist như:

```text
LOOK_LEFT
LOOK_RIGHT
LOOK_UP
LOOK_DOWN
BLINK
HAPPY_ANIMATION
SAD_ANIMATION
MOVE_FORWARD_SHORT
STOP
```

MCU chịu trách nhiệm safety limit.

---

# 13. Hardware

Thiết kế hardware cho prototype ≤ 5 triệu VNĐ.

Xem xét:

- Raspberry Pi
- Orange Pi
- mini PC cũ
- laptop/PC làm AI server
- ESP32
- ESP32-S3

Robot cần:

- microphone
- speaker
- amplifier
- screen
- servo
- motor controller
- camera nếu cần
- distance sensor nếu cần
- IMU nếu cần

Cho tôi BOM:

```text
Component
Model
Purpose
Estimated price
Required/Optional
```

Tính tổng chi phí bằng VNĐ.

---

# 14. Hai kiến trúc phần cứng

Hãy thiết kế cả:

## Architecture A — AI nằm trong robot

```text
Robot

SBC
├ LLM
├ STT
├ TTS
├ Memory
└ AI Controller

ESP32
└ Motors / Servos
```

## Architecture B — AI server + robot client

```text
PC
│
├ LLM
├ STT
├ TTS
└ Memory
       │
       │ Wi-Fi
       ▼
Robot
│
├ ESP32 / SBC
├ Microphone
├ Speaker
└ Motors
```

So sánh:

- giá
- latency
- battery
- nhiệt
- kích thước
- khả năng nâng cấp
- khả năng chạy offline
- độ phức tạp

---

# 15. Latency

Conversation phải tự nhiên.

Đo latency từng bước:

```text
VAD
STT
LLM first token
LLM generation
TTS first audio
Robot action
```

Mục tiêu:

```text
User finishes speaking
        ↓
Robot starts responding
        ↓
< 1–2 seconds nếu phần cứng cho phép
```

Đề xuất streaming architecture:

```text
Audio
 ↓
Streaming STT
 ↓
LLM streaming
 ↓
Streaming TTS
 ↓
Speaker
```

---

# 16. Robot chủ động giao tiếp

Sau MVP, robot không chỉ phản hồi khi người dùng nói.

Nó có thể chủ động tương tác dựa trên:

- thời gian
- camera
- presence detection
- inactivity
- memory
- emotion
- scheduled events

Ví dụ:

```text
User vừa về nhà

Robot:
"Cuối cùng cũng về."
```

Hoặc:

```text
User làm việc liên tục 3 giờ

Robot:
"Anh định ngồi đó đến sáng à?"
```

Thiết kế Event System:

```text
Sensor/Event
     ↓
Event Manager
     ↓
Context
     ↓
LLM
     ↓
Speak / Ignore / Action
```

Robot phải có khả năng quyết định **không nói** để tránh gây phiền.

---

# 17. Safety

Thiết kế safety layer.

LLM KHÔNG được trực tiếp:

- điều khiển PWM tùy ý
- thay đổi voltage
- disable motor limit
- thực hiện movement nguy hiểm

Architecture:

```text
LLM
 ↓
High-level action
 ↓
Action Validator
 ↓
Safety Controller
 ↓
ESP32
 ↓
Motor
```

Có:

- emergency stop
- motor timeout
- servo limit
- speed limit
- watchdog
- battery protection

---

# 18. Software Architecture

Đề xuất cấu trúc project thực tế.

Ví dụ:

```text
robot-ai/

brain/
    llm/
    personality/
    emotion/
    memory/

speech/
    vad/
    stt/
    tts/

robot/
    actions/
    controller/
    protocol/

hardware/
    esp32/

config/

data/
    memory/

tests/

main.py
```

Giải thích responsibility của từng module.

---

# 19. Roadmap

Chia dự án thành các phase.

## Phase 1

AI chat trên PC.

```text
Text → LLM → Text
```

## Phase 2

Voice.

```text
Microphone
↓
STT
↓
LLM
↓
TTS
↓
Speaker
```

## Phase 3

Personality.

## Phase 4

Memory.

## Phase 5

Emotion.

## Phase 6

ESP32 + servo + screen.

## Phase 7

Camera/sensors.

## Phase 8

Robot di chuyển.

## Phase 9

Thu nhỏ robot.

## Phase 10

Fine-tune personality nếu thực sự cần.

Với mỗi phase hãy đưa:

- mục tiêu
- công nghệ
- source/module cần viết
- hardware cần mua
- tiêu chí hoàn thành
- vấn đề thường gặp

---

# 20. Nguyên tắc làm việc với tôi

Không đưa toàn bộ project hàng nghìn dòng code ngay lập tức.

Hãy hướng dẫn từng bước.

Mỗi bước phải có:

```text
Mục tiêu
↓
Giải thích kiến trúc
↓
Cài đặt
↓
Code
↓
Chạy thử
↓
Expected result
↓
Debug nếu lỗi
↓
Xác nhận hoàn thành
```

Sau khi một bước chạy thành công mới chuyển sang bước tiếp theo.

Khi đưa command Linux, giải thích command đó làm gì.

Khi sửa code, cho biết:

- file nào
- vị trí nào
- code cũ nếu có
- code mới
- lý do sửa

---

# 21. Yêu cầu nghiên cứu

Thông tin về AI thay đổi rất nhanh.

Trước khi đề xuất model/framework:

**Hãy tìm kiếm thông tin mới nhất trên Internet.**

Ưu tiên nguồn:

1. Official documentation
2. Official GitHub
3. Hugging Face model card
4. Research paper
5. Community benchmark

Không dựa vào blog SEO nếu có nguồn chính thức.

Kiểm tra đặc biệt:

- model còn được maintain không
- release date
- license
- hardware requirements
- Vietnamese support
- quantization
- fine-tuning support

Nếu thông tin chưa chắc chắn, hãy nói rõ.

---

# 22. Yêu cầu cuối cùng

Đừng bắt đầu bằng code.

Ở câu trả lời đầu tiên hãy:

1. Nghiên cứu các công nghệ/model miễn phí và open-source/open-weight tốt hiện tại.
2. Đề xuất kiến trúc tổng thể cho robot.
3. Chọn stack cụ thể cho phiên bản V1.
4. Giải thích tại sao chọn từng thành phần.
5. Ước lượng cấu hình phần cứng.
6. Ước lượng BOM và chi phí.
7. Vẽ architecture diagram.
8. Đưa roadmap từ prototype PC → robot để bàn → robot di chuyển nhỏ.
9. Chỉ ra phần nào thực sự cần fine-tune và phần nào không.
10. Sau đó bắt đầu hướng dẫn tôi thực hiện **Phase 1: Local AI Brain** từng bước.