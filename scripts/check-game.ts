// Headless sanity check of the game physics: `pnpm check:game`
import assert from 'node:assert/strict'
import { Game, R } from '../src/game/engine.ts'
import { T, makeLevel, type Tile } from '../src/game/level.ts'
import { garden } from '../src/game/levels/garden.ts'
import { LEVELS } from '../src/game/levels/index.ts'

const run = (g: Game, secs: number) => {
  for (let i = 0; i < secs * 120; i++) g.step(1 / 120)
}
const groundY = 13 * T - R

// settles on the ground
let g = new Game(garden.build())
run(g, 1)
assert.ok(g.grounded, 'ball should rest on ground')
assert.ok(Math.abs(g.ball.y - groundY) < 1, `ball y ${g.ball.y} should be ~${groundY}`)

// the run timer waits for the first move
assert.equal(g.time, 0, 'timer must not run before the player moves')
g.input.right = true
run(g, 0.5)
assert.ok(g.time > 0.4 && g.time <= 0.51, `timer should run once moving, got ${g.time}`)
g = new Game(garden.build())
run(g, 1)

// rolling right collects the first two motes, and the step block stops it without a jump
g.input.right = true
run(g, 3)
assert.ok(g.collected >= 2, `collected ${g.collected}`)
assert.ok(g.ball.x < 10 * T, 'step block should stop the ball')

// jumping clears the step block
g.beetles = []
g.input.jumpPressed = g.input.jumpHeld = true
run(g, 1.5)
assert.ok(g.ball.x > 13 * T, `jump should clear step, x=${g.ball.x}`)

// rolling through the cyan curtain turns the ball cyan and it passes the amber wall
g = new Game(garden.build())
g.beetles = []
Object.assign(g.ball, { x: 22.5 * T, y: groundY })
g.input.right = true
run(g, 1.2)
assert.equal(g.phase, 'cyan')
assert.ok(g.ball.x > 27 * T, 'cyan ball should pass the amber wall')

// without the curtain the amber wall blocks
g = new Game(garden.build())
g.level.tiles.forEach((row) => (row[24] = '.'))
Object.assign(g.ball, { x: 22.5 * T, y: groundY })
g.input.right = true
run(g, 2)
assert.ok(g.ball.x < 26 * T, 'amber wall should block amber ball')

// beetle: side contact kills, landing on top squashes it and bounces the ball
g = new Game(garden.build())
const bug = g.beetles[0]
Object.assign(g.ball, { x: bug.x - 40, y: groundY })
g.input.right = true
run(g, 1)
assert.equal(g.deaths, 1, 'rolling into a beetle should kill')
g = new Game(garden.build())
const bug2 = g.beetles[0]
Object.assign(g.ball, { x: bug2.x, y: bug2.y - 60, vy: 200 })
run(g, 0.3)
assert.equal(g.deaths, 0)
assert.equal(bug2.alive, false, 'stomp should squash the beetle')

// squashed beetles regrow once you're away (so springboards can't be used up), and reset on respawn
run(g, 1)
assert.equal(bug2.alive, false)
Object.assign(g.ball, { x: bug2.sx + 8 * T, y: groundY, vx: 0, vy: 0 })
run(g, 7)
assert.equal(bug2.alive, true, 'beetle should regrow after a few seconds')
g = new Game(garden.build())
g.beetles[0].alive = false
Object.assign(g.ball, { x: 18.5 * T, y: 13 * T }) // into the thorns
run(g, 2)
assert.equal(g.deaths, 1)
assert.equal(g.beetles[0].alive, true, 'beetles reset when you respawn')

// crate: rolling into it pushes it; it stops against the ledge
g = new Game(garden.build())
const crate = g.crates[0]
const startX = crate.x
Object.assign(g.ball, { x: crate.x - 40, y: groundY })
g.input.right = true
run(g, 4)
assert.ok(crate.x > startX + 2 * T, `crate should be pushed, moved ${crate.x - startX}`)
assert.ok(crate.x + 30 <= 90 * T + 0.01, 'crate must stop at the ledge')

// thorns kill and respawn
g = new Game(garden.build())
Object.assign(g.ball, { x: 18.5 * T, y: 13 * T })
run(g, 0.5)
assert.equal(g.deaths, 1)
run(g, 1)
assert.equal(g.state, 'playing')

// gravity pad flips the ball onto the ceiling
g = new Game(garden.build())
Object.assign(g.ball, { x: 46.5 * T, y: groundY })
run(g, 1.5)
assert.equal(g.g, -1)
assert.ok(g.grounded && g.ball.y < 4 * T, `should rest on ceiling, y=${g.ball.y}`)

