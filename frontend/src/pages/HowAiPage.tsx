import { useSettings } from '../state/settings';

const CONTENT = {
  en: {
    intro: 'Mewing Academy uses three kinds of AI, and all of them run right here on your device.',
    steps: [
      { icon: '✋', title: 'Hand tracking', body: 'A computer-vision model (Google MediaPipe HandLandmarker) finds 21 points on your hand. We measure which fingers are up and turn that into answer A, B, C or D.' },
      { icon: '😺', title: 'Face & posture', body: 'A face-mesh model finds points on your face so we can gently remind you to sit up, center yourself, and lift your chin.' },
      { icon: '💬', title: 'Tutor Mewy', body: 'A language helper reads your question, cleans it up, matches it to what it knows, and even solves simple maths. It shows how sure it is.' },
    ],
    privacyTitle: 'Your privacy',
    privacy: 'The camera and all the AI run inside your browser. No video or photo is ever uploaded or saved. Turn the camera off any time, and you can still play by tapping or using number keys.',
    tryTitle: 'Try the hand controls',
    try: 'In a quiz, raise one finger for each answer: index = A, middle = B, ring = C, little finger = D. Hold still until the bar fills up. Grown-ups can switch to "count fingers" in Settings.',
  },
  id: {
    intro: 'Mewing Academy memakai tiga jenis AI, dan semuanya berjalan di perangkatmu sendiri.',
    steps: [
      { icon: '✋', title: 'Pelacakan tangan', body: 'Model computer vision (Google MediaPipe HandLandmarker) menemukan 21 titik di tanganmu. Kami melihat jari mana yang terangkat dan mengubahnya jadi jawaban A, B, C, atau D.' },
      { icon: '😺', title: 'Wajah & postur', body: 'Model face-mesh menemukan titik di wajahmu supaya kami bisa mengingatkanmu untuk duduk tegak, berada di tengah, dan mengangkat dagu.' },
      { icon: '💬', title: 'Tutor Mewy', body: 'Pembantu bahasa membaca pertanyaanmu, merapikannya, mencocokkan dengan yang diketahui, bahkan menyelesaikan hitungan sederhana. Ia menunjukkan seberapa yakin.' },
    ],
    privacyTitle: 'Privasimu',
    privacy: 'Kamera dan semua AI berjalan di dalam browsermu. Tidak ada video atau foto yang diunggah atau disimpan. Matikan kamera kapan saja, dan kamu tetap bisa bermain dengan mengetuk atau memakai tombol angka.',
    tryTitle: 'Coba kontrol tangan',
    try: 'Dalam kuis, angkat satu jari untuk tiap jawaban: telunjuk = A, tengah = B, manis = C, kelingking = D. Tahan sampai bar penuh. Orang tua bisa ganti ke "hitung jari" di Pengaturan.',
  },
};

export function HowAiPage() {
  const { settings, tr } = useSettings();
  const c = CONTENT[settings.lang];
  return (
    <section>
      <h1>🤖 {tr('howAiTitle')}</h1>
      <p style={{ fontFamily: 'var(--font-read)', fontSize: '1.1rem' }}>{c.intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {c.steps.map((s) => (
          <div key={s.title} className="pixel-panel">
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <h3 style={{ fontSize: '0.85rem' }}>{s.title}</h3>
            <p style={{ fontFamily: 'var(--font-read)' }}>{s.body}</p>
          </div>
        ))}
      </div>
      <div className="pixel-panel" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem' }}>🔒 {c.privacyTitle}</h2>
        <p style={{ fontFamily: 'var(--font-read)' }}>{c.privacy}</p>
      </div>
      <div className="pixel-panel">
        <h2 style={{ fontSize: '1rem' }}>{c.tryTitle}</h2>
        <p style={{ fontFamily: 'var(--font-read)' }}>{c.try}</p>
      </div>
    </section>
  );
}
