import type { Lang } from '../../../shared/types';

/** UI strings. Keep keys flat and short; questions come from the shared bank. */
export const STRINGS = {
  appName: { en: 'Mewing Academy', id: 'Mewing Academy' },
  tagline: {
    en: 'Learn with your hands. Play with AI.',
    id: 'Belajar pakai tangan. Bermain dengan AI.',
  },
  // Navigation
  navHome: { en: 'Home', id: 'Beranda' },
  navLessons: { en: 'Lessons', id: 'Pelajaran' },
  navQuiz: { en: 'Hand Quiz', id: 'Kuis Tangan' },
  navMemory: { en: 'Memory', id: 'Ingatan' },
  navTutor: { en: 'Ask Mewy', id: 'Tanya Mewy' },
  navProgress: { en: 'My Stars', id: 'Bintangku' },
  navHowAi: { en: 'How AI Works', id: 'Cara Kerja AI' },
  navAbout: { en: 'About', id: 'Tentang' },
  navSettings: { en: 'Settings', id: 'Pengaturan' },
  skipToContent: { en: 'Skip to content', id: 'Lewati ke konten' },

  // Home
  heroPlay: { en: 'Start Playing', id: 'Mulai Bermain' },
  heroHow: { en: 'How does it work?', id: 'Bagaimana caranya?' },
  pickGame: { en: 'Pick a game', id: 'Pilih permainan' },

  // Generic
  start: { en: 'Start', id: 'Mulai' },
  next: { en: 'Next', id: 'Lanjut' },
  back: { en: 'Back', id: 'Kembali' },
  tryAgain: { en: 'Try again', id: 'Coba lagi' },
  playAgain: { en: 'Play again', id: 'Main lagi' },
  loading: { en: 'Loading...', id: 'Memuat...' },
  correct: { en: 'Correct!', id: 'Benar!' },
  notQuite: { en: 'Not quite!', id: 'Belum tepat!' },
  level: { en: 'Level', id: 'Tingkat' },
  easy: { en: 'Easy', id: 'Mudah' },
  medium: { en: 'Medium', id: 'Sedang' },
  hard: { en: 'Hard', id: 'Sulit' },
  score: { en: 'Score', id: 'Skor' },
  chooseTopic: { en: 'Choose a topic', id: 'Pilih topik' },

  // Quiz / camera
  answerWithHand: { en: 'Answer with your hand', id: 'Jawab dengan tanganmu' },
  answerWithTap: { en: 'Or tap an answer', id: 'Atau ketuk jawaban' },
  cameraStart: { en: 'Turn on camera', id: 'Nyalakan kamera' },
  cameraStop: { en: 'Turn off camera', id: 'Matikan kamera' },
  cameraLoading: { en: 'Waking up the camera AI...', id: 'Membangunkan AI kamera...' },
  cameraDenied: {
    en: 'Camera is off. You can still tap your answers below!',
    id: 'Kamera mati. Kamu tetap bisa mengetuk jawaban di bawah!',
  },
  cameraPrivacy: {
    en: 'The camera runs only on this device. No video is sent or saved.',
    id: 'Kamera hanya berjalan di perangkat ini. Video tidak dikirim atau disimpan.',
  },
  showFingers: { en: 'Show your fingers', id: 'Tunjukkan jarimu' },
  holdSteady: { en: 'Hold steady...', id: 'Tahan...' },
  noHand: { en: 'I cannot see your hand yet', id: 'Aku belum melihat tanganmu' },
  posturePerfect: { en: 'Great posture!', id: 'Postur bagus!' },

  // Memory
  memoryWatch: { en: 'Look carefully!', id: 'Perhatikan baik-baik!' },
  memoryRemember: { en: 'Now, remember...', id: 'Sekarang, ingat...' },
  memoryGetReady: { en: 'Get ready!', id: 'Bersiap!' },

  // Tutor
  tutorIntro: {
    en: 'Hi! I am Mewy. Ask me anything about your lessons!',
    id: 'Halo! Aku Mewy. Tanya aku apa saja tentang pelajaranmu!',
  },
  tutorPlaceholder: { en: 'Type your question...', id: 'Tulis pertanyaanmu...' },
  tutorSend: { en: 'Send', id: 'Kirim' },
  tutorThinking: { en: 'Mewy is thinking...', id: 'Mewy sedang berpikir...' },
  tutorConfident: { en: 'How sure I am', id: 'Seberapa yakin aku' },

  // Progress
  progressTitle: { en: 'My Stars', id: 'Bintangku' },
  progressEmpty: { en: 'Play a game to earn your first star!', id: 'Main dulu untuk dapat bintang pertama!' },
  progressTotal: { en: 'Total stars', id: 'Total bintang' },
  progressReset: { en: 'Clear my stars', id: 'Hapus bintangku' },
  progressStreak: { en: 'Day streak', id: 'Hari beruntun' },

  // Settings
  settingsLang: { en: 'Language', id: 'Bahasa' },
  settingsTheme: { en: 'Look', id: 'Tampilan' },
  settingsHighContrast: { en: 'High contrast', id: 'Kontras tinggi' },
  settingsReduceMotion: { en: 'Calm mode (less motion)', id: 'Mode tenang (gerak sedikit)' },
  settingsReadable: { en: 'Easy-to-read font', id: 'Huruf mudah dibaca' },
  settingsTextSize: { en: 'Text size', id: 'Ukuran teks' },
  settingsSound: { en: 'Sounds', id: 'Suara' },
  settingsFingerMode: { en: 'Hand answer style', id: 'Gaya jawab tangan' },
  fingerModePoint: { en: 'Point: index=A, middle=B...', id: 'Tunjuk: telunjuk=A, tengah=B...' },
  fingerModeCount: { en: 'Count: 1 finger=A, 2=B...', id: 'Hitung: 1 jari=A, 2=B...' },
  on: { en: 'On', id: 'Nyala' },
  off: { en: 'Off', id: 'Mati' },

  // How AI
  howAiTitle: { en: 'How does the AI work?', id: 'Bagaimana AI bekerja?' },

  // About
  aboutTitle: { en: 'About Mewing Academy', id: 'Tentang Mewing Academy' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
