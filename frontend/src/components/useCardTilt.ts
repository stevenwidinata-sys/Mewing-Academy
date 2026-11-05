import { useEffect } from 'react';
import { useSettings } from '../state/settings';

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
