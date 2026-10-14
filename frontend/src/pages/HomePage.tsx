import { Link } from 'react-router-dom';
import { TOPICS } from '../../../shared/types';
import { Mewy } from '../components/Mewy';
import { SpriteScene } from '../components/Sprite';
import { useSettings } from '../state/settings';

const GAMES: { to: string; emoji: string; key: 'navQuiz' | 'navMemory' | 'navTutor' }[] = [
  { to: '/quiz', emoji: '✋', key: 'navQuiz' },
  { to: '/memory', emoji: '🧠', key: 'navMemory' },
  { to: '/tutor', emoji: '💬', key: 'navTutor' },
];

export function HomePage() {
  const { tr, settings } = useSettings();
  return (
    <section>
      <div className="hero" style={{ marginBottom: '2rem' }}>
        <span className="hero__float" style={{ left: '8%', top: '20%', fontSize: '2rem' }} aria-hidden="true">⭐</span>
        <span className="hero__float" style={{ right: '10%', top: '30%', fontSize: '1.6rem', animationDelay: '1.5s' }} aria-hidden="true">🎨</span>
        <span className="hero__float" style={{ left: '18%', bottom: '12%', fontSize: '1.4rem', animationDelay: '2.5s' }} aria-hidden="true">🔢</span>
        <div className="blink" style={{ display: 'inline-block' }}>
          <Mewy size={96} />
        </div>
        <h1 style={{ fontSize: '1.6rem' }}>{tr('appName')}</h1>
        <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>{tr('tagline')}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Link to="/quiz" className="btn">{tr('heroPlay')}</Link>
          <Link to="/how-ai" className="btn btn--secondary">{tr('heroHow')}</Link>
        </div>
      </div>

      <h2>{tr('pickGame')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="card card--link" style={{ textDecoration: 'none', color: 'var(--white)', textAlign: 'center', fontFamily: 'var(--font-pixel)' }}>
            <div className="tile-emoji" style={{ fontSize: '2.5rem' }}>{g.emoji}</div>
            <div style={{ marginTop: 8, color: 'var(--accent)' }}>{tr(g.key)}</div>
          </Link>
        ))}
      </div>

      <h2>{tr('chooseTopic')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
        {TOPICS.map((topic) => (
          <Link key={topic.id} to={`/quiz?topic=${topic.id}`} className="btn btn--ghost" style={{ padding: '1rem', textAlign: 'center' }}>
            <SpriteScene groups={[{ sprite: topic.sprite, color: topic.color, count: 1 }]} size={36} />
            <div style={{ marginTop: 8, fontSize: '0.7rem' }}>{topic.title[settings.lang]}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
