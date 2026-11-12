import { T } from '../../src/game/level.ts'
import { settleAt, type Bot, type Step } from '../bot.ts'

// Level 30 bot. Like a player catching their breath, it stops on every lantern and runs the next leg from a
// standstill: exactly where a respawn puts you, so every leg doubles as that lantern's restart proof.
// A jump is [x, hold secs] (fires on the ground once past x) or [x, hold, 1] (a press in the air once past x,
// e.g. a held stomp). PRE holds hand-written steps (springboards, crate pushes, the stomp chain) that run first.
// Legs were solved (scratch tools) so they also succeed starting 0.1 tile either side of the lantern.

/** Save points in order: the start, then every lantern (x in tiles, tile centre). */
export const saves = (g: Bot['g']) => [g.level.start.x / T, ...g.level.checkpoints.map((c) => c.x / T)].sort((a, c) => a - c)

const bug = (g: Bot['g'], tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 0.6)!

/** Standard pen springboard (bump, beetle, bump, gap, wall): stand at x, wait for the beetle, spring with jump held
 *  (let go once the up-light catches you) and stop once on the roof. */
const upSpring = (x: number, tx: number) => (b: Bot): Step[] => {
  const g = b.g
  const off = () => bug(g, tx).x / T - tx - 0.5
  return [
    settleAt(b, 'springboard: stand', x),
    { name: 'springboard: wait for the beetle', start: b.stop, until: () => (bug(g, tx).dir === -1 && off() > 1 && off() < 1.75) || (bug(g, tx).dir === 1 && off() > -1 && off() < -0.25) },
    {
      name: 'springboard: spring',
      start: () => (b.right(), b.jump(1.2)),
      tick: () => g.g === -1 && ((g.input.jumpHeld = false), (b.hold = 0)),
      until: () => g.g === -1 && b.landed(),
    },
  ]
}

const box = (g: Bot['g'], tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)!
const still = (b: Bot) => Math.abs(b.g.ball.vx) < 3 && b.landed()
/** Steer so vx tracks a speed proportional to the distance left (works in the air too, just slower). */
const steer = (b: Bot, x: number, gain = 4) => {
  const g = b.g
  const want = Math.max(-270, Math.min(270, (x - b.x()) * T * gain))
  g.ball.vx < want - 15 ? b.right() : g.ball.vx > want + 15 ? b.left() : b.stop()
}
/** Push crate (start tile tx) along until it stops against something, then let go (it may start part way). */
const pushHome = (b: Bot, name: string, tx: number, dir: 1 | -1 = 1): Step[] => {
  let last = -1
  let since = 0
  let moved = false
  const c = () => box(b.g, tx)
  return [
    {
      name,
      start: () => ((last = c().x), (moved = false), dir > 0 ? b.right() : b.left()),
      tick: () => {
        if (Math.abs(c().x - last) > 0.5) [last, since, moved] = [c().x, b.g.time, true]
      },
      until: () => moved && b.g.time - since > 0.3, // it moved, then stopped against something
    },
    { name: name + ': let go', start: () => (b.stop(), (since = b.g.time)), until: () => c().vx === 0 && (still(b) || b.g.time - since > 0.6) }, // (a ball sitting in a dip never quite stops)
  ]
}
/** Jump (hold secs) and steer to land and stop at x (or on the crate's top when x is a function). */
const hopTo = (b: Bot, name: string, x: number | (() => number), hold = 0.3): Step => {
  let t0 = 0
  const at = () => (typeof x === 'number' ? x : x())
  return { name, start: () => ((t0 = b.g.time), b.jump(hold)), tick: () => steer(b, at()), until: () => b.g.time - t0 > 0.15 && still(b) && Math.abs(b.x() - at()) < 0.15 }
}
const onBox = (b: Bot, tx: number) => () => (box(b.g, tx).x + 15) / T
/** Jump up from rest (steering to x) until an up-light catches you and you land on the roof. */
const upTo = (b: Bot, name: string, x: number, hold = 1.2): Step => ({
  name,
  start: () => b.jump(hold),
  tick: () => (steer(b, x), b.g.g === -1 && ((b.g.input.jumpHeld = false), (b.hold = 0))),
  until: () => b.g.g === -1 && b.landed(),
})

