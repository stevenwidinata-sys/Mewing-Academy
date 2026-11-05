import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import { useSettings } from '../state/settings';
import { StretchyMewy } from './StretchyMewy';

// Three.js loads only for the title screen (and is then cached for Home).
const TitleScene = lazy(() => import('./TitleScene'));
const WARP_MS = 1000;

/** Synthwave "PRESS START" screen shown once per visit. */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  const { tr, settings, set } = useSettings();
  const en = settings.lang === 'en';
  const calm = settings.reduceMotion || settings.highContrast;
  const [hot, setHot] = useState(false);
  const [warp, setWarp] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const timer = useRef<number | undefined>(undefined);

  const go = useCallback(() => {
    if (warp) return onStart(); // second press skips the warp
    if (calm) return onStart();
    setWarp(true);
    sfx.warp(settings.sound);
    timer.current = window.setTimeout(onStart, WARP_MS);
  }, [warp, calm, onStart, settings.sound]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    };
    const onMove = (e: PointerEvent) => setTilt({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('keydown', onKey);
    if (!calm) window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, [go, calm]);

  return (
    <div className={`title-screen${warp ? ' title-screen--warp' : ''}${hot ? ' title-screen--hot' : ''}`} role="dialog" aria-modal="true" aria-labelledby="title-heading">
      {calm ? (
        <div className="title-grid" aria-hidden="true" />
      ) : (
        <Suspense fallback={<div className="title-grid" aria-hidden="true" />}>
          <TitleScene speed={hot ? 4 : 1} warp={warp} />
        </Suspense>
      )}
      <div className="title-stage">
        <div className={`title-mascot${hot ? ' title-mascot--lean' : ''}`}>
          <StretchyMewy size={120} />
        </div>
        <h1
          id="title-heading"
          className="title-logo"
          style={calm ? undefined : { transform: `perspective(600px) rotateX(${14 - tilt.y * 14}deg) rotateY(${tilt.x * 18}deg)` }}
        >
          <span>MEWING</span>
          <span>ACADEMY</span>
        </h1>
        <p className="title-tag">{tr('tagline')}</p>
        <button
          type="button"
          className="arcade-btn"
          onClick={go}
          onPointerEnter={() => setHot(true)}
          onPointerLeave={() => setHot(false)}
          onFocus={() => setHot(true)}
          onBlur={() => setHot(false)}
          autoFocus
        >
          <span className="arcade-btn__top">▶ {en ? 'PRESS START' : 'MULAI MAIN'}</span>
        </button>
        <p className="title-hint">{en ? 'Press Enter or tap the button' : 'Tekan Enter atau ketuk tombol'}</p>
        <button type="button" className="btn btn--ghost" style={{ fontSize: '0.65rem' }} onClick={() => set('lang', en ? 'id' : 'en')}>
          {en ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}
        </button>
      </div>
      {warp && <div className="warp-flash" aria-hidden="true" />}
    </div>
  );
}
