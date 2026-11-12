import { makeLevel, type LevelDef } from '../level.ts'

// Level 12: hanging thorns while upside-down. Inverted play mirrors the floor: rock lowered from the
// roof is a "ceiling floor", 'v' under it are thorn bumps to hop "down" over, and gaps cut into it
// (thorns at the roof) are ceiling pits. Every inverted stretch is closed by full-height 'D' columns
// on both sides, so you can never leave one upside-down; lanterns sit on upright floor only.
export const ceilingThorns: LevelDef = {
  id: 'ceiling-thorns',
  name: 'Ceiling Thorns',
  build: () =>
    makeLevel(257, ({ fill, mote, checkpoint, sign, beetle, pond, exit }) => {
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const ceil = (x0: number, x1: number) => fill(x0, 0, x1, 2, '#')
      const cpit = (x0: number, x1: number) => {
        fill(x0, 1, x1, 2, '.')
        fill(x0, 1, x1, 1, 'v')
      }
      const hang = (x0: number, x1: number, y = 3) => fill(x0, y, x1, y, 'v')
      const col = (x: number, t: 'U' | 'D' | 'a' | 'c', y0 = 3, y1 = 12) => fill(x, y0, x, y1, t)
      // a roof run: D (rows 1-12, catches you rolling back left off the roof), then a full-height U
      const enter = (x: number) => {
        col(x, 'D', 1)
        col(x + 1, 'U')
      }

      // A. first flip: roll the roof over a thorn pit, hop down over two hanging patches
      pond(4, 8)
      mote(6, 12)
      checkpoint(6, 12)
      checkpoint(10, 12)
      sign(10, 7, 'Upside down, jumps go down')
      enter(12)
      ceil(13, 34)
      pit(15, 31)
      hang(26, 26)
      hang(29, 30)
      mote(20, 4) // on the landing bounce
      mote(26, 5)
      mote(30, 5)
      col(32, 'D')
      checkpoint(35, 12)
      pond(37, 41)
      mote(39, 12)
      checkpoint(42, 12)

      // B. long roof run over a thorn pit: hanging patches of 1-4 and roof pits, a lantern island halfway.
      //    A thorny beam hangs at the bottom of a held bounce, so hops have to be measured.
      enter(44)
      ceil(45, 103)
      pit(47, 69)
      fill(57, 7, 72, 7, '#')
      fill(57, 6, 72, 6, '^')
      hang(58, 59)
      cpit(62, 64)
      hang(67, 67)
      hang(71, 72)
      checkpoint(72, 12) // island: respawn upright, roll into the U column
      col(74, 'U')
      pit(76, 100)
      fill(86, 7, 100, 7, '#')
      fill(86, 6, 100, 6, '^')
      hang(87, 88)
      cpit(90, 92)
      hang(96, 99)
      mote(51, 4)
      mote(59, 5)
      mote(63, 4)
      mote(67, 5)
      mote(80, 5)
      mote(88, 5)
      mote(91, 4)
      mote(98, 5)
      col(101, 'D')
      checkpoint(102, 12)
      checkpoint(109, 12)
      checkpoint(115, 12)

      // C. the low tube: flip, flip, flip with thorns on both floor and roof; full jumps hit the roof
      fill(113, 0, 146, 8, '#')
      col(113, 'D', 9)
      col(116, 'U', 9)
      fill(119, 12, 127, 12, '^')
      hang(123, 123, 9)
      fill(126, 7, 127, 8, '.')
      hang(126, 127, 7)
      col(128, 'D', 9)
      checkpoint(130, 12)
      fill(134, 12, 134, 12, '^')
      pit(136, 137)
      hang(133, 138, 9)
      col(140, 'U', 9)
      fill(143, 12, 145, 12, '^')
      hang(144, 144, 9)
      col(146, 'D', 9)
      mote(118, 10)
      mote(123, 11)
      mote(127, 10)
      mote(131, 12)
      mote(134, 10)
      mote(137, 11)
      mote(144, 11)
      checkpoint(148, 12)

      // D. hanging thorns over beetle pens (cyan bumps: ghosts to you, walls to beetles). The short
      //    patches need a measured hop: a hop just deep enough, or a deeper one timed past the beetle.
      enter(150)
      ceil(151, 179)
      pit(153, 176)
      fill(163, 7, 174, 7, '#')
      fill(164, 6, 164, 6, 'C')
      fill(168, 6, 168, 6, 'C')
      fill(170, 6, 170, 6, 'C')
      fill(174, 6, 174, 6, 'C')
      beetle(166, 6)
      beetle(172, 6)
      hang(165, 167)
      hang(171, 173)
      mote(166, 5)
      mote(169, 4)
      mote(172, 5)
      col(177, 'D')
      checkpoint(178, 12)
      checkpoint(183, 12)

      // E. colour roof: a cyan bridge with an amber trap curtain under it, a mid-gap amber curtain,
      //    then an amber bridge with a cyan trap curtain right before a hanging thorn
      checkpoint(186, 12)
      enter(188)
      ceil(189, 217)
      pit(191, 214)
      col(200, 'c')
      cpit(202, 213)
      fill(202, 2, 207, 2, 'C')
      fill(205, 3, 205, 4, 'a')
      col(208, 'a')
      fill(209, 2, 213, 2, 'A')
      mote(203, 3)
      mote(205, 6)
      mote(213, 6)
      mote(208, 4)
      fill(210, 3, 210, 4, 'c')
      hang(211, 211)
      mote(211, 5)
      col(215, 'D')
      checkpoint(216, 12)
      pond(219, 224)
      checkpoint(221, 12)

      // F. finale: a long low tube, flip, flip, flip, to the gate
      checkpoint(225, 12)
      fill(228, 0, 255, 8, '#')
      col(228, 'D', 9)
      col(230, 'U', 9)
      fill(233, 12, 238, 12, '^')
      hang(233, 233, 9)
      fill(236, 7, 236, 8, '.')
      hang(236, 236, 7)
      hang(238, 238, 9)
      col(239, 'D', 9)
      checkpoint(241, 12)
      fill(243, 12, 243, 12, '^')
      hang(242, 244, 9)
      col(245, 'U', 9)
      fill(248, 12, 252, 12, '^')
      hang(250, 251, 9)
      col(253, 'D', 9)
      mote(233, 11)
      mote(236, 9)
      mote(243, 10)
      mote(250, 11)
      mote(231, 11)
      mote(246, 11)
      mote(254, 10)
      exit(255, 12)
    }, 'grotto'),
}
