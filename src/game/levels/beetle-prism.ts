import { makeLevel, type LevelDef } from '../level.ts'

// Level 9: beetles + colours. Beetles treat every coloured block as solid, so they walk bridges
// that are ghosts to you and stay penned by walls you pass through. Springboards and stomp-bounces
// carry you through curtains mid-air, onto ledges that only exist in your new colour.
export const beetlePrism: LevelDef = {
  id: 'beetle-prism',
  name: 'Beetle Prism',
  build: () =>
    makeLevel(214, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      pond(4, 7)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const curtain = (x: number, c: 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, c)

      // A. a beetle on a cyan bridge: solid to it, a ghost to you (amber). Jump or stomp.
      sign(5, 7, 'Beetles walk on every colour')
      fill(9, 12, 9, 12, 'C')
      pit(10, 14)
      fill(10, 13, 14, 13, 'C')
      beetle(12, 12)
      fill(15, 12, 15, 12, 'C')
      mote(6, 12) // along the pond
      mote(12, 9)
      checkpoint(19, 12)

      // B. springboard in a cyan pen: you walk through the bumps, the beetle can't
      fill(24, 12, 24, 12, 'C')
      beetle(27, 12)
      fill(30, 12, 30, 12, 'C')
      fill(32, 9, 33, 12, '#')
      mote(31, 8) // top of the spring arc
      pond(36, 40)
      mote(40, 12)
      checkpoint(38, 12)

      // C. springboard through a curtain: the launch turns you cyan above the wall, onto a cyan ledge
      fill(43, 12, 43, 12, '#')
      beetle(46, 12)
      fill(49, 12, 49, 12, '#')
      fill(51, 9, 51, 12, '#')
      curtain(51, 'c', 2, 8)
      pit(52, 60)
      fill(52, 9, 59, 9, 'C')
      mote(50, 8)
      mote(55, 8)
      mote(58, 8)
      checkpoint(56, 8)
      checkpoint(64, 12)

      // D. stomp up through an amber ledge (a ghost while cyan), turn amber above it, land on it
      sign(64, 5, 'Rise through it, turn, land on it')
      curtain(65, 'c', 10, 12) // turns you back if you drop off the ledge before it
      fill(67, 12, 67, 12, 'A')
      beetle(70, 12)
      fill(73, 12, 73, 12, 'A')
      fill(68, 9, 81, 9, 'A')
      fill(68, 6, 78, 8, 'a')
      pit(75, 83)
      mote(74, 8) // in the curtain, on the stomp arc
      mote(80, 8)
      checkpoint(78, 8)
      mote(84, 10) // rolling off the ledge
      checkpoint(88, 12)

      // E. low corridor over thorns: beetles patrol a cyan bridge in amber pens (ghosts to you).
      //    Hop each beetle under the roof; between the pens a low amber trap curtain would turn
      //    you amber and drop you through the bridge, so hop that too.
      fill(92, 1, 125, 9, '#')
      curtain(94, 'c', 10, 12)
      pit(97, 114)
      fill(97, 13, 114, 13, 'C')
      fill(96, 12, 96, 12, 'A')
      beetle(99, 12)
      fill(103, 12, 103, 12, 'A')
      curtain(104, 'a', 12, 12)
      fill(105, 12, 105, 12, 'A')
      fill(109, 12, 109, 12, 'A') // 106-108: a beetle-free landing past the trap
      beetle(112, 12)
      fill(115, 12, 115, 12, 'A')
      mote(100, 10)
      mote(104, 10) // over the trap curtain: the only safe line
      mote(112, 11)
      checkpoint(117, 12)
      // then amber: a beetle on an amber bridge, penned by cyan bumps
      curtain(118, 'a', 10, 12)
      fill(119, 12, 119, 12, 'C')
      pit(120, 124)
      fill(120, 13, 124, 13, 'A')
      beetle(122, 12)
      fill(125, 12, 125, 12, 'C')
      mote(122, 11)
      checkpoint(128, 12)

      // F. pillars over thorns. Between the first two, a beetle walks an amber bridge that is a
      //    ghost to you (cyan): too far to jump, so wait on the pillar and stomp it mid-air.
      //    Between the next two the bridge is cyan (solid) and its beetle is in the way.
      curtain(130, 'c')
      pit(133, 155)
      fill(133, 10, 135, 14, '#')
      fill(136, 11, 142, 11, 'A')
      beetle(139, 10)
      fill(143, 10, 145, 14, '#')
      checkpoint(144, 9)
      fill(146, 11, 150, 11, 'C')
      beetle(148, 10)
      fill(151, 10, 153, 14, '#')
      mote(134, 9)
      mote(136, 6) // top of the leap off the pillar
      mote(148, 8)
      mote(152, 9)
      mote(155, 10) // on the leap down
      curtain(160, 'a')

      // G. finale: springboard in a cyan pen, through a curtain onto a cyan ledge with a beetle;
      //    stomp it up through an amber band onto the amber ledge to the gate
      mote(160, 12)
      checkpoint(162, 12)
      fill(166, 12, 166, 12, 'C')
      beetle(169, 12)
      fill(172, 12, 172, 12, 'C')
      fill(174, 9, 174, 12, '#')
      curtain(174, 'c', 2, 8)
      pit(175, 198)
      fill(175, 9, 186, 9, 'C')
      fill(178, 8, 178, 8, 'A') // keeps the ledge beetle off your landing spot
      beetle(184, 8)
      checkpoint(176, 8)
      fill(178, 3, 186, 4, 'a')
      fill(179, 6, 196, 6, 'A')
      checkpoint(190, 5)
      fill(199, 6, 212, 12, '#')
      mote(173, 8)
      mote(184, 4) // stomp line through the amber band
      mote(186, 5)
      mote(193, 5)
      mote(197, 4)
      mote(205, 5)
      mote(209, 5)
      exit(212, 5)
    }, 'bloom'),
}
