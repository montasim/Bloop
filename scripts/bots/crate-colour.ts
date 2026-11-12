import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 19 bot. Crate puzzles are hand-written (push to a wall, back off, hop on, swap colour, climb);
// the timed runs between them were solved with scripts/solve-segment.ts from a standstill at their lanterns.
export const bot = (b: Bot): Step[] => {
  const g = b.g
  const box = (tx: number) => g.crates.find((c) => Math.abs(c.sx / T - tx) < 1)! // crate by its start tile
  const bug = (tx: number) => g.beetles.find((t) => Math.abs(t.sx / T - tx - 0.5) < 1)! // beetle by its start tile
  const still = () => Math.abs(g.ball.vx) < 3 && b.landed()
  // steer so vx tracks a speed proportional to the distance left (a player finessing a landing)
  const steer = (tx: number) => {
    const want = Math.max(-270, Math.min(270, (tx - b.x()) * T * 4))
    if (g.ball.vx < want - 15) b.right()
    else if (g.ball.vx > want + 15) b.left()
    else b.stop()
  }
  /** Jump (hold secs) and steer to land and stop at x (e.g. the middle of a crate's top). */
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
  const climb = (name: string, toX: number, hold = 0.3): Step => ({ name, start: () => (b.right(), b.jump(hold)), until: () => b.landed() && b.x() > toX })
  const roll = (name: string, toX: number): Step => ({ name, start: b.right, until: () => b.landed() && b.x() >= toX })
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, tick: () => (g.ball.vx > 40 ? b.left() : g.ball.vx < -40 ? b.right() : b.stop()), until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed())

  return [
    // 1. intro
    ...push('1: push the crate to the cyan wall', 13, 1, 19),
    settleAt(b, '1: back off', 17),
    onCrate('1: onto the crate', 13),
    climb('1: through the wall onto the ledge', 20.5),
    // 2. cyan bridge
    roll('2: down to the curtain', 34),
    ...push('2: push across the cyan bridge', 35, 1, 45),
    settleAt(b, '2: back off', 43),
    onCrate('2: onto the crate', 35),
    { name: '2: up into the amber curtain', start: () => b.jump(0.3), tick: () => steer((box(35).x + 15) / T), until: () => g.phase === 'amber' && still() },
    roll('2: off the crate through the wall', 47),
    // 3. tunnel pen
    roll('3: into the tunnel', 61.5),
    settleAt(b, '3: line up', 61.5),
    hopTo('3: hop the crate', 64.5, 0.12),
    ...push('3: push it back to the well', 63, -1, 54),
    onCrate('3: onto the crate', 63),
    climb('3: onto the road', 56.5),
    ...lineUp('4', 72),
    run('4: gapped colour bridges', [[72, 0.12], [77.8, 0.12], [77.8, 0.12], [87.8, 0.12], [87.8, 0.12]], 101),
    // 5. stacking
    ...lineUp('5', 101),
    run('5: over the pit', [[101.4, 0.3]], 106),
    ...lineUp('5: before the crate', 107.6),
    ...push('5: push it under the slab to the amber ledge', 109, 1, 119),
    settleAt(b, '5: back out from under the slab', 108.4),
    hopTo('5: onto the slab', 110.5),
    ...push('5: push the slab crate off onto it', 112, 1, 119),
    settleAt(b, '5: back along the slab', 110.6),
    { name: '5: up into the amber curtain', start: () => b.jump(0.3), until: () => g.phase === 'amber' && still() },
    settleAt(b, '5: under the slab to the stack', 117.3),
    onCrate('5: onto the stack', 112),
    climb('5: onto the amber ledge', 119.5),
    // 6. crate-penned springboard
    roll('6: off the ledge', 130),
    ...lineUp('6', 132.5),
    run('6: over the pit', [[132.6, 0.3]], 138),
    ...lineUp('6: in the cyan stub', 139.2),
    ...push('6: push the crate into the beetle lane', 140, 1, 147.6),
    ...springboard(b, '6: springboard', 145.9, 150.5),
    // 7. amber bridge, curtain hop
    roll('7: down off the wall', 158),
    ...lineUp('7', 163),
    ...push('7: push across the amber bridge', 167, 1, 177),
    settleAt(b, '7: back off', 175),
    onCrate('7: hop onto the crate through the curtain', 167),
    climb('7: onto the cyan block', 177.5),
    ...lineUp('8', 190),
    { name: '8: wait for the pen beetle', until: () => bug(204).dir === -1 && Math.abs(bug(204).x / T - 204.8) < 0.1 },
    run('8: pond, pen, trap bridge', [[195.8, 0.12], [213, 0.12]], 216),
    // 9. beetle on the cyan bridge
    ...lineUp('9', 220.4),
    onCrate('9: onto the bridge crate', 223),
    // measured: heading right between 226.8 and 228.4, a held hop off the crate stomps it onto the ledge
    { name: '9: wait for the beetle', until: () => bug(229).dir === 1 && bug(229).x / T > 227.3 && bug(229).x / T < 227.9 },
    climb('9: stomp the beetle onto the ledge', 233.3, 1.2),
    // 10. finale
    roll('10: down to the curtain', 241),
    ...lineUp('10', 246.2),
    hopTo('10: hop the first crate', 250),
    ...push('10: push the second crate to the ledge', 251, 1, 263),
    settleAt(b, '10: back across the bridge', 250.3),
    hopTo('10: hop back over the first crate', 246.9),
    ...push('10: push the first crate under the curtain', 248, 1, 259.6),
    onCrate('10: onto it', 248),
    { name: '10: up into the amber curtain', start: () => b.jump(0.3), tick: () => steer((box(248).x + 15) / T), until: () => g.phase === 'amber' && still() },
    onCrate('10: across to the other crate', 251),
    climb('10: onto the amber ledge', 263.3),
    ...lineUp('11', 274),
    timed(b, '11: last bridges to the gate', [[281, 0.05], [288.2, 0.12], [307.4, 1.2]], () => g.state === 'won'),
  ]
}
