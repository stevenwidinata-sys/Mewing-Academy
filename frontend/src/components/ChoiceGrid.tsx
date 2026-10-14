import type { Choice } from '../../../shared/types';
import { useSettings } from '../state/settings';
import { ColorSwatch } from './Sprite';

const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  choices: Choice[];
  /** Which choice the camera is currently "hovering" (0..3) or null. */
  hovered?: number | null;
  /** 0..1 fill of the hold-to-confirm bar on the hovered choice. */
  holdProgress?: number;
  /** Set after an answer: the chosen index. */
  picked?: number | null;
  /** The correct index, revealed after picking. */
  answer?: number;
  onPick: (index: number) => void;
  disabled?: boolean;
}

export function ChoiceGrid({ choices, hovered, holdProgress = 0, picked, answer, onPick, disabled }: Props) {
  const { settings } = useSettings();
  const revealed = picked != null && answer != null;

  return (
    <div
      role="group"
      aria-label="Answer choices"
      style={{ display: 'grid', gridTemplateColumns: choices.length > 2 ? '1fr 1fr' : '1fr', gap: '1rem', maxWidth: 640, margin: '0 auto', width: '100%' }}
    >
      {choices.map((c, i) => {
        const isHover = hovered === i && !revealed;
        const isPicked = picked === i;
        const isCorrect = revealed && i === answer;
        const isWrong = revealed && isPicked && i !== answer;
        const bg = isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : isHover ? 'var(--cyan)' : 'var(--yellow)';
        return (
          <button
            key={i}
            type="button"
            className="btn"
            onClick={() => !disabled && !revealed && onPick(i)}
            disabled={disabled || revealed}
            aria-pressed={isPicked}
            style={{ background: bg, position: 'relative', overflow: 'hidden', fontSize: '1rem', padding: '1.2em 1em', minHeight: 72 }}
          >
            {/* hold-to-confirm fill */}
            {isHover && holdProgress > 0 && !settings.reduceMotion && (
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', transformOrigin: 'left', transform: `scaleX(${holdProgress})`, transition: 'transform 0.05s linear' }} />
            )}
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <strong style={{ fontFamily: 'var(--font-pixel)', marginRight: 8 }}>{LETTERS[i]}</strong>
              {c.color && <ColorSwatch color={c.color} />}
              <span style={{ fontFamily: 'var(--font-read)', fontWeight: 700 }}>{c.label[settings.lang]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { LETTERS };
