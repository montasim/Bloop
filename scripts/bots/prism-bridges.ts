import { settleAt, timed, type Bot, type Step } from '../bot.ts'

// Level 7 bot: segments solved with scripts/solve-segment.ts, joined by hand-written stops where a
// player would stop and think: before the trap-curtain bridge (hop, hop, hop) and before the final
// gauntlet (wait until its beetle heads back from the left end of its bridge).
export const bot = (b: Bot): Step[] => {
  const bug = () => b.g.beetles.find((t) => Math.abs(t.sx / 32 - 170.5) < 1)!
  const bx = () => bug().x / 32 - 170.5
  return [
    timed(b, 'warm-up, gapped bridge, beetle bridge', [[4, 0.12], [38.2, 1.2], [53.2, 0.05], [67.8, 1.2], [74.4, 0.12]], () => b.x() >= 83.5 && b.landed()),
    settleAt(b, 'stop before the trap curtains', 84.5),
    timed(b, 'hop, hop, hop', [[84, 0.05], [84, 0.12], [84, 0.12], [84, 0.2]], () => b.x() >= 102.5 && b.landed()),
    timed(b, 'heights + thorn roof', [[106.5, 1.2], [106.5, 0.7], [140.1, 0.05], [148.3, 0.05], [153.1, 0.3]], () => b.x() >= 157.5 && b.landed()),
    settleAt(b, 'stop before the gauntlet', 158.5),
    { name: 'wait for the gauntlet beetle', until: () => bug().dir === 1 && bx() > -2.6 && bx() < -1.8 },
    timed(b, 'final gauntlet', [[158, 0.05], [163, 0.12], [163, 0.12], [173, 1.2]], () => b.g.state === 'won'),
  ]
}
