import { performance } from 'node:perf_hooks';
export function localBaseUrl(env: Record<string, string | undefined> = process.env) {
  const url = new URL(env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('OLLAMA_BASE_URL phải là HTTP loopback local, ví dụ http://127.0.0.1:11434.');
  return url.origin;
}
export async function localStatus(env: Record<string, string | undefined> = process.env) {
  const started = performance.now();
  try {
    const response = await fetch(`${localBaseUrl(env)}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json() as { models?: unknown };
    if (!Array.isArray(data.models)) throw new Error('invalid');
    const models = data.models.map((m: { name?: unknown }) => m?.name).filter((n: unknown): n is string => typeof n === 'string' && !/cloud/i.test(n)).slice(0, 100);
    const model = env.OLLAMA_MODEL || '';
    const modelReady = !!model && models.some((name: string) => name === model || name === `${model}:latest`);
    return { reachable: true, model, modelReady, models, checkMs: Math.round(performance.now() - started), message: modelReady ? 'Model local đã có. Cần thử inference để xác nhận.' : 'Ollama đang chạy nhưng model cấu hình chưa có. Xem workflow/PHASE-01-LOCAL-BRAIN.md.' };
  } catch {
    return { reachable: false, model: env.OLLAMA_MODEL || '', modelReady: false, models: [] as string[], checkMs: Math.round(performance.now() - started), message: 'Chưa kết nối được Ollama local. Khởi động Ollama và kiểm tra model; không tự chuyển sang cloud.' };
  }
}
