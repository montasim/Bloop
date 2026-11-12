import { makeLevel, type LevelDef } from '../level.ts'

// Level 26, chapter 6 opener: speed. Every section is a line you take at full roll: hop chains where each
// landing feeds the next, a held bounce line over a thorn bed, colour floors you swap onto mid-air, roof rides
// (full-height 'D' columns guard both ends of every inverted stretch; long ones have an upright rest island
// with its own up-light), stomps in stride, a thorny low burrow, and a held colour bounce line into the gate.
// Lanterns sit on flat rest pads, so stopping is always possible.
export const swiftRoots: LevelDef = {
  id: 'swift-roots',
  name: 'Swift Roots',
  build: () =>
    makeLevel(406, ({ fill, mote, checkpoint, beetle, sign, pond, exit }) => {
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const stone = (x0: number, x1: number, top: number) => fill(x0, top, x1, 14, '#')
      const col = (x: number, t: 'U' | 'D' | 'a' | 'c', y0 = 3, y1 = 12) => fill(x, y0, x, y1, t)
      const roof = (x0: number, x1: number) => fill(x0, 1, x1, 2, '#')
      const roofGap = (x0: number, x1: number) => (fill(x0, 1, x1, 2, '.'), fill(x0, 1, x1, 1, 'v'))
      const lit = (x: number, y = 12) => checkpoint(x, y)
      const motes = (...ps: [number, number][]) => ps.forEach(([x, y]) => mote(x, y))

      // A. warm-up stride: 3-wide pits, 2-wide footholds; each landing feeds the next hop
      pond(4, 10)
      sign(6, 9, 'Hold right. The roots reward speed')
      lit(6)
      lit(11)
      lit(13) // 1.5 tiles of run-up before the first pit when you respawn here
      pit(15, 17)
      lit(18)
      pit(20, 22)
      lit(23)
      pit(25, 27)
      lit(29)
      pit(31, 34)
      lit(36)

      // B. held bounce line: posts one held hop apart over a thorn bed (hold jump, let it bounce)
      lit(40)
      sign(40, 8, 'Hold jump: bounce the line')
      pit(43, 71)
      stone(47, 47, 13)
      stone(53, 54, 13)
      stone(59, 62, 13)
      lit(61)
      stone(66, 66, 13)

      // C. colour stride: 4-wide floors of one colour over thorns, a hanging light at each seam
      lit(74)
      lit(77)
      sign(77, 8, 'Jump through the light, land on its colour')
      fill(80, 14, 103, 14, '^')
      fill(80, 13, 83, 13, 'A')
      fill(84, 13, 87, 13, 'C')
      fill(88, 13, 91, 13, 'A')
      fill(92, 13, 95, 13, 'C')
      fill(96, 13, 99, 13, 'A')
      fill(100, 13, 103, 13, 'C')
      fill(81, 1, 102, 8, '#') // a thorn roof: short hops only, no held bouncing
      fill(81, 9, 102, 9, 'v')
      col(84, 'c', 10, 11)
      col(88, 'a', 10, 11)
      col(92, 'c', 10, 11)
      col(96, 'a', 10, 11)
      col(100, 'c', 10, 11)
      lit(82)
      lit(90)
      lit(98)

      // D. roof ride: roll into the up-light, ride the roof over a thorn pit, hop "down" over hanging thorns
      lit(106)
      lit(110)
      lit(114)
      col(116, 'D')
      col(118, 'U')
      roof(116, 141)
      pit(119, 138)
      fill(126, 3, 127, 3, 'v')
      fill(131, 3, 132, 3, 'v')
      fill(136, 3, 137, 3, 'v')
      col(141, 'D')

      // E. the ridge: 1-wide stones step up over thorns to a plateau, then back down
      lit(144)
      lit(146)
      pit(148, 181)
      stone(149, 151, 12)
      stone(155, 155, 11)
      stone(160, 160, 10)
      stone(164, 167, 9)
      lit(166, 8)
      stone(172, 172, 10)
      stone(177, 177, 11)

      // F. stomps in stride: beetles on posts climbing to a high shelf, one more stomp down to the bank
      lit(184)
      pit(187, 215)
      stone(191, 191, 12)
      beetle(191, 11)
      stone(196, 196, 11)
      beetle(196, 10)
      stone(201, 201, 10)
      beetle(201, 9)
      stone(205, 209, 8)
      lit(207, 7)
      stone(213, 213, 11)
      beetle(213, 10)

      // G. the thorny burrow: a low roof hung with thorns, pits underfoot. Tap, never hold
      lit(218)
      lit(222)
      fill(225, 1, 253, 8, '#')
      fill(225, 9, 253, 9, 'v')
      pit(228, 230)
      lit(231)
      pit(233, 235)
      lit(237)
      pit(239, 241)
      lit(242)
      pit(244, 246)
      lit(248)
      pit(249, 251)

      // H. jump into a hanging up-light, ride a gapped roof (hop down over the gaps); a rest island
      //    under the roof has its own up-light
      lit(255)
      lit(258)
      col(261, 'D')
      pit(263, 292)
      col(265, 'U', 3, 9)
      col(266, 'U', 3, 9)
      roof(261, 295)
      roofGap(270, 273)
      stone(276, 279, 13)
      lit(277)
      col(279, 'U')
      roofGap(288, 291)
      col(295, 'D')

      // I. long and short leaps: 1-wide islands at mixed heights over a wide thorn field
      lit(296)
      lit(299)
      pit(303, 333)
      stone(308, 308, 13)
      stone(313, 313, 11)
      stone(318, 318, 13)
      stone(322, 324, 12)
      lit(323, 11)
      stone(329, 329, 12)

      // J. colour on the roof: turn cyan, flip up, cross a roof gap through an amber light onto the amber road
      lit(338)
      lit(336)
      col(339, 'c')
      col(341, 'D')
      col(343, 'U')
      pit(344, 365)
      fill(341, 1, 367, 1, 'v')
      fill(341, 2, 353, 2, 'C')
      col(355, 'a', 4, 6)
      fill(357, 2, 367, 2, 'A')
      stone(359, 362, 13)
      lit(360)
      col(362, 'U')
      col(367, 'D')

      // K. finale: a held bounce line over thorns onto posts of alternating colour, a light before each
      lit(373)
      lit(377)
      fill(380, 13, 399, 13, '.')
      fill(380, 14, 399, 14, '^')
      col(382, 'c', 1, 11)
      fill(385, 13, 385, 13, 'C')
      col(388, 'a', 1, 11)
      fill(391, 13, 393, 13, 'A')
      lit(392)
      col(395, 'c', 1, 11)
      fill(398, 13, 398, 13, 'C')
      lit(402)
      // motes ride the fast lines: arc tops, roof roads, the held bounce lines
      motes([9, 12], [15, 10], [20, 10], [23, 12], [27, 9], [32, 9], [36, 12], [40, 9], [43, 11], [49, 9], [53, 12], [57, 9], [62, 9], [66, 12], [70, 9], [74, 11], [78, 12], [83, 11], [89, 11], [93, 10], [96, 11], [100, 10], [106, 12], [112, 12], [118, 12], [121, 8], [125, 6], [128, 5], [132, 5], [138, 6], [142, 6], [146, 9], [152, 8], [157, 8], [162, 6], [168, 5], [172, 8], [178, 8], [182, 11], [188, 9], [191, 10], [195, 9], [197, 8], [202, 7], [205, 7], [209, 7], [212, 9], [216, 8], [222, 12], [227, 10], [232, 10], [238, 12], [241, 11], [245, 10], [250, 10], [254, 12], [258, 9], [263, 9], [265, 9], [268, 6], [272, 6], [276, 3], [280, 6], [283, 4], [289, 6], [294, 5], [299, 11], [302, 12], [306, 9], [311, 9], [315, 9], [322, 9], [327, 9], [333, 8], [340, 9], [344, 10], [348, 4], [355, 6], [360, 6], [367, 3], [371, 8], [376, 9], [381, 9], [385, 12], [389, 9], [394, 9], [398, 12], [402, 9])
      exit(404, 12)
    }, 'daybreak'),
}
