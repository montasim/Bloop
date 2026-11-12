import { makeLevel, type LevelDef } from '../level.ts'

// Level 2: thorns everywhere, lanterns between sections. Harder than level 1:
// wider pits, a pit straight after a raised island, stepping pillars over a thorn floor,
// a low ceiling that punishes full-power jumps, and a long pit jumped from a high step.
export const thornPath: LevelDef = {
  id: 'thorn-path',
  name: 'Thorn Path',
  build: () =>
    makeLevel(104, ({ fill, mote, checkpoint, sign, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(15, 17)
      pond(59, 64)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. two pits of growing width
      sign(6, 8, 'Time your hops')
      pit(11, 13)
      mote(12, 10)
      pit(19, 22)
      mote(20, 9)

      checkpoint(16, 12)

      // B. a raised island with a pit right after it
      fill(27, 11, 29, 12, '#')
      mote(28, 10)
      pit(30, 33)
      mote(32, 8)

      // C. thorn floor crossed on pillars of different heights
      checkpoint(37, 12)
      pit(41, 54)
      fill(44, 11, 45, 14, '#')
      fill(48, 10, 49, 14, '#')
      fill(52, 11, 53, 14, '#')
      mote(44, 10)
      mote(48, 9)
      mote(52, 10)

      // D. low ceiling: a full jump bonks the roof, so hop short
      checkpoint(58, 12)
      sign(61, 6, 'Low roof: short hops')
      fill(62, 1, 78, 8, '#')
      pit(66, 68)
      mote(67, 11)
      pit(72, 74)
      mote(73, 11)

      // E. climb a stair and leap a long pit from the top
      checkpoint(81, 12)
      fill(83, 11, 86, 12, '#') // deep treads: each step is its own calm jump
      fill(87, 9, 90, 12, '#') // wide top: room to line up the leap
      mote(89, 8)
      pit(91, 95)
      mote(93, 6)
      mote(98, 12)
      mote(100, 12)
    }, 'dusk'),
}
