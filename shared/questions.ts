import {
  COLORS,
  SPRITE_NAMES,
  type Choice,
  type ColorId,
  type Difficulty,
  type Question,
  type SpriteId,
  type Text,
} from './types';

export type Rng = () => number;

export const randInt = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const uid = (rng: Rng) => Math.floor(rng() * 1e9).toString(36);
const same = (s: string): Text => ({ en: s, id: s });
const COLOR_IDS = Object.keys(COLORS) as ColorId[];
const COUNTABLE: SpriteId[] = ['apple', 'star', 'heart', 'fish', 'ball'];

/** Builds a shuffled question from a correct choice and distractors. */
function build(
  rng: Rng,
  base: Omit<Question, 'id' | 'choices' | 'answer'>,
  correct: Choice,
  wrong: Choice[],
): Question {
  const choices = shuffle(rng, [correct, ...wrong]);
  return { ...base, id: `${base.topic}-${uid(rng)}`, choices, answer: choices.indexOf(correct) };
}

/** Numbers near n (all >= min), unique, excluding n. */
function nearNumbers(rng: Rng, n: number, k: number, min = 0): number[] {
  const out = new Set<number>();
  let spread = 2;
  while (out.size < k) {
    const c = n + randInt(rng, -spread, spread);
    if (c !== n && c >= min) out.add(c);
    spread++;
  }
  return [...out];
}

const numChoice = (n: number): Choice => ({ label: same(String(n)) });
const colorChoice = (c: ColorId): Choice => ({ label: COLORS[c].name, color: c });

function counting(rng: Rng, d: Difficulty): Question {
  const [lo, hi] = d === 1 ? [1, 5] : d === 2 ? [3, 8] : [6, 12];
  const n = randInt(rng, lo, hi);
  const sprite = pick(rng, COUNTABLE);
  const color = pick(rng, COLOR_IDS);
  const name = SPRITE_NAMES[sprite].many;
  return build(
    rng,
    {
      topic: 'counting',
      difficulty: d,
      prompt: { en: `How many ${name.en} are there?`, id: `Ada berapa ${name.id}?` },
      visual: [{ sprite, color, count: n }],
      explain: { en: `Count them one by one: there are ${n}!`, id: `Hitung satu per satu: ada ${n}!` },
    },
    numChoice(n),
    nearNumbers(rng, n, 3, 1).map(numChoice),
  );
}

function math(rng: Rng, d: Difficulty): Question {
  const max = d === 1 ? 5 : d === 2 ? 10 : 20;
  const minus = d > 1 && rng() < 0.5;
  let a = randInt(rng, 1, max - 1);
  let b = randInt(rng, 1, max - a);
  if (minus && b > a) [a, b] = [b, a];
  const result = minus ? a - b : a + b;
  const op = minus ? '-' : '+';
  const sprite = pick(rng, COUNTABLE);
  // Picture help only for small numbers; level 3 is mental maths.
  const visual =
    d < 3
      ? minus
        ? [{ sprite, color: 'blue' as ColorId, count: result }, { sprite, color: 'red' as ColorId, count: b }]
        : [{ sprite, color: 'blue' as ColorId, count: a }, { sprite, color: 'green' as ColorId, count: b }]
      : undefined;
  return build(
    rng,
    {
      topic: 'math',
      difficulty: d,
      prompt: { en: `What is ${a} ${op} ${b}?`, id: `Berapa ${a} ${op} ${b}?` },
      visual,
      explain: {
        en: minus ? `${a} take away ${b} leaves ${result}.` : `${a} and ${b} more makes ${result}.`,
        id: minus ? `${a} diambil ${b} sisa ${result}.` : `${a} ditambah ${b} jadi ${result}.`,
      },
    },
    numChoice(result),
    nearNumbers(rng, result, 3, 0).map(numChoice),
  );
}

const MIXES: { a: ColorId; b: ColorId; result: ColorId }[] = [
  { a: 'red', b: 'yellow', result: 'orange' },
  { a: 'blue', b: 'yellow', result: 'green' },
  { a: 'red', b: 'blue', result: 'purple' },
];

