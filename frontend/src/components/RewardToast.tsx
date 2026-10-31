import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sfx } from '../lib/sound';
import { dismissToast, useToasts } from '../state/progress';
import { describeUnlock } from '../state/rewards';
import { useSettings } from '../state/settings';

/** Pops up each newly earned outfit, fur color or badge for a few seconds. */
export function RewardToast() {
  const toasts = useToasts();
  const { settings, tr } = useSettings();
  const first = toasts[0];

  useEffect(() => {
    if (!first) return;
    sfx.star(settings.sound);
    const t = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(t);
  }, [first, settings.sound]);

  if (!first) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="card pop"
      style={{ position: 'fixed', left: '50%', bottom: '1.5rem', transform: 'translateX(-50%)', zIndex: 60, textAlign: 'center', minWidth: 260 }}
    >
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', color: 'var(--accent)' }}>🎉 {tr('newUnlock')}</div>
      <div style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem', margin: '0.4rem 0' }}>{describeUnlock(first, settings.lang)}</div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Link to="/closet" className="btn" style={{ fontSize: '0.6rem' }} onClick={dismissToast}>
          {tr('openCloset')}
        </Link>
        <button type="button" className="btn btn--ghost" style={{ fontSize: '0.6rem' }} onClick={dismissToast} aria-label="Close">
          ✖
        </button>
      </div>
    </div>
  );
}
