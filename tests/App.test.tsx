import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../src/App';
import { useAmbient } from '../src/hooks/useAmbient';
import { renderHook } from '@testing-library/react';
let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
beforeEach(() => {
  media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ providers: [
    { id: 'demo', name: 'Demo', ready: true, model: 'Mẫu', hint: '' }, { id: 'gemini', name: 'Gemini', ready: true, model: 'test', hint: '' }, { id: 'groq', name: 'Groq', ready: false, model: '', hint: '' },
  ] }))));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('sends demo chat, changes all six face shapes and resets when switching provider', async () => {
  render(<App/>); fireEvent.click(screen.getByText('Bản chép lời và nhập văn bản dự phòng')); await screen.findByRole('option', { name: 'Gemini' });
  const shapes = new Set<string>();
  for (const label of ['Vui vẻ', 'Tò mò', 'Ngạc nhiên', 'Buồn', 'Giận dỗi', 'Suy tư']) { fireEvent.click(screen.getByRole('button', { name: label })); shapes.add(screen.getByTestId('face-mouth').getAttribute('d')!); }
  expect(shapes.size).toBe(6);
  fireEvent.change(screen.getByLabelText('Tin nhắn'), { target: { value: 'Xin chào' } }); fireEvent.click(screen.getByLabelText('Gửi tin nhắn'));
  await within(screen.getByRole('log')).findByText(/chớp mắt rất chuyên nghiệp/);
  fireEvent.change(screen.getByLabelText('Nhà cung cấp AI'), { target: { value: 'gemini' } });
  expect(screen.queryByText(/chớp mắt rất chuyên nghiệp/)).not.toBeInTheDocument(); expect(screen.getByText('Gemini · test')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /Groq/ })).toBeDisabled();
});
it('ignores late AI results after switching provider', async () => {
  render(<App/>); fireEvent.click(screen.getByText('Bản chép lời và nhập văn bản dự phòng')); await screen.findByRole('option', { name: 'Gemini' });
  fireEvent.change(screen.getByLabelText('Nhà cung cấp AI'), { target: { value: 'gemini' } });
  let resolve!: (response: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  fireEvent.change(screen.getByLabelText('Tin nhắn'), { target: { value: 'test' } }); fireEvent.click(screen.getByLabelText('Gửi tin nhắn'));
  expect(screen.getByRole('img')).toHaveAccessibleName('Khuôn mặt MIRA: Suy tư');
  fireEvent.change(screen.getByLabelText('Nhà cung cấp AI'), { target: { value: 'demo' } });
  await act(async () => resolve(new Response(JSON.stringify({ text: 'late result', emotion: 'happy', action: 'idle' }))));
  expect(screen.queryByText('late result')).not.toBeInTheDocument();
});
it('restores text on AI failure without using a demo answer', async () => {
  render(<App/>); fireEvent.click(screen.getByText('Bản chép lời và nhập văn bản dự phòng')); await screen.findByRole('option', { name: 'Gemini' });
  fireEvent.change(screen.getByLabelText('Nhà cung cấp AI'), { target: { value: 'gemini' } });
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Hết quota' }), { status: 429 }));
  fireEvent.change(screen.getByLabelText('Tin nhắn'), { target: { value: 'Tin nhắn của tôi' } }); fireEvent.click(screen.getByLabelText('Gửi tin nhắn'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Hết quota'));
  expect(screen.getByLabelText('Tin nhắn')).toHaveValue('Tin nhắn của tôi');
});
it('cleans up animation timers and respects reduced motion', () => {
  vi.useFakeTimers(); const { unmount } = renderHook(useAmbient); expect(vi.getTimerCount()).toBe(2); unmount(); expect(vi.getTimerCount()).toBe(0); expect(media.removeEventListener).toHaveBeenCalled();
  media.matches = true; const reduced = renderHook(useAmbient); expect(reduced.result.current.reduced).toBe(true); expect(vi.getTimerCount()).toBe(0); reduced.unmount();
});
it('runs microphone → demo reply → spoken audio, then interrupts audio for the next turn', async () => {
  const voice = { lang: 'vi-VN', name: 'Vietnamese', voiceURI: 'vi' };
  const synthesis = { getVoices: () => [voice], addEventListener: vi.fn(), removeEventListener: vi.fn(), cancel: vi.fn(), speak: vi.fn() };
  vi.stubGlobal('speechSynthesis', synthesis);
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
  let recognition: { onresult?: (e: unknown) => void; onend?: () => void; abort: ReturnType<typeof vi.fn> };
  vi.stubGlobal('webkitSpeechRecognition', class {
    onresult = undefined; onerror = undefined; onend = undefined; abort = vi.fn();
    constructor() { recognition = this; }
    start() {} stop() {}
  });
  render(<App/>); await screen.findByRole('option', { name: 'Gemini' });
  fireEvent.click(screen.getByLabelText(/Cho phép thử giọng trình duyệt/));
  fireEvent.click(screen.getByLabelText('Bắt đầu nói'));
  expect(screen.getByRole('status')).toHaveTextContent('đang nghe');
  expect(screen.getByRole('img')).toHaveAccessibleName('Khuôn mặt MIRA: Tò mò');
  act(() => recognition.onresult!({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: 'mình buồn' } }] }));
  expect(screen.getByRole('img')).toHaveAccessibleName('Khuôn mặt MIRA: Buồn');
  act(() => { recognition.onresult!({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'Xin chào' } }] }); recognition.onend!(); });
  await waitFor(() => expect(synthesis.speak).toHaveBeenCalledOnce());
  const utterance = synthesis.speak.mock.calls[0][0] as SpeechSynthesisUtterance;
  act(() => utterance.onstart!({} as SpeechSynthesisEvent));
  expect(screen.getByRole('status')).toHaveTextContent('MIRA đang nói');
  expect(utterance.text).toContain('Bẩm đại ca');
  fireEvent.click(screen.getByLabelText('Ngắt lời và nói'));
  expect(utterance.onend).toBeNull(); expect(screen.getByRole('status')).toHaveTextContent('đang nghe');
  fireEvent.click(screen.getByRole('button', { name: /^Dừng$/ }));
  expect(recognition!.abort).toHaveBeenCalled();
});
it('does not enable network-capable browser voice without explicit opt-in', async () => {
  vi.stubGlobal('webkitSpeechRecognition', class {});
  render(<App/>);
  await screen.findByRole('option', { name: 'Gemini' });
  expect(screen.getByLabelText('Bắt đầu nói')).toBeDisabled();
  expect(screen.getByLabelText(/Cho phép thử giọng trình duyệt/)).not.toBeChecked();
});
it('prefers an available Ollama model when the page first loads', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ providers: [
    { id: 'demo', name: 'Demo', ready: true, model: 'Mẫu', hint: '' },
    { id: 'ollama', name: 'Ollama', ready: true, model: 'qwen3.5:4b', hint: '' },
  ] })));
  render(<App/>);
  await waitFor(() => expect(screen.getByLabelText('Nhà cung cấp AI')).toHaveValue('ollama'));
});
it('defaults to detailed replies and lets the user choose length', async () => {
  render(<App/>); await screen.findByRole('option', { name: 'Gemini' });
  expect(screen.getByLabelText('Độ dài trả lời')).toHaveValue('long');
  fireEvent.change(screen.getByLabelText('Độ dài trả lời'), { target: { value: 'short' } });
  expect(screen.getByLabelText('Độ dài trả lời')).toHaveValue('short');
});
it('does not commit an interrupted streamed answer into conversation history', async () => {
  render(<App/>); fireEvent.click(screen.getByText('Bản chép lời và nhập văn bản dự phòng'));
  await screen.findByRole('option', { name: 'Gemini' });
  fireEvent.change(screen.getByLabelText('Nhà cung cấp AI'), { target: { value: 'gemini' } });
  vi.mocked(fetch).mockResolvedValueOnce(new Response('{"type":"text","text":"Phần chưa xong"}\n{"type":"error","error":"Luồng bị ngắt"}\n', { headers: { 'Content-Type': 'application/x-ndjson' } }));
  fireEvent.change(screen.getByLabelText('Tin nhắn'), { target: { value: 'Hỏi thử' } }); fireEvent.click(screen.getByLabelText('Gửi tin nhắn'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Luồng bị ngắt'));
  expect(screen.getByLabelText('Tin nhắn')).toHaveValue('Hỏi thử');
  expect(within(screen.getByRole('log')).queryByText('Phần chưa xong')).not.toBeInTheDocument();
});
