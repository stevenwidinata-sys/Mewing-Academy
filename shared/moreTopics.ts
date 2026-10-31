import type { LessonModule } from './lessons';
import type { Choice, Difficulty, Question, Text } from './types';

/**
 * Nine extra quiz topics plus their lesson roads. Questions come from small
 * data tables + templates, so every level has 15+ different questions.
 */

type Rng = () => number;
interface Q {
  prompt: Text;
  correct: Text;
  wrong: Text[];
  explain?: Text;
  emoji?: string;
}

export const MORE_TOPIC_IDS = ['time', 'food', 'body', 'weather', 'transport', 'opposites', 'feelings', 'space', 'skipcount'] as const;
export type MoreTopic = (typeof MORE_TOPIC_IDS)[number];

const T = (en: string, id: string): Text => ({ en, id });
const S = (s: string): Text => ({ en: s, id: s });
const F = (en: string, id: string, correct: Text, wrong: Text[], explain?: Text): Q => ({ prompt: T(en, id), correct, wrong, explain });
const ri = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const withEmoji = (e: string, n: Text) => T(`${e} ${n.en}`, `${e} ${n.id}`);

function pick<X>(rng: Rng, a: readonly X[]): X {
  return a[Math.floor(rng() * a.length)];
}

function shuffle<X>(rng: Rng, a: readonly X[]): X[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Up to k distractors from pool: never the answer, no duplicates. */
function others(rng: Rng, pool: readonly Text[], answer: Text, k = 3): Text[] {
  const seen = new Set([answer.en]);
  const out: Text[] = [];
  for (const p of shuffle(rng, pool)) {
    if (out.length >= k) break;
    if (!seen.has(p.en)) {
      seen.add(p.en);
      out.push(p);
    }
  }
  return out;
}

function nearNums(rng: Rng, ans: number, step = 1): Text[] {
  const cands = [ans + 1, ans - 1, ans + step, ans - step, ans + 2, ans + step * 2, ans - 2];
  return others(rng, cands.filter((n) => n >= 0).map((n) => S(String(n))), S(String(ans)));
}

function toQuestion(rng: Rng, topic: MoreTopic, d: Difficulty, q: Q): Question {
  const correct: Choice = { label: q.correct };
  const wrong = q.wrong.filter((w) => w.en !== q.correct.en).slice(0, 3).map((label): Choice => ({ label }));
  const choices = shuffle(rng, [correct, ...wrong]);
  return {
    id: `${topic}-${Math.floor(rng() * 1e9).toString(36)}`,
    topic,
    difficulty: d,
    prompt: q.prompt,
    choices,
    answer: choices.indexOf(correct),
    explain: q.explain,
    emoji: q.emoji,
  };
}

// ---------------- Time & clocks ----------------
const HOURS = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'];
const HALVES = ['🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'];
const H12 = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = [T('Monday', 'Senin'), T('Tuesday', 'Selasa'), T('Wednesday', 'Rabu'), T('Thursday', 'Kamis'), T('Friday', 'Jumat'), T('Saturday', 'Sabtu'), T('Sunday', 'Minggu')];
const oclock = (h: number) => T(`${h} o'clock`, `Jam ${h}`);
// Indonesian says "setengah 4" for 3:30.
const halfPast = (h: number) => T(`Half past ${h}`, `Jam setengah ${(h % 12) + 1}`);
const DAYPARTS = [T('Morning', 'Pagi'), T('Afternoon', 'Siang'), T('Night', 'Malam')];
const [MORNING, , NIGHT] = DAYPARTS;
const CLOCK_Q = T('What time does the clock show?', 'Jam berapa yang ditunjukkan?');

const TIME_F1: Q[] = [
  F('When do you eat breakfast?', 'Kapan kamu sarapan?', MORNING, DAYPARTS),
  F('When can you see the moon and stars?', 'Kapan kamu bisa melihat bulan dan bintang?', NIGHT, DAYPARTS),
  F('When does the sun come up?', 'Kapan matahari terbit?', MORNING, DAYPARTS),
  F('When do you go to sleep?', 'Kapan kamu tidur?', NIGHT, DAYPARTS),
];
const TIME_F3: Q[] = [
  F('How many minutes are in one hour?', 'Satu jam ada berapa menit?', S('60'), [S('10'), S('24'), S('100')]),
  F('How many hours are in one day?', 'Satu hari ada berapa jam?', S('24'), [S('12'), S('7'), S('60')]),
  F('How many days are in one week?', 'Satu minggu ada berapa hari?', S('7'), [S('5'), S('10'), S('12')]),
  F('How many months are in one year?', 'Satu tahun ada berapa bulan?', S('12'), [S('10'), S('7'), S('24')]),
];

function time(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    if (rng() < 0.25) return pick(rng, TIME_F1);
    const h = ri(rng, 1, 12);
    return {
      prompt: CLOCK_Q,
      emoji: HOURS[h - 1],
      correct: oclock(h),
      wrong: others(rng, H12.map(oclock), oclock(h)),
      explain: T(`The short hand points at ${h}. It is ${h} o'clock!`, `Jarum pendek menunjuk ${h}. Sekarang jam ${h}!`),
    };
  }
  if (d === 2) {
    if (rng() < 0.55) {
      const h = ri(rng, 1, 12);
      return {
        prompt: CLOCK_Q,
        emoji: HALVES[h - 1],
        // The matching o'clock is a tricky distractor.
        correct: halfPast(h),
        wrong: [oclock(h), ...others(rng, H12.map(halfPast), halfPast(h), 2)],
        explain: T(`The long hand points at 6, so it is half past ${h}.`, `Jarum panjang di angka 6, jadi jam setengah ${(h % 12) + 1}.`),
      };
    }
    const i = ri(rng, 0, 6);
    const next = DAYS[(i + 1) % 7];
    return {
      prompt: T(`Which day comes after ${DAYS[i].en}?`, `Hari apa setelah ${DAYS[i].id}?`),
      correct: next,
      wrong: others(rng, DAYS.filter((_, j) => j !== i), next),
      explain: T(`${DAYS[i].en}, then ${next.en}.`, `${DAYS[i].id}, lalu ${next.id}.`),
    };
  }
  const r = rng();
  if (r < 0.15) return pick(rng, TIME_F3);
  if (r < 0.6) {
    const h = ri(rng, 1, 12);
    const add = ri(rng, 1, 3);
    const ans = ((h + add - 1) % 12) + 1;
    return {
      prompt: T(`It is ${h} o'clock. What time is it ${add} hour${add > 1 ? 's' : ''} later?`, `Sekarang jam ${h}. Jam berapa ${add} jam lagi?`),
      emoji: HOURS[h - 1],
      correct: oclock(ans),
      wrong: others(rng, H12.map(oclock), oclock(ans)),
      explain: T(`Count ${add} forward from ${h}: ${ans} o'clock.`, `Hitung maju ${add} dari ${h}: jam ${ans}.`),
    };
  }
  const i = ri(rng, 0, 6);
  const prev = DAYS[(i + 6) % 7];
  return {
    prompt: T(`Which day comes before ${DAYS[i].en}?`, `Hari apa sebelum ${DAYS[i].id}?`),
    correct: prev,
    wrong: others(rng, DAYS.filter((_, j) => j !== i), prev),
    explain: T(`${prev.en} comes before ${DAYS[i].en}.`, `${prev.id} sebelum ${DAYS[i].id}.`),
  };
}

