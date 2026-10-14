export type Lang = 'en' | 'id';
export type Text = Record<Lang, string>;

export type TopicId = 'counting' | 'math' | 'colors' | 'shapes' | 'animals' | 'letters' | 'memory';
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

export const TOPICS: { id: TopicId; title: Text; sprite: SpriteId; color: ColorId }[] = [
  { id: 'counting', title: { en: 'Counting', id: 'Berhitung' }, sprite: 'apple', color: 'red' },
  { id: 'math', title: { en: 'Plus & Minus', id: 'Tambah & Kurang' }, sprite: 'star', color: 'yellow' },
  { id: 'colors', title: { en: 'Colors', id: 'Warna' }, sprite: 'heart', color: 'purple' },
  { id: 'shapes', title: { en: 'Shapes', id: 'Bentuk' }, sprite: 'triangle', color: 'blue' },
  { id: 'animals', title: { en: 'Animals', id: 'Hewan' }, sprite: 'fish', color: 'orange' },
  { id: 'letters', title: { en: 'Letters', id: 'Huruf' }, sprite: 'square', color: 'green' },
];
