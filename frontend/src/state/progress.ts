import { useSyncExternalStore } from 'react';
import type { TopicId } from '../../../shared/types';
import { unlockKeys } from './rewards';

export interface Progress {
  stars: number;
  byTopic: Partial<Record<TopicId, { correct: number; total: number }>>;
  lastPlayed: string | null; // YYYY-MM-DD
  streak: number;
  lastDaily: string | null; // YYYY-MM-DD of the last finished Daily Challenge
}

const KEY = 'mewing.progress.v1';
const EMPTY: Progress = { stars: 0, byTopic: {}, lastPlayed: null, streak: 0, lastDaily: null };

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

// Queue of newly earned rewards, shown one by one as pop-ups.
let toasts: string[] = [];
const toastListeners = new Set<() => void>();

function write(next: Progress) {
  const before = new Set(unlockKeys(current));
  current = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
  const fresh = unlockKeys(next).filter((k) => !before.has(k));
  if (fresh.length) {
    toasts = [...toasts, ...fresh];
    toastListeners.forEach((l) => l());
  }
}

export const today = () => new Date().toISOString().slice(0, 10);
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
    ...prev,
    stars: prev.stars + (correct ? 1 : 0),
    byTopic: { ...prev.byTopic, [topic]: { correct: topicStats.correct + (correct ? 1 : 0), total: topicStats.total + 1 } },
    lastPlayed: now,
    streak,
  });
}

export const DAILY_BONUS = 2;

/** Marks today's Daily Challenge as done. Bonus stars only once per day. */
export function completeDaily(): boolean {
  if (current.lastDaily === today()) return false;
  write({ ...current, stars: current.stars + DAILY_BONUS, lastDaily: today() });
  return true;
}

export function resetProgress() {
  write(EMPTY);
}

export function dismissToast() {
  toasts = toasts.slice(1);
  toastListeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const subscribeToasts = (cb: () => void) => {
  toastListeners.add(cb);
  return () => {
    toastListeners.delete(cb);
  };
};

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => current);
}

export function useToasts(): string[] {
  return useSyncExternalStore(subscribeToasts, () => toasts);
}
