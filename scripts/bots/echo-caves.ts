import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 21 bot. Each section starts from a standstill at a lantern (a player catching their breath), so the
// timed runs between stops were solved and their jump windows measured on their own. Beetles are waited for.
export const JUMPS: Record<string, Jumps> = {
  hop: [[16.6, 1.2], [29.8, 0.12], [30, 0.12]],
  roofA: [[50.4, 0.2]],
  roofB: [[69.2, 1.2], [88.8, 1.2]],
  bridges: [[181, 0.12], [188.2, 0.12]],
  colourRoof: [[216.7, 0.12], [221.4, 0.12], [226, 0.05]],
  pen: [[273.4, 1.2]],
  island: [[289.2, 0.3]],
  finale: [[312.4, 0.2], [324.6, 0.12]],
}

/** Sections in order; `at` is the lantern each starts from (used to test a section on its own). */
export const sections = (b: Bot): { name: string; at: number; steps: Step[] }[] => {
  const g = b.g
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed() && g.g === 1)
  const box = (tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)! // crate by its start tile
  // steer so vx tracks a speed proportional to the distance left (a player finessing a landing)
  const steer = (tx: number) => {
    const want = Math.max(-270, Math.min(270, (tx - b.x()) * T * 4))
    if (g.ball.vx < want - 15) b.right()
    else if (g.ball.vx > want + 15) b.left()
    else b.stop()
  }
  const crateStill = () => Math.abs(g.ball.vx) < 3 && b.landed()
  /** Hop onto the middle of a crate's top and stop there. */
  const onCrate = (name: string, tx: number, hold = 0.3): Step => {
    let t0 = 0
    const x = () => (box(tx).x + 15) / T
    return {
      name,
      start: () => ((t0 = g.time), b.jump(hold)),
      tick: () => steer(x()),
      until: () => g.time - t0 > 0.15 && crateStill() && Math.abs(b.x() - x()) < 0.15,
    }
  }
  /** Roll into a crate until its near edge reaches x (tiles), then let go and wait for everything to stop. */
  const push = (name: string, tx: number, edge: number): Step[] => [
    { name, start: b.right, until: () => box(tx).x + 30 >= edge * T - 0.5 },
    { name: `${name}: let go`, start: b.stop, until: () => crateStill() && box(tx).vx === 0 },
  ]
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 0.6)! // beetle by its start tile
  /** Wait until a beetle walks past x (tiles) heading dir. */
  const waitBug = (name: string, tx: number, dir: 1 | -1, x: number): Step => ({ name, until: () => bug(tx).dir === dir && Math.abs(bug(tx).x / T - x) < 0.05 })
  const climb = (name: string, toX: number, hold = 0.4): Step => ({ name, start: () => (b.right(), b.jump(hold)), until: () => b.landed() && b.x() > toX })
  return [
    { name: 'hop', at: 3, steps: [run('1: ditch, thorn pit, thorn roof', JUMPS.hop, 41)] },
    { name: 'roofA', at: 41, steps: [...lineUp('2a', 41), run('2a: dry roof road', JUMPS.roofA, 65)] },
    { name: 'roofB', at: 65, steps: [...lineUp('2b', 65), run('2b: thorny roof road', JUMPS.roofB, 110)] },
    {
      name: 'spring',
      at: 114,
      steps: [
        ...lineUp('3a', 116.9),
        ...springboard(b, '3a: springboard', 116.9, 121.5).slice(1),
        { name: '3a: off the wall', start: b.right, until: () => b.x() > 130 && b.landed() },
        ...lineUp('3b', 132.9),
        ...springboard(b, '3b: springboard through the curtain', 132.9, 137.5).slice(1),
        run('3b: cyan bridge', [], 157),
      ],
    },
    { name: 'bridges', at: 157, steps: [...lineUp('4ab', 157), run('4ab: colour bridges', JUMPS.bridges, 200)] },
    { name: 'colourRoof', at: 200, steps: [...lineUp('4c', 200), run('4c: colour roof roads', JUMPS.colourRoof, 234)] },
    {
      name: 'crates',
      at: 238,
      steps: [
        ...lineUp('5a', 238),
        ...push('5a: push the crate to the wall', 242, 248),
        settleAt(b, '5a: back off', 245.6),
        onCrate('5a: onto the crate', 242),
        climb('5a: onto the wall', 248.3),
        { name: '5a: off the wall', start: b.right, until: () => b.x() > 251.5 && b.landed() },
        ...lineUp('5b', 253),
        ...push('5b: push the crate across the cyan bridge', 259, 269),
        settleAt(b, '5b: back off', 266.6),
        onCrate('5b: onto the crate', 259),
        climb('5b: onto the wall', 269.3),
        run('5b: off the wall', [], 274),
      ],
    },
    { name: 'pen', at: 273, steps: [...lineUp('6a', 273), waitBug('6a: wait for the beetle', 280, -1, 279), run('6a: beetle pen', JUMPS.pen, 287)] },
    { name: 'island', at: 288, steps: [...lineUp('6b', 288), waitBug('6b: wait for the beetle', 296, 1, 296.5), run('6b: beetle island', JUMPS.island, 305)] },
    { name: 'finale', at: 305, steps: [...lineUp('7', 305), timed(b, '7: roof road to the gate', JUMPS.finale, () => g.state === 'won')] },
  ]
}

export const bot = (b: Bot): Step[] => [...sections(b).flatMap((s) => s.steps), { name: 'gate', start: b.right, until: () => b.g.state === 'won' }]