// ---------------- Fruits & vegetables ----------------
const RED = T('Red', 'Merah');
const YELLOW = T('Yellow', 'Kuning');
const PURPLE = T('Purple', 'Ungu');
const ORANGE = T('Orange', 'Oranye');
const GREEN = T('Green', 'Hijau');
const COLORS5 = [RED, YELLOW, PURPLE, ORANGE, GREEN];
const FRUIT = T('🍎 Fruit', '🍎 Buah');
const VEG = T('🥦 Vegetable', '🥦 Sayur');

interface Food {
  e: string;
  n: Text;
  veg: boolean;
  c?: Text;
}
const FOODS: Food[] = [
  { e: '🍎', n: T('Apple', 'Apel'), veg: false, c: RED },
  { e: '🍌', n: T('Banana', 'Pisang'), veg: false, c: YELLOW },
  { e: '🍇', n: T('Grapes', 'Anggur'), veg: false },
  { e: '🍊', n: T('Orange', 'Jeruk'), veg: false },
  { e: '🍓', n: T('Strawberry', 'Stroberi'), veg: false, c: RED },
  { e: '🍉', n: T('Watermelon', 'Semangka'), veg: false },
  { e: '🍋', n: T('Lemon', 'Lemon'), veg: false, c: YELLOW },
  { e: '🍍', n: T('Pineapple', 'Nanas'), veg: false },
  { e: '🥭', n: T('Mango', 'Mangga'), veg: false },
  { e: '🍒', n: T('Cherry', 'Ceri'), veg: false, c: RED },
  { e: '🥕', n: T('Carrot', 'Wortel'), veg: true, c: ORANGE },
  { e: '🥦', n: T('Broccoli', 'Brokoli'), veg: true, c: GREEN },
  { e: '🍆', n: T('Eggplant', 'Terong'), veg: true, c: PURPLE },
  { e: '🌽', n: T('Corn', 'Jagung'), veg: true, c: YELLOW },
  { e: '🥒', n: T('Cucumber', 'Timun'), veg: true, c: GREEN },
  { e: '🥬', n: T('Lettuce', 'Selada'), veg: true, c: GREEN },
  { e: '🥔', n: T('Potato', 'Kentang'), veg: true },
];
const fd = (en: string) => {
  const f = FOODS.find((x) => x.n.en === en)!;
  return withEmoji(f.e, f.n);
};
const FOOD_F3: Q[] = [
  F('Which fruit tastes very sour?', 'Buah mana yang rasanya sangat asam?', fd('Lemon'), [fd('Banana'), fd('Watermelon'), fd('Mango')]),
  F('Which vegetable do rabbits love?', 'Sayur apa yang disukai kelinci?', fd('Carrot'), [fd('Corn'), fd('Potato'), fd('Eggplant')]),
  F('Which fruit has tiny seeds on the outside?', 'Buah mana yang bijinya ada di luar?', fd('Strawberry'), [fd('Banana'), fd('Mango'), fd('Watermelon')]),
  F('Which one is the BIGGEST?', 'Mana yang PALING BESAR?', fd('Watermelon'), [fd('Grapes'), fd('Cherry'), fd('Strawberry')]),
  F('Which one grows under the ground?', 'Mana yang tumbuh di dalam tanah?', fd('Potato'), [fd('Apple'), fd('Banana'), fd('Cherry')]),
  F('Which one do monkeys love?', 'Mana yang disukai monyet?', fd('Banana'), [fd('Broccoli'), fd('Potato'), fd('Eggplant')]),
];

function food(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    const f = pick(rng, FOODS);
    return { prompt: T('What is this?', 'Ini apa?'), emoji: f.e, correct: f.n, wrong: others(rng, FOODS.map((x) => x.n), f.n) };
  }
  if (d === 2) {
    const f = pick(rng, FOODS);
    const ans = f.veg ? VEG : FRUIT;
    return {
      prompt: T(`${f.n.en}: fruit or vegetable?`, `${f.n.id}: buah atau sayur?`),
      emoji: f.e,
      correct: ans,
      wrong: [f.veg ? FRUIT : VEG],
      explain: T(`${f.n.en} is a ${f.veg ? 'vegetable' : 'fruit'}.`, `${f.n.id} adalah ${f.veg ? 'sayur' : 'buah'}.`),
    };
  }
  if (rng() < 0.35) return pick(rng, FOOD_F3);
  // No emoji here: the picture would give the color away.
  const f = pick(rng, FOODS.filter((x) => x.c));
  return {
    prompt: T(`What color is the ${f.n.en.toLowerCase()}?`, `Apa warna ${f.n.id.toLowerCase()}?`),
    correct: f.c!,
    wrong: others(rng, COLORS5, f.c!),
    explain: T(`${f.e} The ${f.n.en.toLowerCase()} is ${f.c!.en.toLowerCase()}.`, `${f.e} ${f.n.id} berwarna ${f.c!.id.toLowerCase()}.`),
  };
}

// ---------------- My body ----------------
const P = {
  eyes: T('Eyes', 'Mata'),
  ears: T('Ears', 'Telinga'),
  nose: T('Nose', 'Hidung'),
  mouth: T('Mouth', 'Mulut'),
  tongue: T('Tongue', 'Lidah'),
  hands: T('Hands', 'Tangan'),
  feet: T('Feet', 'Telapak kaki'),
  teeth: T('Teeth', 'Gigi'),
  brain: T('Brain', 'Otak'),
  legs: T('Legs', 'Kaki'),
  arms: T('Arms', 'Lengan'),
  heart: T('Heart', 'Jantung'),
  lungs: T('Lungs', 'Paru-paru'),
  skin: T('Skin', 'Kulit'),
};
const PART_LIST = Object.values(P);
// Parts that are too similar to appear together as answer + distractor.
const PART_GROUPS: Text[][] = [[P.feet, P.legs], [P.mouth, P.tongue, P.teeth], [P.hands, P.arms]];
function partOthers(rng: Rng, ans: Text): Text[] {
  const group = PART_GROUPS.find((g) => g.includes(ans)) ?? [ans];
  return others(rng, PART_LIST.filter((p) => !group.includes(p)), ans);
}
const SEEN_PARTS: [string, Text][] = [['👀', P.eyes], ['👂', P.ears], ['👃', P.nose], ['👄', P.mouth], ['👅', P.tongue], ['✋', P.hands], ['🦶', P.feet], ['🦷', P.teeth], ['🦵', P.legs], ['💪', P.arms], ['🧠', P.brain]];

