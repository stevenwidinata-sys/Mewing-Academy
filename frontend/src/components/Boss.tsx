import type { Lang } from '../../../shared/types';
import { bossHp } from '../lib/boss';

// Pixel slime "boss" (14x12). G = body, D = shade, K = dark, W = white, R = red.
const SLIME = [
  '....GGGGGG....',
  '..GGGGGGGGGG..',
  '.GGGGGGGGGGGG.',
  '.GGWWGGGGWWGG.',
  'GGGWKGGGGWKGGG',
  'GGGWKGGGGWKGGG',
  'GGGGGGGGGGGGGG',
  'GGGGKKKKKKGGGG',
  'GGGGKRRRRKGGGG',
  'DGGGGKKKKGGGGD',
  '.DDGGGGGGGGDD.',
  '...DDDDDDDD...',
];
const PAL: Record<string, string> = { G: '#7a5cff', D: '#4b34b8', K: '#1a1430', W: '#fdf6e3', R: '#ff5ca8' };

export function BossSprite({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 12) / 14} viewBox="0 0 14 12" role="img" aria-label="Boss slime" style={{ shapeRendering: 'crispEdges' }}>
      {SLIME.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PAL[ch]} />)),
      )}
    </svg>
  );
}

/** Boss with an HP bar. Each right answer is one hit. */
export function BossBar({ hits, total, lang }: { hits: number; total: number; lang: Lang }) {
  const hp = bossHp(total);
  const left = Math.max(0, hp - hits);
  const dead = left === 0;
  return (
    <div className={`boss${dead ? ' boss--dead' : ''}`} aria-live="polite">
      <div key={hits} className={`boss__sprite${hits ? ' boss__sprite--hit' : ''}`}>
        <BossSprite size={72} />
      </div>
      <div className="boss__info">
        <strong className="boss__name">{lang === 'en' ? 'BOSS: Muddle Slime' : 'BOS: Slime Bingung'}</strong>
        <div className="boss__hp" role="meter" aria-valuemin={0} aria-valuemax={hp} aria-valuenow={left} aria-label="Boss HP">
          {Array.from({ length: hp }, (_, i) => (
            <span key={i} className={i < left ? 'boss__heart' : 'boss__heart boss__heart--empty'}>♥</span>
          ))}
        </div>
        <small>
          {dead
            ? lang === 'en' ? 'Defeated! 🎉' : 'Kalah! 🎉'
            : lang === 'en' ? 'Each right answer hits the boss!' : 'Setiap jawaban benar memukul bos!'}
        </small>
      </div>
    </div>
  );
}

/** "x3 COMBO!" pop with sparks, shown from 2 right answers in a row. */
export function ComboPop({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <div key={streak} className="combo" aria-live="polite">
      <span className="combo__text">x{streak} COMBO!</span>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
        <span key={k} className="combo__spark" style={{ '--a': `${k * 45}deg` } as React.CSSProperties} />
      ))}
    </div>
  );
}
