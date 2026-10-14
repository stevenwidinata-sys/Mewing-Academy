import { describe, expect, it } from 'vitest';
import { makeMemoryRound } from '../../shared/memory';
import { getQuestions, QUIZ_TOPICS } from '../../shared/questions';
import { levenshtein, tutorReply } from '../../shared/tutor';
import type { Difficulty } from '../../shared/types';

describe('question bank', () => {
  it('every topic and level makes valid, unambiguous questions', () => {
    for (const topic of QUIZ_TOPICS) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        for (const q of getQuestions(topic, d, 30)) {
          expect(q.choices.length, `${topic} d${d}`).toBeGreaterThanOrEqual(2);
          expect(q.choices.length).toBeLessThanOrEqual(4); // only 4 fingers -> A-D
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.choices.length);
          const labels = q.choices.map((c) => c.label.en);
          expect(new Set(labels).size, `duplicate choices in ${q.prompt.en}`).toBe(labels.length);
          expect(q.prompt.id.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('subtraction never goes negative', () => {
    for (const q of getQuestions('math', 3, 200)) {
      expect(Number(q.choices[q.answer].label.en)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('memory rounds', () => {
  it('asks about what was shown', () => {
    for (const level of [1, 2, 3] as Difficulty[]) {
      const r = makeMemoryRound(level);
      const [countQ, colorQ] = r.questions;
      expect(Number(countQ.choices[countQ.answer].label.en)).toBe(r.scene[0].count);
      expect(colorQ.choices[colorQ.answer].color).toBe(r.scene[r.scene.length - 1].color);
    }
  });
});

describe('tutor', () => {
  it('solves arithmetic in both languages', () => {
    expect(tutorReply('3 + 4', 'en').reply).toContain('= 7');
    expect(tutorReply('berapa 10 kurang 3', 'id').reply).toContain('= 7');
    expect(tutorReply('6 x 7', 'en').reply).toContain('= 42');
    expect(tutorReply('5 / 0', 'en').intent).toBe('math');
  });

  it('matches intents with typos', () => {
    expect(levenshtein('elefant', 'elephant')).toBe(2);
    expect(tutorReply('tell me about the elefant', 'en').intent).toBe('animals');
    expect(tutorReply('warna pelangi apa saja?', 'id').intent).toBe('colors');
  });

  it('protects personal information', () => {
    expect(tutorReply('my address is 12 street', 'en').intent).toBe('privacy');
    expect(tutorReply('alamat rumahku di jakarta', 'id').intent).toBe('privacy');
  });

  it('falls back gracefully', () => {
    expect(tutorReply('qwzx', 'en').intent).toBe('unknown');
  });
});
