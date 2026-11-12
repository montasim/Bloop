import { settleAt, type Bot, type Step } from '../bot.ts'

// Level 27 bot. The level is a gauntlet with a lantern every few tiles, and every leg was solved (and its jump
// windows / hold tolerances measured) from a standstill at its lantern, i.e. exactly where a respawn puts you.
// So the bot stops and lines up at each lantern, then fires that leg's jumps.
// Jump = [x, hold secs] fires on the ground once past x; [x, hold, 1] is a mid-air press (held stomp on a beetle).
// to = [x, y]: the leg ends once upright and coming down past x, over the row whose ball centre is y.
type Leg = { at: number; jumps: number[][]; to: [number, number] | null }
export const LEGS: Record<string, Leg> = {
  // @generated legs
  A9: { at: 9.5, jumps: [[11.2, 0.1208], [15.13, 0.1458]], to: [19.1,9.625] },
  B19: { at: 19.5, jumps: [[19.1, 0.1042], [22.85, 0.0292]], to: [26.1,11.625] },
  B27: { at: 27.5, jumps: [[27.8, 0.2208], [31.15, 0.0292]], to: [36.1,10.625] },
  B36: { at: 36.5, jumps: [[36.1, 0.1042]], to: [40.1,11.625] },
  B40: { at: 40.5, jumps: [[40.1, 0.0292]], to: [43.1,12.625] },
  C44: { at: 44.5, jumps: [[44.1, 0.1792], [47.85, 0.1125]], to: [52.1,10.625] },
  C52: { at: 52.5, jumps: [[52.8, 0.0292], [56.08, 0.0292]], to: [59.1,11.625] },
  C60: { at: 60.5, jumps: [[60.1, 0.1708], [62.94, 0.0292]], to: [67.1,10.625] },
  C67: { at: 67.5, jumps: [[67.8, 0.0292]], to: [71.1,11.625] },
  C71: { at: 71.5, jumps: [[71.1, 0.1125]], to: [75.1,12.625] },
  D76: { at: 76.5, jumps: [[77.3, 0.1292]], to: [80.1,10.625] },
  D80: { at: 80.5, jumps: [[81.7, 0.1292]], to: [85.1,8.625] },
  D85: { at: 85.5, jumps: [[85.8, 0.0542], [90.9, 0.1958], [97.59, 0.0292]], to: [97.1,12.625] },
  E102: { at: 102.5, jumps: [[104.5, 0.1792], [110.4, 0.8292, 1]], to: [117.1,6.625] },
  E120: { at: 120.5, jumps: [], to: [124.5,9.625] },
  E125: { at: 125.5, jumps: [[126, 0.0292]], to: [135.1,12.625] },
  F139: { at: 139.5, jumps: [[150.2, 0.6625]], to: [159.5,10.625] },
  F160: { at: 160.5, jumps: [[161.2, 0.1292]], to: [163.1,12.625] },
  F166: { at: 166.5, jumps: [], to: [174.5,12.625] },
  G175: { at: 175.5, jumps: [[175.1, 0.1208], [177.94, 0.0625], [181.88, 0.1042], [185.81, 0.0292]], to: [190.1,11.625] },
  G191: { at: 191.5, jumps: [[191.9, 0.1208], [195.53, 0.0292], [199.64, 0.1208], [203.93, 0.0292]], to: [207.1,12.625] },
  H207: { at: 207.5, jumps: [[208.7, 0.2625]], to: [214.1,11.625] },
  H214: { at: 214.5, jumps: [[214.1, 0.1792]], to: [218.1,10.625] },
  H218: { at: 218.5, jumps: [[218.1, 0.2375]], to: [223.1,10.625] },
  H224: { at: 223.5, jumps: [[223.1, 0.2792]], to: [229.1,11.625] },
  H229: { at: 229.5, jumps: [[229.8, 0.2458]], to: [235.1,10.625] },
  H235: { at: 235.5, jumps: [[235.8, 0.1625]], to: [241.1,12.625] },
  I242: { at: 242.5, jumps: [[248.7, 0.1625], [258.19, 0.1042], [262.39, 0.0292], [264.18, 0.0292], [269.57, 0.2792], [276.57, 0.2042], [278.89, 0.0292]], to: [282.1,12.625] },
  J284: { at: 284.5, jumps: [[286.9, 0.1792], [295, 0.4958, 1]], to: [301.1,7.625] },
  J301: { at: 301.5, jumps: [[301.8, 0.0292]], to: [312.1,11.625] },
  J313: { at: 313.5, jumps: [[313.1, 0.2208]], to: [321.1,12.625] },
  K323: { at: 323.5, jumps: [[324.7, 0.2625], [330.26, 0.0875], [333.84, 0.0292], [337.78, 0.1208], [342.7, 0.0292]], to: [346.1,11.625] },
  K347: { at: 347.5, jumps: [[347.9, 0.0792], [350.75, 0.0292], [354.69, 0.0292]], to: [358.1,12.625] },
  L359: { at: 359.5, jumps: [[361.5, 0.1042]], to: [364.1,10.625] },
  L364: { at: 364.5, jumps: [[364.8, 0.1125], [368.08, 0.0875]], to: [372.1,10.625] },
  L372: { at: 372.5, jumps: [[372.8, 0.0875], [375.86, 0.0292]], to: [380.1,11.625] },
  L381: { at: 381.5, jumps: [[381.1, 0.2708], [385.34, 0.0792]], to: [389.1,10.625] },
  L389: { at: 389.5, jumps: [[389.1, 0.0292]], to: [392.1,12.625] },
  M394: { at: 394.5, jumps: [[397.6, 0.0958]], to: [401.1,11.625] },
  M401: { at: 401.5, jumps: [[401.8, 0.0875]], to: [405.1,10.625] },
  M405: { at: 405.5, jumps: [[405.1, 0.1042], [408.85, 0.0292]], to: null },
}

