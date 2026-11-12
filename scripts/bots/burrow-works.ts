import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 20 bot. Crate + beetle puzzles are hand-written (push, wait for the beetle, stomp, spring);
// the timed runs between them were solved with scripts/solve-segment.ts from a standstill.
export const bot = (b: Bot): Step[] => {
  const g = b.g
  const box = (tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)! // crate by its start tile
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 1)! // beetle by its start tile
  const bx = (tx: number) => bug(tx).x / T
  const still = () => Math.abs(g.ball.vx) < 3 && b.landed()
  const steer = (tx: number) => {
    const want = Math.max(-270, Math.min(270, (tx - b.x()) * T * 4))
    if (g.ball.vx < want - 15) b.right()
    else if (g.ball.vx > want + 15) b.left()
    else b.stop()
  }
  /** Jump (hold secs) and steer to land and stop at x. */
  const hopTo = (name: string, x: number, hold = 0.3, xOf?: () => number): Step => {
    let t0 = 0
    return {
      name,
      start: () => ((t0 = g.time), b.jump(hold)),
      tick: () => steer(xOf ? xOf() : x),
      until: () => g.time - t0 > 0.15 && still() && Math.abs(b.x() - (xOf ? xOf() : x)) < 0.15,
    }
  }
  const onCrate = (name: string, tx: number, hold = 0.3) => hopTo(name, 0, hold, () => (box(tx).x + 15) / T)
  /** Roll into a crate until its near edge reaches x (tiles), then let go and wait for everything to stop. */
  const push = (name: string, tx: number, dir: 1 | -1, edge: number): Step[] => [
    { name, start: dir === 1 ? b.right : b.left, until: () => (dir === 1 ? box(tx).x + 30 >= edge * T - 0.5 : box(tx).x <= edge * T + 0.5) },
    { name: `${name}: let go`, start: b.stop, until: () => still() && box(tx).vx === 0 },
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
      { name: `${name}: let go`, start: b.stop, until: () => still() && box(tx).vx === 0 },
    ]
  }
  const letGo = () => ((g.input.jumpHeld = false), (b.hold = 0))
  /** Jump right (hold secs) until landed past toX; lets go of jump on landing so it doesn't bounce on. */
  const climb = (name: string, toX: number, hold = 0.3): Step => ({
    name,
    start: () => (b.right(), b.jump(hold)),
    until: () => b.landed() && b.x() > toX && (letGo(), true),
  })
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const waitBug = (name: string, tx: number, dir: 1 | -1, lo: number, hi: number): Step => ({
    name,
    until: () => bug(tx).alive && bug(tx).dir === dir && bx(tx) >= lo && bx(tx) <= hi,
  })
  /**
   * Roll (or hop, if hop > 0) off a crate towards a beetle and hold jump on the way down, so landing on it
   * is a held stomp; let go once the stomp bounce starts falling. dir -1 springs leftwards.
   */
  const springOff = (name: string, toX: number, hop = 0, dir: 1 | -1 = 1): Step => {
    let air = 0
    let phase = 0 // 0 leaving, 1 holding for the stomp, 2 bounced (rising), 3 let go
    return {
      name,
      start: () => ((phase = 0), (air = 0), dir === 1 ? b.right() : b.left(), hop > 0 && b.jump(hop)),
      tick: () => {
        const vy = g.ball.vy
        air = b.landed() ? 0 : air + 1 / 120
        // only after coyote time runs out, or holding jump would jump off the crate's edge
        if (phase === 0 && air > 0.12 && vy > 0) ((phase = 1), (g.input.jumpHeld = true), (b.hold = 5))
        else if (phase === 1 && vy < -300) phase = 2
        else if (phase === 2 && vy > 0) ((phase = 3), (g.input.jumpHeld = false), (b.hold = 0))
      },
      until: () => {
        const ok = phase >= 2 && b.landed() && (dir === 1 ? b.x() > toX : b.x() < toX)
        if (ok) ((g.input.jumpHeld = false), (b.hold = 0))
        return ok
      },
    }
  }
  /** Wait for a penned beetle heading right inside r, or heading left inside l. */
  const waitPen = (name: string, tx: number, r: [number, number], l: [number, number]): Step => ({
    name,
    until: () => {
      const t = bug(tx)
      const [lo, hi] = t.dir === 1 ? r : l
      return t.alive && bx(tx) >= lo && bx(tx) <= hi
    },
  })
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed())

  return [
    // A. intro pen
    ...push('A: push the crate into the beetle walk', 13, 1, 20.6),
    ...springboard(b, 'A: springboard', 18.9, 23.5),
    // B. beetle blocks the crate
    settleAt(b, 'B: off the wall', 34.3),
    ...lineUp('B', 35.3),
    run('B: over the pit', [[35.4, 0.2]], 39.3),
    ...lineUp('B: behind the crate', 40.2),
    ...pushTillStuck('B: push till the beetle stops it', 41),
    onCrate('B: onto the crate', 41, 0.05),
    waitBug('B: wait for the beetle', 46, -1, 0, 99),
    { name: 'B: roll off onto it', start: b.right, until: () => !bug(46).alive },
    { name: 'B: land', until: () => b.landed() },
    hopTo('B: back over the crate', 49.8, 0.12),
    ...push('B: push the crate to the wall', 41, 1, 52),
    onCrate('B: onto the crate', 41, 0.05),
    climb('B: up the wall', 52.4, 1.2),
    // C. the overhang
    ...lineUp('C: behind the crate', 59.2),
    waitBug('C: wait for the trench beetle', 76, 1, 69.5, 70.5),
    { name: 'C: push the crate to the edge', start: b.right, until: () => box(60).x >= 71.75 * T },
    { name: 'C: let it slide off', start: b.stop, until: () => still() && box(60).y > 12 * T && box(60).vx === 0 },
    { name: 'C: drop onto the crate', tick: () => steer((box(60).x + 15) / T), until: () => still() && b.y() > 11 && Math.abs(b.x() - (box(60).x + 15) / T) < 0.15 },
    waitBug('C: wait for the penned beetle', 76, -1, 76.5, 77),
    springOff('C: hop off the crate onto it, over the wall', 80.3, 0.05),
    // D. guarded shelf
    ...lineUp('D', 86.6),
    run('D: over the pit', [[86.7, 0.2]], 90.3),
    ...lineUp('D: behind the crate', 91.2),
    ...push('D: push the crate to the wall', 92, 1, 97),
    onCrate('D: onto the crate', 92, 0.12),
    waitBug('D: wait for the guard to walk away', 100, 1, 99.5, 100),
    climb('D: up behind the guard', 97.2, 1.2),
    { name: 'D: stop on the shelf', start: b.stop, until: still },
    waitBug('D: wait for the guard to come back', 100, -1, 99.3, 99.6),
    climb('D: hop onto the guard and off the shelf', 103.5, 0.12),
    // E. pond and beetle run
    ...lineUp('E', 106.4),
    waitBug('E: wait for the run beetle', 122, -1, 124.5, 125),
    run('E: pond, pits and the beetle', [[106.6, 0.05], [111.6, 1.2], [111.6, 1.2], [124.6, 0.05]], 131),
    // F. crate shield
    ...lineUp('F', 132.4),
    run('F: over the pit', [[132.5, 0.2]], 136.3),
    ...lineUp('F: behind the crate', 137.2),
    ...pushTillStuck('F: push it down the burrow, the beetle turning at it', 138, 1),
    onCrate('F: onto the crate', 138, 0.05),
    climb('F: from the crate up the wall', 155.3, 1.2),
    // G. deck beetle blocks the crate, then the overhang pen
    ...lineUp('G: behind the crate', 165.2),
    ...pushTillStuck('G: push till the beetle is pinned at the edge', 166, 1),
    onCrate('G: onto the crate', 166, 0.05),
    waitBug('G: wait until the trench beetle walks off right', 188, 1, 181, 183.5),
    { name: 'G: roll off onto the pinned beetle', tick: () => steer(183.62), until: () => !bug(173).alive },
    { name: 'G: stay on the ledge', tick: () => steer(183.62), until: () => still() },
    hopTo('G: back over the crate', 181.6, 0.05),
    { name: 'G: push the crate to the edge', start: b.right, until: () => box(166).x >= 183.75 * T },
    { name: 'G: let go', start: b.stop, until: () => still() && box(166).y > 12 * T && box(166).vx === 0 },
    { name: 'G: drop onto the crate', tick: () => steer((box(166).x + 15) / T), until: () => still() && b.y() > 11 && Math.abs(b.x() - (box(166).x + 15) / T) < 0.15 },
    // scanned: a 0.05 s hop off the crate lands a held stomp onto the wall from either of these
    waitPen('G: wait for the penned beetle', 188, [186.4, 187.4], [187.6, 188.6]),
    springOff('G: hop off the crate onto it, over the wall', 192.3, 0.05),
    // H. pond and a beetle under a thorn roof
    ...lineUp('H', 198.4),
    waitBug('H: wait for the roofed beetle', 214, 1, 213, 213.5),
    run('H: pond, pit, the roofed beetle', [[204, 0.3], [206.6, 0.12], [211, 0.12], [218.2, 0.05]], 222),
    // I. pen springboard onto a guarded shelf
    ...lineUp('I: behind the crate', 225.4),
    ...push('I: push the crate into the beetle walk', 226, 1, 233.6),
    settleAt(b, 'I: springboard: position', 231.9),
    {
      name: 'I: wait for the pen beetle and the guard walking away',
      until: () => {
        const p = bx(236) - 236.5
        const pen = (bug(236).dir === -1 && p > 0.7 && p < 1.5) || (bug(236).dir === 1 && p > -1.3 && p < -0.3)
        return pen && bug(245).dir === 1 && bx(245) > 244 && bx(245) < 246
      },
    },
    climb('I: spring onto the shelf', 241.4, 1.2),
    { name: 'I: stop on the shelf', start: b.stop, until: still },
    { name: 'I: wait for the guard to come back', until: () => bug(245).dir === -1 && bx(245) - b.x() > 1 && bx(245) - b.x() < 1.25 },
    climb('I: hop onto the guard and off the shelf', 249.5, 0.12),
    // J. pit and a beetle between bumps
    ...lineUp('J', 253.6),
    run('J: over the pit', [[254.8, 0.2]], 259),
    ...lineUp('J: before the bump', 259.6),
    waitBug('J: wait for the beetle', 264, -1, 264, 264.5),
    run('J: hop the roofed beetle', [[259.8, 0.12]], 270),
    // K. finale: burrow shield, deck beetle, overhang pen
    ...lineUp('K', 271.4),
    run('K: over the pit', [[271.5, 0.2]], 275.3),
    ...lineUp('K: behind the crate', 276.2),
    ...pushTillStuck('K: push it down the burrow', 277, 1),
    onCrate('K: onto the crate', 277, 0.05),
    climb('K: from the crate up the wall', 290.3, 1.2),
    ...lineUp('K: behind the deck crate', 295.2),
    ...pushTillStuck('K: push till the deck beetle is pinned at the edge', 296, 1),
    onCrate('K: onto the deck crate', 296, 0.05),
    waitBug('K: wait until the trench beetle walks off right', 314, 1, 307, 309.5),
    { name: 'K: roll off onto the pinned beetle', tick: () => steer(309.62), until: () => !bug(301).alive },
    { name: 'K: stay on the ledge', tick: () => steer(309.62), until: () => still() },
    hopTo('K: back over the crate', 307.6, 0.05),
    { name: 'K: push the crate to the edge', start: b.right, until: () => box(296).x >= 309.75 * T },
    { name: 'K: let go', start: b.stop, until: () => still() && box(296).y > 12 * T && box(296).vx === 0 },
    { name: 'K: drop onto the crate', tick: () => steer((box(296).x + 15) / T), until: () => still() && b.y() > 11 && Math.abs(b.x() - (box(296).x + 15) / T) < 0.15 },
    waitPen('K: wait for the penned beetle', 314, [312.9, 313.9], [314.1, 315.1]),
    springOff('K: hop off the crate onto it, over the wall', 318.3, 0.05),
    { name: 'K: into the gate', start: b.right, until: () => g.state === 'won' },
  ]
}
