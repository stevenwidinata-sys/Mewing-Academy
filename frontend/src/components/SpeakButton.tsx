import { canSpeak, speak } from '../lib/speak';
import { useSettings } from '../state/settings';

export function SpeakButton({ text, small = false }: { text: string; small?: boolean }) {
  const { settings, tr } = useSettings();
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="btn btn--secondary"
      onClick={() => speak(text, settings.lang)}
      aria-label={tr('readAloud')}
      title={tr('readAloud')}
      style={{ fontSize: small ? '0.55rem' : '0.65rem', padding: small ? '0.4em 0.6em' : undefined, verticalAlign: 'middle' }}
    >
      🔊{small ? '' : ` ${tr('readAloud')}`}
    </button>
  );
}
