// Mewy: the Mewing Academy mascot/logo, drawn as pixel art so there is no
// image asset to ship. A friendly yellow cat (nod to the brand's primary color).
export function Mewy({ size = 64, title = 'Mewy the mascot' }: { size?: number; title?: string }) {
  const px = size / 16;
  const Y = '#ffcc00';
  const Yd = '#e0a800';
  const K = '#1a1430';
  const P = '#ff5ca8';
  const W = '#fdf6e3';
  // 16x16 grid. Each entry: [x, y, color].
  const cells: [number, number, string][] = [];
  const rect = (x1: number, y1: number, x2: number, y2: number, c: string) => {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) cells.push([x, y, c]);
  };
  // Ears
  rect(2, 1, 3, 3, Y);
  rect(12, 1, 13, 3, Y);
  rect(3, 2, 3, 3, P);
  rect(12, 2, 12, 3, P);
  // Head
  rect(3, 3, 12, 12, Y);
  rect(2, 5, 2, 10, Y);
  rect(13, 5, 13, 10, Y);
  // Cheeks shading
  rect(3, 11, 12, 12, Yd);
  // Eyes
  rect(5, 6, 6, 7, K);
  rect(9, 6, 10, 7, K);
  rect(5, 6, 5, 6, W);
  rect(9, 6, 9, 6, W);
  // Nose + mouth
  rect(7, 8, 8, 8, P);
  rect(6, 9, 6, 9, K);
  rect(9, 9, 9, 9, K);
  rect(7, 9, 8, 9, K);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 16 16`}
      role="img"
      aria-label={title}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {cells.map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={c} />
      ))}
      <desc>{`${px}px pixel cat`}</desc>
    </svg>
  );
}
