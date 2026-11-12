import { makeLevel, type LevelDef } from '../level.ts'

// Level 4: jump height mastery. Harder than level 3: full-power jumps between floating ledges,
// beetle springboards over walls too tall to jump, flat hops under hanging rock, and a
// narrow-tread pillar stair over thorns. The gate sits on a high ledge reached by springboard.
// Big landings bounce you ~4 tiles, so hazards start well clear of them.
export const highHops: LevelDef = {
  id: 'high-hops',
  name: 'High Hops',
  build: () =>
    makeLevel(144, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(63, 70)
      pond(119, 124)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. steps of rising height: each needs a longer hold
      sign(6, 7, 'Higher steps need longer holds')
      fill(8, 12, 9, 12, '#')
      fill(13, 11, 14, 12, '#')
      fill(18, 10, 19, 12, '#')
      mote(9, 11)
      mote(14, 10)
      mote(19, 9)
      checkpoint(23, 12)

      // B. optional climb up floating ledges (each a full-power jump), then a drop with room to land
      fill(27, 10, 29, 12, '#')
      fill(32, 7, 34, 7, '#')
      checkpoint(33, 6)
      mote(32, 6) // breadcrumb: lures players up the climb
      fill(37, 4, 39, 4, '#')
      mote(28, 9)
      mote(38, 3)

      // C. beetle springboard: the wall is too tall to jump
      checkpoint(48, 12)
      sign(55, 6, 'Hold jump on a beetle to spring high')
      // pen: bump, beetle, bump, one-tile gap, wall. Tested: every held stomp clears the wall,
      // and the gap stops anyone using the bump as a step to skip the beetle
      fill(52, 12, 52, 12, '#')
      beetle(55, 12)
      fill(58, 12, 58, 12, '#')
      fill(60, 9, 61, 12, '#')
      mote(60, 8)
      checkpoint(66, 12)
      pit(72, 76)
      mote(74, 9)

      // D. hanging rock over pits: hop flat and short
      fill(80, 1, 84, 9, '#')
      pit(81, 83)
      mote(82, 11)
      fill(87, 1, 91, 9, '#')
      pit(88, 90)
      mote(89, 11)

      // E. narrow-tread pillar stair over a thorn floor
      checkpoint(95, 12)
      pit(98, 118)
      fill(100, 11, 101, 14, '#')
      fill(104, 9, 105, 14, '#')
      fill(108, 7, 109, 14, '#')
      checkpoint(108, 6)
      fill(112, 9, 113, 14, '#')
      fill(116, 11, 117, 14, '#')
      mote(100, 10)
      mote(104, 8)
      mote(112, 8)
      mote(116, 10)

      // F. finale: springboard up to the gate's ledge
      checkpoint(122, 12)
      fill(126, 12, 126, 12, '#')
      beetle(129, 12)
      fill(132, 12, 132, 12, '#')
      mote(128, 10)
      fill(134, 9, 142, 12, '#') // 4 tall: springboard height
      mote(137, 8)
      mote(140, 8)
      exit(142, 8)
    }, 'peaks'),
}
