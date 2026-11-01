import type { Emotion } from '../types';
import { emotionLabels } from '../types';
import { useAmbient } from '../hooks/useAmbient';
const shapes: Record<Emotion, { browL: string; browR: string; mouth: string; eye: number }> = {
  happy: { browL: 'M120 113 Q155 92 190 111', browR: 'M290 111 Q325 92 360 113', mouth: 'M198 249 Q240 294 282 249 Q240 270 198 249', eye: 35 },
  curious: { browL: 'M120 101 Q155 82 190 102', browR: 'M290 119 Q325 107 360 117', mouth: 'M218 259 Q245 273 270 251', eye: 38 },
  surprised: { browL: 'M120 96 Q155 72 190 94', browR: 'M290 94 Q325 72 360 96', mouth: 'M222 251 C222 224 258 224 258 251 C258 281 222 281 222 251', eye: 46 },
  sad: { browL: 'M120 118 Q155 115 190 95', browR: 'M290 95 Q325 115 360 118', mouth: 'M212 272 Q240 242 268 272', eye: 28 },
  angry: { browL: 'M120 99 L190 122', browR: 'M290 122 L360 99', mouth: 'M211 268 Q240 251 269 268', eye: 23 },
  thinking: { browL: 'M120 116 Q155 103 190 113', browR: 'M290 98 Q325 89 360 106', mouth: 'M220 263 L260 263', eye: 30 },
};
export default function RobotFace({ emotion, speaking, thinking }: { emotion: Emotion; speaking: boolean; thinking: boolean }) {
  const { blink, look } = useAmbient(); const shape = shapes[emotion];
  return <svg viewBox="0 0 480 360" role="img" aria-label={`Khuôn mặt MIRA: ${emotionLabels[emotion]}`} className={`robot-face ${speaking ? 'is-speaking' : ''} ${thinking ? 'is-thinking' : ''}`}>
    <defs><radialGradient id="eye"><stop stopColor="#b0fff0"/><stop offset="1" stopColor="#21cbbf"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <path d="M70 124 Q70 48 148 48 H332 Q410 48 410 124 V244 Q410 319 332 319 H148 Q70 319 70 244Z" fill="#0c252b" stroke="#23535b" strokeWidth="2"/>
    <path d="M91 115 Q94 70 147 69" fill="none" stroke="#356d75" strokeWidth="3" strokeLinecap="round"/>
    <g className="brows" fill="none" stroke="#75f7df" strokeWidth="8" strokeLinecap="round"><path d={shape.browL}/><path d={shape.browR}/></g>
    {[156, 324].map(x => <g key={x} style={{ transform: `translate(${look}px, 0)` }} className="eye-look">
      <ellipse cx={x} cy="163" rx="38" ry={blink ? 3 : shape.eye} fill="#62eddb" opacity=".25" filter="url(#glow)"/>
      <ellipse cx={x} cy="163" rx="32" ry={blink ? 2 : shape.eye} fill="url(#eye)"/>
      {!blink && <><ellipse cx={x} cy="166" rx="13" ry={Math.min(23, shape.eye - 5)} fill="#073039"/><circle cx={x - 8} cy="151" r="7" fill="#eaffff"/><circle cx={x + 7} cy="176" r="3" fill="#eaffff" opacity=".6"/></>}
    </g>)}
    <path d="M235 203 Q240 212 245 203" fill="none" stroke="#437a80" strokeWidth="4" strokeLinecap="round"/>
    <g fill="#fa93a8" opacity={emotion === 'happy' ? '.6' : '.08'}><ellipse cx="119" cy="221" rx="20" ry="9"/><ellipse cx="361" cy="221" rx="20" ry="9"/></g>
    <path data-testid="face-mouth" d={shape.mouth} className="mouth" fill={['happy', 'surprised'].includes(emotion) ? '#76efdc' : 'none'} stroke="#76efdc" strokeWidth="5" strokeLinecap="round"/>
    <g className="speaking-mouth"><ellipse cx="240" cy="258" rx="26" ry="18" fill="#75f7df"/></g>
    <circle cx="240" cy="30" r="5" fill="#79f6d7" className="antenna"/><path d="M240 35 V48" stroke="#2e666c" strokeWidth="3"/>
  </svg>;
}
