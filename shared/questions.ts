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
  const sub = d === 1 ? 'count' : pick(rng, ['count', 'count', 'compare', 'next'] as const);

  if (sub === 'compare') {
    // Two groups: which has more / fewer?
    const sprite = pick(rng, COUNTABLE);
    const name = SPRITE_NAMES[sprite].many;
    let a = randInt(rng, lo, hi);
    let b = randInt(rng, lo, hi);
    while (a === b) b = randInt(rng, lo, hi);
    const more = rng() < 0.5;
    const winner = more ? Math.max(a, b) : Math.min(a, b);
    return build(
      rng,
      {
        topic: 'counting',
        difficulty: d,
        prompt: more
          ? { en: `Which group has MORE ${name.en}?`, id: `Kelompok mana yang lebih BANYAK ${name.id}?` }
          : { en: `Which group has FEWER ${name.en}?`, id: `Kelompok mana yang lebih SEDIKIT ${name.id}?` },
        visual: [{ sprite, color: 'blue', count: a }, { sprite, color: 'orange', count: b }],
        explain: more
          ? { en: `${Math.max(a, b)} is more than ${Math.min(a, b)}.`, id: `${Math.max(a, b)} lebih banyak dari ${Math.min(a, b)}.` }
          : { en: `${Math.min(a, b)} is fewer than ${Math.max(a, b)}.`, id: `${Math.min(a, b)} lebih sedikit dari ${Math.max(a, b)}.` },
      },
      { label: { en: `${winner} (${winner === a ? 'blue' : 'orange'})`, id: `${winner} (${winner === a ? 'biru' : 'oranye'})` }, color: winner === a ? 'blue' : 'orange' },
      [{ label: { en: `${winner === a ? b : a} (${winner === a ? 'orange' : 'blue'})`, id: `${winner === a ? b : a} (${winner === a ? 'oranye' : 'biru'})` }, color: winner === a ? 'orange' : 'blue' }],
    );
  }

  if (sub === 'next') {
    // What number comes next after n?
    const n = randInt(rng, lo, hi - 1);
    return build(
      rng,
      {
        topic: 'counting',
        difficulty: d,
        prompt: { en: `What number comes after ${n}?`, id: `Angka berapa setelah ${n}?` },
        explain: { en: `${n}, then ${n + 1}!`, id: `${n}, lalu ${n + 1}!` },
      },
      numChoice(n + 1),
      nearNumbers(rng, n + 1, 3, 0).map(numChoice),
    );
  }

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

  // Level 2+ sometimes gives a little word problem for variety.
  if (d >= 2 && rng() < 0.4) {
    const story = pick(rng, WORD_PROBLEMS.filter((w) => w.d <= d));
    const a = randInt(rng, 2, d === 2 ? 6 : 10);
    const b = randInt(rng, 1, Math.min(a, d === 2 ? 4 : 9));
    const result = story.op === '+' ? a + b : a - b;
    return build(
      rng,
      {
        topic: 'math',
        difficulty: d,
        prompt: { en: story.en(a, b), id: story.id(a, b) },
        explain: { en: `${a} ${story.op} ${b} = ${result}.`, id: `${a} ${story.op} ${b} = ${result}.` },
      },
      numChoice(result),
      nearNumbers(rng, result, 3, 0).map(numChoice),
    );
  }

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