/** A stomp chain, aimed like a player would: hop off, then steer onto each beetle in turn, holding jump through
 *  the stomps listed as held; finally steer to land at x. */
const stompChain = (jx: number, tiles: number[], held: boolean[], x: number) => (b: Bot): Step[] => [
  { name: 'stomp chain: run up', start: b.right, until: () => b.x() > jx },
  ...tiles.map((tx, i): Step => ({
    name: 'stomp chain: beetle ' + (i + 1),
    start: () => i === 0 && b.jump(0.5),
    tick: () => {
      steer(b, bug(b.g, tx).x / T)
      if (b.g.ball.vy > 0) ((b.g.input.jumpHeld = held[i]), (b.hold = held[i] ? 0.5 : 0))
    },
    until: () => !bug(b.g, tx).alive,
  })),
  { name: 'stomp chain: land', tick: () => (b.x() < x - 1.5 ? b.right() : steer(b, x)), until: () => b.landed() && Math.abs(b.x() - x) < 0.3 },
]

/** Steps that only run if cond() holds when the first of them starts (else they all pass straight through). */
const when = (cond: () => boolean, steps: Step[]): Step[] => {
  let on = false
  return steps.map((st, i) => ({
    ...st,
    start: () => {
      if (i === 0) on = cond()
      if (on) st.start?.()
    },
    tick: () => on && st.tick?.(),
    until: () => !on || st.until(),
  }))
}

/** Hand-written steps run first on a leg, keyed by the save's tile x. */
export const PRE: Record<number, (b: Bot) => Step[]> = {
  30: upSpring(30.9, 35),
  75: (b) => [...pushHome(b, 'crate onto the cyan bridge', 77), hopTo(b, 'through the amber band onto the crate', onBox(b, 77)), upTo(b, 'up into the light', 87.5)],
  260: (b) => pushHome(b, 'plug the slot', 263),
  307: (b) => [upTo(b, 'up into the light', 307.5, 0.4)],
  56: (b) => [upTo(b, 'up into the light', 56.5, 0.4)],
  // respawned in the tunnel past the crate (it went home): back out, hop over it, push it in (if it is home)
  268: (b) => when(() => Math.abs(box(b.g, 263).x - box(b.g, 263).sx) < 1, [
    { name: 'back out of the tunnel', start: b.left, until: () => b.x() < 265.6 },
    { name: 'hop back over the crate', start: () => b.jump(0.3), until: () => b.landed() && b.x() < 262.6 },
    settleAt(b, 'behind the crate', 261.5),
    ...pushHome(b, 'plug the slot', 263),
  ]),
  143: stompChain(144.1, [147, 152, 157], [true, true, true], 162.5),
}

/** Timed jumps per leg, keyed by the save's tile x (solved from rest on that save). */
export const JUMPS: Record<number, number[][]> = {
  // @jumps
  3: [[3, 0.12], [4.3, 1.2]],
  13: [[13.5, 0.25], [13.6, 0.7, 1]],
  20: [[20.5, 0.03]],
  30: [[47.47, 0.12], [61.7, 0.08]],
  40: [[47.48, 0.12]],
  75: [[90.67, 0.4, 1]],
  104: [[104, 1.2]],
  109: [],
  138: [[139.4, 0.05]],
  162: [[168.5, 0.05]],
  191: [],
  203: [[203, 1.2], [203, 0.03]],
  208: [[209, 0.16]],
  213: [[214, 0.16]],
  218: [[219, 0.16]],
  223: [[224.3, 0.2]],
  236: [[237, 0.08]],
  245: [[245.4, 0.12]],
  279: [[292.49, 0.08], [296.29, 0.08], [312, 0.08], [318.5, 0.08]],
  307: [[311.6, 0.12], [313.3, 0.12]],
  328: [[328, 0.03], [328.6, 0.25]],
  337: [[338, 0.25]],
  343: [[343.9, 0.16]],
  350: [[351.8, 0.2]],
  369: [[369, 0.2]],
  377: [[378.7, 0.25]],
  390: [[390.8, 0.08]],
  395: [[395.8, 0.08]],
  400: [[400.8, 0.08]],
  405: [[405.8, 0.08]],
  410: [[410.8, 0.08]],
  415: [[415.8, 0.08]],
  420: [[420.8, 0.08]],
  425: [[425.8, 0.08]],
  430: [[430.8, 0.08]],
  435: [[435.8, 0.08]],
  440: [[440.8, 0.08]],
  445: [[445.8, 0.08]],
  450: [[450.8, 0.2]],
  // @end
}