export const bot = (b: Bot): Step[] => {
  const g = b.g
  const still = () => Math.abs(g.ball.vx) < 5 && b.landed() && g.g === 1
  const park = (tx: number) => {
    const d = tx - b.x()
    const want = Math.abs(d) < 0.05 ? 0 : Math.sign(d) * Math.max(20, Math.abs(d) * 32 * 4)
    if (g.ball.vx < want - 5) b.right()
    else if (g.ball.vx > want + 5) b.left()
    else b.stop()
  }
  const lineUp = (name: string, x: number): Step[] => [
    // no friction in the air: brake a bounce all the way down
    { name: `${name}: brake`, tick: () => { const v = b.landed() ? 40 : 3; g.ball.vx > v ? b.left() : g.ball.vx < -v ? b.right() : b.stop() }, until: still },
    settleAt(b, `${name}: line up`, x),
    { name: `${name}: park`, tick: () => park(x), until: () => Math.abs(b.x() - x) < 0.06 && Math.abs(g.ball.vx) < 4 && b.landed() },
    { name: `${name}: still`, start: b.stop, until: still },
  ]
  const run = (name: string, leg: Leg): Step => {
    let j = 0
    return {
      name: `${name}: run`,
      start: b.right,
      tick: () => {
        const q = leg.jumps[j]
        if (q && b.x() > q[0] && (q[2] || b.landed())) (b.jump(q[1]), j++)
      },
      until: () =>
        leg.to === null
          ? g.state === 'won'
          : // over the landing and coming down (or down): the next line-up brakes in the air, before the stone runs out
            j >= leg.jumps.length && g.g === 1 && b.x() >= leg.to[0] && b.y() < leg.to[1] + 0.3 && (b.y() > leg.to[1] - 1.2 || (g.ball.vy > 0 && b.y() > leg.to[1] - 4)),
    }
  }
  return Object.entries(LEGS).flatMap(([name, leg]) => [...lineUp(name, leg.at), run(name, leg)])
}
