import type { Difficulty } from '../../../shared/types';
import { useSettings } from '../state/settings';

export function LevelPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  const { tr } = useSettings();
  const levels: { d: Difficulty; key: 'easy' | 'medium' | 'hard' }[] = [
    { d: 1, key: 'easy' },
    { d: 2, key: 'medium' },
    { d: 3, key: 'hard' },
  ];
  return (
    <div role="group" aria-label={tr('level')} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {levels.map(({ d, key }) => (
        <button
          key={d}
          type="button"
          className="btn"
          aria-pressed={value === d}
          onClick={() => onChange(d)}
          style={{ background: value === d ? 'var(--pink)' : 'var(--panel-light)', color: value === d ? 'var(--ink)' : 'var(--white)', fontSize: '0.7rem' }}
        >
          {'⭐'.repeat(d)} {tr(key)}
        </button>
      ))}
    </div>
  );
}
