import type { Lang, Text, TutorReply } from './types';

/**
 * Kid-safe tutor: a small NLP pipeline (normalise -> tokenise -> fuzzy keyword
 * matching -> intent) plus a tiny arithmetic solver. Deterministic and offline
 * on purpose: every answer is pre-written and age-appropriate. A real LLM can
 * replace `matchIntent` later behind the same TutorReply shape.
 */

export const MAX_MESSAGE_LENGTH = 300;

interface Intent {
  id: string;
  keywords: string[];
  reply: Text;
}

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'halo', 'hai', 'pagi', 'siang', 'sore', 'malam'],
    reply: {
      en: 'Hi friend! I am Mewy, your learning buddy. Ask me about numbers, colors, shapes, animals, letters or space!',
      id: 'Halo teman! Aku Mewy, teman belajarmu. Tanya aku soal angka, warna, bentuk, hewan, huruf, atau luar angkasa!',
    },
  },
  {
    id: 'help',
    keywords: ['help', 'what', 'can', 'do', 'bantu', 'bisa', 'apa'],
    reply: {
      en: 'I can do maths like "3 + 4", and tell you fun facts about colors, shapes, animals, letters, plants and space. Try asking: "How many legs does a spider have?"',
      id: 'Aku bisa berhitung seperti "3 + 4", dan cerita fakta seru tentang warna, bentuk, hewan, huruf, tanaman, dan luar angkasa. Coba tanya: "Laba-laba kakinya berapa?"',
    },
  },
  {
    id: 'colors',
    keywords: ['color', 'colour', 'colors', 'rainbow', 'warna', 'pelangi', 'mix', 'campur'],
    reply: {
      en: 'The 3 primary colors are red, yellow and blue. Mix red + yellow = orange, blue + yellow = green, red + blue = purple. A rainbow has 7 colors!',
      id: 'Tiga warna dasar adalah merah, kuning, dan biru. Merah + kuning = oranye, biru + kuning = hijau, merah + biru = ungu. Pelangi punya 7 warna!',
    },
  },
  {
    id: 'shapes',
    keywords: ['shape', 'shapes', 'triangle', 'square', 'circle', 'corner', 'bentuk', 'segitiga', 'persegi', 'lingkaran', 'sudut'],
    reply: {
      en: 'A triangle has 3 sides and 3 corners. A square has 4 equal sides. A circle is round and has no corners at all!',
      id: 'Segitiga punya 3 sisi dan 3 sudut. Persegi punya 4 sisi yang sama panjang. Lingkaran bulat dan tidak punya sudut!',
    },
  },
  {
    id: 'spider',
    keywords: ['spider', 'legs', 'insect', 'laba', 'kaki', 'serangga'],
    reply: {
      en: 'Spiders have 8 legs. Insects like ants and butterflies have 6 legs. So a spider is not an insect!',
      id: 'Laba-laba punya 8 kaki. Serangga seperti semut dan kupu-kupu punya 6 kaki. Jadi laba-laba bukan serangga!',
    },
  },
  {
    id: 'animals',
    keywords: ['animal', 'animals', 'cat', 'dog', 'cow', 'elephant', 'fish', 'bird', 'hewan', 'binatang', 'kucing', 'anjing', 'sapi', 'gajah', 'ikan', 'burung'],
    reply: {
      en: 'Fun fact: elephants are the biggest land animals, fish breathe with gills, and birds have hollow bones to help them fly!',
      id: 'Fakta seru: gajah adalah hewan darat terbesar, ikan bernapas dengan insang, dan tulang burung berongga supaya bisa terbang!',
    },
  },
  {
    id: 'dinosaurs',
    keywords: ['dinosaur', 'dinosaurs', 'dino', 'trex', 'rex', 'dinosaurus'],
    reply: {
      en: 'Dinosaurs lived millions of years ago. T-Rex had teeth as big as bananas! Birds today are relatives of dinosaurs.',
      id: 'Dinosaurus hidup jutaan tahun lalu. Gigi T-Rex sebesar pisang! Burung zaman sekarang adalah kerabat dinosaurus.',
    },
  },
  {
    id: 'letters',
    keywords: ['letter', 'letters', 'alphabet', 'vowel', 'vowels', 'abc', 'huruf', 'alfabet', 'vokal'],
    reply: {
      en: 'There are 26 letters in the alphabet. The vowels are A, E, I, O, U. Every word needs at least one vowel sound!',
      id: 'Ada 26 huruf dalam alfabet. Huruf vokal adalah A, I, U, E, O. Hampir setiap kata punya huruf vokal!',
    },
  },
  {
    id: 'counting',
    keywords: ['count', 'counting', 'number', 'numbers', 'hitung', 'berhitung', 'angka'],
    reply: {
      en: 'Counting tip: touch each thing once and say a number: 1, 2, 3... The last number you say is how many there are!',
      id: 'Tips berhitung: sentuh setiap benda satu kali sambil sebut angka: 1, 2, 3... Angka terakhir adalah jumlahnya!',
    },
  },
  {
    id: 'space',
    keywords: ['space', 'planet', 'planets', 'sun', 'moon', 'star', 'stars', 'earth', 'angkasa', 'matahari', 'bulan', 'bintang', 'bumi'],
    reply: {
      en: 'The Sun is a star! There are 8 planets. We live on Earth, the third planet from the Sun. The Moon goes around the Earth.',
      id: 'Matahari adalah bintang! Ada 8 planet. Kita tinggal di Bumi, planet ketiga dari Matahari. Bulan mengelilingi Bumi.',
    },
  },
  {
    id: 'plants',
    keywords: ['plant', 'plants', 'tree', 'flower', 'grow', 'tanaman', 'pohon', 'bunga', 'tumbuh'],
    reply: {
      en: 'Plants need sunlight, water and air to grow. They make their own food from sunlight. That is called photosynthesis!',
      id: 'Tanaman butuh sinar matahari, air, dan udara untuk tumbuh. Mereka membuat makanan sendiri dari sinar matahari. Namanya fotosintesis!',
    },
  },
  {
    id: 'camera',
    keywords: ['camera', 'finger', 'fingers', 'hand', 'answer', 'kamera', 'jari', 'tangan', 'jawab'],
    reply: {
      en: 'To answer with your hand: raise your index finger for A, middle finger for B, ring finger for C, little finger for D. Keep it still until the bar fills up! (Grown-ups can switch to "count fingers" in Settings.) The camera only works on this device.',
      id: 'Untuk menjawab dengan tangan: angkat jari telunjuk untuk A, jari tengah untuk B, jari manis untuk C, kelingking untuk D. Tahan sampai bar penuh! (Orang tua bisa ganti ke "hitung jari" di Pengaturan.) Kamera hanya bekerja di perangkat ini.',
    },
  },
  {
    id: 'ai',
    keywords: ['ai', 'robot', 'computer', 'smart', 'artificial', 'komputer', 'pintar', 'buatan'],
    reply: {
      en: 'AI means a computer that learned patterns from lots of examples. My camera AI learned what hands look like from thousands of pictures, so it can find your fingers!',
      id: 'AI artinya komputer yang belajar pola dari banyak contoh. AI kameraku belajar bentuk tangan dari ribuan gambar, jadi bisa menemukan jarimu!',
    },
  },
  {
    id: 'sad',
    keywords: ['sad', 'hard', 'difficult', 'cant', 'stupid', 'sedih', 'susah', 'sulit', 'bodoh', 'gabisa'],
    reply: {
      en: 'It is okay to find things hard! Every mistake helps your brain grow. Take a deep breath, and let us try an easier one together. You can do it!',
      id: 'Tidak apa-apa kalau terasa sulit! Setiap salah membuat otakmu tumbuh. Tarik napas, ayo coba yang lebih mudah bersama. Kamu pasti bisa!',
    },
  },
  {
    id: 'thanks',
    keywords: ['thanks', 'thank', 'makasih', 'terima', 'kasih'],
    reply: { en: 'You are welcome! Keep learning, superstar!', id: 'Sama-sama! Terus belajar ya, bintang!' },
  },
  {
    id: 'bye',
    keywords: ['bye', 'goodbye', 'dadah', 'sampai', 'jumpa'],
    reply: { en: 'Bye bye! Come back soon to play again!', id: 'Dadah! Kembali lagi ya untuk main lagi!' },
  },
];

