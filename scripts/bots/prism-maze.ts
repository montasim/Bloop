import type { Bot, Jumps, Step } from '../bot.ts'

// Level 24 bot. Every room is a loop: one lane rightwards to the up-light, the roof road back LEFT to the
// down-column over the fork, then the other lane rightwards. Each run starts from a standstill (a player lining
// up at the fork, on the tower or under the light; beetle lanes also wait for their beetle), so the runs were
// solved and their jump windows measured on their own.

/** Hold a direction and fire each [x, hold] jump the first time the ball is grounded past x (in that direction). */
export const go = (b: Bot, name: string, dir: 1 | -1, jumps: Jumps, until: () => boolean): Step => {
  let j = 0
  return {
    name,
    start: dir === 1 ? b.right : b.left,
    tick: () => {
      if (j < jumps.length && (b.x() - jumps[j][0]) * dir > 0 && b.landed()) b.jump(jumps[j++][1])
    },
    until,
  }
}

const still = (b: Bot) => Math.abs(b.g.ball.vx) < 0.01 && Math.abs(b.g.ball.vy) < 5 && b.landed()
// slow and nearly there: let friction finish (pushing would overshoot the dead band and wobble forever)
const steer = (b: Bot, v: number) => {
  const vx = b.g.ball.vx
  if (Math.abs(v) < 12 && Math.abs(vx) < 12) b.stop()
  else if (vx < v - 4) b.right()
  else if (vx > v + 4) b.left()
  else b.stop()
}

/** Brake, then creep to x and stop there (within 0.04 tiles): the runs were solved from exact standstills. */
export const lineUp = (b: Bot, name: string, x: number): Step[] => [
  // let go of jump first: a held jump re-jumps on every landing
  { name: `${name}: brake`, start: () => ((b.hold = 0), (b.g.input.jumpHeld = false)), tick: () => steer(b, 0), until: () => still(b) },
  {
    name: `${name}: line up`,
    tick: () => (Math.abs(x - b.x()) < 0.03 ? b.stop() : steer(b, Math.max(-270, Math.min(270, (x - b.x()) * 300)))),
    until: () => Math.abs(b.x() - x) < 0.04 && Math.abs(b.g.ball.vx) < 3 && b.landed(),
  },
  { name: `${name}: still`, start: b.stop, until: () => still(b) },
]

/** Jump straight up into the light from under it and wait on the roof until the bounce has died down. */
export const lift = (b: Bot, name: string): Step[] => [
  { name: `${name}: into the light`, start: () => (b.stop(), b.jump(1.2)), until: () => b.g.g === -1 && b.landed() },
  { name: `${name}: settle on the roof`, tick: () => steer(b, 0), until: () => still(b) },
]

/** A beetle a lane waits for: spawn tile offset from the fork, its row, and the heading to catch it at its spawn. */
export type Bug = { o: number; y: number; dir: 1 | -1 }
export type Room = { F: number; order: 'ML' | 'LM'; first: Jumps; roof: Jumps; second: Jumps; bug1?: Bug; bug2?: Bug }

/** Wait (standing on the tower) until the lane's beetle passes its spawn heading dir: the runs were solved from that moment. */
export const waitBug = (b: Bot, F: number, bug: Bug): Step => {
  const sx = (F + bug.o + 0.5) * 32
  const t = () => b.g.beetles.find((k) => Math.abs(k.sx - sx) < 1 && Math.abs(k.sy / 32 - bug.y - 0.75) < 0.5)!
  return { name: `${F}: wait for the beetle`, until: () => t().alive && t().dir === bug.dir && Math.abs(t().x - sx) < 0.6 }
}

