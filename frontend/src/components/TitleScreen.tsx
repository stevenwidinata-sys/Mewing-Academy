import { useEffect } from 'react';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

/** Arcade-style "PRESS START" screen shown once per visit. */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  const { tr, settings, set } = useSettings();
  const en = settings.lang === 'en';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <div className="title-screen" role="dialog" aria-modal="true" aria-labelledby="title-heading">
      <div className="title-grid" aria-hidden="true" />
      <div className="title-stage">
        <div className="title-mascot">
          <Mewy size={120} />
        </div>
        <h1 id="title-heading" className="title-logo">
          <span>MEWING</span>
          <span>ACADEMY</span>
        </h1>
        <p className="title-tag">{tr('tagline')}</p>
        <button type="button" className="btn title-start" onClick={onStart} autoFocus>
          ▶ {en ? 'PRESS START' : 'MULAI MAIN'}
        </button>
        <p className="title-hint">{en ? 'Press Enter or tap the button' : 'Tekan Enter atau ketuk tombol'}</p>
        <button type="button" className="btn btn--ghost" style={{ fontSize: '0.65rem' }} onClick={() => set('lang', en ? 'id' : 'en')}>
          {en ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}
        </button>
      </div>
    </div>
  );
}
