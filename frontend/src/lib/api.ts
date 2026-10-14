import { makeMemoryRound } from '../../../shared/memory';
import { getQuestions, isQuizTopic, type QuizTopic } from '../../../shared/questions';
import { tutorReply } from '../../../shared/tutor';
import type { Difficulty, Lang, MemoryRound, Question, TutorReply } from '../../../shared/types';

/**
 * Talks to the backend, but falls back to the same shared generators in the
 * browser if the API is unreachable. The site is fully playable offline.
 */
async function tryFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchQuestions(topic: QuizTopic, difficulty: Difficulty, count: number): Promise<Question[]> {
  const data = await tryFetch<{ questions: Question[] }>(
    `/api/questions?topic=${topic}&difficulty=${difficulty}&count=${count}`,
  );
  if (data?.questions?.length) return data.questions;
  return getQuestions(topic, difficulty, count);
}

export async function fetchMemoryRound(level: Difficulty): Promise<MemoryRound> {
  const data = await tryFetch<{ round: MemoryRound }>(`/api/memory?level=${level}`);
  return data?.round ?? makeMemoryRound(level);
}

export async function askTutor(message: string, lang: Lang): Promise<TutorReply> {
  const data = await tryFetch<TutorReply>('/api/tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, lang }),
  });
  return data ?? tutorReply(message, lang);
}

export { isQuizTopic };
export type { QuizTopic };
