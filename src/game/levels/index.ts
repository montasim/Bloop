import type { LevelDef } from '../level.ts'
import { firstLight } from './first-light.ts'
import { garden } from './garden.ts'
import { thornPath } from './thorn-path.ts'
import { beetleHollow } from './beetle-hollow.ts'
import { highHops } from './high-hops.ts'
import { rootMaze } from './root-maze.ts'
import { twoLights } from './two-lights.ts'
import { prismBridges } from './prism-bridges.ts'
import { colourSteps } from './colour-steps.ts'
import { beetlePrism } from './beetle-prism.ts'
import { lanternRun } from './lantern-run.ts'
import { upsideDown } from './upside-down.ts'
import { ceilingThorns } from './ceiling-thorns.ts'
import { flipFlop } from './flip-flop.ts'
import { invertedPrism } from './inverted-prism.ts'
import { moonHall } from './moon-hall.ts'
import { heavyStone } from './heavy-stone.ts'
import { steppingStones } from './stepping-stones.ts'
import { crateColour } from './crate-colour.ts'
import { burrowWorks } from './burrow-works.ts'
import { echoCaves } from './echo-caves.ts'
import { thornGarden } from './thorn-garden.ts'
import { twinGravity } from './twin-gravity.ts'
import { prismMaze } from './prism-maze.ts'
import { theUndergrowth } from './the-undergrowth.ts'
import { swiftRoots } from './swift-roots.ts'
import { thousandThorns } from './thousand-thorns.ts'
import { starfallShaft } from './starfall-shaft.ts'
import { lastLantern } from './last-lantern.ts'
import { dawnGate } from './dawn-gate.ts'

/** Play order. The roadmap of all 30 lives in docs/levels.md. */
export const LEVELS: LevelDef[] = [
  firstLight,
  thornPath,
  beetleHollow,
  highHops,
  rootMaze,
  twoLights,
  prismBridges,
  colourSteps,
  beetlePrism,
  lanternRun,
  upsideDown,
  ceilingThorns,
  flipFlop,
  invertedPrism,
  moonHall,
  heavyStone,
  steppingStones,
  garden, // #18: the original prototype level, in its planned slot
  crateColour,
  burrowWorks,
  echoCaves,
  thornGarden,
  twinGravity,
  prismMaze,
  theUndergrowth,
  swiftRoots,
  thousandThorns,
  starfallShaft,
  lastLantern,
  dawnGate,
]

export const PLANNED_LEVELS = 30
