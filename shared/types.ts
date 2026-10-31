export type Lang = 'en' | 'id';
export type Text = Record<Lang, string>;

export type TopicId =
  | 'counting' | 'math' | 'colors' | 'shapes' | 'animals' | 'letters' | 'patterns'
  | 'time' | 'food' | 'body' | 'weather' | 'transport' | 'opposites' | 'feelings' | 'space' | 'skipcount'
  | 'memory';
export type Difficulty = 1 | 2 | 3;

export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type SpriteId = 'apple' | 'star' | 'heart' | 'fish' | 'ball' | 'square' | 'triangle';

export interface SpriteGroup {
  sprite: SpriteId;
  color: ColorId;
  count: number;
}

export interface Choice {
  label: Text;
  /** Shows a colour swatch next to the label. */
  color?: ColorId;
}

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  prompt: Text;
  choices: Choice[];
  /** Index into choices. */
  answer: number;
  visual?: SpriteGroup[];
  explain?: Text;
  /** Big emoji picture shown with the question (e.g. a clock face). */
  emoji?: string;
}

export interface MemoryRound {
  id: string;
  level: Difficulty;
  scene: SpriteGroup[];
  studyMs: number;
  questions: Question[];
}

export interface TutorReply {
  reply: string;
  intent: string;
  /** 0..1, how sure the matcher is. Shown to kids as "how sure am I". */
  confidence: number;
}

export const COLORS: Record<ColorId, { hex: string; name: Text }> = {
  red: { hex: '#e83b3b', name: { en: 'Red', id: 'Merah' } },
  blue: { hex: '#3b7be8', name: { en: 'Blue', id: 'Biru' } },
  green: { hex: '#3bb54a', name: { en: 'Green', id: 'Hijau' } },
  yellow: { hex: '#ffcc00', name: { en: 'Yellow', id: 'Kuning' } },
  purple: { hex: '#9b4de0', name: { en: 'Purple', id: 'Ungu' } },
  orange: { hex: '#ff8a1f', name: { en: 'Orange', id: 'Oranye' } },
};

/** EN plural / ID name. Indonesian has no plural -s. */
export const SPRITE_NAMES: Record<SpriteId, { one: Text; many: Text }> = {
  apple: { one: { en: 'apple', id: 'apel' }, many: { en: 'apples', id: 'apel' } },
  star: { one: { en: 'star', id: 'bintang' }, many: { en: 'stars', id: 'bintang' } },
  heart: { one: { en: 'heart', id: 'hati' }, many: { en: 'hearts', id: 'hati' } },
  fish: { one: { en: 'fish', id: 'ikan' }, many: { en: 'fish', id: 'ikan' } },
  ball: { one: { en: 'ball', id: 'bola' }, many: { en: 'balls', id: 'bola' } },
  square: { one: { en: 'square', id: 'persegi' }, many: { en: 'squares', id: 'persegi' } },
  triangle: { one: { en: 'triangle', id: 'segitiga' }, many: { en: 'triangles', id: 'segitiga' } },
};

export interface TopicMeta {
  id: Exclude<TopicId, 'memory'>;
  title: Text;
  emoji: string;
  blurb: Text;
}

const tx = (en: string, id: string): Text => ({ en, id });

export const TOPICS: TopicMeta[] = [
  { id: 'counting', emoji: '🔢', title: tx('Counting', 'Berhitung'), blurb: tx('Count, compare, and put numbers in order.', 'Berhitung, membandingkan, dan mengurutkan angka.') },
  { id: 'math', emoji: '➕', title: tx('Plus & Minus', 'Tambah & Kurang'), blurb: tx('Add, take away, and solve story problems.', 'Menambah, mengurang, dan soal cerita.') },
  { id: 'skipcount', emoji: '🦘', title: tx('Skip Counting', 'Hitung Loncat'), blurb: tx('Count by 2s, 5s and 10s.', 'Berhitung loncat 2, 5, dan 10.') },
  { id: 'time', emoji: '⏰', title: tx('Time & Clocks', 'Waktu & Jam'), blurb: tx("Read o'clock, half past, and days of the week.", 'Membaca jam, setengah, dan nama hari.') },
  { id: 'patterns', emoji: '🧩', title: tx('Patterns', 'Pola'), blurb: tx('Spot what repeats: colors, shapes and numbers.', 'Temukan yang berulang: warna, bentuk, dan angka.') },
  { id: 'colors', emoji: '🎨', title: tx('Colors', 'Warna'), blurb: tx('Name colors, spot them, and mix them.', 'Mengenal, menemukan, dan mencampur warna.') },
  { id: 'shapes', emoji: '🔺', title: tx('Shapes', 'Bentuk'), blurb: tx('Circles, squares, triangles and corners.', 'Lingkaran, persegi, segitiga, dan sudut.') },
  { id: 'letters', emoji: '🔤', title: tx('Letters', 'Huruf'), blurb: tx('The alphabet, first letters, and vowels.', 'Alfabet, huruf awal, dan huruf vokal.') },
  { id: 'opposites', emoji: '↔️', title: tx('Opposites', 'Lawan Kata'), blurb: tx('Big and small, hot and cold, and more.', 'Besar dan kecil, panas dan dingin, dan lainnya.') },
  { id: 'animals', emoji: '🐾', title: tx('Animals', 'Hewan'), blurb: tx('Sounds, homes, and fun facts.', 'Suara, tempat tinggal, dan fakta seru.') },
  { id: 'food', emoji: '🍎', title: tx('Fruits & Veggies', 'Buah & Sayur'), blurb: tx('Name them, sort them, and know their colors.', 'Kenali, kelompokkan, dan tahu warnanya.') },
  { id: 'body', emoji: '🖐️', title: tx('My Body', 'Tubuhku'), blurb: tx('Body parts and the five senses.', 'Bagian tubuh dan lima indra.') },
  { id: 'feelings', emoji: '😊', title: tx('Feelings', 'Perasaan'), blurb: tx('Name feelings and learn to be kind.', 'Kenali perasaan dan belajar baik hati.') },
  { id: 'weather', emoji: '🌦️', title: tx('Weather', 'Cuaca'), blurb: tx('Sun, rain, storms, and seasons.', 'Cerah, hujan, badai, dan musim.') },
  { id: 'transport', emoji: '🚗', title: tx('Vehicles', 'Kendaraan'), blurb: tx('Land, water, sky, and helper vehicles.', 'Darat, air, udara, dan kendaraan penolong.') },
  { id: 'space', emoji: '🪐', title: tx('Space', 'Luar Angkasa'), blurb: tx('The Sun, the Moon, and our 8 planets.', 'Matahari, Bulan, dan 8 planet kita.') },
];
