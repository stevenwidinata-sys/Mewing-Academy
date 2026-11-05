import { useEffect, useRef, useState } from 'react';
import { Mewy } from './Mewy';

/** Small Mewy peeking up from the bottom-right corner, always watching the cursor. */
export function WatcherMewy() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setLook({ x: Math.abs(dx) < 40 ? 0 : Math.sign(dx), y: Math.abs(dy) < 40 ? 0 : Math.sign(dy) });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div ref={ref} className="watcher" aria-hidden="true" style={{ transform: `rotate(${look.x * 8}deg)` }}>
      <Mewy size={54} look={look} title="" />
    </div>
  );
}
