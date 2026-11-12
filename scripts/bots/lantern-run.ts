import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 10 bot. Timed segments solved with scripts/solve-segment.ts; hand-written stops where a
// player would stop and think: before the trap bridge, before each corridor beetle, the springboard,
// the ledge stomp, and the last beetle bridge (waits use narrow beetle-position bands, so arrival time doesn't matter).
const JA: Jumps = [[5.2, 0.05], [15.2, 0.12], [24, 0.12], [33, 0.2]]
const JB: Jumps = [[40.8, 0.05], [46.8, 0.05], [53, 0.05]] // hop, hop, hop: taps under the thorn roof
const JCD: Jumps = [[63.4, 1.2], [76.6, 0.7], [89.2, 0.12], [97.4, 0.2]]

export const bot = (b: Bot): Step[] => {
  const bug = (spawnX: number) => b.g.beetles.find((t) => Math.abs(t.sx / T - spawnX) < 1)!
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed()
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, start: b.stop, until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const ledge = () => bug(168.5)
  let t0 = 0
  return [
    timed(b, 'A: gapped bridge under thorns', JA, () => b.x() >= 37 && b.landed()),
    settleAt(b, 'B: stop before the trap bridge', 38),
    timed(b, 'B: hop, hop, hop', JB, () => b.x() >= 57 && b.landed()),
    timed(b, 'C-D: roof, tower, stair', JCD, () => b.x() >= 105 && b.landed()),
    ...lineUp('E: corridor', 115.2),
    { name: 'E: wait for the first beetle', until: () => bug(119.5).dir === -1 && bug(119.5).x / T > 121 && bug(119.5).x / T < 121.6 },
    timed(b, 'E: over the beetle and the trap', [[119.2, 0.7]], () => b.x() >= 126 && b.landed()),
    ...lineUp('E: past the trap', 127),
    { name: 'E: wait for the second beetle', until: () => bug(132.5).dir === -1 && bug(132.5).x / T > 131.4 && bug(132.5).x / T < 132 },
    timed(b, 'E: over the second beetle', [[128.6, 0.7]], () => b.x() >= 136 && b.landed()),
    ...lineUp('E: before the amber pen', 136.8),
    { name: 'E: wait for the third beetle', until: () => bug(142.5).dir === -1 && bug(142.5).x / T > 141.4 && bug(142.5).x / T < 142 },
    timed(b, 'E: over the third beetle', [[137, 1.2]], () => b.x() >= 147 && b.landed()),
    ...lineUp('F: springboard', 148.9),
    ...springboard(b, 'F: springboard', 148.9, 153.5).slice(1),
    ...lineUp('F: cyan ledge', 160.8),
    { name: 'F: wait for the ledge beetle', until: () => ledge().alive && ledge().dir === -1 && ledge().x / T > 165.7 && ledge().x / T < 166.8 },
    { name: 'F: stomp through the amber band', start: () => (b.right(), b.jump(1.2)), until: () => b.landed() && b.x() > 163 && b.y() < 6 },
    timed(b, 'G: stair down', [[181.2, 0.12], [189.4, 0.3], [195, 0.05]], () => b.x() >= 203 && b.landed()),
    ...lineUp('H: before the beetle bridge', 206.5),
    // measured: with the beetle heading left at 215, a 0.12 s hop 0.36-0.7 s after rolling off clears it
    { name: 'H: wait for the bridge beetle', until: () => bug(214.5).dir === -1 && Math.abs(bug(214.5).x / T - 215) < 0.1 },
    { name: 'H: roll, then hop the beetle', start: () => ((t0 = b.g.time), b.right()), tick: () => void (t0 && b.g.time - t0 > 0.53 && (b.jump(0.12), (t0 = 0))), until: () => b.g.state === 'won' },
  ]
}
