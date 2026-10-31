import { useMemo, useState } from 'react';
import { getDailyQuestions } from '../../../shared/daily';
import { Mewy } from '../components/Mewy';
import { MewyBuddy } from '../components/MewyBuddy';
import { QuizRunner } from '../components/QuizRunner';
import { completeDaily, today, useProgress } from '../state/progress';
import { useSettings } from '../state/settings';

export function DailyPage() {
  const { tr } = useSettings();
  const progress = useProgress();
  const date = today();
  const questions = useMemo(() => getDailyQuestions(date), [date]);
  const [run, setRun] = useState(0);
  const [bonus, setBonus] = useState(false);
  const doneToday = progress.lastDaily === date;

  if (run === 0) {
    return (
      <section style={{ textAlign: 'center' }}>
        <div className="hero" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>📅</div>
          <Mewy size={80} mood="happy" />
          <h1 style={{ fontSize: '1.3rem' }}>{tr('navDaily')}</h1>
          <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.05rem', margin: 0 }}>{doneToday ? `✅ ${tr('dailyDone')}` : tr('dailyText')}</p>
          <p style={{ fontFamily: 'var(--font-read)', margin: '0.5rem 0 0' }}>🔥 {progress.streak} · {date}</p>
        </div>
        <button type="button" className="btn" onClick={() => setRun(1)} style={{ fontSize: '0.9rem', padding: '1em 1.6em' }}>
          ▶ {doneToday ? tr('playAgain') : tr('start')}
        </button>
      </section>
    );
  }

  return (
    <QuizRunner
      key={run}
      questions={questions}
      onFinish={() => setBonus(completeDaily())}
      renderDone={(correct, total) => (
        <>
          <MewyBuddy mood={correct >= total / 2 ? 'happy' : 'sad'} />
          <h1>⭐ {correct}/{total}</h1>
          <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.2rem' }}>{bonus ? `🎁 ${tr('dailyBonus')}` : tr('dailyDone')}</p>
          <button type="button" className="btn btn--ghost" onClick={() => setRun(0)}>{tr('back')}</button>
        </>
      )}
    />
  );
}
