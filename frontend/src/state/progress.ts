import { useCallback, useSyncExternalStore } from 'react';
import type { TopicId } from '../../../shared/types';

export interface Progress {
  stars: number;
  byTopic: Partial<Record<TopicId, { correct: number; total: number }>>;
  lastPlayed: string | null; // YYYY-MM-DD
  streak: number;
}

const KEY = 'mewing.progress.v1';
const EMPTY: Progress = { stars: 0, byTopic: {}, lastPlayed: null, streak: 0 };

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    /* ignore */
  }
  return EMPTY;
}

let current = read();
const listeners = new Set<() => void>();

function write(next: Progress) {
  current = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

const today = () => new Date().toISOString().slice(0, 10);
const dayBefore = (d: string) => {
  const date = new Date(d);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

export function recordAnswer(topic: TopicId, correct: boolean) {
  const prev = current;
  const topicStats = prev.byTopic[topic] ?? { correct: 0, total: 0 };
  const now = today();
  let streak = prev.streak;
  if (prev.lastPlayed !== now) {
    streak = prev.lastPlayed === dayBefore(now) ? prev.streak + 1 : 1;
  }
  write({
    stars: prev.stars + (correct ? 1 : 0),
    byTopic: { ...prev.byTopic, [topic]: { correct: topicStats.correct + (correct ? 1 : 0), total: topicStats.total + 1 } },
    lastPlayed: now,
    streak,
  });
}

export function resetProgress() {
  write(EMPTY);
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    useCallback((cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    }, []),
    () => current,
  );
}
