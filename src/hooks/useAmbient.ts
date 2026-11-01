import { useEffect, useState } from 'react';
export function useAmbient() {
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let blinkTimer: ReturnType<typeof setTimeout>, openTimer: ReturnType<typeof setTimeout>, lookTimer: ReturnType<typeof setTimeout>;
    function clear() { clearTimeout(blinkTimer); clearTimeout(openTimer); clearTimeout(lookTimer); }
    function scheduleBlink() { blinkTimer = setTimeout(() => { setBlink(true); openTimer = setTimeout(() => { setBlink(false); scheduleBlink(); }, 160); }, 2600 + Math.random() * 3600); }
    function scheduleLook() { lookTimer = setTimeout(() => { setLook([0, -10, 10][Math.floor(Math.random() * 3)]); scheduleLook(); }, 2000 + Math.random() * 3000); }
    function sync() { document.documentElement.dataset.hidden = String(document.hidden); clear(); setBlink(false); setLook(0); setReduced(media.matches); if (!document.hidden && !media.matches) { scheduleBlink(); scheduleLook(); } }
    sync(); media.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
    return () => { clear(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return { blink, look, reduced };
}
