import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../state/settings';

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
        </div>
        <span className="fun-bg__shooting" />
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

/** Cards tilt toward the pointer in 3D, with a soft moving shine. */
export function useCardTilt() {
  const { settings } = useSettings();
  useEffect(() => {
    if (settings.reduceMotion) return;
    let current: HTMLElement | null = null;
    const reset = () => {
      if (current) current.style.transform = '';
      current = null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as Element).closest<HTMLElement>('.card--link, .tilt');
      if (el !== current) reset();
      if (!el) return;
      current = el;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateY(-4px)`;
      el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', reset);
    return () => {
      reset();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', reset);
    };
  }, [settings.reduceMotion]);
}