const BODY_COUNTS: [Text, number][] = [[T('eyes', 'mata'), 2], [T('ears', 'telinga'), 2], [T('noses', 'hidung'), 1], [T('mouths', 'mulut'), 1], [T('hands', 'tangan'), 2], [T('fingers on one hand', 'jari di satu tangan'), 5]];
const USES: [string, string, Text][] = [
  ['see', 'melihat', P.eyes], ['hear', 'mendengar', P.ears], ['smell', 'mencium bau', P.nose], ['taste food', 'merasakan makanan', P.tongue],
  ['chew', 'mengunyah', P.teeth], ['walk', 'berjalan', P.legs], ['think', 'berpikir', P.brain], ['clap', 'bertepuk tangan', P.hands],
  ['read a book', 'membaca buku', P.eyes], ['listen to music', 'mendengar musik', P.ears], ['sniff a flower', 'mencium bunga', P.nose],
  ['write', 'menulis', P.hands], ['smile', 'tersenyum', P.mouth], ['hug', 'memeluk', P.arms], ['jump', 'melompat', P.legs],
];
const PER_KID: [Text, number][] = [[T('eyes', 'mata'), 2], [T('ears', 'telinga'), 2], [T('noses', 'hidung'), 1], [T('hands', 'tangan'), 2], [T('feet', 'telapak kaki'), 2]];
const BODY_F3: Q[] = [
  F('Which part pumps blood around your body?', 'Bagian tubuh mana yang memompa darah?', P.heart, [P.brain, P.lungs, P.skin]),
  F('What helps you breathe air?', 'Apa yang membantumu bernapas?', P.lungs, [P.heart, P.teeth, P.skin]),
  F('What covers your whole body?', 'Apa yang menutupi seluruh tubuhmu?', P.skin, [P.teeth, P.brain, P.lungs]),
  F('How many fingers are on two hands?', 'Ada berapa jari di dua tangan?', S('10'), [S('5'), S('8'), S('12')]),
];

function body(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    if (rng() < 0.4) {
      const [what, n] = pick(rng, BODY_COUNTS);
      return { prompt: T(`How many ${what.en} do you have?`, `Kamu punya berapa ${what.id}?`), correct: S(String(n)), wrong: nearNums(rng, n) };
    }
    const [e, part] = pick(rng, SEEN_PARTS);
    return { prompt: T('What body part is this?', 'Ini bagian tubuh apa?'), emoji: e, correct: part, wrong: partOthers(rng, part) };
  }
  if (d === 2) {
    const [v, vId, part] = pick(rng, USES);
    return { prompt: T(`What do you use to ${v}?`, `Kamu pakai apa untuk ${vId}?`), correct: part, wrong: partOthers(rng, part) };
  }
  if (rng() < 0.25) return pick(rng, BODY_F3);
  const [what, per] = pick(rng, PER_KID);
  const kids = ri(rng, 2, 4);
  const ans = kids * per;
  return {
    prompt: T(`How many ${what.en} do ${kids} kids have together?`, `${kids} anak punya berapa ${what.id} semuanya?`),
    correct: S(String(ans)),
    wrong: nearNums(rng, ans, per),
    explain: T(`${kids} kids × ${per} = ${ans}.`, `${kids} anak × ${per} = ${ans}.`),
  };
}

// ---------------- Weather & seasons ----------------
const SKY: [string, Text][] = [
  ['☀️', T('Sunny', 'Cerah')], ['🌧️', T('Rainy', 'Hujan')], ['❄️', T('Snowy', 'Bersalju')], ['💨', T('Windy', 'Berangin')],
  ['☁️', T('Cloudy', 'Berawan')], ['⛈️', T('Stormy', 'Badai')], ['🌈', T('Rainbow', 'Pelangi')], ['🌫️', T('Foggy', 'Berkabut')],
];
const G = {
  umbrella: T('☂️ Umbrella', '☂️ Payung'),
  sunglasses: T('🕶️ Sunglasses', '🕶️ Kacamata hitam'),
  coat: T('🧥 Warm coat', '🧥 Jaket tebal'),
  kite: T('🪁 Kite', '🪁 Layang-layang'),
  gloves: T('🧤 Gloves', '🧤 Sarung tangan'),
  boots: T('👢 Rain boots', '👢 Sepatu bot'),
  icecream: T('🍦 Ice cream', '🍦 Es krim'),
};
const GEAR_Q: Q[] = [
  F('What do you use when it rains?', 'Apa yang kamu pakai saat hujan?', G.umbrella, [G.sunglasses, G.kite, G.icecream]),
  F('What protects your eyes on a sunny day?', 'Apa yang melindungi matamu saat cerah?', G.sunglasses, [G.gloves, G.boots, G.coat]),
  F('What keeps you warm when it snows?', 'Apa yang membuatmu hangat saat bersalju?', G.coat, [G.icecream, G.sunglasses, G.kite]),
  F('What can you fly on a windy day?', 'Apa yang bisa diterbangkan saat berangin?', G.kite, [G.boots, G.coat, G.gloves]),
  F('What keeps your hands warm in the cold?', 'Apa yang menghangatkan tanganmu saat dingin?', G.gloves, [G.sunglasses, G.kite, G.icecream]),
  F('What do you wear to jump in puddles?', 'Apa yang kamu pakai untuk melompat di genangan?', G.boots, [G.sunglasses, G.icecream, G.kite]),
  F('What cools you down on a hot day?', 'Apa yang menyejukkan saat panas?', G.icecream, [G.coat, G.gloves, G.boots]),
  F('Where is the safest place in a big storm?', 'Di mana tempat paling aman saat badai?', T('🏠 Inside the house', '🏠 Di dalam rumah'), [T('🌳 Under a tree', '🌳 Di bawah pohon'), T('🏖️ At the beach', '🏖️ Di pantai'), T('⛰️ On a hill', '⛰️ Di atas bukit')]),
];
const HOT = T('🔥 Hot', '🔥 Panas');
const COLD = T('🧊 Cold', '🧊 Dingin');
const HOTCOLD: [string, string, boolean][] = [['ice', 'es', false], ['the sun', 'matahari', true], ['snow', 'salju', false], ['fire', 'api', true], ['ice cream', 'es krim', false], ['a desert', 'gurun', true], ['winter', 'musim dingin', false], ['summer', 'musim panas', true]];
const WEATHER_F2: Q[] = [
  F('What do you need to see a rainbow?', 'Apa yang dibutuhkan untuk melihat pelangi?', T('☀️🌧️ Sun and rain', '☀️🌧️ Matahari dan hujan'), [T('❄️ Snow', '❄️ Salju'), T('🌙 The moon', '🌙 Bulan'), T('💨 Wind', '💨 Angin')]),
  F('Where does rain come from?', 'Dari mana hujan datang?', T('☁️ Clouds', '☁️ Awan'), [T('🌳 Trees', '🌳 Pohon'), T('⛰️ Mountains', '⛰️ Gunung'), T('⭐ Stars', '⭐ Bintang')]),
  F('What loud sound do you hear in a storm?', 'Suara keras apa yang terdengar saat badai?', T('Thunder', 'Guntur'), [T('Birds singing', 'Burung bernyanyi'), T('A bell', 'Lonceng'), T('Music', 'Musik')]),
  F('What bright flash do you see in a storm?', 'Kilatan terang apa yang terlihat saat badai?', T('⚡ Lightning', '⚡ Kilat'), [T('🌈 Rainbow', '🌈 Pelangi'), T('⭐ Star', '⭐ Bintang'), T('🌙 Moon', '🌙 Bulan')]),
  F('Why is rain good for plants?', 'Kenapa hujan baik untuk tanaman?', T('It gives them water', 'Memberi mereka air'), [T('It makes them cold', 'Membuat mereka dingin'), T('It paints them', 'Mewarnai mereka'), T('It makes them sleep', 'Membuat mereka tidur')]),
  F('What is snow made of?', 'Salju terbuat dari apa?', T('Frozen water', 'Air yang membeku'), [T('Sugar', 'Gula'), T('Cotton', 'Kapas'), T('Sand', 'Pasir')]),
  F('What color is the sky on a sunny day?', 'Apa warna langit saat cerah?', T('Blue', 'Biru'), [T('Green', 'Hijau'), T('Purple', 'Ungu'), T('Brown', 'Cokelat')]),
];

