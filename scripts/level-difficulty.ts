// Dev tool: how forgiving is each jump on a solved route?
// For every jump, shifts its timing earlier/later (holding the rest fixed) and reports the window
// in which the run still survives to the gate. Narrow windows = hard jumps.
// Usage: node scripts/level-difficulty.ts <level-id>   (solves the route first)
import { HOLDS, simulate, solve, type Jump } from './solve-level.ts'

const SPEED = 270 / 32 // tiles per second at full roll speed

/** Window for one jump: shift its timing (with the given hold) and judge only this obstacle. */
function windowFor(levelId: string, jumps: Jump[], i: number, hold: number) {
  // judge this obstacle alone: survive until landed past the next jump's trigger point
  const stop = jumps[i + 1] ? jumps[i + 1].at + 0.1 : Infinity
  const ok = (d: number) => {
    const cand = jumps.map((k, ki) => (ki === i ? { at: k.at + d, hold } : k)).slice(0, i + 1)
    const r = simulate(levelId, cand, 150, stop)
    return r.passed && !r.died
  }
  if (!ok(0)) return 0
  let lo = 0
  let hi = 0
  while (lo > -2 && ok(lo - 0.05)) lo -= 0.05
  while (hi < 2 && ok(hi + 0.05)) hi += 0.05
  return hi - lo
}

/** Per jump, the widest timing window over all hold lengths (players pick their own hold). */
export function windows(levelId: string, jumps: Jump[]) {
  return jumps.map((j, i) => {
    let tiles = 0
    let hold = j.hold
    for (const h of HOLDS) {
      const t = windowFor(levelId, jumps, i, h)
      if (t > tiles) [tiles, hold] = [t, h]
    }
    return { at: j.at, hold, tiles, ms: Math.round((tiles / SPEED) * 1000) }
  })
}

if (import.meta.main) {
  const id = process.argv[2]
  const { jumps, result } = solve(id)
  console.log(`${id}: ${result.won ? 'won' : 'NOT WON'}, ${jumps.length} jumps`)
  const ws = windows(id, jumps)
  for (const w of ws) console.log(`  jump at x=${w.at.toFixed(1)} hold ${w.hold}s: survive window ${w.tiles.toFixed(2)} tiles ≈ ${w.ms} ms`)
  const hard = ws.filter((w) => w.ms < 4000).map((w) => w.ms)
  console.log(`  tightest: ${Math.min(...ws.map((w) => w.ms))} ms, median: ${hard.sort((a, b) => a - b)[Math.floor(hard.length / 2)] ?? '-'} ms`)
}
