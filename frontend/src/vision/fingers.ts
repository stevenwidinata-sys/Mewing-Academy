// Pure geometry: turn MediaPipe hand landmarks into an answer index (0=A..3=D).
// Kept DOM-free so it can be unit tested.

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export type FingerMode = 'point' | 'count';

// MediaPipe hand landmark indices.
const WRIST = 0;
const TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 } as const;
const PIPS = { thumb: 2, index: 6, middle: 10, ring: 14, pinky: 18 } as const;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * A finger is "extended" if its tip is farther from the wrist than its middle
 * joint (PIP). This is rotation-tolerant and works for either hand. The thumb
 * is judged the same way but needs a larger margin because it bends sideways.
 */
export function extendedFingers(lm: Point[]): {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
} {
  const wrist = lm[WRIST];
  const isUp = (tip: number, pip: number, margin: number) =>
    dist(lm[tip], wrist) > dist(lm[pip], wrist) * margin;
  return {
    thumb: isUp(TIPS.thumb, PIPS.thumb, 1.35),
    index: isUp(TIPS.index, PIPS.index, 1.05),
    middle: isUp(TIPS.middle, PIPS.middle, 1.05),
    ring: isUp(TIPS.ring, PIPS.ring, 1.05),
    pinky: isUp(TIPS.pinky, PIPS.pinky, 1.05),
  };
}

export interface Classification {
  /** 0=A, 1=B, 2=C, 3=D, or null if the gesture is unclear. */
  answer: number | null;
  /** Count of raised fingers (for on-screen feedback). */
  raised: number;
}

/**
 * point mode: which single finger is up -> index=A, middle=B, ring=C, pinky=D.
 * count mode: how many fingers are up (ignoring thumb) -> 1=A .. 4=D.
 * Returns null when ambiguous so we never guess for a child.
 */
export function classify(lm: Point[] | undefined, mode: FingerMode, choiceCount: number): Classification {
  if (!lm || lm.length < 21) return { answer: null, raised: 0 };
  const f = extendedFingers(lm);
  const fingers = [f.index, f.middle, f.ring, f.pinky];
  const raised = fingers.filter(Boolean).length;

  if (mode === 'count') {
    const answer = raised >= 1 && raised <= choiceCount ? raised - 1 : null;
    return { answer, raised };
  }

  // point mode: exactly one of the four fingers up maps directly to a choice.
  if (raised !== 1) return { answer: null, raised };
  const idx = fingers.indexOf(true); // 0..3
  return { answer: idx < choiceCount ? idx : null, raised };
}
