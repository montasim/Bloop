import { T } from '../../src/game/level.ts'
import { springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// Level 16 bot. Crate puzzles are hand-written the way a player solves them: push until the crate
// reaches a spot, let go (a crate slides ~11 px after you stop), back off, line up, jump.
// timed segments, each solved from a standstill after a line-up (and a beetle wait) with scripts/solve-segment.ts-style search
export const JUMPS: Record<string, Jumps> = {
  G1: [[165.5, 0.3]],
  G2: [[174.4, 1.2]],
  G3: [[187.4, 0.05], [194.4, 0.12], [194.4, 0.2]],
  I1: [[229.6, 1.2], [229.8, 1.2]],
  I2: [[249.6, 0.05], [257.4, 1.2]],
}

export const bot = (b: Bot): Step[] => {
  const c = (i: number) => b.g.crates[i]
  const cx = (i: number) => c(i).x / T // crate's left edge, in tiles
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed()
  const brake: (name: string) => Step = (name) => ({ name, tick: () => (b.g.ball.vx > 30 ? b.left() : b.g.ball.vx < -30 ? b.right() : b.stop()), until: still })
  // roll to x and stand still there, steering the speed (bang-bang settling overshoots on short ledges)
  const standAt = (name: string, x: () => number): Step => ({
    name,
    tick: () => {
      const d = x() - b.x()
      const v = Math.abs(d) < 0.05 ? 0 : Math.max(-120, Math.min(120, d * 160))
      b.g.ball.vx < v - 6 ? b.right() : b.g.ball.vx > v + 6 ? b.left() : b.stop()
    },
    until: () => {
      const ok = still() && Math.abs(b.x() - x()) < 0.12
      if (ok) b.stop()
      return ok
    },
  })
  const lineUp = (name: string, x: number): Step[] => [brake(`${name}: brake`), standAt(`${name}: line up`, () => x)]
  const onCrate = (name: string, i: number) => standAt(name, () => cx(i) + 0.47) // on top of crate i, near its middle
  const pushRight = (name: string, i: number, toX: number): Step => ({ name, start: b.right, until: () => cx(i) >= toX })
  const pushLeft = (name: string, i: number, toX: number): Step => ({ name, start: b.left, until: () => cx(i) <= toX })
  const hop = (name: string, dir: 1 | -1, hold: number, until: () => boolean): Step => ({ name, start: () => (dir > 0 ? b.right() : b.left(), b.jump(hold)), until })
  const run = (name: string, jumps: Jumps, toX: number): Step => timed(b, name, jumps, () => b.x() >= toX && b.landed())
  const bug = (spawnX: number) => b.g.beetles.find((t) => Math.abs(t.sx / T - spawnX) < 0.6)!
  const waitBug = (name: string, spawnX: number, dir: number, lo: number, hi: number): Step => ({ name, until: () => bug(spawnX).alive && bug(spawnX).dir === dir && bug(spawnX).x / T >= lo && bug(spawnX).x / T <= hi })
  // jump and steer in the air to come down near x (keeps a short landing from rolling off)
  const hopTo = (name: string, x: number, hold: number, until: () => boolean): Step => ({
    name,
    start: () => b.jump(hold),
    tick: () => (b.x() > x + 0.1 ? b.left() : b.x() < x - 0.1 ? b.right() : b.stop()),
    until,
  })
  return [
    // A
    pushRight('A: push the crate to the wall', 0, 19 - 30 / T - 0.01),
    ...lineUp('A', 17.6),
    hop('A: climb', 1, 1.2, () => b.landed() && b.y() < 9 && b.x() > 19.3),
    run('A: drop down', [], 25.5),
    // B
    ...lineUp('B', 26),
    hop('B: onto the step', 1, 0.3, () => b.landed() && b.y() < 11 && b.x() > 28.2),
    hop('B: onto the deck', 1, 0.4, () => b.landed() && b.y() < 9 && b.x() > 32.2),
    pushRight('B: push crate 1', 1, 40.8),
    brake('B: let go'),
    { name: 'B: crate 1 falls', until: () => c(1).y > 12.5 * T },
    ...lineUp('B: shaft 1', 40),
    hop('B: over shaft 1', 1, 0.12, () => b.landed() && b.x() > 42.3),
    ...lineUp('B: between the shafts', 43.4),
    hop('B: over shaft 2', 1, 0.12, () => b.landed() && b.x() > 46.3),
    ...lineUp('B: before crate 2', 46.8),
    hop('B: over crate 2', 1, 0.2, () => b.landed() && b.x() > 50.2),
    ...lineUp('B: behind crate 2', 51.5),
    pushLeft('B: push crate 2', 2, 45.25),
    brake('B: let go of crate 2'),
    { name: 'B: crate 2 falls', until: () => c(2).y > 12.5 * T },
    ...lineUp('B: shaft 2 again', 46.6),
    hop('B: back over shaft 2', -1, 0.12, () => b.landed() && b.x() < 44.6),
    ...lineUp('B: between again', 43.6),
    hop('B: back over shaft 1', -1, 0.12, () => b.landed() && b.x() < 40.4),
    { name: 'B: off the deck', start: b.left, until: () => b.landed() && b.y() > 12 },
    run('B: through the tunnel', [], 58),
    // C
    pushRight('C: push to the cliff', 3, 70.3),
    brake('C: let go'),
    ...lineUp('C: behind the crate', 69.5),
    { ...hop('C: onto the crate', 1, 0.12, () => b.landed() && b.y() < 12), tick: () => (b.x() > cx(3) + 0.45 || b.g.ball.vx > 120 ? b.left() : b.right()) },
    onCrate('C: settle on the crate', 3),
    hop('C: climb over the lip', 1, 1.2, () => b.landed() && b.y() < 9 && b.x() > 74.3),
    // D
    run('D: drop off the cliff', [], 81.5),
    ...lineUp('D', 84.2),
    hop('D: over the first crate', 1, 0.3, () => b.landed() && b.x() > 87.4),
    ...lineUp('D: between the crates', 88.6),
    { name: 'D: second crate into the notch', start: b.right, until: () => c(5).y > 12.9 * T },
    ...lineUp('D: back', 89.6),
    hop('D: back over the first crate', -1, 0.3, () => b.landed() && b.x() < 85.3),
    ...lineUp('D: behind the first crate', 84.5),
    pushRight('D: stack it on the notch crate', 4, 99 - 30 / T - 0.01),
    ...lineUp('D: climb', 97.6),
    hop('D: climb', 1, 1.2, () => b.landed() && b.y() < 9 && b.x() > 99.3),
    run('D: onto the shelf', [], 106),
    // E
    pushRight('E: push the crate off', 6, 115.7),
    brake('E: let go'),
    { name: 'E: crate lands on the island', until: () => c(6).y > 12 * T && c(6).grounded && Math.abs(c(6).vx) < 1 },
    ...lineUp('E: shelf edge', 115.3),
    { ...hop('E: onto the crate', 1, 0.05, () => b.landed() && b.y() < 12 && b.x() > 116.5), tick: () => (b.x() > cx(6) + 0.45 || b.g.ball.vx > 150 ? b.left() : b.right()) },
    onCrate('E: settle on the crate', 6),
    hop('E: over the beetle and the pit', 1, 0.3, () => b.landed() && b.x() > 122.3),
    // F
    ...lineUp('F', 128.9),
    ...springboard(b, 'F: springboard', 128.9, 133.5).slice(1),
    pushRight('F: crate into the tunnel notch', 7, 151.5),
    { name: 'F: crate drops in', until: () => c(7).y > 8.8 * T },
    run('F: through the tunnel', [], 163),
    ...lineUp('G', 162.5),
    run('G1: first pit', JUMPS.G1, 172.6),
    ...lineUp('G2', 173.6),
    waitBug('G2: wait for the curtain beetle', 181.5, -1, 182.5, 183.1),
    run('G2: stomp it, through the curtain', JUMPS.G2, 186.6),
    ...lineUp('G3', 187.2),
    waitBug('G3: wait for the bridge beetle', 191.5, -1, 197.5, 198.1),
    run('G3: hop it under the thorns', JUMPS.G3, 203.3),
    // H
    ...lineUp('H', 204.2),
    hop('H: pillar 1', 1, 0.7, () => b.landed() && b.y() < 10 && b.x() > 206.2),
    ...lineUp('H: on pillar 1', 207.8),
    hopTo('H: pillar 2', 210.8, 0.5, () => b.landed() && b.y() < 8 && b.x() > 210.2),
    ...lineUp('H: on pillar 2', 210.8),
    hop('H: onto the deck', 1, 0.5, () => b.landed() && b.y() < 6 && b.x() > 213.2),
    pushRight('H: crate to the shaft', 8, 219.8),
    brake('H: let go'),
    { name: 'H: crate drops into the pit', until: () => c(8).y > 13.5 * T && c(8).grounded },
    { name: 'H: off the deck', tick: () => (b.x() > 212.75 && b.y() < 6 ? b.left() : b.x() < 212.6 ? b.right() : b.stop()), until: () => b.landed() && b.y() > 12 },
    ...lineUp('H: pit edge', 215.4),
    hopTo('H: onto the crate', 220.5, 0.7, () => b.landed() && b.x() > 219),
    onCrate('H: on the crate', 8),
    hop('H: out of the pit', 1, 0.5, () => b.landed() && b.x() > 225.2),
    // I
    ...lineUp('I', 228),
    waitBug('I1: wait for the beetle', 239.5, 1, 238.5, 239.1),
    run('I1: pits and a beetle', JUMPS.I1, 248.3),
    ...lineUp('I2', 248.6),
    waitBug('I2: wait for the beetle under the thorns', 255.5, -1, 251.5, 252.1),
    run('I2: under the thorns, over the pit', JUMPS.I2, 268),
    ...lineUp('I: before the shelf', 270.5),
    hop('I: onto the shelf', 1, 0.12, () => b.landed() && b.y() < 12 && b.x() > 272.6),
    ...lineUp('I: behind crate 1', 274.6),
    hopTo('I: over crate 1', 278.2, 0.3, () => b.landed() && b.y() < 12 && b.x() > 277.2),
    ...lineUp('I: between the crates', 278.3),
    { name: 'I: crate 2 into the thorn gap', start: b.right, until: () => c(10).y > 11.9 * T && c(10).grounded },
    ...lineUp('I: back', 278.4),
    hopTo('I: back over crate 1', 274.6, 0.3, () => b.landed() && b.y() < 12 && b.x() < 275.3),
    ...lineUp('I: behind crate 1 again', 274.5),
    pushRight('I: stack crate 1', 9, 284 - 30 / T - 0.01),
    ...lineUp('I: climb', 282.6),
    hop('I: climb', 1, 1.2, () => b.landed() && b.y() < 8 && b.x() > 284.3),
    { name: 'I: into the gate', start: b.right, until: () => b.g.state === 'won' },
  ]
}
