import { Link } from 'react-router-dom';
import { getLessons } from '../../../shared/lessons';
import { TOPICS } from '../../../shared/types';
import { TopicIcon } from '../components/TopicIcon';
import { useSettings } from '../state/settings';

export function LessonsPage() {
  const { tr, settings } = useSettings();
  return (
    <section>
      <h1>📚 {tr('navLessons')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>
        {settings.lang === 'en' ? 'Learn first, then play the Hand Quiz to practice!' : 'Belajar dulu, lalu main Kuis Tangan untuk berlatih!'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {TOPICS.map((topic) => (
          <Link
            key={topic.id}
            to={`/lessons/${topic.id}`}
            className="card card--link"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', color: 'var(--text)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TopicIcon emoji={topic.emoji} size={44} />
              <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{topic.title[settings.lang]}</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-read)', margin: 0, flex: 1 }}>{topic.blurb[settings.lang]}</p>
            <span style={{ fontFamily: 'var(--font-read)', fontSize: '0.8rem', opacity: 0.8 }}>
              📖 {getLessons(topic.id).length} {settings.lang === 'en' ? 'mini-lessons' : 'mini-pelajaran'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
