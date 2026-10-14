// Simple blips via the Web Audio API, so there are no sound files to ship.
let ctx: AudioContext | null = null;

function tone(freq: number, durationMs: number, type: OscillatorType, gain: number, delay = 0) {
  if (typeof AudioContext === 'undefined') return;
  ctx ??= new AudioContext();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(gain, start);
  vol.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(vol).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000);
}

export const sfx = {
  correct(enabled: boolean) {
    if (!enabled) return;
    tone(660, 120, 'square', 0.15);
    tone(880, 160, 'square', 0.15, 0.1);
  },
  wrong(enabled: boolean) {
    if (!enabled) return;
    tone(200, 220, 'sawtooth', 0.12);
  },
  tick(enabled: boolean) {
    if (!enabled) return;
    tone(440, 50, 'square', 0.06);
  },
  star(enabled: boolean) {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 120, 'square', 0.12, i * 0.08));
  },
};
