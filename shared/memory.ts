import { pick, randInt, shuffle, type Rng } from './questions';
import { COLORS, SPRITE_NAMES, type Choice, type ColorId, type Difficulty, type MemoryRound, type Question, type SpriteGroup, type SpriteId } from './types';

const SPRITES: SpriteId[] = ['apple', 'star', 'heart', 'fish', 'ball'];
const COLOR_IDS = Object.keys(COLORS) as ColorId[];

function countQuestion(rng: Rng, g: SpriteGroup, level: Difficulty): Question {
  const name = SPRITE_NAMES[g.sprite].many;
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const n = g.count + randInt(rng, -3, 3);
    if (n > 0 && n !== g.count) wrong.add(n);
  }
  const correct: Choice = { label: { en: String(g.count), id: String(g.count) } };
  const choices = shuffle(rng, [correct, ...[...wrong].map((n) => ({ label: { en: String(n), id: String(n) } }))]);
  return {
    id: `memory-count-${Math.floor(rng() * 1e9).toString(36)}`,
    topic: 'memory',
    difficulty: level,
    prompt: { en: `How many ${name.en} did you see?`, id: `Tadi ada berapa ${name.id}?` },
    choices,
    answer: choices.indexOf(correct),
    explain: { en: `There were ${g.count} ${name.en}.`, id: `Tadi ada ${g.count} ${name.id}.` },
  };
}

function colorQuestion(rng: Rng, g: SpriteGroup, level: Difficulty): Question {
  const name = SPRITE_NAMES[g.sprite].many;
  const wrongCount = level === 1 ? 2 : 3;
  const correct: Choice = { label: COLORS[g.color].name, color: g.color };
  const wrong = shuffle(rng, COLOR_IDS.filter((c) => c !== g.color))
    .slice(0, wrongCount)
    .map((c): Choice => ({ label: COLORS[c].name, color: c }));
  const choices = shuffle(rng, [correct, ...wrong]);
  return {
    id: `memory-color-${Math.floor(rng() * 1e9).toString(36)}`,
    topic: 'memory',
    difficulty: level,
    prompt: { en: `What color were the ${name.en}?`, id: `Apa warna ${name.id} tadi?` },
    choices,
    answer: choices.indexOf(correct),
    explain: {
      en: `They were ${COLORS[g.color].name.en.toLowerCase()}.`,
      id: `Warnanya ${COLORS[g.color].name.id.toLowerCase()}.`,
    },
  };
}

/**
 * Level 1: one group, 1-4 items, 6s to look.
 * Level 2: one group, 2-7 items, 5s.
 * Level 3: two groups of different things and colors, 7s; asks about both.
 */
export function makeMemoryRound(level: Difficulty, rng: Rng = Math.random): MemoryRound {
  const id = `round-${Math.floor(rng() * 1e9).toString(36)}`;
  if (level < 3) {
    const g: SpriteGroup = {
      sprite: pick(rng, SPRITES),
      color: pick(rng, COLOR_IDS),
      count: level === 1 ? randInt(rng, 1, 4) : randInt(rng, 2, 7),
    };
    return { id, level, scene: [g], studyMs: level === 1 ? 6000 : 5000, questions: [countQuestion(rng, g, level), colorQuestion(rng, g, level)] };
  }
  const [s1, s2] = shuffle(rng, SPRITES);
  const [c1, c2] = shuffle(rng, COLOR_IDS);
  const a: SpriteGroup = { sprite: s1, color: c1, count: randInt(rng, 2, 5) };
  const b: SpriteGroup = { sprite: s2, color: c2, count: randInt(rng, 1, 4) };
  return { id, level, scene: [a, b], studyMs: 7000, questions: [countQuestion(rng, a, level), colorQuestion(rng, b, level)] };
}
