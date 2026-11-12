import { springboard, settleAt, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 15 bot: each section was solved on its own (from a standstill at its lantern) and its jump
// windows measured, so the bot stops and lines up at those lanterns, the way a player catches their breath.
export const JUMPS: Record<string, Jumps> = {
  A: [[25.6, 0.12], [25.8, 0.12], [26, 0.12]],
  B: [[64.8, 0.12]],
  C: [[91.9, 1.2], [104.9, 0.12], [104.9, 0.12], [104.9, 0.05]],
  D: [[148.7, 0.12], [153.4, 0.12], [158, 0.05]],
  E: [[165, 1.2], [176.4, 0.12], [185.6, 0.12], [185.8, 0.12]],
  F: [[213, 0.05], [223, 0.2], [235, 0.05], [243.5, 0.05]],
  H: [[271, 0.12], [275, 0.3], [284, 0.05]],
}

export const bot = (b: Bot): Step[] => {
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed() && b.g.g === 1
  // a drop off the roof lands you rolling and bouncing: brake, then line up and stand still
  // (steer only above 40 px/s and let friction finish: steering at ±5 can chatter forever)
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (b.g.ball.vx > 40 ? b.left() : b.g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed() && b.g.g === 1)
  return [
    run('A: flip chain over the thorn pit', JUMPS.A, 48.5),
    ...lineUp('B', 48.5),
    run('B: up, hop, down, up', JUMPS.B, 87),
    ...lineUp('C', 91.9),
    ...springboard(b, 'C: springboard into the up-light', 91.9, 96.5).slice(1),
    run('C: roof over the beetle beam', JUMPS.C, 130),
    ...lineUp('D', 132),
    run('D: colour roads', JUMPS.D, 166),
    ...lineUp('E', 164),
    run('E: zipper tube', JUMPS.E, 202),
    ...lineUp('F', 202),
    run('F: thorn hall', JUMPS.F, 251),
    ...lineUp('H', 252.9),
    ...springboard(b, 'H: springboard through the curtain', 252.9, 257.5).slice(1),
    timed(b, 'H: cyan road to the gate', JUMPS.H, () => b.g.state === 'won'),
  ]
}
