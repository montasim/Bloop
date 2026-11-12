import { makeLevel, type LevelDef } from '../level.ts'

// Level 23, chapter 5: gravity + crates. Crates always fall down, whichever way you fall.
// Riding a roof you can only push a crate whose side reaches the row right under that roof (a stone perched
// on a pillar or a floating block, the top crate of a stack), and a stone you knock off drops to the floor.
// Every inverted stretch is closed by 'D' columns on both sides; lanterns sit on upright floor outside the pens,
// so a respawn (which puts every crate back) always restarts a puzzle from its beginning.
export const twinGravity: LevelDef = {
  id: 'twin-gravity',
  name: 'Twin Gravity',
  build: () =>
    makeLevel(368, ({ fill, mote, checkpoint, crate, sign, pond, exit }) => {
      const motes = (...ps: [number, number][]) => ps.forEach(([x, y]) => mote(x, y))
      const lanterns = (...xs: number[]) => xs.forEach((x) => checkpoint(x, 12))
      const col = (x: number, t: 'U' | 'D' | 'C', y0 = 1, y1 = 12) => fill(x, y0, x, y1, t)
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const thorns = (x0: number, x1: number, y = 12) => fill(x0, y, x1, y, '^')
      const hang = (x0: number, x1: number, y: number) => fill(x0, y, x1, y, 'v')
      const notch = (x: number) => fill(x, 13, x, 13, '^') // a 1-deep thorn slot a crate drops into flush

      // A. warm-up: up over a thorn pit, hop the hanging thorns, back down
motes([5, 12], [9, 12], [13, 12], [19, 11], [27, 12])
      pond(3, 8)
      sign(6, 8, 'Lights flip you. Crates always fall')
      lanterns(10, 25)
      fill(13, 1, 24, 7, '#')
      col(12, 'D', 8)
      col(14, 'U', 8)
      pit(16, 22)
      hang(19, 20, 8)
      col(24, 'D', 8)

      // B. the hanging stone: from the roof, knock the stone off its pillar, then push it to the wall and climb
      motes([31, 12], [35, 10], [36, 8], [42, 7], [45, 9], [48, 9], [55, 10])
      lanterns(28, 37)
      fill(31, 1, 47, 6, '#')
      col(31, 'D', 7)
      col(33, 'U', 7)
      sign(36, 11, 'Ride the roof into the stone')
      fill(40, 8, 40, 12, '#')
      crate(40, 7)
      // the stone slides along a ledge and always lands right of the cyan fence under it, so you can get behind it;
      // the ledge is solid so you can't hop down under the stone from the roof and leave it behind
      fill(41, 8, 42, 8, '#')
      fill(41, 9, 42, 12, 'C')
      col(44, 'D', 7)
      fill(49, 9, 52, 12, '#')
      lanterns(56, 59)

      // C. ping-pong tube: roof over floor thorns, floor under roof thorns, roof again
      motes([60, 12], [64, 10], [70, 10], [72, 9], [79, 11], [83, 9], [87, 9])
      fill(60, 1, 90, 8, '#')
      col(60, 'D', 9)
      col(62, 'U', 9)
      thorns(64, 71)
      hang(69, 69, 9)
      col(72, 'D', 9)
      hang(74, 80, 9)
      thorns(78, 78)
      lanterns(75)
      col(81, 'U', 9)
      thorns(83, 87)
      hang(85, 85, 9)
      col(88, 'D', 9)
      lanterns(92)

      // D. the stone chute: knock the stone into the down-light and follow it; it plugs the thorn slot at the
      //    bottom, and you roll out through the low tunnel
      motes([95, 12], [100, 10], [102, 6], [107, 6], [112, 12], [114, 12])
      fill(96, 1, 112, 5, '#')
      col(96, 'D', 6)
      col(98, 'U', 6)
      thorns(100, 105)
      fill(106, 7, 106, 12, '#')
      crate(106, 6)
      col(107, 'D', 6)
      notch(107)
      fill(108, 6, 113, 11, '#')
      sign(93, 8, 'Follow the stone down')
      lanterns(99, 115)

      // E. two lanes: up a shaft, ride the ceiling, push the stone down the hole onto the thorn below, follow it
      motes([122, 10], [123, 9], [129, 2], [133, 4], [138, 4], [143, 7], [146, 9], [152, 12])
      fill(120, 6, 152, 8, '#')
      col(120, 'D', 9)
      thorns(122, 123)
      fill(124, 6, 126, 10, 'U')
      col(123, 'D', 1, 5)
      fill(127, 9, 128, 12, '#')
      col(129, 'D', 9)
      hang(131, 132, 1)
      col(135, 'D', 1, 5)
      crate(139, 5)
      fill(143, 6, 143, 8, '.')
      fill(144, 1, 152, 5, '#')
      notch(143)
      thorns(147, 148)
      lanterns(118, 146, 150, 155)
      checkpoint(137, 5)

      // F. flip-flop over a thorn pit: hanging up-light, roof, down onto the island, up again, down
      motes([160, 10], [161, 9], [168, 4], [172, 4], [181, 6], [187, 6])
      fill(160, 0, 186, 2, '#')
      pit(160, 185)
      col(159, 'D', 3)
      fill(162, 8, 163, 9, 'U')
      hang(172, 172, 3)
      fill(173, 3, 173, 6, 'D')
      fill(176, 10, 179, 14, '#')
      checkpoint(177, 9)
      fill(181, 5, 182, 6, 'U')
      fill(185, 3, 185, 6, 'D')
      col(186, 'D', 3)
      lanterns(158, 189)
      pond(188, 192)

      // G. the stacks: in a low hall, knock the top crate down the light into the thorn slot, ride down after it
      motes([192, 12], [198, 11], [202, 11], [210, 11], [212, 11], [218, 11], [223, 12])
      fill(194, 1, 222, 10, '#')
      col(194, 'D', 11)
      col(196, 'U', 11)
      crate(201, 12)
      crate(201, 11)
      notch(202)
      col(202, 'D', 11)
      col(203, 'C', 11)
      hang(205, 207, 11)
      col(208, 'D', 11)
      col(209, 'U', 11)
      crate(213, 12)
      crate(213, 11)
      notch(214)
      col(214, 'D', 11)
      col(215, 'C', 11)
      notch(218)
      lanterns(199, 211, 219, 224)
      sign(191, 8, 'Knock the top crate')

      // H. step-lights: a crate is the step up into a high light; ride over the pit, knock the next stone down
      motes([231, 12], [236, 10], [240, 6], [244, 6], [248, 9], [252, 10], [257, 6], [262, 6])
      lanterns(227, 235)
      sign(229, 9, 'A crate makes a step')
      crate(231, 12)
      fill(234, 1, 262, 5, '#')
      col(233, 'D') // roll back off the roof's left end and you drop, not fly up to the sky
      fill(236, 6, 238, 8, 'U')
      pit(240, 243)
      hang(240, 243, 11)
      fill(244, 7, 244, 12, '#')
      crate(244, 6)
      fill(245, 7, 246, 7, '#')
      fill(245, 8, 246, 12, 'C')
      col(249, 'D', 6)
      fill(253, 6, 255, 8, 'U')
      pit(257, 260)
      hang(257, 260, 11)
      col(262, 'D', 6)
      lanterns(264, 266)

      // I. thorn hall: floor and roof take turns being thorny
      motes([270, 9], [276, 9], [282, 9], [287, 8], [293, 7], [296, 10])
      fill(268, 1, 298, 6, '#')
      col(267, 'D', 7)
      col(269, 'U', 7)
      thorns(270, 276)
      hang(273, 273, 7)
      col(277, 'D', 7)
      hang(278, 284, 7)
      thorns(281, 281)
      lanterns(279)
      col(285, 'U', 7)
      thorns(286, 292)
      hang(289, 289, 7)
      col(293, 'D', 7)
      lanterns(296)

      // J1. finale chute: knock the stone into the light, ride down onto it and roll out through the tunnel
      motes([302, 9], [310, 6], [312, 6], [315, 5], [321, 12], [325, 12])
      fill(303, 1, 318, 4, '#')
      col(303, 'D', 5)
      col(305, 'U', 5)
      thorns(307, 312)
      hang(309, 309, 5)
      fill(314, 6, 314, 12, '#')
      crate(314, 5)
      col(315, 'D', 5)
      notch(315)
      fill(316, 5, 326, 11, '#')
      crate(319, 12) // a second crate waits in the tunnel: push it into the next slot
      notch(322)
      fill(323, 12, 323, 12, 'C')
      lanterns(301, 306, 329)

      // J2. two stones, one wall: push the first under the light, hop up into it, drop the second on top, climb
      motes([335, 10], [340, 6], [342, 10], [349, 10], [357, 9], [358, 11], [364, 12])
      fill(331, 1, 349, 5, '#')
      col(331, 'D', 6)
      col(333, 'U', 6)
      fill(336, 7, 336, 12, '#')
      crate(336, 6)
      fill(337, 7, 338, 7, '#')
      fill(337, 8, 338, 12, 'C')
      col(340, 'D', 6)
      hang(342, 343, 6)
      fill(345, 8, 345, 9, 'U') // a full hop reaches it; a landing bounce or a low hop over a crate stays below
      fill(348, 7, 348, 7, '#')
      crate(348, 6)
      col(349, 'D', 6, 11)
      fill(350, 6, 350, 6, '#') // stops the stone, and you: drop straight down onto the stack, not onto the wall
      fill(350, 8, 354, 12, '#')
      lanterns(332, 357, 361, 365)
      exit(366, 12)
    }, 'starfield'),
}
