import { tutorReply } from '../../shared/tutor';
import type { Lang, TutorReply } from '../../shared/types';

/**
 * Optional real-LLM tutor. If MEWING_LLM_API_KEY is set, we call an
 * OpenAI-compatible chat endpoint with a strict kid-safe system prompt and a
 * short timeout. On any problem (no key, network error, unsafe/empty reply) we
 * fall back to the deterministic rule-based tutor in shared/tutor.ts, so the
 * app is always safe and always works.
 */

const API_KEY = process.env.MEWING_LLM_API_KEY;
// Defaults target OpenAI; override for Azure/OpenRouter/local servers.
const BASE_URL = process.env.MEWING_LLM_BASE_URL ?? 'https://api.openai.com/v1';
const MODEL = process.env.MEWING_LLM_MODEL ?? 'gpt-4o-mini';
const TIMEOUT_MS = 6000;
const MAX_REPLY_CHARS = 400;

export const llmEnabled = Boolean(API_KEY);

const SYSTEM_PROMPT = `You are "Mewy", a warm, patient cartoon-cat tutor for children UNDER 10 in an app called Mewing Academy.

RULES (never break these):
- Audience is young children. Use very simple words and short sentences (1-3 sentences). Be cheerful and encouraging.
- Only help with kid topics: counting, basic math (add/subtract/simple multiply), colors, shapes, animals, letters, plants, space, and how to use the app.
- If asked about anything scary, violent, romantic, political, medical, or otherwise not for young kids, gently say it is not something you can help with and steer back to learning.
- NEVER ask for or repeat personal information (full name, address, school, phone, passwords). If the child shares any, remind them kindly not to share it online and to tell a trusted grown-up.
- No links, no code, no emojis spam (at most one emoji). Do not pretend to be a real person.
- Reply ONLY in the requested language.`;

interface ChatChoice {
  message?: { content?: string };
}
interface ChatResponse {
  choices?: ChatChoice[];
}

// Light post-filter: block replies that leak unsafe content despite the prompt.
const UNSAFE_RE = /\b(kill|gun|sex|suicide|drug|http|www\.|password)\b/i;

function sanitize(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_REPLY_CHARS * 2) return null;
  if (UNSAFE_RE.test(trimmed)) return null;
  return trimmed.slice(0, MAX_REPLY_CHARS);
}

export async function llmTutorReply(message: string, lang: Lang): Promise<TutorReply> {
  if (!API_KEY) return tutorReply(message, lang);

  const langName = lang === 'id' ? 'Bahasa Indonesia' : 'English';
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 160,
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nReply in: ${langName}.` },
          { role: 'user', content: message.slice(0, 300) },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
    const data = (await res.json()) as ChatResponse;
    const raw = data.choices?.[0]?.message?.content ?? '';
    const safe = sanitize(raw);
    if (!safe) throw new Error('empty or unsafe reply');
    return { reply: safe, intent: 'llm', confidence: 0.9 };
  } catch (err) {
    console.warn('[tutor] LLM fallback:', err instanceof Error ? err.message : err);
    return tutorReply(message, lang);
  }
}
