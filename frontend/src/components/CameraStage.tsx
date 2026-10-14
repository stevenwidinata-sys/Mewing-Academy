import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../state/settings';
import { classify } from '../vision/fingers';
import { readPosture, type PostureTip } from '../vision/posture';
import { useVision, type VisionFrame } from '../vision/useVision';

const HOLD_MS = 1200; // how long a finger pose must be held to confirm

interface Props {
  choiceCount: number;
  /** Called once a pose is held long enough. */
  onConfirm: (index: number) => void;
  /** Pauses detection (e.g., while showing the result). */
  paused?: boolean;
  showPosture?: boolean;
  onHover?: (index: number | null, progress: number) => void;
}

const POSTURE_TEXT: Record<PostureTip, { en: string; id: string }> = {
  good: { en: '😺 Great posture!', id: '😺 Postur bagus!' },
  'come-closer': { en: '🔍 Come a little closer', id: '🔍 Sedikit lebih dekat' },
  center: { en: '↔️ Move to the center', id: '↔️ Geser ke tengah' },
  'chin-up': { en: '⬆️ Lift your chin a bit', id: '⬆️ Angkat dagu sedikit' },
  none: { en: '', id: '' },
};

export function CameraStage({ choiceCount, onConfirm, paused = false, showPosture = false, onHover }: Props) {
  const { settings, tr } = useSettings();
  const [raised, setRaised] = useState(0);
  const [posture, setPosture] = useState<PostureTip>('none');

  // Hold tracking lives in refs so the rAF loop doesn't re-render every frame.
  const candidate = useRef<number | null>(null);
  const holdStart = useRef(0);
  const confirmed = useRef(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) confirmed.current = false;
  }, [paused]);

  const handleFrame = useCallback(
    (frame: VisionFrame) => {
      if (showPosture) setPosture(readPosture(frame.face));
      if (pausedRef.current || confirmed.current) {
        onHover?.(null, 0);
        return;
      }
      const lm = frame.hand?.landmarks?.[0];
      const { answer, raised: r } = classify(lm, settings.fingerMode, choiceCount);
      setRaised(r);

      if (answer == null) {
        candidate.current = null;
        onHover?.(null, 0);
        return;
      }
      if (candidate.current !== answer) {
        candidate.current = answer;
        holdStart.current = performance.now();
      }
      const held = performance.now() - holdStart.current;
      const progress = Math.min(1, held / HOLD_MS);
      onHover?.(answer, progress);
      if (progress >= 1) {
        confirmed.current = true;
        candidate.current = null;
        onConfirm(answer);
      }
    },
    [choiceCount, onConfirm, onHover, settings.fingerMode, showPosture],
  );

  const { videoRef, status, start, stop } = useVision({ withFace: showPosture, onFrame: handleFrame });

  return (
    <div className="pixel-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '4 / 3', background: '#000', border: '4px solid var(--ink)' }}>
        {/* Mirror the video so raising your right hand feels natural. */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: status === 'running' ? 'block' : 'none' }}
        />
        {status !== 'running' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '1rem', fontFamily: 'var(--font-read)' }}>
            {status === 'loading' ? tr('cameraLoading') : status === 'denied' ? tr('cameraDenied') : status === 'error' ? tr('cameraDenied') : tr('answerWithHand')}
          </div>
        )}
        {status === 'running' && (
          <div aria-live="polite" style={{ position: 'absolute', left: 6, bottom: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: 'var(--font-read)', fontSize: '0.8rem', padding: '2px 8px' }}>
            {raised === 0 ? tr('showFingers') : `✋ ${raised}`}
          </div>
        )}
        {showPosture && status === 'running' && posture !== 'none' && (
          <div style={{ position: 'absolute', left: 6, top: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: 'var(--font-read)', fontSize: '0.8rem', padding: '2px 8px' }}>
            {POSTURE_TEXT[posture][settings.lang]}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {status === 'running' ? (
          <button type="button" className="btn btn--ghost" onClick={stop}>
            {tr('cameraStop')}
          </button>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={start} disabled={status === 'loading'}>
            {status === 'loading' ? tr('loading') : tr('cameraStart')}
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-read)', fontSize: '0.75rem', textAlign: 'center', margin: 0, opacity: 0.85 }}>{tr('cameraPrivacy')}</p>
    </div>
  );
}
