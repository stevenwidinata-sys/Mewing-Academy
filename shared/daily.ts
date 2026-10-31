import { getQuestions, QUIZ_TOPICS, shuffle, type Rng } from './questions';
import type { Difficulty, Question } from './types';

/** Deterministic RNG from a string seed (mulberry32 over an FNV-1a hash). */
export function seededRng(seed: string): Rng {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DAILY_COUNT = 5;

/** Same 5 mixed questions for everyone on a given date (YYYY-MM-DD). */
export function getDailyQuestions(date: string): Question[] {
  const rng = seededRng(`mewing-${date}`);
  const topics = shuffle(rng, QUIZ_TOPICS).slice(0, DAILY_COUNT);
  return topics.map((t, i) => getQuestions(t, ((i % 2) + 1) as Difficulty, 1, rng)[0]);
}