function colors(rng: Rng, d: Difficulty): Question {
  if (d === 3) {
    const m = pick(rng, MIXES);
    const A = COLORS[m.a].name;
    const B = COLORS[m.b].name;
    return build(
      rng,
      {
        topic: 'colors',
        difficulty: d,
        prompt: {
          en: `Mix ${A.en.toLowerCase()} and ${B.en.toLowerCase()}. What color do you get?`,
          id: `Campur ${A.id.toLowerCase()} dan ${B.id.toLowerCase()}. Jadi warna apa?`,
        },
        visual: [{ sprite: 'ball', color: m.a, count: 1 }, { sprite: 'ball', color: m.b, count: 1 }],
        explain: { en: `They make ${COLORS[m.result].name.en.toLowerCase()}!`, id: `Jadinya ${COLORS[m.result].name.id.toLowerCase()}!` },
      },
      colorChoice(m.result),
      shuffle(rng, COLOR_IDS.filter((c) => c !== m.result)).slice(0, 3).map(colorChoice),
    );
  }
  const color = pick(rng, COLOR_IDS);
  const sprite = pick(rng, COUNTABLE);
  const name = SPRITE_NAMES[sprite].one;
  // Level 1 has 3 choices, level 2 has 4.
  const wrongCount = d === 1 ? 2 : 3;
  return build(
    rng,
    {
      topic: 'colors',
      difficulty: d,
      prompt: { en: `What color is this ${name.en}?`, id: `Apa warna ${name.id} ini?` },
      visual: [{ sprite, color, count: 1 }],
      explain: { en: `It is ${COLORS[color].name.en.toLowerCase()}.`, id: `Warnanya ${COLORS[color].name.id.toLowerCase()}.` },
    },
    colorChoice(color),
    shuffle(rng, COLOR_IDS.filter((c) => c !== color)).slice(0, wrongCount).map(colorChoice),
  );
}

const SHAPES: { sprite: SpriteId; corners: number }[] = [
  { sprite: 'square', corners: 4 },
  { sprite: 'triangle', corners: 3 },
  { sprite: 'ball', corners: 0 },
  { sprite: 'star', corners: 10 },
  { sprite: 'heart', corners: 1 },
];
const SHAPE_NAME: Partial<Record<SpriteId, Text>> = {
  square: { en: 'Square', id: 'Persegi' },
  triangle: { en: 'Triangle', id: 'Segitiga' },
  ball: { en: 'Circle', id: 'Lingkaran' },
  star: { en: 'Star', id: 'Bintang' },
  heart: { en: 'Heart', id: 'Hati' },
};

function shapes(rng: Rng, d: Difficulty): Question {
  if (d === 1) {
    const s = pick(rng, SHAPES);
    return build(
      rng,
      {
        topic: 'shapes',
        difficulty: d,
        prompt: { en: 'What shape is this?', id: 'Bentuk apa ini?' },
        visual: [{ sprite: s.sprite, color: pick(rng, COLOR_IDS), count: 1 }],
      },
      { label: SHAPE_NAME[s.sprite]! },
      shuffle(rng, SHAPES.filter((x) => x !== s)).slice(0, 3).map((x) => ({ label: SHAPE_NAME[x.sprite]! })),
    );
  }
  // Level 2: triangle/square corners. Level 3 also asks "which has no corners".
  if (d === 3 && rng() < 0.5) {
    return build(
      rng,
      {
        topic: 'shapes',
        difficulty: d,
        prompt: { en: 'Which shape has NO corners?', id: 'Bentuk mana yang TIDAK punya sudut?' },
        explain: { en: 'A circle is round all the way!', id: 'Lingkaran bulat tanpa sudut!' },
      },
      { label: SHAPE_NAME.ball! },
      [SHAPES[0], SHAPES[1], SHAPES[3]].map((x) => ({ label: SHAPE_NAME[x.sprite]! })),
    );
  }
  const s = pick(rng, SHAPES.slice(0, 2));
  const n = SHAPE_NAME[s.sprite]!;
  return build(
    rng,
    {
      topic: 'shapes',
      difficulty: d,
      prompt: { en: `How many corners does a ${n.en.toLowerCase()} have?`, id: `${n.id} punya berapa sudut?` },
      visual: [{ sprite: s.sprite, color: pick(rng, COLOR_IDS), count: 1 }],
      explain: { en: `A ${n.en.toLowerCase()} has ${s.corners} corners.`, id: `${n.id} punya ${s.corners} sudut.` },
    },
    numChoice(s.corners),
    nearNumbers(rng, s.corners, 3, 0).map(numChoice),
  );
}

