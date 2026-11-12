// Per-level bot files (one per level, so levels can be built side by side). Merged into scripts/playthrough.ts.
import type { Bot, Step } from '../bot.ts'
import { bot as prismBridges } from './prism-bridges.ts'
import { bot as colourSteps } from './colour-steps.ts'
import { bot as beetlePrism } from './beetle-prism.ts'
import { bot as lanternRun } from './lantern-run.ts'
import { bot as upsideDown } from './upside-down.ts'
import { bot as ceilingThorns } from './ceiling-thorns.ts'
import { bot as flipFlop } from './flip-flop.ts'
import { bot as invertedPrism } from './inverted-prism.ts'
import { bot as moonHall } from './moon-hall.ts'
import { bot as heavyStone } from './heavy-stone.ts'
import { bot as steppingStones } from './stepping-stones.ts'
import { bot as crateColour } from './crate-colour.ts'
import { bot as burrowWorks } from './burrow-works.ts'
import { bot as echoCaves } from './echo-caves.ts'
import { bot as thornGarden } from './thorn-garden.ts'
import { bot as twinGravity } from './twin-gravity.ts'
import { bot as prismMaze } from './prism-maze.ts'
import { bot as theUndergrowth } from './the-undergrowth.ts'
import { bot as swiftRoots } from './swift-roots.ts'
import { bot as thousandThorns } from './thousand-thorns.ts'
import { bot as starfallShaft } from './starfall-shaft.ts'
import { bot as lastLantern } from './last-lantern.ts'
import { bot as dawnGate } from './dawn-gate.ts'

export const BOTS: Record<string, (b: Bot) => Step[]> = {
  'prism-bridges': prismBridges,
  'colour-steps': colourSteps,
  'beetle-prism': beetlePrism,
  'lantern-run': lanternRun,
  'upside-down': upsideDown,
  'ceiling-thorns': ceilingThorns,
  'flip-flop': flipFlop,
  'inverted-prism': invertedPrism,
  'moon-hall': moonHall,
  'heavy-stone': heavyStone,
  'stepping-stones': steppingStones,
  'crate-colour': crateColour,
  'burrow-works': burrowWorks,
  'echo-caves': echoCaves,
  'thorn-garden': thornGarden,
  'twin-gravity': twinGravity,
  'prism-maze': prismMaze,
  'the-undergrowth': theUndergrowth,
  'swift-roots': swiftRoots,
  'thousand-thorns': thousandThorns,
  'starfall-shaft': starfallShaft,
  'last-lantern': lastLantern,
  'dawn-gate': dawnGate,
}
