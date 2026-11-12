// Dev tool: searches a "hold right + timed jumps" route through a level that collects every mote
// with 0 deaths, and prints it as a bot script for scripts/playthrough.ts.
// Usage: node scripts/solve-level.ts <level-id>
// Only finds left-to-right routes; levels that need backtracking (e.g. crate puzzles) need hand-written bots.
import { Game } from '../src/game/engine.ts'
import { T } from '../src/game/level.ts'
import { LEVELS } from '../src/game/levels/index.ts'

export type Jump = { at: number; hold: number }
type Result = { won: boolean; died: boolean; reach: number; motes: Set<number>; time: number; passed: boolean }

export const HOLDS = [0.05, 0.12, 0.2, 0.3, 0.4, 0.5, 0.7, 1.2]

/** stopAt: end early (passed=true) once the ball has landed at or beyond this x. */
export function simulate(levelId: string, jumps: Jump[], limit = 150, stopAt = Infinity): Result {
  const def = LEVELS.find((l) => l.id === levelId)!
  const g = new Game(def.build())
  g.input.right = true
  let j = 0
  let hold = 0
  let reach = g.ball.x / T
  let lastGain = 0
  let passed = false
  for (let t = 0; t < limit * 120; t++) {
    const x = g.ball.x / T
    if (j < jumps.length && x > jumps[j].at && g.grounded) {
      g.input.jumpPressed = g.input.jumpHeld = true
      hold = jumps[j++].hold
    }
    if (hold > 0 && (hold -= 1 / 120) <= 0) g.input.jumpHeld = false
    g.step(1 / 120)
    g.events.length = 0
    if (g.deaths > 0 || g.state === 'won') break
    if (x >= stopAt && g.grounded) {
      passed = true
      break
    }
    if (x > reach + 0.25) {
      reach = x
      lastGain = t
    }
    if (t - lastGain > 120 * 3) break // stuck
  }
  const motes = new Set<number>()
  g.level.motes.forEach((m, i) => m.taken && motes.add(i))
  return { won: g.state === 'won', died: g.deaths > 0, reach, motes, time: g.time, passed: passed || g.state === 'won' }
}

const score = (r: Result) => (r.won ? 10000 : 0) + r.motes.size * 100 + r.reach - (r.died ? 5 : 0)

export function solve(levelId: string, log = false): { jumps: Jump[]; result: Result } {
  const total = LEVELS.find((l) => l.id === levelId)!.build().motes.length
  let jumps: Jump[] = []
  let r = simulate(levelId, jumps)
  // phase 1: get through the level; phase 2 (refine, below) goes after missed motes
  for (let iter = 0; iter < 80 && !r.won; iter++) {
    // try inserting one jump anywhere up to where the run currently fails (or the last mote it missed)
    const lo = Math.max(2, (jumps.at(-1)?.at ?? 2) - 6)
    const hi = r.won ? lo + 100 : r.reach + 0.5
    let best = { jumps, r, s: score(r) }
    for (let at = lo; at <= hi; at += 0.2) {
      for (const hold of HOLDS) {
        const cand = [...jumps.filter((k) => k.at < at), { at: +at.toFixed(1), hold }]
        const rr = simulate(levelId, cand)
        const s = score(rr)
        if (s > best.s + 0.01) best = { jumps: cand, r: rr, s }
      }
    }
    if (best.jumps === jumps && !r.won) {
      // no single jump helps: some spots need two in a row (e.g. clear a beetle, then a pit). Try pairs, coarser grid.
      const PAIR_HOLDS = [0.12, 0.3, 0.7]
      const plo = Math.max(lo, r.reach - 10)
      for (let a = plo; a <= hi; a += 0.4) {
        for (const h1 of PAIR_HOLDS) {
          for (let b = a + 0.2; b <= hi + 4; b += 0.4) {
            for (const h2 of PAIR_HOLDS) {
              const cand = [...jumps.filter((k) => k.at < a), { at: +a.toFixed(1), hold: h1 }, { at: +b.toFixed(1), hold: h2 }]
              const rr = simulate(levelId, cand)
              const s = score(rr)
              if (s > best.s + 0.01) best = { jumps: cand, r: rr, s }
            }
          }
        }
      }
      if (best.jumps === jumps) break // genuinely stuck
    }
    jumps = best.jumps
    r = best.r
    if (log) console.error(`  iter ${iter}: ${jumps.length} jumps, reach ${r.reach.toFixed(1)}, motes ${r.motes.size}/${total}${r.won ? ', won' : ''}${r.died ? ', dies' : ''}`)
  }

  // refine: for each missed mote, edit/insert jumps near it while keeping the rest of the route
  const lv = LEVELS.find((l) => l.id === levelId)!.build()
  for (let pass = 0; pass < 3 && !(r.won && r.motes.size === total); pass++) {
    for (let mi = 0; mi < lv.motes.length; mi++) {
      if (r.motes.has(mi)) continue
      const mx = lv.motes[mi].x / T
      let best = { jumps, r, s: score(r) }
      const consider = (cand: Jump[]) => {
        cand.sort((a, b) => a.at - b.at)
        const rr = simulate(levelId, cand)
        const s = score(rr)
        if (s > best.s + 0.01) best = { jumps: cand, r: rr, s }
      }
      for (let at = mx - 7; at <= mx + 0.5; at += 0.2) {
        for (const hold of HOLDS) {
          const a = +at.toFixed(1)
          consider([...jumps, { at: a, hold }]) // insert
          jumps.forEach((k, ki) => {
            if (Math.abs(k.at - a) < 3) consider(jumps.map((q, qi) => (qi === ki ? { at: a, hold } : q))) // move/retune
          })
        }
      }
      if (best.jumps === jumps) {
        // single edits failed: try a pair of new jumps leading up to the mote
        const PH = [0.12, 0.3, 0.7, 1.2]
        for (let a = mx - 8; a <= mx + 0.5; a += 0.4)
          for (const h1 of PH)
            for (let b = a + 0.4; b <= mx + 1; b += 0.4)
              for (const h2 of PH) consider([...jumps, { at: +a.toFixed(1), hold: h1 }, { at: +b.toFixed(1), hold: h2 }])
      }
      jumps = best.jumps
      r = best.r
      if (log) console.error(`  refine mote ${mi} @${mx.toFixed(0)}: motes ${r.motes.size}/${total}${r.won ? ', won' : ''}${r.died ? ', dies' : ''}`)
    }
  }
  return { jumps, result: r }
}

if (import.meta.main) {
  const id = process.argv[2]
  if (!LEVELS.some((l) => l.id === id)) {
    console.error(`unknown level "${id}". Known: ${LEVELS.map((l) => l.id).join(', ')}`)
    process.exit(1)
  }
  const { jumps, result } = solve(id, true)
  const total = LEVELS.find((l) => l.id === id)!.build().motes.length
  console.log(`${id}: ${result.won ? 'WON' : 'NOT WON'} ${result.motes.size}/${total} motes, ${result.died ? 'dies' : '0 deaths'}, ${result.time.toFixed(1)}s`)
  console.log(`  '${id}': jumpsBot([${jumps.map((k) => `[${k.at}, ${k.hold}]`).join(', ')}]),`)
  if (!result.won || result.motes.size < total) {
    const lv = LEVELS.find((l) => l.id === id)!.build()
    const missed = lv.motes.map((m, i) => (result.motes.has(i) ? null : `${m.x / T - 0.5},${m.y / T - 0.5}`)).filter(Boolean)
    console.log(`  missed motes: ${missed.join(' ')}  (reached x=${result.reach.toFixed(1)})`)
    process.exit(2)
  }
}
