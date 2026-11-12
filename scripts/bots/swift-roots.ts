import { jumpsBot } from '../bot.ts'

// Level 26 bot: one unbroken roll from start to gate (never stops at a lantern), the way the level is meant
// to be played. Solved left to right with a snapshot search that, per jump, picked the hold and trigger x with
// the widest press window (frames early/late, buffer and coyote aware); every jump fires on a landing.
// Holds of 1.2 s / 5 s are held bounce lines (re-jump on every contact): B's posts, roof rides, the finale.
export const bot = jumpsBot([
  [13.9, 0.12], [16.4, 0.12], [20.8, 1.2], [29.7, 5], // A: stride pits
  [39.7, 0.08], [44.5, 1.2], [53.1, 5], // B: held bounce line over the thorn bed
  [72.7, 0.03], [82.4, 0.05], [85.2, 0.08], [87.8, 0.12], [92.4, 0.05], [96.7, 0.12], // C: colour stride
  [120.6, 0.3], [125.9, 0.12], [131.6, 1.2], // D: roof ride
  [142.5, 1.2], [153, 0.12], [157.6, 1.2], [174.9, 0.12], // E: the ridge
  [184.5, 0.3], // F: stomp chain up to the shelf (the stomps bounce you on)
  [226.2, 0.12], [228.7, 0.12], [237.5, 0.08], [240, 0.12], [244.6, 0.12], // G: thorny burrow
  [254.6, 5], [279.6, 0.08], [284.4, 1.2], // H: hanging up-light, gapped roof
  [300.4, 1.2], [311.6, 0.03], [316, 1.2], [321.2, 0.12], [326.6, 1.2], // I: long and short leaps
  [348.4, 1.2], // J: colour roof
  [368.6, 5], // K: held colour bounce line into the gate
])
