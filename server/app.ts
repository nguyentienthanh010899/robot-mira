import { validateChat } from './validation';
export { validateChat } from './validation';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { replySettings } from './reply-options';
import { speechInfo, synthesizeSpeech, streamSpeech } from './speech';
import { demoReply } from '../src/engine/conversation';
import type { Message, ProviderId } from '../src/types';
import { localStatus } from './local';
import { createProvider, providers, ProviderError } from './providers';
function json(res: ServerResponse, status: number, data: unknown) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); }
async function readBody(req: IncomingMessage) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 360000) throw new ProviderError(413, 'Nội dung quá dài.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new ProviderError(400, 'JSON không hợp lệ.'); }
}
export function makeServer() {
  return createServer(async (req, res) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 180000);
    res.on('close', () => { if (!res.writableEnded) controller.abort(); });
    try {
      const origin = req.headers.origin;
      const host = req.headers.host || '';
      if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host) || (origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) throw new ProviderError(403, 'API chỉ dùng cho ứng dụng local.');
      if (req.method === 'GET' && req.url === '/api/speech/voices') return json(res, 200, await speechInfo(controller.signal));
      if (req.method === 'POST' && req.url === '/api/speech/stream') {
        if (!req.headers['content-type']?.startsWith('application/json')) throw new ProviderError(415, 'Cần JSON.');
        const body = await readBody(req);
        await streamSpeech(body, controller.signal, event => { if (!res.headersSent) res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' }); if (!res.destroyed) res.write(JSON.stringify(event) + '\n'); });
        res.end(); return;
      }
      if (req.method === 'POST' && req.url === '/api/speech') {
        if (!req.headers['content-type']?.startsWith('application/json')) throw new ProviderError(415, 'Cần JSON.');
        const body = await readBody(req);
        const audio = await synthesizeSpeech(body, controller.signal);
        res.writeHead(200, { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' }); res.end(audio); return;
      }
      if (req.method === 'GET' && req.url === '/api/local/status') return json(res, 200, await localStatus());
      if (req.method === 'GET' && req.url === '/api/providers') {
        const local = await localStatus();
        return json(res, 200, { providers: providers().map(p => p.id === 'ollama' ? { ...p, ready: local.modelReady, hint: local.message, fastModel: process.env.OLLAMA_FAST_MODEL || '', fastReady: local.models.includes(process.env.OLLAMA_FAST_MODEL || '') } : p), local });
      }
      if (req.method !== 'POST' || !['/api/chat', '/api/chat/stream'].includes(req.url || '')) return json(res, 404, { error: 'Không tìm thấy endpoint.' });
      if (!req.headers['content-type']?.startsWith('application/json')) throw new ProviderError(415, 'Cần Content-Type application/json.');
      const body = await readBody(req);
      const { provider, messages } = validateChat(body);
      if (provider === 'cloudflare') throw new ProviderError(503, 'Chạy npm run dev:cloudflare để dùng Workers AI.');
      const settings = replySettings(body.settings);
      const streaming = req.url === '/api/chat/stream';
      const emit = (value: unknown) => { if (!res.destroyed) { if (!res.headersSent) res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' }); res.write(JSON.stringify(value) + '\n'); } };
      const reply = provider === 'demo' ? demoReply(messages.at(-1)!.content) : await createProvider(provider).chat(messages, controller.signal, settings, streaming ? text => emit({ type: 'text', text }) : undefined);
      if (!res.destroyed) { if (streaming) { emit({ type: 'done', reply }); res.end(); } else json(res, 200, reply); }
    } catch (error) {
      if (res.headersSent) { if (!res.destroyed) res.end(JSON.stringify({ type: 'error', error: 'Phản hồi bị gián đoạn. Phần đã đọc có thể chưa đầy đủ; hãy thử lại.' }) + '\n'); return; }
      if (!res.destroyed) json(res, controller.signal.aborted ? 504 : error instanceof ProviderError ? error.status : 500, { error: controller.signal.aborted ? 'AI phản hồi quá lâu. Hãy thử lại hoặc đổi AI.' : error instanceof ProviderError ? error.message : 'Có lỗi xử lý. Hãy thử lại.' });
    } finally { clearTimeout(timer); }
  });
}
