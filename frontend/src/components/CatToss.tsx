import { useEffect, useRef } from 'react';
import type { FurId } from '../state/rewards';
import { Mewy } from './Mewy';

export interface TossCat {
  fur: FurId;
  size: number;
  x: number;
  y: number;
}

/**
 * A grabbed background cat: follows the pointer while held, then flies off
 * with the throw speed plus gravity, spinning, until it leaves the screen.
 */
export function CatToss({ cat, onDone }: { cat: TossCat; onDone: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pos = { x: cat.x, y: cat.y, rot: 0 };
    let v = { x: 0, y: 0 };
    let last = { x: cat.x, y: cat.y, t: performance.now() };
    let flying = false;
    let raf = 0;

    const paint = () => {
      if (ref.current) ref.current.style.transform = `translate(${pos.x - cat.size / 2}px, ${pos.y - cat.size / 2}px) rotate(${pos.rot}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      if (flying) return;
      const now = performance.now();
      const dt = Math.max(1, now - last.t);
      // Velocity in px per 16ms frame, smoothed.
      v = { x: v.x * 0.5 + ((e.clientX - last.x) / dt) * 8, y: v.y * 0.5 + ((e.clientY - last.y) / dt) * 8 };
      last = { x: e.clientX, y: e.clientY, t: now };
      pos.x = e.clientX;
      pos.y = e.clientY;
      pos.rot = v.x * 2;
      paint();
    };
    const fly = () => {
      v.y += 0.55; // gravity
      pos.x += v.x;
      pos.y += v.y;
      pos.rot += v.x * 1.5;
      paint();
      const off = pos.x < -200 || pos.x > window.innerWidth + 200 || pos.y > window.innerHeight + 200 || pos.y < -900;
      if (off) onDone();
      else raf = requestAnimationFrame(fly);
    };
    const onUp = () => {
      if (flying) return;
      flying = true;
      raf = requestAnimationFrame(fly);
    };
    paint();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [cat, onDone]);

  return (
    <div ref={ref} className="cat-toss" aria-hidden="true">
      <Mewy size={cat.size} fur={cat.fur} item={null} mood="happy" title="" />
    </div>
  );
}
