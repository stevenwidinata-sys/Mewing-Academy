import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS, type TopicId } from '../../../shared/types';
import { useProgress } from '../state/progress';
import { badgeFor, topicTitle, unlockKeys } from '../state/rewards';
import { useSettings } from '../state/settings';

// Grown-up check numbers, picked once per page load (outside render).
const A = 6 + Math.floor(Math.random() * 4);
const B = 6 + Math.floor(Math.random() * 4);

export function ParentsPage() {
  const { settings, tr } = useSettings();
  const L = settings.lang;
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);

  if (!open) {
    const submit = (e: FormEvent) => {
      e.preventDefault();
      if (Number(answer) === A * B) setOpen(true);
      else setWrong(true);
    };
    return (
      <section style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <h1>👪 {tr('navParents')}</h1>
        <form className="card" onSubmit={submit}>
          <p style={{ fontFamily: 'var(--font-read)' }}>{L === 'en' ? 'Grown-ups only! Please answer:' : 'Khusus orang dewasa! Jawab dulu:'}</p>
          <label htmlFor="gate" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', display: 'block', marginBottom: '0.75rem' }}>
            {A} × {B} = ?
          </label>
          <input id="gate" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} autoComplete="off" style={{ width: 120, textAlign: 'center' }} />
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="btn">{L === 'en' ? 'Enter' : 'Masuk'}</button>
          </div>
          {wrong && <p role="alert" style={{ fontFamily: 'var(--font-read)' }}>{L === 'en' ? 'Not quite. Try again.' : 'Belum tepat. Coba lagi.'}</p>}
        </form>
      </section>
    );
  }

  const ids: TopicId[] = [...TOPICS.map((t) => t.id), 'memory'];
  const rows = ids.map((id) => ({ id, s: progress.byTopic[id] })).filter((r) => r.s && r.s.total > 0);
  const answered = rows.reduce((n, r) => n + r.s!.total, 0);
  const right = rows.reduce((n, r) => n + r.s!.correct, 0);
  const acc = (r: (typeof rows)[number]) => r.s!.correct / r.s!.total;
  const weakest = rows.filter((r) => r.s!.total >= 3).sort((a, b) => acc(a) - acc(b))[0];
  const untried = ids.filter((id) => !progress.byTopic[id]);
  const stat = (label: string, value: string | number) => (
    <div className="card" style={{ textAlign: 'center', flex: '1 1 140px' }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-read)' }}>{label}</div>
    </div>
  );

  return (
    <section>
      <h1>👪 {tr('navParents')}</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {stat(L === 'en' ? 'Questions answered' : 'Soal dijawab', answered)}
        {stat(L === 'en' ? 'Overall accuracy' : 'Akurasi total', answered ? `${Math.round((right / answered) * 100)}%` : '–')}
        {stat(L === 'en' ? 'Day streak' : 'Hari beruntun', progress.streak)}
        {stat(L === 'en' ? 'Rewards earned' : 'Hadiah didapat', unlockKeys(progress).length)}
      </div>

      {weakest && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem' }}>💡 {L === 'en' ? 'Suggestion' : 'Saran'}</h2>
          <p style={{ fontFamily: 'var(--font-read)' }}>
            {L === 'en'
              ? `Weakest topic: ${topicTitle(weakest.id, L)} (${Math.round(acc(weakest) * 100)}%). Review the lesson together, then practice on Easy.`
              : `Topik terlemah: ${topicTitle(weakest.id, L)} (${Math.round(acc(weakest) * 100)}%). Pelajari bersama, lalu latihan di tingkat Mudah.`}
          </p>
          <Link to={weakest.id === 'memory' ? '/memory' : `/lessons/${weakest.id}`} className="btn">
            {weakest.id === 'memory' ? tr('navMemory') : tr('navLessons')}
          </Link>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '0.9rem' }}>📊 {L === 'en' ? 'Accuracy per topic' : 'Akurasi per topik'}</h2>
        {rows.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-read)' }}>{tr('progressEmpty')}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-read)' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>{L === 'en' ? 'Topic' : 'Topik'}</th>
                <th>{L === 'en' ? 'Answered' : 'Dijawab'}</th>
                <th>{L === 'en' ? 'Accuracy' : 'Akurasi'}</th>
                <th>{L === 'en' ? 'Badge' : 'Lencana'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = Math.round(acc(r) * 100);
                return (
                  <tr key={r.id} style={{ borderTop: '2px solid var(--panel-light)' }}>
                    <td>{topicTitle(r.id, L)}</td>
                    <td>{r.s!.total}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ height: 12, background: 'var(--bg)', border: '2px solid var(--ink)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)' }} />
                      </div>
                      {pct}%
                    </td>
                    <td>{badgeFor(r.s!.correct)?.emoji ?? '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {untried.length > 0 && (
          <p style={{ fontFamily: 'var(--font-read)', fontSize: '0.85rem', opacity: 0.85 }}>
            {L === 'en' ? 'Not tried yet: ' : 'Belum dicoba: '}
            {untried.map((id) => topicTitle(id, L)).join(', ')}
          </p>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-read)', fontSize: '0.85rem', opacity: 0.85 }}>
        🔒 {L === 'en' ? 'All progress is stored only on this device. Nothing is uploaded.' : 'Semua progres hanya disimpan di perangkat ini. Tidak ada yang diunggah.'}
      </p>
    </section>
  );
}
