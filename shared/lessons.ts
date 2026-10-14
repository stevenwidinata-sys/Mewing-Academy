import type { ColorId, SpriteGroup, Text, TopicId } from './types';

/**
 * Real teaching content shown on the Lessons page BEFORE a kid plays the quiz.
 * Each topic has a short road of modules; each module has steps, and a step may
 * carry a little picture (SpriteGroup[]) or an example line. This is deliberately
 * separate from the question bank so the Lessons page teaches, and the quiz tests.
 */

export interface LessonStep {
  text: Text;
  visual?: SpriteGroup[];
  example?: Text;
}

export interface LessonModule {
  id: string;
  title: Text;
  goal: Text;
  steps: LessonStep[];
}

export type LessonTopic = Exclude<TopicId, 'memory'>;

const g = (sprite: SpriteGroup['sprite'], color: ColorId, count: number): SpriteGroup => ({ sprite, color, count });

export const LESSONS: Record<LessonTopic, LessonModule[]> = {
  counting: [
    {
      id: 'count-1',
      title: { en: '1. Count to 5', id: '1. Berhitung sampai 5' },
      goal: { en: 'Touch and say each number.', id: 'Sentuh dan sebut tiap angka.' },
      steps: [
        {
          text: { en: 'Point at each apple and say: one, two, three.', id: 'Tunjuk tiap apel dan sebut: satu, dua, tiga.' },
          visual: [g('apple', 'red', 3)],
        },
        {
          text: { en: 'The LAST number you say is how many there are.', id: 'Angka TERAKHIR yang kamu sebut adalah jumlahnya.' },
          visual: [g('apple', 'red', 5)],
          example: { en: 'Here there are 5 apples.', id: 'Di sini ada 5 apel.' },
        },
      ],
    },
    {
      id: 'count-2',
      title: { en: '2. More or Fewer', id: '2. Lebih Banyak atau Sedikit' },
      goal: { en: 'Compare two groups.', id: 'Membandingkan dua kelompok.' },
      steps: [
        {
          text: { en: 'More means a bigger number. Which has more?', id: 'Lebih banyak berarti angka lebih besar. Mana yang lebih banyak?' },
          visual: [g('star', 'blue', 2), g('star', 'orange', 4)],
          example: { en: '4 is more than 2.', id: '4 lebih banyak dari 2.' },
        },
      ],
    },
    {
      id: 'count-3',
      title: { en: '3. What Comes Next', id: '3. Angka Berikutnya' },
      goal: { en: 'Know the number order.', id: 'Tahu urutan angka.' },
      steps: [
        {
          text: { en: 'Numbers go in order: 1, 2, 3, 4, 5... After 3 comes 4.', id: 'Angka berurutan: 1, 2, 3, 4, 5... Setelah 3 adalah 4.' },
          example: { en: 'After 6 comes 7.', id: 'Setelah 6 adalah 7.' },
        },
      ],
    },
  ],
  math: [
    {
      id: 'math-1',
      title: { en: '1. Adding (+)', id: '1. Menambah (+)' },
      goal: { en: 'Put groups together.', id: 'Menggabungkan kelompok.' },
      steps: [
        {
          text: { en: 'Adding means putting things together. 2 and 1 more...', id: 'Menambah berarti menggabungkan. 2 dan 1 lagi...' },
          visual: [g('ball', 'blue', 2), g('ball', 'green', 1)],
          example: { en: '2 + 1 = 3', id: '2 + 1 = 3' },
        },
      ],
    },
    {
      id: 'math-2',
      title: { en: '2. Taking Away (−)', id: '2. Mengurang (−)' },
      goal: { en: 'Take some away.', id: 'Mengambil sebagian.' },
      steps: [
        {
          text: { en: 'Start with 5 balls, take away 2. Count what is left.', id: 'Mulai dengan 5 bola, ambil 2. Hitung sisanya.' },
          visual: [g('ball', 'blue', 3)],
          example: { en: '5 − 2 = 3', id: '5 − 2 = 3' },
        },
      ],
    },
    {
      id: 'math-3',
      title: { en: '3. Story Problems', id: '3. Soal Cerita' },
      goal: { en: 'Find the maths in a story.', id: 'Menemukan hitungan dalam cerita.' },
      steps: [
        {
          text: { en: '"You have 3 apples and get 2 more." That is 3 + 2.', id: '"Kamu punya 3 apel dan dapat 2 lagi." Itu 3 + 2.' },
          example: { en: '3 + 2 = 5 apples.', id: '3 + 2 = 5 apel.' },
        },
      ],
    },
  ],
  colors: [
    {
      id: 'color-1',
      title: { en: '1. Name the Colors', id: '1. Mengenal Warna' },
      goal: { en: 'Learn 6 colors.', id: 'Mengenal 6 warna.' },
      steps: [
        {
          text: { en: 'These are red, blue, green, yellow, purple and orange.', id: 'Ini merah, biru, hijau, kuning, ungu, dan oranye.' },
          visual: [g('ball', 'red', 1), g('ball', 'blue', 1), g('ball', 'green', 1), g('ball', 'yellow', 1)],
        },
      ],
    },
    {
      id: 'color-2',
      title: { en: '2. Colors Around Us', id: '2. Warna di Sekitar Kita' },
      goal: { en: 'Match colors to things.', id: 'Mencocokkan warna dengan benda.' },
      steps: [
        {
          text: { en: 'Grass is green, the sun is yellow, the sky is blue.', id: 'Rumput hijau, matahari kuning, langit biru.' },
        },
      ],
    },
    {
      id: 'color-3',
      title: { en: '3. Mixing Colors', id: '3. Mencampur Warna' },
      goal: { en: 'Make new colors.', id: 'Membuat warna baru.' },
      steps: [
        {
          text: { en: 'Red + yellow = orange. Blue + yellow = green. Red + blue = purple.', id: 'Merah + kuning = oranye. Biru + kuning = hijau. Merah + biru = ungu.' },
          visual: [g('ball', 'red', 1), g('ball', 'yellow', 1), g('ball', 'orange', 1)],
        },
      ],
    },
  ],
  shapes: [
    {
      id: 'shape-1',
      title: { en: '1. Basic Shapes', id: '1. Bentuk Dasar' },
      goal: { en: 'Know circle, square, triangle.', id: 'Mengenal lingkaran, persegi, segitiga.' },
      steps: [
        {
          text: { en: 'A circle is round, a square has 4 sides, a triangle has 3.', id: 'Lingkaran bulat, persegi punya 4 sisi, segitiga punya 3.' },
          visual: [g('ball', 'blue', 1), g('square', 'red', 1), g('triangle', 'green', 1)],
        },
      ],
    },
    {
      id: 'shape-2',
      title: { en: '2. Counting Corners', id: '2. Menghitung Sudut' },
      goal: { en: 'Corners are the pointy bits.', id: 'Sudut adalah bagian lancip.' },
      steps: [
        {
          text: { en: 'A triangle has 3 corners. A square has 4. A circle has 0!', id: 'Segitiga 3 sudut. Persegi 4 sudut. Lingkaran 0!' },
          visual: [g('triangle', 'yellow', 1), g('square', 'purple', 1)],
        },
      ],
    },
    {
      id: 'shape-3',
      title: { en: '3. Shapes Around Us', id: '3. Bentuk di Sekitar Kita' },
      goal: { en: 'Find shapes in real life.', id: 'Menemukan bentuk di kehidupan.' },
      steps: [
        {
          text: { en: 'A wheel is a circle. A window can be a square. A roof is a triangle.', id: 'Roda itu lingkaran. Jendela bisa persegi. Atap itu segitiga.' },
        },
      ],
    },
  ],
  animals: [
    {
      id: 'animal-1',
      title: { en: '1. Animal Sounds', id: '1. Suara Hewan' },
      goal: { en: 'Match sounds to animals.', id: 'Mencocokkan suara dengan hewan.' },
      steps: [
        {
          text: { en: 'A cow says Moo 🐄. A cat says Meow 🐱. A dog says Woof 🐶.', id: 'Sapi "Moo" 🐄. Kucing "Meong" 🐱. Anjing "Guk" 🐶.' },
        },
      ],
    },
    {
      id: 'animal-2',
      title: { en: '2. Where Animals Live', id: '2. Tempat Tinggal Hewan' },
      goal: { en: 'Water, land, or sky?', id: 'Air, darat, atau langit?' },
      steps: [
        {
          text: { en: 'Fish live in water 🌊. Birds can fly in the sky 🐦. Cows live on land 🌳.', id: 'Ikan di air 🌊. Burung terbang di langit 🐦. Sapi di darat 🌳.' },
        },
      ],
    },
    {
      id: 'animal-3',
      title: { en: '3. Fun Facts', id: '3. Fakta Seru' },
      goal: { en: 'Amazing animal facts.', id: 'Fakta hewan yang menakjubkan.' },
      steps: [
        {
          text: { en: 'Spiders have 8 legs. Elephants are the biggest land animal.', id: 'Laba-laba 8 kaki. Gajah hewan darat terbesar.' },
        },
      ],
    },
  ],
  letters: [
    {
      id: 'letter-1',
      title: { en: '1. The Alphabet', id: '1. Alfabet' },
      goal: { en: '26 letters, A to Z.', id: '26 huruf, A sampai Z.' },
      steps: [
        {
          text: { en: 'The alphabet starts A, B, C, D... and ends ...X, Y, Z.', id: 'Alfabet mulai A, B, C, D... dan berakhir ...X, Y, Z.' },
        },
      ],
    },
    {
      id: 'letter-2',
      title: { en: '2. First Letters', id: '2. Huruf Awal' },
      goal: { en: 'Hear the first sound.', id: 'Mendengar bunyi pertama.' },
      steps: [
        {
          text: { en: '"Apple" starts with A. "Ball" starts with B. "Cat" starts with C.', id: '"Apple" diawali A. "Ball" diawali B. "Cat" diawali C.' },
        },
      ],
    },
    {
      id: 'letter-3',
      title: { en: '3. Vowels', id: '3. Huruf Vokal' },
      goal: { en: 'The 5 special letters.', id: '5 huruf istimewa.' },
      steps: [
        {
          text: { en: 'The vowels are A, E, I, O, U. Almost every word has one!', id: 'Huruf vokal: A, I, U, E, O. Hampir setiap kata punya satu!' },
        },
      ],
    },
  ],
};

export function getLessons(topic: LessonTopic): LessonModule[] {
  return LESSONS[topic];
}
