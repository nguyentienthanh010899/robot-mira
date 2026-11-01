import { validateChat } from '../server/validation';
import { replySettings } from '../server/reply-options';
import { ProviderError } from '../server/reply';
import { demoReply } from '../src/engine/conversation';
import { cloudflareReply, configuredModel } from './brain';

const responseHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
function json(status: number, data: unknown) { return new Response(JSON.stringify(data), { status, headers: responseHeaders }); }
async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ProviderError(415, 'Cần Content-Type application/json.');
  const reader = request.body?.getReader();
  if (!reader) throw new ProviderError(400, 'Thiếu nội dung.');
  const decoder = new TextDecoder(); let size = 0, text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100_000) throw new ProviderError(413, 'Nội dung quá dài.');
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    try { return JSON.parse(text); } catch { throw new ProviderError(400, 'JSON không hợp lệ.'); }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      const origin = request.headers.get('Origin');
      if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new ProviderError(403, 'Chỉ dùng API từ ứng dụng này.');
      if (request.method === 'GET' && url.pathname === '/api/providers') {
        const model = configuredModel(env.AI_MODEL);
        return json(200, { deployment: 'cloudflare', providers: [
          { id: 'cloudflare', name: 'Cloudflare Workers AI', ready: !!env.AI, model, hint: 'Chạy trên Cloudflare · có hạn mức miễn phí; cần Internet' },
          { id: 'demo', name: 'Demo', ready: true, model: 'Phản hồi mẫu', hint: 'Không phải AI thật' },
        ] });
      }
      if (request.method === 'GET' && url.pathname === '/api/speech/voices') return json(200, { ready: false, voices: [], engine: 'browser', message: 'Bản Cloudflare dùng giọng tiếng Việt của thiết bị. Chọn giọng trình duyệt và cho phép âm thanh/micro.' });
      if (request.method === 'GET' && url.pathname === '/api/local/status') return json(200, { reachable: false, modelReady: false, models: [], message: 'Bản Cloudflare không kết nối Ollama trên máy.' });
      if (url.pathname.startsWith('/api/speech')) throw new ProviderError(503, 'VieNeu local không chạy trên Cloudflare Workers. Chọn giọng trình duyệt.');
      if (!['/api/chat', '/api/chat/stream'].includes(url.pathname)) return json(404, { error: 'Không tìm thấy endpoint.' });
      if (request.method !== 'POST') return json(405, { error: 'Cần POST.' });
      const body = await readBody(request);
      const { provider, messages } = validateChat(body);
      if (!['cloudflare', 'demo'].includes(provider)) throw new ProviderError(400, 'Bản deploy hỗ trợ Cloudflare Workers AI hoặc Demo.');
      const settings = replySettings((body as { settings?: unknown }).settings);
      const signal = AbortSignal.any([request.signal, AbortSignal.timeout(60000)]);
      let reply;
      if (provider === 'demo') reply = demoReply(messages.at(-1)!.content);
      else {
        const { success } = await env.CHAT_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'local' });
        if (!success) throw new ProviderError(429, 'Đã gửi nhiều câu hỏi. Chờ một phút rồi thử lại.');
        reply = await cloudflareReply(env.AI, env.AI_MODEL, messages, settings, signal);
      }
      if (url.pathname === '/api/chat/stream') {
        // Deliberately emit after validation: no wrong-role draft is shown or spoken.
        return new Response(JSON.stringify({ type: 'text', text: reply.text }) + '\n' + JSON.stringify({ type: 'done', reply }) + '\n', { headers: { ...responseHeaders, 'Content-Type': 'application/x-ndjson' } });
      }
      return json(200, reply);
    } catch (error) {
      if (request.signal.aborted || (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))) return json(504, { error: 'Đã hủy hoặc AI phản hồi quá lâu. Hãy thử lại.' });
      return json(error instanceof ProviderError ? error.status : 500, { error: error instanceof ProviderError ? error.message : 'Có lỗi xử lý. Hãy thử lại.' });
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;