const MONTHS = [
  T('January', 'Januari'), T('February', 'Februari'), T('March', 'Maret'), T('April', 'April'), T('May', 'Mei'), T('June', 'Juni'),
  T('July', 'Juli'), T('August', 'Agustus'), T('September', 'September'), T('October', 'Oktober'), T('November', 'November'), T('December', 'Desember'),
];
const SEASONS = [T('🌸 Spring', '🌸 Musim semi'), T('☀️ Summer', '☀️ Musim panas'), T('🍂 Autumn', '🍂 Musim gugur'), T('❄️ Winter', '❄️ Musim dingin')];
const [SPRING, SUMMER, AUTUMN, WINTER] = SEASONS;
const WEATHER_F3: Q[] = [
  F('Which season is the coldest?', 'Musim apa yang paling dingin?', WINTER, SEASONS),
  F('Which season is the hottest?', 'Musim apa yang paling panas?', SUMMER, SEASONS),
  F('In which season do leaves fall from trees?', 'Di musim apa daun-daun berguguran?', AUTUMN, SEASONS),
  F('In which season do many flowers bloom?', 'Di musim apa banyak bunga mekar?', SPRING, SEASONS),
  F('Indonesia has the rainy season and the...?', 'Indonesia punya musim hujan dan musim...?', T('Dry season', 'Kemarau'), [T('Snow season', 'Salju'), T('Candy season', 'Permen'), T('Ice season', 'Es')]),
  F('How many seasons does a country like Japan have?', 'Negara seperti Jepang punya berapa musim?', S('4'), [S('2'), S('3'), S('6')]),
];

function weather(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    if (rng() < 0.5) return pick(rng, GEAR_Q);
    const [e, w] = pick(rng, SKY);
    return { prompt: T('What weather is this?', 'Cuaca apa ini?'), emoji: e, correct: w, wrong: others(rng, SKY.map((s) => s[1]), w) };
  }
  if (d === 2) {
    if (rng() < 0.5) return pick(rng, WEATHER_F2);
    const [x, xId, hot] = pick(rng, HOTCOLD);
    return { prompt: T(`Is ${x} hot or cold?`, `${cap(xId)} itu panas atau dingin?`), correct: hot ? HOT : COLD, wrong: [hot ? COLD : HOT] };
  }
  if (rng() < 0.4) return pick(rng, WEATHER_F3);
  const i = ri(rng, 0, 11);
  const next = MONTHS[(i + 1) % 12];
  return {
    prompt: T(`Which month comes after ${MONTHS[i].en}?`, `Bulan apa setelah ${MONTHS[i].id}?`),
    correct: next,
    wrong: others(rng, MONTHS.filter((_, j) => j !== i), next),
    explain: T(`${MONTHS[i].en}, then ${next.en}.`, `${MONTHS[i].id}, lalu ${next.id}.`),
  };
}

// ---------------- Vehicles ----------------
const LAND = T('🛣️ Land', '🛣️ Darat');
const WATER = T('🌊 Water', '🌊 Air');
const SKYW = T('☁️ Sky', '☁️ Udara');
interface Veh {
  e: string;
  n: Text;
  w?: Text;
}
const VEHICLES: Veh[] = [
  { e: '🚗', n: T('Car', 'Mobil'), w: LAND }, { e: '🚌', n: T('Bus', 'Bus'), w: LAND }, { e: '🚲', n: T('Bicycle', 'Sepeda'), w: LAND },
  { e: '🏍️', n: T('Motorbike', 'Motor'), w: LAND }, { e: '🚂', n: T('Train', 'Kereta'), w: LAND }, { e: '🚕', n: T('Taxi', 'Taksi'), w: LAND },
  { e: '🚑', n: T('Ambulance', 'Ambulans'), w: LAND }, { e: '🚒', n: T('Fire truck', 'Mobil pemadam'), w: LAND }, { e: '🛺', n: T('Bajaj', 'Bajaj'), w: LAND },
  { e: '✈️', n: T('Airplane', 'Pesawat'), w: SKYW }, { e: '🚁', n: T('Helicopter', 'Helikopter'), w: SKYW }, { e: '🎈', n: T('Hot-air balloon', 'Balon udara'), w: SKYW },
  { e: '🚢', n: T('Ship', 'Kapal'), w: WATER }, { e: '⛵', n: T('Sailboat', 'Perahu layar'), w: WATER }, { e: '🛶', n: T('Canoe', 'Kano'), w: WATER },
  { e: '🚤', n: T('Speedboat', 'Perahu motor'), w: WATER }, { e: '🚀', n: T('Rocket', 'Roket') },
];
const vn = (en: string) => {
  const v = VEHICLES.find((x) => x.n.en === en)!;
  return withEmoji(v.e, v.n);
};

const WHEELS: [string, number][] = [['Bicycle', 2], ['Car', 4], ['Motorbike', 2], ['Bajaj', 3]];
const VEH_F3: Q[] = [
  F('Which one helps put out fires?', 'Mana yang membantu memadamkan api?', vn('Fire truck'), [vn('Taxi'), vn('Bicycle'), vn('Canoe')]),
  F('Which one takes sick people to the hospital?', 'Mana yang membawa orang sakit ke rumah sakit?', vn('Ambulance'), [vn('Sailboat'), vn('Hot-air balloon'), vn('Rocket')]),
  F('Which one flies to outer space?', 'Mana yang terbang ke luar angkasa?', vn('Rocket'), [vn('Bus'), vn('Canoe'), vn('Bicycle')]),
  F('Which one rides on long rails?', 'Mana yang berjalan di atas rel?', vn('Train'), [vn('Helicopter'), vn('Canoe'), vn('Sailboat')]),
  F('Which one do you pedal with your feet?', 'Mana yang dikayuh dengan kaki?', vn('Bicycle'), [vn('Airplane'), vn('Ship'), vn('Train')]),
  F('Which one flies with spinning blades on top?', 'Mana yang terbang dengan baling-baling di atas?', vn('Helicopter'), [vn('Ship'), vn('Bus'), vn('Bicycle')]),
  F('Which one uses the wind to move on water?', 'Mana yang memakai angin untuk bergerak di air?', vn('Sailboat'), [vn('Car'), vn('Train'), vn('Motorbike')]),
  F('Which one carries many people across the sea?', 'Mana yang membawa banyak orang menyeberangi laut?', vn('Ship'), [vn('Bicycle'), vn('Motorbike'), vn('Taxi')]),
  F('Which one has wings and flies very high?', 'Mana yang punya sayap dan terbang tinggi?', vn('Airplane'), [vn('Bus'), vn('Canoe'), vn('Train')]),
  F('Which one do you paddle on a river?', 'Mana yang didayung di sungai?', vn('Canoe'), [vn('Airplane'), vn('Bus'), vn('Taxi')]),
  F('Which big one takes many kids to school?', 'Mana yang besar dan mengantar banyak anak ke sekolah?', vn('Bus'), [vn('Canoe'), vn('Rocket'), vn('Hot-air balloon')]),
];