const PRIVACY: Text = {
  en: 'Please do not share your name, address, school, phone number or passwords online. Ask a grown-up you trust instead. Let us keep learning!',
  id: 'Jangan bagikan nama lengkap, alamat, sekolah, nomor HP, atau kata sandi di internet ya. Tanya orang dewasa yang kamu percaya. Ayo lanjut belajar!',
};

const FALLBACK: Text = {
  en: 'Hmm, I am not sure about that one yet. Try asking about numbers, colors, shapes, animals, letters, plants or space!',
  id: 'Hmm, aku belum tahu soal itu. Coba tanya tentang angka, warna, bentuk, hewan, huruf, tanaman, atau luar angkasa!',
};

const PRIVACY_RE =
  /\b(address|phone|password|where i live|my school|alamat|nomor (hp|telepon|telpon)|kata sandi|sandi|rumahku|sekolahku)\b/i;

const NUMBER_WORDS: Record<string, string> = { plus: '+', tambah: '+', minus: '-', kurang: '-', times: '*', kali: '*', x: '*', '×': '*', bagi: '/', ':': '/', '÷': '/' };
const MATH_RE = /(-?\d{1,6})\s*(\+|-|\*|\/|x|×|÷|:|plus|minus|times|tambah|kurang|kali|bagi)\s*(-?\d{1,6})/i;

