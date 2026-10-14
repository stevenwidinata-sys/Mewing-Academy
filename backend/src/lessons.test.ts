import { describe, expect, it } from 'vitest';
import { getLessons, LESSONS, type LessonTopic } from '../../shared/lessons';
import { QUIZ_TOPICS } from '../../shared/questions';

describe('lessons', () => {
  it('has at least 3 modules for every quiz topic, with bilingual content', () => {
    for (const topic of QUIZ_TOPICS) {
      const modules = getLessons(topic as LessonTopic);
      expect(modules.length, topic).toBeGreaterThanOrEqual(3);
      for (const m of modules) {
        expect(m.title.en.length).toBeGreaterThan(0);
        expect(m.title.id.length).toBeGreaterThan(0);
        expect(m.goal.en.length).toBeGreaterThan(0);
        expect(m.steps.length).toBeGreaterThanOrEqual(1);
        for (const s of m.steps) {
          expect(s.text.en.length).toBeGreaterThan(0);
          expect(s.text.id.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('covers exactly the six quiz topics', () => {
    expect(Object.keys(LESSONS).sort()).toEqual([...QUIZ_TOPICS].sort());
  });
});
