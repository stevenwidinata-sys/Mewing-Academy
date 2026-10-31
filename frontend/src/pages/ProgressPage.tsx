import { TOPICS } from '../../../shared/types';
import { resetProgress, useProgress } from '../state/progress';
import { badgeFor, nextBadge, topicTitle } from '../state/rewards';
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
          {[...TOPICS.map((t) => t.id), 'memory' as const].filter((id) => progress.byTopic[id]).map((id) => {
            const s = progress.byTopic[id]!;
            const pct = Math.round((s.correct / s.total) * 100);
            const badge = badgeFor(s.correct);
            const upcoming = nextBadge(s.correct);
            return (
              <div key={id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-read)', fontWeight: 700, gap: '0.5rem' }}>
                  <span>
                    <span style={{ fontSize: '1.3rem' }} aria-label={badge ? badge.tier : 'no badge'}>{badge?.emoji ?? '⬜'}</span> {topicTitle(id, settings.lang)}
                  </span>
                  <span>{s.correct}/{s.total} ({pct}%)</span>
                </div>
                <div style={{ height: 16, background: 'var(--bg)', border: '2px solid var(--ink)', marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)' }} />
                </div>
                {upcoming && (
                  <div style={{ fontFamily: 'var(--font-read)', fontSize: '0.8rem', marginTop: 4, opacity: 0.85 }}>
                    {tr('nextBadge')}: {upcoming.emoji} {upcoming.need - s.correct} ✔
                  </div>
                )}
              </div>
            );
          })}
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
