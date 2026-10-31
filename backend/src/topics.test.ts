import { describe, expect, it } from 'vitest';
import { MORE_TOPIC_IDS } from '../../shared/moreTopics';
import { getQuestions } from '../../shared/questions';
import { TOPICS, type Difficulty } from '../../shared/types';

describe('new topics', () => {
  it('each level offers at least 15 different questions', () => {
    for (const topic of MORE_TOPIC_IDS) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        const keys = new Set<string>();
        for (let i = 0; i < 60; i++) for (const q of getQuestions(topic, d, 10)) keys.add(q.prompt.en + (q.emoji ?? ''));
        expect(keys.size, `${topic} level ${d}`).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it('every new topic is listed with an emoji and blurb', () => {
    for (const id of MORE_TOPIC_IDS) {
      const meta = TOPICS.find((t) => t.id === id);
      expect(meta?.emoji, id).toBeTruthy();
      expect(meta?.blurb.id.length, id).toBeGreaterThan(0);
    }
  });
});
