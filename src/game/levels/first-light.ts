import { makeLevel, type LevelDef } from '../level.ts'

// Level 1: roll, jump (tap vs hold), motes, a lantern, one tiny thorn patch.
// Every mote sits on the path a natural run takes, and each section has room to land before the next.
export const firstLight: LevelDef = {
  id: 'first-light',
  name: 'First Light',
  build: () =>
    makeLevel(74, ({ fill, mote, checkpoint, sign, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(34, 38)
      pond(64, 67)

      // roll
      sign(6, 9, 'Roll →')
      mote(7, 12)
      mote(9, 12)
      mote(11, 12)

      // a one-tile step: any jump clears it; the mote hangs on the jump arc
      sign(13, 9, 'Jump ↑')
      fill(15, 12, 16, 12, '#')
      mote(16, 10)

      // a two-step stair: the second step needs a longer press
      sign(19, 7, 'Hold jump to go higher')
      fill(20, 11, 21, 12, '#')
      fill(22, 9, 23, 12, '#')
      mote(23, 8)

      // first lantern (lanterns sit about every 23 tiles in this level)
      checkpoint(26, 12)
      sign(26, 6, 'Lanterns save your place')

      // a shallow ditch you roll into and hop out of
      fill(29, 13, 32, 13, '.')
      mote(30, 13)

      // a tall wall: full hold
      sign(40, 7, 'Hold all the way')
      fill(43, 10, 44, 12, '#')
      mote(43, 9)

      checkpoint(49, 12)

      // first thorns: two tiles, easy to hop, with room to land after the wall
      fill(57, 13, 58, 14, '.')
      fill(57, 14, 58, 14, '^')
      sign(55, 8, 'Thorns hurt: hop over')
      mote(57, 10)

      // home stretch: the last mote is a hop on the way into the gate
      mote(63, 12)
      mote(65, 12)
      mote(68, 10)
      sign(67, 7, 'Roll into the gate')
    }, 'garden'),
}
