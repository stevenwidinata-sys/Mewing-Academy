import express, { type Request, type Response } from 'express';
import { makeMemoryRound } from '../../shared/memory';
import { getQuestions, isQuizTopic } from '../../shared/questions';
import { MAX_MESSAGE_LENGTH, tutorReply } from '../../shared/tutor';
import type { Difficulty, Lang } from '../../shared/types';

const toDifficulty = (v: unknown): Difficulty => (v === '2' ? 2 : v === '3' ? 3 : 1);
const toCount = (v: unknown) => Math.min(20, Math.max(1, Number(v) || 5));

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/questions', (req: Request, res: Response) => {
    const { topic, difficulty, count } = req.query;
    if (!isQuizTopic(topic)) {
      res.status(400).json({ error: 'Unknown topic' });
      return;
    }
    res.json({ questions: getQuestions(topic, toDifficulty(difficulty), toCount(count)) });
  });

  app.get('/api/memory', (req, res) => {
    res.json({ round: makeMemoryRound(toDifficulty(req.query.level)) });
  });

  app.post('/api/tutor', (req, res) => {
    const { message, lang } = (req.body ?? {}) as { message?: unknown; lang?: unknown };
    if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: `message must be 1-${MAX_MESSAGE_LENGTH} characters` });
      return;
    }
    const l: Lang = lang === 'id' ? 'id' : 'en';
    res.json(tutorReply(message, l));
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
