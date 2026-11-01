import { normalizeReply, ProviderError } from './reply';
export { normalizeReply, ProviderError } from './reply';
import { roleIssues } from './role-check';
import { actionTypes, voiceStyles, emotions, type ReplySettings, type Reply, type Message, type ProviderId, type ProviderOption } from '../src/types/index';
import { localBaseUrl } from './local';
import { performance } from 'node:perf_hooks';
import { readNDJSON, speechPrefix } from '../src/engine/streaming';
import { boundedHistory, replySettings, replyBudgets } from './reply-options';
import { reactToInput } from '../src/engine/emotion';
import { buildSpokenPersona, buildPersona } from './persona';
const responseSchema = {
  type: 'object', additionalProperties: false, required: ['speech', 'emotion', 'actions', 'voice_style'],
  properties: {
    speech: { type: 'string' },
    emotion: { type: 'string', enum: [...emotions, 'neutral', 'annoyed', 'excited', 'sleepy', 'worried'] },
    voice_style: { type: 'string', enum: [...voiceStyles] },
    actions: { type: 'array', maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['type'], properties: { type: { type: 'string', enum: [...actionTypes] }, count: { type: 'integer', minimum: 1, maximum: 3 } } } },
  },
};
export interface AIProvider { chat(messages: Message[], signal: AbortSignal, settings?: Partial<ReplySettings>, onText?: (text: string) => void): Promise<Reply> }
export function providers(env = process.env): ProviderOption[] {
  return [
    { id: 'demo', name: 'Demo', ready: true, model: 'Phản hồi mẫu', hint: 'Không cần key · không phải AI thật' },
    { id: 'gemini', name: 'Gemini', ready: !!(env.ALLOW_CLOUD_AI === 'true' && env.GEMINI_API_KEY && env.GEMINI_MODEL), model: env.GEMINI_MODEL || '', hint: 'Cloud tùy chọn: cần ALLOW_CLOUD_AI=true, key và model' },
    { id: 'groq', name: 'Groq', ready: !!(env.ALLOW_CLOUD_AI === 'true' && env.GROQ_API_KEY && env.GROQ_MODEL), model: env.GROQ_MODEL || '', hint: 'Cloud tùy chọn: cần ALLOW_CLOUD_AI=true, key và model' },
    { id: 'ollama', name: 'Ollama', ready: !!env.OLLAMA_MODEL, model: env.OLLAMA_MODEL || '', hint: 'Cần Ollama đang chạy và OLLAMA_MODEL đã tải' },
  ];
}
export function createProvider(id: Exclude<ProviderId, 'demo' | 'cloudflare'>, env = process.env): AIProvider {
  const selected = providers(env).find(p => p.id === id);
  if (!selected?.ready) throw new ProviderError(503, 'AI chưa được cấu hình. Hãy cập nhật .env phía server và khởi động lại.');
  const config = selected!;
  if (id === 'ollama' && /cloud/i.test(config.model)) throw new ProviderError(503, 'Chế độ local không cho phép model cloud của Ollama.');
  const gpuLayers = env.OLLAMA_NUM_GPU === undefined || env.OLLAMA_NUM_GPU === '' ? undefined : Number(env.OLLAMA_NUM_GPU);
  if (id === 'ollama' && gpuLayers !== undefined && (!Number.isInteger(gpuLayers) || gpuLayers < 0 || gpuLayers > 999)) throw new ProviderError(503, 'OLLAMA_NUM_GPU phải là số nguyên 0..999; dùng 0 để chạy CPU.');
  const threads = env.OLLAMA_NUM_THREAD ? Number(env.OLLAMA_NUM_THREAD) : undefined;
  if (id === 'ollama' && threads !== undefined && (!Number.isInteger(threads) || threads < 1 || threads > 64)) throw new ProviderError(503, 'OLLAMA_NUM_THREAD phải là số nguyên 1..64.');
  async function chat(messages: Message[], signal: AbortSignal, settingsInput?: Partial<ReplySettings>, onText?: (text: string) => void, repairing = false): Promise<Reply> {
    const settings = replySettings(settingsInput);
    const budget = replyBudgets[settings.length];
    messages = boundedHistory(messages, settings.mode);
    // Old assistant responses can teach the small model the wrong role again.
    if (messages.some(m => m.role === 'assistant' && roleIssues(m.content).length)) messages = messages.slice(-1);
    const plainSpeech = id === 'ollama' && !!onText && settings.mode === 'fast';
    let persona = plainSpeech ? buildSpokenPersona(settings.length) : buildPersona({}, settings.length);
    if (repairing) persona += '\nLượt trước bị sai xưng hô. Viết lại câu trả lời từ đầu: mở Bẩm đại ca,; người dùng=đại ca, AI=đệ. Không dùng cậu/tôi/mình/bạn/anh/em để xưng hô. Viết đơn giản và đúng câu hỏi, không giải thích việc sửa.';
    const model = id === 'ollama' && settings.mode === 'fast' ? env.OLLAMA_FAST_MODEL || config.model : config.model;
    if (/cloud/i.test(model) && id === 'ollama') throw new ProviderError(503, 'Model local không được dùng cloud.');
    const started = performance.now();
    let url: string, body: unknown;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (id === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`;
      headers['x-goog-api-key'] = env.GEMINI_API_KEY!;
      body = { systemInstruction: { parts: [{ text: persona }] }, contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), generationConfig: { responseMimeType: 'application/json', maxOutputTokens: budget.tokens } };
    } else {
      url = id === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : `${localBaseUrl(env)}/api/chat`;
      if (id === 'groq') headers.Authorization = `Bearer ${env.GROQ_API_KEY}`;
      body = { model, messages: [{ role: 'system', content: persona }, ...messages], stream: id === 'ollama' && !!onText, ...(id === 'ollama' ? { ...(plainSpeech ? {} : { format: responseSchema }), think: false, options: { num_ctx: 4096, num_predict: budget.tokens, temperature: 0.3, ...(gpuLayers !== undefined ? { num_gpu: gpuLayers } : {}), ...(threads !== undefined ? { num_thread: threads } : {}) }, keep_alive: '30m' } : { max_completion_tokens: budget.tokens }) };
    }
    let response: Response;
    try { response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal, redirect: 'error' }); }
    catch (error) { if (signal.aborted) throw error; throw new ProviderError(502, 'Không kết nối được AI. Kiểm tra mạng hoặc dịch vụ Ollama.'); }
    if (!response.ok) {
      if (response.status === 429) throw new ProviderError(429, 'AI đã chạm giới hạn sử dụng. Chờ một chút hoặc chọn AI khác.');
      if ([401, 403].includes(response.status)) throw new ProviderError(502, 'AI từ chối xác thực. Kiểm tra key và quyền model phía server.');
      throw new ProviderError(502, 'AI chưa thể trả lời. Kiểm tra model và trạng thái dịch vụ.');
    }
    let data; let firstTextMs: number | undefined;
    if (id === 'ollama' && onText) {
      let raw = '', lastText = '', finished = false;
      await readNDJSON(response, signal, chunk => {
        if (chunk.error) throw new ProviderError(502, 'AI local báo lỗi trong lúc tạo câu trả lời.');
        raw += typeof chunk.message?.content === 'string' ? chunk.message.content : '';
        const prefix = plainSpeech ? raw : speechPrefix(raw);
        if (prefix.length > lastText.length) { firstTextMs ??= Math.round(performance.now() - started); lastText = prefix; }
        if (chunk.done) { finished = true; data = { ...chunk, message: { content: raw } }; }
      });
      if (!finished) throw new ProviderError(502, 'AI ngắt trước khi hoàn thành. Hãy thử lại.');
    } else {
      try { data = await response.json(); } catch { throw new ProviderError(502, 'AI trả dữ liệu không hợp lệ.'); }
    }
    if (!data || typeof data !== 'object') throw new ProviderError(502, 'AI trả dữ liệu không hợp lệ.');
    const raw = id === 'gemini' ? data.candidates?.[0]?.content?.parts?.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text || '').join('') : id === 'groq' ? data.choices?.[0]?.message?.content : data.message?.content;
    if (typeof raw !== 'string') throw new ProviderError(502, 'AI không trả nội dung văn bản.');
    const reply = plainSpeech ? normalizeReply(JSON.stringify({ speech: raw, emotion: reactToInput(messages.at(-1)?.content || ''), actions: [], voice_style: 'neutral' })) : normalizeReply(raw);
    const issues = roleIssues(reply.text);
    if (issues.length) {
      if (!repairing) {
        const repaired = await chat(messages, signal, settingsInput, onText, true);
        return { ...repaired, metrics: { ...repaired.metrics!, totalMs: Math.round(performance.now() - started) } };
      }
      throw new ProviderError(502, 'AI chưa giữ đúng xưng hô đại ca/đệ. Câu trả lời đã được chặn để tránh đọc sai vai. Hãy thử lại hoặc chọn chế độ Chất lượng.');
    }
    onText?.(reply.text);
    return { ...reply, metrics: { totalMs: Math.round(performance.now() - started), ...(firstTextMs !== undefined ? { firstTextMs } : {}), ...(id === 'ollama' && Number.isFinite(data.eval_duration) && data.eval_duration > 0 ? { generationMs: Math.round(data.eval_duration / 1e6), tokens: data.eval_count } : {}) } };
  }
  return { chat };
}
