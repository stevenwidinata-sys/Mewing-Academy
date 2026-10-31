import { describe, expect, it } from 'vitest';
import { suggestLevel } from './adaptive';

describe('suggestLevel', () => {
  it('moves up after a strong round', () => {
    expect(suggestLevel(1, 4, 5)).toEqual({ kind: 'up', next: 2 });
    expect(suggestLevel(2, 5, 5)).toEqual({ kind: 'up', next: 3 });
  });
  it('moves down after a hard round', () => {
    expect(suggestLevel(3, 2, 5)).toEqual({ kind: 'down', next: 2 });
    expect(suggestLevel(2, 0, 2)).toEqual({ kind: 'down', next: 1 });
  });
  it('stays at the edges and in the middle', () => {
    expect(suggestLevel(3, 5, 5).kind).toBe('stay');
    expect(suggestLevel(1, 0, 5).kind).toBe('stay');
    expect(suggestLevel(2, 3, 5).kind).toBe('stay');
  });
});
