import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Award01Icon,
  SunriseIcon,
  Clock01Icon,
  Download04Icon,
  ShoppingBag01Icon,
  Tick02Icon,
  Flag02Icon,
  GridViewIcon,
  LockIcon,
  ArrowRight02Icon,
  FullScreenIcon,
  MinimizeScreenIcon,
  PauseIcon,
  PlayIcon,
  ReloadIcon,
  SkullIcon,
  SparklesIcon,
  StarIcon,
  VolumeHighIcon,
  VolumeOffIcon,
} from '@hugeicons/core-free-icons'
import { Game, COLORS, type Input, type Phase } from '#/game/engine'
import { Sound } from '#/game/audio'
import { LEVELS, PLANNED_LEVELS } from '#/game/levels'
import { SKINS, drawWisp, skinById, type Skin } from '#/game/skins'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'

type Screen = 'menu' | 'playing' | 'paused' | 'won' | 'levels' | 'shop'
type Hud = { collected: number; total: number; time: number; deaths: number; phase: Phase }
type Best = { motes: number; time: number }

/** unlocked: how many levels are open (finishing level n opens n+1); best: per level id; last: index played last. */
type Progress = { unlocked: number; last: number; best: Record<string, Best> }

const PROGRESS_KEY = 'lumen-progress'
const MUTE_KEY = 'lumen-muted'

const freshProgress = (): Progress => ({ unlocked: 1, last: 0, best: {} })
const readProgress = (): Progress => {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null')
    if (typeof p?.unlocked !== 'number' || typeof p?.best !== 'object' || !p.best) return freshProgress()
    const clamp = (n: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number(n) || 0)))
    return { unlocked: Math.max(1, clamp(p.unlocked, LEVELS.length)), last: clamp(p.last, LEVELS.length - 1), best: p.best }
  } catch {
    return freshProgress()
  }
}
/** Owned skins + the one in use. Wallet = motes banked (best per level, so replays can't farm) minus spending. */
type Shop = { owned: string[]; equipped: string }
const SHOP_KEY = 'lumen-shop'
const readShop = (): Shop => {
  try {
    const s = JSON.parse(localStorage.getItem(SHOP_KEY) ?? 'null')
    const owned = Array.isArray(s?.owned) ? s.owned.filter((id: unknown) => typeof id === 'string' && SKINS.some((k) => k.id === id)) : []
    if (!owned.includes('ember')) owned.unshift('ember')
    return { owned, equipped: owned.includes(s?.equipped) ? s.equipped : 'ember' }
  } catch {
    return { owned: ['ember'], equipped: 'ember' }
  }
}
const saveShop = (s: Shop) => {
  try {
    localStorage.setItem(SHOP_KEY, JSON.stringify(s))
  } catch {}
}
const bankedMotes = (p: Progress) => LEVELS.reduce((n, l) => n + (p.best[l.id]?.motes ?? 0), 0)
let moteTotals: number[] | null = null // building every level is not free: do it once, on first use
const moteTotal = (i: number) => (moteTotals ??= LEVELS.map((l) => l.build().motes.length))[i]
const totalMotes = () => LEVELS.reduce((n, _, i) => n + moteTotal(i), 0)
/** Stars for a finished run: 1 for reaching the gate, 2 for half the motes, 3 for every mote. */
const starsFor = (motes: number, total: number) => (motes >= total ? 3 : motes * 2 >= total ? 2 : 1)
const levelStars = (p: Progress, i: number) => {
  const b = p.best[LEVELS[i].id]
  return b ? starsFor(b.motes, moteTotal(i)) : 0
}
const spentMotes = (s: Shop) => s.owned.reduce((n, id) => n + skinById(id).price, 0)

const saveProgress = (p: Progress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  } catch {}
}
/** More motes wins; equal motes, faster wins. */
const beats = (a: Best, b: Best | null) => !b || a.motes > b.motes || (a.motes === b.motes && a.time < b.time)

