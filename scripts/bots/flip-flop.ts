import { T } from '../../src/game/level.ts'
import { settleAt, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 13 bot: each section was solved on its own from a standstill at its first lantern, so the bot stops
// there (a breather before each flip chain). Repeated x values mean "jump again on the next landing".
// The beetle-lane roof run waits until both (synced) beetles are back at their spawns heading left.
export const JUMPS: Record<string, Jumps> = {
  A: [[16.7, 0.12], [27.31, 0.12]],
  B: [[46, 0.3], [46, 1.2], [46, 0.2]],
  B2: [[71.8, 0.3], [76.65, 0.3]],
  C: [[91.6, 0.3], [103.3, 0.12], [109.6, 0.3]],
  D: [[130.4, 0.2], [141, 0.12]],
  E: [[156.76, 0.2], [168.37, 0.12], [175.72, 0.12], [183.65, 0.7]],
  F: [[198, 0.3], [204.98, 0.12], [216.04, 0.05], [222.35, 0.12]],
  G: [[238.52, 0.3], [243.83, 0.3], [252.69, 0.12], [258.35, 0.12]],
}
const STOPS: [string, number][] = [['A', 11], ['B', 43], ['B2', 70], ['C', 89], ['D', 122], ['E', 158], ['F', 198], ['G', 233]]

export const bot = (b: Bot): Step[] => {
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed() && b.g.g === 1
  // a landing leaves you rolling and bouncing: steer back until stopped, then line up
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (b.g.ball.vx > 20 ? b.left() : b.g.ball.vx < -20 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const bug = (spawnX: number) => b.g.beetles.find((t) => Math.abs(t.sx / T - spawnX) < 1)!
  const steps: Step[] = [{ name: 'roll to the first lantern', start: b.right, until: () => b.x() >= 10 }]
  STOPS.forEach(([k, x], i) => {
    steps.push(...lineUp(k, x))
    if (k === 'D') steps.push({ name: 'D: wait for the beetles', until: () => bug(138.5).dir === -1 && Math.abs(bug(138.5).x / T - 138.5) < 0.05 })
    const next = STOPS[i + 1]?.[1]
    steps.push(timed(b, `${k}: run`, JUMPS[k], next ? () => b.x() >= next - 1.5 && b.landed() && b.g.g === 1 : () => b.g.state === 'won'))
  })
  return steps
}
