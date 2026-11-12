import { makeLevel, type LevelDef } from '../level.ts'

// Level 7, chapter 2: coloured bridges over long thorn pits. Bridges change colour where a curtain
// crosses them, gaps between segments hide curtains you must catch mid-air (some hang high, some
// sit under a thorn roof), bridges climb and drop, beetles patrol them (both colours are solid to
// beetles), low trap curtains would make the floor vanish, and a long gauntlet leads to the gate.
export const prismBridges: LevelDef = {
  id: 'prism-bridges',
  name: 'Prism Bridges',
  build: () =>
    makeLevel(195, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      pond(61, 66)
      pond(130, 134)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const curtain = (x: number, c: 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, c)
      const bridge = (x0: number, x1: number, c: 'A' | 'C', y = 13) => fill(x0, y, x1, y, c)

      // A. warm-up: a cyan bridge, then one that turns amber halfway
      curtain(8, 'c')
      pit(11, 15)
      bridge(11, 15, 'C')
      mote(13, 12)
      checkpoint(17, 12)
      pit(20, 28)
      bridge(20, 23, 'C')
      curtain(24, 'a')
      bridge(24, 28, 'A')
      mote(22, 12)
      mote(26, 12)
      checkpoint(31, 12)

      // B. gapped bridge: curtains hang in the gaps, so you change colour mid-air.
      //    The second one hangs high: a short hop passes under it and the amber bridge stays a ghost.
      pit(35, 57)
      bridge(35, 38, 'A')
      curtain(40, 'c')
      bridge(42, 45, 'C')
      checkpoint(44, 12)
      sign(44, 5, 'High curtains: jump through them')
      curtain(47, 'a', 1, 10)
      curtain(48, 'a', 1, 10)
      bridge(50, 57, 'A')
      mote(37, 12)
      mote(40, 9)
      mote(48, 9)
      mote(54, 11)
      checkpoint(60, 12)

      // C. a two-colour bridge with a beetle (ghost bumps pen it in), then a trap bridge:
      //    low cyan curtains over an amber floor. Hop each one.
      fill(67, 12, 67, 12, 'C') // ghost to you (amber), a wall to the beetle
      pit(68, 82)
      curtain(68, 'c')
      bridge(68, 74, 'C')
      curtain(75, 'a')
      bridge(75, 82, 'A')
      fill(83, 12, 83, 12, 'C')
      beetle(78, 12)
      mote(64, 12)
      mote(71, 9)
      mote(78, 9)
      checkpoint(84, 12)
      // three trap curtains 4 apart: an auto-bounce lands on one, so it's hop, hop, hop
      pit(86, 101)
      bridge(86, 101, 'A')
      curtain(89, 'c', 11, 12)
      curtain(93, 'c', 11, 12)
      curtain(97, 'c', 11, 12)
      mote(89, 10)
      mote(91, 12)
      mote(93, 10)
      mote(95, 11)
      mote(97, 10)
      checkpoint(103, 12)

      // D. bridges at different heights: up, up (a beetle on top), down, down
      pit(104, 128)
      curtain(104, 'c')
      bridge(104, 107, 'C')
      curtain(109, 'a')
      bridge(110, 112, 'A', 11)
      curtain(114, 'c')
      bridge(115, 118, 'C', 9)
      beetle(117, 8)
      curtain(120, 'a')
      bridge(121, 123, 'A', 11)
      curtain(125, 'c')
      bridge(126, 128, 'C')
      mote(108, 10)
      mote(113, 8)
      mote(119, 6)
      mote(124, 10)
      checkpoint(132, 12)

      // E. thorn roof over a gapped bridge: low hops only, curtains fill the gaps
      pit(136, 155)
      fill(138, 1, 153, 8, '#')
      fill(138, 9, 153, 9, 'v')
      bridge(136, 141, 'C')
      curtain(143, 'a', 10, 12)
      bridge(144, 148, 'A')
      checkpoint(146, 12)
      curtain(150, 'c', 10, 12)
      bridge(151, 155, 'C')
      mote(142, 11)
      mote(149, 11)
      mote(153, 12)
      checkpoint(158, 12)

      // F. final gauntlet: a beetle bridge under a thorn roof (don't hold jump on the stomp), a high
      //    curtain up to a raised bridge, then climb to the gate on a ledge
      pit(160, 186)
      curtain(159, 'a')
      bridge(160, 163, 'A')
      curtain(165, 'c')
      fill(166, 1, 173, 8, '#')
      fill(166, 9, 173, 9, 'v')
      bridge(167, 172, 'C')
      beetle(170, 12)
      curtain(174, 'a')
      bridge(175, 177, 'A')
      checkpoint(176, 12)
      curtain(179, 'c', 1, 10)
      bridge(180, 181, 'C', 11)
      curtain(183, 'a')
      bridge(184, 185, 'A', 9)
      fill(187, 9, 193, 12, '#')
      mote(165, 10)
      mote(170, 10)
      mote(179, 9)
      mote(184, 7)
      mote(190, 8)
      exit(193, 8)
    }, 'lagoon'),
}
