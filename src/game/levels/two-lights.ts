import { makeLevel, type LevelDef } from '../level.ts'

// Level 6, chapter 2 opener: colour curtains. Rolling through a curtain changes your colour;
// only blocks of your colour are solid. Beetles treat every coloured block as solid, so coloured
// walls pen them in while you pass straight through. Mixed with chapter 1 hazards throughout.
export const twoLights: LevelDef = {
  id: 'two-lights',
  name: 'Two Lights',
  build: () =>
    makeLevel(176, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(111, 118)
      pond(144, 148)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const curtain = (x: number, c: 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, c)

      // A. intro: cyan curtain, amber wall, cyan bridge, amber curtain, cyan wall
      sign(5, 7, 'Curtains change your colour')
      curtain(10, 'c')
      fill(13, 1, 13, 12, 'A')
      checkpoint(15, 12)
      sign(19, 7, 'Only your colour is solid')
      pit(18, 22)
      fill(18, 13, 22, 13, 'C')
      mote(20, 11)
      curtain(25, 'a')
      fill(27, 1, 27, 12, 'C')
      mote(26, 11)
      checkpoint(30, 12)

      // B. a long bridge that changes colour twice, with a beetle on it
      curtain(33, 'c')
      pit(35, 48)
      fill(35, 13, 38, 13, 'C')
      curtain(39, 'a')
      fill(39, 13, 42, 13, 'A')
      curtain(43, 'c')
      fill(43, 13, 48, 13, 'C')
      beetle(46, 12)
      mote(37, 11)
      mote(41, 10)
      mote(46, 10)
      checkpoint(51, 12)

      // C. colour roof: amber rock over a tall wall; turn cyan and the roof is gone
      curtain(54, 'c')
      sign(57, 4, 'A roof of the other colour is no roof')
      fill(58, 1, 66, 9, 'A')
      fill(64, 10, 65, 12, '#')
      mote(64, 9)
      curtain(68, 'a')
      checkpoint(69, 12)
      // trap curtain over an amber floor: roll into it and the floor vanishes. Hop over.
      pit(73, 81)
      fill(73, 13, 81, 13, 'A')
      curtain(77, 'c', 11, 12)
      mote(77, 9)
      mote(80, 12) // on the far end of the trap floor
      checkpoint(84, 12)

      // D. narrow floating colour platforms over thorns; curtains recolour you mid-air,
      //    and a beetle rides the last one
      pit(87, 109) // ends early: a stomp-bounce off the last platform lands on ground
      fill(89, 11, 90, 11, 'A')
      curtain(92, 'c')
      fill(94, 9, 95, 9, 'C')
      curtain(97, 'a')
      fill(99, 11, 100, 11, 'A')
      checkpoint(99, 10)
      curtain(102, 'c')
      fill(104, 9, 107, 9, 'C')
      beetle(106, 8)
      curtain(109, 'a')
      mote(90, 10)
      mote(95, 8)
      mote(100, 8)
      mote(104, 8)
      mote(111, 9) // on the leap from the last platform
      checkpoint(116, 12)

      // E. beetle pens: coloured walls keep beetles in, you pass through
      fill(120, 1, 120, 12, 'C')
      beetle(124, 12)
      fill(128, 1, 128, 12, 'C')
      mote(124, 10)
      checkpoint(129, 12) // safe ground between the pens
      curtain(130, 'c')
      fill(132, 1, 132, 12, 'A')
      pit(135, 137)
      beetle(140, 12)
      fill(143, 1, 143, 12, 'A')
      mote(136, 9)
      mote(140, 10)
      checkpoint(146, 12)

      // F. finale: thorn pit, then a colour stair with a mid-air swap, up to the gate
      pit(150, 154)
      mote(152, 9)
      mote(155, 11)
      curtain(157, 'c')
      fill(159, 11, 160, 12, 'C')
      curtain(162, 'a', 1, 10)
      fill(164, 9, 165, 12, 'A')
      fill(167, 9, 174, 12, '#')
      mote(160, 10)
      mote(165, 8)
      mote(170, 8)
      exit(174, 8)
    }, 'prism'),
}
