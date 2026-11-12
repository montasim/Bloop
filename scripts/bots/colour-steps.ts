import { jumpsBot, type Bot, type Step } from '../bot.ts'

// Level 8 bot: re-solved section by section (beam search over landing-triggered jumps) after the bounce/coyote/corner engine fixes.
// Section E: jump mid-tread off the amber tread (146-148), then a second jump off the 2-tile cyan tread up to the rim.
export const bot: (b: Bot) => Step[] = jumpsBot([[13.8, 1.2], [25.3, 1.2], [38.3, 1.2], [52.1, 0.2], [70.6, 1.2], [82.8, 1.2], [84.7, 0.3], [94.6, 1.2], [95.8, 0.2], [132.4, 1.2], [140.3, 0.12], [147.2, 0.5], [150.5, 0.5], [171.3, 0.05], [179.7, 1.2], [187.7, 1.2], [194.9, 1.2]])
