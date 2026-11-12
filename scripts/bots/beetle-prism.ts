import { T } from '../../src/game/level.ts'
import { settleAt, springboard, timed, type Bot, type Jumps, type Step } from '../bot.ts'

// solved with scripts/solve-segment.ts after the hand-written steps before each
const JA: Jumps = [[10, 1.2]]
const JE1: Jumps = [[98.8, 0.5]]
const JE2: Jumps = [[108.6, 0.7]]
const JE3: Jumps = [[117, 1.2]]
const JZ: Jumps = [[196.5, 0.3]]

export const bot = (b: Bot): Step[] => {
  const bug = (spawnX: number) => b.g.beetles.find((t) => Math.abs(t.sx / T - spawnX) < 1)!
  const still = () => Math.abs(b.g.ball.vx) < 5 && b.landed()
  // stop and line up at x (settleAt leaves its last input held, and coloured bumps don't stop the ball)
  const lineUp = (name: string, x: number): Step[] => [
    { name: `${name}: brake`, start: b.stop, until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const pen = (name: string, standX: number, penX: number): Step[] => [...lineUp(name, standX), ...springboard(b, name, standX, penX).slice(1)]
  // jump from a standstill once ready(), until landed past x above row y
  // brakeAt: steer back once past it in the air, to stop on a narrow pillar
  const leap = (name: string, hold: number, x: number, y: number, ready = () => true, brakeAt = Infinity): Step[] => [
    { name: `${name}: wait`, until: ready },
    { name, start: () => (b.right(), b.jump(hold)), tick: () => b.x() > brakeAt && (b.landed() ? b.stop() : b.left()), until: () => b.landed() && b.x() > x && b.y() < y },
  ]
  const b1 = () => bug(139.5)
  const ledge = () => bug(184.5)
  return [
    timed(b, 'A: cyan bridge', JA, () => b.x() >= 19.5 && b.g.ball.vy > 0),
    // the landing bounces (no ground friction), so steer back in the air before the pen
    { name: 'A: air brake', start: b.left, until: () => b.g.ball.vx < 60 },
    ...pen('B: cyan pen', 22.9, 27.5),
    timed(b, 'to C', [], () => b.x() >= 41 && b.landed()),
    ...pen('C: through the curtain', 41.9, 46.5),
    timed(b, 'off the ledge', [], () => b.x() >= 64 && b.landed()),
    ...pen('D: up through the amber ledge', 65.9, 70.5),
    timed(b, 'to the corridor', [], () => b.x() >= 90 && b.landed()),
    ...lineUp('E: corridor', 95.2),
    { name: 'E: wait for the first beetle', until: () => bug(99.5).dir === -1 && bug(99.5).x / T < 101.6 },
    timed(b, 'E: over the beetle and the trap', JE1, () => b.x() >= 106 && b.landed()),
    ...lineUp('E: past the trap', 107),
    { name: 'E: wait for the second beetle', until: () => bug(112.5).dir === -1 && bug(112.5).x / T < 112 },
    timed(b, 'E: over the second beetle', JE2, () => b.x() >= 116 && b.landed()),
    ...lineUp('E: before the amber pen', 116.8),
    { name: 'E: wait for the third beetle', until: () => bug(122.5).dir === -1 && bug(122.5).x / T < 122 },
    timed(b, 'E: over the third beetle', JE3, () => b.x() >= 127 && b.landed()),
    timed(b, 'F: onto the first pillar', [[128.2, 0.3]], () => b.x() >= 133.1 && b.landed() && b.y() < 10),
    ...lineUp('F: first pillar', 134.6),
    // measured windows: beetle heading right at 138-139.25, or heading left at 139.5-140.75 (~1 s each)
    ...leap('F: stomp across the ghost bridge', 0.2, 142.5, 10, () => b1().alive && ((b1().dir === 1 && b1().x / T > 138.3 && b1().x / T < 139) || (b1().dir === -1 && b1().x / T > 139.8 && b1().x / T < 140.5)), 143),
    ...lineUp('F: second pillar', 144.2),
    // the cyan bridge's beetle must not be under your landing: measured ok heading left at 146.5-150,
    // heading right at 146.5-147.75
    ...leap('F: over the cyan bridge', 0.4, 151.3, 10, () => bug(148.5).dir === -1 && bug(148.5).x / T > 147 && bug(148.5).x / T < 149.5),
    timed(b, 'F: down', [], () => b.x() >= 162 && b.landed()),
    ...pen('G: finale springboard', 164.9, 169.5),
    // on the cyan ledge: jump onto its beetle holding jump. Measured windows: heading left at
    // 181.5-183, heading right at 179.5-180.75 (~1 s each)
    ...lineUp('G: cyan ledge', 176.8),
    ...leap('G: stomp through the amber band', 1.2, 179, 6, () => ledge().alive && ledge().dir === -1 && ledge().x / T > 181.7 && ledge().x / T < 182.8),
    timed(b, 'to the gate', JZ, () => b.g.state === 'won'),
  ]
}