function transport(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    const v = pick(rng, VEHICLES);
    return { prompt: T('What vehicle is this?', 'Kendaraan apa ini?'), emoji: v.e, correct: v.n, wrong: others(rng, VEHICLES.map((x) => x.n), v.n) };
  }
  if (d === 2) {
    const v = pick(rng, VEHICLES.filter((x) => x.w));
    return {
      prompt: T(`${v.n.en}: land, water, or sky?`, `${v.n.id}: darat, air, atau udara?`),
      emoji: v.e,
      correct: v.w!,
      wrong: [LAND, WATER, SKYW],
    };
  }
  if (rng() < 0.3) {
    const [en, n] = pick(rng, WHEELS);
    const v = VEHICLES.find((x) => x.n.en === en)!;
    return {
      prompt: T(`How many wheels does a ${en.toLowerCase()} have?`, `${v.n.id} punya berapa roda?`),
      emoji: v.e,
      correct: S(String(n)),
      wrong: nearNums(rng, n),
    };
  }
  return pick(rng, VEH_F3);
}

// ---------------- Opposites ----------------
const PAIRS: [Text, Text][] = [
  [T('big', 'besar'), T('small', 'kecil')], [T('hot', 'panas'), T('cold', 'dingin')], [T('up', 'atas'), T('down', 'bawah')],
  [T('happy', 'senang'), T('sad', 'sedih')], [T('fast', 'cepat'), T('slow', 'lambat')], [T('open', 'buka'), T('closed', 'tutup')],
  [T('day', 'siang'), T('night', 'malam')], [T('wet', 'basah'), T('dry', 'kering')],
  [T('full', 'penuh'), T('empty', 'kosong')], [T('tall', 'tinggi'), T('short', 'pendek')], [T('loud', 'berisik'), T('quiet', 'tenang')],
  [T('in', 'dalam'), T('out', 'luar')], [T('light', 'terang'), T('dark', 'gelap')],
  [T('clean', 'bersih'), T('dirty', 'kotor')], [T('push', 'dorong'), T('pull', 'tarik')], [T('front', 'depan'), T('back', 'belakang')],
  [T('near', 'dekat'), T('far', 'jauh')], [T('old', 'tua'), T('young', 'muda')], [T('left', 'kiri'), T('right', 'kanan')],
];

function opposites(rng: Rng, d: Difficulty): Q {
  const pool = PAIRS.slice(0, d === 1 ? 8 : d === 2 ? 13 : PAIRS.length);
  const [a, b] = pick(rng, pool);
  const flip = rng() < 0.5;
  const word = flip ? b : a;
  const ans = flip ? a : b;
  return {
    prompt: T(`What is the opposite of "${word.en}"?`, `Apa lawan kata "${word.id}"?`),
    correct: ans,
    wrong: others(rng, PAIRS.flat().filter((w) => w.en !== word.en), ans),
    explain: T(`"${word.en}" and "${ans.en}" are opposites.`, `"${word.id}" lawannya "${ans.id}".`),
  };
}

// ---------------- Feelings ----------------
const FEEL: [string, Text][] = [
  ['😊', T('Happy', 'Senang')], ['😢', T('Sad', 'Sedih')], ['😠', T('Angry', 'Marah')], ['😨', T('Scared', 'Takut')],
  ['😲', T('Surprised', 'Terkejut')], ['😴', T('Sleepy', 'Mengantuk')], ['🤩', T('Excited', 'Bersemangat')],
  ['😌', T('Calm', 'Tenang')], ['🥰', T('Loved', 'Disayang')],
];
// Feelings that look alike are never answer + distractor together.
const FEEL_GROUPS = [[0, 6, 7, 8], [3, 4]];
function feelPool(okIdx: number[]): number[] {
  const out = new Set<number>();
  for (const i of okIdx) for (const j of FEEL_GROUPS.find((g) => g.includes(i)) ?? [i]) out.add(j);
  return FEEL.map((_, i) => i).filter((i) => !out.has(i));
}
const feelLabel = (i: number) => withEmoji(FEEL[i][0], FEEL[i][1]);

// [scenario en, scenario id, answer, ...other acceptable feelings]
const SCENES: [string, string, number[]][] = [
  ['You get a present on your birthday', 'Kamu dapat hadiah ulang tahun', [0, 4]],
  ['Your ice cream falls on the floor', 'Es krimmu jatuh ke lantai', [1, 2]],
  ['Someone breaks your toy on purpose', 'Seseorang sengaja merusak mainanmu', [2, 1]],
  ['You hear loud thunder in the dark', 'Kamu mendengar guntur keras di tempat gelap', [3]],
  ['Your friend jumps out and shouts "BOO!"', 'Temanmu tiba-tiba muncul dan berteriak "DOR!"', [4]],
  ['You played all day and it is very late', 'Kamu bermain seharian dan sudah larut malam', [5, 7]],
  ['Tomorrow you are going to the zoo!', 'Besok kamu pergi ke kebun binatang!', [6]],
  ['You lie on the grass listening to birds', 'Kamu berbaring di rumput mendengar burung', [7, 5]],
  ['Mom gives you a big warm hug', 'Ibu memelukmu dengan hangat', [8]],
  ['Your best friend moves to another city', 'Sahabatmu pindah ke kota lain', [1]],
  ['You finish a puzzle all by yourself', 'Kamu menyelesaikan puzzle sendiri', [0, 4]],
  ['Your brother takes your crayons without asking', 'Adikmu mengambil krayonmu tanpa izin', [2, 1]],
  ['You are lost in a big shop', 'Kamu tersesat di toko besar', [3, 1]],
  ['You find a surprise cake on the table', 'Kamu menemukan kue kejutan di meja', [4, 0]],
  ['You yawn and your eyes feel heavy', 'Kamu menguap dan matamu terasa berat', [5, 7]],
  ['You take slow, deep breaths', 'Kamu menarik napas pelan dan dalam', [7, 5]],
];

