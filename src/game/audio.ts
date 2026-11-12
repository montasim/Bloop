import type { GameEvent } from './engine.ts'

/**
 * All sound is synthesised with Web Audio: no files, no music.
 * SFX for game events + a night-garden ambience (wind, crickets, cave drips).
 * The context is created lazily on the first user gesture (browser autoplay rules).
 */
export class Sound {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private sfx!: GainNode
  private amb!: GainNode
  private echo!: DelayNode // cave echo, used by drips and a few SFX
  private noiseBuf!: AudioBuffer
  private muted = false

  /** Call from a user gesture. Safe to call repeatedly. */
  unlock() {
    if (!this.ctx) this.init()
    if (this.ctx!.state === 'suspended') void this.ctx!.resume()
  }

  suspend() {
    if (this.ctx?.state === 'running') void this.ctx.suspend()
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05)
  }

  private init() {
    const ctx = new AudioContext()
    this.ctx = ctx
    const comp = ctx.createDynamicsCompressor()
    comp.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 1
    this.master.connect(comp)
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.9
    this.sfx.connect(this.master)
    this.amb = ctx.createGain()
    this.amb.gain.value = 0.7
    this.amb.connect(this.master)

    this.echo = ctx.createDelay(1)
    this.echo.delayTime.value = 0.23
    const fb = ctx.createGain()
    fb.gain.value = 0.35
    const damp = ctx.createBiquadFilter()
    damp.type = 'lowpass'
    damp.frequency.value = 2200
    this.echo.connect(damp).connect(fb).connect(this.echo)
    damp.connect(this.master)

    // 2s of white noise, reused by every noisy sound
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = this.noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

    this.startAmbience()
  }

  // ---------- building blocks ----------

  private tone(o: {
    f: number
    to?: number
    dur: number
    type?: OscillatorType
    gain?: number
    at?: number
    pan?: number
    attack?: number
    out?: AudioNode
    echo?: number
  }) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (o.at ?? 0)
    const osc = ctx.createOscillator()
    osc.type = o.type ?? 'sine'
    osc.frequency.setValueAtTime(o.f, t)
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur)
    const g = ctx.createGain()
    const peak = o.gain ?? 0.2
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? 0.005))
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
    const p = ctx.createStereoPanner()
    p.pan.value = o.pan ?? 0
    osc.connect(g).connect(p).connect(o.out ?? this.sfx)
    if (o.echo) {
      const send = ctx.createGain()
      send.gain.value = o.echo
      p.connect(send).connect(this.echo)
    }
    osc.start(t)
    osc.stop(t + o.dur + 0.05)
  }

  private noise(o: {
    dur: number
    f: number
    to?: number
    q?: number
    type?: BiquadFilterType
    gain?: number
    at?: number
    attack?: number
    pan?: number
    out?: AudioNode
  }) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (o.at ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    const filt = ctx.createBiquadFilter()
    filt.type = o.type ?? 'bandpass'
    filt.Q.value = o.q ?? 1
    filt.frequency.setValueAtTime(o.f, t)
    if (o.to) filt.frequency.exponentialRampToValueAtTime(o.to, t + o.dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.2, t + (o.attack ?? 0.005))
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
    const p = ctx.createStereoPanner()
    p.pan.value = o.pan ?? 0
    src.connect(filt).connect(g).connect(p).connect(o.out ?? this.sfx)
    src.start(t, Math.random() * 1.5)
    src.stop(t + o.dur + 0.05)
  }

  // ---------- game events ----------

  play(e: GameEvent) {
    if (!this.ctx || this.ctx.state !== 'running') return
    switch (e.type) {
      case 'jump':
        this.tone({ f: 300, to: 640, dur: 0.14, type: 'triangle', gain: 0.12 })
        this.noise({ dur: 0.08, f: 1800, gain: 0.03, type: 'highpass' })
        break
      case 'impact': {
        const k = Math.min(1, e.v / 800)
        this.tone({ f: 150, to: 55, dur: 0.12 + k * 0.08, gain: 0.08 + k * 0.22 })
        this.noise({ dur: 0.06, f: 700, gain: 0.03 + k * 0.08, type: 'lowpass' })
        break
      }
      case 'splash':
        this.noise({ dur: 0.35, f: 1400, to: 500, q: 0.8, gain: 0.14, attack: 0.01 })
        this.tone({ f: 420, to: 180, dur: 0.18, gain: 0.05 })
        break
      case 'bump':
        this.noise({ dur: 0.07, f: 450, gain: 0.1, type: 'lowpass' })
        this.tone({ f: 110, to: 70, dur: 0.08, gain: 0.08 })
        break
      case 'mote': {
        // each mote chimes a little higher than the last
        const f = 880 * 2 ** ((e.n % 12) / 12)
        this.tone({ f, dur: 0.35, type: 'triangle', gain: 0.1, echo: 0.3 })
        this.tone({ f: f * 1.5, dur: 0.45, type: 'sine', gain: 0.06, at: 0.05, echo: 0.3 })
        this.tone({ f: f * 3, dur: 0.2, type: 'sine', gain: 0.02, at: 0.02 })
        break
      }
      case 'phase': {
        const up = e.to === 'cyan'
        this.tone({ f: up ? 500 : 1100, to: up ? 1100 : 500, dur: 0.25, type: 'triangle', gain: 0.07, attack: 0.03 })
        this.noise({ dur: 0.3, f: up ? 2000 : 5000, to: up ? 5000 : 2000, q: 3, gain: 0.05, attack: 0.05 })
        break
      }
      case 'gravity':
        this.noise({ dur: 0.45, f: e.up ? 300 : 1600, to: e.up ? 1600 : 300, q: 2, gain: 0.14, attack: 0.08 })
        this.tone({ f: e.up ? 90 : 180, to: e.up ? 180 : 90, dur: 0.45, gain: 0.08, attack: 0.06 })
        break
      case 'checkpoint':
        for (const [f, at] of [[523, 0], [784, 0.02], [1046, 0.04]] as const)
          this.tone({ f, dur: 1.4, gain: 0.07, at, echo: 0.25 })
        this.noise({ dur: 0.4, f: 3000, gain: 0.02, type: 'highpass', attack: 0.1 })
        break
      case 'stomp':
        this.tone({ f: 240, to: 70, dur: 0.12, type: 'square', gain: 0.06 })
        this.noise({ dur: 0.1, f: 900, to: 300, gain: 0.12, type: 'lowpass' })
        break
      case 'push':
        this.noise({ dur: 0.1, f: 220 + Math.random() * 80, q: 4, gain: 0.12 })
        break
      case 'die':
        this.tone({ f: 520, to: 70, dur: 0.55, type: 'triangle', gain: 0.12 })
        this.noise({ dur: 0.4, f: 1200, to: 200, gain: 0.12, type: 'lowpass' })
        break
      case 'gate':
        // a shimmering sweep, not a melody
        for (let i = 0; i < 6; i++) this.tone({ f: 660 * 2 ** (i / 5), dur: 0.6, gain: 0.04, at: i * 0.05, echo: 0.4 })
        this.noise({ dur: 1.2, f: 4000, gain: 0.03, type: 'highpass', attack: 0.3 })
        break
      case 'win':
        for (const [f, at] of [[392, 0], [587, 0.04], [784, 0.08], [1175, 0.12]] as const)
          this.tone({ f, dur: 2.2, gain: 0.07, at, attack: 0.2, echo: 0.3 })
        this.noise({ dur: 1.8, f: 6000, gain: 0.03, type: 'highpass', attack: 0.4 })
        break
    }
  }

  // ---------- ambience ----------

  private startAmbience() {
    const ctx = this.ctx!
    // wind: looping noise through a slowly wandering lowpass
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 380
    const wind = ctx.createGain()
    wind.gain.value = 0.05
    src.connect(lp).connect(wind).connect(this.amb)
    src.start()
    const gust = () => {
      if (ctx.state === 'running') {
        const t = ctx.currentTime
        lp.frequency.setTargetAtTime(250 + Math.random() * 450, t, 1.5)
        wind.gain.setTargetAtTime(0.025 + Math.random() * 0.06, t, 1.8)
      }
      this.later(gust, 2500 + Math.random() * 3000)
    }

    const cricket = () => {
      if (ctx.state === 'running') {
        const f = 4200 + Math.random() * 700
        const pan = Math.random() * 1.6 - 0.8
        const g = 0.008 + Math.random() * 0.014
        const pulses = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < pulses; i++) this.tone({ f, dur: 0.03, gain: g, at: i * 0.06, pan, out: this.amb })
      }
      this.later(cricket, 500 + Math.random() * 2200)
    }

    const drip = () => {
      if (ctx.state === 'running')
        this.tone({ f: 1600 + Math.random() * 900, to: 500, dur: 0.09, gain: 0.03, pan: Math.random() * 1.4 - 0.7, out: this.amb, echo: 0.8 })
      this.later(drip, 3000 + Math.random() * 6000)
    }

    gust()
    cricket()
    this.later(drip, 1500)
  }

  // loops run for the page's lifetime (one Sound per app); they idle while the context is suspended
  private later(fn: () => void, ms: number) {
    window.setTimeout(fn, ms)
  }
}