type WordProblem = { d: Difficulty; op: '+' | '-'; en: (a: number, b: number) => string; id: (a: number, b: number) => string };
const WORD_PROBLEMS: WordProblem[] = [
  { d: 2, op: '+', en: (a, b) => `You have ${a} apples. You get ${b} more. How many now?`, id: (a, b) => `Kamu punya ${a} apel. Dapat ${b} lagi. Jadi berapa?` },
  { d: 2, op: '-', en: (a, b) => `There are ${a} birds. ${b} fly away. How many are left?`, id: (a, b) => `Ada ${a} burung. ${b} terbang pergi. Sisa berapa?` },
  { d: 2, op: '+', en: (a, b) => `${a} cats and ${b} dogs are playing. How many animals?`, id: (a, b) => `${a} kucing dan ${b} anjing bermain. Berapa hewan?` },
  { d: 3, op: '-', en: (a, b) => `You had ${a} candies and ate ${b}. How many are left?`, id: (a, b) => `Kamu punya ${a} permen dan makan ${b}. Sisa berapa?` },
  { d: 3, op: '+', en: (a, b) => `${a} kids are on the bus. ${b} more get on. How many kids?`, id: (a, b) => `${a} anak di bus. ${b} naik lagi. Berapa anak?` },
];

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

  // Level 2 sometimes asks about a real-world object's color instead.
  if (d === 2 && rng() < 0.45) {
    const o = pick(rng, COLOR_OBJECTS);
    return build(
      rng,
      {
        topic: 'colors',
        difficulty: d,
        prompt: { en: `What color is ${o.en}?`, id: `Apa warna ${o.id}?` },
        explain: { en: `${o.en} is usually ${COLORS[o.color].name.en.toLowerCase()}.`, id: `${o.id} biasanya ${COLORS[o.color].name.id.toLowerCase()}.` },
      },
      colorChoice(o.color),
      shuffle(rng, COLOR_IDS.filter((c) => c !== o.color)).slice(0, 3).map(colorChoice),
    );
  }

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

