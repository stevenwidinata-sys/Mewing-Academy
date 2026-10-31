import { useSettings } from '../state/settings';
import { Mewy, type Mood } from './Mewy';

/** Mewy (in the chosen outfit) reacting to the child's answer. */
export function MewyBuddy({ mood, text }: { mood: Mood; text?: string }) {
  const { tr } = useSettings();
  const line = text ?? (mood === 'happy' ? tr('mewyHappy') : mood === 'sad' ? tr('mewySad') : tr('mewyThink'));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', margin: '0.5rem 0' }}>
      <span key={mood} className={mood === 'happy' ? 'pop' : undefined} style={{ display: 'inline-flex' }}>
        <Mewy size={56} mood={mood} />
      </span>
      <span className="card" aria-live="polite" style={{ padding: '0.4rem 0.8rem', fontFamily: 'var(--font-read)', fontWeight: 700 }}>
        {line}
      </span>
    </div>
  );
}
