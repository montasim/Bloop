import { timed, type Bot, type Step } from '../bot.ts'

// Level 12 bot: one segment per section, each solved with scripts/solve-segment.ts from where the
// previous one stops. Repeated x values mean "jump again on the next landing" (a hop chain).
export const bot = (b: Bot): Step[] => [
  timed(b, 'A: first flip', [[25, 0.3], [25.2, 0.3], [35.2, 0.2]], () => b.x() >= 44 && b.landed()),
  timed(b, 'B: long roof run', [[55.9, 0.12], [57.7, 0.05], [61.5, 0.12], [66.4, 0.05], [78.5, 0.3], [80.9, 0.12], [85.9, 0.05], [94.6, 0.12]], () => b.x() >= 112 && b.landed()),
  timed(b, 'C: low tube', [[120.6, 0.07], [122.1, 0.05], [131.8, 0.12], [141.6, 0.1]], () => b.x() >= 150 && b.landed()),
  timed(b, 'D: beetle pens', [[164.6, 1.2], [164.8, 0.12], [165, 0.7]], () => b.x() >= 186 && b.landed()),
  timed(b, 'E: colour roof', [[203.4, 1.2], [210, 0.2]], () => b.x() >= 226 && b.landed()),
  timed(b, 'F: finale tube', [[226, 0.4], [235.4, 0.05], [235.4, 0.12], [245, 0.12]], () => b.g.state === 'won'),
]
