import { makeLevel, type LevelDef } from '../level.ts'

// Level 30, chapter 6, the finale: a climb out of the night into sunrise, built as set pieces that combine the
// game's ideas: a springboard through two curtains into an up-light and along the roof; a crate pushed out on a cyan
// bridge, hopped onto through an amber band (the bridge is gone, the crate stays) and used to reach the light;
// starlight over a thorn tunnel with a dark gap; a held-stomp chain up beetle posts; a flip ladder whose roofs and
// floors only hold the colour its last curtain gave you; a prism stair; tap stomps under a thorn roof; a crate that
// plugs a thorn slot under a roof too low to jump; a roof walk over beetle shelves; a flow line of pits into a
// single stone. Then the calm: a sunlit meadow with ponds, lanterns along the path, arcs of motes and the gate.
// Every inverted stretch is closed by down-lights; every lantern respawns you on upright floor in its own colour.
export const dawnGate: LevelDef = {
  id: 'dawn-gate',
  name: 'Dawn Gate',
  build: () =>
    makeLevel(
      456,
      ({ fill, mote, checkpoint, beetle, crate, sign, pond, exit }) => {
        const motes = (...ps: [number, number][]) => ps.forEach(([x, y]) => mote(x, y))
        const lanterns = (...ps: (number | [number, number])[]) => ps.forEach((p) => (typeof p === 'number' ? checkpoint(p, 12) : checkpoint(p[0], p[1])))
        const pit = (x0: number, x1: number) => {
          fill(x0, 13, x1, 14, '.')
          fill(x0, 14, x1, 14, '^')
        }
        const col = (x: number, t: 'U' | 'D' | 'a' | 'c' | 'A' | 'C', y0 = 1, y1 = 12) => fill(x, y0, x, y1, t)

        // prologue: the last of the night, thorn pits and stones
        sign(5, 10, 'One last climb. Dawn is waiting.')
        pit(8, 10)
        lanterns(13)
        pit(16, 24)
        fill(17, 11, 17, 13, '#')
        fill(20, 9, 20, 13, '#')
        fill(23, 11, 23, 13, '#')
        motes([4, 10], [9, 9], [15, 9], [20, 7], [23, 9], [27, 12])
        lanterns([20, 8], 26, 30)

        // A. springboard: a held stomp over the wall, through two curtains into an up-light, then the roof road
        //    (a cyan bridge, a thorn to hop, an amber curtain, an amber bridge)
        fill(32, 12, 32, 12, '#')
        beetle(35, 12)
        fill(38, 12, 38, 12, '#')
        fill(40, 9, 41, 12, '#')
        lanterns([40, 8])
        col(41, 'D', 1, 8)
        col(42, 'a', 1, 11)
        col(43, 'c', 1, 11)
        fill(44, 1, 46, 12, 'U')
        fill(42, 12, 43, 12, '^')
        fill(47, 12, 65, 12, '^')
        fill(49, 0, 51, 0, 'C')
        fill(54, 1, 55, 1, 'v')
        col(58, 'a', 1, 4)
        fill(56, 5, 56, 12, '#') // a rest post under the roof, with a light to climb back up
        fill(56, 1, 56, 3, 'U')
        lanterns([56, 4])
        fill(61, 0, 63, 0, 'A')
        col(66, 'D')
        motes([38, 8], [42, 8], [51, 1], [53, 3], [55, 3], [62, 1])
        lanterns(69)

        // B. the crate on the cyan bridge: push it out while cyan, hop through the amber band onto it (the bridge is
        //    gone, the crate stays), jump from it into the up-light, then hanging stones over an open sky
        col(71, 'c', 9, 12)
        lanterns(73, 75)
        crate(77, 12)
        fill(79, 13, 87, 13, 'C')
        fill(79, 14, 87, 14, '^')
        fill(79, 9, 87, 9, 'a')
        fill(88, 12, 88, 12, 'C') // stops the crate at the end of the bridge
        pit(88, 101)
        fill(86, 1, 89, 8, 'U')
        col(84, 'D', 1, 8) // roll back left along the roof and you drop, not drift home upside-down
        fill(91, 0, 92, 0, '.')
        fill(93, 1, 95, 2, '#')
        fill(96, 0, 96, 0, '.')
        fill(97, 1, 98, 1, '#')
        fill(99, 0, 99, 0, '.')
        col(102, 'D')
        motes([74, 12], [82, 12], [87, 7], [87, 1], [93, 4], [97, 3], [100, 2])
        lanterns(104)

        // C. starlight over thorns: hover on the seam (a down-light over an up-light) through a thorn tunnel; the dark
        //    gap (all down-light) sinks you, so roll through it at full speed and swing out the far side
        const lane = (x0: number, x1: number) => (fill(x0, 1, x1, 8, 'D'), fill(x0, 9, x1, 12, 'U'))
        fill(107, 11, 107, 12, '#')
        fill(108, 9, 110, 12, '#')
        fill(108, 1, 110, 8, 'D')
        lanterns([109, 8])
        lane(111, 136)
        fill(111, 6, 136, 6, 'v')
        fill(111, 11, 136, 12, '^')
        sign(110, 4, 'Keep rolling through the dark')
        fill(123, 1, 124, 10, 'D')
        fill(137, 10, 142, 12, '#')
        fill(137, 1, 142, 9, 'D')
        motes([107, 8], [110, 8], [112, 9], [116, 9], [121, 9], [126, 10], [130, 8], [132, 9], [135, 8], [140, 8])
        lanterns([138, 9])

        // D. stomp chain: held stomps up three beetle posts (1 wide, so the beetles stand still) over a thorn sea
        lanterns(143)
        fill(146, 12, 161, 12, '^')
        fill(147, 10, 147, 12, '#')
        beetle(147, 9)
        fill(152, 9, 152, 12, '#')
        beetle(152, 8)
        fill(157, 8, 157, 12, '#')
        beetle(157, 7)
        fill(161, 6, 166, 12, '#')
        motes([145, 9], [149, 5], [154, 4], [157, 5], [159, 3])
        lanterns([162, 5])

        // E. the flip ladder: up-lights and down-lights with a curtain in each, roofs and floors that only hold you
        //    in the colour the last curtain gave you
        col(166, 'D', 1, 5)
        col(167, 'U')
        fill(167, 12, 167, 12, '^')
        pit(167, 200)
        fill(168, 0, 172, 0, 'A')
        col(173, 'D')
        col(174, 'c')
        fill(175, 13, 179, 13, 'C')
        col(180, 'U')
        col(181, 'a')
        fill(182, 0, 186, 0, 'A')
        col(187, 'D')
        col(188, 'c')
        fill(189, 13, 193, 13, 'C')
        col(194, 'U')
        col(195, 'a')
        fill(196, 0, 199, 0, 'A')
        col(200, 'D')
        motes([170, 2], [173, 2], [176, 5], [184, 7], [185, 2], [188, 3], [198, 7], [201, 3], [202, 6])
        lanterns(177, 191, 203)

        // F. the prism stair: climb alternating colour shelves over thorns, each curtain crossed mid-jump, then
        //    a long fall through an amber curtain onto an amber bridge
        fill(206, 12, 226, 12, '^')
        fill(207, 11, 209, 11, 'A')
        col(211, 'c', 5, 10)
        fill(212, 9, 214, 9, 'C')
        col(216, 'a', 3, 8)
        fill(217, 7, 219, 7, 'A')
        col(221, 'c', 2, 6)
        fill(222, 5, 224, 5, 'C')
        col(227, 'a', 1, 12)
        pit(227, 233)
        fill(228, 13, 233, 13, 'A')
        motes([204, 9], [210, 8], [215, 6], [220, 4], [225, 3], [227, 1], [229, 3], [231, 12])
        lanterns([208, 10], [213, 8], [218, 6], [223, 4], 230, 236)

        // G. the low thorn roof: tap-stomp the beetles on their posts across the pits (a held stomp hits the roof)
        fill(239, 8, 262, 8, 'v')
        pit(239, 243)
        fill(241, 13, 241, 14, '#')
        beetle(241, 12)
        pit(247, 251)
        fill(249, 13, 249, 14, '#')
        beetle(249, 12)
        motes([238, 10], [241, 11], [243, 9], [246, 10], [251, 10])
        lanterns(245, 253, 260)

        // H. the plug: under a roof too low to jump, a thorn slot; push the crate in to bridge it
        crate(263, 12)
        fill(266, 1, 276, 11, '#')
        fill(271, 13, 271, 13, '^')
        motes([271, 12])
        lanterns(268, 279)

        // I. night watch: along the roof over beetle shelves; tap over the roof thorns (a full hop drops onto a beetle)
        col(281, 'D')
        col(282, 'U')
        pit(283, 324)
        fill(301, 1, 301, 1, 'v')
        fill(299, 5, 304, 5, '#')
        beetle(301, 4)
        fill(306, 5, 308, 5, '#') // a rest shelf, with a light to climb back up
        fill(306, 1, 308, 3, 'U')
        lanterns([307, 4])
        fill(314, 1, 314, 1, 'v')
        fill(312, 5, 317, 5, '#')
        beetle(314, 4)
        fill(320, 1, 320, 1, 'v')
        col(325, 'D')
        motes([290, 3], [292, 1], [301, 3], [305, 1], [314, 3], [320, 3])
        lanterns(328)

        // J. the flow line: pits at a full roll's stride (a stepping stone, a thorn roof, a trap bridge you cross cyan,
        //    a bridge you cross amber, a step), into a precision finish on a single stone
        pit(332, 334)
        pit(339, 342)
        fill(340, 13, 340, 14, '#')
        fill(345, 9, 349, 9, 'v')
        pit(346, 348)
        col(352, 'c', 9, 12)
        pit(354, 357)
        fill(354, 13, 357, 13, 'A')
        col(362, 'a', 9, 12)
        pit(364, 367)
        fill(364, 13, 367, 13, 'A')
        fill(371, 11, 372, 12, '#')
        pit(373, 375)
        pit(379, 383)
        fill(381, 12, 381, 14, '#')
        motes([332, 9], [340, 9], [347, 10], [354, 9], [361, 12], [370, 9], [381, 9], [387, 12])
        lanterns(337, 343, 350, 360, 369, 377, 386)

        // K. the sunrise meadow: ponds, lanterns along the path, an arc of motes between each pair, the gate
        sign(388, 10, 'The night is over.')
        pond(390, 394)
        pond(398, 401)
        pond(410, 413)
        pond(422, 425)
        pond(434, 437)
        lanterns(390, 395, 400, 405, 410, 415, 420, 425, 430, 435, 440, 445, 450)
        for (let x = 390; x < 450; x += 5) motes([x + 1, 11], [x + 2, 10], [x + 3, 11])
        motes([452, 10])
        sign(446, 10, 'Welcome to the dawn.')
        exit(454, 12)
      },
      'dawngate',
    ),
}
