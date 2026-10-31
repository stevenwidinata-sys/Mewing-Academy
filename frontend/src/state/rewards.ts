import { TOPICS, type Lang, type Text, type TopicId } from '../../../shared/types';
import type { Progress } from './progress';

/**
 * Free rewards earned by learning (no purchases):
 * - Outfits: one per topic, unlocked after ITEM_UNLOCK correct answers in it.
 * - Fur colors: unlocked at total-star milestones.
 * - Badges: bronze / silver / gold per topic.
 */

export type ItemId = 'scarf' | 'glasses' | 'beret' | 'partyhat' | 'safari' | 'gradcap' | 'bow' | 'wizard';
export type FurId = 'yellow' | 'orange' | 'white' | 'gray' | 'pink' | 'black' | 'calico';
export type BadgeTier = 'bronze' | 'silver' | 'gold';

export const ITEM_UNLOCK = 5;

export const ITEMS: { id: ItemId; topic: TopicId; emoji: string; name: Text }[] = [
  { id: 'scarf', topic: 'counting', emoji: '🧣', name: { en: 'Cozy Scarf', id: 'Syal Hangat' } },
  { id: 'glasses', topic: 'math', emoji: '👓', name: { en: 'Smart Glasses', id: 'Kacamata Pintar' } },
  { id: 'beret', topic: 'colors', emoji: '🎨', name: { en: "Painter's Beret", id: 'Baret Pelukis' } },
  { id: 'partyhat', topic: 'shapes', emoji: '🥳', name: { en: 'Party Hat', id: 'Topi Pesta' } },
  { id: 'safari', topic: 'animals', emoji: '🤠', name: { en: 'Safari Hat', id: 'Topi Safari' } },
  { id: 'gradcap', topic: 'letters', emoji: '🎓', name: { en: 'Graduation Cap', id: 'Topi Wisuda' } },
  { id: 'bow', topic: 'patterns', emoji: '🎀', name: { en: 'Bow Tie', id: 'Dasi Kupu-kupu' } },
  { id: 'wizard', topic: 'memory', emoji: '🧙', name: { en: 'Wizard Hat', id: 'Topi Penyihir' } },
];

export const FURS: { id: FurId; stars: number; name: Text; main: string; shade: string; eye?: string }[] = [
  { id: 'yellow', stars: 0, name: { en: 'Sunny Yellow', id: 'Kuning Cerah' }, main: '#ffcc00', shade: '#e0a800' },
  { id: 'orange', stars: 10, name: { en: 'Tiger Orange', id: 'Oranye Harimau' }, main: '#ff9a3c', shade: '#e07a1f' },
  { id: 'white', stars: 25, name: { en: 'Snow White', id: 'Putih Salju' }, main: '#f7f3ea', shade: '#d9d2c3' },
  { id: 'gray', stars: 40, name: { en: 'Cloud Gray', id: 'Abu Awan' }, main: '#a9a9b8', shade: '#8a8a9c' },
  { id: 'pink', stars: 60, name: { en: 'Bubblegum Pink', id: 'Merah Muda' }, main: '#ff9ccf', shade: '#e77fb4' },
  { id: 'black', stars: 80, name: { en: 'Midnight Black', id: 'Hitam Malam' }, main: '#3a3550', shade: '#2a2640', eye: '#c8ff5a' },
  { id: 'calico', stars: 100, name: { en: 'Calico', id: 'Belang Tiga' }, main: '#f7f3ea', shade: '#d9d2c3' },
];

export const BADGES: { tier: BadgeTier; need: number; emoji: string }[] = [
  { tier: 'bronze', need: 5, emoji: '🥉' },
  { tier: 'silver', need: 15, emoji: '🥈' },
  { tier: 'gold', need: 30, emoji: '🥇' },
];

export const correctIn = (p: Progress, t: TopicId) => p.byTopic[t]?.correct ?? 0;

export function isItemUnlocked(p: Progress, id: ItemId): boolean {
  const it = ITEMS.find((i) => i.id === id);
  return !!it && correctIn(p, it.topic) >= ITEM_UNLOCK;
}

export function isFurUnlocked(p: Progress, id: FurId): boolean {
  return (FURS.find((f) => f.id === id)?.stars ?? Infinity) <= p.stars;
}

export function badgeFor(correct: number) {
  let best: (typeof BADGES)[number] | null = null;
  for (const b of BADGES) if (correct >= b.need) best = b;
  return best;
}

export function nextBadge(correct: number) {
  return BADGES.find((b) => correct < b.need) ?? null;
}

/** Every reward currently earned, as stable keys. New keys = new unlocks. */
export function unlockKeys(p: Progress): string[] {
  const keys: string[] = [];
  for (const it of ITEMS) if (correctIn(p, it.topic) >= ITEM_UNLOCK) keys.push(`item:${it.id}`);
  for (const f of FURS) if (f.stars > 0 && p.stars >= f.stars) keys.push(`fur:${f.id}`);
  for (const [t, s] of Object.entries(p.byTopic)) {
    for (const b of BADGES) if ((s?.correct ?? 0) >= b.need) keys.push(`badge:${t}:${b.tier}`);
  }
  return keys;
}

export function topicTitle(t: string, lang: Lang): string {
  if (t === 'memory') return lang === 'en' ? 'Memory' : 'Ingatan';
  return TOPICS.find((x) => x.id === t)?.title[lang] ?? t;
}

export function describeUnlock(key: string, lang: Lang): string {
  const [kind, a, b] = key.split(':');
  if (kind === 'item') {
    const it = ITEMS.find((i) => i.id === a);
    return it ? `${it.emoji} ${it.name[lang]}` : key;
  }
  if (kind === 'fur') {
    const f = FURS.find((x) => x.id === a);
    return f ? `🐱 ${f.name[lang]}` : key;
  }
  const badge = BADGES.find((x) => x.tier === b);
  return `${badge?.emoji ?? '🏅'} ${topicTitle(a, lang)}`;
}