// you can't leave the gravity section upside-down. Rolling back left off the ceiling used to strand
// the ball on the roof (real bug); the jump-past-the-far-field case is a guard for future level edits.
g = new Game(garden.build())
Object.assign(g.ball, { x: 64 * T, y: 3 * T + R })
g.g = -1
g.input.right = true
g.input.jumpPressed = g.input.jumpHeld = true // leap "down" right as you reach the field
run(g, 2.5)
assert.equal(g.g, 1, 'jumping past the far field must still flip gravity back')
g = new Game(garden.build())
Object.assign(g.ball, { x: 45.5 * T, y: 3 * T + R })
g.g = -1
g.input.left = true
run(g, 2)
assert.equal(g.g, 1, 'rolling back left off the ceiling must flip gravity back')

// the gate is always open: motes are score, not a requirement
g = new Game(garden.build())
Object.assign(g.ball, { x: 91 * T, y: 9 * T - R })
g.input.right = true
run(g, 1)
assert.equal(g.state, 'won', 'gate must open even with no motes')
assert.equal(g.collected, 0)

// crates are solid to each other: a falling crate stacks, a pushed crate stops against another
{
  const two = new Game(
    makeLevel(30, ({ crate }) => {
      crate(10, 12)
      crate(10, 5) // falls onto the first
      crate(14, 12)
    }),
  )
  for (let i = 0; i < 240; i++) two.step(1 / 120)
  const [a, top, c] = two.crates
  assert.ok(Math.abs(top.y - (a.y - 30)) < 0.5 && top.grounded, `falling crate should rest on the one below (y ${top.y} vs ${a.y})`)
  Object.assign(two.ball, { x: 6 * T, y: groundY })
  two.input.right = true
  for (let i = 0; i < 120 * 4; i++) two.step(1 / 120)
  assert.ok(a.x + 30 <= c.x + 0.5, 'a pushed crate must stop against the next crate, not pass through it')
}

// crate regressions (found while building levels 16-19)
{
  // a crate pushed into an oncoming beetle stops at it instead of sliding over it
  for (let k = 0; k < 6; k++) {
    const gb = new Game(makeLevel(40, ({ crate, beetle, fill }) => (crate(10, 12), beetle(18, 12), fill(25, 12, 25, 12, '#'))))
    for (let i = 0; i < k * 30; i++) gb.step(1 / 120)
    Object.assign(gb.ball, { x: 7 * T, y: groundY })
    gb.input.right = true
    for (let i = 0; i < 120 * 4 && gb.deaths === 0; i++) {
      gb.step(1 / 120)
      const c = gb.crates[0]
      const bt = gb.beetles[0]
      const ox = Math.min(c.x + 30, bt.x + 12) - Math.max(c.x, bt.x - 12)
      assert.ok(!(ox > 4 && Math.abs(c.y + 15 - bt.y) < 20), 'a pushed crate must not slide over a beetle')
    }
  }
  // a crate pushed across a crate sitting in a 1-wide slot (2 px low) slides over it instead of snagging
  const gs = new Game(makeLevel(40, ({ crate, fill }) => (fill(14, 13, 14, 13, '.'), crate(14, 12), crate(11, 12))))
  for (let i = 0; i < 120; i++) gs.step(1 / 120)
  Object.assign(gs.ball, { x: 8 * T, y: groundY })
  gs.input.right = true
  for (let i = 0; i < 120 * 5; i++) gs.step(1 / 120)
  assert.ok(gs.crates[1].x / T > 16, `crate should slide across the filled slot, stopped at ${(gs.crates[1].x / T).toFixed(2)}`)
}