type Fact = { d: Difficulty; prompt: Text; correct: Text; wrong: Text[]; explain?: Text };
const ANIMALS: Fact[] = [
  {
    d: 1,
    prompt: { en: 'Which animal says "Moo"?', id: 'Hewan apa yang bersuara "Moo"?' },
    correct: { en: '🐄 Cow', id: '🐄 Sapi' },
    wrong: [{ en: '🐱 Cat', id: '🐱 Kucing' }, { en: '🐶 Dog', id: '🐶 Anjing' }, { en: '🦆 Duck', id: '🦆 Bebek' }],
  },
  {
    d: 1,
    prompt: { en: 'Which animal says "Meow"?', id: 'Hewan apa yang bersuara "Meong"?' },
    correct: { en: '🐱 Cat', id: '🐱 Kucing' },
    wrong: [{ en: '🐄 Cow', id: '🐄 Sapi' }, { en: '🐔 Chicken', id: '🐔 Ayam' }, { en: '🐸 Frog', id: '🐸 Katak' }],
  },
  {
    d: 1,
    prompt: { en: 'Where does a fish live?', id: 'Ikan tinggal di mana?' },
    correct: { en: '🌊 Water', id: '🌊 Air' },
    wrong: [{ en: '🌳 Tree', id: '🌳 Pohon' }, { en: '🏜️ Desert', id: '🏜️ Gurun' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal can fly?', id: 'Hewan mana yang bisa terbang?' },
    correct: { en: '🐦 Bird', id: '🐦 Burung' },
    wrong: [{ en: '🐘 Elephant', id: '🐘 Gajah' }, { en: '🐟 Fish', id: '🐟 Ikan' }, { en: '🐢 Turtle', id: '🐢 Kura-kura' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal is the BIGGEST?', id: 'Hewan mana yang PALING BESAR?' },
    correct: { en: '🐘 Elephant', id: '🐘 Gajah' },
    wrong: [{ en: '🐭 Mouse', id: '🐭 Tikus' }, { en: '🐰 Rabbit', id: '🐰 Kelinci' }, { en: '🐱 Cat', id: '🐱 Kucing' }],
  },
  {
    d: 2,
    prompt: { en: 'What do bees make?', id: 'Lebah membuat apa?' },
    correct: { en: '🍯 Honey', id: '🍯 Madu' },
    wrong: [{ en: '🥛 Milk', id: '🥛 Susu' }, { en: '🥚 Eggs', id: '🥚 Telur' }, { en: '🧀 Cheese', id: '🧀 Keju' }],
  },
  {
    d: 3,
    prompt: { en: 'How many legs does a spider have?', id: 'Laba-laba punya berapa kaki?' },
    correct: same('8'),
    wrong: [same('4'), same('6'), same('10')],
    explain: { en: 'Spiders have 8 legs. Insects have 6!', id: 'Laba-laba punya 8 kaki. Serangga punya 6!' },
  },
  {
    d: 3,
    prompt: { en: 'A baby frog is called a...', id: 'Bayi katak disebut...' },
    correct: { en: 'Tadpole', id: 'Berudu' },
    wrong: [{ en: 'Puppy', id: 'Anak anjing' }, { en: 'Kitten', id: 'Anak kucing' }, { en: 'Chick', id: 'Anak ayam' }],
  },
  {
    d: 3,
    prompt: { en: 'Which animal sleeps all winter?', id: 'Hewan mana yang tidur sepanjang musim dingin?' },
    correct: { en: '🐻 Bear', id: '🐻 Beruang' },
    wrong: [{ en: '🐔 Chicken', id: '🐔 Ayam' }, { en: '🐄 Cow', id: '🐄 Sapi' }, { en: '🐒 Monkey', id: '🐒 Monyet' }],
  },
];

function animals(rng: Rng, d: Difficulty, used: Set<string>): Question {
  const pool = ANIMALS.filter((f) => f.d <= d);
  const fresh = pool.filter((f) => !used.has(f.prompt.en));
  const f = pick(rng, fresh.length ? fresh : pool);
  used.add(f.prompt.en);
  return build(
    rng,
    { topic: 'animals', difficulty: d, prompt: f.prompt, explain: f.explain },
    { label: f.correct },
    f.wrong.map((label) => ({ label })),
  );
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const VOWELS = 'AEIOU';

function letters(rng: Rng, d: Difficulty): Question {
  const letter = (c: string): Choice => ({ label: same(c) });
  if (d === 3) {
    const v = pick(rng, VOWELS.split(''));
    const cons = shuffle(rng, ALPHABET.split('').filter((c) => !VOWELS.includes(c))).slice(0, 3);
    return build(
      rng,
      {
        topic: 'letters',
        difficulty: d,
        prompt: { en: 'Which one is a vowel?', id: 'Mana yang huruf vokal?' },
        explain: { en: 'The vowels are A, E, I, O, U.', id: 'Huruf vokal: A, I, U, E, O.' },
      },
      letter(v),
      cons.map(letter),
    );
  }
  const after = d === 1;
  // Level 1: "after" in A-J. Level 2: "before" in the whole alphabet.
  const i = after ? randInt(rng, 0, 8) : randInt(rng, 1, 25);
  const target = ALPHABET[after ? i + 1 : i - 1];
  const shown = ALPHABET[i];
  const wrong = shuffle(rng, ALPHABET.split('').filter((c) => c !== target && c !== shown))
    .sort((a, b) => Math.abs(ALPHABET.indexOf(a) - i) - Math.abs(ALPHABET.indexOf(b) - i))
    .slice(0, 3);
  return build(
    rng,
    {
      topic: 'letters',
      difficulty: d,
      prompt: after
        ? { en: `Which letter comes AFTER ${shown}?`, id: `Huruf apa SETELAH ${shown}?` }
        : { en: `Which letter comes BEFORE ${shown}?`, id: `Huruf apa SEBELUM ${shown}?` },
      explain: {
        en: `${ALPHABET.slice(Math.max(0, i - 2), i + 3).split('').join(' ')}`,
        id: `${ALPHABET.slice(Math.max(0, i - 2), i + 3).split('').join(' ')}`,
      },
    },
    letter(target),
    wrong.map(letter),
  );
}

export const QUIZ_TOPICS = ['counting', 'math', 'colors', 'shapes', 'animals', 'letters'] as const;
export type QuizTopic = (typeof QUIZ_TOPICS)[number];

export function isQuizTopic(t: unknown): t is QuizTopic {
  return typeof t === 'string' && (QUIZ_TOPICS as readonly string[]).includes(t);
}

export function getQuestions(topic: QuizTopic, difficulty: Difficulty, count: number, rng: Rng = Math.random): Question[] {
  const used = new Set<string>();
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    switch (topic) {
      case 'counting': out.push(counting(rng, difficulty)); break;
      case 'math': out.push(math(rng, difficulty)); break;
      case 'colors': out.push(colors(rng, difficulty)); break;
      case 'shapes': out.push(shapes(rng, difficulty)); break;
      case 'animals': out.push(animals(rng, difficulty, used)); break;
      case 'letters': out.push(letters(rng, difficulty)); break;
    }
  }
  return out;
}
