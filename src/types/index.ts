export const emotions = ['happy', 'curious', 'surprised', 'sad', 'angry', 'thinking'] as const;
export type Emotion = typeof emotions[number];
export type ProviderId = 'demo' | 'gemini' | 'groq' | 'ollama' | 'cloudflare';
export type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export const actionTypes = ['LOOK_LEFT', 'LOOK_RIGHT', 'LOOK_UP', 'LOOK_DOWN', 'BLINK', 'HAPPY_ANIMATION', 'SAD_ANIMATION', 'STOP'] as const;
export type RobotAction = { type: typeof actionTypes[number]; count?: number };
export const voiceStyles = ['neutral', 'happy', 'sad', 'slightly_annoyed', 'excited', 'sleepy', 'worried'] as const;
export interface Reply {
  text: string; emotion: Emotion; action: 'idle';
  speech?: string; actions?: RobotAction[]; voice_style?: typeof voiceStyles[number];
  metrics?: { totalMs: number; generationMs?: number; tokens?: number; firstTextMs?: number };
}
export interface Message { role: 'user' | 'assistant'; content: string }
export interface ProviderOption { id: ProviderId; name: string; ready: boolean; model: string; hint: string; fastModel?: string; fastReady?: boolean }
export const emotionLabels: Record<Emotion, string> = { happy: 'Vui vẻ', curious: 'Tò mò', surprised: 'Ngạc nhiên', sad: 'Buồn', angry: 'Giận dỗi', thinking: 'Suy tư' };

export interface ReplySettings { length: 'short' | 'normal' | 'long'; mode: 'fast' | 'quality' }
