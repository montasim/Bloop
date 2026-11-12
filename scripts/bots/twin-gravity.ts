import { T } from '../../src/game/level.ts'
import { settleAt, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 23 bot. Every section starts from a standstill at a lantern, so each was solved (and its jump windows
// measured) on its own. Crate puzzles are hand-written the way a player solves them: knock the stone off from the
// roof, wait for it to land, line up, push, let go, hop. Repeated x values mean "jump again on the next landing".
export const JUMPS: Record<string, Jumps> = {
  A: [[14, 0.7]],
  C: [[66.6, 0.05], [75.9, 0.05], [75.9, 0.05]],
  D: [],
  E: [[121, 0.2], [125.1, 0.05], [125.1, 0.2], [143.55, 0.2]],
  F: [[158.9, 0.2], [168.5, 0.05], [176.2, 0.2]],
  G: [[215.3, 0.4]],
  I: [[268.2, 0.05], [273.3, 0.7]],
  J1: [[301, 0.3]],
}

/** Sections in order; `at` is the lantern each starts from (used to test a section on its own). */
export const sections = (b: Bot): { name: string; at: number; steps: Step[] }[] => {
  const g = b.g
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const box = (tx: number, ty?: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 0.6 && (ty === undefined || Math.abs(c.sy / T - ty) < 0.6))! // crate by its start tile
  const cx = (tx: number) => (box(tx).x + 15) / T // crate centre, in tiles
  const crateStill = (tx: number) => box(tx).vx === 0 && box(tx).grounded
  // roll to x and stand still there, steering the speed (bang-bang settling overshoots on short ledges)
  const standAt = (name: string, x: () => number): Step => ({
    name,
    tick: () => {
      const d = x() - b.x()
      const v = Math.abs(d) < 0.05 ? 0 : Math.max(-120, Math.min(120, d * 160))
      g.ball.vx < v - 6 ? b.right() : g.ball.vx > v + 6 ? b.left() : b.stop()
    },
    until: () => {
      const ok = still() && Math.abs(b.x() - x()) < 0.12
      if (ok) b.stop()
      return ok
    },
  })
  const brake = (name: string): Step => ({ name, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still })
  const lineUp = (name: string, x: number): Step[] => [brake(`${name}: brake`), standAt(`${name}: line up`, () => x)]
  // a lantern stop: brake, settle on the lantern, stand still (each timed run was solved from exactly this state)
  const stop = (name: string, tx: number): Step[] => [brake(`${name}: brake`), settleAt(b, `${name}: settle`, tx + 0.5), { name: `${name}: still`, start: b.stop, until: still }]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed() && g.g === 1)
  const hop = (name: string, dir: 1 | -1, hold: number, until: () => boolean): Step => ({ name, start: () => (dir > 0 ? b.right() : b.left(), b.jump(hold)), until })
  const push = (name: string, tx: number, centre: number, ty?: number): Step[] => [
    { name, start: b.right, until: () => (box(tx, ty).x + 15) / T >= centre },
    { name: `${name}: let go`, start: b.stop, until: () => still() && box(tx, ty).vx === 0 && box(tx, ty).grounded },
  ]
  /** Ride the roof into a perched stone and keep rolling until you are back down past x. */
  const knock = (name: string, tx: number, downX: number): Step[] => [
    { name, start: b.right, until: () => b.x() > downX && g.g === 1 && b.landed() && b.y() > 11 },
    { name: `${name}: stone lands`, until: () => crateStill(tx) && box(tx).y > box(tx).sy + T / 2 },
  ]
  // steer so vx tracks a speed proportional to the distance left (a player finessing a landing)
  const steer = (x: number) => {
    const want = Math.max(-270, Math.min(270, (x - b.x()) * T * 4))
    g.ball.vx < want - 15 ? b.right() : g.ball.vx > want + 15 ? b.left() : b.stop()
  }
  /** Hop onto the middle of a crate and stop there. */
  const onCrate = (name: string, tx: number, hold = 0.3): Step => {
    let t0 = 0
    return {
      name,
      start: () => ((t0 = g.time), b.jump(hold)),
      tick: () => steer(cx(tx)),
      until: () => g.time - t0 > 0.15 && still() && b.y() < 12.2 && Math.abs(b.x() - cx(tx)) < 0.15,
    }
  }
  /** Roll left over a crate (hop it when close) to stand behind it at x, or closer if the crate sits further left. */
  const behind = (name: string, tx: number, x0: number, hold = 0.12): Step[] => {
    const x = () => Math.min(x0, cx(tx) - 1.25)
    return [
      {
        name,
        tick: () => {
          steer(x())
          const d = b.x() - cx(tx)
          if (b.landed() && b.y() > 12.2 && d > 0.4 && d < 1.4) b.jump(hold)
        },
        until: () => b.landed() && Math.abs(b.x() - x()) < 0.3 && b.y() > 12.2,
      },
      brake(`${name}: brake`),
      standAt(`${name}: line up`, x),
    ]
  }
  /** From a standstill, jump straight up into an up-light, then roll right along the roof until back down past x. */
  const upLight = (name: string, toX: number): Step => ({
    name,
    start: () => (b.stop(), b.jump(0.3)),
    tick: () => g.g === -1 && b.y() < 7.5 && b.right(),
    until: () => b.x() > toX && g.g === 1 && b.landed() && b.y() > 11,
  })
  return [
    { name: 'A', at: 3, steps: [run('A: up over the thorn pit', JUMPS.A, 27.5)] },
    {
      name: 'B',
      at: 28,
      steps: [
        ...stop('B', 28),
        ...knock('B: ride the roof into the stone', 40, 45),
        ...behind('B: behind the stone', 40, 43.6, 0.2),
        ...push('B: stone to the wall', 40, 48.5),
        ...lineUp('B: back off', 46.8),
        onCrate('B: onto the stone', 40, 0.2),
        hop('B: climb', 1, 0.45, () => b.landed() && b.y() < 9 && b.x() > 49.3),
        run('B: off the wall', [], 55),
      ],
    },
    { name: 'C', at: 56, steps: [...stop('C', 56), run('C: ping-pong tube', JUMPS.C, 89.5)] },
    { name: 'D', at: 92, steps: [...stop('D', 92), run('D: knock the stone down the chute, follow it', JUMPS.D, 114.5)] },
    { name: 'E', at: 118, steps: [...stop('E', 118), run('E: shaft, ceiling, stone down the hole', JUMPS.E, 154.5)] },
    { name: 'F', at: 155, steps: [...stop('F', 155), run('F: flip-flop over the pit', JUMPS.F, 188.5)] },
    { name: 'G', at: 189, steps: [...stop('G', 189), run('G: the stacks', JUMPS.G, 223.5)] },
    {
      name: 'H',
      at: 227,
      steps: [
        ...stop('H', 227),
        ...push('H: crate under the first light', 231, 237.5),
        ...lineUp('H: behind the crate', 236),
        onCrate('H: onto the crate', 231, 0.2),
        upLight('H: up into the light, knock the stone', 249.5),
        { name: 'H: stone lands', until: () => crateStill(244) && box(244).y > 10 * T },
        ...behind('H: behind the stone', 244, 245.6, 0.2),
        ...push('H: stone under the second light', 244, 254.5),
        ...lineUp('H: behind it', 253),
        onCrate('H: onto the stone', 244, 0.2),
        upLight('H: up into the second light', 262.5),
      ],
    },
    { name: 'I', at: 264, steps: [...stop('I', 264), run('I: thorn hall', JUMPS.I, 295.5)] },
    { name: 'J1', at: 301, steps: [...stop('J1', 301), run('J1: chute, tunnel crate', JUMPS.J1, 328.5)] },
    {
      name: 'J2',
      at: 329,
      steps: [
        ...stop('J2', 329),
        ...knock('J2: knock the first stone into the pen', 336, 340.5),
        ...behind('J2: behind the stone', 336, 337.6),
        ...push('J2: stone to the wall', 336, 349.5),
        ...lineUp('J2: under the hanging light', 345.5),
        { name: 'J2: hop into the light', start: () => (b.stop(), b.jump(0.3)), until: () => g.g === -1 && b.landed() },
        { name: 'J2: ride into the second stone', start: b.right, until: () => g.g === 1 && b.landed() && b.y() < 11.5 },
        { name: 'J2: second stone lands', until: () => crateStill(348) && box(348).y > 10 * T },
        { name: 'J2: land on the stack', tick: () => (b.y() < 11.2 ? steer(cx(348)) : b.stop()), until: () => still() && b.y() < 11 },
        standAt('J2: on the stack', () => cx(348)),
        hop('J2: climb', 1, 0.45, () => b.landed() && b.y() < 8 && b.x() > 350.3),
        run('J2: off the wall', [], 356.5),
      ],
    },
  ]
}

export const bot = (b: Bot): Step[] => [
  ...sections(b).flatMap((s) => s.steps),
  { name: 'to the gate', start: b.right, until: () => b.g.state === 'won' },
]
