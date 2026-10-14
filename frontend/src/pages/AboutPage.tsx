import { Mewy } from '../components/Mewy';
import { useSettings } from '../state/settings';

const CONTENT = {
  en: {
    mission:
      'Mewing Academy makes learning accessible, inclusive and effective for everyone — whatever your background, abilities or learning needs. We turn basic school topics into friendly games you can play with your hands, powered by on-device AI.',
    who: 'Made for curious kids under 10 (and the grown-ups who help them).',
    features: ['Answer with your hand using the camera', 'Memory games to train your brain', 'Ask Mewy, your friendly tutor', 'English and Indonesian', 'High contrast, calm mode, big text and easy-to-read font'],
    featuresTitle: 'What you can do',
    whoTitle: 'Who it is for',
  },
  id: {
    mission:
      'Mewing Academy membuat belajar mudah diakses, inklusif, dan efektif untuk semua — apa pun latar belakang, kemampuan, atau kebutuhan belajarmu. Kami mengubah pelajaran dasar menjadi permainan ramah yang bisa dimainkan dengan tangan, didukung AI di perangkat.',
    who: 'Dibuat untuk anak penasaran di bawah 10 tahun (dan orang dewasa yang membantu).',
    features: ['Menjawab dengan tangan lewat kamera', 'Permainan ingatan untuk melatih otak', 'Tanya Mewy, tutor yang ramah', 'Bahasa Inggris dan Indonesia', 'Kontras tinggi, mode tenang, teks besar, dan huruf mudah dibaca'],
    featuresTitle: 'Apa yang bisa kamu lakukan',
    whoTitle: 'Untuk siapa',
  },
};

export function AboutPage() {
  const { settings, tr } = useSettings();
  const c = CONTENT[settings.lang];
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Mewy size={72} />
        <h1>{tr('aboutTitle')}</h1>
      </div>
      <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>{c.mission}</p>

      <div className="pixel-panel" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem' }}>{c.featuresTitle}</h2>
        <ul style={{ fontFamily: 'var(--font-read)' }}>
          {c.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="pixel-panel">
        <h2 style={{ fontSize: '1rem' }}>{c.whoTitle}</h2>
        <p style={{ fontFamily: 'var(--font-read)' }}>{c.who}</p>
      </div>
    </section>
  );
}