const COLOR_OBJECTS: { en: string; id: string; color: ColorId }[] = [
  { en: 'the sky on a sunny day', id: 'langit saat cerah', color: 'blue' },
  { en: 'grass', id: 'rumput', color: 'green' },
  { en: 'a banana', id: 'pisang', color: 'yellow' },
  { en: 'a strawberry', id: 'stroberi', color: 'red' },
  { en: 'an orange', id: 'jeruk', color: 'orange' },
  { en: 'a ripe eggplant', id: 'terong matang', color: 'purple' },
  { en: 'the sun', id: 'matahari', color: 'yellow' },
  { en: 'a leaf', id: 'daun', color: 'green' },
];

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
  {
    d: 1,
    prompt: { en: 'Which animal says "Woof"?', id: 'Hewan apa yang bersuara "Guk"?' },
    correct: { en: '🐶 Dog', id: '🐶 Anjing' },
    wrong: [{ en: '🐱 Cat', id: '🐱 Kucing' }, { en: '🐤 Chick', id: '🐤 Anak ayam' }, { en: '🐸 Frog', id: '🐸 Katak' }],
  },
  {
    d: 1,
    prompt: { en: 'Which one can swim?', id: 'Mana yang bisa berenang?' },
    correct: { en: '🐟 Fish', id: '🐟 Ikan' },
    wrong: [{ en: '🐦 Bird', id: '🐦 Burung' }, { en: '🐈 Cat', id: '🐈 Kucing' }],
  },
  {
    d: 1,
    prompt: { en: 'Which animal has a long neck?', id: 'Hewan mana yang berleher panjang?' },
    correct: { en: '🦒 Giraffe', id: '🦒 Jerapah' },
    wrong: [{ en: '🐷 Pig', id: '🐷 Babi' }, { en: '🐑 Sheep', id: '🐑 Domba' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal gives us milk?', id: 'Hewan mana yang memberi kita susu?' },
    correct: { en: '🐄 Cow', id: '🐄 Sapi' },
    wrong: [{ en: '🐔 Chicken', id: '🐔 Ayam' }, { en: '🐟 Fish', id: '🐟 Ikan' }, { en: '🐍 Snake', id: '🐍 Ular' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal lays eggs?', id: 'Hewan mana yang bertelur?' },
    correct: { en: '🐔 Chicken', id: '🐔 Ayam' },
    wrong: [{ en: '🐕 Dog', id: '🐕 Anjing' }, { en: '🐈 Cat', id: '🐈 Kucing' }, { en: '🐘 Elephant', id: '🐘 Gajah' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal lives in the ocean?', id: 'Hewan mana yang hidup di laut?' },
    correct: { en: '🐬 Dolphin', id: '🐬 Lumba-lumba' },
    wrong: [{ en: '🐪 Camel', id: '🐪 Unta' }, { en: '🐓 Rooster', id: '🐓 Ayam jago' }, { en: '🐿️ Squirrel', id: '🐿️ Tupai' }],
  },
  {
    d: 2,
    prompt: { en: 'Which animal hops?', id: 'Hewan mana yang melompat?' },
    correct: { en: '🐰 Rabbit', id: '🐰 Kelinci' },
    wrong: [{ en: '🐢 Turtle', id: '🐢 Kura-kura' }, { en: '🐌 Snail', id: '🐌 Siput' }, { en: '🐟 Fish', id: '🐟 Ikan' }],
  },
  {
    d: 3,
    prompt: { en: 'What is the fastest land animal?', id: 'Hewan darat tercepat?' },
    correct: { en: '🐆 Cheetah', id: '🐆 Cheetah' },
    wrong: [{ en: '🐢 Turtle', id: '🐢 Kura-kura' }, { en: '🐌 Snail', id: '🐌 Siput' }, { en: '🐘 Elephant', id: '🐘 Gajah' }],
  },
  {
    d: 3,
    prompt: { en: 'Which animal changes color to hide?', id: 'Hewan mana yang berubah warna untuk bersembunyi?' },
    correct: { en: '🦎 Chameleon', id: '🦎 Bunglon' },
    wrong: [{ en: '🐘 Elephant', id: '🐘 Gajah' }, { en: '🦓 Zebra', id: '🦓 Zebra' }, { en: '🐧 Penguin', id: '🐧 Penguin' }],
  },
  {
    d: 3,
    prompt: { en: 'A baby cat is called a...', id: 'Bayi kucing disebut...' },
    correct: { en: 'Kitten', id: 'Anak kucing' },
    wrong: [{ en: 'Puppy', id: 'Anak anjing' }, { en: 'Calf', id: 'Anak sapi' }, { en: 'Cub', id: 'Anak beruang' }],
  },
  {
    d: 3,
    prompt: { en: 'Which animal can live both in water and on land?', id: 'Hewan mana yang bisa hidup di air dan darat?' },
    correct: { en: '🐸 Frog', id: '🐸 Katak' },
    wrong: [{ en: '🦅 Eagle', id: '🦅 Elang' }, { en: '🐅 Tiger', id: '🐅 Harimau' }, { en: '🐫 Camel', id: '🐫 Unta' }],
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

const FIRST_LETTER_WORDS: { word: string; en: string; id: string }[] = [
  { word: 'Apple', en: 'Apple', id: 'Apel' },
  { word: 'Ball', en: 'Ball', id: 'Ball' },
  { word: 'Cat', en: 'Cat', id: 'Cat' },
  { word: 'Dog', en: 'Dog', id: 'Dog' },
  { word: 'Fish', en: 'Fish', id: 'Fish' },
  { word: 'Sun', en: 'Sun', id: 'Sun' },
  { word: 'Moon', en: 'Moon', id: 'Moon' },
  { word: 'Tree', en: 'Tree', id: 'Tree' },
];

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
  // Level 2 sometimes asks the first letter of a familiar word.
  if (d === 2 && rng() < 0.4) {
    const w = pick(rng, FIRST_LETTER_WORDS);
    const first = w.word[0].toUpperCase();
    const wrong = shuffle(rng, ALPHABET.split('').filter((c) => c !== first)).slice(0, 3);
    return build(
      rng,
      {
        topic: 'letters',
        difficulty: d,
        prompt: { en: `What letter does "${w.en}" start with?`, id: `Huruf apa awal kata "${w.id}"?` },
        explain: { en: `"${w.en}" starts with ${first}.`, id: `"${w.id}" diawali huruf ${first}.` },
      },
      letter(first),
      wrong.map(letter),
    );
  }
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
  const seenPrompts = new Set<string>();
  const out: Question[] = [];
  const gen = (): Question => {
    switch (topic) {
      case 'counting': return counting(rng, difficulty);
      case 'math': return math(rng, difficulty);
      case 'colors': return colors(rng, difficulty);
      case 'shapes': return shapes(rng, difficulty);
      case 'animals': return animals(rng, difficulty, used);
      case 'letters': return letters(rng, difficulty);
    }
  };
  for (let i = 0; i < count; i++) {
    let q = gen();
    // Try a few times to avoid showing the same prompt twice in one round.
    for (let tries = 0; tries < 8 && seenPrompts.has(q.prompt.en); tries++) q = gen();
    seenPrompts.add(q.prompt.en);
    out.push(q);
  }
  return out;
}
