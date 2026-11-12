import { T, type Level, type Tile } from './level.ts'
import { SKINS, drawWisp, type Skin } from './skins.ts'
import { THEMES, drawAmbient, drawBackdrop, drawCeilingDecor, drawFog, drawGroundDecor, drawWater, rand, type Theme } from './themes.ts'

export type Phase = 'amber' | 'cyan'

export interface Input {
  left: boolean
  right: boolean
  jumpHeld: boolean
  jumpPressed: boolean // edge, consumed by update
}

export const R = 12
const GRAV = 1500
const ACCEL = 1100
const AIR_ACCEL = 750
const MAX_VX = 270
const FRICTION = 900
const JUMP_V = 560
const JUMP_CUT = 220 // releasing jump early caps upward speed here
const MAX_FALL = 900
const BOUNCE_E = 0.45
// Restitution ramps smoothly from 0 (impacts below BOUNCE_LO) to BOUNCE_E (above BOUNCE_HI).
// A hard cutoff made bounces a coin-flip whenever an impact landed near it (e.g. a second bounce in a 4-row tube).
const BOUNCE_LO = 230
const BOUNCE_HI = 250
const CORNER_KICK = 150 // max sideways speed an outer corner can add on a hard impact
const CORNER_HARD = 750 // only impacts faster than this count (big falls); ordinary corner contacts are untouched
const COYOTE = 0.1
const BUFFER = 0.12
const STEP = 1 / 120
export const CRATE = 30 // crate size, a bit under a tile so it slides past seams
const PUSH_V = 140
const CRATE_STEP = 3 // a crate rides up lips this small instead of snagging
const CRATE_FRICTION = 900
export const BEETLE_W = 24
export const BEETLE_H = 16
const BEETLE_V = 45
const STOMP_V = 480
const BEETLE_REGROW = 6 // seconds before a squashed beetle comes back (so springboard beetles can't be used up)

/** Things that happened this frame; the UI drains them to play sounds. */
export type GameEvent =
  | { type: 'jump' | 'bump' | 'checkpoint' | 'stomp' | 'push' | 'die' | 'gate' | 'win' | 'splash' }
  | { type: 'impact'; v: number } // landing speed
  | { type: 'mote'; n: number } // how many collected so far
  | { type: 'gravity'; up: boolean }
  | { type: 'phase'; to: Phase }

interface Crate {
  x: number // top-left
  y: number
  vx: number
  vy: number
  grounded: boolean
  sx: number
  sy: number
}

interface Beetle {
  x: number // centre
  y: number
  dir: 1 | -1
  alive: boolean
  squash: number
  dead: number // seconds since squashed
  sx: number // spawn
  sy: number
}

export const COLORS = { amber: '#ffb347', cyan: '#4de1ff' } as const

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
  size: number
}

export class Game {
  level: Level
  theme: Theme
  skin: Skin = SKINS[0]
  input: Input = { left: false, right: false, jumpHeld: false, jumpPressed: false }
  ball = { x: 0, y: 0, vx: 0, vy: 0, angle: 0 }
  g: 1 | -1 = 1
  phase: Phase = 'amber'
  grounded = false
  state: 'playing' | 'dead' | 'won' = 'playing'
  /** Run time: starts on the player's first move, not when the level opens. */
  time = 0
  started = false
  private clock = 0 // always ticking; used for sound throttles
  deaths = 0
  collected = 0
  particles: Particle[] = []
  trail: { x: number; y: number }[] = []
  crates: Crate[]
  beetles: Beetle[]
  events: GameEvent[] = []
  private lastImpact = 0
  private lastPush = 0
  private lastRipple = 0
  private respawn: { x: number; y: number; phase: Phase }
  private coyote = 0
  private buffer = 0
  private jumping = false
  private deadTimer = 0
  private acc = 0
  private cam = { x: 0, y: 0, ready: false }

  constructor(level: Level) {
    this.level = level
    this.theme = THEMES[level.theme]
    this.respawn = { x: level.start.x, y: level.start.y + T / 2 - R, phase: 'amber' }
    this.crates = level.crates.map((c) => {
      const x = c.x * T + (T - CRATE) / 2
      const y = c.y * T + T - CRATE
      return { x, y, vx: 0, vy: 0, grounded: true, sx: x, sy: y }
    })
    this.beetles = level.beetles.map((b) => {
      const x = b.x * T + T / 2
      const y = b.y * T + T - BEETLE_H / 2
      return { x, y, dir: -1, alive: true, squash: 0, dead: 0, sx: x, sy: y }
    })
    this.spawn()
  }

  get total() {
    return this.level.motes.length
  }

