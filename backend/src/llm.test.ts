import { describe, expect, it } from 'vitest';
import { llmEnabled, llmTutorReply } from './llm';

describe('llm tutor', () => {
  it('is disabled without an API key in test env', () => {
    expect(llmEnabled).toBe(false);
  });

  it('falls back to the rule-based tutor when no key is set', async () => {
    const reply = await llmTutorReply('what is 2 + 2', 'en');
    // Rule-based math solver answers deterministically.
    expect(reply.reply).toContain('= 4');
    expect(reply.intent).toBe('math');
  });

  it('still answers in Indonesian via fallback', async () => {
    const reply = await llmTutorReply('warna pelangi', 'id');
    expect(reply.reply.length).toBeGreaterThan(0);
  });
});
