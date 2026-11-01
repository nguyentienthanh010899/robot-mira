import { mkdir, writeFile } from 'node:fs/promises';
import { createProvider } from '../server/providers';
const results = [];
for (const mode of (process.argv.includes('--fast-only') ? ['fast'] as const : ['quality', 'fast'] as const)) {
  for (let run = 1; run <= 2; run++) {
    let first = false;
    console.log(`Testing ${mode}, run ${run}...`);
    try {
      const reply = await createProvider('ollama').chat([{ role: 'user', content: 'Giải thích vì sao ngủ đủ giấc có ích và gợi ý một thói quen dễ làm. Trả lời khoảng 6 câu tiếng Việt.' }], AbortSignal.timeout(180000), { mode, length: 'long' }, text => { if (!first && text.trim()) { first = true; console.log('First speech text received.'); } });
      const result = { mode, run, model: mode === 'fast' ? process.env.OLLAMA_FAST_MODEL : process.env.OLLAMA_MODEL, characters: reply.text.length, ...reply.metrics, text: reply.text };
      results.push(result); console.log(JSON.stringify(result, null, 2));
    } catch (error) { console.error(error instanceof Error ? error.message : 'Benchmark failed'); process.exitCode = 1; break; }
  }
}
await mkdir('data', { recursive: true });
await writeFile('data/brain-benchmark.json', JSON.stringify({ at: new Date().toISOString(), note: 'Two runs each, not p50/p95 or an evaluation of Vietnamese correctness. Cold/load state may differ.', results }, null, 2));
