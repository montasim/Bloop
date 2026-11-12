import { makeLevel, type LevelDef } from '../level.ts'

// The original prototype level: every mechanic in one run. Will move later in the order
// once the tutorial levels for each mechanic exist (see docs/levels.md).
export const garden: LevelDef = {
  id: 'garden',
  name: 'Night Garden',
  build: () =>
    makeLevel(96, ({ w, fill, mote, checkpoint, crate, beetle, exit }) => {
      // 1. roll + jump
      mote(5, 12)
      mote(7, 12)
      fill(10, 11, 12, 12, '#')
      mote(11, 10)
      beetle(14, 12) // drop off the step onto it

      // 2. thorn pit
      fill(17, 13, 20, 14, '.')
      fill(17, 14, 20, 14, '^')
      mote(18, 9)

      // 3. phase: cyan curtain -> through the amber wall onto the cyan bridge,
      //    amber curtain mid-bridge -> onto the amber half and through the cyan wall
      checkpoint(22, 12)
      fill(24, 1, 24, 12, 'c')
      fill(26, 1, 26, 12, 'A')
      mote(28, 12)
      beetle(28, 12)
      fill(30, 13, 37, 14, '.')
      fill(30, 14, 37, 14, '^')
      fill(30, 13, 33, 13, 'C')
      fill(34, 13, 37, 13, 'A')
      fill(34, 1, 34, 12, 'a')
      mote(32, 11)
      mote(36, 11)
      fill(40, 1, 40, 12, 'C')

      // 4. gravity: flip up, roll the ceiling over a long thorn pit, hop hanging thorns, flip down
      checkpoint(43, 12)
      fill(44, 0, 70, 2, '#')
      fill(46, 12, 46, 12, 'U')
      fill(48, 13, 66, 14, '.')
      fill(48, 14, 66, 14, '^')
      fill(60, 3, 61, 3, 'v') // far enough from the landing that the ceiling-bounce settles first
      mote(51, 3)
      mote(56, 3)
      mote(64, 3)
      // full-height gravity-down fields on both sides so you can't leave the section upside-down
      fill(67, 3, 67, 12, 'D')
      fill(43, 1, 43, 12, 'D')

      // 5. gauntlet + exit
      checkpoint(70, 12)
      fill(72, 1, 72, 12, 'c')
      fill(74, 1, 74, 12, 'A')
      mote(75, 11) // on the bounce line after the gravity drop
      fill(76, 1, 76, 12, 'a')
      fill(78, 1, 78, 12, 'C')
      fill(81, 11, 83, 11, 'A')
      mote(82, 10)
      crate(80, 12) // met from the left, so the natural push is towards the ledge
      mote(86, 12)
      mote(89, 8) // on the climb path from crate to ledge, hinting the route
      fill(90, 9, w - 2, 12, '#')
      exit(w - 2, 8)
    }),
}
