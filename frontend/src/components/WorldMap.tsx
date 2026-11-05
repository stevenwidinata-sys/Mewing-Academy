import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../../../shared/types';
import { useProgress } from '../state/progress';
import { BADGES, correctIn } from '../state/rewards';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

const ROW_H = 150;
const CLEAR_AT = BADGES[0].need; // bronze badge = level cleared
const ISLAND_COLORS = ['#3bb54a', '#27e0d8', '#ffcc00', '#ff8a1f', '#ff5ca8', '#9b4de0'];

/** Mario-style map: one island per topic along a winding path. */
export function WorldMap() {
  const { settings } = useSettings();
  const progress = useProgress();
  const [cols, setCols] = useState(() => (window.innerWidth < 640 ? 2 : 4));
  useEffect(() => {
    const onResize = () => setCols(window.innerWidth < 640 ? 2 : 4);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Snake layout: left->right, then right->left on the next row.
  const spots = TOPICS.map((t, i) => {
    const row = Math.floor(i / cols);
    const c = i % cols;
    const col = row % 2 ? cols - 1 - c : c;
    return { t, x: ((col + 0.5) / cols) * 100, y: row * ROW_H + 70, cleared: correctIn(progress, t.id) >= CLEAR_AT };
  });
  const rows = Math.ceil(TOPICS.length / cols);
  const height = rows * ROW_H + 20;
  const here = Math.max(0, spots.findIndex((s) => !s.cleared));
  const allDone = spots.every((s) => s.cleared);
  const mewy = spots[allDone ? spots.length - 1 : here];
  const path = spots.map((s, i) => `${i ? 'L' : 'M'} ${s.x * 4} ${s.y}`).join(' ');

  return (
    <div className="world-map" style={{ height }}>
      <svg className="world-map__path" viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={path} />
      </svg>
      {spots.map((s, i) => (
        <Link
          key={s.t.id}
          to={`/lessons/${s.t.id}`}
          className={`island${s.cleared ? ' island--cleared' : ''}${i === here && !allDone ? ' island--next' : ''}`}
          style={{ left: `${s.x}%`, top: s.y, '--island': ISLAND_COLORS[i % ISLAND_COLORS.length] } as React.CSSProperties}
          title={s.t.blurb[settings.lang]}
        >
          <span className="island__num">{i + 1}</span>
          <span className="island__emoji" aria-hidden="true">{s.t.emoji}</span>
          {s.cleared && <span className="island__flag" aria-label={settings.lang === 'en' ? 'cleared' : 'selesai'}>🚩</span>}
          <span className="island__name">{s.t.title[settings.lang]}</span>
        </Link>
      ))}
      <div className="map-mewy" style={{ left: `${mewy.x}%`, top: mewy.y - 64 }} aria-hidden="true">
        <Mewy size={40} mood="happy" />
      </div>
    </div>
  );
}
