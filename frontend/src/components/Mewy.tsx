import { FURS, type FurId, type ItemId } from '../state/rewards';
import { useSettings } from '../state/settings';

// Mewy: the Mewing Academy mascot, drawn as pixel art (no image assets).
// Fur color, outfit and mood are all drawn from the same 16-wide grid.
// Rows -4..-1 hold hats; rows 13..15 hold neckwear.

export type Mood = 'idle' | 'happy' | 'sad' | 'think';

type Rect = (x1: number, y1: number, x2: number, y2: number, c: string) => void;

const K = '#1a1430';
const PINK = '#ff5ca8';
const CYAN = '#27e0d8';
const W = '#fdf6e3';
const RED = '#e83b3b';

function drawItem(item: ItemId, r: Rect) {
  switch (item) {
    case 'glasses':
      r(4, 5, 7, 5, K); r(8, 5, 11, 5, K);
      r(4, 5, 4, 8, K); r(11, 5, 11, 8, K); r(7, 5, 7, 7, K); r(8, 5, 8, 7, K);
      r(4, 8, 6, 8, K); r(9, 8, 11, 8, K);
      break;
    case 'partyhat':
      r(5, 2, 10, 2, PINK); r(6, 1, 9, 1, CYAN); r(6, 0, 9, 0, PINK);
      r(7, -1, 8, -1, CYAN); r(7, -2, 8, -2, PINK); r(7, -3, 8, -3, W);
      break;
    case 'gradcap':
      r(2, 1, 13, 1, K); r(5, 2, 10, 2, K); r(7, 0, 8, 0, K); r(13, 2, 13, 4, CYAN);
      break;
    case 'wizard': {
      const P = '#6b3fa0';
      r(2, 2, 13, 2, P); r(5, 0, 10, 1, P); r(6, -2, 9, -1, P); r(7, -3, 8, -3, P); r(8, -4, 9, -4, P);
      r(7, 0, 7, 0, '#ffcc00'); r(8, -2, 8, -2, '#ffcc00');
      break;
    }
    case 'safari':
      r(2, 2, 13, 2, '#c9a26b'); r(5, 1, 10, 1, '#7a4f2a'); r(5, -1, 10, 0, '#c9a26b');
      break;
    case 'beret':
      r(3, 2, 10, 2, RED); r(4, 1, 11, 1, RED); r(5, 0, 10, 0, RED); r(8, -1, 8, -1, RED);
      break;
    case 'scarf':
      r(3, 13, 12, 13, RED); r(10, 14, 11, 15, RED);
      r(5, 13, 5, 13, W); r(8, 13, 8, 13, W); r(11, 13, 11, 13, W);
      break;
    case 'bow':
      r(5, 13, 6, 14, CYAN); r(9, 13, 10, 14, CYAN); r(7, 13, 8, 14, '#1a8f8a');
      break;
  }
}

interface Props {
  size?: number;
  title?: string;
  fur?: FurId;
  /** undefined = use the saved outfit; null = no outfit. */
  item?: ItemId | null;
  mood?: Mood;
  /** Where the eyes look, each -1..1 (pixels on the 16-wide grid). */
  look?: { x: number; y: number };
}

export function Mewy({ size = 64, title = 'Mewy the mascot', fur, item, mood = 'idle', look }: Props) {
  const { settings } = useSettings();
  const furId = fur ?? settings.mewyFur;
  const outfit = item === undefined ? settings.mewyItem : item;
  const f = FURS.find((x) => x.id === furId) ?? FURS[0];
  const eye = f.eye ?? K;

  const cells: [number, number, string][] = [];
  const r: Rect = (x1, y1, x2, y2, c) => {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) cells.push([x, y, c]);
  };

  // Ears
  r(2, 1, 3, 3, f.main); r(12, 1, 13, 3, f.main); r(3, 2, 3, 3, PINK); r(12, 2, 12, 3, PINK);
  // Head
  r(3, 3, 12, 12, f.main); r(2, 5, 2, 10, f.main); r(13, 5, 13, 10, f.main);
  r(3, 11, 12, 12, f.shade);
  if (furId === 'calico') {
    r(3, 3, 5, 5, '#ff9a3c'); r(10, 9, 12, 11, '#3a3550'); r(11, 3, 12, 4, '#3a3550');
  }
  // Eyes (looking up when thinking, or toward `look`)
  const lx = Math.max(-1, Math.min(1, look?.x ?? 0));
  const ey = (mood === 'think' ? 5 : 6) + Math.max(-1, Math.min(1, look?.y ?? 0));
  r(5 + lx, ey, 6 + lx, ey + 1, eye); r(9 + lx, ey, 10 + lx, ey + 1, eye);
  r(5 + lx, ey, 5 + lx, ey, W); r(9 + lx, ey, 9 + lx, ey, W);
  // Nose
  r(7, 8, 8, 8, PINK);
  // Mouth by mood
  if (mood === 'happy') { r(6, 9, 6, 9, K); r(9, 9, 9, 9, K); r(7, 10, 8, 10, K); }
  else if (mood === 'sad') { r(7, 9, 8, 9, K); r(6, 10, 6, 10, K); r(9, 10, 9, 10, K); }
  else if (mood === 'think') { r(7, 9, 8, 10, K); }
  else { r(6, 9, 6, 9, K); r(9, 9, 9, 9, K); r(7, 9, 8, 9, K); }

  if (outfit) drawItem(outfit, r);

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 -4 16 20"
      role="img"
      aria-label={title}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {cells.map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={c} />
      ))}
    </svg>
  );
}
