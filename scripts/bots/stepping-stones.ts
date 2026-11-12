import { T } from '../../src/game/level.ts'
import { timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 17 bot. Crate puzzles are hand-written (hop over the near crate, push the far one, back off, ...);
// the timed stretches between them were solved with scripts/solve-segment.ts from a standstill.
export const JUMPS: Record<string, Jumps> = {
  start: [[15.5, 0.3]],
  T2: [[143, 0.05], [147, 1.2], [147, 1.2], [165.2, 1.2]],
  T3: [[200.1, 0.12], [201.1, 0.12]],
  T3b: [[218, 0.05], [221, 1.2], [240.2, 0.12], [246.2, 0.05], [258.4, 1.2]],
  T1: [[49.4, 0.12], [65.6, 0.12]],
  T1b: [[73.5, 0.12], [74.7, 1.2]],
}

export const bot = (b: Bot): Step[] => {
  const still = () => Math.abs(b.g.ball.vx) < 3 && b.landed()
  const crate = (tx: number) => b.g.crates.find((c) => Math.floor(c.sx / T) === tx)!
  const brake = (name: string): Step => ({ name: `${name}: brake`, start: () => ((b.hold = 0), (b.g.input.jumpHeld = false)), tick: () => (b.g.ball.vx > 30 ? b.left() : b.g.ball.vx < -30 ? b.right() : b.stop()), until: still })
  const steer = (v: number) => (b.g.ball.vx < v - 4 ? b.right() : b.g.ball.vx > v + 4 ? b.left() : b.stop())
  // stop within 0.04 tiles of x (the timed stretches were solved from exact standstills)
  const lineUp = (name: string, x: number): Step[] => [
    brake(name),
    {
      name: `${name}: line up`,
      tick: () => (Math.abs(x - b.x()) < 0.03 ? b.stop() : steer(Math.max(-120, Math.min(120, (x - b.x()) * 160)))),
      until: () => Math.abs(b.x() - x) < 0.04 && Math.abs(b.g.ball.vx) < 3 && b.landed(),
    },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  /** hop over a crate from x towards dir, landing on the floor (y > floorY) past `past` */
  const over = (name: string, x: number, dir: 1 | -1, past: number, floorY: number, hold = 0.12): Step[] => [
    ...lineUp(name, x),
    {
      name: `${name}: hop`,
      start: () => ((dir > 0 ? b.right() : b.left()), b.jump(hold)),
      tick: () => {
        if (b.hold <= 0 && (dir > 0 ? b.x() > past : b.x() < past)) b.stop()
      },
      until: () => b.landed() && b.y() > floorY && (dir > 0 ? b.x() > past : b.x() < past),
    },
    brake(name),
  ]
  /** push a crate right until it stops against a wall (crate x past toX and no longer moving) */
  const seen = new Map<number, number>()
  const xPrev = (tx: number) => {
    const p = seen.get(tx)
    seen.set(tx, crate(tx).x)
    return p
  }
  const pushTo = (name: string, tx: number, toX: number): Step => ({ name, start: b.right, until: () => crate(tx).x > toX * T && crate(tx).x === xPrev(tx) })
  /** push a crate right off a ledge, braking the moment it drops so the ball stays up */
  const pushOff = (name: string, tx: number): Step => {
    let y0 = 0
    let dropped = false
    return {
      name,
      start: () => ((y0 = crate(tx).y), (dropped = false), b.right()),
      tick: () => {
        if (crate(tx).vy > 0 || crate(tx).y > y0 + 0.01) dropped = true
        if (dropped) b.g.ball.vx > 0 ? b.left() : b.stop()
      },
      until: () => dropped && crate(tx).vy === 0 && crate(tx).y > y0 + 1 && still(),
    }
  }
  /** from the lip of a ledge: hop onto the stack in the slot, stand still, then a held jump up the wall */
  const climbStack = (name: string, x: number, stackY: number, topY: number): Step[] => [
    ...lineUp(name, x),
    { name: `${name}: hop onto the stack`, start: () => (b.right(), b.jump(0.05)), until: () => b.landed() && b.y() < stackY },
    { name: `${name}: settle`, start: b.stop, until: still },
    { name: `${name}: climb`, start: () => (b.right(), b.jump(9)), until: () => b.landed() && b.y() < topY },
  ]
  /** wait until the beetle that starts in column tx heads dir and sits off tiles from its spawn */
  const waitBeetle = (name: string, tx: number, dir: number, off: number): Step => ({
    name: `${name}: wait for the beetle`,
    until: () => {
      const t = b.g.beetles.find((q) => Math.floor(q.sx / T) === tx)!
      return t.dir === dir && Math.abs(t.x / T - tx - 0.5 - off) < 0.08
    },
  })
  const run = (name: string, jumps: Jumps, until: () => boolean): Step => timed(b, name, jumps, until)

  return [
    run('start: hop the pit', JUMPS.start, () => b.x() > 20 && b.landed()),
    // 1. hop A, push B to the wall, climb
    ...over('P1: over A', 21.5, 1, 24.2, 12),
    pushTo('P1: push B to the wall', 27, 33.9),
    { name: 'P1: climb', start: () => b.jump(9), until: () => b.landed() && b.y() < 9 },
    ...lineUp('T1', 41),
    run('T1: off the plateau', [], () => b.x() > 46 && b.landed()),
    ...lineUp('T1b', 47),
    waitBeetle('T1', 56, 1, -0.3),
    run('T1: pits and the beetle island under the thorn roof', JUMPS.T1, () => b.x() > 70.5 && b.landed()),
    ...lineUp('T1c', 71.5),
    waitBeetle('T1c', 77, 1, -1),
    run('T1: over the beetle, onto the ledge', JUMPS.T1b, () => b.x() > 87.5 && b.landed() && b.y() < 12),
    // 2. onto the ledge, hop the near crate, drop the far one into the slot, then the near one onto it
    ...over('P2: over the near crate', 88.5, 1, 91.3, 11),
    pushOff('P2: far crate into the slot', 94),
    ...over('P2: back over', 92.3, -1, 89.6, 11),
    ...lineUp('P2: behind the near crate', 88.6),
    pushOff('P2: near crate onto the stack', 90),
    ...climbStack('P2', 96.4, 10.8, 8),
    ...lineUp('P3', 104),
    // 3. the marsh: no jumping under the thorn roof, just push each crate into the next slot
    run('P3: marsh', [], () => b.x() > 143 && b.landed()),
    ...lineUp('T2', 143),
    waitBeetle('T2', 173, -1, 0),
    run('T2: cyan blocks, beetle run', JUMPS.T2, () => b.x() > 179 && b.landed()),
    // 4. turn cyan, hop the reset slot and the near crate, push the far crate to the cyan tower and climb it
    ...lineUp('P4', 184),
    { name: 'P4: hop the slot', start: () => (b.right(), b.jump(0.05)), until: () => b.landed() && b.x() > 186 },
    ...over('P4: over the near crate', 186.6, 1, 189.3, 12),
    pushTo('P4: far crate to the tower', 192, 197.9),
    { name: 'P4: climb the tower', start: () => b.jump(9), until: () => b.landed() && b.y() < 9 },
    ...lineUp('P4: on the tower', 199.5),
    // jump for the plateau while its beetle is on the near half (tested: offsets -3.0..-1.0 from its spawn are safe either way)
    { name: 'P4: wait for the beetle', until: () => { const o = b.g.beetles.find((t) => Math.floor(t.sx / T) === 211)!.x / T - 211.5; return o > -3 && o < -1 } },
    run('T3: off the tower over the beetle plateau', JUMPS.T3, () => b.x() > 215.5 && b.landed()),
    ...lineUp('T3b', 217),
    run('T3b: pits, thorn overhangs, onto the high ledge', JUMPS.T3b, () => b.x() > 264.5 && b.landed() && b.y() < 11),
    // 5. far crate first, then the middle one, then the near one: a 3-crate stack in the slot
    ...over('P5: over A', 266.5, 1, 269.3, 10),
    ...over('P5: over B', 270.4, 1, 273.3, 10),
    pushOff('P5: C into the slot', 276),
    ...over('P5: back over B', 274.6, -1, 271.7, 10),
    ...over('P5: back over A', 270.6, -1, 267.7, 10),
    ...over('P5: over A again', 266.6, 1, 269.3, 10),
    pushOff('P5: B onto C', 272),
    ...over('P5: back over A again', 270.6, -1, 267.7, 10),
    ...lineUp('P5: behind A', 266.6),
    pushOff('P5: A on top', 268),
    ...climbStack('P5', 281.4, 9.9, 7),
    ...lineUp('to the gate', 284),
    run('to the gate', [], () => b.g.state === 'won'),
  ]
}
