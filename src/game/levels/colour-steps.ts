import { makeLevel, type LevelDef } from '../level.ts'

// Level 8: coloured platforms, swapping mid-climb. Staircases whose treads alternate amber/cyan,
// with a curtain between each pair so you change colour in mid-air on the way to the next tread.
// Climbs reach rows 3-5 and come back down; hanging curtains over landings punish a jump that is
// too high (swap too early and the tread under you vanishes over thorns).
export const colourSteps: LevelDef = {
  id: 'colour-steps',
  name: 'Colour Steps',
  build: () =>
    makeLevel(207, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(6, 11)
      pond(68, 73)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const curtain = (x: number, c: 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, c)
      // a floating tread of colour k at row y, with the matching curtain hanging just before it
      // (down to the row above the tread, so you only pass it in the air on the way up)
      const tread = (x0: number, x1: number, y: number, k: 'A' | 'C') => {
        curtain(x0 - 2, k === 'A' ? 'a' : 'c', 1, y - 1)
        fill(x0, y, x1, y, k)
      }

      // A. rising colour stair over thorns: every tread needs a mid-air swap
      sign(5, 7, 'Swap colours in mid-air')
      checkpoint(15, 12)
      pit(17, 40)
      fill(18, 11, 20, 11, 'A')
      tread(24, 26, 9, 'C')
      tread(30, 32, 7, 'A')
      checkpoint(31, 6)
      tread(36, 38, 5, 'C')
      fill(41, 5, 48, 12, '#') // mesa
      mote(19, 10)
      mote(25, 8)
      mote(31, 5) // on the jump arc between treads
      mote(37, 4)
      checkpoint(44, 4)

      // B. descending colour stair; a hanging amber curtain over the last cyan tread:
      //    roll off gently, jump high and you swap too early and fall through
      pit(49, 66)
      curtain(50, 'c', 1, 6)
      fill(51, 7, 53, 7, 'C')
      curtain(55, 'a', 1, 8)
      fill(57, 9, 59, 9, 'A')
      checkpoint(58, 8)
      curtain(61, 'c', 1, 10)
      fill(63, 11, 66, 11, 'C')
      curtain(64, 'a', 1, 8) // trap
      mote(52, 6)
      mote(58, 7)
      mote(65, 10)
      checkpoint(74, 12)

      // C. colour roof: an amber roof over the run-up stops the jump onto the tower until you turn
      //    cyan; then turn amber again in mid-air to land on the amber tread above the tower
      curtain(71, 'a')
      curtain(78, 'c', 1, 10) // hangs low enough that a deliberate medium jump enters it (rolling under doesn't)
      fill(79, 12, 79, 12, '#') // pens the roof beetle (x 80-87) away from the run-up
      fill(80, 1, 87, 9, 'A')
      beetle(83, 12)
      fill(88, 10, 90, 12, '#') // tower
      checkpoint(89, 9)
      pit(91, 96)
      tread(93, 95, 7, 'A')
      fill(98, 5, 102, 12, '#')
      mote(82, 10)
      mote(88, 9) // on the leap onto the tower
      mote(94, 6)
      mote(100, 4)
      checkpoint(101, 4)

      // D. high cyan bridge with a beetle, then a colour stair back down
      pit(103, 126)
      curtain(103, 'c', 1, 4)
      fill(105, 5, 113, 5, 'C')
      beetle(110, 4)
      mote(104, 3)
      mote(110, 2) // on the stomp bounce
      tread(117, 119, 8, 'A')
      checkpoint(118, 7)
      tread(123, 125, 11, 'C')
      mote(121, 7)
      mote(124, 10)
      checkpoint(131, 12)

      // E. climb to the canyon rim. The next curtain hangs over the last tile of each tread:
      //    roll to the edge and you swap too early and drop through. Jump before the edge.
      sign(132, 7, 'Jump before the curtain')
      pit(134, 153)
      curtain(134, 'a', 1, 10)
      fill(136, 11, 138, 11, 'A')
      curtain(138, 'c', 1, 10)
      fill(141, 9, 143, 9, 'C')
      curtain(143, 'a', 1, 8)
      fill(146, 7, 148, 7, 'A')
      checkpoint(146, 6)
      curtain(148, 'c', 1, 6)
      fill(151, 5, 152, 5, 'C')
      fill(155, 3, 160, 12, '#')
      mote(137, 10)
      mote(142, 8)
      mote(147, 6)
      mote(151, 3)
      mote(158, 2)
      checkpoint(159, 2)

      // F. long descent with an early-swap trap over the middle tread
      pit(161, 181)
      curtain(162, 'a', 1, 4)
      fill(164, 6, 166, 6, 'A')
      curtain(168, 'c', 1, 7)
      fill(170, 9, 172, 9, 'C')
      curtain(171, 'a', 1, 6) // trap
      checkpoint(171, 8)
      curtain(174, 'a', 1, 10)
      fill(176, 11, 178, 11, 'A')
      mote(165, 5)
      mote(171, 7)
      mote(176, 9)
      mote(181, 10) // the leap off the last tread
      checkpoint(185, 12)

      // G. finale: colour stair up to the gate ledge, where a beetle keeps watch
      curtain(189, 'c')
      fill(191, 11, 192, 11, 'C')
      tread(195, 196, 9, 'A')
      fill(199, 7, 205, 12, '#')
      beetle(203, 6)
      mote(192, 10)
      mote(196, 8)
      mote(202, 5) // on the stomp bounce
      exit(205, 6)
    }, 'canyon'),
}
