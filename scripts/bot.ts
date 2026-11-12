// Shared bot toolkit: used by scripts/playthrough.ts (the permanent checks) and scripts/solve-segment.ts.
import { Game } from '../src/game/engine.ts'
import { T } from '../src/game/level.ts'

export type Step = { name: string; start?: () => void; tick?: () => void; until: () => boolean }
export type Jumps = [number, number][] // [x in tiles, hold seconds]

/** Helpers a bot script uses to drive the game. */
export class Bot {
  hold = 0
  g: Game
  constructor(g: Game) {
    this.g = g
  }
  x = () => this.g.ball.x / T
  y = () => this.g.ball.y / T
  jump = (secs: number) => {
    this.g.input.jumpPressed = this.g.input.jumpHeld = true
    this.hold = secs
  }
  right = () => Object.assign(this.g.input, { right: true, left: false })
  left = () => Object.assign(this.g.input, { right: false, left: true })
  stop = () => Object.assign(this.g.input, { right: false, left: false })
  landed = () => this.g.grounded
}

/** Hold right and fire each [x, hold] jump the first time the ball is on the ground past x. */
export const timed = (b: Bot, name: string, jumps: Jumps, until: () => boolean): Step => {
  let j = 0
  return {
    name,
    start: b.right,
    tick: () => {
      if (j < jumps.length && b.x() > jumps[j][0] && b.landed()) b.jump(jumps[j++][1])
    },
    until,
  }
}

/** Bot from a solved route (see scripts/solve-level.ts): one timed-jumps step until the gate. */
export const jumpsBot =
  (jumps: Jumps) =>
  (b: Bot): Step[] => [timed(b, 'timed jumps', jumps, () => b.g.state === 'won')]

/** Nudge left/right until resting at x. */
export const settleAt = (b: Bot, name: string, x: number): Step => ({
  name,
  tick: () => {
    const d = b.x() - x
    if (d < -0.15) b.right()
    else if (d > 0.15) b.left()
    else b.stop()
  },
  until: () => {
    const ok = Math.abs(b.x() - x) < 0.2 && Math.abs(b.g.ball.vx) < 5 && b.landed()
    if (ok) b.stop() // release the direction so the ball stays put during the next (waiting) step
    return ok
  },
})

/**
 * Beetle springboard in the standard pen (bump, beetle 3 tiles on, bump, gap, 4-tall wall):
 * settle at standX, wait until the beetle is in a launchable spot, then spring with jump held.
 * standX: where to stand (just before the first bump); penX: the pen beetle's spawn x (tile centre).
 */
export const springboard = (b: Bot, name: string, standX: number, penX: number): Step[] => {
  const bug = () => b.g.beetles.find((t) => Math.abs(t.sx / T - penX) < 1)!
  const bx = () => bug().x / T - penX // beetle offset inside its pen
  return [
    settleAt(b, `${name}: position`, standX),
    // tested windows: beetle heading left near the far side, or heading right near the middle
    { name: `${name}: wait for the beetle`, until: () => (bug().dir === -1 && bx() > 0.7 && bx() < 1.5) || (bug().dir === 1 && bx() > -1.3 && bx() < -0.3) },
    { name: `${name}: spring`, start: () => (b.right(), b.jump(1.2)), until: () => b.landed() && b.x() > standX + 9.5 }, // past the wall
  ]
}

export type RunResult = { won: boolean; died: boolean; stuckAt: string | null; x: number; motes: number; missed: string[] }

/** Runs steps to completion (or death / time limit). onStep sees every simulated frame. */
export function runSteps(g: Game, b: Bot, steps: Step[], opts: { limitSecs?: number; onFrame?: () => void } = {}): RunResult {
  let i = 0
  steps[0]?.start?.()
  const limit = (opts.limitSecs ?? 180) * 120
  for (let t = 0; t < limit && i < steps.length; t++) {
    if (steps[i].until()) {
      steps[++i]?.start?.()
      continue
    }
    steps[i].tick?.()
    if (b.hold > 0 && (b.hold -= 1 / 120) <= 0) g.input.jumpHeld = false
    g.step(1 / 120)
    opts.onFrame?.()
    if (g.deaths > 0) break
  }
  const missed = g.level.motes.filter((m) => !m.taken).map((m) => `${m.x / T - 0.5},${m.y / T - 0.5}`)
  return {
    won: g.state === 'won',
    died: g.deaths > 0,
    stuckAt: i < steps.length ? steps[i].name : null,
    x: b.x(),
    motes: g.collected,
    missed,
  }
}
