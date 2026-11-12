import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 25 bot. Every section starts from a standstill at its lantern (a player catching their breath), so
// the timed runs were solved and their jump windows measured on their own (scratch harness teleports there).
// Crate and beetle spots are hand-written: push, wait for the beetle, spring.
export const JUMPS: Record<string, Jumps> = {
  A: [[9.8, 0.2], [9.8, 0.12], [9.8, 0.05], [22.8, 0.12], [23, 0.05], [23.2, 0.05], [23.4, 0.12]],
  B: [[60.4, 0.7], [74.4, 0.12], [76.4, 0.12]],
  C: [[85.6, 1.2], [103.4, 1.2], [103.4, 0.12]],
  D: [],
  E: [[150.4, 0.3], [150.8, 0.12], [164.6, 0.12], [169.6, 0.12], [172.2, 0.12]],
  F: [[181.2, 1.2]],
  G: [[218.4, 0.05], [227, 0.4], [229.2, 0.05]],
  H: [[246, 1.2]],
  I: [[285.9, 1.2], [298.9, 0.12], [298.9, 0.12], [298.9, 0.05]],
  J: [[321.6, 3], [333, 0.03], [333.2, 0.08]],
  K: [[376, 0.12], [380, 0.3], [389, 0.05]],
}

export type Section = { name: string; at: number; row: number; phase: 'amber' | 'cyan'; steps: Step[] }

