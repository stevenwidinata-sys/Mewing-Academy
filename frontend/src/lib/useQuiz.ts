import { useCallback, useState } from 'react';
import type { Question } from '../../../shared/types';
import { recordAnswer } from '../state/progress';
import { sfx } from './sound';
import { useSettings } from '../state/settings';

export interface QuizState {
  index: number;
  picked: number | null;
  correctCount: number;
  done: boolean;
  /** Right answers in a row (combo meter). */
  streak: number;
}

const START: QuizState = { index: 0, picked: null, correctCount: 0, done: false, streak: 0 };

/**
 * Side effects (saving progress, sounds, onFinish) run in the event handler,
 * never inside a setState updater: React StrictMode calls updaters twice,
 * which used to count every answer twice in dev.
 */
export function useQuiz(questions: Question[], onFinish?: (correct: number, total: number) => void) {
  const { settings } = useSettings();
  const [state, setState] = useState<QuizState>(START);

  const current = questions[state.index];

  const pick = useCallback(
    (choice: number) => {
      if (state.picked != null || state.done) return;
      const q = questions[state.index];
      const correct = choice === q.answer;
      recordAnswer(q.topic, correct);
      if (correct) sfx.correct(settings.sound);
      else sfx.wrong(settings.sound);
      setState({ ...state, picked: choice, correctCount: state.correctCount + (correct ? 1 : 0), streak: correct ? state.streak + 1 : 0 });
    },
    [questions, settings.sound, state],
  );

  const next = useCallback(() => {
    if (state.done) return;
    if (state.index >= questions.length - 1) {
      sfx.star(settings.sound);
      onFinish?.(state.correctCount, questions.length);
      setState({ ...state, done: true });
    } else {
      setState({ ...state, index: state.index + 1, picked: null });
    }
  }, [questions.length, onFinish, settings.sound, state]);

  const restart = useCallback(() => setState(START), []);

  return { state, current, pick, next, restart, total: questions.length };
}