const toggleFullscreen = () => {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`

const KEYS: Record<string, 'left' | 'right' | 'jump'> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyZ: 'jump',
}

function press(input: Input, action: 'left' | 'right' | 'jump', down: boolean) {
  if (action === 'jump') {
    if (down && !input.jumpHeld) input.jumpPressed = true
    input.jumpHeld = down
  } else input[action] = down
}

export function LumenGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  gameRef.current ??= new Game(LEVELS[0].build())
  const [level, setLevel] = useState(0)
  const levelRef = useRef(level)
  levelRef.current = level
  const [progress, setProgress] = useState<Progress>(freshProgress)
  const [screen, setScreen] = useState<Screen>('menu')
  const screenRef = useRef(screen)
  screenRef.current = screen
  const [hud, setHud] = useState<Hud>({ collected: 0, total: gameRef.current.total, time: 0, deaths: 0, phase: 'amber' })
  const [newBest, setNewBest] = useState(false)
  const [gained, setGained] = useState(0) // motes newly banked by the last finish
  const [shop, setShop] = useState<Shop>({ owned: ['ember'], equipped: 'ember' })
  const shopRef = useRef(shop)
  shopRef.current = shop
  const [backTo, setBackTo] = useState<Screen>('menu')
  const soundRef = useRef<Sound | null>(null)
  soundRef.current ??= new Sound()
  const [muted, setMuted] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [installEvt, setInstallEvt] = useState<(Event & { prompt: () => Promise<void> }) | null>(null)

  useEffect(() => {
    const p = readProgress()
    setProgress(p)
    setLevel(p.last)
    gameRef.current = new Game(LEVELS[p.last].build())
    const sh = readShop()
    setShop(sh)
    gameRef.current.skin = skinById(sh.equipped)
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === '1')
    } catch {}
  }, [])

  useEffect(() => {
    soundRef.current!.setMuted(muted)
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {}
  }, [muted])

  // pause and mute both stop the audio engine outright (no silent loops left running);
  // otherwise ambience plays once the game has started, including on the win screen
  useEffect(() => {
    if (muted || screen === 'paused') soundRef.current!.suspend()
    else if (screen !== 'menu') soundRef.current!.unlock()
  }, [screen, muted])

  // fullscreen support differs per browser (e.g. iPhone Safari has none; installing the PWA gives fullscreen there)
  useEffect(() => {
    setCanFullscreen(!!document.fullscreenEnabled)
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // dev-only handle for poking the game from the console; stripped from production builds
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { __lumen: gameRef })
  }, [])

  // render loop + canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()
    let hudAt = 0
    const frame = (now: number) => {
      const g = gameRef.current!
      const dt = (now - last) / 1000
      last = now
      if (screenRef.current === 'playing') g.update(dt)
      g.render(ctx, canvas.width, canvas.height, now, controlsBand(canvas))
      for (const e of g.events) soundRef.current!.play(e)
      g.events.length = 0
      const won = g.state === 'won' && screenRef.current === 'playing'
      if (won || now - hudAt > 100) {
        hudAt = now
        setHud({ collected: g.collected, total: g.total, time: g.time, deaths: g.deaths, phase: g.phase })
      }
      if (won) {
        setScreen('won')
        const run = { motes: g.collected, time: g.time }
        const i = levelRef.current
        const id = LEVELS[i].id
        const p = readProgress()
        const isBest = beats(run, p.best[id] ?? null)
        setNewBest(isBest)
        setGained(isBest ? Math.max(0, run.motes - (p.best[id]?.motes ?? 0)) : 0)
        const next: Progress = {
          unlocked: Math.min(LEVELS.length, Math.max(p.unlocked, i + 2)),
          last: Math.min(i + 1, LEVELS.length - 1),
          best: isBest ? { ...p.best, [id]: run } : p.best,
        }
        saveProgress(next)
        setProgress(next)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown'
      if (down && (e.code === 'Escape' || e.code === 'KeyP')) {
        setScreen((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s))
        return
      }
      if (down && e.code === 'KeyF' && document.fullscreenEnabled) {
        toggleFullscreen()
        return
      }
      if (down && e.code === 'KeyM') {
        setMuted((m) => !m)
        return
      }
      if (down && e.code === 'Enter') {
        const sc = screenRef.current
        const i = levelRef.current
        if (sc === 'menu') play(i)
        else if (sc === 'paused') resume()
        else if (sc === 'won') play(i + 1 < LEVELS.length ? i + 1 : i)
        if (sc !== 'playing') return
      }
      const action = KEYS[e.code]
      if (!action) return
      e.preventDefault()
      if (down && e.repeat) return
      press(gameRef.current!.input, action, down)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [])

  // pause when the tab is hidden
  useEffect(() => {
    const onVis = () => document.hidden && setScreen((s) => (s === 'playing' ? 'paused' : s))
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // PWA install prompt
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as Event & { prompt: () => Promise<void> })
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function begin() {
    soundRef.current!.unlock() // must happen inside the user gesture
    // phones/tablets: go fullscreen when play starts (also needs the gesture)
    if (matchMedia('(pointer: coarse)').matches && document.fullscreenEnabled && !document.fullscreenElement) toggleFullscreen()
    setScreen('playing')
  }

  /** Start level i from scratch. */
  function play(i: number) {
    gameRef.current = new Game(LEVELS[i].build())
    gameRef.current.skin = skinById(shopRef.current.equipped)
    setLevel(i)
    setHud((h) => ({ ...h, collected: 0, total: gameRef.current!.total, time: 0, deaths: 0 }))
    begin()
  }

  function resume() {
    begin()
  }

  const best = progress.best[LEVELS[level].id] ?? null
  const wallet = bankedMotes(progress) - spentMotes(shop)

  function openShop() {
    setBackTo(screen === 'shop' ? 'menu' : screen)
    setScreen('shop')
  }
  function buy(skin: Skin) {
    if (shop.owned.includes(skin.id) || wallet < skin.price) return
    const next = { owned: [...shop.owned, skin.id], equipped: skin.id }
    saveShop(next)
    setShop(next)
    gameRef.current!.skin = skin
  }
  function equip(skin: Skin) {
    if (!shop.owned.includes(skin.id)) return
    const next = { ...shop, equipped: skin.id }
    saveShop(next)
    setShop(next)
    gameRef.current!.skin = skin
  }
  const hasNext = level + 1 < LEVELS.length
  const finale = !hasNext && LEVELS.length === PLANNED_LEVELS // the last gate of the whole game

  const phaseColor = COLORS[hud.phase]

  return (
    <div className="relative h-dvh w-full touch-manipulation overflow-hidden bg-[#0a0d26] text-foreground select-none [-webkit-touch-callout:none]">
      <canvas ref={canvasRef} className="absolute inset-0 size-full touch-none" />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Stat icon={Flag02Icon} color={COLORS.amber} label={`Level ${level + 1}: ${LEVELS[level].name}`} value={String(level + 1)} />
          <Stat icon={SparklesIcon} color="#fff4c2" label="Motes" value={`${hud.collected}/${hud.total}`} />
          <Stat icon={Clock01Icon} color="#7fd8ff" label="Time" value={fmt(hud.time)} />
          <Stat icon={SkullIcon} color="#ff8fa8" label="Deaths" value={String(hud.deaths)} />
          <Badge
            variant="outline"
            className="h-7 gap-1.5 rounded-full border-2 border-white/12 bg-black/45 px-2 font-semibold shadow-[0_3px_0_rgb(0_0_0/0.4)] backdrop-blur sm:h-8 sm:px-3"
            style={{ color: phaseColor }}
            aria-label={`Colour: ${hud.phase}`}
          >
            <span className="size-2.5 rounded-full" style={{ background: phaseColor, boxShadow: `0 0 8px ${phaseColor}` }} />
            <span className="hidden sm:inline">{hud.phase}</span>
          </Badge>
        </div>
        <div className="pointer-events-auto flex gap-1.5 sm:gap-2">
          {canFullscreen && (
            <Button
              size="icon"
              variant="outline"
              className="size-8 bg-black/45 backdrop-blur sm:size-9"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title="Fullscreen (F)"
            >
              <HugeiconsIcon icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon} />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            className="size-8 bg-black/45 backdrop-blur sm:size-9"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
            title="Sound (M)"
          >
            <HugeiconsIcon icon={muted ? VolumeOffIcon : VolumeHighIcon} />
          </Button>
          {screen === 'playing' && (
            <Button
              size="icon"
              variant="outline"
              className="size-8 bg-black/45 backdrop-blur sm:size-9"
              onClick={() => setScreen('paused')}
              aria-label="Pause"
            >
              <HugeiconsIcon icon={PauseIcon} />
            </Button>
          )}
        </div>
      </div>

      {screen === 'playing' && <TouchControls input={gameRef.current.input} />}

      {screen !== 'playing' && (
        <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.25),rgb(0_0_0/0.7))] px-[max(1rem,env(safe-area-inset-left))] pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]">
          <Card className={cn('game-panel w-full max-w-[26rem] short:max-w-md short:gap-3 short:py-4', (screen === 'levels' || screen === 'shop') && 'max-w-md short:max-w-xl')}
            style={{ '--tint': gameRef.current.theme.sky[0] } as CSSProperties} // top of the level's sky
          >
            {screen === 'menu' && (
              <>
                <CardHeader>
                  <CardTitle className="game-title text-5xl font-bold tracking-tight drop-shadow-[0_4px_0_rgb(0_0_0/0.35)] short:text-4xl" aria-label="Bloop">
                    {'Bloop'.split('').map((ch, i) => (
                      <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>
                        {ch}
                      </span>
                    ))}
                    <span style={{ color: COLORS.amber, animationDelay: '0.6s', textShadow: `0 0 16px ${COLORS.amber}` }}>.</span>
                  </CardTitle>
                  {progress.unlocked > 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Chip icon={Flag02Icon} color={COLORS.amber}>
                        Level {progress.unlocked} of {LEVELS.length}
                      </Chip>
                      <Chip icon={StarIcon} color="#ffd84d">
                        {LEVELS.reduce((n, _, i) => n + levelStars(progress, i), 0)} / {LEVELS.length * 3}
                      </Chip>
                    </div>
                  )}
                  <CardDescription>
                    Guide a wisp through the night garden to the gate. Every mote you gather on the way adds to your score.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="grid gap-2 pointer-coarse:hidden">
                    <Help keys="← → / A D" text="Roll" />
                    <Help keys="↑ / W / Space" text="Jump (hold for higher)" />
                    <Help keys="M / F" text="Sound / fullscreen" />
                  </div>
                  <div className="hidden gap-2 pointer-coarse:grid">
                    <Help keys="Right thumb ◀ ▶" text="Roll (slide to switch)" />
                    <Help keys="Left thumb ⤒" text="Jump (hold for higher)" />
                  </div>
                  <p className="pt-1 text-muted-foreground short:text-xs">Glowing curtains change your colour: only blocks of your colour are solid. Violet fields flip gravity. Push crates, stomp beetles. Lanterns save your place.</p>
                </CardContent>
              </>
            )}
            {screen === 'levels' && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-3xl font-bold">
                    Levels
                    <Chip icon={StarIcon} color="#ffd84d" label="Stars earned">
                      {LEVELS.reduce((n, _, i) => n + levelStars(progress, i), 0)} / {LEVELS.length * 3}
                    </Chip>
                  </CardTitle>
                  <CardDescription>Reach the gate to open the next level. Half the motes earns a second star, every mote a third.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2.5 short:grid-cols-10 short:gap-2">
                    {Array.from({ length: PLANNED_LEVELS }, (_, i) => {
                      const def = LEVELS[i]
                      const open = !!def && i < progress.unlocked
                      const stars = open ? levelStars(progress, i) : 0
                      return (
                        <button
                          key={i}
                          disabled={!open}
                          onClick={() => play(i)}
                          title={def ? (open ? def.name : 'Locked: finish the level before it') : 'Coming soon'}
                          aria-label={def ? `Level ${i + 1}: ${def.name}${open ? (stars ? `, ${stars} of 3 stars` : '') : ' (locked)'}` : `Level ${i + 1}: coming soon`}
                          data-state={!open ? 'locked' : i === level ? 'current' : stars ? 'done' : 'open'}
                          className="game-tile flex aspect-square flex-col items-center justify-center gap-1 text-xl font-bold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring short:gap-0.5 short:text-base"
                        >
                          {open ? i + 1 : <HugeiconsIcon icon={LockIcon} className="size-5 opacity-70 short:size-4" />}
                          {open && (
                            <span className="flex gap-px" aria-hidden>
                              {[1, 2, 3].map((s) => (
                                <HugeiconsIcon
                                  key={s}
                                  icon={StarIcon}
                                  className={cn('size-3.5 short:size-2.5', s <= stars ? 'fill-[#ffd84d] text-[#ffd84d] drop-shadow-[0_0_3px_#ffd84d]' : 'text-white/20')}
                                />
                              ))}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </>
            )}
            {screen === 'shop' && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-3xl font-bold">
                    Wisp shop
                    <Chip icon={SparklesIcon} color="#fff4c2" label={`${wallet} motes to spend`}>
                      {wallet}
                    </Chip>
                  </CardTitle>
                  <CardDescription>
                    Motes you gather are banked here (your best per level). Your amber/cyan colour always shows as the glow and ring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-3 short:grid-cols-5">
                    {SKINS.map((sk) => {
                      const owned = shop.owned.includes(sk.id)
                      const equipped = shop.equipped === sk.id
                      const short = sk.price - wallet
                      return (
                        <div
                          key={sk.id}
                          data-state={equipped ? 'current' : undefined}
                          className={cn('game-tile flex flex-col items-center gap-1.5 p-2 pb-2.5 text-center', !owned && short > 0 && 'opacity-75')}
                        >
                          {equipped && (
                            <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-linear-to-b from-[#ffd27a] to-[#ff9f2e] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#3a1d00] uppercase shadow-[0_2px_0_#b5600f]">
                              <HugeiconsIcon icon={Tick02Icon} className="size-3" /> Equipped
                            </span>
                          )}
                          {/* the wisp floats over a little glowing stand */}
                          <div className="relative grid place-items-center">
                            <span className="absolute bottom-0.5 h-2 w-10 rounded-[50%] bg-white/15 blur-[2px]" />
                            <BallPreview skin={sk} />
                          </div>
                          <div className="text-base font-semibold">{sk.name}</div>
                          {equipped ? (
                            <span className="h-7" />
                          ) : owned ? (
                            <Button size="sm" variant="outline" onClick={() => equip(sk)}>
                              Equip
                            </Button>
                          ) : (
                            <Button size="sm" disabled={short > 0} onClick={() => buy(sk)} title={short > 0 ? `${short} more motes needed` : undefined} className="tabular-nums">
                              <HugeiconsIcon icon={short > 0 ? LockIcon : SparklesIcon} /> {sk.price}
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </>
            )}
            {screen === 'paused' && (
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Paused</CardTitle>
                <CardDescription>
                  Level {level + 1}: {LEVELS[level].name}. Take a breath, the wisp will wait.
                </CardDescription>
              </CardHeader>
            )}
            {screen === 'won' && (
              <>
                <CardHeader>
                  <div className="flex justify-center gap-2 pb-1" aria-label={`${starsFor(hud.collected, hud.total)} of 3 stars`}>
                    {[1, 2, 3].map((s) => (
                      <HugeiconsIcon
                        key={`${level}-${s}`}
                        icon={StarIcon}
                        className={cn(
                          'size-11 animate-in duration-500 zoom-in-50 fill-mode-both short:size-8',
                          s === 2 && '-translate-y-2 size-13 short:size-10',
                          s <= starsFor(hud.collected, hud.total) ? 'fill-[#ffd84d] text-[#ffd84d] drop-shadow-[0_0_10px_#ffd84d]' : 'text-white/20',
                        )}
                        style={{ animationDelay: `${s * 0.18}s` }}
                      />
                    ))}
                  </div>
                  <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold">
                    <HugeiconsIcon icon={finale ? SunriseIcon : Award01Icon} className="size-7" style={{ color: COLORS.amber }} />
                    {finale ? 'Dawn reached' : `Level ${level + 1} complete`}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {finale && (
                      <span className="mb-1 block">
                        The wisp carried its light through all {PLANNED_LEVELS} levels and out into the morning. Thank you for playing.
                        {` Across the whole garden you have gathered ${bankedMotes(progress)} of ${totalMotes()} motes.`}
                      </span>
                    )}
                    {hud.collected === hud.total
                      ? `Every mote gathered. A perfect run!`
                      : `${hud.total - hud.collected} ${hud.total - hud.collected === 1 ? 'mote' : 'motes'} still glowing out there. Try for more?`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Result label="Motes" value={`${hud.collected}/${hud.total}`} highlight />
                    <Result label="Time" value={fmt(hud.time)} />
                    <Result label="Deaths" value={String(hud.deaths)} />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {gained > 0 ? `+${gained} motes banked for the shop · ` : ''}
                    {newBest ? 'New best for this level!' : best ? `Best: ${best.motes}/${hud.total} motes in ${fmt(best.time)}` : null}
                  </p>
                </CardContent>
              </>
            )}
            <CardFooter className="flex-wrap gap-2">
              {screen === 'menu' && (
                <Button onClick={() => play(level)}>
                  <HugeiconsIcon icon={PlayIcon} />
                  {progress.unlocked > 1 ? `Continue · Level ${level + 1}` : 'Play'}
                </Button>
              )}
              {screen === 'paused' && (
                <>
                  <Button onClick={resume}>
                    <HugeiconsIcon icon={PlayIcon} /> Resume
                  </Button>
                  <Button variant="outline" onClick={() => play(level)}>
                    <HugeiconsIcon icon={ReloadIcon} /> Restart
                  </Button>
                </>
              )}
              {screen === 'won' && (
                <>
                  {hasNext && (
                    <Button onClick={() => play(level + 1)}>
                      Next level <HugeiconsIcon icon={ArrowRight02Icon} />
                    </Button>
                  )}
                  {finale && (
                    <Button onClick={() => play(0)}>
                      <HugeiconsIcon icon={SunriseIcon} /> Start again from level 1
                    </Button>
                  )}
                  <Button variant={hasNext || finale ? 'outline' : 'default'} onClick={() => play(level)}>
                    <HugeiconsIcon icon={ReloadIcon} /> Replay
                  </Button>
                </>
              )}
              {screen === 'shop' ? (
                <Button variant="outline" onClick={() => setScreen(backTo)}>
                  Back
                </Button>
              ) : screen === 'levels' ? (
                <Button variant="outline" onClick={() => setScreen('menu')}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setScreen('levels')}>
                  <HugeiconsIcon icon={GridViewIcon} /> Levels
                </Button>
              )}
              {(screen === 'menu' || screen === 'won' || screen === 'levels') && (
                <Button variant="ghost" onClick={openShop}>
                  <HugeiconsIcon icon={ShoppingBag01Icon} /> Shop
                </Button>
              )}
              {installEvt && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await installEvt.prompt()
                    setInstallEvt(null)
                  }}
                >
                  <HugeiconsIcon icon={Download04Icon} /> Install
                </Button>
              )}

            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

/** A small animated wisp for the shop. */
function BallPreview({ skin }: { skin: Skin }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = c.height = 56 * dpr
    const ctx = c.getContext('2d')!
    let raf = 0
    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, 56, 56)
      // gently alternate the gameplay colour so players see both
      const phase = Math.floor(now / 2000) % 2 ? '#4de1ff' : '#ffb347'
      drawWisp(ctx, 28, 28, 15, now * 0.003, skin, phase, now)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [skin])
  return <canvas ref={ref} className="size-14" aria-hidden />
}

/** HUD counter: a chunky pill with its icon in a coloured bubble. */
function Stat({ icon, label, value, color }: { icon: IconSvgElement; label: string; value: string; color: string }) {
  return (
    <Badge
      variant="outline"
      className="h-7 gap-1.5 rounded-full border-2 border-white/12 bg-black/45 py-0 pr-2.5 pl-0.5 text-xs font-semibold text-white tabular-nums shadow-[0_3px_0_rgb(0_0_0/0.4)] backdrop-blur sm:h-8 sm:pr-3 sm:text-sm"
      aria-label={label}
    >
      <span className="grid size-5 place-items-center rounded-full sm:size-6" style={{ background: `${color}33`, color }}>
        <HugeiconsIcon icon={icon} className="size-3 sm:size-3.5" />
      </span>
      {value}
    </Badge>
  )
}

/** Small counter used in panel headers (stars, motes to spend, progress). */
function Chip({ icon, color, label, children }: { icon: IconSvgElement; color: string; label?: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-sm font-semibold tabular-nums shadow-[0_3px_0_rgb(0_0_0/0.35)]"
      style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
      aria-label={label}
    >
      <HugeiconsIcon icon={icon} className="size-4" style={{ fill: icon === StarIcon ? color : undefined }} />
      {children}
    </span>
  )
}

function Help({ keys, text }: { keys: string; text: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <kbd className="game-key px-2 py-0.5 font-sans text-xs font-semibold">{keys}</kbd>
      <span className="text-right text-muted-foreground">{text}</span>
    </div>
  )
}

function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="game-tile p-2" data-state={highlight ? 'current' : undefined}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums" style={highlight ? { color: '#fff4c2' } : undefined}>
        {value}
      </div>
    </div>
  )
}

const coarse = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)') : null
/**
 * Canvas px to keep clear under the level for the touch controls. Only in landscape: there the level fills the
 * height and the floor would sit under the thumbs; in portrait the controls already sit below the floor.
 * shortcut: mirrors TouchControls' sizes (jump 64/80 + bottom padding 12/20, short = height <= 480) and ignores the
 * safe-area inset; measure the controls instead if their layout changes.
 */
const controlsBand = (canvas: HTMLCanvasElement) => {
  const { clientWidth: w, clientHeight: h } = canvas
  if (!coarse?.matches || w <= h) return 0
  return (h <= 480 ? 64 + 12 : 80 + 20) * (canvas.height / h)
}

/** Jump on the left thumb, one roll pad on the right: slide across it to switch direction without lifting. */
function TouchControls({ input }: { input: Input }) {
  const [jumping, setJumping] = useState(false)
  const [dir, setDir] = useState<-1 | 0 | 1>(0)
  const roll = (d: -1 | 0 | 1) => {
    input.left = d === -1
    input.right = d === 1
    setDir(d)
  }
  const side = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientX < r.left + r.width / 2 ? -1 : 1
  }
  const jump = (down: boolean) => {
    press(input, 'jump', down)
    setJumping(down)
  }
  // release everything if the controls unmount mid-press (pause, win)
  useEffect(() => () => void Object.assign(input, { left: false, right: false, jumpHeld: false }), [input])

  const chip = 'border border-white/20 bg-white/10 text-white shadow-lg shadow-black/30 backdrop-blur-md transition-colors'
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pointer-coarse:flex short:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        aria-label="Jump"
        className={cn(chip, 'pointer-events-auto grid size-20 touch-none place-items-center rounded-full short:size-16', jumping && 'bg-white/30')}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          jump(true)
        }}
        onPointerUp={() => jump(false)}
        onPointerCancel={() => jump(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <HugeiconsIcon icon={ArrowUp01Icon} className="size-8 short:size-7" />
      </button>
      <div
        role="group"
        aria-label="Roll"
        className={cn(chip, 'pointer-events-auto flex h-16 w-44 touch-none overflow-hidden rounded-full short:h-14 short:w-40')}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          roll(side(e))
        }}
        onPointerMove={(e) => {
          if (e.buttons) roll(side(e))
        }}
        onPointerUp={() => roll(0)}
        onPointerCancel={() => roll(0)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className={cn('grid flex-1 place-items-center transition-colors', dir === -1 && 'bg-white/25')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-7" />
        </span>
        <span className="my-3 w-px bg-white/20" />
        <span className={cn('grid flex-1 place-items-center transition-colors', dir === 1 && 'bg-white/25')}>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-7" />
        </span>
      </div>
    </div>
  )
}