const BAD = [
  T('Hit someone', 'Memukul orang'), T('Throw your toys', 'Melempar mainan'), T('Shout mean words', 'Meneriakkan kata kasar'),
  T('Break something', 'Merusak barang'), T('Laugh at them', 'Menertawakan mereka'), T('Run away and hide', 'Kabur dan bersembunyi'),
];
const CARE: [string, string, string, string][] = [
  ['You feel angry. What can you do?', 'Kamu marah. Apa yang bisa kamu lakukan?', 'Take slow, deep breaths', 'Tarik napas pelan-pelan'],
  ['You feel sad. What can help?', 'Kamu sedih. Apa yang bisa membantu?', 'Talk to someone you trust', 'Bicara dengan orang yang kamu percaya'],
  ['You feel scared. What should you do?', 'Kamu takut. Apa yang sebaiknya kamu lakukan?', 'Tell a grown-up', 'Beri tahu orang dewasa'],
  ['You feel very sleepy. What should you do?', 'Kamu sangat mengantuk. Apa yang sebaiknya kamu lakukan?', 'Rest or go to bed', 'Istirahat atau tidur'],
  ['Your friend is crying. How can you help?', 'Temanmu menangis. Bagaimana kamu membantu?', 'Ask if they are okay', 'Tanya apakah dia baik-baik saja'],
  ['A friend falls down. What do you do?', 'Temanmu jatuh. Apa yang kamu lakukan?', 'Help them get up', 'Bantu dia berdiri'],
  ['Someone shares a snack with you. What do you say?', 'Seseorang berbagi camilan. Kamu bilang apa?', 'Thank you!', 'Terima kasih!'],
  ['You made a mistake. What can you do?', 'Kamu berbuat salah. Apa yang bisa kamu lakukan?', 'Say sorry and try again', 'Minta maaf dan coba lagi'],
  ['A kid is playing alone. What can you do?', 'Ada anak bermain sendirian. Apa yang bisa kamu lakukan?', 'Invite them to play', 'Ajak dia bermain'],
  ['You feel worried about a test. What helps?', 'Kamu cemas soal ujian. Apa yang membantu?', 'Practice and ask for help', 'Berlatih dan minta bantuan'],
  ['You are excited, but you are in the library. What do you do?', 'Kamu bersemangat, tapi di perpustakaan. Apa yang kamu lakukan?', 'Use a quiet voice', 'Pakai suara pelan'],
  ['You see someone being bullied. What should you do?', 'Kamu melihat ada yang dirundung. Apa yang sebaiknya kamu lakukan?', 'Tell a teacher', 'Beri tahu guru'],
  ['A puzzle is too hard and you feel upset. What helps?', 'Puzzle terlalu sulit dan kamu kesal. Apa yang membantu?', 'Take a break, then try again', 'Istirahat sebentar, lalu coba lagi'],
  ['There is a new kid in class. What can you do?', 'Ada murid baru di kelas. Apa yang bisa kamu lakukan?', 'Say hello and smile', 'Sapa dan tersenyum'],
  ['You feel really happy! What can you do?', 'Kamu sangat senang! Apa yang bisa kamu lakukan?', 'Share your smile with others', 'Bagikan senyummu'],
];

function feelings(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    const i = ri(rng, 0, FEEL.length - 1);
    const pool = shuffle(rng, feelPool([i])).slice(0, 3);
    if (rng() < 0.5) {
      return { prompt: T('How does this face feel?', 'Wajah ini merasa apa?'), emoji: FEEL[i][0], correct: FEEL[i][1], wrong: pool.map((j) => FEEL[j][1]) };
    }
    const n = FEEL[i][1];
    return {
      prompt: T(`Which face looks ${n.en.toLowerCase()}?`, `Wajah mana yang terlihat ${n.id.toLowerCase()}?`),
      correct: S(FEEL[i][0]),
      wrong: pool.map((j) => S(FEEL[j][0])),
    };
  }
  if (d === 2) {
    const [en, id, ok] = pick(rng, SCENES);
    return {
      prompt: T(`${en}. How would you feel?`, `${id}. Kamu akan merasa apa?`),
      correct: feelLabel(ok[0]),
      wrong: shuffle(rng, feelPool(ok)).slice(0, 3).map(feelLabel),
    };
  }
  const [pEn, pId, gEn, gId] = pick(rng, CARE);
  return { prompt: T(pEn, pId), correct: T(gEn, gId), wrong: others(rng, BAD, T(gEn, gId)) };
}

// ---------------- Space ----------------
const SP = {
  moon: T('Moon', 'Bulan'), sun: T('Sun', 'Matahari'), star: T('Star', 'Bintang'), earth: T('Earth', 'Bumi'),
  rocket: T('Rocket', 'Roket'), planet: T('Planet', 'Planet'), astronaut: T('Astronaut', 'Astronot'),
  comet: T('Comet', 'Komet'), telescope: T('Telescope', 'Teleskop'), satellite: T('Satellite', 'Satelit'),
};
const SPACE_SEEN: [string, Text][] = [
  ['🌙', SP.moon], ['☀️', SP.sun], ['⭐', SP.star], ['🌍', SP.earth], ['🚀', SP.rocket],
  ['🪐', SP.planet], ['👩‍🚀', SP.astronaut], ['☄️', SP.comet], ['🔭', SP.telescope], ['🛰️', SP.satellite],
];
const SPACE_F1: Q[] = [
  F('What shines in the sky during the day?', 'Apa yang bersinar di langit saat siang?', SP.sun, [SP.moon, SP.comet, SP.satellite]),
  F('What twinkles in the night sky?', 'Apa yang berkelip di langit malam?', SP.star, [SP.sun, SP.rocket, SP.earth]),
  F('Which planet is our home?', 'Planet mana rumah kita?', SP.earth, [SP.moon, SP.sun, SP.star]),
  F('Who travels to space in a rocket?', 'Siapa yang pergi ke luar angkasa naik roket?', SP.astronaut, [SP.telescope, SP.comet, SP.moon]),
  F('What helps you see stars far away?', 'Apa yang membantumu melihat bintang yang jauh?', SP.telescope, [SP.comet, SP.moon, SP.sun]),
];
const PL = [T('Mercury', 'Merkurius'), T('Venus', 'Venus'), T('Earth', 'Bumi'), T('Mars', 'Mars'), T('Jupiter', 'Jupiter'), T('Saturn', 'Saturnus'), T('Uranus', 'Uranus'), T('Neptune', 'Neptunus')];
const [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE] = PL;
const PLANET_ORDER = T(PL.map((p) => p.en).join(', '), PL.map((p) => p.id).join(', '));
const SPACE_F2: Q[] = [
  F('Which planet is called the Red Planet?', 'Planet mana yang disebut Planet Merah?', MARS, [VENUS, EARTH, NEPTUNE]),
  F('Which planet has big, beautiful rings?', 'Planet mana yang punya cincin besar dan indah?', SATURN, [MERCURY, MARS, EARTH]),
  F('Which planet is the biggest?', 'Planet mana yang paling besar?', JUPITER, [MERCURY, MARS, EARTH]),
  F('Which planet is closest to the Sun?', 'Planet mana yang paling dekat dengan Matahari?', MERCURY, [NEPTUNE, SATURN, EARTH]),
  F('Which planet is the hottest?', 'Planet mana yang paling panas?', VENUS, [NEPTUNE, URANUS, MARS]),
  F('Which planet is farthest from the Sun?', 'Planet mana yang paling jauh dari Matahari?', NEPTUNE, [MERCURY, EARTH, VENUS]),
  F('Which planet has lots of water and life?', 'Planet mana yang punya banyak air dan kehidupan?', EARTH, [MARS, MERCURY, VENUS]),
  F('Is the Sun a star or a planet?', 'Matahari itu bintang atau planet?', T('A star', 'Bintang'), [T('A planet', 'Planet')]),
  F('What goes around the Earth?', 'Apa yang mengelilingi Bumi?', SP.moon, [SP.sun, SP.comet, SP.telescope]),
  F('How many planets go around our Sun?', 'Ada berapa planet yang mengelilingi Matahari?', S('8'), [S('3'), S('5'), S('12')]),
  F('What do astronauts wear in space?', 'Apa yang dipakai astronot di luar angkasa?', T('A space suit', 'Baju antariksa'), [T('A swimsuit', 'Baju renang'), T('Pajamas', 'Piyama'), T('A raincoat', 'Jas hujan')]),
  F('Which is hotter?', 'Mana yang lebih panas?', SP.sun, [SP.moon]),
  F('Does the Moon make its own light?', 'Apakah Bulan punya cahaya sendiri?', T('No, it reflects sunlight', 'Tidak, memantulkan cahaya Matahari'), [T('Yes, it has a lamp', 'Ya, punya lampu'), T('Yes, it is on fire', 'Ya, terbakar')]),
  F('What shape is the Earth?', 'Bumi berbentuk apa?', T('Round like a ball', 'Bulat seperti bola'), [T('Flat like a plate', 'Datar seperti piring'), T('Square like a box', 'Kotak seperti kardus'), T('Like a star', 'Seperti bintang')]),
  F('Where does a rocket go?', 'Roket pergi ke mana?', T('Outer space', 'Luar angkasa'), [T('Under the sea', 'Bawah laut'), T('Inside the ground', 'Dalam tanah'), T('To the shop', 'Ke toko')]),
];

