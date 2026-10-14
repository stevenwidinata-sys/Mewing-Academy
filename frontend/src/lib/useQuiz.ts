import { useCallback, useState } from 'react';
import type { Question } from '../../../shared/types';
import { recordAnswer } from '../state/progress';
import { sfx } from '../lib/sound';
import { useSettings } from '../state/settings';

export interface QuizState {
  index: number;
  picked: number | null;
  correctCount: number;
  done: boolean;
}

export function useQuiz(questions: Question[], onFinish?: (score: number) => void) {
  const { settings } = useSettings();
  const [state, setState] = useState<QuizState>({ index: 0, picked: null, correctCount: 0, done: false });

  const current = questions[state.index];

  const pick = useCallback(
    (choice: number) => {
      setState((prev) => {
        if (prev.picked != null || prev.done) return prev;
        const q = questions[prev.index];
        const correct = choice === q.answer;
        recordAnswer(q.topic, correct);
        if (correct) sfx.correct(settings.sound);
        else sfx.wrong(settings.sound);
        return { ...prev, picked: choice, correctCount: prev.correctCount + (correct ? 1 : 0) };
      });
    },
    [questions, settings.sound],
  );

  const next = useCallback(() => {
    setState((prev) => {
      const last = prev.index >= questions.length - 1;
      if (last) {
        if (settings.sound) sfx.star(true);
        onFinish?.(prev.correctCount);
        return { ...prev, done: true };
      }
      return { ...prev, index: prev.index + 1, picked: null };
    });
  }, [questions.length, onFinish, settings.sound]);

  const restart = useCallback(() => setState({ index: 0, picked: null, correctCount: 0, done: false }), []);

  return { state, current, pick, next, restart, total: questions.length };
}
