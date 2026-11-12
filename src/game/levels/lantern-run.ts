import { makeLevel, type LevelDef } from '../level.ts'

// Level 10, chapter 2 test: one long colour gauntlet. Gapped bridges with mid-air swaps, a trap
// bridge under a thorn roof, a colour roof and tower, narrow colour stairs (with an early-swap trap),
// a low beetle corridor over ghost bridges, a springboard through a curtain onto a beetle ledge, and
// a beetle bridge that changes colour under the gate.
export const lanternRun: LevelDef = {
  id: 'lantern-run',
  name: 'Lantern Run',
  build: () =>
    makeLevel(226, ({ fill, mote, checkpoint, beetle, pond }) => {
      pond(4, 8)
      pond(106, 110)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const curtain = (x: number, c: 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, c)
      const bridge = (x0: number, x1: number, c: 'A' | 'C', y = 13) => fill(x0, y, x1, y, c)

      // A. gapped bridge that changes colour twice: curtains hang in the 4-wide gaps under a thorn roof
      curtain(10, 'c')
      pit(12, 33)
      bridge(12, 15, 'C')
      fill(15, 1, 30, 8, '#') // thorn roof: hop the gaps, don't bounce
      fill(15, 9, 30, 9, 'v')
      curtain(18, 'a', 10, 10)
      bridge(20, 24, 'A')
      checkpoint(22, 12)
      curtain(27, 'c', 10, 10)
      bridge(29, 33, 'C')
      checkpoint(31, 12)
      mote(14, 12)
      mote(18, 10)
      mote(27, 10)
      mote(33, 12)

      // B. trap bridge under a thorn roof: low cyan curtains over an amber floor. Hop each one,
      //    but not high: held bounces land on a curtain or hit the roof.
      curtain(36, 'a')
      checkpoint(38, 12)
      pit(40, 56)
      bridge(40, 56, 'A')
      fill(41, 1, 56, 9, '#')
      fill(41, 10, 56, 10, 'v')
      curtain(43, 'c', 12, 12)
      curtain(49, 'c', 12, 12)
      curtain(55, 'c', 12, 12)
      mote(43, 11)
      mote(46, 12)
      mote(49, 11)
      mote(52, 12)
      mote(55, 11)

      // C. colour roof: an amber roof over a beetle pen stops the climb onto the tower until you
      //    turn cyan; turn amber again in mid-air for the amber tread, then the mesa
      curtain(58, 'a')
      checkpoint(60, 12)
      curtain(64, 'c', 1, 10)
      fill(65, 12, 65, 12, '#')
      fill(66, 1, 73, 9, 'A')
      beetle(69, 12)
      fill(74, 10, 76, 12, '#')
      checkpoint(75, 9)
      pit(77, 82)
      fill(78, 1, 104, 3, '#') // thorn ceiling over the tread, mesa and stair: no held bounces
      fill(78, 4, 104, 4, 'v')
      curtain(77, 'a', 4, 7)
      fill(79, 8, 81, 8, 'A')
      fill(84, 6, 88, 12, '#')
      checkpoint(87, 5)
      mote(68, 10)
      mote(74, 9)
      mote(80, 6)
      mote(86, 5)

      // D. narrow colour stair down; a hanging cyan curtain over the amber tread swaps you early
      //    if you come in high
      pit(89, 104)
      curtain(90, 'c', 5, 7)
      fill(91, 8, 92, 8, 'C')
      curtain(95, 'a', 5, 9)
      fill(97, 10, 98, 10, 'A')
      curtain(98, 'c', 5, 8) // trap
      checkpoint(97, 9)
      curtain(100, 'c', 5, 11)
      fill(102, 12, 103, 12, 'C')
      mote(91, 7)
      mote(93, 5)
      mote(102, 11)
      checkpoint(108, 12)

      // E. low corridor over thorns: beetles patrol a cyan bridge in amber pens (ghosts to you);
      //    a low amber trap curtain between the pens drops you through the bridge if you touch it
      fill(112, 1, 145, 9, '#')
      curtain(114, 'c', 10, 12)
      pit(117, 134)
      bridge(117, 134, 'C')
      fill(116, 12, 116, 12, 'A')
      beetle(119, 12)
      fill(123, 12, 123, 12, 'A')
      curtain(124, 'a', 12, 12)
      fill(125, 12, 125, 12, 'A')
      fill(129, 12, 129, 12, 'A')
      checkpoint(127, 12)
      beetle(132, 12)
      fill(135, 12, 135, 12, 'A')
      mote(120, 10)
      mote(124, 10)
      mote(132, 11)
      checkpoint(137, 12)
      curtain(138, 'a', 10, 12)
      fill(139, 12, 139, 12, 'C')
      pit(140, 144)
      bridge(140, 144, 'A')
      beetle(142, 12)
      fill(145, 12, 145, 12, 'C')
      mote(142, 11)
      checkpoint(148, 12)

      // F. springboard through a curtain onto a cyan ledge; stomp its beetle up through an amber
      //    band onto the amber ledge above
      fill(150, 12, 150, 12, 'C')
      beetle(153, 12)
      fill(156, 12, 156, 12, 'C')
      fill(158, 9, 158, 12, '#')
      curtain(158, 'c', 2, 8)
      pit(159, 199)
      fill(159, 9, 170, 9, 'C')
      fill(162, 8, 162, 8, 'A') // keeps the ledge beetle off your landing spot
      beetle(168, 8)
      checkpoint(160, 8)
      fill(162, 3, 170, 4, 'a')
      fill(163, 6, 180, 6, 'A')
      checkpoint(174, 5)
      mote(157, 8)
      mote(168, 4)
      mote(172, 5)
      mote(177, 5)

      // G. narrow colour stair back down under a thorn ceiling (roll off, hop, don't bounce),
      //    with an early-swap trap over the amber tread
      fill(176, 1, 199, 3, '#')
      fill(176, 4, 199, 4, 'v')
      curtain(182, 'c', 5, 7)
      fill(183, 8, 184, 8, 'C')
      curtain(187, 'a', 5, 9)
      fill(189, 10, 190, 10, 'A')
      curtain(190, 'c', 5, 8) // trap
      checkpoint(189, 9)
      curtain(192, 'c', 5, 11)
      fill(194, 12, 195, 12, 'C')
      mote(183, 7)
      mote(186, 5)
      mote(194, 11)
      mote(198, 9)

      // H. last bridge under a thorn roof: cyan, then amber, with a beetle on it. Hop it low.
      pond(201, 205)
      checkpoint(203, 12)
      fill(208, 1, 221, 8, '#')
      fill(208, 9, 221, 9, 'v')
      fill(208, 12, 208, 12, 'A')
      pit(209, 220)
      bridge(209, 214, 'C')
      curtain(215, 'a', 10, 12)
      bridge(215, 220, 'A')
      beetle(214, 12)
      fill(221, 12, 221, 12, 'C')
      mote(204, 12)
      mote(214, 11)
      mote(222, 12)
    }, 'autumn'),
}