/** Coming down onto solid ground (within 1.5 tiles under the ball)? */
const overFloor = (b: Bot) => {
  for (const d of [0.5, 1, 1.5]) {
    const [tx, ty] = [Math.floor(b.x()), Math.floor(b.y() + d)]
    if (b.g.tileAt(tx, ty) === '^') return false
    if (b.g.solid(tx, ty)) return true
  }
  return false
}

/** Lanterns the run flies past (on a roof or mid-air) rather than stopping on; each still has its own restart leg. */
export const PASS = new Set([40, 56, 307])

/** Steps for leg k (from save k to the next save, or the gate), starting from rest on save k. through: run on past
 *  PASS lanterns to the next one you stop on (the full run); without it, stop at the very next lantern. */
export const legRun = (b: Bot, k: number, through = false): Step[] => {
  const g = b.g
  const s = saves(g)
  const key = Math.floor(s[k])
  let n = k + 1
  while (through && PASS.has(Math.floor(s[n]))) n++
  const to = s[n]
  const jumps = JUMPS[key] ?? []
  let j = 0
  return [
    ...(PRE[key]?.(b) ?? []),
    {
      name: `leg ${k}: run`,
      start: b.right,
      tick: () => {
        const q = jumps[j]
        if (q && b.x() > q[0] && (q[2] || b.landed())) (b.jump(q[1]), j++)
      },
      until: () => (to === undefined ? g.state === 'won' : j >= jumps.length && b.x() >= to - 0.3 && b.x() <= to + 6 && g.g === 1 && (b.landed() || (g.ball.vy > 0 && overFloor(b)))),
    },
  ]
}

/** Brake, settle and stand still on save k. */
export const lineUp = (b: Bot, k: number): Step[] => {
  const g = b.g
  const x = saves(g)[k]
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const park = () => {
    const d = x - b.x()
    const want = Math.abs(d) < 0.04 ? 0 : Math.sign(d) * Math.max(10, Math.abs(d) * T * 4)
    if (g.ball.vx < want - 5) b.right()
    else if (g.ball.vx > want + 5) b.left()
    else b.stop()
  }
  return [
    // no friction in the air: brake a bounce all the way down
    { name: `save ${k}: brake`, start: () => ((g.input.jumpHeld = false), (b.hold = 0)), tick: () => { const v = b.landed() ? 40 : 3; g.ball.vx > v ? b.left() : g.ball.vx < -v ? b.right() : b.stop() }, until: () => Math.abs(g.ball.vx) < 10 && b.landed() && g.g === 1 },
    settleAt(b, `save ${k}: line up`, x),
    { name: `save ${k}: park`, tick: park, until: () => Math.abs(b.x() - x) < 0.08 && Math.abs(g.ball.vx) < 4 && b.landed() },
    { name: `save ${k}: still`, start: b.stop, until: still },
  ]
}

export const bot = (b: Bot): Step[] =>
  saves(b.g).flatMap((x, k) => (k > 0 && PASS.has(Math.floor(x)) ? [] : [...lineUp(b, k), ...legRun(b, k, true)]))
