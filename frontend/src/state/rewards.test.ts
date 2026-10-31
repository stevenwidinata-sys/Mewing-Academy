import { describe, expect, it } from 'vitest';
import type { Progress } from './progress';
import { badgeFor, isFurUnlocked, isItemUnlocked, nextBadge, unlockKeys } from './rewards';

const p = (stars: number, byTopic: Progress['byTopic'] = {}): Progress => ({ stars, byTopic, lastPlayed: null, streak: 0, lastDaily: null });

describe('rewards', () => {
  it('unlocks a topic outfit after 5 correct answers in that topic', () => {
    expect(isItemUnlocked(p(4, { math: { correct: 4, total: 6 } }), 'glasses')).toBe(false);
    expect(isItemUnlocked(p(5, { math: { correct: 5, total: 6 } }), 'glasses')).toBe(true);
    // Correct answers in a different topic do not count.
    expect(isItemUnlocked(p(9, { colors: { correct: 9, total: 9 } }), 'glasses')).toBe(false);
  });

  it('unlocks fur colors at star milestones; yellow is always available', () => {
    expect(isFurUnlocked(p(0), 'yellow')).toBe(true);
    expect(isFurUnlocked(p(9), 'orange')).toBe(false);
    expect(isFurUnlocked(p(10), 'orange')).toBe(true);
    expect(isFurUnlocked(p(99), 'calico')).toBe(false);
  });

  it('gives bronze, silver and gold badges', () => {
    expect(badgeFor(4)).toBeNull();
    expect(badgeFor(5)?.tier).toBe('bronze');
    expect(badgeFor(15)?.tier).toBe('silver');
    expect(badgeFor(30)?.tier).toBe('gold');
    expect(nextBadge(30)).toBeNull();
  });

  it('lists earned rewards as keys (used to detect new unlocks)', () => {
    const keys = unlockKeys(p(10, { math: { correct: 5, total: 5 } }));
    expect(keys).toContain('item:glasses');
    expect(keys).toContain('fur:orange');
    expect(keys).toContain('badge:math:bronze');
    expect(keys).not.toContain('fur:yellow');
  });
});
