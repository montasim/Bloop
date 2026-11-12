// Ball skins, bought with motes. Purely cosmetic: the wisp's amber/cyan colour always stays readable
// as its glow and an outer ring, so colour-curtain levels play the same with any skin.

export interface Skin {
  id: string // stable: saved in the player's shop data
  name: string
  price: number
  core: [string, string] | 'phase' | 'hue' // gradient centre/edge, the current colour, or an animated rainbow
  pattern: 'spark' | 'facets' | 'swirl' | 'petals' | 'rays' | 'rings' | 'stars'
  trail: string | 'phase' | 'rainbow'
}

export const SKINS: Skin[] = [
  { id: 'ember', name: 'Ember', price: 0, core: 'phase', pattern: 'spark', trail: 'phase' },
  { id: 'frost', name: 'Frost', price: 15, core: ['#ffffff', '#8fd0ff'], pattern: 'facets', trail: '#bfe6ff' },
  { id: 'moss', name: 'Moss', price: 30, core: ['#eaffd6', '#3fae5c'], pattern: 'swirl', trail: '#7fe0b0' },
  { id: 'rose', name: 'Rose', price: 50, core: ['#fff0f6', '#ff6f9f'], pattern: 'petals', trail: '#ffb0c8' },
  { id: 'sunflare', name: 'Sunflare', price: 75, core: ['#fffbe0', '#ffaa00'], pattern: 'rays', trail: '#ffd36b' },
  { id: 'tide', name: 'Tide', price: 100, core: ['#e6fcff', '#1f86d0'], pattern: 'rings', trail: '#6fd0ff' },
  { id: 'void', name: 'Void', price: 140, core: ['#7a5be6', '#0b0618'], pattern: 'stars', trail: '#8a6bff' },
  { id: 'aurora', name: 'Aurora', price: 200, core: 'hue', pattern: 'swirl', trail: 'rainbow' },
  { id: 'starlight', name: 'Starlight', price: 300, core: ['#ffffff', '#e9e2ff'], pattern: 'stars', trail: '#ffffff' },
]

export const skinById = (id: string) => SKINS.find((s) => s.id === id) ?? SKINS[0]

/** Draws the wisp (and its trail) with a skin. phaseColor is the gameplay colour (amber/cyan). */
export function drawWisp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  skin: Skin,
  phaseColor: string,
  now: number,
  trail: { x: number; y: number }[] = [],
) {
  const hue = (now * 0.08) % 360
  const [c0, c1] = skin.core === 'phase' ? ['#ffffff', phaseColor] : skin.core === 'hue' ? [`hsl(${hue},100%,85%)`, `hsl(${(hue + 60) % 360},90%,55%)`] : skin.core

  trail.forEach((p, i) => {
    const k = i / trail.length
    ctx.globalAlpha = k * 0.28
    ctx.fillStyle = skin.trail === 'phase' ? phaseColor : skin.trail === 'rainbow' ? `hsl(${(hue + i * 22) % 360},100%,65%)` : skin.trail
    ctx.beginPath()
    ctx.arc(p.x, p.y, r * k, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1

  // glow is always the gameplay colour
  ctx.shadowColor = phaseColor
  ctx.shadowBlur = r * 2
  const grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 1, x, y, r)
  grad.addColorStop(0, c0)
  grad.addColorStop(0.45, skin.core === 'phase' ? phaseColor : c1)
  grad.addColorStop(1, c1)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // pattern, rotating with the roll
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = Math.max(1, r / 6)
  switch (skin.pattern) {
    case 'spark':
      ctx.beginPath()
      ctx.arc(0, 0, r - r / 3, 0, 1.1)
      ctx.stroke()
      break
    case 'facets':
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(r, 0)
        ctx.stroke()
      }
      break
    case 'swirl':
      ctx.beginPath()
      for (let t = 0; t < 4.5; t += 0.2) ctx.lineTo(Math.cos(t) * t * (r / 4.5), Math.sin(t) * t * (r / 4.5))
      ctx.stroke()
      break
    case 'petals':
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5)
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.ellipse(r * 0.45, 0, r * 0.38, r * 0.18, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    case 'rays':
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4)
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(r * 0.3, 0)
        ctx.lineTo(r, 0)
        ctx.stroke()
      }
      break
    case 'rings':
      ctx.globalAlpha = 0.6
      for (const k of [0.35, 0.7]) {
        ctx.beginPath()
        ctx.arc(0, 0, r * k, 0, Math.PI * 1.4)
        ctx.stroke()
      }
      break
    case 'stars':
      for (let i = 0; i < 5; i++) {
        const a = i * 2.4
        const d = r * (0.25 + (i % 3) * 0.22)
        ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(now * 0.004 + i))
        ctx.fillRect(Math.cos(a) * d - 1, Math.sin(a) * d - 1, 2, 2)
      }
      break
  }
  ctx.restore()
  ctx.globalAlpha = 1

  // gameplay-colour ring for skins whose core isn't the colour itself
  if (skin.core !== 'phase') {
    ctx.strokeStyle = phaseColor
    ctx.lineWidth = Math.max(1.5, r / 6)
    ctx.beginPath()
    ctx.arc(x, y, r + 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.lineWidth = 1
}
