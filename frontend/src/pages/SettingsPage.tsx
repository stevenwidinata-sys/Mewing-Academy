import type { ReactNode } from 'react';
import type { Lang } from '../../../shared/types';
import { useSettings, type FingerMode, type TextSize } from '../state/settings';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pixel-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-read)', fontWeight: 700 }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>{children}</div>
    </div>
  );
}

function Toggle({ on, onToggle, labelOn, labelOff }: { on: boolean; onToggle: () => void; labelOn: string; labelOff: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="btn" onClick={onToggle} style={{ background: on ? 'var(--green)' : 'var(--panel-light)', color: on ? 'var(--ink)' : 'var(--white)', fontSize: '0.7rem' }}>
      {on ? labelOn : labelOff}
    </button>
  );
}

export function SettingsPage() {
  const { settings, set, tr } = useSettings();
  const sizes: TextSize[] = ['normal', 'large', 'xlarge'];
  return (
    <section>
      <h1>⚙️ {tr('navSettings')}</h1>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
        <Row label={tr('settingsLang')}>
          {(['en', 'id'] as Lang[]).map((l) => (
            <button key={l} type="button" className="btn" aria-pressed={settings.lang === l} onClick={() => set('lang', l)} style={{ background: settings.lang === l ? 'var(--yellow)' : 'var(--panel-light)', color: settings.lang === l ? 'var(--ink)' : 'var(--white)', fontSize: '0.7rem' }}>
              {l === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
            </button>
          ))}
        </Row>

        <Row label={tr('settingsFingerMode')}>
          {(['point', 'count'] as FingerMode[]).map((m) => (
            <button key={m} type="button" className="btn" aria-pressed={settings.fingerMode === m} onClick={() => set('fingerMode', m)} style={{ background: settings.fingerMode === m ? 'var(--yellow)' : 'var(--panel-light)', color: settings.fingerMode === m ? 'var(--ink)' : 'var(--white)', fontSize: '0.65rem' }}>
              {m === 'point' ? tr('fingerModePoint') : tr('fingerModeCount')}
            </button>
          ))}
        </Row>

        <Row label={tr('settingsTextSize')}>
          {sizes.map((s) => (
            <button key={s} type="button" className="btn" aria-pressed={settings.textSize === s} onClick={() => set('textSize', s)} style={{ background: settings.textSize === s ? 'var(--yellow)' : 'var(--panel-light)', color: settings.textSize === s ? 'var(--ink)' : 'var(--white)', fontSize: s === 'normal' ? '0.7rem' : s === 'large' ? '0.85rem' : '1rem' }}>
              A
            </button>
          ))}
        </Row>

        <Row label={tr('settingsHighContrast')}>
          <Toggle on={settings.highContrast} onToggle={() => set('highContrast', !settings.highContrast)} labelOn={tr('on')} labelOff={tr('off')} />
        </Row>
        <Row label={tr('settingsReduceMotion')}>
          <Toggle on={settings.reduceMotion} onToggle={() => set('reduceMotion', !settings.reduceMotion)} labelOn={tr('on')} labelOff={tr('off')} />
        </Row>
        <Row label={tr('settingsReadable')}>
          <Toggle on={settings.readableFont} onToggle={() => set('readableFont', !settings.readableFont)} labelOn={tr('on')} labelOff={tr('off')} />
        </Row>
        <Row label={tr('settingsSound')}>
          <Toggle on={settings.sound} onToggle={() => set('sound', !settings.sound)} labelOn={tr('on')} labelOff={tr('off')} />
        </Row>
      </div>
    </section>
  );
}
