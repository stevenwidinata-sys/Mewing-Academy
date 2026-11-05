import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import { FURS } from '../state/rewards';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

const MAX_PULL = 140; // px

/**
 * Mewy's head that watches the cursor and can be grabbed and stretched like
 * rubber. On release it springs back with a wobble and a "boing".
 */
export function StretchyMewy({ size = 120 }: { size?: number }) {
  const { settings } = useSettings();
  const ref = useRef<HTMLDivElement | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const [wobble, setWobble] = useState(0);
  const grab = useRef<{ x: number; y: number } | null>(null);

  // Eyes and head follow the cursor anywhere on the screen.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setLook({ x: Math.round(Math.max(-1, Math.min(1, dx / 160))), y: Math.round(Math.max(-1, Math.min(1, dy / 160))) });
      if (grab.current) {
        let x = e.clientX - grab.current.x;
        let y = e.clientY - grab.current.y;
        const d = Math.hypot(x, y);
        if (d > MAX_PULL) {
          x = (x / d) * MAX_PULL;
          y = (y / d) * MAX_PULL;
        }
        setPull({ x, y });
      }
    };
    const onUp = () => {
      if (!grab.current) return;
      grab.current = null;
      setPull(null);
      setWobble((w) => w + 1);
      sfx.boing(settings.sound);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [settings.sound]);

  const p = pull ?? { x: 0, y: 0 };
  const fur = FURS.find((f) => f.id === settings.mewyFur) ?? FURS[0];
  const d = Math.hypot(p.x, p.y);
  const angle = Math.atan2(p.y, p.x);
  // Stretch along the pull direction, squash across it.
  const stretch = 1 + d / 220;
  const tilt = settings.reduceMotion ? 0 : look.x * 6;
  const transform = pull
    ? `translate(${p.x * 0.85}px, ${p.y * 0.85}px) rotate(${angle}rad) scale(${stretch}, ${1 / Math.sqrt(stretch)}) rotate(${-angle}rad)`
    : `rotate(${tilt}deg)`;

  return (
    <div
      ref={ref}
      className={`stretchy${pull ? ' stretchy--grabbed' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        grab.current = { x: e.clientX, y: e.clientY };
        setPull({ x: 0, y: 0 });
      }}
      title={settings.lang === 'en' ? 'Grab me and pull!' : 'Tarik aku!'}
    >
      {pull && d > 4 && (
        <svg className="stretchy__neck" aria-hidden="true" style={{ overflow: 'visible' }} width="1" height="1">
          <line x1="0" y1="0" x2={p.x * 0.85} y2={p.y * 0.85} style={{ stroke: fur.main }} />
        </svg>
      )}
      <div key={wobble} className={`stretchy__head${wobble && !pull ? ' stretchy__head--wobble' : ''}`} style={{ transform }}>
        <Mewy size={size} look={look} mood={pull ? 'happy' : 'idle'} title="Mewy" />
      </div>
    </div>
  );
}
