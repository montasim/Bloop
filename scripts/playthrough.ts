// Scripted full playthroughs: one bot per level, each must collect EVERY mote with 0 deaths and reach the gate.
// A level without a bot fails the check. If you edit a level, its bot's waypoints may need nudging.
// Run: `pnpm check:game`
import assert from 'node:assert/strict'
import { Game, type GameEvent } from '../src/game/engine.ts'
import { T } from '../src/game/level.ts'
import { LEVELS } from '../src/game/levels/index.ts'
import { Bot, jumpsBot, runSteps, springboard, timed, type Step } from './bot.ts'
import { BOTS } from './bots/index.ts'

const bots: Record<string, (b: Bot) => Step[]> = {
  // solved with `node scripts/solve-level.ts two-lights`
  'two-lights': jumpsBot([[13.5, 0.2], [25.2, 1.2], [39.5, 1.2], [61, 1.2], [61, 1.2], [85.4, 1.2], [96, 0.3], [122.5, 0.12], [125.2, 1.2], [149.4, 1.2], [156, 0.2]]),

  // segments solved with scripts/solve-segment.ts, joined by the shared springboard step
  'root-maze': (b) => [
    timed(b, 'opening', [[7.4, 0.3], [8, 1.2], [14.6, 1.2]], () => b.x() >= 38.5 && b.landed()),
    ...springboard(b, 'springboard', 40.9, 45.5),
    timed(b, 'shelf', [[50, 0.05], [50.2, 0.05]], () => b.x() >= 63.5 && b.landed()),
    timed(b, 'islands + corridor', [[65.5, 0.2], [95.7, 0.3], [101.9, 1.2], [101.9, 0.2]], () => b.x() >= 119 && b.landed()),
    timed(b, 'pillar stair', [[119, 0.12], [125.2, 1.2]], () => b.x() >= 147.5 && b.landed()),
    ...springboard(b, 'finale springboard', 150.9, 155.5),
    timed(b, 'into the gate', [], () => b.g.state === 'won'),
  ],

  // Hand-written where a player would stop and think (the solver only rolls right):
  // the top-ledge climb needs a stop to line up, and springboards need waiting for the beetle.
  'high-hops': (b) => {
    let stopX = 0
    return [
      timed(b, 'steps', [[7.0, 0.05], [11.8, 0.4], [16.6, 0.5]], () => b.x() > 23.6 && b.landed()),
      { name: 'to the first ledge', until: () => b.x() > 25.2 },
      { name: 'onto the first ledge', start: () => b.jump(0.7), until: () => b.landed() && b.y() < 10 && b.x() > 27.2 },
      { name: 'onto the middle ledge', start: () => b.jump(0.4), until: () => b.landed() && b.y() < 7 && b.x() > 32 },
      { name: 'stop on the middle ledge', start: b.stop, until: () => Math.abs(b.g.ball.vx) < 5 && b.landed() },
      // a short run-up from wherever it stopped: jumping from a dead stop falls short of the gap
      { name: 'run up', start: () => ((stopX = b.x()), b.right()), until: () => b.x() > Math.max(33.5, stopX + 0.25) },
      { name: 'jump to the top ledge', start: () => b.jump(0.4), until: () => b.landed() && b.y() < 4 && b.x() > 37 },
      { name: 'drop down', start: b.right, until: () => b.x() > 49.4 && b.landed() && b.y() > 12 },
      ...springboard(b, 'springboard', 50.9, 55.5),
      timed(b, 'pit, windows, pillars', [[72, 1.2], [86.4, 0.12], [94.6, 1.2], [104.4, 0.3], [116.8, 0.3]], () => b.x() > 120 && b.landed() && b.y() > 12),
      ...springboard(b, 'finale springboard', 124.9, 129.5),
      { name: 'into the gate', start: b.right, until: () => b.g.state === 'won' },
    ]
  },

  // re-solved (beam search over landing-triggered jumps) after the bounce/coyote/corner engine fixes
  'beetle-hollow': jumpsBot([[5.6, 0.3], [22, 0.7], [32, 0.2], [32.2, 0.05], [41.5, 0.3], [55.8, 0.3], [69, 0.3], [77.5, 1.2], [92, 1.2], [114.4, 1.2]]),
  // re-solved after the engine fixes: first 8 jumps from solve-level.ts, the tail from a beam search
  'thorn-path': jumpsBot([[10.2, 0.12], [18.6, 0.3], [25.2, 0.7], [40.5, 0.12], [40.7, 0.7], [64.1, 0.12], [66, 0.3], [79.8, 0.7], [90.88, 0.12]]),

  'first-light': (b) => [
    { name: 'roll', start: b.right, until: () => b.x() > 13.6 },
    { name: 'hop the step', start: () => b.jump(0.12), until: () => b.x() > 17.3 && b.landed() },
    { name: 'to stair', until: () => b.x() > 18.6 },
    { name: 'stair 1', start: () => b.jump(0.3), until: () => b.x() > 20.3 && b.landed() },
    { name: 'stair 2', start: () => b.jump(0.5), until: () => b.x() > 23.4 && b.landed() },
    { name: 'drop into ditch', until: () => b.x() > 31.4 && b.landed() },
    { name: 'out of ditch', start: () => b.jump(0.25), until: () => b.x() > 41.2 && b.landed() },
    { name: 'tall wall', start: () => b.jump(0.6), until: () => b.x() > 46 && b.landed() },
    { name: 'to thorns', until: () => b.x() > 55.3 && b.landed() },
    { name: 'hop thorns', start: () => b.jump(0.35), until: () => b.x() > 60 && b.landed() },
    { name: 'to last mote', until: () => b.x() > 66.4 },
    { name: 'hop into gate', start: () => b.jump(0.2), until: () => b.g.state === 'won' },
  ],

  garden: (b) => {
    let hopped = false
    return [
      { name: 'to step block', start: b.right, until: () => b.x() > 9.2 },
      { name: 'onto block', start: () => b.jump(0.3), until: () => b.x() > 11 },
      { name: 'roll off block', until: () => b.x() > 15.7 && b.landed() },
      { name: 'jump pit', start: () => b.jump(0.45), until: () => b.x() > 21.5 && b.landed() },
      { name: 'through amber wall', until: () => b.x() > 26.2 },
      {
        name: 'past beetle 2',
        tick: () => {
          if (!hopped && b.landed() && Math.abs(b.g.beetles[1].x / T - b.x()) < 2.6) {
            hopped = true
            b.jump(0.1)
          }
        },
        until: () => !b.g.beetles[1].alive || b.x() > 29.6,
      },
      { name: 'onto bridge', until: () => b.x() > 30.9 && b.landed() },
      { name: 'hop bridge mote 1', start: () => b.jump(0.05), until: () => b.x() > 35.3 && b.landed() },
      { name: 'hop bridge mote 2', start: () => b.jump(0.05), until: () => b.x() > 44 },
      { name: 'roll the ceiling', until: () => b.g.g === -1 && b.landed() && b.x() > 58.4 },
      { name: 'hop hanging thorns', start: () => b.jump(0.3), until: () => b.x() > 66 },
      { name: 'drop back down', until: () => b.g.g === 1 && b.landed() && b.x() > 69 },
      { name: 'push crate to ledge', until: () => b.g.crates[0].x + 30 >= 90 * T - 0.5 },
      { name: 'back for platform', start: b.left, until: () => b.x() < 79.2 },
      { name: 'turn around', start: b.right, until: () => b.x() > 79.9 },
      { name: 'platform mote', start: () => b.jump(0.4), until: () => b.x() > 85 },
      { name: 'to crate', until: () => b.g.ball.vx === b.g.crates[0].vx && b.x() > 87 },
      { name: 'climb to gate', start: () => b.jump(9), until: () => b.g.state === 'won' },
    ]
  },
}

