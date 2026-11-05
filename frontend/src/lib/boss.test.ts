import { describe, expect, it } from 'vitest';
import { bossHp } from './boss';

describe('bossHp', () => {
  it('needs 60% of the round, and at least 2 hits', () => {
    expect(bossHp(5)).toBe(3);
    expect(bossHp(10)).toBe(6);
    expect(bossHp(1)).toBe(2);
  });
});
