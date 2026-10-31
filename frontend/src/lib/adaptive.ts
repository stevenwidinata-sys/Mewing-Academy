import type { Difficulty } from '../../../shared/types';

export interface LevelSuggestion {
  kind: 'up' | 'down' | 'stay';
  next: Difficulty;
}

/**
 * Simple adaptive-difficulty rule (keeps kids in their "just right" zone):
 * >= 80% correct -> suggest one level harder; <= 40% -> one level easier.
 */
export function suggestLevel(level: Difficulty, correct: number, total: number): LevelSuggestion {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.8 && level < 3) return { kind: 'up', next: (level + 1) as Difficulty };
  if (ratio <= 0.4 && level > 1) return { kind: 'down', next: (level - 1) as Difficulty };
  return { kind: 'stay', next: level };
}
