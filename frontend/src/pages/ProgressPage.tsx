import { TOPICS } from '../../../shared/types';
import { resetProgress, useProgress } from '../state/progress';
import { useSettings } from '../state/settings';

export function ProgressPage() {
  const { tr, settings } = useSettings();
  const progress = useProgress();
  const entries = Object.entries(progress.byTopic);

  return (
    <section>
      <h1>⭐ {tr('progressTitle')}</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="pixel-panel" style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '2rem' }}>⭐</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', color: 'var(--accent)' }}>{progress.stars}</div>
          <div style={{ fontFamily: 'var(--font-read)' }}>{tr('progressTotal')}</div>
        </div>
        <div className="pixel-panel" style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '2rem' }}>🔥</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', color: 'var(--accent)' }}>{progress.streak}</div>
          <div style={{ fontFamily: 'var(--font-read)' }}>{tr('progressStreak')}</div>
        </div>
      </div>

      {entries.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>{tr('progressEmpty')}</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {TOPICS.filter((t) => progress.byTopic[t.id]).map((t) => {
            const s = progress.byTopic[t.id]!;
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={t.id} className="pixel-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-read)', fontWeight: 700 }}>
                  <span>{t.title[settings.lang]}</span>
                  <span>{s.correct}/{s.total} ({pct}%)</span>
                </div>
                <div style={{ height: 16, background: 'var(--bg)', border: '2px solid var(--ink)', marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)' }} />
                </div>
              </div>
            );
          })}
          {/* memory is not in TOPICS list */}
          {progress.byTopic.memory && (
            <div className="pixel-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-read)', fontWeight: 700 }}>
                <span>🧠 {tr('navMemory')}</span>
                <span>{progress.byTopic.memory.correct}/{progress.byTopic.memory.total}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn btn--ghost" onClick={() => { if (confirm(tr('progressReset') + '?')) resetProgress(); }}>
          {tr('progressReset')}
        </button>
      </div>
    </section>
  );
}
