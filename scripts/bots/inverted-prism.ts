import { timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 14 bot: each section was solved on its own from a standstill (scripts/solve-segment.ts style search),
// so the bot brakes and lines up on the upright floor after every flip-down, the way a player catches their
// breath before the next light. Repeated or lower x values mean "jump again on the next landing".
export const SECTIONS: [string, number, number, Jumps][] = [
  // [name, line-up x, stop x (landed upright past it), jumps]
  ['A: amber road', 3, 39, [[26.4, 0.05], [27, 0.12]]],
  ['B: curtain into the light, gap swap, beetle pen', 41.5, 94, [[61.9, 0.12], [81.3, 0.3], [83.3, 0.05]]],
  ['C: cyan curtain over the gap, amber wall', 96, 125, [[111, 0.05], [116.8, 0.05]]],
  ['D: colour seams over beetles', 128, 177, [[146.2, 0.05], [165.8, 0.3], [167.8, 0.05]]],
  ['E: swap and flip in mid-air', 180, 208, [[182.4, 0.2], [199.8, 0.05]]],
  ['F: finale tube', 212, 242, [[220.8, 0.05], [227.2, 0.12]]],
  ['G: last road', 245, 999, [[262.8, 0.05]]],
]

export const bot = (b: Bot): Step[] => {
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed() && b.g.g === 1
  // a drop off the roof lands you rolling and bouncing: steer back until stopped, then line up
  // (the sections were solved from an exact standstill, so line up within 0.04 tiles, tighter than settleAt's 0.2)
  const steer = (v: number) => (b.g.ball.vx < v - 4 ? b.right() : b.g.ball.vx > v + 4 ? b.left() : b.stop())
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => steer(0), until: still },
    {
      name: `${name}: line up`,
      tick: () => (Math.abs(x - b.x()) < 0.03 ? b.stop() : steer(Math.max(-120, Math.min(120, (x - b.x()) * 160)))),
      until: () => Math.abs(b.x() - x) < 0.04 && Math.abs(b.g.ball.vx) < 3 && b.landed(),
    },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  return SECTIONS.flatMap(([name, from, stop, jumps], i) => [
    ...(i ? lineUp(name, from) : []),
    timed(b, name, jumps, () => b.g.state === 'won' || (b.x() >= stop && b.landed() && b.g.g === 1)),
  ])
}
