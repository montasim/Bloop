import { makeLevel, type LevelDef } from '../level.ts'

// Level 28, chapter 6: gravity mastery. Tall shafts climbed and fallen through by flipping: a curtain on the way up,
// a comb of shelves climbed upside-down, starlight bridges (a down-light over an up-light: roll on gently and you hover
// on the seam), chimneys with thorn knobs to steer around mid-fall, a colour roof where hop depth picks the curtain,
// beetle drops from the roof (held stomp back up into the light), two flip chains, a prism climb, a stepped star
// stair and a last fall up through every colour. Every inverted stretch is closed by down-lights (full columns or a
// band over a pocket); lanterns sit on upright floor and respawn safely in either colour.
export const starfallShaft: LevelDef = {
  id: 'starfall-shaft',
  name: 'Starfall Shaft',
  build: () =>
    makeLevel(428, ({ fill, mote, checkpoint, beetle, sign, pond, exit }) => {
      const motes = (...ps: [number, number][]) => ps.forEach(([x, y]) => mote(x, y))
      const lanterns = (...ps: (number | [number, number])[]) => ps.forEach((p) => (typeof p === 'number' ? checkpoint(p, 12) : checkpoint(p[0], p[1])))
      const col = (x: number, t: 'U' | 'D' | 'a' | 'c' | 'A' | 'C', y0 = 1, y1 = 12) => fill(x, y0, x, y1, t)
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const thorns = (x0: number, x1: number, y = 12) => fill(x0, y, x1, y, '^')
      const hang = (x0: number, x1: number, y: number) => fill(x0, y, x1, y, 'v')
      // a starlight bridge: down-light above row y, up-light from row y down. A ball that rolls on gently hovers on
      // the seam; drop onto it from higher up and it swings as far past the seam as it fell.
      const seam = (x0: number, x1: number, y: number, top = 1, bottom = 12) => {
        fill(x0, top, x1, y - 1, 'D')
        fill(x0, y, x1, bottom, 'U')
      }

      // start
      pond(4, 9)
      sign(6, 9, 'Lights turn your fall around')
      motes([9, 12])
      lanterns(6, 11)

      // A. starfall: fall up through a curtain onto a cyan roof over a thorn pit, hop the hanging thorn, drop
      col(14, 'D')
      fill(16, 0, 38, 3, '#')
      fill(25, 2, 31, 3, '.')
      hang(25, 31, 2)
      fill(25, 3, 31, 3, 'C')
      fill(18, 10, 19, 12, 'U')
      fill(16, 7, 26, 7, 'c')
      pit(21, 37)
      hang(34, 34, 4)
      col(39, 'D')
      col(40, 'a', 9)
      motes([13, 12], [20, 10], [22, 6], [28, 4], [35, 5], [42, 8])
      lanterns(17, 38, 41)

      // B. the comb: a thorn-floored shaft climbed upside-down, right under one shelf, left under the next, then
      //    right along the ceiling and out of the top
      fill(45, 1, 45, 8, '#')
      fill(45, 7, 50, 7, '#')
      fill(51, 5, 55, 5, '#')
      fill(56, 4, 63, 12, '#')
      fill(46, 10, 47, 12, 'U')
      thorns(48, 55)
      hang(46, 47, 1) // leave the second shelf slowly or land on these
      col(61, 'D', 1, 3)
      motes([49, 8], [53, 7], [54, 6], [50, 1], [58, 1])
      lanterns(44, [57, 3], [60, 3])

      // C. starlight bridges: hover on the seam between a down-light and an up-light
      sign(62, 2, 'Roll gently onto starlight')
      seam(64, 71, 4)
      thorns(64, 71)
      fill(72, 5, 73, 12, '#') // landings sit a row under the seam so you can float onto them from either side
      fill(74, 9, 80, 12, '#')
      seam(81, 91, 8)
      hang(83, 90, 6)
      thorns(83, 90, 9)
      fill(92, 9, 93, 12, '#')
      fill(94, 7, 95, 12, '#')
      for (const [x0, x1, y] of [[72, 73, 4], [74, 80, 8], [92, 93, 8], [94, 95, 6]]) fill(x0, 1, x1, y, 'D') // float off a bridge in its up-half and the landing still pulls you down
      seam(96, 101, 8)
      fill(102, 0, 110, 3, '#')
      col(111, 'D')
      motes([64, 3], [68, 3], [85, 8], [88, 7], [101, 6], [106, 4], [110, 4])
      lanterns([72, 4], [77, 8], [92, 8], [94, 6], 104, 113)

      // D. chimneys: tall up- and down-shafts with thorn knobs on their walls; steer around them as you fall
      fill(118, 1, 118, 9, '#')
      fill(119, 10, 121, 12, 'U')
      fill(121, 6, 121, 6, '^')
      fill(122, 4, 128, 12, '#')
      hang(128, 128, 1)
      fill(129, 1, 131, 12, 'D')
      fill(132, 1, 132, 9, '#')
      hang(131, 131, 7)
      pit(135, 137)
      fill(133, 1, 139, 2, 'D') // slip under the wall into the low lane upside-down and this drops you back
      fill(140, 1, 140, 9, '#')
      fill(141, 10, 144, 12, 'U')
      fill(141, 8, 141, 8, '^')
      fill(144, 4, 144, 4, '^')
      fill(145, 5, 150, 12, '#')
      hang(149, 149, 1)
      fill(151, 1, 153, 12, 'D')
      fill(154, 1, 154, 9, '#')
      hang(151, 151, 2)
      hang(153, 153, 10)
      motes([119, 8], [120, 3], [123, 1], [128, 3], [130, 5], [130, 10], [136, 9], [139, 12], [142, 6], [142, 2], [146, 1], [149, 3], [152, 7])
      lanterns(116, [124, 3], [127, 3], 130, 134, 139, [146, 4], [149, 4], 152, 156)

      // E. colour roof: an upside-down road of amber and cyan slabs over a thorn pit; every road thorn is hopped
      //    downward, and how deep you hop picks which curtain (or down-light) you touch
      col(155, 'D')
      fill(156, 4, 208, 6, '#')
      hang(156, 208, 1)
      fill(157, 9, 158, 12, 'U')
      hang(168, 168, 7)
      fill(167, 9, 169, 10, 'c')
      fill(169, 4, 180, 6, 'C')
      hang(176, 176, 7)
      fill(175, 10, 177, 11, 'a')
      pit(162, 180)
      hang(183, 183, 7)
      fill(182, 8, 183, 9, 'a')
      fill(182, 10, 183, 12, 'U')
      fill(184, 4, 193, 6, 'A')
      hang(190, 190, 7)
      fill(189, 10, 191, 11, 'c')
      pit(185, 194)
      hang(197, 197, 7)
      fill(196, 8, 197, 9, 'c')
      fill(196, 10, 197, 12, 'U')
      fill(198, 4, 207, 6, 'C')
      hang(204, 204, 7)
      fill(203, 10, 205, 11, 'D')
      pit(198, 208)
      col(209, 'D')
      col(210, 'a', 9)
      motes([163, 7], [168, 9], [172, 7], [176, 8], [179, 7], [183, 9], [187, 7], [190, 8], [193, 7], [197, 9], [200, 7], [204, 8], [207, 7])
      lanterns(181, 195, 211)

      // F. beetle drops: ride the roof, fall through a down-light onto a beetle's pillar, stomp with jump held to
      //    reach the up-light above it (a plain jump falls short), and back onto the roof
      fill(212, 0, 252, 3, '#')
      fill(213, 10, 214, 12, 'U')
      pit(218, 251)
      fill(219, 4, 219, 5, 'D')
      fill(221, 9, 223, 14, '#')
      beetle(222, 8)
      fill(221, 4, 224, 4, 'U')
      fill(230, 4, 230, 5, 'D')
      fill(232, 10, 234, 14, '#')
      beetle(233, 9)
      fill(232, 4, 235, 5, 'U')
      fill(237, 4, 237, 5, 'D')
      fill(239, 9, 241, 14, '#')
      fill(240, 5, 241, 6, 'U')
      fill(244, 4, 244, 5, 'D')
      fill(246, 8, 248, 14, '#')
      beetle(247, 7)
      fill(246, 4, 249, 4, 'U')
      col(253, 'D')
      motes([213, 8], [216, 4], [220, 7], [228, 4], [231, 7], [236, 4], [240, 7], [243, 4], [245, 6], [251, 4])
      lanterns([240, 8])

      // G. the flip chain: up- and down-lights in a row, a few tiles apart; at full roll speed you weave between
      //    the thorn teeth without touching ground. Slow down or hop in, and the swing grows into the teeth
      fill(253, 10, 262, 12, '#')
      for (let x = 262, i = 0; x < 281; x += i === 0 ? 2 : 4, i++) col(x, i % 2 ? 'D' : 'U', 1, i ? 12 : 9)
      pit(263, 283)
      for (const [x, y] of [[266, 5], [274, 5], [282, 4]]) (fill(x, 1, x, y - 1, '#'), hang(x, x, y))
      for (const x of [270, 278]) (fill(x, 12, x, 14, '#'), thorns(x, x, 11))
      fill(284, 10, 299, 12, '#')
      motes([264, 8], [266, 6], [268, 8], [270, 9], [278, 9], [286, 9], [291, 9])
      motes([260, 9])
      lanterns([255, 9], [261, 9], [289, 9], [296, 9])
      // the chain again, upside-down: up off the ledge to a short roof, then down-light first
      col(294, 'D', 1, 8) // drift left off the short roof and you drop back onto the ledge
      fill(297, 7, 298, 9, 'U')
      fill(296, 0, 307, 4, '#')
      for (let x = 307, i = 0; x < 324; x += i === 0 ? 2 : 4, i++) col(x, i % 2 ? 'U' : 'D', i ? 1 : 5, 12)
      pit(300, 325)
      for (const [x, y] of [[311, 9], [319, 9]]) (fill(x, y + 1, x, 14, '#'), thorns(x, x, y))
      for (const x of [315, 323]) (fill(x, 1, x, 3, '#'), hang(x, x, 4))
      fill(326, 10, 332, 12, '#')
      motes([296, 9], [299, 7], [304, 5], [306, 5], [311, 7], [315, 5], [323, 5])
      motes([331, 9])
      lanterns([326, 9], [330, 9])

      // H. the prism climb: fall up under an amber slab, roll off its end through a cyan curtain, fall up through
      //    an amber slab you now pass, ride the cyan slab, roll off through an amber curtain to the ceiling
      col(332, 'D', 1, 8)
      fill(331, 7, 331, 9, 'a')
      fill(333, 9, 334, 12, 'U')
      pit(333, 347)
      fill(333, 6, 339, 6, 'A')
      fill(340, 6, 340, 8, 'c')
      fill(340, 4, 343, 4, 'A')
      fill(339, 2, 346, 2, 'C')
      hang(339, 346, 1)
      fill(347, 2, 347, 3, 'a')
      fill(348, 3, 354, 12, '#')
      col(352, 'D', 1, 2)
      motes([335, 7], [338, 7], [342, 5], [346, 3], [349, 1])
      lanterns([350, 2], [353, 2])

      // I. the star stair: off the high ledge onto a seam that steps down a row every four tiles; keep rolling and
      //    the swing stays small enough to pass between the teeth
      for (let i = 0; i < 6; i++) seam(355 + i * 4, 358 + i * 4, 3 + i)
      pit(355, 380)
      for (const [x, top, bottom] of [[364, 3, 6], [365, 3, 6], [372, 4, 8], [373, 4, 8], [377, 6, 10]]) {
        fill(x, 1, x, top - 1, '#')
        hang(x, x, top)
        fill(x, bottom + 1, x, 14, '#')
        thorns(x, x, bottom)
      }
      col(379, 'D', 1, 9)
      fill(379, 10, 386, 12, '#')
      motes([357, 3], [361, 3], [365, 4], [369, 6], [372, 5], [376, 8], [380, 7])
      lanterns([382, 9], [385, 9])

      // J. last light: fall up through three curtains onto the cyan roof, tap over its thorns (a full hop reaches
      //    the amber curtains), and drop to the gate
      pond(389, 394)
      sign(392, 9, 'Fall up through every colour')
      fill(398, 10, 399, 12, 'U')
      fill(397, 9, 404, 9, 'c')
      fill(397, 7, 404, 7, 'a')
      fill(397, 5, 404, 5, 'c')
      fill(396, 2, 417, 2, 'C')
      hang(396, 417, 1)
      hang(408, 408, 3)
      hang(413, 413, 3)
      fill(407, 6, 409, 7, 'a')
      fill(412, 6, 414, 7, 'a')
      col(395, 'D', 3)
      col(418, 'D')
      pit(401, 417)
      motes([388, 10], [390, 12], [394, 12], [400, 10], [401, 8], [402, 5], [403, 3], [408, 5], [411, 3], [413, 5], [414, 5], [418, 5], [422, 11], [424, 11])
      lanterns(387, 389, 393, 397, 419, 421, 424)

      exit(426, 12)
    }, 'starfall'),
}
