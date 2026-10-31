import type { Difficulty } from '../../../shared/types';
import { suggestLevel } from '../lib/adaptive';
import { useSettings } from '../state/settings';
import { Mewy } from './Mewy';

/** After a round, Mewy suggests a harder or easier level based on the score. */
export function AdaptiveTip({ level, correct, total, onGo }: { level: Difficulty; correct: number; total: number; onGo: (d: Difficulty) => void }) {
  const { tr } = useSettings();
  const s = suggestLevel(level, correct, total);
  const names: Record<Difficulty, string> = { 1: tr('easy'), 2: tr('medium'), 3: tr('hard') };
  const msg = s.kind === 'up' ? tr('adaptUp') : s.kind === 'down' ? tr('adaptDown') : tr('adaptStay');
  return (
    <div className="card" style={{ maxWidth: 560, margin: '1rem auto', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Mewy size={44} mood={s.kind === 'down' ? 'think' : 'happy'} />
      <span style={{ fontFamily: 'var(--font-read)', fontWeight: 700 }}>🤖 {msg}</span>
      {s.kind !== 'stay' && (
        <button type="button" className="btn" onClick={() => onGo(s.next)}>
          {tr('adaptGo')} {'⭐'.repeat(s.next)} {names[s.next]}
        </button>
      )}
    </div>
  );
}
