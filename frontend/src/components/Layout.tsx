import { NavLink, Outlet } from 'react-router-dom';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

const NAV: { to: string; key: 'navHome' | 'navLessons' | 'navQuiz' | 'navMemory' | 'navTutor' | 'navProgress' | 'navHowAi' | 'navAbout' | 'navSettings' }[] = [
  { to: '/', key: 'navHome' },
  { to: '/lessons', key: 'navLessons' },
  { to: '/quiz', key: 'navQuiz' },
  { to: '/memory', key: 'navMemory' },
  { to: '/tutor', key: 'navTutor' },
  { to: '/progress', key: 'navProgress' },
  { to: '/how-ai', key: 'navHowAi' },
  { to: '/about', key: 'navAbout' },
  { to: '/settings', key: 'navSettings' },
];

export function Layout() {
  const { tr, settings, set } = useSettings();
  const { stars } = useProgress();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem' }}>
      <a href="#main" className="btn skip-link">{tr('skipToContent')}</a>

      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Mewy size={56} />
          <span>
            <span style={{ fontFamily: 'var(--font-pixel)', color: 'var(--accent)', fontSize: '1.1rem', display: 'block', textShadow: '3px 3px 0 var(--shadow)' }}>
              {tr('appName')}
            </span>
            <span style={{ fontFamily: 'var(--font-read)', fontSize: '0.85rem', color: 'var(--white)' }}>{tr('tagline')}</span>
          </span>
        </NavLink>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="pixel-panel" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }} aria-label={`${stars} ${tr('progressTotal')}`}>
            ⭐ {stars}
          </span>
          <button
            type="button"
            className="btn btn--secondary"
            style={{ fontSize: '0.7rem' }}
            onClick={() => set('lang', settings.lang === 'en' ? 'id' : 'en')}
            aria-label={tr('settingsLang')}
          >
            {settings.lang === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
          </button>
        </div>
      </header>

      <nav aria-label="Main" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="btn btn--ghost"
            style={({ isActive }) => ({ fontSize: '0.7rem', background: isActive ? 'var(--yellow)' : 'var(--panel-light)', color: isActive ? 'var(--ink)' : 'var(--white)' })}
          >
            {tr(item.key)}
          </NavLink>
        ))}
      </nav>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-read)', opacity: 0.8 }}>
        <p>{tr('cameraPrivacy')}</p>
        <p>Mewing Academy · 2026</p>
      </footer>
    </div>
  );
}
