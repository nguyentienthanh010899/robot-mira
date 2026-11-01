export interface RecognitionEvent { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }
export interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
export function recognitionConstructor(): (new () => Recognition) | undefined {
  const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return browser.SpeechRecognition || browser.webkitSpeechRecognition;
}
export interface SpeechInput { start(): void; stop(): void; cancel(): void }
export interface SpeechOutput { speak(text: string, voice: SpeechSynthesisVoice, callbacks: { start(): void; end(): void; error(message: string): void }): void; cancel(): void }
const recognitionErrors: Record<string, string> = {
  'not-allowed': 'Micro chưa được cho phép. Hãy bật quyền micro trong trình duyệt và macOS.',
  'service-not-allowed': 'Dịch vụ nhận giọng nói chưa được cho phép trên trình duyệt này.',
  'audio-capture': 'Không tìm thấy micro khả dụng. Hãy kiểm tra thiết bị đầu vào.',
  'no-speech': 'Mình chưa nghe rõ. Nhấn micro để nói lại nhé.',
  network: 'Nhận giọng nói bị lỗi mạng. Hãy kiểm tra Internet và thử lại.',
  'language-not-supported': 'Dịch vụ nhận giọng nói này chưa hỗ trợ tiếng Việt.',
};
export function createSpeechInput(callbacks: { partial(text: string): void; final(text: string): void; error(message: string): void; end(): void }): SpeechInput {
  const Constructor = recognitionConstructor();
  if (!Constructor) throw new Error('Trình duyệt chưa hỗ trợ nhận giọng nói. Hãy thử Chrome hoặc dùng nhập văn bản.');
  const recognition = new Constructor(); recognition.lang = 'vi-VN'; recognition.continuous = false; recognition.interimResults = true;
  let cancelled = false, final = '', failed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function detach() { clearTimeout(timer); recognition.onresult = null; recognition.onerror = null; recognition.onend = null; }
  recognition.onresult = event => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]; if (result.isFinal) final += result[0].transcript + ' '; else interim += result[0].transcript;
    }
    callbacks.partial((final + interim).trim());
  };
  recognition.onerror = event => { if (cancelled) return; failed = true; if (event.error !== 'aborted') callbacks.error(recognitionErrors[event.error] || 'Không nhận được giọng nói. Hãy thử lại.'); };
  recognition.onend = () => { detach(); if (cancelled) return; callbacks.end(); if (final.trim() && !failed) callbacks.final(final.trim().slice(0, 4000)); else if (!failed) callbacks.error('Chưa nhận được câu nói. Nhấn micro để thử lại.'); };
  return {
    start() {
      try { recognition.start(); timer = setTimeout(() => { if (!cancelled) recognition.stop(); }, 20000); }
      catch { detach(); throw new Error('Không mở được micro. Hãy thử lại hoặc kiểm tra quyền micro.'); }
    },
    stop() { clearTimeout(timer); recognition.stop(); },
    cancel() { cancelled = true; detach(); recognition.abort(); },
  };
}
export const browserSpeechOutput: SpeechOutput = {
  speak(text, voice, callbacks) {
    this.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'vi-VN'; utterance.voice = voice; utterance.rate = 1;
    let ended = false;
    const finish = (message?: string) => { if (ended) return; ended = true; clearTimeout(timer); utterance.onstart = null; utterance.onend = null; utterance.onerror = null; if (message) callbacks.error(message); else callbacks.end(); };
    const timer = setTimeout(() => { finish('Không phát được giọng nói hoặc thời gian phát quá lâu. Hãy bấm Nghe lại.'); window.speechSynthesis.cancel(); }, 90000);
    utterance.onstart = () => callbacks.start(); utterance.onend = () => finish();
    utterance.onerror = event => finish(event.error === 'canceled' || event.error === 'interrupted' ? undefined : 'Không phát được giọng Việt. Hãy kiểm tra loa và bấm Nghe lại.');
    currentCleanup = () => { ended = true; clearTimeout(timer); utterance.onstart = null; utterance.onend = null; utterance.onerror = null; };
    try { window.speechSynthesis.speak(utterance); } catch { finish('Trình duyệt không phát được giọng nói. Hãy bấm Nghe lại.'); }
  },
  cancel() { currentCleanup?.(); currentCleanup = undefined; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); },
};
let currentCleanup: (() => void) | undefined;
export function vietnameseVoices() { return 'speechSynthesis' in window ? window.speechSynthesis.getVoices().filter(v => /^vi(?:-|_|$)/i.test(v.lang)) : []; }
