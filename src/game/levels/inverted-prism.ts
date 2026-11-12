import { makeLevel, type LevelDef } from '../level.ts'

// Level 14: gravity + colours. Coloured roads hang under a thorny roof: upside-down, a road is a floor
// only in its own colour, so turning the wrong colour drops you UP into the thorns. Every inverted
// stretch is boxed by full-height 'D' columns. Lanterns sit on upright floor or on islands in the pits;
// an island lantern has a light to jump into (from a standstill, so you choose where you land).
export const invertedPrism: LevelDef = {
  id: 'inverted-prism',
  name: 'Inverted Prism',
  build: () =>
    makeLevel(281, ({ fill, mote, checkpoint, sign, beetle, pond, exit }) => {
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const island = (x0: number, x1: number) => fill(x0, 13, x1, 14, '#')
      const roof = (x0: number, x1: number) => fill(x0, 0, x1, 2, '#')
      // a coloured road hung under a thorn roof: solid only in its colour
      const road = (x0: number, x1: number, c: 'A' | 'C') => {
        fill(x0, 0, x1, 0, '#')
        fill(x0, 1, x1, 1, 'v')
        fill(x0, 2, x1, 2, c)
      }
      // a hole in the road: thorns behind it
      const gap = (x0: number, x1: number) => {
        fill(x0, 1, x1, 1, 'v')
        fill(x0, 2, x1, 2, '.')
      }
      const col = (x: number, t: 'U' | 'D' | 'a' | 'c' | 'A', y0 = 3, y1 = 12) => fill(x, y0, x, y1, t)
      const light = (x: number) => col(x, 'U', 3, 10) // a hanging up-light: jump into it
      const trap = (x: number, c: 'a' | 'c' | 'D', x1 = x) => fill(x, 3, x1, 3, c) // low on the road: hop it
      // a thorny beam under the road: at row 7 held bounces reach it, at row 6 anything but a short hop
      const beam = (x0: number, x1: number, y = 7) => {
        fill(x0, y, x1, y, '#')
        fill(x0, y - 1, x1, y - 1, '^')
      }
      // a beetle pen on a beam under the road: deep hops land on the beetle
      const pen = (x0: number, x1: number, bx: number, y = 7) => {
        fill(x0, y, x1, y, '#')
        fill(x0, y - 1, x0, y - 1, '#')
        fill(x1, y - 1, x1, y - 1, '#')
        beetle(bx, y - 1)
      }
      // flip in: a D column (catches you rolling back), an optional curtain, then the up-light
      const enter = (x: number, c?: 'a' | 'c') => {
        col(x, 'D', 1)
        if (c) col(x + 1, c)
        col(c ? x + 2 : x + 1, 'U')
      }
      const leave = (x: number) => {
        roof(x, x)
        col(x, 'D')
      }

      // A. an amber road over a thorn pit: hop the low cyan curtains, but not deep (thorn beam)
      pond(4, 8)
      checkpoint(5, 12)
      mote(7, 12)
      checkpoint(10, 12)
      sign(8, 8, 'Wrong colour: the road is a ghost')
      enter(12)
      roof(13, 24)
      pit(15, 38)
      island(18, 20)
      checkpoint(19, 12)
      light(21)
      road(25, 35, 'A')
      beam(25, 35)
      trap(27, 'c')
      trap(31, 'c')
      leave(36)
      mote(16, 8)
      mote(23, 3)
      mote(27, 4)
      mote(31, 4)
      mote(34, 3)
      checkpoint(40, 12)
      checkpoint(42, 12)

      // B. curtain, then the light: land on a cyan road; jump its gap through an amber curtain
      //    (mid-air swap) onto an amber road; hop cyan traps over a penned beetle
      enter(43, 'c')
      road(44, 66, 'C')
      pit(46, 46)
      island(47, 49)
      checkpoint(48, 12)
      col(50, 'U')
      pit(50, 67)
      gap(63, 66)
      col(64, 'a', 3, 4)
      col(65, 'a', 3, 4)
      beam(62, 67)
      road(67, 90, 'A')
      island(68, 70)
      checkpoint(69, 12)
      col(71, 'U')
      pit(71, 93)
      pen(82, 90, 86, 6)
      trap(84, 'c')
      trap(88, 'c')
      leave(91)
      mote(48, 8)
      mote(56, 3)
      mote(60, 3)
      mote(65, 4)
      mote(76, 3)
      mote(84, 4)
      mote(88, 4)
      checkpoint(95, 12)
      checkpoint(97, 12)

      // C. an amber wall across the road: only a cyan wisp gets through, and the cyan curtain hangs
      //    in a road gap right before it. Then hop amber traps on the cyan road.
      enter(98)
      roof(99, 114)
      pit(101, 124)
      island(102, 104)
      checkpoint(103, 12)
      light(105)
      gap(112, 114)
      col(113, 'c', 3, 4)
      road(115, 122, 'C')
      col(115, 'A')
      beam(116, 122, 6)
      trap(118, 'a', 119)
      leave(123)
      mote(102, 8)
      mote(113, 4)
      mote(115, 3)
      mote(119, 4)
      mote(121, 3)
      checkpoint(125, 12)
      checkpoint(128, 12)

      // D. colour seams: roll through low curtains that switch the road under you, hop the traps
      //    over penned beetles. The island lantern keeps the colour you had when you passed it.
      enter(130, 'a')
      road(131, 143, 'A')
      pit(133, 150)
      trap(144, 'c')
      road(144, 165, 'C')
      pen(145, 150, 148, 6)
      trap(147, 'a', 148)
      island(151, 153)
      checkpoint(152, 12)
      col(154, 'U')
      pit(154, 176)
      beam(160, 165, 6)
      trap(166, 'a')
      road(166, 173, 'A')
      pen(166, 173, 170, 6)
      trap(168, 'c')
      trap(172, 'c')
      leave(174)
      mote(135, 9)
      mote(143, 3)
      mote(148, 4)
      mote(159, 3)
      mote(168, 4)
      mote(172, 4)
      checkpoint(178, 12)
      checkpoint(181, 12)

      // E. jump through a cyan curtain into the light over a pit: swap and flip in mid-air
      pond(179, 182)
      pit(184, 207)
      col(185, 'c', 3, 10)
      light(186)
      light(187)
      road(185, 205, 'C')
      island(192, 194)
      checkpoint(193, 12)
      light(195)
      beam(199, 205, 6)
      trap(201, 'a', 202)
      leave(206)
      mote(184, 9)
      mote(190, 3)
      mote(196, 3)
      mote(205, 3)
      mote(202, 4)
      checkpoint(210, 12)
      checkpoint(213, 12)

      // F. finale tube: cyan, up onto a cyan ceiling (hop an amber trap), amber, down onto an amber
      //    bridge under thorns (hop a cyan trap), up again, down. Two colours and four flips between lanterns.
      fill(215, 0, 241, 8, '#')
      col(214, 'c', 1)
      col(215, 'D', 9)
      col(216, 'U', 9)
      fill(218, 8, 225, 8, 'C')
      fill(218, 7, 225, 7, 'v')
      fill(219, 12, 224, 12, '^')
      fill(223, 9, 223, 9, 'a')
      col(226, 'a', 9)
      col(227, 'D', 9)
      pit(228, 234)
      fill(228, 13, 234, 13, 'A')
      fill(229, 9, 233, 9, 'v')
      fill(233, 12, 233, 12, 'c')
      col(235, 'U', 9)
      fill(237, 12, 239, 12, '^')
      col(240, 'D', 9)
      mote(218, 11)
      mote(223, 10)
      mote(229, 12)
      mote(232, 10)
      mote(237, 9)
      checkpoint(243, 12)

      // G. last road: an amber trap and a down-light side by side on the cyan road, then the gate
      enter(248, 'c')
      road(249, 277, 'C')
      pit(251, 276)
      beam(262, 267, 6)
      trap(264, 'a')
      trap(265, 'D')
      island(268, 270)
      checkpoint(269, 12)
      light(271)
      leave(277)
      mote(253, 7)
      mote(260, 3)
      mote(265, 4)
      mote(268, 3)
      mote(273, 3)
      mote(276, 3)
      exit(279, 12)
    }, 'tundra'),
}
