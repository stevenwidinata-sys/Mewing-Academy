import { describe, expect, it } from 'vitest';
import { DAILY_COUNT, getDailyQuestions } from '../../shared/daily';

describe('daily challenge', () => {
  it('gives the same questions for the same day', () => {
    const a = getDailyQuestions('2026-10-31').map((q) => q.prompt.en);
    const b = getDailyQuestions('2026-10-31').map((q) => q.prompt.en);
    expect(a).toEqual(b);
  });

  it('mixes 5 different topics with valid answers', () => {
    const qs = getDailyQuestions('2026-11-01');
    expect(qs).toHaveLength(DAILY_COUNT);
    expect(new Set(qs.map((q) => q.topic)).size).toBe(DAILY_COUNT);
    for (const q of qs) expect(q.answer).toBeLessThan(q.choices.length);
  });

  it('changes from day to day', () => {
    const a = getDailyQuestions('2026-11-01').map((q) => q.prompt.en).join('|');
    const b = getDailyQuestions('2026-11-02').map((q) => q.prompt.en).join('|');
    expect(a).not.toBe(b);
  });
});
