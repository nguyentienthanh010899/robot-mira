"""Loopback-only Vietnamese TTS. No paid API. Models download once into data/huggingface."""
import base64
import argparse
import io
import json
import os
from pathlib import Path
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('HF_HOME', str(ROOT / 'data' / 'huggingface'))
os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY', '1')
os.environ.setdefault('GRADIO_ANALYTICS_ENABLED', 'False')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--prepare', action='store_true')
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    if args.offline:
        os.environ['HF_HUB_OFFLINE'] = '1'
    from vieneu import Vieneu
    import soundfile as sf
    print('Loading VieNeu v3 Turbo CPU/ONNX fp32 (first run downloads model)...', flush=True)
    started = time.monotonic()
    model = Vieneu(mode='v3turbo', backend='onnx', precision='fp32', threads=int(os.environ.get('MIRA_TTS_THREADS', '2')))
    voices = [str(voice_id) for _, voice_id in model.list_preset_voices()]
    lock = threading.Lock()
    print(json.dumps({'engine': 'VieNeu v3 Turbo CPU', 'voices': voices, 'loadSeconds': round(time.monotonic() - started, 2)}, ensure_ascii=False), flush=True)
    if args.prepare:
        started = time.monotonic()
        audio = model.infer('Chào bạn, mình là MIRA. Hôm nay bạn muốn kể mình nghe chuyện gì?', voice='Hải Đăng' if 'Hải Đăng' in voices else voices[0])
        output = ROOT / 'data' / 'voice-preview.wav'
        output.parent.mkdir(parents=True, exist_ok=True)
        model.save(audio, str(output))
        print(json.dumps({'preview': str(output), 'synthesisSeconds': round(time.monotonic() - started, 2)}, ensure_ascii=False), flush=True)
        return

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Do not log text or voice samples.

        def send_json(self, code, value):
            self.send_response(code)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(value, ensure_ascii=False).encode())

        def allowed(self):
            host = self.headers.get('Host', '').split(':')[0]
            return host in ('127.0.0.1', 'localhost') and not self.headers.get('Origin')

        def do_GET(self):
            if not self.allowed():
                return self.send_json(403, {'error': 'Local server calls only'})
            if self.path == '/voices':
                return self.send_json(200, {'voices': voices})
            return self.send_json(404, {'error': 'Not found'})

        def do_POST(self):
            if not self.allowed():
                return self.send_json(403, {'error': 'Local server calls only'})
            if self.path not in ('/speech', '/speech/stream'):
                return self.send_json(404, {'error': 'Not found'})
            if not lock.acquire(blocking=False):
                return self.send_json(429, {'error': 'Speech engine busy'})
            streaming = False
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if length < 1 or length > 10000:
                    return self.send_json(400, {'error': 'Invalid size'})
                body = json.loads(self.rfile.read(length))
                text, voice = body.get('text'), body.get('voice')
                if not isinstance(text, str) or not text.strip() or len(text) > 600 or voice not in voices:
                    return self.send_json(400, {'error': 'Invalid text or voice'})
                if self.path == '/speech/stream':
                    streaming = True
                    import numpy as np
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/x-ndjson')
                    self.send_header('Cache-Control', 'no-store')
                    self.end_headers()
                    for chunk in model.infer_stream(text, voice=voice):
                        pcm = (np.clip(chunk, -1, 1) * 32767).astype('<i2').tobytes()
                        event = {'type': 'audio', 'sampleRate': 48000, 'pcm': base64.b64encode(pcm).decode('ascii')}
                        self.wfile.write((json.dumps(event) + '\n').encode())
                        self.wfile.flush()
                    self.wfile.write(b'{"type":"done"}\n')
                    self.wfile.flush()
                    return
                audio = model.infer(text, voice=voice)
                wav = io.BytesIO()
                sf.write(wav, audio, 48000, format='WAV', subtype='PCM_16')
                self.send_response(200)
                self.send_header('Content-Type', 'audio/wav')
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(wav.getvalue())
            except (BrokenPipeError, ConnectionResetError):
                pass
            except (ValueError, TypeError):
                if streaming:
                    self.wfile.write(b'{"type":"error","error":"Speech synthesis failed"}\n')
                else:
                    self.send_json(400, {'error': 'Invalid request'})
            except Exception as error:
                print(f'TTS error: {type(error).__name__}', flush=True)
                if streaming:
                    self.wfile.write(b'{"type":"error","error":"Speech synthesis failed"}\n')
                else:
                    self.send_json(503, {'error': 'Speech synthesis failed'})
            finally:
                lock.release()
    print('MIRA local TTS: http://127.0.0.1:3002', flush=True)
    server = ThreadingHTTPServer(('127.0.0.1', 3002), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
