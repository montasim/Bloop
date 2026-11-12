import { makeLevel, type LevelDef } from '../level.ts'

// Level 16, chapter 4 opener: pushable crates. Crates are blocked by every block, coloured ones included,
// so cyan 'C' columns fence each crate puzzle: an amber wisp rolls straight through them, which also means
// a crate pushed against a fence can always be pushed back out.
export const heavyStone: LevelDef = {
  id: 'heavy-stone',
  name: 'Heavy Stone',
  build: () =>
    makeLevel(296, ({ fill, mote, checkpoint, crate, beetle, sign, pond, exit }) => {
      const motes = (...ps: [number, number][]) => ps.forEach(([x, y]) => mote(x, y))
      const fence = (x0: number, x1 = x0, y1 = 12) => fill(x0, 1, x1, y1, 'C')
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. intro: push the crate against the wall and climb it
      fence(1, 2)
      pond(4, 9)
      sign(8, 8, 'Roll into a crate to push it')
      mote(6, 12)
      checkpoint(9, 12)
      crate(12, 12)
      mote(15, 12)
      checkpoint(16, 12)
      fill(19, 9, 23, 12, '#')
      mote(20, 8)
      mote(18, 9)
      mote(24, 8)

      // B. the shaft deck: drop both crates down the shaft to bridge the thorn slot in the tunnel below
      motes([29, 10], [34, 7], [43, 6], [47, 5], [50, 7])
      checkpoint(26, 12)
      fill(28, 11, 30, 11, '#')
      fill(32, 9, 53, 11, '#')
      fence(32, 33, 8)
      fence(52, 53, 8)
      fill(54, 1, 54, 11, '#')
      for (const x of [41, 45]) {
        fill(x, 9, x, 11, '.') // a shaft through the deck...
        fill(x, 13, x, 13, '^') // ...over a thorn notch in the tunnel floor
      }
      crate(37, 8)
      crate(49, 8)
      checkpoint(36, 8)
      checkpoint(43, 8)
      mote(37, 12)
      mote(48, 12)

      // C. the overhang: push the crate to the cliff edge, but not over it
      motes([71, 9], [74, 5], [78, 7])
      checkpoint(57, 12)
      fence(59, 60)
      crate(64, 12)
      checkpoint(66, 12)
      mote(68, 12)
      pit(72, 73)
      fill(72, 9, 73, 9, '#')
      fill(74, 9, 80, 12, '#')
      checkpoint(77, 8)

      // D. two crates, one notch: fill the notch first, then stack the second crate on it
      motes([84, 10], [87, 9], [93, 12], [98, 9], [100, 7])
      fence(81, 82)
      crate(86, 12)
      crate(91, 12)
      fill(98, 13, 98, 13, '^')
      fill(99, 9, 103, 12, '#')
      checkpoint(88, 12)
      checkpoint(94, 12)
      sign(85, 8, 'Crates stop against each other')
      checkpoint(101, 8)

      // E. the beetle island: drop the crate onto the island, land on it, out of the beetle's reach
      motes([109, 9], [116, 8], [119, 8], [122, 11])
      fill(104, 10, 115, 12, '#')
      fence(104, 105, 9)
      crate(111, 9)
      checkpoint(107, 9)
      pit(116, 116)
      beetle(118, 12)
      pit(120, 121)
      fill(117, 7, 121, 7, 'v') // no long leap from the shelf over the island

      // F. springboard over the wall, then push the crate into the notch of the low tunnel
      motes([131, 9], [135, 8], [148, 8], [155, 8])
      checkpoint(124, 12)
      pond(125, 128)
      fill(130, 12, 130, 12, '#')
      beetle(133, 12)
      fill(136, 12, 136, 12, '#')
      fill(138, 9, 160, 12, '#')
      fence(138, 139, 8)
      crate(143, 8)
      checkpoint(141, 8)
      checkpoint(156, 8)
      fill(146, 1, 158, 7, '#')
      fill(152, 9, 152, 9, '^')

      // G. colour run: two pits, a beetle at a cyan curtain, through the amber wall onto a cyan bridge
      motes([168, 9], [176, 9], [182, 9], [191, 12], [196, 10], [201, 9])
      //    under hanging thorns with a beetle on it (hop it low), then amber again through a cyan wall
      checkpoint(164, 12)
      pit(167, 171)
      checkpoint(173, 12)
      pit(176, 178)
      beetle(181, 12)
      fill(184, 1, 184, 12, 'c')
      fill(186, 1, 186, 12, 'A')
      checkpoint(187, 12)
      pit(188, 195)
      fill(189, 13, 195, 13, 'C') // a thorn gap before the bridge keeps its beetle off the landing
      fill(188, 9, 195, 9, 'v')
      beetle(191, 12)
      fill(197, 1, 197, 12, 'a')
      fill(199, 1, 199, 12, 'C')
      pit(200, 202)
      checkpoint(204, 12)

      // H. the drop bridge: a pit too wide to leap; drop the crate down the shaft into its middle
      motes([207, 8], [211, 5], [216, 5], [212, 10], [220, 13], [222, 10])
      fill(206, 10, 208, 12, '#')
      fill(210, 8, 211, 12, '#')
      fill(213, 6, 223, 7, '#')
      fence(213, 214, 5)
      fill(224, 1, 224, 7, '#')
      crate(217, 5)
      fill(220, 6, 220, 7, '.')
      pit(216, 224)
      checkpoint(214, 12)
      checkpoint(227, 12)

      // I. finale: a beetle run under thorns, then two crates and a thorn gap below the gate's wall
      motes([232, 9], [237, 9], [245, 9], [255, 12], [261, 9], [266, 10], [276, 8], [282, 11], [285, 6], [291, 7])
      pit(231, 235)
      beetle(239, 12)
      pit(243, 247)
      checkpoint(249, 12)
      fill(251, 9, 254, 9, 'v')
      beetle(255, 12)
      pit(259, 263)
      checkpoint(267, 12)
      fill(272, 12, 282, 12, '#')
      fence(272, 273, 11)
      crate(276, 11)
      crate(280, 11)
      fill(283, 12, 283, 12, '^')
      fill(284, 8, 294, 12, '#')
      checkpoint(277, 11)
      checkpoint(289, 7)
      exit(294, 7)
    }, 'quarry'),
}
