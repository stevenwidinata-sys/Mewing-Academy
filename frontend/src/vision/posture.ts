import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export type PostureTip = 'good' | 'come-closer' | 'center' | 'chin-up' | 'none';

// Face landmark indices (MediaPipe FaceMesh): nose tip, chin, forehead, eyes.
const NOSE = 1;
const CHIN = 152;
const FOREHEAD = 10;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;

/**
 * A gentle, encouraging posture read for the "sit up and look at the screen"
 * nudge. Not a medical or orthodontic claim: it only checks the face is
 * centered, close enough, and roughly upright. Returns 'none' if no face.
 */
export function readPosture(face: FaceLandmarkerResult | undefined): PostureTip {
  const pts = face?.faceLandmarks?.[0];
  if (!pts) return 'none';
  const nose = pts[NOSE];
  const chin = pts[CHIN];
  const forehead = pts[FOREHEAD];
  const left = pts[LEFT_EYE];
  const right = pts[RIGHT_EYE];
  if (!nose || !chin || !forehead || !left || !right) return 'none';

  // Face height as a fraction of the frame; too small means too far away.
  const faceHeight = Math.abs(chin.y - forehead.y);
  if (faceHeight < 0.18) return 'come-closer';

  // Horizontal centering of the nose.
  if (nose.x < 0.3 || nose.x > 0.7) return 'center';

  // Head tilted far back (chin high relative to forehead): "chin up" nudge.
  const eyeMidY = (left.y + right.y) / 2;
  const upperRatio = (eyeMidY - forehead.y) / faceHeight;
  if (upperRatio < 0.12) return 'chin-up';

  return 'good';
}
