import { Link } from 'react-router-dom';
import { getLessons } from '../../../shared/lessons';
import { TOPICS, type Text, type TopicId } from '../../../shared/types';
import { SpriteScene } from '../components/Sprite';
import { useSettings } from '../state/settings';

const BLURB: Record<Exclude<TopicId, 'memory'>, Text> = {
  counting: { en: 'Count, compare, and put numbers in order.', id: 'Berhitung, membandingkan, dan mengurutkan angka.' },
  math: { en: 'Add, take away, and solve little story problems.', id: 'Menambah, mengurang, dan soal cerita.' },
  colors: { en: 'Name colors, spot them around you, and mix them.', id: 'Mengenal warna, menemukannya, dan mencampurnya.' },
  shapes: { en: 'Circles, squares, triangles and their corners.', id: 'Lingkaran, persegi, segitiga, dan sudutnya.' },
  animals: { en: 'Sounds, homes, and fun facts about animals.', id: 'Suara, tempat tinggal, dan fakta hewan.' },
  letters: { en: 'The alphabet, first letters, and vowels.', id: 'Alfabet, huruf awal, dan huruf vokal.' },
};

export function LessonsPage() {
  const { tr, settings } = useSettings();
  return (
    <section>
      <h1>📚 {tr('navLessons')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>
        {settings.lang === 'en' ? 'Learn first, then play the Hand Quiz to practice!' : 'Belajar dulu, lalu main Kuis Tangan untuk berlatih!'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {TOPICS.map((topic) => {
          const modules = getLessons(topic.id as Exclude<TopicId, 'memory'>);
          return (
            <Link
              key={topic.id}
              to={`/lessons/${topic.id}`}
              className="card card--link"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', color: 'var(--text)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <SpriteScene groups={[{ sprite: topic.sprite, color: topic.color, count: 1 }]} size={44} />
                <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{topic.title[settings.lang]}</h3>
              </div>
              <p style={{ fontFamily: 'var(--font-read)', margin: 0, flex: 1 }}>{BLURB[topic.id as Exclude<TopicId, 'memory'>][settings.lang]}</p>
              <span style={{ fontFamily: 'var(--font-read)', fontSize: '0.8rem', opacity: 0.8 }}>
                📖 {modules.length} {settings.lang === 'en' ? 'mini-lessons' : 'mini-pelajaran'}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
