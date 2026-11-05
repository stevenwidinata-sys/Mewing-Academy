import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { FurId } from '../state/rewards';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

// Deterministic "random" so shapes stay put between renders (no Math.random in render).
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const COLORS = ['#ffcc00', '#27e0d8', '#ff5ca8', '#9b4de0', '#3bb54a'];
const LAYERS = [
  { depth: -260, move: 14, count: 26, size: [3, 6] },
  { depth: -120, move: 30, count: 14, size: [8, 14] },
  { depth: 0, move: 55, count: 6, size: [26, 46] },
].map((l, li) => ({
  ...l,
  items: Array.from({ length: l.count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    s: l.size[0] + rand() * (l.size[1] - l.size[0]),
    c: COLORS[Math.floor(rand() * COLORS.length)],
    kind: li === 2 ? 'planet' : rand() < 0.5 ? 'px' : 'star',
    delay: rand() * 6,
    dur: 4 + rand() * 6,
  })),
}));

// Pixel cloud drawn with box-shadows (8px "pixels").
const CLOUD_MAP = ['..###...', '.######.', '########', '.######.'];
const CLOUD_SHADOW = CLOUD_MAP.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === '#' ? [`${x * 8}px ${y * 8}px 0 0 #fff`] : []))).join(',');
const CLOUDS = Array.from({ length: 5 }, () => ({ top: 6 + rand() * 70, k: 0.8 + rand() * 1.6, dur: 50 + rand() * 40, delay: -rand() * 80, o: 0.08 + rand() * 0.1 }));
const BUBBLE_CHARS = ['♥', '♪', '★', '✿', '◆'];
const BUBBLES = Array.from({ length: 10 }, (_, i) => ({ left: rand() * 100, dur: 12 + rand() * 12, delay: -rand() * 24, ch: BUBBLE_CHARS[i % 5], c: COLORS[i % COLORS.length], s: 12 + rand() * 12 }));
// Retro flying cats (Mewy with a pixel rainbow trail) at different depths.
const CATS: { fur: FurId; size: number; top: number; dur: number; delay: number; rev?: boolean }[] = [
  { fur: 'yellow', size: 52, top: 12, dur: 24, delay: -3 },
  { fur: 'orange', size: 36, top: 62, dur: 32, delay: -14, rev: true },
  { fur: 'white', size: 26, top: 38, dur: 40, delay: -26 },
];

const INTERACTIVE = 'a,button,input,select,textarea,video,canvas,label,[role="dialog"]';
const BURST = ['⭐', '✨', '💛', '🌟', '💫'];

/**
 * Fixed 3D parallax backdrop: three depth layers that shift with the mouse,
 * plus a sparkle burst wherever the child clicks empty space. Paused on the
 * camera games, and static in calm mode.
 */
export function FunBackground() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; e: string }[]>([]);
  const busy = pathname.startsWith('/quiz') || pathname.startsWith('/memory') || pathname.startsWith('/daily');
  const still = settings.reduceMotion || busy;

  useEffect(() => {
    if (still) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rootRef.current;
        if (!el) return;
        el.style.setProperty('--mx', String(e.clientX / window.innerWidth - 0.5));
        el.style.setProperty('--my', String(e.clientY / window.innerHeight - 0.5));
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [still]);

  useEffect(() => {
    if (settings.reduceMotion) return;
    let nextId = 0;
    const timers: number[] = [];
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest(INTERACTIVE)) return;
      const id = nextId++;
      setBursts((b) => [...b.slice(-6), { id, x: e.clientX, y: e.clientY, e: BURST[id % BURST.length] }]);
      timers.push(window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900));
    };
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      timers.forEach(clearTimeout);
    };
  }, [settings.reduceMotion]);

  if (settings.highContrast) return null;

  return (
    <>
      <div ref={rootRef} className={`fun-bg${still ? ' fun-bg--still' : ''}`} aria-hidden="true">
        <div className="fun-bg__world">
          {LAYERS.map((l, li) => (
            <div key={li} className="fun-bg__layer" style={{ '--depth': `${l.depth}px`, '--move': `${l.move}px` } as React.CSSProperties}>
              {l.items.map((it, i) => (
                <span
                  key={i}
                  className={`fun-bg__${it.kind}`}
                  style={{ left: `${it.x}%`, top: `${it.y}%`, width: it.s, height: it.s, fontSize: it.s, '--c': it.c, animationDelay: `${it.delay}s`, animationDuration: `${it.dur}s` } as React.CSSProperties}
                >
                  {it.kind === 'star' ? '✦' : null}
                </span>
              ))}
            </div>
          ))}
          <div className="fun-bg__layer" style={{ '--depth': '-200px', '--move': '10px' } as React.CSSProperties}>
            {CLOUDS.map((c, i) => (
              <span key={i} className="pxcloud" style={{ top: `${c.top}%`, boxShadow: CLOUD_SHADOW, opacity: c.o, '--k': c.k, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` } as React.CSSProperties} />
            ))}
          </div>
          <div className="fun-bg__layer" style={{ '--depth': '-80px', '--move': '24px' } as React.CSSProperties}>
            {BUBBLES.map((b, i) => (
              <span key={i} className="fun-bg__bubble" style={{ left: `${b.left}%`, color: b.c, fontSize: b.s, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
                {b.ch}
              </span>
            ))}
          </div>
          <div className="fun-bg__layer" style={{ '--depth': '-40px', '--move': '40px' } as React.CSSProperties}>
            {CATS.map((c, i) => (
              <div key={i} className={`flycat${c.rev ? ' flycat--rev' : ''}`} style={{ top: `${c.top}%`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
                <div className="flycat__inner">
                  <span className="flycat__trail" style={{ width: c.size * 2.6, height: c.size * 0.6 }} />
                  <span className="flycat__body">
                    <Mewy size={c.size} fur={c.fur} item={null} mood="happy" title="" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className="fun-bg__shooting" />
        <span className="fun-bg__shooting fun-bg__shooting--2" />
      </div>
      {bursts.map((b) => (
        <span key={b.id} className="click-burst" aria-hidden="true" style={{ left: b.x, top: b.y }}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <span key={k} style={{ '--a': `${k * 60}deg` } as React.CSSProperties}>{b.e}</span>
          ))}
        </span>
      ))}
    </>
  );
}
