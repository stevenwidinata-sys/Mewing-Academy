import { useEffect, useRef } from 'react';
import { useSettings } from '../state/settings';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vrot: number;
}

const COLORS = ['#ffcc00', '#27e0d8', '#ff5ca8', '#3bb54a', '#fdf6e3'];

/**
 * A short burst of pixel confetti on a full-screen canvas. If calm mode or the
 * OS reduce-motion preference is on, it renders nothing (celebration is shown
 * with a static message by the caller instead).
 */
export function Confetti({ fire }: { fire: number }) {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (fire === 0 || settings.reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);

    const particles: Particle[] = Array.from({ length: 140 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: h * 0.3 + (Math.random() - 0.5) * h * 0.1,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (Math.random() * -12 - 4) * dpr,
      size: (6 + Math.random() * 6) * dpr,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
    }));

    let raf = 0;
    const start = performance.now();
    const gravity = 0.4 * dpr;

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      if (elapsed < 2500) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [fire, settings.reduceMotion]);

  if (settings.reduceMotion) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, width: '100vw', height: '100vh' }}
    />
  );
}