// physics regressions (each was a real quirk found while building levels 13-15)
{
  // 1. bounces ramp smoothly: a flip in a 4-row tube behaves the same for tiny timing differences
  const tube = () =>
    makeLevel(40, ({ fill }) => {
      fill(0, 0, 39, 8, '#')
      fill(10, 9, 10, 12, 'U')
    })
  const kinds = new Set<number>()
  for (let k = 0; k < 20; k++) {
    const t = new Game(tube())
    Object.assign(t.ball, { x: (6 + k * 0.013) * T, y: groundY })
    t.input.right = true
    let bounces = 0
    let lastVy = 0
    for (let i = 0; i < 240; i++) {
      t.step(1 / 120)
      if (t.g === -1 && lastVy < -50 && t.ball.vy > 30) bounces++
      lastVy = t.ball.vy
    }
    kinds.add(bounces)
  }
  assert.equal(kinds.size, 1, `tube flips must be consistent, saw bounce counts ${[...kinds]}`)

  // 2. a colour change under you leaves no coyote grace: the jump must not fire
  const road = new Game(makeLevel(40, ({ fill }) => (fill(5, 3, 30, 3, 'C'), fill(18, 4, 18, 5, 'a'))))
  road.phase = 'cyan'
  road.g = -1
  Object.assign(road.ball, { x: 14 * T, y: 4 * T + R, vx: 0, vy: 0 })
  for (let i = 0; i < 30; i++) road.step(1 / 120)
  road.input.right = true
  for (let i = 0; i < 600 && road.phase === 'cyan'; i++) road.step(1 / 120)
  road.input.jumpPressed = road.input.jumpHeld = true
  road.step(1 / 120)
  assert.ok(road.ball.vy < 100, 'no jump once the coloured floor vanished under you')

  // 3. a max-speed fall onto an outer corner doesn't fling the ball faster than it can roll
  let worst = 0
  for (let k = 0; k <= 30; k++) {
    const c = new Game(makeLevel(40, ({ fill }) => fill(15, 9, 17, 12, '#')))
    Object.assign(c.ball, { x: (14.4 + k * 0.04) * T, y: 1.5 * T, vx: 0, vy: 900 })
    for (let i = 0; i < 40; i++) {
      c.step(1 / 120)
      worst = Math.max(worst, Math.abs(c.ball.vx))
    }
  }
  assert.ok(worst <= 270, `corner landing flung the ball at ${worst.toFixed(0)} px/s`)
}

// every level: structural rules from docs/levels.md
const only = process.env.LEVEL // LEVEL=<id>: structural checks for one level only
const ids = new Set<string>()
const solidAny = (t: Tile) => t === '#' || t === 'A' || t === 'C'
for (const def of LEVELS) {
  if (only && def.id !== only) continue
  const lv = def.build()
  const at = (px: number, py: number) => lv.tiles[Math.floor(py / T)]?.[Math.floor(px / T)]
  assert.ok(!ids.has(def.id), `duplicate level id ${def.id}`)
  ids.add(def.id)
  assert.equal(lv.h, 16, `${def.id}: levels are 16 tall`)
  assert.ok(lv.tiles.every((r) => r.length === lv.w), `${def.id}: ragged rows`)
  assert.ok(!solidAny(at(lv.start.x, lv.start.y)!), `${def.id}: start is inside a block`)
  assert.ok(at(lv.exit.x + T, lv.exit.y) === '#', `${def.id}: gate must sit against a wall`)
  for (const m of lv.motes) assert.ok(at(m.x, m.y) !== '#', `${def.id}: mote inside rock at ${m.x / T - 0.5},${m.y / T - 0.5}`)
  // a fresh game settles at the start without dying
  const fresh = new Game(lv)
  run(fresh, 1.5)
  assert.equal(fresh.deaths, 0, `${def.id}: dies at the start`)
  assert.ok(fresh.grounded, `${def.id}: start should land on ground`)
}

// levels grow: each is wider than the last, and lanterns keep pace (no stretch longer than MAX_GAP tiles)
const MAX_GAP = 30
let prevW = 0
for (const def of LEVELS) {
  const lv = def.build()
  if (def.id !== 'garden') {
    // garden is parked in a temporary slot until its planned #18 position exists
    assert.ok(lv.w > prevW, `${def.id}: should be wider than the level before (${lv.w} <= ${prevW})`)
    prevW = lv.w
  }
  if (only && def.id !== only) continue // widths are checked across all levels; the rest only for the level asked for
  // respawning resets beetles, so a lantern must not sit where a beetle starts
  for (const c of lv.checkpoints)
    for (const bt of lv.beetles) {
      const near = Math.abs(bt.x + 0.5 - c.x / T) < 3 && Math.abs(bt.y + 0.5 - c.y / T) <= 1
      assert.ok(!near, `${def.id}: lantern at x=${(c.x / T).toFixed(0)} is next to a beetle spawn at ${bt.x}`)
    }
  const saves = [lv.start.x, ...lv.checkpoints.map((c) => c.x), lv.exit.x].map((x) => x / T).sort((a, b) => a - b)
  for (let i = 1; i < saves.length; i++)
    assert.ok(saves[i] - saves[i - 1] <= MAX_GAP, `${def.id}: ${(saves[i] - saves[i - 1]).toFixed(0)} tiles without a lantern after x=${saves[i - 1].toFixed(0)}`)
}

console.log(`game checks passed (${LEVELS.length} levels)`)
