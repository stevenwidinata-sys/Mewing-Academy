import type { Lang, Question } from '../../../shared/types';

// Read-aloud with the browser's built-in speech engine (no extra libraries).
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

const EMOJI = /\p{Extended_Pictographic}/gu;

export function speak(text: string, lang: Lang) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(EMOJI, ''));
  u.lang = lang === 'id' ? 'id-ID' : 'en-US';
  u.rate = 0.9;
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) u.voice = voice;
  synth.speak(u);
}

export function questionToSpeech(q: Question, lang: Lang): string {
  const letters = ['A', 'B', 'C', 'D'];
  return `${q.prompt[lang]} ... ${q.choices.map((c, i) => `${letters[i]}: ${c.label[lang]}`).join('. ')}`;
}
