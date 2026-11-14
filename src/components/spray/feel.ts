// The feel of a flick: a short paper "fwip" and a tap of the phone's motor.
// The sound is made on the spot (filtered noise), so there's nothing to load.

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** The sound of a note leaving the hand; pitch varies a little each time. */
export function fwip(strength = 1) {
  const a = audio();
  if (!a || !noise) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noise;
  const band = a.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.4;
  const top = 2600 + Math.random() * 900;
  band.frequency.setValueAtTime(top, t);
  band.frequency.exponentialRampToValueAtTime(520, t + 0.16);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22 * strength, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  src.connect(band).connect(gain).connect(a.destination);
  src.start(t);
  src.stop(t + 0.2);
}

export function tap(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Not every phone allows it.
  }
}

/** Wakes the sound up inside the first touch, as phones require. */
export const primeSound = () => void audio();