function space(rng: Rng, d: Difficulty): Q {
  if (d === 1) {
    if (rng() < 0.35) return pick(rng, SPACE_F1);
    const [e, n] = pick(rng, SPACE_SEEN);
    return { prompt: T('What is this?', 'Ini apa?'), emoji: e, correct: n, wrong: others(rng, SPACE_SEEN.map((s) => s[1]), n) };
  }
  if (d === 2) return pick(rng, SPACE_F2);
  const explain = T(`From the Sun: ${PLANET_ORDER.en}.`, `Dari Matahari: ${PLANET_ORDER.id}.`);
  if (rng() < 0.5) {
    const i = ri(rng, 0, 6);
    return {
      prompt: T(`Which planet comes right after ${PL[i].en}, going away from the Sun?`, `Planet apa setelah ${PL[i].id}, menjauhi Matahari?`),
      correct: PL[i + 1],
      wrong: others(rng, PL.filter((_, j) => j !== i), PL[i + 1]),
      explain,
    };
  }
  const i = ri(rng, 0, 7);
  return {
    prompt: T(`Which planet is number ${i + 1} from the Sun?`, `Planet urutan ke-${i + 1} dari Matahari?`),
    correct: PL[i],
    wrong: others(rng, PL, PL[i]),
    explain,
  };
}

// ---------------- Skip counting ----------------
function skipcount(rng: Rng, d: Difficulty): Q {
  if (d === 3 && rng() < 0.35) {
    const n = ri(rng, 10, 89);
    const back = rng() < 0.4;
    const ans = back ? n - 10 : n + 10;
    return {
      prompt: back ? T(`What is ${n} take away 10?`, `Berapa ${n} dikurangi 10?`) : T(`What is 10 more than ${n}?`, `Berapa ${n} ditambah 10?`),
      correct: S(String(ans)),
      wrong: nearNums(rng, ans, 10),
      explain: T(`Only the tens change: ${n} → ${ans}.`, `Hanya puluhannya yang berubah: ${n} → ${ans}.`),
    };
  }
  const steps = d === 1 ? [10, 2, 5] : d === 2 ? [2, 5, 10] : [2, 3, 5, 10];
  const step = pick(rng, steps);
  const start = step * ri(rng, d === 1 ? 0 : 1, d === 1 ? 6 : d === 2 ? 8 : 15);
  const backward = d === 3 && start >= step * 3 && rng() < 0.3;
  const seq = [0, 1, 2].map((k) => (backward ? start - k * step : start + k * step));
  const ans = backward ? start - 3 * step : start + 3 * step;
  return {
    prompt: T(`What comes next? ${seq.join(', ')}, ...`, `Angka berikutnya? ${seq.join(', ')}, ...`),
    correct: S(String(ans)),
    wrong: nearNums(rng, ans, step),
    explain: T(`${backward ? 'Take away' : 'Add'} ${step} each time: ${ans}!`, `${backward ? 'Kurangi' : 'Tambah'} ${step} setiap kali: ${ans}!`),
  };
}

const GEN: Record<MoreTopic, (rng: Rng, d: Difficulty) => Q> = { time, food, body, weather, transport, opposites, feelings, space, skipcount };

export function makeMoreQuestion(topic: MoreTopic, rng: Rng, d: Difficulty): Question {
  return toQuestion(rng, topic, d, GEN[topic](rng, d));
}

// ---------------- Lesson roads ----------------
const L = (id: string, title: Text, goal: Text, text: Text, example?: Text): LessonModule => ({ id, title, goal, steps: [{ text, example }] });

