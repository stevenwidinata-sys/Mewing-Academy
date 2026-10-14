import { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty, MemoryRound } from '../../../shared/types';
import { CameraStage } from '../components/CameraStage';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { LevelPicker } from '../components/LevelPicker';
import { SpriteScene } from '../components/Sprite';
import { fetchMemoryRound } from '../lib/api';
import { sfx } from '../lib/sound';
import { recordAnswer } from '../state/progress';
import { useSettings } from '../state/settings';

type Phase = 'ready' | 'study' | 'quiz' | 'done';

export function MemoryPage() {
  const { tr, settings } = useSettings();
  const [level, setLevel] = useState<Difficulty>(1);
  const [round, setRound] = useState<MemoryRound | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [hover, setHover] = useState<{ index: number | null; progress: number }>({ index: null, progress: 0 });
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const begin = useCallback(async () => {
    clearTimers();
    const r = await fetchMemoryRound(level);
    setRound(r);
    setQIndex(0);
    setPicked(null);
    setCorrect(0);
    setPhase('study');
    const seconds = Math.round(r.studyMs / 1000);
    setCountdown(seconds);
    for (let s = 1; s < seconds; s++) {
      timers.current.push(window.setTimeout(() => {
        setCountdown(seconds - s);
        sfx.tick(settings.sound);
      }, s * 1000));
    }
    timers.current.push(window.setTimeout(() => setPhase('quiz'), r.studyMs));
  }, [level, settings.sound]);

  const pick = useCallback(
    (choice: number) => {
      if (picked != null || !round) return;
      const q = round.questions[qIndex];
      const isRight = choice === q.answer;
      setPicked(choice);
      if (isRight) {
        setCorrect((c) => c + 1);
        sfx.correct(settings.sound);
      } else sfx.wrong(settings.sound);
      recordAnswer('memory', isRight);
    },
    [picked, round, qIndex, settings.sound],
  );

  const next = useCallback(() => {
    if (!round) return;
    if (qIndex >= round.questions.length - 1) {
      setPhase('done');
      sfx.star(settings.sound);
    } else {
      setQIndex((i) => i + 1);
      setPicked(null);
    }
  }, [round, qIndex, settings.sound]);

  if (phase === 'ready' || !round) {
    return (
      <section style={{ textAlign: 'center' }}>
        <h1>🧠 {tr('navMemory')}</h1>
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>{tr('memoryWatch')} {tr('memoryRemember')}</p>
        <LevelPicker value={level} onChange={setLevel} />
        <div style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn" onClick={begin}>{tr('start')}</button>
        </div>
      </section>
    );
  }

  if (phase === 'study') {
    return (
      <section style={{ textAlign: 'center' }}>
        <h2>{tr('memoryWatch')}</h2>
        <div className="pixel-panel" style={{ margin: '1rem auto', maxWidth: 560, minHeight: 220, display: 'grid', placeItems: 'center' }}>
          <SpriteScene groups={round.scene} size={64} />
        </div>
        <p className="blink" style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.5rem' }} aria-live="polite">{countdown}</p>
      </section>
    );
  }

  if (phase === 'done') {
    return (
      <section style={{ textAlign: 'center' }}>
        <h1>⭐ {correct}/{round.questions.length}</h1>
        <LevelPicker value={level} onChange={setLevel} />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button type="button" className="btn" onClick={begin}>{tr('playAgain')}</button>
          <button type="button" className="btn btn--ghost" onClick={() => setPhase('ready')}>{tr('back')}</button>
        </div>
      </section>
    );
  }

  const q = round.questions[qIndex];
  const revealed = picked != null;
  return (
    <section>
      <h2 style={{ textAlign: 'center' }}>{tr('memoryRemember')}</h2>
      <h3 style={{ textAlign: 'center', color: 'var(--white)' }}>{q.prompt[settings.lang]}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 360px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <CameraStage choiceCount={q.choices.length} onConfirm={pick} onHover={(i, p) => setHover({ index: i, progress: p })} paused={revealed} />
        <div>
          <ChoiceGrid choices={q.choices} hovered={hover.index} holdProgress={hover.progress} picked={picked} answer={q.answer} onPick={pick} />
          {revealed && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>
                {picked === q.answer ? `✅ ${tr('correct')}` : `❌ ${tr('notQuite')}`}
                {q.explain && ` — ${q.explain[settings.lang]}`}
              </p>
              <button type="button" className="btn" onClick={next} autoFocus>{tr('next')}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
