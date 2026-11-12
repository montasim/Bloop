import { T } from '../../src/game/level.ts'
import { settleAt, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 28 bot. Every section starts from a standstill at a lantern (as a player catching their breath), so each
// was solved, swept and its jump windows measured on its own. Repeated x values mean "jump again on the next landing".
// Shafts, bridges and chimneys are steered by hand (a player feathering left/right), not solved as timed jumps.
export const JUMPS: Record<string, Jumps> = {
  A: [[27.6, 0.05], [27.8, 0.05]],
  D1: [[125.6, 0.12]],
  D2: [[132.2, 0.3]],
  D3: [[146.8, 0.12]],
  E: [[166.6, 0.12], [174.6, 0.05], [181.6, 0.12], [188.6, 0.05], [195.6, 0.12], [202.6, 0.05]],
  J: [[406.4, 0.12], [406.6, 0.12], [406.8, 0.12]],
}

/** Sections in order; `at` is the lantern [x, y] each starts from (used to test a section on its own). */
export const sections = (b: Bot): { name: string; at: [number, number]; steps: Step[] }[] => {
  const g = b.g
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const brake = (name: string): Step => ({ name, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still })
  // a lantern stop: brake, settle on the lantern, stand still (each section was solved from exactly this state)
  // (steered, not bang-bang: rolling flat out to a far lantern would overshoot into the next light)
  const stop = (name: string, tx: number): Step[] => [
    brake(`${name}: brake`),
    { name: `${name}: settle`, tick: () => steer(tx + 0.5), until: () => Math.abs(b.x() - tx - 0.5) < 0.2 && Math.abs(g.ball.vx) < 5 && still() },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed() && g.g === 1)
  // steer so vx tracks a speed proportional to the distance left (works in the air too, just slower)
  const steer = (x: number, gain = 4) => {
    const want = Math.max(-270, Math.min(270, (x - b.x()) * T * gain))
    g.ball.vx < want - 15 ? b.right() : g.ball.vx > want + 15 ? b.left() : b.stop()
  }
  const go = (name: string, dir: 1 | -1, until: () => boolean): Step => ({ name, start: dir > 0 ? b.right : b.left, until })
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - (tx + 0.5)) < 0.6)!
  /** Stand on the roof at x, wait for the beetle below (spawn tile bx) to be where ok() says, roll off the roof's
   *  down-light and hold jump through the stomp so it bounces you up into the light above its pillar. */
  const beetleDrop = (name: string, x: number, bx: number, ok: (dir: number, off: number) => boolean, toX: number): Step[] => [
    settleAt(b, `${name}: line up on the roof`, x),
    { name: `${name}: wait for it`, start: b.stop, until: () => ok(bug(bx).dir, bug(bx).x / T - bx - 0.5) },
    {
      name: `${name}: drop and stomp`,
      start: b.right,
      tick: () => g.g === 1 && g.ball.vy > 0 && ((g.input.jumpHeld = true), (b.hold = 0.3)),
      until: () => g.g === -1 && b.landed() && b.x() > toX,
    },
  ]
  return [
    { name: 'A', at: [3, 12], steps: [run('A: fall up through the curtain, the cyan roof', JUMPS.A, 41.5)] },
    {
      name: 'B',
      at: [44, 12],
      steps: [
        ...stop('B', 44),
        go('B: up under the shelves', 1, () => g.g === -1 && b.landed() && b.x() > 55),
        { name: 'B: back left, slowly off the second shelf', tick: () => steer(49.6, 1.5), until: () => b.y() < 2 && b.landed() },
        go('B: along the ceiling and out', 1, () => b.x() > 61 && b.landed() && g.g === 1),
      ],
    },
    {
      name: 'C',
      at: [60, 3],
      steps: [
        ...stop('C', 60),
        run('C: two starlight bridges', [], 92.3),
        ...stop('C: below the high step', 92.8),
        { name: 'C: hop onto the high step', start: () => b.jump(0.4), tick: () => steer(95.3), until: () => still() && b.y() < 7 && Math.abs(b.x() - 95.3) < 0.2 },
        { name: 'C: float out to the end', tick: () => steer(101.3, 2), until: () => b.x() > 101 && Math.abs(g.ball.vx) < 10 && b.y() < 8 && g.ball.vy > 0 },
        { name: 'C: wait for the dip', tick: () => steer(101.3, 2), until: () => b.y() > 8.05 && g.ball.vy > 0 },
        go('C: out on the up-swing', 1, () => b.x() > 112.5 && b.landed() && g.g === 1),
      ],
    },
    {
      name: 'D',
      at: [113, 12],
      steps: [
        ...stop('D', 113),
        settleAt(b, 'D: line up', 117.6),
        { name: 'D: up the first chimney', tick: () => steer(120.2, 2), until: () => g.g === -1 && b.landed() && b.y() < 2 },
        timed(b, 'D: the ceiling lane', JUMPS.D1, () => g.g === 1),
        { name: 'D: down the first chimney', tick: () => steer(130.1, 3), until: () => b.landed() && b.y() > 12 },
        run('D: the low lane', JUMPS.D2, 138.5),
        go('D: run at the second chimney', 1, () => b.x() > 141.7),
        { name: 'D: up the second chimney', tick: () => steer(143, 4), until: () => g.g === -1 && b.landed() && b.y() < 2 },
        timed(b, 'D: the second ceiling lane', JUMPS.D3, () => g.g === 1),
        go('D: into the second down-shaft', 1, () => b.x() > 151.5),
        { name: 'D: down the second chimney', tick: () => steer(152.5, 5), until: () => b.landed() && b.y() > 12 },
        go('D: out', 1, () => b.x() > 155.5 && b.landed()),
      ],
    },
    { name: 'E', at: [156, 12], steps: [...stop('E', 156), timed(b, 'E: the colour roof', JUMPS.E, () => b.x() >= 209.2 && g.g === 1)] },
    {
      name: 'F',
      at: [211, 12],
      steps: [
        ...stop('F', 211),
        { name: 'F: gently up to the roof', tick: () => steer(213.6, 1.5), until: () => g.g === -1 && b.landed() && b.y() < 5 },
        ...beetleDrop('F: first beetle', 217.5, 222, (dir, off) => dir === -1 && off > -1 && off < 0.5, 224.5),
        ...beetleDrop('F: second beetle', 228.5, 233, (dir, off) => dir === -1 && off > -1 && off < 0.9, 235),
        settleAt(b, 'F: before the rest stone', 235.5),
        { name: 'F: drop onto the rest stone', start: b.right, tick: () => g.g === 1 && steer(240.2), until: () => g.g === 1 && b.landed() && b.x() > 238.5 && Math.abs(g.ball.vy) < 50 },
        { name: 'F: hop up into the light', start: () => b.jump(0.5), tick: () => steer(240.6), until: () => g.g === -1 && b.landed() },
        ...beetleDrop('F: third beetle', 242.5, 247, (dir) => dir === 1, 249),
        go('F: off the roof', 1, () => b.x() > 254.5 && b.landed() && g.g === 1),
      ],
    },
    { name: 'G', at: [255, 9], steps: [...stop('G', 255), run('G: the flip chain', [], 285.5)] },
    { name: 'G2', at: [296, 9], steps: [...stop('G2', 296), run('G2: the flip chain upside-down', [], 328.5)] },
    { name: 'H', at: [330, 9], steps: [...stop('H', 330), run('H: the prism climb', [], 352.8)] },
    { name: 'I', at: [353, 2], steps: [...stop('I', 353), run('I: the star stair', [], 380.5)] },
    {
      name: 'J',
      at: [382, 9],
      steps: [
        ...stop('J', 382),
        go('J: fall up through the curtains', 1, () => g.g === -1 && b.landed() && b.x() > 402),
        settleAt(b, 'J: steady on the cyan roof', 404.5),
        timed(b, 'J: tap over the thorns, drop to the gate', JUMPS.J, () => g.state === 'won'),
      ],
    },
  ]
}

export const bot = (b: Bot): Step[] => [
  ...sections(b).flatMap((s) => s.steps),
  { name: 'to the gate', start: b.right, until: () => b.g.state === 'won' },
]
