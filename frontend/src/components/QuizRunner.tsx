import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Question } from '../../../shared/types';
import { questionToSpeech, speak } from '../lib/speak';
import { useQuiz } from '../lib/useQuiz';
import { useSettings } from '../state/settings';
import { BossBar, BossSprite, ComboPop } from './Boss';
import { bossHp } from '../lib/boss';
import { CameraStage } from './CameraStage';
import { ChoiceGrid } from './ChoiceGrid';
import { Confetti } from './Confetti';
import { MewyBuddy } from './MewyBuddy';
import { SpeakButton } from './SpeakButton';
import { SpriteScene } from './Sprite';

interface Props {
  questions: Question[];
  onFinish?: (correct: number, total: number) => void;
  renderDone: (correct: number, total: number, restart: () => void) => ReactNode;
  /** Show a boss with an HP bar that right answers knock down. */
  boss?: boolean;
}

/** Plays a list of questions (camera, tap or keyboard). Shared by Hand Quiz and Daily Challenge. */
export function QuizRunner({ questions, onFinish, renderDone, boss = false }: Props) {
  const { tr, settings } = useSettings();
  const lang = settings.lang;
  const { state, current, pick, next, restart, total } = useQuiz(questions, onFinish);
  const [hover, setHover] = useState<{ index: number | null; progress: number }>({ index: null, progress: 0 });
  const onHover = useCallback((index: number | null, progress: number) => setHover({ index, progress }), []);

  // Keyboard: 1-4 or A-D also answer, for kids without a camera.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state.picked != null || state.done || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx != null && idx < current.choices.length) pick(idx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.picked, state.done, current, pick]);

  // Optional auto read-aloud of each new question.
  useEffect(() => {
    if (settings.autoRead && !state.done && current) speak(questionToSpeech(current, lang), lang);
  }, [settings.autoRead, state.done, current, lang]);

  if (state.done) {
    return (
      <section style={{ textAlign: 'center' }}>
        <Confetti fire={state.correctCount >= Math.ceil(total / 2) ? state.correctCount : 0} />
        {boss && (
          <div className="boss-result">
            <BossSprite size={state.correctCount >= bossHp(total) ? 56 : 88} />
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.8rem' }}>
              {state.correctCount >= bossHp(total)
                ? lang === 'en' ? '🏆 BOSS DEFEATED!' : '🏆 BOS DIKALAHKAN!'
                : lang === 'en' ? 'The boss got away... try again!' : 'Bosnya kabur... coba lagi!'}
            </p>
          </div>
        )}
        {renderDone(state.correctCount, total, restart)}
      </section>
    );
  }

  const revealed = state.picked != null;
  const mood = !revealed ? 'think' : state.picked === current.answer ? 'happy' : 'sad';
  const comboShake = revealed && state.picked === current.answer && state.streak >= 3 && !settings.reduceMotion;
  return (
    <section className={comboShake ? 'shake' : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-pixel)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
        <span>{state.index + 1} / {total}</span>
        <span>⭐ {state.correctCount}</span>
      </div>

      {boss && <BossBar hits={state.correctCount} total={total} lang={lang} />}
      <MewyBuddy mood={mood} />
      {revealed && state.picked === current.answer && <ComboPop streak={state.streak} />}
      <h2 style={{ textAlign: 'center' }}>
        {current.prompt[lang]} <SpeakButton text={questionToSpeech(current, lang)} small />
      </h2>
      {current.emoji && <div className="pixel-panel big-emoji">{current.emoji}</div>}
      {current.visual && (
        <div className="pixel-panel" style={{ margin: '1rem auto', maxWidth: 560 }}>
          <SpriteScene groups={current.visual} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <CameraStage choiceCount={current.choices.length} onConfirm={pick} onHover={onHover} paused={revealed} />
        <div>
          <p style={{ fontFamily: 'var(--font-read)', textAlign: 'center' }}>{tr('answerWithTap')}</p>
          <ChoiceGrid choices={current.choices} hovered={hover.index} holdProgress={hover.progress} picked={state.picked} answer={current.answer} onPick={pick} />
          {revealed && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>
                {state.picked === current.answer ? `✅ ${tr('correct')}` : `❌ ${tr('notQuite')}`}
                {current.explain && ` — ${current.explain[lang]}`}
              </p>
              <button type="button" className="btn" onClick={next} autoFocus>{tr('next')}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
