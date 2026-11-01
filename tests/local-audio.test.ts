import { afterEach, expect, it, vi } from 'vitest';
import { closeLocalAudio, createLocalAudioPlayer, speechSegments } from '../src/services/local-audio';
afterEach(() => { closeLocalAudio(); vi.unstubAllGlobals(); });
it('schedules decoded PCM and waits for playback completion', async () => {
  const sources: any[] = [];
  class Context {
    state = 'running'; currentTime = 0; destination = {};
    resume = vi.fn(async () => {}); close = vi.fn(async () => {});
    createBuffer(_channels: number, length: number, rate: number) { return { duration: length / rate, getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { const source = { buffer: null, onended: null, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() }; sources.push(source); return source; }
  }
  vi.stubGlobal('AudioContext', Context);
  const data = [{ type: 'audio', sampleRate: 48000, pcm: 'AAAAAA==' }, { type: 'done' }].map(e => JSON.stringify(e)).join('\n');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(data)));
  const callbacks = { start: vi.fn(), pause: vi.fn() };
  const player = createLocalAudioPlayer(callbacks);
  let finished = false; const promise = player.say('Hi', 'test', new AbortController().signal).then(() => { finished = true; });
  await vi.waitFor(() => expect(sources).toHaveLength(1));
  expect(finished).toBe(false); expect(callbacks.start).toHaveBeenCalledOnce();
  sources[0].onended(); await promise; expect(finished).toBe(true);
});
it('stops scheduled audio when the user cancels', async () => {
  const sources: any[] = [];
  class Context {
    state = 'running'; currentTime = 0; destination = {};
    resume = async () => {}; close = async () => {};
    createBuffer() { return { duration: .1, getChannelData: () => new Float32Array(2) }; }
    createBufferSource() { const source = { buffer: null, onended: null, connect() {}, disconnect() {}, start() {}, stop: vi.fn() }; sources.push(source); return source; }
  }
  vi.stubGlobal('AudioContext', Context);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"type":"audio","sampleRate":48000,"pcm":"AAAAAA=="}\n{"type":"done"}\n')));
  const player = createLocalAudioPlayer({ start() {} });
  const promise = player.say('Hi', 'test', new AbortController().signal);
  await vi.waitFor(() => expect(sources).toHaveLength(1));
  player.cancel(); await promise; expect(sources[0].stop).toHaveBeenCalledOnce(); expect(sources[0].onended).toBeNull();
});
it('buffers delayed PCM until done and schedules it without gaps', async () => {
  const sources: any[] = [];
  class Context {
    state = 'running'; currentTime = 0; destination = {};
    resume = async () => {}; close = async () => {};
    createBuffer(_channels: number, length: number, rate: number) { return { duration: length / rate, getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { const source = { buffer: null as any, onended: null as any, connect() {}, disconnect() {}, start: vi.fn(), stop() {} }; sources.push(source); return source; }
  }
  vi.stubGlobal('AudioContext', Context);
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();
  const response = new Response(new ReadableStream<Uint8Array>({ start(controller) { stream = controller; } }));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  const callbacks = { start: vi.fn() };
  const player = createLocalAudioPlayer(callbacks);
  const promise = player.say('Một câu đầy đủ.', 'test', new AbortController().signal);
  stream.enqueue(encoder.encode('{"type":"audio","sampleRate":48000,"pcm":"AAAAAA=="}\n'));
  await new Promise(resolve => setTimeout(resolve, 20));
  expect(sources).toHaveLength(0); expect(callbacks.start).not.toHaveBeenCalled();
  stream.enqueue(encoder.encode('{"type":"audio","sampleRate":48000,"pcm":"AAAAAA=="}\n{"type":"done"}\n'));
  stream.close();
  await vi.waitFor(() => expect(sources).toHaveLength(2));
  expect(sources[1].start.mock.calls[0][0]).toBeCloseTo(sources[0].start.mock.calls[0][0] + sources[0].buffer.duration, 10);
  sources[0].onended(); sources[1].onended(); await promise;
  expect(callbacks.start).toHaveBeenCalledOnce();
});

it('bounds synthesis requests without dropping text or splitting ordinary sentences', () => {
  const text = 'Bẩm đại ca, ' + 'Một câu dễ hiểu. '.repeat(80);
  const parts = speechSegments(text);
  expect(parts.length).toBeGreaterThan(1);
  expect(parts.every(part => part.length <= 500)).toBe(true);
  expect(parts.join(' ').replace(/\s+/g, ' ').trim()).toBe(text.replace(/\s+/g, ' ').trim());
});
it('finishes every synthesis request before starting a long reply', async () => {
  const sources: any[] = [];
  class Context {
    state = 'running'; currentTime = 0; destination = {};
    resume = async () => {}; close = async () => {};
    createBuffer() { return { duration: .1, getChannelData: () => new Float32Array(2) }; }
    createBufferSource() { const source = { buffer: null, onended: null as any, connect() {}, disconnect() {}, start: vi.fn(), stop() {} }; sources.push(source); return source; }
  }
  vi.stubGlobal('AudioContext', Context);
  const pcm = '{"type":"audio","sampleRate":48000,"pcm":"AAAAAA=="}\n{"type":"done"}\n';
  let finishSecond!: (response: Response) => void;
  const fetcher = vi.fn().mockResolvedValueOnce(new Response(pcm)).mockImplementationOnce(() => new Promise<Response>(resolve => { finishSecond = resolve; }));
  vi.stubGlobal('fetch', fetcher);
  const player = createLocalAudioPlayer({ start: vi.fn() });
  const promise = player.say('Một câu đủ ý. '.repeat(50), 'test', new AbortController().signal);
  await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(sources).toHaveLength(0);
  finishSecond(new Response(pcm));
  await vi.waitFor(() => expect(sources).toHaveLength(2));
  expect(sources[1].start.mock.calls[0][0]).toBeCloseTo(sources[0].start.mock.calls[0][0] + .1);
  sources.forEach(source => source.onended()); await promise;
});
