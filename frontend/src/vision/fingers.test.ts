import { describe, expect, it } from 'vitest';
import { classify, extendedFingers, type Point } from './fingers';

// Build a synthetic hand. Wrist at bottom; each finger either extended (tip far)
// or curled (tip near the PIP). Coordinates are normalized like MediaPipe (0..1,
// y grows downward), so "up" means a smaller y / larger distance from wrist.
function hand(up: { thumb?: boolean; index?: boolean; middle?: boolean; ring?: boolean; pinky?: boolean }): Point[] {
  const lm: Point[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.9 }));
  lm[0] = { x: 0.5, y: 0.95 }; // wrist
  const finger = (tip: number, pip: number, x: number, extended: boolean) => {
    lm[pip] = { x, y: 0.6 };
    lm[tip] = extended ? { x, y: 0.3 } : { x, y: 0.66 }; // curled tip sits just past pip
  };
  finger(4, 2, 0.35, up.thumb ?? false); // thumb spreads sideways
  if (up.thumb) lm[4] = { x: 0.2, y: 0.55 };
  finger(8, 6, 0.45, up.index ?? false);
  finger(12, 10, 0.5, up.middle ?? false);
  finger(16, 14, 0.55, up.ring ?? false);
  finger(20, 18, 0.6, up.pinky ?? false);
  return lm;
}

describe('extendedFingers', () => {
  it('detects a single raised index finger', () => {
    const f = extendedFingers(hand({ index: true }));
    expect(f.index).toBe(true);
    expect([f.middle, f.ring, f.pinky]).toEqual([false, false, false]);
  });

  it('detects all four fingers up', () => {
    const f = extendedFingers(hand({ index: true, middle: true, ring: true, pinky: true }));
    expect([f.index, f.middle, f.ring, f.pinky]).toEqual([true, true, true, true]);
  });
});

describe('classify point mode', () => {
  it('maps each single finger to A,B,C,D', () => {
    expect(classify(hand({ index: true }), 'point', 4).answer).toBe(0);
    expect(classify(hand({ middle: true }), 'point', 4).answer).toBe(1);
    expect(classify(hand({ ring: true }), 'point', 4).answer).toBe(2);
    expect(classify(hand({ pinky: true }), 'point', 4).answer).toBe(3);
  });

  it('is unclear when two fingers are up', () => {
    expect(classify(hand({ index: true, middle: true }), 'point', 4).answer).toBeNull();
  });

  it('respects choiceCount (3 choices -> D is invalid)', () => {
    expect(classify(hand({ pinky: true }), 'point', 3).answer).toBeNull();
  });
});

describe('classify count mode', () => {
  it('counts raised fingers 1..4 -> A..D', () => {
    expect(classify(hand({ index: true }), 'count', 4).answer).toBe(0);
    expect(classify(hand({ index: true, middle: true }), 'count', 4).answer).toBe(1);
    expect(classify(hand({ index: true, middle: true, ring: true }), 'count', 4).answer).toBe(2);
    expect(classify(hand({ index: true, middle: true, ring: true, pinky: true }), 'count', 4).answer).toBe(3);
  });

  it('returns null for a closed fist', () => {
    expect(classify(hand({}), 'count', 4).answer).toBeNull();
    expect(classify(hand({}), 'count', 4).raised).toBe(0);
  });
});

describe('guards', () => {
  it('handles missing landmarks', () => {
    expect(classify(undefined, 'point', 4).answer).toBeNull();
    expect(classify([{ x: 0, y: 0 }], 'count', 4).answer).toBeNull();
  });
});