// LEVEL=<id> runs just one level (lets several levels be built side by side)
const only = process.env.LEVEL
const allBots: Record<string, (b: Bot) => Step[]> = { ...bots, ...BOTS }
const heardAll = new Set<GameEvent['type']>()
for (const def of LEVELS) {
  if (only && def.id !== only) continue
  const script = allBots[def.id]
  assert.ok(script, `level "${def.id}" has no bot playthrough`)
  const g = new Game(def.build())
  const b = new Bot(g)
  const r = runSteps(g, b, script(b), {
    limitSecs: 300, // crate+beetle levels spend a lot of game time waiting on patrols
    onFrame: () => {
      for (const e of g.events) heardAll.add(e.type)
      g.events.length = 0
    },
  })
  assert.ok(!r.died, `${def.id}: died during "${r.stuckAt}" at x=${r.x.toFixed(1)} y=${b.y().toFixed(1)}`)
  assert.ok(r.won, `${def.id}: stuck at "${r.stuckAt}" x=${r.x.toFixed(1)}`)
  assert.equal(g.collected, g.total, `${def.id}: missed motes at ${r.missed.join(' ')}`)
  console.log(`  ${def.id}: won ${g.collected}/${g.total} motes in ${g.time.toFixed(1)}s, 0 deaths`)
}
if (!only)
  for (const t of ['jump', 'impact', 'mote', 'phase', 'gravity', 'checkpoint', 'push', 'gate', 'win'] as const)
  assert.ok(heardAll.has(t), `no '${t}' sound event across the playthroughs`)
console.log(`playthroughs passed (${LEVELS.length} levels)`)
