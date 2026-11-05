// A tiny 8-bit tune made with the Web Audio API (no music file to download).
// Square-wave melody + triangle bass, scheduled a little ahead so it never stutters.

const BPM = 132;
const STEP = 60 / BPM / 2; // eighth notes
// Note numbers (MIDI). 0 = rest. 16 steps per bar, 4 bars: C - Am - F - G.
const MELODY = [
  72, 0, 76, 79, 76, 0, 72, 74, 76, 0, 74, 72, 74, 0, 0, 0,
  69, 0, 72, 76, 72, 0, 69, 71, 72, 0, 71, 69, 71, 0, 0, 0,
  65, 0, 69, 72, 69, 0, 65, 67, 69, 0, 72, 74, 76, 0, 74, 0,
  67, 0, 71, 74, 71, 0, 74, 76, 79, 0, 77, 76, 74, 0, 0, 0,
];
const BASS = [48, 45, 41, 43];

const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let timer: number | undefined;
let step = 0;
let nextTime = 0;

function note(freq: number, at: number, len: number, type: OscillatorType, vol: number) {
  if (!ctx || !gain) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(gain);
  o.start(at);
  o.stop(at + len);
}

function schedule() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.3) {
    const m = MELODY[step % MELODY.length];
    if (m) note(hz(m), nextTime, STEP * 0.9, 'square', 0.05);
    if (step % 4 === 0) note(hz(BASS[Math.floor(step / 16) % BASS.length]), nextTime, STEP * 3.5, 'triangle', 0.12);
    if (step % 2 === 1) note(2400, nextTime, 0.03, 'square', 0.012); // hi-hat tick
    nextTime += STEP;
    step++;
  }
}

export const music = {
  start(volume: number) {
    if (typeof AudioContext === 'undefined') return;
    ctx ??= new AudioContext();
    void ctx.resume();
    if (!gain) {
      gain = ctx.createGain();
      gain.connect(ctx.destination);
    }
    gain.gain.value = volume;
    if (timer !== undefined) return;
    nextTime = ctx.currentTime + 0.05;
    timer = window.setInterval(schedule, 100);
  },
  stop() {
    window.clearInterval(timer);
    timer = undefined;
  },
  volume(v: number) {
    if (gain) gain.gain.value = v;
  },
};