export function tokenize(text: string): string[] {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').match(/\p{L}+/gu) ?? [];
}

/** Classic edit distance, used so "elefant" still matches "elephant". */
export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

const wordMatches = (word: string, kw: string) => {
  if (word === kw) return true;
  if (kw.length < 5 || word.length < 4) return false;
  return levenshtein(word, kw) <= (kw.length >= 7 ? 2 : 1);
};

// "what", "can", "do", "apa", "bisa" are weak words: they only win when nothing specific matched.
const WEAK = new Set(['what', 'can', 'do', 'apa', 'bisa']);

export function matchIntent(text: string): { intent: Intent | null; confidence: number } {
  const words = tokenize(text);
  if (!words.length) return { intent: null, confidence: 0 };
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const w of words) {
      const kw = intent.keywords.find((k) => wordMatches(w, k));
      if (kw) score += WEAK.has(kw) ? 0.3 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  if (bestScore < 0.5) return { intent: null, confidence: 0 };
  return { intent: best, confidence: Math.min(1, 0.5 + bestScore / 4) };
}

function solveMath(text: string, lang: Lang): string | null {
  const m = text.match(MATH_RE);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[3]);
  const op = NUMBER_WORDS[m[2].toLowerCase()] ?? m[2];
  if (op === '/' && b === 0) {
    return lang === 'en'
      ? 'We cannot share things into 0 groups, so dividing by 0 does not work!'
      : 'Kita tidak bisa membagi ke 0 kelompok, jadi tidak bisa dibagi 0!';
  }
  const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
  const shown = Number.isInteger(result) ? String(result) : result.toFixed(1);
  const sym = op === '*' ? '×' : op === '/' ? '÷' : op;
  let tip = '';
  if (op === '+' && a >= 0 && b >= 0 && result <= 10) {
    tip = lang === 'en' ? ` Picture it: ${'🍎'.repeat(a)} + ${'🍎'.repeat(b)}` : ` Bayangkan: ${'🍎'.repeat(a)} + ${'🍎'.repeat(b)}`;
  }
  return lang === 'en' ? `${a} ${sym} ${b} = ${shown}!${tip}` : `${a} ${sym} ${b} = ${shown}!${tip}`;
}

export function tutorReply(message: string, lang: Lang): TutorReply {
  const text = message.slice(0, MAX_MESSAGE_LENGTH);
  if (PRIVACY_RE.test(text)) return { reply: PRIVACY[lang], intent: 'privacy', confidence: 1 };
  const math = solveMath(text, lang);
  if (math) return { reply: math, intent: 'math', confidence: 1 };
  const { intent, confidence } = matchIntent(text);
  if (!intent) return { reply: FALLBACK[lang], intent: 'unknown', confidence: 0 };
  return { reply: intent.reply[lang], intent: intent.id, confidence };
}
