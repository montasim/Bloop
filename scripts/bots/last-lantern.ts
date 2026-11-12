import { T } from '../../src/game/level.ts'
import { settleAt, type Bot, type Step } from '../bot.ts'

// Level 29 bot. One leg per lantern: the bot stops and lines up on every lantern (exactly where a respawn puts
// you: at rest, gravity down, in the colour you lit it with), then plays that leg to the next lantern.
// Jump = [x, hold secs] fires on the ground once past x; [x, hold, 1] fires once past x even in the air (a buffered
// or held press). Most triggers sit in the middle of the span of triggers that still finish the leg.
// wait: [beetle start tile, dir, lo, hi] waits on the lantern until that beetle walks in dir between lo and hi.
// Legs with crates add hand-written steps (push, climb, a held stomp off a stone) around their timed runs.
export type Leg = { at: number; phase?: 'cyan'; wait?: number[]; jumps?: number[][]; steps?: (k: Kit) => Step[] }
export type Kit = ReturnType<typeof kit> & { jumps: number[][] }
/** Test hook (scripts only): force the leg's jump #k to fire on frame `frame` of its run instead of at its x. */
export type Fire = { k: number; frame: number }

const kit = (b: Bot, done: () => boolean = () => false, fire?: Fire, fired?: number[]) => {
  const g = b.g
  let n = 0 // jumps numbered across the leg's runs, for the test hook
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const box = (tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)! // crate by its start tile
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 1)! // beetle by its start tile
  const park = (tx: number) => {
    const d = tx - b.x()
    if (Math.abs(d) < 0.01) return b.stop()
    // the last stretch in nudges: roll a little, coast to a stop on friction (pushing back and forth can lock up)
    if (Math.abs(d) < 0.25) return Math.sign(d) * g.ball.vx < 8 && Math.sign(d) * g.ball.vx >= 0 ? (d > 0 ? b.right() : b.left()) : b.stop()
    const want = Math.sign(d) * Math.max(20, Math.abs(d) * 32 * 4)
    if (g.ball.vx < want - 5) b.right()
    else if (g.ball.vx > want + 5) b.left()
    else b.stop()
  }
  const lineUp = (name: string, x: number): Step[] => [
    // no friction in the air: brake a bounce all the way down
    { name: `${name}: brake`, tick: () => { const v = b.landed() ? 40 : 3; g.ball.vx > v ? b.left() : g.ball.vx < -v ? b.right() : b.stop() }, until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: park`, tick: () => park(x), until: () => Math.abs(b.x() - x) < 0.02 && Math.abs(g.ball.vx) < 4 && b.landed() },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  /** Roll right and fire the jumps; done when `until` holds after the last jump. */
  const run = (name: string, jumps: number[][], until: () => boolean): Step => {
    const base = n
    n += jumps.length
    let j = 0
    let f = 0
    return {
      name,
      start: () => ((j = 0), (f = 0), b.right()),
      tick: () => {
        const q = jumps[j]
        const forced = fire && fire.k === base + j ? f === fire.frame : null
        if (q && (forced ?? (b.x() > q[0] && (q[2] || b.landed())))) (fired?.push(f), b.jump(q[1]), j++)
        f++
      },
      until: () => j >= jumps.length && until(),
    }
  }
  /** Coming down onto (or standing at) the lantern at x, row y: the next line-up brakes before the ground runs out. */
  const over = (x: number, y: number) => () => {
    const by = b.y()
    return g.g === 1 && b.x() >= x && by < y + 0.3 && (by > y - 1.2 || (g.ball.vy > 0 && by > y - 4))
  }
  const wait = (name: string, until: () => boolean): Step => ({ name, start: b.stop, until })
  /** Roll into a crate until its far edge reaches x (tiles), then let go and wait for everything to stop. */
  const push = (name: string, tx: number, edge: number): Step[] => [
    { name, start: b.right, until: () => box(tx).x + 30 >= edge * T - 0.5 },
    { name: `${name}: let go`, start: b.stop, until: () => Math.abs(g.ball.vx) < 3 && b.landed() && box(tx).vx === 0 && box(tx).grounded },
  ]
  /** Push right until the crate (past minX) is held up (by a beetle or a wall) for a moment. */
  const pushTillStuck = (name: string, tx: number, minX = 0, stall = 0.3): Step[] => {
    let last = -1
    let since = 0
    return [
      { name, start: () => ((last = -1), (since = g.time), b.right()), tick: () => void (Math.abs(box(tx).x - last) > 0.5 && ([last, since] = [box(tx).x, g.time])), until: () => box(tx).x / T >= minX && g.time - since > stall },
      { name: `${name}: let go`, start: b.stop, until: () => still() && box(tx).vx === 0 },
    ]
  }
  const steer = (x: number) => {
    const want = Math.max(-270, Math.min(270, (x - b.x()) * T * 4))
    if (g.ball.vx < want - 15) b.right()
    else if (g.ball.vx > want + 15) b.left()
    else b.stop()
  }
  /** Hop (hold secs) onto a crate and come to rest on top of it. */
  const onCrate = (name: string, tx: number, hold = 0.05): Step => {
    let t0 = 0
    const cx = () => (box(tx).x + 15) / T
    return { name, start: () => ((t0 = g.time), b.jump(hold)), tick: () => steer(cx()), until: () => g.time - t0 > 0.15 && still() && Math.abs(b.x() - cx()) < 0.15 }
  }
  /** Hop up from a standstill steering onto a beetle (jump held: a held stomp), then roll right until done. */
  const hopStomp = (name: string, tx: number, done: () => boolean): Step => ({
    name,
    start: () => b.jump(5),
    tick: () => {
      if (bug(tx).alive) return steer(bug(tx).x / T)
      b.right()
      if (g.ball.vy > 0) ((g.input.jumpHeld = false), (b.hold = 0)) // the spring bounce is over
    },
    until: () => !bug(tx).alive && done() && ((g.input.jumpHeld = false), (b.hold = 0), true),
  })
  return { g, b, still, box, bug, lineUp, run, over, wait, push, park, done, pushTillStuck, steer, onCrate, hopStomp }
}

export const LEGS: Record<string, Leg> = {
  // @legs
  S3: { at: 3.5, jumps: [] },
  A10: { at: 10.5, jumps: [[10.97, 0.1458, 1], [14.73, 0.1625, 1]] },
  A19: { at: 19.5, jumps: [[23.28, 0.0042, 1]] },
  A28: { at: 28.5, jumps: [[30.2, 0.2375, 1]] },
  A38: { at: 38.5, jumps: [[38.95, 0.0542, 1], [41.83, 0.0708, 1], [45.48, 0.0042, 1]] },
  A47: { at: 47.5, jumps: [[48.65, 0.1792, 1], [51.23, 0.1125], [52.58, 0.1125, 1]] },
  A56: { at: 56.5, jumps: [[57.38, 0.0042, 1], [60.95, 0.0042, 1]] },
  B65: { at: 65.5, wait: [69, 1, 69.4, 69.46], jumps: [[65.88, 0.1708, 1]] },
  B75: { at: 75.5, wait: [79, 1, 79.2, 79.26], jumps: [[75.72, 0.0958, 1], [78.22, 0.5, 1]] },
  B86: { at: 86.5, wait: [90, -1, 90.04, 90.1], jumps: [[86.83, 0.0208, 1]] },
  B95: { at: 95.5, wait: [98, -1, 99.04, 99.1], jumps: [[95.95, 0.1708, 1]] },
  B105: { at: 105.5, wait: [109, 1, 109.4, 109.46], jumps: [[106.95, 0.0792, 1]] },
  C117: { at: 117.5, jumps: [[117.8, 0.1708]] },
  C124: { at: 124.5, phase: 'cyan', jumps: [[125.35, 0.1208, 1]] },
  C130: { at: 130.5, phase: 'cyan', jumps: [[131.08, 0.0958, 1], [135.49, 0.1542, 1]] },
  C138: { at: 138.5, phase: 'cyan', jumps: [[139.13, 0.1042, 1]] },
  C143: { at: 143.5, jumps: [[144.25, 0.1125, 1], [145.63, 0.1125, 1], [148.34, 0.1792, 1]] },
  C152: { at: 152.5, jumps: [[154.82, 0.0042, 1]] },
  C164: { at: 164.5, wait: [169, 1, 168.2, 168.26], jumps: [[165.93, 0.2042, 1]] },
  G175: { at: 175.5, jumps: [[186.9, 0.2625], [193.15, 0.0292], [196.39, 0.0042]] },
  G202: { at: 202.5, jumps: [[208.3, 0.0625, 1], [212.52, 0.0958, 1], [215.64, 0.0458, 1]] },
  G219: { at: 219.5, jumps: [[220.9, 0.2042, 1]] },
  G222: { at: 222.5, jumps: [[222.85, 0.1792, 1]] },
  X234: { at: 234.5, jumps: [[234.9, 0.1625, 1]] },
  // the stone falls off the ledge, you drop in behind it and push it to the wall: a step up
  X238: {
    at: 238.5,
    jumps: [[244, 0.05], [245.2, 0.5]],
    steps: (k) => [
      { name: 'X238: push the stone off', start: k.b.right, until: () => k.box(240).y > 10.7 * T },
      { name: 'X238: brake', start: k.b.left, until: () => k.g.ball.vx <= 0 },
      k.wait('X238: let it land', () => k.box(240).grounded && k.box(240).vx === 0 && k.still()),
      { name: 'X238: drop in behind it', start: k.b.right, until: () => k.b.landed() && k.b.y() > 12 },
      ...k.push('X238: push it to the wall', 240, 246),
      k.run('X238: up the stone and the wall', k.jumps, k.done),
    ],
  },
  X248: { at: 248.5, jumps: [] },
  // the stone shields you down the beetle tunnel and pins the beetle at the pit's edge: a springboard
  X251: {
    at: 251.5,
    jumps: [],
    steps: (k) => [
      ...k.lineUp('X251: behind the stone', 252.4),
      ...k.pushTillStuck('X251: push it through the tunnel till the beetle is pinned', 253, 259.8),
      k.onCrate('X251: onto the stone', 253),
      k.hopStomp('X251: hop onto the pinned beetle, spring over the pit', 256, k.done),
    ],
  },
  M267: { at: 267.5, wait: [272, -1, 272.84, 272.9], jumps: [[267.8, 0.0042, 1], [268.32, 0.8, 1]] },
  M283: { at: 283.5, jumps: [[289.88, 0.4958, 1], [296.9, 0.0042, 1]] },
  M301: { at: 301.5, phase: 'cyan', wait: [305, 1, 306.6, 306.66], jumps: [[302.48, 0.0958, 1], [304.45, 0.8, 1]] },
  M311: { at: 311.5, phase: 'cyan', jumps: [] },
  // push the stone over a two-colour bridge (the curtain swaps you mid-push), then climb it up the wall
  M315: {
    at: 315.5,
    phase: 'cyan',
    jumps: [[321, 0.05], [322.2, 0.5]],
    steps: (k) => [...k.push('M315: push the stone over the bridge', 316, 323), k.run('M315: up the stone and the wall', k.jumps, k.done)],
  },
  M325: { at: 325.5, jumps: [[329.52, 0.0042, 1]] },
  M330: { at: 330.5, phase: 'cyan', jumps: [[334.35, 0.0042, 1]] },
  D336: { at: 336.5, jumps: [[336.98, 0.1625, 1], [342.06, 0.0875, 1]] },
  D345: { at: 345.5, jumps: [[346.13, 0.0958, 1], [349.89, 0.0042, 1]] },
  D353: { at: 353.5, jumps: [[355.1, 0.0458, 1], [357.74, 0.1042, 1]] },
  D360: { at: 360.5, jumps: [[360.7, 0.0458], [363.83, 0.0042, 1]] },
  D367: { at: 367.5, jumps: [[371.33, 0.1625, 1]] },
  D379: { at: 379.5, jumps: [] },
  D383: { at: 383.5, jumps: [[385, 0.0458, 1], [387.16, 0.0042, 1]] },
  D389: { at: 389.5, phase: 'cyan', jumps: [[390.3, 0.0042, 1], [392.97, 0.0042, 1]] },
  D397: { at: 397.5, wait: [402, -1, 403.24, 403.3], jumps: [[398.65, 0.0958, 1], [400.2, 0.12, 1]] },
  D411: { at: 411.5, jumps: [] },
  F425: { at: 425.5, jumps: [] },
  F428: { at: 428.5, jumps: [[429.75, 0.12, 1]] },
  F431: { at: 431.5, jumps: [[432.38, 0.2, 1]] },
  F435: { at: 435.5, jumps: [] },
}

const names = () => Object.keys(LEGS)
/** Where leg `name` ends: the next lantern (x centre, standing y), or null for the gate. */
export const legEnd = (b: Bot, name: string): [number, number] | null => {
  const next = LEGS[names()[names().indexOf(name) + 1]]
  if (!next) return null
  const c = b.g.level.checkpoints.find((c) => Math.abs(c.x / T - next.at) < 0.6)!
  return [next.at, c.y / T + 0.125]
}

/** The steps of one leg (from a standstill on its lantern to coming down on the next one). */
export const legSteps = (b: Bot, name: string, opts: { jumps?: number[][]; fire?: Fire; fired?: number[] } = {}): Step[] => {
  const leg = LEGS[name]
  const end = legEnd(b, name)
  const done = end ? kit(b).over(end[0] - 0.4, end[1]) : () => b.g.state === 'won'
  const k = { ...kit(b, done, opts.fire, opts.fired), jumps: opts.jumps ?? leg.jumps ?? [] }
  if (leg.steps) return leg.steps(k)
  const w = leg.wait
  const bug = w && k.bug(w[0])
  return [
    ...(w ? [k.wait(`${name}: wait for the beetle`, () => bug!.alive && bug!.dir === w[1] && bug!.x / T >= w[2] && bug!.x / T <= w[3])] : []),
    k.run(`${name}: run`, k.jumps, done),
  ]
}

export const bot = (b: Bot): Step[] => names().flatMap((n) => [...kit(b).lineUp(n, LEGS[n].at), ...legSteps(b, n)])
