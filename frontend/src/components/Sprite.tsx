import { COLORS, type ColorId, type SpriteGroup, type SpriteId } from '../../../shared/types';

const EMOJI: Record<SpriteId, string> = {
  apple: '🍎',
  star: '⭐',
  heart: '❤️',
  fish: '🐟',
  ball: '⚫',
  square: '⬛',
  triangle: '🔺',
};

/** A single colored shape, drawn as SVG so color and shape are both honored. */
function Shape({ sprite, color, size }: { sprite: SpriteId; color: ColorId; size: number }) {
  const hex = COLORS[color].hex;
  const name = `${COLORS[color].name.en} ${sprite}`;
  if (sprite === 'square') return <svg width={size} height={size} role="img" aria-label={name}><rect x={1} y={1} width={size - 2} height={size - 2} fill={hex} stroke="#1a1430" strokeWidth={3} /></svg>;
  if (sprite === 'triangle') return <svg width={size} height={size} role="img" aria-label={name}><polygon points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`} fill={hex} stroke="#1a1430" strokeWidth={3} /></svg>;
  if (sprite === 'ball') return <svg width={size} height={size} role="img" aria-label={name}><circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={hex} stroke="#1a1430" strokeWidth={3} /></svg>;
  if (sprite === 'star') return <svg width={size} height={size} role="img" aria-label={name}><polygon points={star(size)} fill={hex} stroke="#1a1430" strokeWidth={2} /></svg>;
  if (sprite === 'heart') return <svg width={size} height={size} role="img" aria-label={name}><path d={heart(size)} fill={hex} stroke="#1a1430" strokeWidth={2} /></svg>;
  // apple / fish: tint an emoji
  return <span role="img" aria-label={name} style={{ fontSize: size * 0.9, filter: tint(color) }}>{EMOJI[sprite]}</span>;
}

function star(s: number): string {
  const cx = s / 2;
  const cy = s / 2;
  const spikes = 5;
  const outer = s / 2 - 2;
  const inner = outer / 2.3;
  let pts = '';
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
  }
  return pts.trim();
}

function heart(s: number): string {
  const w = s - 4;
  const x = 2;
  const y = 3;
  return `M${x + w / 2},${y + w * 0.85} C${x},${y + w * 0.4} ${x + w * 0.1},${y} ${x + w / 2},${y + w * 0.28} C${x + w * 0.9},${y} ${x + w},${y + w * 0.4} ${x + w / 2},${y + w * 0.85} Z`;
}

// Emoji can't be recolored directly; approximate for apple/fish with hue-rotate.
function tint(color: ColorId): string {
  const map: Record<ColorId, string> = {
    red: 'none',
    orange: 'hue-rotate(-25deg)',
    yellow: 'hue-rotate(45deg) saturate(1.4)',
    green: 'hue-rotate(90deg)',
    blue: 'hue-rotate(190deg)',
    purple: 'hue-rotate(260deg)',
  };
  return map[color];
}

export function SpriteScene({ groups, size = 56 }: { groups: SpriteGroup[]; size?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
      {groups.map((g, gi) => (
        <div key={gi} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', maxWidth: size * 4 }}>
          {Array.from({ length: g.count }, (_, i) => (
            <span key={i} className="pop" style={{ display: 'inline-flex' }}>
              <Shape sprite={g.sprite} color={g.color} size={size} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ColorSwatch({ color, size = 20 }: { color: ColorId; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-block', width: size, height: size, background: COLORS[color].hex, border: '2px solid #1a1430', verticalAlign: 'middle', marginRight: 8 }}
    />
  );
}