export const sections = (b: Bot): Section[] => {
  const g = b.g
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const steer = (tx: number) => {
    const want = Math.max(-270, Math.min(270, (tx - b.x()) * T * 4))
    if (g.ball.vx < want - 15) b.right()
    else if (g.ball.vx > want + 15) b.left()
    else b.stop()
  }
  const park = (tx: number) => {
    const d = tx - b.x()
    const want = Math.abs(d) < 0.03 ? 0 : Math.sign(d) * Math.max(20, Math.abs(d) * T * 4)
    if (g.ball.vx < want - 5) b.right()
    else if (g.ball.vx > want + 5) b.left()
    else b.stop()
  }
  // brake, then park within a few px of x (a tight park makes each section's start repeatable)
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: park`, tick: () => park(x), until: () => Math.abs(b.x() - x) < 0.04 && Math.abs(g.ball.vx) < 4 && b.landed() },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, toX: number, jumps = JUMPS[name]): Step => timed(b, `${name}: run`, jumps, () => b.x() >= toX && b.landed() && g.g === 1)
  /** Run until dropped back down at x (still falling): the next lineUp brakes in the air, before a pit. */
  const drop = (name: string, toX: number, jumps = JUMPS[name]): Step => timed(b, `${name}: run`, jumps, () => b.x() >= toX && g.g === 1)
  const box = (tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)! // crate by its start tile
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 0.6)! // beetle by its start tile
  const bx = (tx: number) => bug(tx).x / T
  const crateStill = () => Math.abs(g.ball.vx) < 3 && b.landed()
  /** Jump (hold secs) and steer to land and stop at x (or on a moving target). */
  const hopTo = (name: string, x: number, hold = 0.3, xOf?: () => number): Step => {
    let t0 = 0
    return {
      name,
      start: () => ((t0 = g.time), b.jump(hold)),
      tick: () => steer(xOf ? xOf() : x),
      until: () => g.time - t0 > 0.15 && crateStill() && Math.abs(b.x() - (xOf ? xOf() : x)) < 0.15,
    }
  }
  const onCrate = (name: string, tx: number, hold = 0.3) => hopTo(name, 0, hold, () => (box(tx).x + 15) / T)
  /** Roll into a crate until its near edge reaches x (tiles), then let go and wait for everything to stop. */
  const push = (name: string, tx: number, edge: number): Step[] => [
    { name, start: b.right, until: () => box(tx).x + 30 >= edge * T - 0.5 },
    { name: `${name}: let go`, start: b.stop, until: () => crateStill() && box(tx).vx === 0 },
  ]
  /** Push right until the crate is held up (by a beetle or a wall) for a moment. */
  const pushTillStuck = (name: string, tx: number, stall = 0.25): Step[] => {
    let last = 0
    let since = 0
    return [
      {
        name,
        start: () => ((last = -1), (since = g.time), b.right()),
        tick: () => {
          if (Math.abs(box(tx).x - last) > 0.5) [last, since] = [box(tx).x, g.time]
        },
        until: () => g.time - since > stall,
      },
      { name: `${name}: let go`, start: b.stop, until: () => crateStill() && box(tx).vx === 0 },
    ]
  }
  const letGo = () => ((g.input.jumpHeld = false), (b.hold = 0))
  const climb = (name: string, toX: number, hold = 0.4): Step => ({
    name,
    start: () => (b.right(), b.jump(hold)),
    until: () => b.landed() && b.x() > toX && (letGo(), true),
  })
  const waitBug = (name: string, tx: number, dir: 1 | -1, lo: number, hi: number): Step => ({
    name,
    until: () => bug(tx).alive && bug(tx).dir === dir && bx(tx) >= lo && bx(tx) <= hi,
  })
  const waitPen = (name: string, tx: number, r: [number, number], l: [number, number]): Step => ({
    name,
    until: () => {
      const t = bug(tx)
      const [lo, hi] = t.dir === 1 ? r : l
      return t.alive && bx(tx) >= lo && bx(tx) <= hi
    },
  })
  /** Roll (or hop) off a crate and hold jump on the way down, so landing on a beetle is a held stomp. */
  const springOff = (name: string, toX: number, hop = 0): Step => {
    let air = 0
    let phase = 0 // 0 leaving, 1 holding for the stomp, 2 bounced (rising), 3 let go
    return {
      name,
      start: () => ((phase = 0), (air = 0), b.right(), hop > 0 && b.jump(hop)),
      tick: () => {
        const vy = g.ball.vy
        air = b.landed() ? 0 : air + 1 / 120
        if (phase === 0 && air > 0.12 && vy > 0) ((phase = 1), (g.input.jumpHeld = true), (b.hold = 5))
        else if (phase === 1 && vy < -300) phase = 2
        else if (phase === 2 && vy > 0) ((phase = 3), (g.input.jumpHeld = false), (b.hold = 0))
      },
      until: () => {
        const ok = phase >= 2 && b.landed() && b.x() > toX
        if (ok) letGo()
        return ok
      },
    }
  }
  return [
    { name: 'A', at: 9, row: 12, phase: 'amber', steps: [...lineUp('A', 9), run('A', 43)] },
    {
      name: 'B',
      at: 44,
      row: 12,
      phase: 'amber',
      steps: [
        ...lineUp('B', 44),
        ...push('B: push the crate over the cyan bridge', 50, 59),
        settleAt(b, 'B: back off', 56.6),
        onCrate('B: onto the crate', 50),
        climb('B: onto the wall', 59.3),
        run('B', 83),
      ],
    },
    { name: 'C', at: 85, row: 12, phase: 'cyan', steps: [...lineUp('C', 85), run('C', 116)] },
    {
      name: 'D',
      at: 117,
      row: 12,
      phase: 'cyan',
      steps: [
        ...lineUp('D', 117),
        ...push('D: push the crate into the beetle walk', 120, 127.6),
        ...springboard(b, 'D: springboard through the curtain', 125.9, 130.5),
        run('D', 150),
      ],
    },
    { name: 'E', at: 150, row: 12, phase: 'amber', steps: [...lineUp('E', 150), drop('E', 178.5)] },
    { name: 'F', at: 180, row: 12, phase: 'amber', steps: [...lineUp('F', 180), run('F', 209)] },
    { name: 'G', at: 210, row: 12, phase: 'amber', steps: [...lineUp('G', 209), run('G', 246.5)] },
    {
      name: 'H',
      at: 247,
      row: 12,
      phase: 'amber',
      steps: [
        ...lineUp('H', 246.6),
        run('H', 250.5),
        ...lineUp('H: behind the crate', 251.2),
        ...pushTillStuck('H: push till the beetle is pinned at the edge', 252),
        onCrate('H: onto the crate', 252, 0.05),
        waitBug('H: wait until the trench beetle walks off right', 274, 1, 267, 269.5),
        { name: 'H: roll off onto the pinned beetle', tick: () => steer(269.62), until: () => !bug(259).alive },
        { name: 'H: stay on the ledge', tick: () => steer(269.62), until: crateStill },
        hopTo('H: back over the crate', 267.6, 0.05),
        { name: 'H: push the crate to the edge', start: b.right, until: () => box(252).x >= 269.75 * T },
        { name: 'H: let go', start: b.stop, until: () => crateStill() && box(252).y > 12 * T && box(252).vx === 0 },
        { name: 'H: drop onto the crate', tick: () => steer((box(252).x + 15) / T), until: () => crateStill() && b.y() > 11 && Math.abs(b.x() - (box(252).x + 15) / T) < 0.15 },
        waitPen('H: wait for the penned beetle', 274, [272.4, 273.4], [273.6, 274.6]),
        springOff('H: hop off the crate onto it, over the wall', 278.3, 0.05),
      ],
    },
    {
      name: 'I',
      at: 280,
      row: 8,
      phase: 'amber',
      steps: [...lineUp('I', 285.9), ...springboard(b, 'I: springboard into the up-light', 285.9, 290.5).slice(1), drop('I', 319.5)],
    },
    { name: 'J', at: 321, row: 12, phase: 'amber', steps: [...lineUp('J', 320.5), run('J', 348.3)] },
    {
      name: 'K',
      at: 350,
      row: 12,
      phase: 'amber',
      steps: [
        ...lineUp('K', 357.9),
        ...springboard(b, 'K: springboard through the curtain', 357.9, 362.5).slice(1),
        timed(b, 'K: run', JUMPS.K, () => g.state === 'won'),
      ],
    },
  ]
}

export const bot = (b: Bot): Step[] => [...sections(b).flatMap((s) => s.steps), { name: 'gate', start: b.right, until: () => b.g.state === 'won' }]
