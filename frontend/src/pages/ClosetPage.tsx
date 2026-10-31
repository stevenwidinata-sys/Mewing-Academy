import { Mewy } from '../components/Mewy';
import { FURS, ITEM_UNLOCK, ITEMS, correctIn, isFurUnlocked, isItemUnlocked, topicTitle } from '../state/rewards';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';

export function ClosetPage() {
  const { settings, set, tr } = useSettings();
  const progress = useProgress();
  const L = settings.lang;

  return (
    <section>
      <h1>👕 {tr('navCloset')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>
        {L === 'en'
          ? 'Answer questions to unlock FREE outfits and fur colors for Mewy!'
          : 'Jawab soal untuk membuka baju dan warna bulu GRATIS untuk Mewy!'}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="hero" style={{ flex: '0 0 220px' }}>
          <Mewy size={170} mood="happy" />
          <p style={{ fontFamily: 'var(--font-read)', margin: '0.5rem 0 0' }}>⭐ {progress.stars}</p>
        </div>

        <div style={{ flex: '1 1 320px', display: 'grid', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.95rem' }}>{tr('closetItems')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--ghost"
                aria-pressed={settings.mewyItem === null}
                onClick={() => set('mewyItem', null)}
                style={{ fontSize: '0.6rem', outline: settings.mewyItem === null ? '4px solid var(--accent)' : undefined }}
              >
                ✖ {tr('closetNone')}
              </button>
              {ITEMS.map((it) => {
                const open = isItemUnlocked(progress, it.id);
                const have = Math.min(ITEM_UNLOCK, correctIn(progress, it.topic));
                const active = settings.mewyItem === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    className="btn"
                    disabled={!open}
                    aria-pressed={active}
                    onClick={() => set('mewyItem', it.id)}
                    title={open ? it.name[L] : `${have}/${ITEM_UNLOCK} ${topicTitle(it.topic, L)}`}
                    style={{ fontSize: '0.6rem', outline: active ? '4px solid var(--accent)' : undefined, textTransform: 'none' }}
                  >
                    <div style={{ fontSize: '1.6rem' }}>{open ? it.emoji : '🔒'}</div>
                    <div>{it.name[L]}</div>
                    {!open && (
                      <div style={{ fontFamily: 'var(--font-read)', fontSize: '0.7rem', marginTop: 4 }}>
                        {have}/{ITEM_UNLOCK} ✔ {topicTitle(it.topic, L)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '0.95rem' }}>{tr('closetFur')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {FURS.map((f) => {
                const open = isFurUnlocked(progress, f.id);
                const active = settings.mewyFur === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className="btn btn--ghost"
                    disabled={!open}
                    aria-pressed={active}
                    onClick={() => set('mewyFur', f.id)}
                    style={{ fontSize: '0.6rem', outline: active ? '4px solid var(--accent)' : undefined, textTransform: 'none' }}
                  >
                    <Mewy size={44} fur={f.id} item={null} title={f.name[L]} />
                    <div>{f.name[L]}</div>
                    {!open && <div style={{ fontFamily: 'var(--font-read)', fontSize: '0.7rem' }}>🔒 {f.stars} ⭐</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
