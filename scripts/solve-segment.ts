// Dev tool: like solve-level.ts, but starts from wherever a hand-written prefix of bot steps leaves the ball
// (after a springboard, a stop-and-line-up, ...) and searches timed jumps up to stopX.
// Use from a small script: solveSegment('root-maze', (b) => [...steps], 64)
import { Game } from '../src/game/engine.ts'
import { LEVELS } from '../src/game/levels/index.ts'
import { HOLDS } from './solve-level.ts'
import { Bot, runSteps, timed, type Jumps, type Step } from './bot.ts'

type Seg = { ok: boolean; died: boolean; x: number; motes: number; missed: string[] }

/** A segment only counts if it ends landed between stopX and stopX + overshoot (so the next step starts somewhere usable). */
export function runSegment(levelId: string, prefix: (b: Bot) => Step[], jumps: Jumps, stopX: number, overshoot = 2): Seg {
  const g = new Game(LEVELS.find((l) => l.id === levelId)!.build())
  const b = new Bot(g)
  let reach = 0
  let lastGain = 0
  let frame = 0
  const seg = timed(b, 'segment', jumps, () => (b.x() >= stopX && b.landed()) || g.state === 'won' || frame - lastGain > 360)
  // the stall timer starts with the segment, not the prefix (a prefix may end with a long wait)
  seg.start = () => ((reach = b.x()), (lastGain = frame), b.right())
  const steps = [...prefix(b), seg]
  const r = runSteps(g, b, steps, {
    limitSecs: 150,
    onFrame: () => {
      frame++
      if (b.x() > reach + 0.25) [reach, lastGain] = [b.x(), frame]
    },
  })
  const ok = !r.died && (g.state === 'won' || (r.stuckAt === null && b.x() >= stopX && reach <= stopX + overshoot))
  return { ok, died: r.died, x: Math.max(reach, b.x()), motes: r.motes, missed: r.missed }
}

/** Greedy search for timed jumps after the prefix; maximises reaching stopX alive with the most motes. */
export function solveSegment(levelId: string, prefix: (b: Bot) => Step[], stopX: number, fromX: number, log = true) {
  const score = (r: Seg) => (r.ok ? 10000 : 0) + r.motes * 100 + r.x - (r.died ? 5 : 0)
  let jumps: Jumps = []
  let r = runSegment(levelId, prefix, jumps, stopX)
  let best = { jumps, r, s: score(r) }
  const consider = (cand: Jumps) => {
    cand.sort((a, b) => a[0] - b[0])
    const rr = runSegment(levelId, prefix, cand, stopX)
    const s = score(rr)
    if (s > best.s + 0.01) best = { jumps: cand, r: rr, s }
  }
  for (let iter = 0; iter < 40; iter++) {
    const before = best.s
    const lo = Math.max(fromX, (jumps.at(-1)?.[0] ?? fromX) - 6)
    const hi = r.ok ? stopX : r.x + 0.5
    for (let a = lo; a <= hi; a += 0.2) for (const h of HOLDS) consider([...jumps.filter((k) => k[0] < a), [+a.toFixed(1), h]])
    // also retune / insert while keeping the rest (catches missed motes behind the front)
    if (best.s <= before + 0.01)
      for (let a = fromX; a <= hi; a += 0.2)
        for (const h of HOLDS) {
          consider([...jumps, [+a.toFixed(1), h]])
          jumps.forEach((k, ki) => Math.abs(k[0] - a) < 3 && consider(jumps.map((q, qi) => (qi === ki ? [+a.toFixed(1), h] : q))))
        }
    if (best.s <= before + 0.01) break
    jumps = best.jumps
    r = best.r
    if (log) console.error(`  seg iter ${iter}: ${JSON.stringify(jumps)} -> ${r.ok ? 'ok' : 'not yet'}, x ${r.x.toFixed(1)}, motes ${r.motes}${r.died ? ', dies' : ''}`)
  }
  return { jumps, result: r }
}
