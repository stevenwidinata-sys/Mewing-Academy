import { Link } from 'react-router-dom';
import { TOPICS, type Text, type TopicId } from '../../../shared/types';
import { SpriteScene } from '../components/Sprite';
import { useSettings } from '../state/settings';

// Short, kid-friendly "what you will learn" blurbs per topic.
const BLURB: Record<Exclude<TopicId, 'memory'>, Text> = {
  counting: { en: 'Count things from 1 to 12 and find how many.', id: 'Berhitung dari 1 sampai 12 dan cari jumlahnya.' },
  math: { en: 'Add and take away with pictures to help you.', id: 'Menambah dan mengurang dengan bantuan gambar.' },
  colors: { en: 'Name colors and even mix them together!', id: 'Mengenal warna dan mencampurnya!' },
  shapes: { en: 'Circles, squares, triangles and their corners.', id: 'Lingkaran, persegi, segitiga, dan sudutnya.' },
  animals: { en: 'Fun facts about animals big and small.', id: 'Fakta seru tentang hewan besar dan kecil.' },
  letters: { en: 'The alphabet, vowels, and letter order.', id: 'Alfabet, huruf vokal, dan urutan huruf.' },
};

export function LessonsPage() {
  const { tr, settings } = useSettings();
  return (
    <section>
      <h1>{tr('navLessons')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>{tr('chooseTopic')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {TOPICS.map((topic) => (
          <div key={topic.id} className="pixel-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <SpriteScene groups={[{ sprite: topic.sprite, color: topic.color, count: 1 }]} size={44} />
              <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{topic.title[settings.lang]}</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-read)', margin: 0, flex: 1 }}>{BLURB[topic.id as Exclude<TopicId, 'memory'>][settings.lang]}</p>
            <Link to={`/quiz?topic=${topic.id}`} className="btn" style={{ textAlign: 'center' }}>{tr('start')}</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
