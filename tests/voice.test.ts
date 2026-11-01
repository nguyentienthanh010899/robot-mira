import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { browserSpeechOutput, createSpeechInput, vietnameseVoices, type Recognition, type RecognitionEvent } from '../src/services/voice';
class FakeRecognition implements Recognition {
  static latest: FakeRecognition;
  lang = ''; continuous = true; interimResults = false;
  onresult: Recognition['onresult'] = null; onerror: Recognition['onerror'] = null; onend: Recognition['onend'] = null;
  start = vi.fn(); stop = vi.fn(); abort = vi.fn();
  constructor() { FakeRecognition.latest = this; }
}
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('webkitSpeechRecognition', FakeRecognition); });
afterEach(() => { browserSpeechOutput.cancel(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('collects interim speech, sends the final Vietnamese transcript once on end', () => {
  const callbacks = { partial: vi.fn(), final: vi.fn(), error: vi.fn(), end: vi.fn() };
  const input = createSpeechInput(callbacks); input.start(); const recognition = FakeRecognition.latest;
  expect(recognition.lang).toBe('vi-VN'); expect(recognition.continuous).toBe(false);
  recognition.onresult!({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: 'xin' } }] } as RecognitionEvent);
  expect(callbacks.final).not.toHaveBeenCalled();
  recognition.onresult!({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'xin chào MIRA' } }] } as RecognitionEvent);
  recognition.onend!(); expect(callbacks.final).toHaveBeenCalledExactlyOnceWith('xin chào MIRA'); expect(vi.getTimerCount()).toBe(0);
});
it('cancels recognition and detaches late events', () => {
  const callbacks = { partial: vi.fn(), final: vi.fn(), error: vi.fn(), end: vi.fn() };
  const input = createSpeechInput(callbacks); input.start(); input.cancel();
  expect(FakeRecognition.latest.abort).toHaveBeenCalled(); expect(FakeRecognition.latest.onresult).toBeNull(); expect(vi.getTimerCount()).toBe(0);
});
it('reports denied microphone permission without sending a conversation', () => {
  const callbacks = { partial: vi.fn(), final: vi.fn(), error: vi.fn(), end: vi.fn() };
  createSpeechInput(callbacks).start(); FakeRecognition.latest.onerror!({ error: 'not-allowed' }); FakeRecognition.latest.onend!();
  expect(callbacks.error).toHaveBeenCalledWith(expect.stringContaining('Micro')); expect(callbacks.final).not.toHaveBeenCalled();
});
it('uses voice events for speaking and cancels without late callbacks', () => {
  const synth = { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => [{ lang: 'en-US' }, { lang: 'vi-VN', voiceURI: 'vi' }]) };
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
  const callbacks = { start: vi.fn(), end: vi.fn(), error: vi.fn() };
  expect(vietnameseVoices()).toHaveLength(1);
  browserSpeechOutput.speak('Xin chào', vietnameseVoices()[0], callbacks);
  const utterance = synth.speak.mock.calls[0][0] as SpeechSynthesisUtterance;
  expect(callbacks.start).not.toHaveBeenCalled(); utterance.onstart!({} as SpeechSynthesisEvent); expect(callbacks.start).toHaveBeenCalledOnce();
  browserSpeechOutput.cancel(); expect(utterance.onend).toBeNull(); expect(vi.getTimerCount()).toBe(0);
});