export const MORE_LESSONS: Record<MoreTopic, LessonModule[]> = {
  time: [
    L('time-1', T("1. O'clock", '1. Jam tepat'), T('Look at the short hand.', 'Lihat jarum pendek.'),
      T("The short hand shows the hour. When the long hand points up at 12, we say o'clock. 🕒 = 3 o'clock.", 'Jarum pendek menunjukkan jam. Saat jarum panjang lurus ke atas di 12, itu jam tepat. 🕒 = jam 3.'),
      T("🕘 = 9 o'clock", '🕘 = jam 9')),
    L('time-2', T('2. Half past', '2. Setengah'), T('The long hand points at 6.', 'Jarum panjang menunjuk angka 6.'),
      T('When the long hand points down at 6, it is half past. 🕞 = half past 3.', 'Saat jarum panjang menunjuk ke bawah di angka 6, itu setengah. 🕞 = jam setengah 4.'),
      T('🕡 = half past 6', '🕡 = jam setengah 7')),
    L('time-3', T('3. Days of the week', '3. Nama hari'), T('7 days, in order.', '7 hari, berurutan.'),
      T('Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Then it starts again!', 'Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu. Lalu mulai lagi!'),
      T('After Friday comes Saturday.', 'Setelah Jumat adalah Sabtu.')),
  ],
  food: [
    L('food-1', T('1. Fruits', '1. Buah'), T('Sweet and full of seeds.', 'Manis dan berbiji.'),
      T('Fruits are often sweet and have seeds inside: 🍎 🍌 🍇 🍓 🍉', 'Buah biasanya manis dan punya biji: 🍎 🍌 🍇 🍓 🍉')),
    L('food-2', T('2. Vegetables', '2. Sayur'), T('Plants we cook or eat fresh.', 'Tanaman yang dimasak atau dimakan segar.'),
      T('Vegetables are plants like 🥕 carrots, 🥦 broccoli, 🌽 corn and 🥒 cucumbers.', 'Sayur adalah tanaman seperti 🥕 wortel, 🥦 brokoli, 🌽 jagung, dan 🥒 timun.')),
    L('food-3', T('3. Eat a rainbow', '3. Makan pelangi'), T('Many colors keep you strong.', 'Banyak warna membuatmu kuat.'),
      T('Try red 🍎, orange 🥕, yellow 🍌, green 🥦 and purple 🍆 foods every day!', 'Coba makanan merah 🍎, oranye 🥕, kuning 🍌, hijau 🥦, dan ungu 🍆 setiap hari!')),
  ],
  body: [
    L('body-1', T('1. Name your body', '1. Bagian tubuh'), T('Point and say.', 'Tunjuk dan sebut.'),
      T('👀 eyes, 👂 ears, 👃 nose, 👄 mouth, ✋ hands, 🦶 feet.', '👀 mata, 👂 telinga, 👃 hidung, 👄 mulut, ✋ tangan, 🦶 telapak kaki.')),
    L('body-2', T('2. Five senses', '2. Lima indra'), T('How we learn about the world.', 'Cara kita mengenal dunia.'),
      T('We see with eyes, hear with ears, smell with the nose, taste with the tongue and feel with our skin.', 'Kita melihat dengan mata, mendengar dengan telinga, mencium dengan hidung, merasa dengan lidah, dan meraba dengan kulit.')),
    L('body-3', T('3. Inside your body', '3. Di dalam tubuh'), T('Hard-working helpers.', 'Pembantu yang rajin.'),
      T('🧠 Your brain thinks, 🫀 your heart pumps blood, 🫁 your lungs breathe air.', '🧠 Otak berpikir, 🫀 jantung memompa darah, 🫁 paru-paru bernapas.')),
  ],
  weather: [
    L('weather-1', T('1. Kinds of weather', '1. Jenis cuaca'), T('Look at the sky.', 'Lihat langit.'),
      T('☀️ sunny, 🌧️ rainy, ☁️ cloudy, 💨 windy, ⛈️ stormy, ❄️ snowy.', '☀️ cerah, 🌧️ hujan, ☁️ berawan, 💨 berangin, ⛈️ badai, ❄️ bersalju.')),
    L('weather-2', T('2. Dress for the weather', '2. Pakaian sesuai cuaca'), T('Stay safe and comfy.', 'Tetap aman dan nyaman.'),
      T('Rain: ☂️ umbrella. Cold: 🧥 coat. Sunny: 🕶️ sunglasses. Storm: 🏠 stay inside!', 'Hujan: ☂️ payung. Dingin: 🧥 jaket. Cerah: 🕶️ kacamata. Badai: 🏠 tetap di dalam!')),
    L('weather-3', T('3. Seasons', '3. Musim'), T('The year changes.', 'Tahun berganti musim.'),
      T('Some countries have 4 seasons: 🌸 spring, ☀️ summer, 🍂 autumn, ❄️ winter. Indonesia has the rainy season and the dry season.', 'Beberapa negara punya 4 musim: 🌸 semi, ☀️ panas, 🍂 gugur, ❄️ dingin. Indonesia punya musim hujan dan kemarau.')),
  ],
  transport: [
    L('transport-1', T('1. On land', '1. Di darat'), T('Roads and rails.', 'Jalan dan rel.'),
      T('🚗 cars, 🚌 buses, 🚲 bicycles, 🛺 bajaj and 🚂 trains move on land.', '🚗 mobil, 🚌 bus, 🚲 sepeda, 🛺 bajaj, dan 🚂 kereta bergerak di darat.')),
    L('transport-2', T('2. Water and sky', '2. Air dan udara'), T('Float or fly.', 'Mengapung atau terbang.'),
      T('🚢 ships and ⛵ sailboats float on water. ✈️ airplanes and 🚁 helicopters fly in the sky.', '🚢 kapal dan ⛵ perahu layar mengapung di air. ✈️ pesawat dan 🚁 helikopter terbang di udara.')),
    L('transport-3', T('3. Helper vehicles', '3. Kendaraan penolong'), T('They help people.', 'Mereka menolong orang.'),
      T('🚒 Fire trucks put out fires, 🚑 ambulances help sick people, 🚌 buses take kids to school.', '🚒 Mobil pemadam memadamkan api, 🚑 ambulans menolong orang sakit, 🚌 bus mengantar anak ke sekolah.')),
  ],
  opposites: [
    L('opp-1', T('1. What is an opposite?', '1. Apa itu lawan kata?'), T('Totally different words.', 'Kata yang sangat berbeda.'),
      T('Opposites mean the very different thing: big ↔ small, hot ↔ cold.', 'Lawan kata artinya sangat berbeda: besar ↔ kecil, panas ↔ dingin.')),
    L('opp-2', T('2. Opposites around you', '2. Lawan kata di sekitarmu'), T('Look around!', 'Lihat sekitar!'),
      T('A door is open ↔ closed. The sky is day ↔ night. A glass is full ↔ empty.', 'Pintu buka ↔ tutup. Langit siang ↔ malam. Gelas penuh ↔ kosong.')),
    L('opp-3', T('3. Opposite game', '3. Permainan lawan kata'), T('Say the opposite fast!', 'Sebut lawannya cepat!'),
      T('Up → down. Fast → slow. Near → far. Clean → dirty.', 'Atas → bawah. Cepat → lambat. Dekat → jauh. Bersih → kotor.')),
  ],
  feelings: [
    L('feel-1', T('1. Name your feelings', '1. Kenali perasaan'), T('Faces tell feelings.', 'Wajah menunjukkan perasaan.'),
      T('😊 happy, 😢 sad, 😠 angry, 😨 scared, 😲 surprised, 😴 sleepy.', '😊 senang, 😢 sedih, 😠 marah, 😨 takut, 😲 terkejut, 😴 mengantuk.')),
    L('feel-2', T('2. All feelings are okay', '2. Semua perasaan boleh'), T('Everyone feels them.', 'Semua orang merasakannya.'),
      T('Everyone feels sad or angry sometimes. It is okay! What matters is what we do next.', 'Semua orang kadang sedih atau marah. Tidak apa-apa! Yang penting apa yang kita lakukan.')),
    L('feel-3', T('3. Be kind', '3. Bersikap baik'), T('Help yourself and others.', 'Bantu diri dan orang lain.'),
      T('Take deep breaths, talk to someone you trust, and help friends who feel sad.', 'Tarik napas dalam, bicara dengan orang yang kamu percaya, dan bantu teman yang sedih.')),
  ],
  space: [
    L('space-1', T('1. Sun, Moon and stars', '1. Matahari, Bulan, bintang'), T('Look up!', 'Lihat ke atas!'),
      T('☀️ The Sun is a star that gives us light. 🌙 The Moon goes around the Earth.', '☀️ Matahari adalah bintang yang memberi cahaya. 🌙 Bulan mengelilingi Bumi.')),
    L('space-2', T('2. Our planets', '2. Planet kita'), T('8 planets in order.', '8 planet berurutan.'),
      T(`From the Sun: ${PLANET_ORDER.en}. We live on Earth! 🌍`, `Dari Matahari: ${PLANET_ORDER.id}. Kita tinggal di Bumi! 🌍`)),
    L('space-3', T('3. Astronauts', '3. Astronot'), T('Space explorers.', 'Penjelajah angkasa.'),
      T('👩‍🚀 Astronauts fly in 🚀 rockets and wear space suits to breathe.', '👩‍🚀 Astronot terbang naik 🚀 roket dan memakai baju antariksa untuk bernapas.')),
  ],
  skipcount: [
    L('skip-1', T('1. Count by 10s', '1. Hitung loncat 10'), T('Big jumps!', 'Loncatan besar!'),
      T('10, 20, 30, 40, 50, 60, 70, 80, 90, 100.', '10, 20, 30, 40, 50, 60, 70, 80, 90, 100.'), T('After 40 comes 50.', 'Setelah 40 adalah 50.')),
    L('skip-2', T('2. Count by 5s', '2. Hitung loncat 5'), T('Like fingers on a hand.', 'Seperti jari di satu tangan.'),
      T('5, 10, 15, 20, 25, 30... Each hand has 5 fingers!', '5, 10, 15, 20, 25, 30... Satu tangan punya 5 jari!')),
    L('skip-3', T('3. Count by 2s', '3. Hitung loncat 2'), T('Pairs of things.', 'Benda berpasangan.'),
      T('2, 4, 6, 8, 10... Like counting pairs of shoes 👟👟.', '2, 4, 6, 8, 10... Seperti menghitung pasang sepatu 👟👟.')),
  ],
};
