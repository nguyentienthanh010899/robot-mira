/** Extract only a completed prefix of the top-level speech string. Never expose action JSON. */
export function speechPrefix(raw: string): string {
  const match = /^\s*\{\s*"speech"\s*:\s*"/.exec(raw);
  if (!match) return '';
  let end = match[0].length, escaped = false;
  for (; end < raw.length; end++) {
    const char = raw[end];
    if (!escaped && char === '"') break;
    if (!escaped && char === '\\') escaped = true; else escaped = false;
  }
  let content = raw.slice(match[0].length, end);
  // Drop incomplete escapes at a chunk boundary; preserve all complete JSON escapes.
  while (content.length) {
    try { return JSON.parse('"' + content + '"'); } catch { content = content.slice(0, -1); }
  }
  return '';
}
export async function readNDJSON(response: Response, signal: AbortSignal, receive: (data: Record<string, any>) => void) {
  if (!response.body) throw new Error('AI không có luồng phản hồi.');
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let pending = '';
  try {
    while (true) {
      signal.throwIfAborted(); const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      if (pending.length > 1_000_000) throw new Error('Luồng AI quá dài.');
      const lines = pending.split('\n'); pending = lines.pop()!;
      for (const line of lines) if (line.trim()) receive(JSON.parse(line));
      if (done) { if (pending.trim()) receive(JSON.parse(pending)); break; }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