// lane runs are absolute x; CLIMB is relative to the fork: from a standstill at F-1.5 onto the tower
export const CLIMB: Jumps = [[0.6, 0.3]]
export const ROOMS: Room[] = [
  { F: 14, order: 'ML', first: [[22.975, 0.05]], roof: [], second: [[17, 0.05]] },
  { F: 44, order: 'ML', first: [[52.975, 0.05]], roof: [[60.075, 0.12]], second: [[46.625, 1.2]] },
  { F: 74, order: 'ML', first: [[82.075, 0.05], [82.8, 0.05]], roof: [[92.3, 0.05], [86.8, 0.05]], second: [[78.9, 0.3]], bug2: { o: 12, y: 12, dir: -1 } },
  { F: 104, order: 'LM', first: [[106.825, 0.12]], roof: [[123.775, 0.05], [118.825, 0.05], [113.6, 0.12]], second: [[110.8, 0.2]], bug1: { o: 11, y: 9, dir: -1 }, bug2: { o: 11, y: 9, dir: -1 } },
  { F: 134, order: 'ML', first: [[144, 0.05]], roof: [[151.3, 0.05], [145.75, 0.05]], second: [[136.825, 0.12]] },
  { F: 164, order: 'ML', first: [[171.075, 0.05], [169.8, 0.05]], roof: [[182.1, 0.12], [174.6, 0.12]], second: [[168.85, 0.2]], bug2: { o: 11, y: 12, dir: -1 } },
  { F: 194, order: 'LM', first: [[196.7, 0.2]], roof: [[212.9, 0.05], [210.4, 0.05], [204.125, 0.12]], second: [[201.35, 0.05]], bug1: { o: 12, y: 9, dir: -1 }, bug2: { o: 12, y: 9, dir: -1 } },
  { F: 224, order: 'ML', first: [[231.25, 0.05], [236.05, 0.05], [240.5, 0.05]], roof: [[242.3, 0.05], [239.55, 0.12]], second: [[226.675, 0.05]], bug2: { o: 10, y: 12, dir: -1 } },
  { F: 254, order: 'ML', first: [[260.025, 0.05], [258.8, 0.05]], roof: [[264.3, 0.05]], second: [[256.825, 0.12]] },
  { F: 284, order: 'LM', first: [[286.625, 0.05]], roof: [[303.15, 0.12], [296.775, 0.05], [293.375, 0.05]], second: [[291.725, 0.05], [296.8, 0.05]], bug1: { o: 10, y: 12, dir: -1 } },
  { F: 314, order: 'ML', first: [[321.4, 0.2]], roof: [[334.375, 0.05], [331.625, 0.05], [325.525, 0.05]], second: [[317.075, 1.2]], bug1: { o: 11, y: 9, dir: -1 }, bug2: { o: 11, y: 9, dir: -1 } },
  { F: 344, order: 'LM', first: [[347.55, 0.05], [353.875, 0.05], [353.2, 0.05]], roof: [[361.3, 0.05], [354.275, 0.05]], second: [[346.625, 0.12], [349.8, 0.2]], bug1: { o: 10, y: 12, dir: -1 } },
]

export const roomSteps = (b: Bot, { F, order, first, roof, second, bug1, bug2 }: Room): Step[] => {
  const g = b.g
  const onTower = () => b.landed() && b.y() < 10 && b.x() > F + 3.3 && b.x() < F + 5.7
  const merged = () => b.landed() && g.g === 1 && b.y() > 12 && b.x() > F + 18
  const climb = (n: string): Step[] => [
    ...lineUp(b, `${n}: fork`, F - 1.5),
    go(b, `${n}: onto the tower`, 1, CLIMB.map(([x, h]) => [F + x, h]), onTower),
    ...lineUp(b, `${n}: tower`, F + 4),
  ]
  const [l1, l2] = order === 'ML' ? ['bridge', 'low lane'] : ['low lane', 'bridge']
  return [
    ...climb(`${F} a`),
    ...(bug1 ? [waitBug(b, F, bug1)] : []),
    go(b, `${F}: ${l1}`, 1, first, merged),
    ...lineUp(b, `${F}: under the light`, F + 22.5),
    ...lift(b, `${F}`),
    go(b, `${F}: roof road back`, -1, roof, () => b.landed() && g.g === 1 && b.x() < F),
    ...climb(`${F} b`),
    ...(bug2 ? [waitBug(b, F, bug2)] : []),
    go(b, `${F}: ${l2}`, 1, second, merged),
  ]
}

export const bot = (b: Bot): Step[] => [
  ...ROOMS.flatMap((r) => roomSteps(b, r)),
  ...lineUp(b, 'finale', 372),
  go(b, 'gate', 1, [[373.6, 0.05]], () => b.g.state === 'won'),
]
