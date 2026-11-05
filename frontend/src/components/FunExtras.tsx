import { useEffect, useState } from 'react';
import { useSettings } from '../state/settings';

/** Quick music on/off button for the header. */
export function MusicButton() {
  const { settings, set, tr } = useSettings();
  return (
    <button
      type="button"
      className="btn btn--ghost"
      style={{ fontSize: '0.7rem' }}
      aria-pressed={settings.music}
      aria-label={tr('settingsMusic')}
      title={tr('settingsMusic')}
      onClick={() => set('music', !settings.music)}
    >
      {settings.music ? '🎵' : '🔇'}
    </button>
  );
}

let pid = 0;

/** Paw prints left behind the cursor (the paw cursor itself is CSS). */
export function PawTrail() {
  const { settings } = useSettings();
  const on = settings.pawCursor && !settings.reduceMotion && !settings.highContrast;
  const [prints, setPrints] = useState<{ id: number; x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    document.documentElement.dataset.cursor = settings.pawCursor && !settings.highContrast ? 'paw' : 'default';
  }, [settings.pawCursor, settings.highContrast]);

  useEffect(() => {
    if (!on) return;
    let last = { x: -999, y: -999 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (dx * dx + dy * dy < 50 * 50) return;
      last = { x: e.clientX, y: e.clientY };
      const id = pid++;
      const r = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      setPrints((p) => [...p.slice(-9), { id, x: e.clientX + (id % 2 ? 8 : -8), y: e.clientY, r }]);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [on]);

  if (!on) return null;
  return (
    <>
      {prints.map((p) => (
        <span key={p.id} className="paw-print" aria-hidden="true" style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%) rotate(${p.r}deg)` }}>
          🐾
        </span>
      ))}
    </>
  );
}
