import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { MemoryRound, Question, TutorReply } from '../../shared/types';
import { createApp } from './app';

let server: Server;
let base: string;

beforeAll(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.close();
});

describe('API', () => {
  it('returns questions with a valid answer index', async () => {
    const res = await fetch(`${base}/api/questions?topic=math&difficulty=2&count=5`);
    expect(res.status).toBe(200);
    const { questions } = (await res.json()) as { questions: Question[] };
    expect(questions).toHaveLength(5);
    for (const q of questions) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.choices.length).toBeLessThanOrEqual(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.choices.length);
    }
  });

  it('rejects unknown topics', async () => {
    const res = await fetch(`${base}/api/questions?topic=hacking`);
    expect(res.status).toBe(400);
  });

  it('returns a memory round', async () => {
    const { round } = (await (await fetch(`${base}/api/memory?level=3`)).json()) as { round: MemoryRound };
    expect(round.scene).toHaveLength(2);
    expect(round.questions).toHaveLength(2);
  });

  it('tutor solves maths and validates input', async () => {
    const post = (body: unknown) =>
      fetch(`${base}/api/tutor`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const ok = (await (await post({ message: 'what is 3 + 4', lang: 'en' })).json()) as TutorReply;
    expect(ok.reply).toContain('= 7');
    expect((await post({ message: '' })).status).toBe(400);
    expect((await post({ message: 'a'.repeat(301) })).status).toBe(400);
  });
});