  private spawn() {
    Object.assign(this.ball, { x: this.respawn.x, y: this.respawn.y, vx: 0, vy: 0 })
    this.phase = this.respawn.phase
    this.g = 1
    this.state = 'playing'
    this.trail = []
    this.jumping = false
    // crates go home on respawn so a badly-pushed crate can never soft-lock the level
    for (const c of this.crates) Object.assign(c, { x: c.sx, y: c.sy, vx: 0, vy: 0 })
    for (const b of this.beetles) Object.assign(b, { x: b.sx, y: b.sy, dir: -1, alive: true, squash: 0, dead: 0 })
  }

  /** Crates and beetles ignore phase: every block is solid to them. */
  private hard(tx: number, ty: number) {
    const t = this.tileAt(tx, ty)
    return t === '#' || t === '~' || t === 'A' || t === 'C'
  }

  private boxHitsTiles(x: number, y: number, w: number, h: number) {
    for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 0.01) / T); ty++)
      for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 0.01) / T); tx++) if (this.hard(tx, ty)) return true
    return false
  }

  private crateAt(px: number, py: number) {
    return this.crates.some((c) => px >= c.x && px <= c.x + CRATE && py >= c.y && py <= c.y + CRATE)
  }

  private moveCrate(c: Crate, dt: number) {
    c.vy = Math.min(c.vy + GRAV * dt, MAX_FALL)
    c.x += c.vx * dt
    if (this.boxHitsTiles(c.x, c.y, CRATE, CRATE)) {
      // a lip of a few px (e.g. coming out of the dip over a crate in a slot) is stepped over, not a wall
      if (c.grounded && !this.boxHitsTiles(c.x, c.y - CRATE_STEP, CRATE, CRATE)) c.y -= CRATE_STEP
      else {
        c.x = c.vx > 0 ? Math.floor((c.x + CRATE) / T) * T - CRATE : (Math.floor(c.x / T) + 1) * T
        c.vx = 0
      }
    }
    // a pushed crate stops at a live beetle instead of sliding over it (beetles already turn at crates)
    const bug = this.beetles.find(
      (bt) => bt.alive && Math.abs(bt.y - (c.y + CRATE / 2)) < (CRATE + BEETLE_H) / 2 && Math.abs(bt.x - (c.x + CRATE / 2)) < (CRATE + BEETLE_W) / 2,
    )
    if (bug && c.vx !== 0) {
      c.x = c.vx > 0 ? bug.x - BEETLE_W / 2 - CRATE : bug.x + BEETLE_W / 2
      c.vx = 0
    }
    // crates are solid to each other: a pushed crate stops against another (you can only push one at a time)
    const other = this.crateOverlap(c)
    if (other) {
      c.x = c.vx > 0 ? other.x - CRATE : other.x + CRATE
      c.vx = 0
    }
    c.y += c.vy * dt
    c.grounded = false
    if (this.boxHitsTiles(c.x, c.y, CRATE, CRATE)) {
      if (c.vy > 0) {
        c.y = Math.floor((c.y + CRATE) / T) * T - CRATE
        c.grounded = true
      } else c.y = (Math.floor(c.y / T) + 1) * T
      c.vy = 0
    }
    // ...and they stack: a falling crate lands on one below
    const below = c.vy >= 0 ? this.crateOverlap(c) : null
    if (below) {
      c.y = below.y - CRATE
      c.vy = 0
      c.grounded = true
    }
    if (c.grounded) c.vx -= Math.sign(c.vx) * Math.min(Math.abs(c.vx), CRATE_FRICTION * dt)
  }

  /** Another crate overlapping crate c, if any. */
  private crateOverlap(c: Crate) {
    return this.crates.find((o) => o !== c && Math.abs(o.x - c.x) < CRATE - 0.01 && Math.abs(o.y - c.y) < CRATE - 0.01)
  }

  private moveBeetle(b: Beetle, dt: number) {
    if (!b.alive) {
      b.squash = Math.max(0, b.squash - dt)
      b.dead += dt
      // regrow at its spawn, but never right on top of the player
      if (b.dead > BEETLE_REGROW && Math.hypot(this.ball.x - b.sx, this.ball.y - b.sy) > 4 * T) {
        Object.assign(b, { x: b.sx, y: b.sy, dir: -1, alive: true, dead: 0 })
        this.burst(b.x, b.y, '#c9b8ff', 12, 80)
      }
      return
    }
    const ax = b.x + b.dir * (BEETLE_W / 2 + 1)
    const tx = Math.floor(ax / T)
    const ty = Math.floor(b.y / T)
    // turn at walls, ledges and crates
    if (this.hard(tx, ty) || !this.hard(tx, ty + 1) || this.crateAt(ax, b.y)) b.dir = b.dir === 1 ? -1 : 1
    else b.x += b.dir * BEETLE_V * dt
  }

  tileAt(tx: number, ty: number): Tile {
    if (tx < 0 || tx >= this.level.w) return '#'
    if (ty < 0 || ty >= this.level.h) return '.'
    return this.level.tiles[ty][tx]
  }

  solid(tx: number, ty: number, phase = this.phase) {
    const t = this.tileAt(tx, ty)
    return t === '#' || t === '~' || (t === 'A' && phase === 'amber') || (t === 'C' && phase === 'cyan')
  }

  /** Visit every tile the ball's bounding box touches. */
  private nearby(fn: (tx: number, ty: number) => void) {
    const { x, y } = this.ball
    for (let ty = Math.floor((y - R) / T); ty <= Math.floor((y + R) / T); ty++)
      for (let tx = Math.floor((x - R) / T); tx <= Math.floor((x + R) / T); tx++) fn(tx, ty)
  }

  private circleHitsRect(rx: number, ry: number, rw: number, rh: number, r = R) {
    const cx = Math.max(rx, Math.min(this.ball.x, rx + rw))
    const cy = Math.max(ry, Math.min(this.ball.y, ry + rh))
    return (this.ball.x - cx) ** 2 + (this.ball.y - cy) ** 2 < r * r
  }

  /** Skipped if the ball would end up inside a block; curtains retry every step while the ball is in them. */
  private setPhase(next: Phase) {
    if (next === this.phase) return
    let blocked = false
    this.nearby((tx, ty) => {
      if (this.solid(tx, ty, next) && this.circleHitsRect(tx * T, ty * T, T, T, R - 1)) blocked = true
    })
    if (blocked) return
    this.phase = next
    if (!this.supported()) this.unground() // the floor you stood on just vanished: no coyote grace from it
    this.emit({ type: 'phase', to: next })
    this.burst(this.ball.x, this.ball.y, COLORS[next], 14, 120)
  }

  /** Is there something solid right under the ball (in the direction of gravity)? */
  private supported() {
    const b = this.ball
    const ty = Math.floor((b.y + (R + 2) * this.g) / T)
    return [b.x - R + 2, b.x, b.x + R - 2].some((x) => this.solid(Math.floor(x / T), ty))
  }

  /** You're airborne as of now (a colour change removed your floor). */
  private unground() {
    this.grounded = false
    this.coyote = 0
  }

  private emit(e: GameEvent) {
    if (this.events.length < 64) this.events.push(e) // bounded so headless runs never grow it
  }

  update(dt: number) {
    this.acc = Math.min(this.acc + dt, 0.1) // cap so a background tab doesn't fast-forward
    while (this.acc >= STEP) {
      this.step(STEP)
      this.acc -= STEP
    }
  }

  step(dt: number) {
    this.updateParticles(dt)
    if (this.state === 'won') return
    this.clock += dt
    const inp0 = this.input
    if (!this.started && (inp0.left || inp0.right || inp0.jumpPressed || inp0.jumpHeld)) this.started = true
    if (this.started) this.time += dt
    for (const c of this.crates) this.moveCrate(c, dt)
    for (const bt of this.beetles) this.moveBeetle(bt, dt)
    if (this.state === 'dead') {
      this.deadTimer -= dt
      if (this.deadTimer <= 0) this.spawn()
      return
    }

    const b = this.ball
    const inp = this.input
    if (inp.jumpPressed) this.buffer = BUFFER
    inp.jumpPressed = false

    const dir = Number(inp.right) - Number(inp.left)
    if (dir) {
      const turning = Math.sign(b.vx) === -dir
      b.vx += dir * (this.grounded ? ACCEL : AIR_ACCEL) * (turning ? 2 : 1) * dt
    } else if (this.grounded) {
      b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), FRICTION * dt)
    }
    b.vx = Math.max(-MAX_VX, Math.min(MAX_VX, b.vx))

    b.vy += GRAV * this.g * dt
    if (b.vy * this.g > MAX_FALL) b.vy = MAX_FALL * this.g

    this.coyote = this.grounded ? COYOTE : this.coyote - dt
    this.buffer -= dt
    // holding jump re-jumps on every contact, so a press during a landing hop isn't lost
    if ((this.buffer > 0 || inp.jumpHeld) && this.coyote > 0) {
      b.vy = -JUMP_V * this.g
      this.buffer = this.coyote = 0
      this.jumping = true
      this.emit({ type: 'jump' })
    }
    const rising = -b.vy * this.g
    if (rising <= 0) this.jumping = false
    if (this.jumping && !inp.jumpHeld && rising > JUMP_CUT) b.vy = -JUMP_CUT * this.g

    b.x += b.vx * dt
    b.y += b.vy * dt
    this.grounded = this.collide()
    b.angle += ((b.vx * dt) / R) * this.g

    this.trail.push({ x: b.x, y: b.y })
    if (this.trail.length > 14) this.trail.shift()

    this.interact()
  }

  /** Push the ball out of solid tiles and crates; returns true if standing on something (relative to gravity). */
  private collide() {
    const b = this.ball
    const wasGrounded = this.grounded // pushing needs a foothold: no shoving crates from mid-air
    let grounded = false
    // resolves ball vs one rect; returns the contact normal or null
    // solidAt(dx, dy): is the neighbour of this rect solid? (tiles only; lets a corner on a seam act flat)
    const resolve = (rx: number, ry: number, rw: number, rh: number, solidAt?: (dx: number, dy: number) => boolean) => {
      const cx = Math.max(rx, Math.min(b.x, rx + rw))
      const cy = Math.max(ry, Math.min(b.y, ry + rh))
      let dx = b.x - cx
      let dy = b.y - cy
      const sx = b.x < rx ? -1 : b.x > rx + rw ? 1 : 0
      const sy = b.y < ry ? -1 : b.y > ry + rh ? 1 : 0
      let outerCorner = sx !== 0 && sy !== 0
      if (outerCorner && solidAt) {
        // the corner is a seam if the neighbour on the ball's side continues the surface: treat it as flat
        if (solidAt(sx, 0)) [dx, outerCorner] = [0, false] // seam in a floor/ceiling: push straight up/down
        else if (solidAt(0, sy)) [dy, outerCorner] = [0, false] // seam in a wall: push straight sideways
      }
      const d2 = dx * dx + dy * dy
      if (d2 >= R * R) return null
      const d = Math.sqrt(d2)
      // centre inside the rect (shouldn't happen at this step size): shove against gravity
      const [nx, ny] = d > 1e-6 ? [dx / d, dy / d] : [0, -this.g]
      b.x += nx * (R - d)
      b.y += ny * (R - d)
      const vn = b.vx * nx + b.vy * ny
      if (vn < 0) {
        // only floors/ceilings bounce (smoothly ramped); walls just stop the ball; outer corners absorb the hit
        if (Math.hypot(b.vx, b.vy) < CORNER_HARD) outerCorner = false // judged on total speed: big falls only
        const ramp = Math.max(0, Math.min(1, (-vn - BOUNCE_LO) / (BOUNCE_HI - BOUNCE_LO)))
        const e = Math.abs(ny) > 0.6 && !outerCorner ? BOUNCE_E * ramp * ramp * (3 - 2 * ramp) : 0
        const vx0 = b.vx
        b.vx -= (1 + e) * vn * nx
        b.vy -= (1 + e) * vn * ny
        if (outerCorner) b.vx = vx0 + Math.max(-CORNER_KICK, Math.min(CORNER_KICK, b.vx - vx0))
        // several tiles can report the same contact; one sound per 80ms
        if (-vn > 120 && this.clock - this.lastImpact > 0.08) {
          this.lastImpact = this.clock
          if (Math.abs(ny) > 0.6) {
            const under = this.tileAt(Math.floor(b.x / T), Math.floor((b.y - ny * (R + 2)) / T))
            if (under === '~') {
              this.emit({ type: 'splash' })
              this.burst(b.x, b.y - ny * R, this.theme.water.top, Math.min(22, Math.floor(-vn / 30)), 120)
            } else this.emit({ type: 'impact', v: -vn })
            this.dust(b.x - nx * R, b.y - ny * R, -vn)
          } else if (-vn > 150) this.emit({ type: 'bump' })
        }
      }
      if (ny * -this.g > 0.6) grounded = true
      return { nx, ny }
    }
    this.nearby((tx, ty) => {
      if (this.solid(tx, ty)) resolve(tx * T, ty * T, T, T, (ox, oy) => this.solid(tx + ox, ty + oy))
    })
    for (const c of this.crates) {
      const vx = b.vx
      const n = resolve(c.x, c.y, CRATE, CRATE)
      // rolling into a crate's side shoves it along at a walking pace
      if (n && Math.abs(n.nx) > 0.6 && vx * n.nx < 0 && c.grounded && wasGrounded) {
        c.vx = Math.max(-PUSH_V, Math.min(PUSH_V, vx))
        b.vx = c.vx
        if (Math.abs(c.vx) > 20 && this.clock - this.lastPush > 0.11) {
          this.lastPush = this.clock
          this.emit({ type: 'push' })
          this.dust(c.x + (c.vx > 0 ? 2 : CRATE - 2), c.y + CRATE, 160)
        }
      }
    }
    return grounded
  }

  private interact() {
    const b = this.ball
    const lv = this.level

    const here = this.tileAt(Math.floor(b.x / T), Math.floor(b.y / T))
    if (here === 'U' && this.g === 1) {
      this.g = -1
      this.emit({ type: 'gravity', up: true })
    }
    if (here === 'D' && this.g === -1) {
      this.g = 1
      this.emit({ type: 'gravity', up: false })
    }
    if (here === 'a') this.setPhase('amber')
    if (here === 'c') this.setPhase('cyan')

    // skimming water leaves a trail of droplets
    if (this.grounded && Math.abs(b.vx) > 60 && this.clock - this.lastRipple > 0.09) {
      if (this.tileAt(Math.floor(b.x / T), Math.floor((b.y + R + 2 * this.g) / T)) === '~') {
        this.lastRipple = this.clock
        const max = 0.35
        this.particles.push({ x: b.x - Math.sign(b.vx) * R, y: b.y + R * this.g, vx: -b.vx * 0.2, vy: -40 * this.g, life: max, max, color: this.theme.water.top, size: 1.5 })
      }
    }

    let hurt = b.y < -T * 2 || b.y > lv.h * T + T * 2
    this.nearby((tx, ty) => {
      const t = this.tileAt(tx, ty)
      if (t === '^' && this.circleHitsRect(tx * T + 4, ty * T + T / 2, T - 8, T / 2)) hurt = true
      if (t === 'v' && this.circleHitsRect(tx * T + 4, ty * T, T - 8, T / 2)) hurt = true
    })
    if (hurt) return this.die()

    // beetles: land on top to squash (and bounce off), any other touch hurts
    for (const bt of this.beetles) {
      if (!bt.alive || !this.circleHitsRect(bt.x - BEETLE_W / 2, bt.y - BEETLE_H / 2, BEETLE_W, BEETLE_H)) continue
      if (this.g === 1 && b.vy > 0 && b.y < bt.y - 2) {
        bt.alive = false
        bt.squash = 0.6
        // holding jump as you land turns the stomp into a full jump: a skill bounce
        b.vy = -(this.input.jumpHeld ? JUMP_V * 1.15 : STOMP_V) // held: clears a 4-tile wall with room to spare
        this.jumping = this.input.jumpHeld // so releasing early still shortens it like a normal jump
        this.emit({ type: 'stomp' })
        this.burst(bt.x, bt.y, '#c9b8ff', 24, 180)
      } else return this.die()
    }

    for (const m of lv.motes) {
      if (!m.taken && Math.hypot(m.x - b.x, m.y - b.y) < R + 10) {
        m.taken = true
        this.collected++
        this.emit({ type: 'mote', n: this.collected })
        if (this.collected === this.total) this.emit({ type: 'gate' })
        this.burst(m.x, m.y, '#fff4c2', 18, 160)
      }
    }

    // checkpoints are vertical beams so a ball flying past still lights them
    for (const c of lv.checkpoints) {
      if (!c.active && Math.abs(c.x - b.x) < 20) {
        c.active = true
        this.respawn = { x: c.x, y: c.y + T / 2 - R, phase: this.phase }
        this.emit({ type: 'checkpoint' })
        this.burst(c.x, c.y - 20, '#ffd27a', 16, 100)
      }
    }

    // trigger is the whole archway (matches drawGate), so bouncing through it still counts
    // the gate is always open; motes are score, not a key
    if (this.circleHitsRect(lv.exit.x - 14, lv.exit.y - 56, 28, 72)) {
      this.state = 'won'
      this.emit({ type: 'win' })
      this.burst(b.x, b.y, '#ffffff', 60, 260)
    }
  }

  /** Soft puff of moss dust where something hits the ground. */
  private dust(x: number, y: number, v: number) {
    const n = Math.min(10, Math.floor(v / 60))
    for (let i = 0; i < n; i++) {
      const s = 30 + Math.random() * 60
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
      const max = 0.3 + Math.random() * 0.3
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * this.g, life: max, max, color: '#9fe8c4', size: 1 + Math.random() * 1.5 })
    }
  }

  private die() {
    this.emit({ type: 'die' })
    this.state = 'dead'
    this.deaths++
    this.deadTimer = 0.8
    this.burst(this.ball.x, this.ball.y, COLORS[this.phase], 40, 240)
  }

  private burst(x: number, y: number, color: string, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.3 + Math.random() * 0.7)
      const max = 0.4 + Math.random() * 0.5
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: max, max, color, size: 1.5 + Math.random() * 2.5 })
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 1 - 3 * dt
      p.vy *= 1 - 3 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
  }

  // ---------- rendering ----------

  /** bottom: px under the level kept for touch controls (drawn as rock, like rows below the level). */
  render(ctx: CanvasRenderingContext2D, w: number, h: number, now: number, bottom = 0) {
    const lv = this.level
    const LW = lv.w * T
    const LH = lv.h * T
    // the level's height always fills the screen above the controls (no letterbox bands in portrait)
    const scale = (h - bottom) / LH
    const vw = w / scale
    const vh = h / scale
    // look ahead in the direction of travel; matters most on narrow portrait screens
    const lead = Math.max(-vw * 0.25, Math.min(vw * 0.25, this.ball.vx * 0.6))
    const tx = Math.max(0, Math.min(this.ball.x + lead - vw / 2, LW - vw))
    const ty = 0
    if (!this.cam.ready) Object.assign(this.cam, { x: tx, y: ty, ready: true })
    this.cam.x += (tx - this.cam.x) * 0.08
    this.cam.y += (ty - this.cam.y) * 0.08
    const cam = this.cam

    const th = this.theme
    drawBackdrop(ctx, th, w, h, cam.x * scale, now, (cam.x + vw / 2) / T)
    drawAmbient(ctx, th, w, h, cam.x * scale, now)

    ctx.save()
    ctx.scale(scale, scale)
    ctx.translate(-cam.x, -cam.y)

    const x0 = Math.max(0, Math.floor(cam.x / T) - 1)
    const x1 = Math.min(lv.w - 1, Math.ceil((cam.x + vw) / T) + 1)
    // rows outside the level are drawn as solid rock (portrait screens show more than the level is tall)
    const y0 = Math.floor(cam.y / T) - 1
    const y1 = Math.ceil((cam.y + vh) / T) + 1
    this.drawFireflies(ctx, cam.x, cam.x + vw, now) // behind tiles, so ones "inside" rock are hidden
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.drawTile(ctx, x, y, now)

    for (const s of lv.signs) drawSign(ctx, s.x, s.y, s.text, now)
    for (const c of lv.checkpoints) drawLantern(ctx, c.x, c.y, c.active, now)
    drawGate(ctx, lv.exit.x, lv.exit.y, now)
    for (const m of lv.motes) if (!m.taken) drawMote(ctx, m.x, m.y, now)
    for (const c of this.crates) drawCrate(ctx, c.x, c.y)
    for (const bt of this.beetles) if (bt.alive || bt.squash > 0) drawBeetle(ctx, bt, now)

    if (this.state !== 'dead') drawWisp(ctx, this.ball.x, this.ball.y, R, this.ball.angle, this.skin, COLORS[this.phase], now, this.trail)

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.restore()
    drawFog(ctx, th, w, h, cam.x * scale, now)
  }

  /** Like tileAt, but everything above and below the level renders as rock. */
  private drawnTile(x: number, y: number): Tile {
    return y < 0 || y >= this.level.h ? '#' : this.tileAt(x, y)
  }

  private drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
    const t = this.drawnTile(x, y)
    const px = x * T
    const py = y * T
    const th = this.theme
    const rocky = (tt: Tile) => tt === '#' || tt === '~'
    if (t === '~') {
      drawWater(ctx, th, px, py, T, !rocky(this.drawnTile(x, y - 1)), now)
    } else if (t === '#') {
      ctx.fillStyle = th.rock.fill
      ctx.fillRect(px, py, T, T)
      ctx.fillStyle = th.rock.speckle
      if ((x * 7 + y * 13) % 5 === 0) ctx.fillRect(px + 8, py + 10, 6, 4) // speckle
      const open = (dx: number, dy: number) => !rocky(this.drawnTile(x + dx, y + dy))
      if (open(0, -1)) {
        ctx.fillStyle = th.top
        ctx.fillRect(px, py, T, 3)
        ctx.fillStyle = th.topGlow
        ctx.fillRect(px, py + 3, T, 3)
        if (rand(x * 31 + y * 17) > 0.35) this.drawGrass(ctx, x, py, now)
      }
      ctx.fillStyle = th.rock.edge
      if (open(0, 1)) {
        ctx.fillRect(px, py + T - 3, T, 3)
        drawCeilingDecor(ctx, th, x, py + T, T, now)
      }
      if (open(-1, 0)) ctx.fillRect(px, py, 2, T)
      if (open(1, 0)) ctx.fillRect(px + T - 2, py, 2, T)
    } else if (t === 'A' || t === 'C') {
      const phase: Phase = t === 'A' ? 'amber' : 'cyan'
      const color = COLORS[phase]
      if (phase === this.phase) {
        ctx.fillStyle = color
        ctx.globalAlpha = 0.9
        ctx.fillRect(px + 1, py + 1, T - 2, T - 2)
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#000'
        ctx.fillRect(px + 6, py + 6, T - 12, T - 12)
        ctx.globalAlpha = 1
      } else {
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.35
        ctx.setLineDash([4, 4])
        ctx.lineDashOffset = -now * 0.01
        ctx.strokeRect(px + 3, py + 3, T - 6, T - 6)
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
    } else if (t === '^' || t === 'v') {
      const up = t === '^'
      const base = up ? py + T : py
      const tip = up ? py + T / 2 - 2 : py + T / 2 + 2
      ctx.fillStyle = th.thorn.fill
      ctx.strokeStyle = th.thorn.stroke
      for (let i = 0; i < 3; i++) {
        const cx = px + 5 + i * 11
        ctx.beginPath()
        ctx.moveTo(cx - 5, base)
        ctx.lineTo(cx, tip + (i === 1 ? (up ? -3 : 3) : 0))
        ctx.lineTo(cx + 5, base)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    } else if (t === 'a' || t === 'c') {
      // prism curtain: soft vertical veil with drifting sparkles
      const color = COLORS[t === 'a' ? 'amber' : 'cyan']
      const veil = ctx.createLinearGradient(px, 0, px + T, 0)
      veil.addColorStop(0, 'transparent')
      veil.addColorStop(0.5, color)
      veil.addColorStop(1, 'transparent')
      ctx.globalAlpha = 0.22
      ctx.fillStyle = veil
      ctx.fillRect(px, py, T, T)
      ctx.globalAlpha = 0.9
      ctx.fillStyle = color
      const s = ((now * 0.03 + y * 11 + x * 5) % T) | 0
      ctx.fillRect(px + T / 2 - 1, py + s, 2, 2)
      ctx.fillRect(px + T / 2 + 5, py + ((s + 16) % T), 1.5, 1.5)
      ctx.globalAlpha = 1
    } else if (t === 'U' || t === 'D') {
      const dir = t === 'U' ? -1 : 1
      ctx.fillStyle = 'rgba(180,140,255,0.14)'
      ctx.fillRect(px, py, T, T)
      ctx.strokeStyle = '#b48cff'
      ctx.lineWidth = 2
      for (let i = 0; i < 2; i++) {
        const off = ((now * 0.04 + i * 16) % T) * dir
        const cy = (dir === -1 ? py + T : py) + off
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.moveTo(px + 8, cy - 5 * dir)
        ctx.lineTo(px + T / 2, cy)
        ctx.lineTo(px + T - 8, cy - 5 * dir)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.lineWidth = 1
    }
  }

  /** Ground decor sways in the breeze and gets brushed aside as the wisp rolls through. */
  private drawGrass(ctx: CanvasRenderingContext2D, tx: number, top: number, now: number) {
    const b = this.ball
    const near = Math.abs(b.y - top) < R + 20
    drawGroundDecor(ctx, this.theme, tx, top, T, now, (bx) => {
      const dx = bx - b.x
      return near && Math.abs(dx) < 26 ? Math.sign(dx || 1) * (26 - Math.abs(dx)) * 0.35 : 0
    })
  }

  /** Fireflies wander on slow loops, blink, and drift away from the wisp. Stateless: position is a function of time. */
  private drawFireflies(ctx: CanvasRenderingContext2D, left: number, right: number, now: number) {
    const n = Math.floor(this.level.w * this.theme.fireflies.density)
    const b = this.ball
    for (let i = 0; i < n; i++) {
      let x = rand(i + 900) * this.level.w * T + Math.sin(now * 0.0004 * (0.6 + rand(i)) + i) * 40
      let y = (2 + rand(i + 1300) * 9) * T + Math.sin(now * 0.0007 * (0.5 + rand(i + 7)) + i * 2) * 24
      if (x < left - 20 || x > right + 20) continue
      const dx = x - b.x
      const dy = y - b.y
      const d = Math.hypot(dx, dy)
      if (d < 70 && d > 0.1) {
        x += (dx / d) * (70 - d) * 0.7
        y += (dy / d) * (70 - d) * 0.7
      }
      const blink = Math.max(0, Math.sin(now * 0.002 * (0.5 + rand(i + 3)) + i * 5)) ** 3
      ctx.globalAlpha = 0.12 * blink
      ctx.fillStyle = this.theme.fireflies.color
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.25 + 0.75 * blink
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

}

// ---------- art helpers (pure drawing, no game state) ----------

/** Hint text floating on a soft glowing slab. */
function drawSign(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, now: number) {
  ctx.save()
  ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const w = ctx.measureText(text).width + 16
  const bob = Math.sin(now * 0.002 + x) * 1.5
  ctx.translate(x, y + bob)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = 'rgba(10,13,38,0.65)'
  ctx.strokeStyle = 'rgba(232,228,255,0.25)'
  ctx.beginPath()
  ctx.roundRect(-w / 2, -11, w, 22, 11)
  ctx.fill()
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#e8e4ff'
  ctx.shadowColor = '#b8a6ff'
  ctx.shadowBlur = 6
  ctx.fillText(text, 0, 1)
  ctx.restore()
}

function drawMote(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  const bob = Math.sin(now * 0.004 + x) * 3
  const s = 6 + Math.sin(now * 0.006 + x) * 1
  ctx.save()
  ctx.translate(x, y + bob)
  ctx.rotate(now * 0.002)
  ctx.shadowColor = '#fff4c2'
  ctx.shadowBlur = 14
  ctx.fillStyle = '#fff4c2'
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.lineTo(s, 0)
  ctx.lineTo(0, s)
  ctx.lineTo(-s, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCrate(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = CRATE
  ctx.fillStyle = '#3a2f63'
  ctx.fillRect(x, y, s, s)
  ctx.strokeStyle = '#8a76d1'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 1, y + 1, s - 2, s - 2)
  // carved rune
  ctx.strokeStyle = '#b8a6ff'
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.moveTo(x + s / 2, y + 7)
  ctx.lineTo(x + s - 8, y + s / 2)
  ctx.lineTo(x + s / 2, y + s - 7)
  ctx.lineTo(x + 8, y + s / 2)
  ctx.closePath()
  ctx.moveTo(x + s / 2, y + 7)
  ctx.lineTo(x + s / 2, y + s - 7)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
  ctx.fillStyle = '#7fe0b0' // moss cap
  ctx.fillRect(x, y, s, 3)
}

function drawBeetle(
  ctx: CanvasRenderingContext2D,
  b: { x: number; y: number; dir: number; alive: boolean; squash: number },
  now: number,
) {
  ctx.save()
  ctx.translate(b.x, b.y + BEETLE_H / 2)
  if (!b.alive) {
    ctx.globalAlpha = b.squash / 0.6
    ctx.scale(1.3, 0.3)
  }
  ctx.scale(b.dir, 1)
  // legs
  ctx.strokeStyle = '#0d0f24'
  ctx.lineWidth = 2
  const step = Math.sin(now * 0.02) * 3
  for (const lx of [-7, 0, 7]) {
    ctx.beginPath()
    ctx.moveTo(lx, -4)
    ctx.lineTo(lx + (lx === 0 ? -step : step), 0)
    ctx.stroke()
  }
  // shell with thorn ridge
  ctx.fillStyle = '#2a1f4d'
  ctx.beginPath()
  ctx.ellipse(0, -6, BEETLE_W / 2, BEETLE_H / 2 + 1, 0, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#c9b8ff'
  for (const sx of [-6, 0, 6]) {
    ctx.beginPath()
    ctx.moveTo(sx - 3, -12)
    ctx.lineTo(sx, -19)
    ctx.lineTo(sx + 3, -12)
    ctx.fill()
  }
  // glowing eyes
  ctx.fillStyle = '#ff6b8b'
  ctx.shadowColor = '#ff6b8b'
  ctx.shadowBlur = 8
  ctx.fillRect(8, -9, 3, 3)
  ctx.fillRect(4, -9, 2, 2)
  ctx.restore()
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, lit: boolean, now: number) {
  ctx.fillStyle = '#3a3f6e'
  ctx.fillRect(x - 2, y - 22, 4, 38)
  const glow = lit ? 0.8 + Math.sin(now * 0.008) * 0.2 : 0
  ctx.shadowColor = '#ffd27a'
  ctx.shadowBlur = lit ? 22 * glow : 0
  ctx.fillStyle = lit ? '#ffd27a' : '#4a4f78'
  ctx.beginPath()
  ctx.arc(x, y - 26, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}

function drawGate(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  const top = y - 40
  ctx.fillStyle = '#2c3266'
  ctx.fillRect(x - 20, top, 6, 56)
  ctx.fillRect(x + 14, top, 6, 56)
  ctx.beginPath()
  ctx.arc(x, top, 20, Math.PI, 0)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#2c3266'
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.save()
  ctx.beginPath()
  ctx.rect(x - 14, top - 18, 28, 74)
  ctx.clip()
  for (let i = 0; i < 4; i++) {
    const r = ((now * 0.03 + i * 10) % 40) + 2
    ctx.strokeStyle = i % 2 ? '#ff8bd8' : '#ffffff'
    ctx.globalAlpha = 1 - r / 42
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y - 10, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}
