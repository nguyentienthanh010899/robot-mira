// Run after npm run dev. No paid API requests are made.
const base = process.env.MIRA_API_URL || 'http://127.0.0.1:3001';
const web = process.env.MIRA_WEB_URL || 'http://127.0.0.1:5173';
const post = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const checks = [
  ['frontend', web, undefined, 200],
  ['providers through Vite proxy', web + '/api/providers', undefined, 200],
  ['local status', base + '/api/local/status', undefined, 200],
  ['cloud locked', base + '/api/chat', post({ provider: 'groq', messages: [{role:'user',content:'Hi'}] }), 503],
  ['demo chat', base + '/api/chat', post({ provider: 'demo', messages: [{ role: 'user', content: 'Xin chào' }] }), 200],
  ['invalid provider', base + '/api/chat', post({ provider: 'invalid', messages: [] }), 400],
  ['external origin blocked', base + '/api/chat', { ...post({}), headers: { 'Content-Type': 'application/json', Origin: 'https://example.com' } }, 403],
];
for (const [name, url, init, expected] of checks) {
  if (name === 'cloud locked') {
    const metadata = await fetch(base + '/api/providers', { signal: AbortSignal.timeout(5000) }).then(r => r.json());
    if (metadata.providers.some(p => p.id === 'groq' && p.ready)) { console.log('SKIP cloud locked: Groq is explicitly enabled; no cloud inference sent.'); continue; }
  }
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(5000) });
  const body = await response.text();
  if (response.status !== expected) throw new Error(`${name}: HTTP ${response.status}, expected ${expected}`);
  if (name === 'frontend' && !body.includes('/src/main.tsx')) throw new Error('Missing frontend entry');
  if (name === 'demo chat' && !JSON.parse(body).text) throw new Error('Missing demo reply');
  if (name === 'providers through Vite proxy') {
    const options = JSON.parse(body).providers;
    if (options.length !== 4 || options.some(p => 'key' in p || 'apiKey' in p)) throw new Error('Invalid provider metadata');
  }
  console.log(`PASS ${name}: HTTP ${response.status}`);
}
