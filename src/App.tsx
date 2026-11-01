import { useEffect, useRef, useState, type FormEvent } from 'react';
import { browserSpeechOutput, createSpeechInput, recognitionConstructor, vietnameseVoices, type SpeechInput } from './services/voice';
import { createSpeechQueue, localVoices, type SpeechQueue, type VoiceInfo } from './services/speech-queue';
import { unlockLocalAudio, closeLocalAudio } from './services/local-audio';
import RobotFace from './components/RobotFace';
import { reactToInput } from './engine/emotion';
import { demoReply } from './engine/conversation';
import { chat, getProviders } from './services/chat';
import { emotions, emotionLabels, type Emotion, type Message, type ProviderId, type ProviderOption, type ReplySettings, type Status } from './types';
const defaults: ProviderOption[] = [
  { id: 'demo', name: 'Demo', ready: true, model: 'Phản hồi mẫu', hint: 'Không cần key · không phải AI thật' },
  { id: 'cloudflare', name: 'Cloudflare Workers AI', ready: false, model: '', hint: 'Chạy npm run dev:cloudflare hoặc mở bản deploy' },
  ...(['gemini', 'groq', 'ollama'] as const).map(id => ({ id, name: { gemini: 'Gemini', groq: 'Groq', ollama: 'Ollama' }[id], ready: false, model: '', hint: 'Chưa cấu hình phía server' })),
];
const initial: Message = { role: 'assistant', content: 'Bẩm đại ca, đệ là MIRA. Đại ca muốn kể chuyện hay nghe một câu đùa? ✨' };
const statusLabels: Record<Status, string> = { idle: 'Nhấn micro để nói chuyện', listening: 'Mình đang nghe…', thinking: 'Đang suy nghĩ…', speaking: 'MIRA đang nói…', error: 'Cần kiểm tra kết nối' };
export default function App() {
  const [provider, setProvider] = useState<ProviderId>('demo');
  const [options, setOptions] = useState(defaults); const [notice, setNotice] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('happy'); const [status, setStatus] = useState<Status>('idle');
  const [messages, setMessages] = useState<Message[]>([initial]); const [input, setInput] = useState(''); const [error, setError] = useState('');
  const [settings, setSettings] = useState<ReplySettings>({ length: 'long', mode: 'fast' });
  const [streamText, setStreamText] = useState('');
  const [metrics, setMetrics] = useState('');
  const [tts, setTts] = useState<VoiceInfo>({ ready: false, voices: [] });
  const [ttsKind, setTtsKind] = useState<'local' | 'browser' | 'mute'>('local');
  const [localVoice, setLocalVoice] = useState('');
  const turnSpeech = useRef<SpeechQueue | null>(null);
  const [animation, setAnimation] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [supported, setSupported] = useState(false);
  const [browserVoiceEnabled, setBrowserVoiceEnabled] = useState(false);
  const interacted = useRef(false);
  const microphone = useRef<SpeechInput | null>(null);
  const voiceGeneration = useRef(0);
  useEffect(() => {
    setSupported(!!recognitionConstructor());
    const update = () => setVoices(vietnameseVoices()); update();
    if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => { microphone.current?.cancel(); voiceGeneration.current++; turnSpeech.current?.cancel(); closeLocalAudio(); browserSpeechOutput.cancel(); if ('speechSynthesis' in window) window.speechSynthesis.removeEventListener('voiceschanged', update); };
  }, []);
  function stopVoice() { turnSpeech.current?.cancel(); turnSpeech.current = null; voiceGeneration.current++; microphone.current?.cancel(); microphone.current = null; browserSpeechOutput.cancel(); setAnimation(false); }
  function makeSpeechQueue(): SpeechQueue | null {
    const generation = voiceGeneration.current;
    const callbacks = {
      start: () => { if (generation === voiceGeneration.current) { setStatus('speaking'); setAnimation(true); } },
      pause: () => { if (generation === voiceGeneration.current) { setAnimation(false); setStatus(active.current ? 'thinking' : 'idle'); } },
      end: () => { if (generation === voiceGeneration.current) { setStatus(active.current ? 'thinking' : 'idle'); setAnimation(false); } },
      error: (message: string) => { if (generation === voiceGeneration.current) { setVoiceError(message); setStatus(active.current ? 'thinking' : 'error'); setAnimation(false); } },
    };
    if (ttsKind === 'mute') return null;
    if (ttsKind === 'local' && tts.ready && tts.voices.length) return createSpeechQueue({ kind: 'local', voice: localVoice || tts.voices.find(v => v === 'Hải Đăng') || tts.voices[0] }, callbacks);
    // Explicitly opted-in browser output is the fallback when local TTS is not running.
    if (!browserVoiceEnabled) return null;
    const voice = voices.find(v => v.voiceURI === voiceURI) || voices[0];
    if (!voice) { setVoiceError('Thiết bị chưa có giọng tiếng Việt. Cài giọng Việt trong hệ điều hành rồi tải lại trang.'); return null; }
    return createSpeechQueue({ kind: 'browser', voice }, callbacks);
  }
  function speak(text: string) { if (tts.ready) { try { unlockLocalAudio(); } catch {} } stopVoice(); setVoiceError(''); setStatus('idle'); const queue = makeSpeechQueue(); turnSpeech.current = queue; queue?.update(text, true); }
  function startListening() {
    if (!browserVoiceEnabled) return;
    if (tts.ready) { try { unlockLocalAudio(); } catch {} }
    interacted.current = true; cancel(); setMessages(m => m.at(-1)?.role === 'user' ? m.slice(0, -1) : m); setError(''); setVoiceError(''); setTranscript(''); setEmotion('curious');
    const generation = voiceGeneration.current;
    try {
      const listening = createSpeechInput({
        partial: text => { if (generation === voiceGeneration.current) { setTranscript(text); setEmotion(reactToInput(text)); } },
        final: text => { if (generation === voiceGeneration.current) { microphone.current = null; void send(undefined, text); } },
        error: message => { if (generation === voiceGeneration.current) { setVoiceError(message); setStatus('error'); } },
        end: () => { if (generation === voiceGeneration.current) { microphone.current = null; setStatus(current => current === 'listening' ? 'idle' : current); } },
      });
      microphone.current = listening; setStatus('listening'); listening.start();
    } catch (e) { microphone.current = null; setVoiceError(e instanceof Error ? e.message : 'Không mở được micro.'); setStatus('error'); }
  }
  const active = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const controller = new AbortController(); getProviders(controller.signal).then(items => { setOptions(items); if (!interacted.current) { const preferred = items.find(p => p.id === 'cloudflare' && p.ready) || items.find(p => p.id === 'ollama' && p.ready); if (preferred) setProvider(preferred.id); } if (items.some(p => p.id === 'cloudflare' && p.ready)) { setTtsKind('browser'); setNotice('AI chạy trên Cloudflare. Để nghe và nói, bật cho phép giọng trình duyệt và chọn giọng tiếng Việt trên thiết bị.'); } }).catch(() => { if (!controller.signal.aborted) setNotice('Backend chưa sẵn sàng. Demo vẫn hoạt động; chạy npm run dev để mở các AI đã cấu hình.'); }); return () => controller.abort(); }, []);
  useEffect(() => { const controller = new AbortController(); localVoices(controller.signal).then(info => { if (info.ready && Array.isArray(info.voices)) setTts(info); }).catch(() => {}); return () => controller.abort(); }, []);
  useEffect(() => () => { active.current?.abort(); }, []);
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, status]);
  function cancel() { stopVoice(); active.current?.abort(); active.current = null; setStatus('idle'); setAnimation(false); setStreamText(''); }
  function reset(id = provider) { interacted.current = true; cancel(); setProvider(id); setMessages([initial]); setEmotion('happy'); setError(''); setVoiceError(''); setTranscript(''); setInput(''); setStreamText(''); setMetrics(''); }
  async function send(event?: FormEvent, suggestion?: string) {
    event?.preventDefault(); const text = (suggestion || input).trim(); if (!text || active.current) return;
    if (tts.ready) { try { unlockLocalAudio(); } catch {} }
    interacted.current = true; cancel(); const controller = new AbortController(); active.current = controller;
    // Keep complete user/assistant pairs; initial greeting is presentation only.
    const history = messages.slice(1).slice(-20); const next: Message[] = [...history, { role: 'user', content: text }];
    setMessages([initial, ...next]); setInput(''); setError(''); setEmotion(reactToInput(text)); setStatus('thinking'); setStreamText(''); setVoiceError('');
    const queue = makeSpeechQueue(); turnSpeech.current = queue;
    const timeout = setTimeout(() => controller.abort(), 180000);
    try {
      const reply = provider === 'demo' ? demoReply(text) : await chat(provider, next.slice(-21), controller.signal, { ...settings, mode: options.find(p => p.id === provider)?.fastReady ? settings.mode : 'quality' }, text => { if (active.current !== controller || controller.signal.aborted) return; setStreamText(text); });
      if (active.current !== controller || controller.signal.aborted) return;
      setMessages([initial, ...next, { role: 'assistant', content: reply.text }]); setEmotion(reply.emotion); setStreamText(''); active.current = null;
      setStatus(current => current === 'speaking' ? current : 'idle');
      queue?.update(reply.text, true);
      if (reply.metrics) setMetrics(`${reply.metrics.firstTextMs !== undefined ? `Bắt đầu có chữ: ${(reply.metrics.firstTextMs / 1000).toFixed(1)}s · ` : ''}Hoàn tất: ${(reply.metrics.totalMs / 1000).toFixed(1)}s`);
    } catch (e) {
      if (active.current !== controller) return;
      queue?.cancel(); setStreamText(''); setAnimation(false); setMessages([initial, ...history]); setInput(text);
      setError(controller.signal.aborted ? 'Yêu cầu đã hết thời gian chờ. Bạn có thể gửi lại hoặc đổi AI.' : e instanceof Error ? e.message : 'Không thể gửi tin nhắn.'); setStatus('error');
    } finally { clearTimeout(timeout); if (active.current === controller) active.current = null; }
  }
  const displayedEmotion = status === 'thinking' ? 'thinking' : emotion;
  const selected = options.find(p => p.id === provider)!;
  const shownReply = streamText || (messages.length > 1 && messages.at(-1)?.role === 'assistant' ? messages.at(-1)!.content : '');
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="MIRA trang chủ"><span className="brand-symbol">m<span>·</span></span><span>MIRA<span className="brand-ai"> AI</span></span></a><span className="project-tag">COMPANION LAB <span>/</span> 0.1</span><span className="local-badge"><i/> Local workspace</span></header>
    <main><div className="page-heading"><div><p className="eyebrow">MỘT NGƯỜI BẠN NHỎ, MỘT THẾ GIỚI LỚN</p><h1>Xin chào, mình là MIRA<span> ✳</span></h1><p>Cùng trò chuyện, khám phá và thêm một chút vui vào ngày của bạn.</p></div><button className="quiet-button" onClick={() => reset()}>↻ <span>Cuộc trò chuyện mới</span></button></div>
    <div className="workspace"><section className="face-panel" aria-label="Khuôn mặt và cảm xúc"><div className="panel-top"><span><i className="live-dot"/> MIRA ONLINE</span><span className="small-tag">{provider === 'demo' ? 'DEMO' : selected.name.toUpperCase()}</span></div><div className="face-stage"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><RobotFace emotion={displayedEmotion} speaking={animation} thinking={status === 'thinking'}/><div className="stage-floor"/></div><div className="robot-caption"><span className={`status-dot ${status}`}/><span role="status">{statusLabels[status]}</span></div><div className="emotion-heading"><span>BIỂU CẢM TỰ ĐỘNG</span><b>{emotionLabels[displayedEmotion]}</b></div><div className="emotion-grid">{emotions.map((value, i) => <button key={value} aria-pressed={displayedEmotion === value} onClick={() => setEmotion(value)} className={displayedEmotion === value ? 'emotion active' : 'emotion'}><span aria-hidden="true">{['◡', '◔', '◎', '⌢', '≋', '∴'][i]}</span>{emotionLabels[value]}</button>)}</div><div className="face-footer"><span>Tự phản ứng theo lời bạn nói</span><span>Khẩu hình theo nhịp nói gần đúng</span></div></section>
    <section className="chat-panel" aria-label="Trò chuyện"><div className="chat-header"><div><span className="chat-icon">✦</span><div><h2>Chuyện trò với MIRA</h2><p>{provider === 'demo' ? 'Phản hồi mẫu · chưa kết nối AI thật' : `${selected.name} · ${settings.mode === 'fast' && selected.fastReady ? selected.fastModel : selected.model}`}</p></div></div><span className="tiny-dots">•••</span></div><div className="voice-conversation"><p className="eyebrow">NÓI CHUYỆN VỚI MIRA</p><p className="voice-warning">{tts.ready ? 'Giọng Việt local đã sẵn sàng · không phí API.' : 'Giọng Việt local: chạy npm run speech:serve rồi bấm Làm mới giọng.'}</p><label className="browser-voice-toggle"><input type="checkbox" checked={browserVoiceEnabled} onChange={e => { cancel(); setBrowserVoiceEnabled(e.target.checked); }}/> Cho phép thử giọng trình duyệt (có thể cần mạng)</label><div className="voice-quality-controls"><label>Giọng đọc <select aria-label="Nguồn giọng đọc" value={ttsKind} onChange={e => { cancel(); setTtsKind(e.target.value as typeof ttsKind); }}><option value="local">Giọng Việt local{!tts.ready ? ' — chưa mở' : ''}</option><option value="browser" disabled={!browserVoiceEnabled}>Giọng trình duyệt</option><option value="mute">Tắt tiếng</option></select></label>{tts.ready && <label>Nhân vật <select aria-label="Giọng Việt local" value={localVoice || tts.voices.find(v => v === 'Hải Đăng') || tts.voices[0]} onChange={e => { cancel(); setLocalVoice(e.target.value); }}>{tts.voices.map(v => <option key={v} value={v}>{v}</option>)}</select></label>}<button onClick={() => { const controller = new AbortController(); void localVoices(controller.signal).then(info => { setTts(info); setVoiceError(info.ready ? '' : info.message || 'Chưa mở giọng local.'); }).catch(() => setVoiceError('Chưa mở giọng local.')); }}>Làm mới giọng</button></div><h2>{status === 'listening' ? 'Mình đang lắng nghe bạn' : status === 'speaking' ? 'Mình đang trả lời bạn' : 'Bạn nói, mình nghe'}</h2><button className={`microphone ${status === 'listening' ? 'listening' : ''}`} disabled={!browserVoiceEnabled || !supported || status === 'thinking'} aria-label={status === 'listening' ? 'Nói xong' : status === 'speaking' ? 'Ngắt lời và nói' : 'Bắt đầu nói'} onClick={() => status === 'listening' ? microphone.current?.stop() : startListening()}>{status === 'listening' ? '■' : '🎙'}</button><p>{status === 'listening' ? 'Nói tự nhiên. Nhấn lần nữa khi nói xong.' : 'Nhấn micro, nói một câu rồi đợi MIRA trả lời.'}</p><div className="voice-actions"><button onClick={() => { cancel(); setMessages(m => m.at(-1)?.role === 'user' ? m.slice(0, -1) : m); }}>Dừng</button><button disabled={(!browserVoiceEnabled && !tts.ready) || status === 'thinking' || status === 'listening'} onClick={() => speak(messages.filter(m => m.role === 'assistant').at(-1)!.content)}>Nghe lại</button></div>{!supported && <p className="voice-warning">Trình duyệt chưa hỗ trợ nhận giọng nói. Thử Chrome hoặc mở phần nhập văn bản bên dưới.</p>}{!voices.length && !tts.ready && <p className="voice-warning">Chưa tìm thấy giọng Việt trên thiết bị. Cần cài giọng Việt để MIRA trả lời bằng tiếng.</p>}{voices.length > 0 && <label className="voice-select">Giọng MIRA <select aria-label="Giọng MIRA" value={voiceURI || voices[0].voiceURI} onChange={e => { cancel(); setVoiceURI(e.target.value); }}>{voices.map(v => <option value={v.voiceURI} key={v.voiceURI}>{v.name}</option>)}</select></label>}{transcript && <p className="transcript">Bạn vừa nói: “{transcript}”</p>}{voiceError && <p className="voice-warning" role="alert">{voiceError}</p>}<p className="voice-privacy">Micro chỉ mở khi bạn nhấn nút. Nhận giọng nói có thể gửi âm thanh đến dịch vụ của trình duyệt và cần Internet.</p></div>{shownReply && <div className="live-reply" aria-live="polite"><b>{streamText ? 'MIRA đang trả lời' : 'MIRA'}</b><p>{shownReply}</p>{streamText && <small>Nội dung đang được tạo, chưa hoàn tất.</small>}</div>}{error && <p className="error" role="alert">{error}</p>}{metrics && <p className="latency">{metrics}</p>}<details className="text-fallback"><summary>Bản chép lời và nhập văn bản dự phòng</summary><div className="messages" ref={listRef} role="log" aria-label="Lịch sử hội thoại" aria-live="polite">{messages.map((message, i) => <div className={`message ${message.role}`} key={i}>{message.role === 'assistant' && <span className="avatar">m·</span>}<div><span className="message-name">{message.role === 'assistant' ? 'MIRA' : 'Bạn'}</span><p>{message.content}</p></div></div>)}{status === 'thinking' && <div className="typing">MIRA đang nghĩ <span>● ● ●</span></div>}</div>{messages.length === 1 && <div className="suggestions">{['Kể một câu đùa', 'Hôm nay mình hơi mệt'].map(text => <button key={text} onClick={() => void send(undefined, text)}>{text} ↗</button>)}</div>}<form onSubmit={send} className="composer"><label className="sr-only" htmlFor="message">Tin nhắn</label><input id="message" value={input} maxLength={4000} onChange={e => setInput(e.target.value)} placeholder="Kể mình nghe điều gì đó…" disabled={status === 'thinking'}/>{status === 'thinking' ? <button type="button" onClick={() => { cancel(); setMessages(m => m.at(-1)?.role === 'user' ? m.slice(0, -1) : m); }} aria-label="Hủy yêu cầu">■</button> : <button type="submit" disabled={!input.trim()} aria-label="Gửi tin nhắn">↑</button>}</form><p className="chat-note">{provider === 'demo' ? 'Demo dùng phản hồi mẫu. Giọng nói sử dụng dịch vụ của trình duyệt và thiết bị.' : 'Tin nhắn được gửi tới AI đã chọn. Chưa bật lưu hội thoại lâu dài.'}</p></details></section></div>
    <section className="settings-panel" aria-label="Cấu hình AI"><div className="settings-title"><span className="settings-icon">⌘</span><div><h2>Bộ não của MIRA</h2><p>Ưu tiên Ollama local. Cloud chỉ bật khi bạn chủ động cho phép. Đổi AI sẽ tạo cuộc trò chuyện mới.</p></div></div><div className="provider-control"><label htmlFor="provider">Nhà cung cấp AI</label><select id="provider" value={provider} onChange={e => reset(e.target.value as ProviderId)}>{options.map(option => <option key={option.id} value={option.id} disabled={!option.ready}>{option.name}{!option.ready ? ' — chưa cấu hình' : ''}</option>)}</select></div><div className="provider-detail"><span className="small-tag">{provider === 'demo' ? 'KHÔNG CẦN KEY' : 'ĐÃ CẤU HÌNH'}</span><p>{selected.model || selected.hint}</p></div><div className="reply-preferences"><label>Độ dài trả lời <select aria-label="Độ dài trả lời" value={settings.length} onChange={e => setSettings(s => ({ ...s, length: e.target.value as ReplySettings['length'] }))}><option value="short">Ngắn</option><option value="normal">Vừa đủ</option><option value="long">Chi tiết</option></select></label><label>Chế độ AI <select aria-label="Chế độ AI" value={selected.fastReady ? settings.mode : 'quality'} onChange={e => setSettings(s => ({ ...s, mode: e.target.value as ReplySettings['mode'] }))}><option value="quality">Chất lượng · model hiện tại</option><option value="fast" disabled={!selected.fastReady}>Nhanh · model nhỏ hơn</option></select></label><p>Chi tiết tạo nhiều nội dung hơn nên thời gian hoàn tất có thể dài hơn. MIRA hiện và đọc từng đoạn khi được hỗ trợ.</p></div><details className="setup-help"><summary>Cách bật AI local hoặc cloud tùy chọn</summary><p>Ưu tiên <code>OLLAMA_MODEL</code> và Ollama local. Chạy <code>npm run brain:check</code> để kiểm tra. Cloud cần <code>ALLOW_CLOUD_AI=true</code> cùng key/model; ứng dụng không tự chuyển sang cloud. Copy <code>.env.example</code> thành <code>.env</code>, điền key và model của AI muốn dùng rồi khởi động lại <code>npm run dev</code> và tải lại trang. Ollama cần dịch vụ local đang chạy. Ollama được kiểm tra model đã tải khi mở trang, nhưng vẫn cần thử inference. Cloud mới chỉ kiểm tra cấu hình. Chọn model có free tier trong tài khoản; ứng dụng không tự kiểm tra giá. Không nhập key vào chat.</p></details>{notice && <p className="connection-note">{notice}</p>}</section>
    <footer className="page-footer"><span>MIRA / Một chút công nghệ, nhiều chút gần gũi.</span><span>DESIGNED TO BE YOUR LITTLE COMPANION <span>✦</span></span></footer></main></div>;
}
