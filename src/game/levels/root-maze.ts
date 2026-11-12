import { makeLevel, type LevelDef } from '../level.ts'

// Level 5, chapter 1 test: everything so far, combined and tighter.
// Beetles now guard the landings of springboards and the treads of the pillar stair,
// thorn fields are crossed on tiny beetle islands, and the low corridor has pits AND beetles.
// Lanterns never sit inside a beetle's patrol (beetles reset when you respawn).
export const rootMaze: LevelDef = {
  id: 'root-maze',
  name: 'Root Maze',
  build: () =>
    makeLevel(164, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(62, 67)
      pond(147, 150)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. warm-up gauntlet: pit, a beetle on the landing, a wider pit
      sign(5, 7, 'Everything you have learned')
      pit(8, 10)
      mote(9, 9)
      fill(18, 12, 18, 12, '#')
      beetle(15, 12)
      mote(15, 10)
      pit(21, 24)
      mote(21, 8) // on the line from the bump top over the pit
      checkpoint(19, 12) // between the beetle's pen and the second pit
      checkpoint(27, 12)

      // B. beetle trench, then a springboard onto a shelf another beetle patrols
      fill(30, 13, 37, 13, '.')
      beetle(32, 13)
      beetle(36, 13)
      mote(31, 13)
      mote(34, 10) // on the stomp-bounce arc, not beside a beetle
      checkpoint(39, 12)
      fill(42, 12, 42, 12, '#')
      beetle(45, 12)
      fill(48, 12, 48, 12, '#')
      fill(50, 9, 60, 12, '#')
      beetle(56, 8)
      mote(50, 8)
      mote(54, 7)
      mote(59, 8)
      checkpoint(64, 12)

      // C. thorn field crossed on beetle islands
      pit(69, 86)
      fill(72, 12, 74, 14, '#')
      beetle(73, 11)
      fill(78, 11, 81, 14, '#')
      beetle(80, 10)
      fill(85, 12, 86, 14, '#')
      mote(73, 9)
      mote(79, 8)
      mote(85, 10)

      // D. low corridor: pits and beetles under the roof
      checkpoint(90, 12)
      fill(93, 1, 115, 8, '#')
      pit(96, 98)
      beetle(101, 12)
      pit(104, 106)
      fill(114, 12, 114, 12, '#')
      beetle(110, 12)
      mote(97, 9) // hugging the roof: where every pit-clearing hop goes
      mote(105, 11)
      mote(111, 10)
      checkpoint(118, 12)

      // E. pillar stair over thorns, beetles patrolling two of the treads
      pit(121, 145)
      fill(123, 11, 125, 14, '#')
      fill(128, 9, 131, 14, '#')
      beetle(130, 8)
      fill(134, 7, 136, 14, '#')
      checkpoint(135, 6)
      fill(139, 9, 142, 14, '#')
      beetle(141, 8)
      fill(145, 11, 146, 14, '#')
      mote(124, 10)
      mote(129, 8)
      mote(135, 5)
      mote(140, 8)

      // F. finale: springboard to the gate
      checkpoint(149, 12)
      fill(152, 12, 152, 12, '#')
      beetle(155, 12)
      fill(158, 12, 158, 12, '#')
      mote(154, 10)
      fill(160, 9, 162, 12, '#')
      mote(161, 8)
      exit(162, 8)
    }, 'roots'),
}
