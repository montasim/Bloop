import { settleAt, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 22 bot: each section was solved on its own from a standstill at its lantern and its jump windows
// measured, so the bot stops and lines up at those lanterns. Repeated x values = hop again on the next landing.
// Beetles here sit on 1-wide stones and cannot walk off, so the stomp chains need no waiting.
export const JUMPS: Record<string, Jumps> = {
  A: [[10.6, 0.2], [16, 0.12], [20, 0.05], [24, 0.12], [29, 0.05], [33, 0.12]],
  B: [[43.2, 0.12], [43.2, 0.12], [43.2, 0.05], [43.2, 0.05], [43.2, 0.12]],
  C: [[68.2, 1.2], [81.2, 0.12], [81.8, 0.12], [87.4, 0.05]],
  D: [[95.2, 3]], // one jump held through the chain: every stomp is a held (long) bounce
  E: [[123.6, 1.2], [129.6, 1.2], [142.4, 0.05]],
  F: [[163, 0.05], [173, 0.2], [185, 0.05], [193.5, 0.05]],
  G: [[203.6, 0.2], [205.2, 0.16], [212, 0.05], [213, 0.2], [225.4, 0.03]],
  H: [[236.6, 0.08], [240, 0.08], [244, 0.05], [250, 0.08], [253, 0.03], [257, 0.05]],
  I: [[265, 3]],
  J: [[292.6, 3], [304, 0.03], [304.2, 0.08]],
  K: [[323.8, 0.3], [331.8, 0.2], [334.4, 0.08], [337.4, 0.08], [337.6, 0.08], [354.8, 0.16]],
}

export const bot = (b: Bot): Step[] => {
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed() && b.g.g === 1
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (b.g.ball.vx > 40 ? b.left() : b.g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x + 0.5),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  // run a section from its lantern; stop once landed on the flat rock before the next one
  const run = (name: string, toX: number) => timed(b, `${name}: run`, JUMPS[name], () => b.x() >= toX && b.landed() && b.g.g === 1)
  return [
    run('A', 36.3),
    ...lineUp('B', 38),
    run('B', 64),
    ...lineUp('C', 64),
    run('C', 91.3),
    ...lineUp('D', 93),
    run('D', 119.3),
    ...lineUp('E', 121),
    run('E', 149.3),
    ...lineUp('F', 151),
    run('F', 202),
    ...lineUp('G', 202),
    run('G', 231.3),
    ...lineUp('H', 233),
    run('H', 261.3),
    ...lineUp('I', 263),
    run('I', 289.3),
    ...lineUp('J', 291),
    run('J', 319.3),
    ...lineUp('K', 321),
    timed(b, 'K: run', JUMPS.K, () => b.g.state === 'won'),
  ]
}
