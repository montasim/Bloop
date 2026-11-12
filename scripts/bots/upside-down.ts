import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 11 bot: each roof section was solved on its own (scripts/solve-segment.ts from a standstill at
// its lantern), so the bot stops at those lanterns, the way a player catches their breath before a flip.
// The springboard before the high up-light waits for the beetle (shared springboard step).
export const JUMPS: Record<string, Jumps> = {
  B: [[63.4, 0.2], [68.4, 0.12], [73.6, 0.05]],
  C: [[86.6, 0.5], [95, 0.12]],
  D: [[119.8, 0.12]],
  E: [[154.6, 0.2], [162.6, 0.05], [168, 0.12]],
  F: [[199, 0.05]],
  G: [[214.6, 0.05], [216.2, 0.5], [233.2, 0.05]],
}

export const bot = (b: Bot): Step[] => {
  const bug = (spawnX: number) => b.g.beetles.find((t) => Math.abs(t.sx / T - spawnX) < 1)!
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed() && b.g.g === 1
  // a drop off the roof lands you rolling and bouncing: steer back until stopped, then line up
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (b.g.ball.vx > 5 ? b.left() : b.g.ball.vx < -5 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed() && b.g.g === 1)
  return [
    timed(b, 'A: intro', [], () => b.x() >= 44 && b.landed() && b.g.g === 1),
    ...lineUp('B', 44),
    run('B: trap light, roof thorns over the beetle', JUMPS.B, 84),
    ...lineUp('C', 84),
    // grab the mote over the lantern, steer back and stop there: rolling in fresh, the flip lands on the mote at 113
    // (coming in at full speed off the jump, the roof landing now bounces right over it)
    timed(b, 'C: mid-air flip', JUMPS.C, () => b.x() >= 106.5 && b.g.g === 1),
    ...lineUp('D', 105),
    run('D: colours', JUMPS.D, 132),
    ...lineUp('E', 139.9),
    ...springboard(b, 'E: springboard', 139.9, 144.5).slice(1),
    run('E: roof', JUMPS.E, 178),
    ...lineUp('F', 178),
    run('F: up-down-up', JUMPS.F, 214),
    ...lineUp('G', 214),
    // let the penned beetle walk to the far end of its ledge, then hop onto the bump and leap over it
    { name: 'G: wait for the beetle', until: () => bug(218.5).dir === 1 && bug(218.5).x / T > 220 },
    timed(b, 'G: finale', JUMPS.G, () => b.g.state === 'won'),
  ]
}
