import { WorldMap } from '../components/WorldMap';
import { useSettings } from '../state/settings';

export function LessonsPage() {
  const { tr, settings } = useSettings();
  const en = settings.lang === 'en';
  return (
    <section>
      <h1>🗺️ {tr('navLessons')}</h1>
      <p style={{ fontFamily: 'var(--font-read)' }}>
        {en
          ? 'Pick an island to learn, then play the Hand Quiz to practice! Get 5 right answers in a topic to plant your flag 🚩.'
          : 'Pilih pulau untuk belajar, lalu main Kuis Tangan untuk berlatih! Dapatkan 5 jawaban benar di satu topik untuk menancapkan bendera 🚩.'}
      </p>
      <WorldMap />
    </section>
  );
}
