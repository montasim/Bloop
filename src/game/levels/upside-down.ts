import { makeLevel, type LevelDef } from '../level.ts'

// Level 11, chapter 3 opener: gravity fields. 'U' light flips you onto the roof, 'D' light drops you back.
// Every inverted stretch is boxed by full-height 'D' columns on both sides (rolling back left included),
// so you can never leave it upside-down. Lanterns only sit on upright floor, before the next up-light.
export const upsideDown: LevelDef = {
  id: 'upside-down',
  name: 'Upside Down',
  build: () =>
    makeLevel(244, ({ fill, mote, checkpoint, sign, beetle, exit, pond }) => {
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }
      const island = (x0: number, x1: number) => fill(x0, 13, x1, 14, '#')
      const roof = (x0: number, x1: number) => fill(x0, 0, x1, 2, '#') // the "floor" while inverted (row 3)
      const down = (x: number, y0 = 3, y1 = 12) => fill(x, y0, x, y1, 'D')
      const up = (x: number, y0 = 3, y1 = 12) => fill(x, y0, x, y1, 'U')
      const spike = (x0: number, x1 = x0) => fill(x0, 3, x1, 3, 'v') // thorns on the roof road
      const curtain = (x: number, c: 'a' | 'c', y0 = 3, y1 = 12) => fill(x, y0, x, y1, c)

      // A. safe intro: an up-pad, roll the roof, drop back down
      pond(5, 9)
      mote(7, 12)
      checkpoint(11, 12)
      sign(9, 7, 'Step into the light: fall up')
      roof(14, 35)
      down(14)
      up(16, 12)
      mote(19, 9)
      mote(21, 4)
      mote(30, 3)
      checkpoint(25, 12)
      down(35)

      // B. roof road over a thorn pit: hop "down" over a hanging down-light (trap) and roof thorns; a beetle walks a ledge below,
      //    so a big hop lands on it (upside-down, any touch kills): tap
      checkpoint(38, 12)
      checkpoint(44, 12)
      roof(48, 80)
      down(48)
      up(50, 12)
      pit(52, 78)
      island(54, 56)
      checkpoint(54, 12)
      up(56, 12)
      fill(66, 3, 66, 3, 'D') // a trap: touch it and you drop into the pit
      spike(71)
      fill(73, 7, 78, 7, '#')
      beetle(75, 6)
      spike(75, 76)
      down(80)
      mote(63, 3)
      mote(71, 5)
      mote(75, 4)
      mote(78, 3)

      // C. jump into the light over a pit (flip mid-air onto the roof); then down, and straight back up
      checkpoint(79, 12) // 16th lantern (integrator): safe upright floor in the longest stretch
      checkpoint(84, 12)
      checkpoint(88, 12)
      sign(85, 8, 'Jump into the light')
      roof(90, 127)
      down(90)
      up(91, 3, 10)
      up(92, 3, 10)
      up(93, 3, 10)
      pit(91, 102)
      spike(99, 100)
      down(103)
      checkpoint(105, 12)
      up(108)
      mote(89, 9)
      mote(96, 3)
      mote(99, 5)
      mote(106, 7)

      // D. colours upside-down: turn cyan, pass an amber wall, ride a cyan road under hanging thorns,
      //    hop a low amber trap curtain (touching it turns the road into a ghost), turn amber again
      pit(109, 125)
      curtain(109, 'c')
      fill(116, 3, 116, 6, 'A')
      fill(119, 1, 125, 1, 'v')
      fill(119, 2, 125, 2, 'C')
      curtain(122, 'a', 3, 3)
      fill(119, 7, 124, 7, '#')
      beetle(121, 6)
      curtain(126, 'a')
      down(127)
      mote(113, 3)
      mote(118, 3)
      mote(122, 5)
      mote(125, 3)

      // E. springboard over a wall into a high up-light, then a long roof with beetles below
      checkpoint(134, 12)
      pond(132, 137)
      checkpoint(138, 12)
      fill(141, 12, 141, 12, '#')
      beetle(144, 12)
      fill(147, 12, 147, 12, '#')
      fill(149, 9, 150, 12, '#')
      checkpoint(149, 8)
      roof(150, 173)
      down(150, 3, 8)
      up(151, 3, 10)
      up(152, 3, 10)
      pit(151, 170)
      spike(159)
      fill(163, 7, 168, 7, '#')
      beetle(165, 6)
      spike(165)
      fill(170, 2, 171, 2, 'v') // a ceiling pit
      down(173)
      mote(142, 9)
      mote(148, 7)
      mote(155, 3)
      mote(159, 5)
      mote(165, 4)
      mote(170, 5)

      // F. up, down, up: flip up, drop at once onto an island, straight back up over beetles
      checkpoint(178, 12)
      roof(182, 210)
      down(182)
      up(183)
      pit(184, 188)
      down(190)
      checkpoint(192, 12)
      up(195)
      pit(195, 208)
      fill(201, 7, 206, 7, '#')
      beetle(203, 6)
      spike(204)
      down(210)
      mote(188, 4)
      mote(191, 6)
      mote(199, 3)
      mote(204, 4)
      mote(208, 3)

      // G. finale: hop a penned beetle (or stomp it) and jump into the light over a long pit,
      //    turn cyan for a cyan road under hanging thorns, hop its thorns, turn amber, drop to the gate
      checkpoint(214, 12)
      fill(216, 12, 216, 12, '#')
      beetle(218, 12)
      roof(221, 240)
      down(221)
      up(222, 3, 10)
      up(223, 3, 10)
      up(224, 3, 10)
      pit(222, 238)
      island(224, 226)
      checkpoint(224, 12)
      up(226, 12)
      curtain(227, 'c')
      fill(229, 1, 234, 1, 'v')
      fill(229, 2, 234, 2, 'C')
      spike(234, 235)
      fill(232, 7, 237, 7, '#')
      beetle(234, 6)
      curtain(236, 'a')
      down(240)
      mote(220, 9)
      mote(223, 9)
      mote(234, 4)
      mote(238, 3)
      mote(241, 4)
      exit(242, 12)
    }, 'rift'),
}
