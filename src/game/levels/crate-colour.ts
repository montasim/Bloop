import { makeLevel, type LevelDef } from '../level.ts'

// Level 19: crates ignore colour. Amber and cyan blocks always stop (and hold) crates, so a colour wall
// you roll through still stops the crate, and a colour floor that's a ghost for you still carries it.
// Soft-locks: every crate is penned between colour walls you can stand inside (so you can always get
// behind it), or has a thorn pit next to it for a deliberate reset (respawning sends crates home).
export const crateColour: LevelDef = {
  id: 'crate-colour',
  name: 'Crate & Colour',
  build: () =>
    makeLevel(320, ({ fill, mote, checkpoint, crate, beetle, sign, pond, exit }) => {
      const col = (x: number, t: 'A' | 'C' | 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, t)
      const pit = (x0: number, x1: number, bridge?: 'A' | 'C') => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
        if (bridge) fill(x0, 13, x1, 13, bridge)
      }

      // 1. intro: a crate penned between two cyan walls. Amber, you roll through them; the crate can't.
      //    Push it to the far wall and climb it through the wall onto the ledge.
      pond(4, 8)
      mote(6, 12)
      checkpoint(9, 12)
      sign(9, 7, 'Crates ignore colour')
      col(11, 'C')
      crate(13, 12)
      mote(16, 12)
      col(19, 'C')
      mote(19, 8)
      fill(20, 9, 26, 12, '#')
      checkpoint(23, 8)
      mote(28, 9)

      // 2. cyan bridge over thorns: cyan, push the crate across to the cyan wall; hop up into the
      //    hanging amber curtain and roll off the crate through the wall. (Pen: amber wall to cyan wall.)
      checkpoint(29, 12)
      col(31, 'c')
      col(33, 'A')
      crate(35, 12)
      pit(37, 44, 'C')
      col(44, 'a', 7, 8)
      col(45, 'C')
      mote(40, 12)
      mote(44, 8)
      checkpoint(48, 12)

      // 3. tunnel pen: amber, through the cyan shelf; the curtain turns you cyan. The crate sits against
      //    an amber wall: as cyan you can get in behind it and push it back to the well, then climb out.
      fill(52, 9, 53, 12, 'C')
      col(55, 'c')
      fill(56, 9, 68, 9, '#')
      crate(63, 12)
      col(64, 'A', 10, 12)
      fill(65, 10, 68, 12, '#')
      mote(63, 11)
      mote(64, 11)
      mote(55, 8)
      checkpoint(60, 8)
      checkpoint(66, 8)
      mote(73, 10)

      // 4. gapped colour bridges: cyan, then a mid-air amber curtain onto amber; hanging thorns punish held hops
      checkpoint(72, 12)
      pit(75, 97)
      fill(75, 13, 77, 13, 'C')
      fill(81, 13, 83, 13, 'C')
      col(85, 'a')
      fill(87, 13, 89, 13, 'A')
      fill(93, 13, 95, 13, 'A')
      fill(76, 9, 97, 9, 'v')
      mote(79, 10)
      mote(85, 10)
      mote(91, 10)
      mote(96, 10)

      // 5. stacking: cyan, push the floor crate under the cyan slab to the amber ledge, then push the slab
      //    crate off onto it; back at the slab's start, hop into the amber curtain (dropping through the slab)
      //    and climb the stack. The slab is high enough that amber can't reach a crate left on it from the floor.
      //    The thorn pit behind is the reset if a crate ends up in the wrong place.
      checkpoint(101, 12)
      pit(103, 105)
      mote(104, 9)
      mote(109, 9)
      col(107, 'c')
      crate(109, 12)
      fill(110, 10, 117, 10, 'C')
      crate(112, 9)
      fill(110, 5, 111, 6, 'a')
      fill(119, 8, 124, 12, 'A')
      fill(125, 8, 128, 12, '#')
      mote(114, 12)
      mote(110, 6)
      mote(121, 7)
      checkpoint(126, 7)
      checkpoint(122, 7)
      mote(130, 8)

      // 6. crate-penned springboard: amber, stand in the cyan stub to push the crate into the beetle's lane
      //    (it turns at the crate) until the pen is springboard-sized, then spring over the wall. Push while it
      //    walks towards you: a crate overtakes a retreating beetle and pops it out against you.
      checkpoint(132, 12)
      pit(135, 137)
      mote(135, 9)
      mote(147, 9)
      fill(139, 12, 139, 12, 'C')
      crate(140, 12)
      beetle(150, 12)
      fill(153, 12, 153, 12, '#')
      fill(155, 9, 156, 12, '#')
      mote(144, 12)
      mote(153, 7)
      checkpoint(160, 12)

      // 7. amber bridge: push the crate across to the cyan block, then hop onto it through the cyan curtain
      //    (it's a trap if you walk into it) and climb the block
      checkpoint(162, 12)
      col(165, 'C')
      crate(167, 12)
      pit(169, 176, 'A')
      col(176, 'c')
      fill(177, 9, 179, 12, 'C')
      fill(180, 9, 185, 12, '#')
      mote(172, 12)
      mote(176, 10)
      mote(177, 8)
      checkpoint(182, 8)
      mote(187, 9)
      checkpoint(195, 12)

      // 8. a pond, a beetle pen to hop, and an amber bridge under a cyan trap curtain (roll, don't hop)
      checkpoint(190, 12)
      pond(188, 194)
      mote(192, 12)
      pit(197, 199)
      mote(198, 10)
      fill(200, 12, 200, 12, '#')
      beetle(204, 12)
      fill(207, 12, 207, 12, '#')
      mote(205, 10)
      col(208, 'a')
      pit(209, 213, 'A')
      col(211, 'c', 10, 11)
      fill(196, 9, 199, 9, 'v')
      fill(200, 8, 207, 8, 'v')
      fill(208, 9, 214, 9, 'v')
      mote(211, 12)
      checkpoint(216, 12)
      mote(215, 10)

      // 9. beetle on a cyan bridge: amber, hop onto the crate it holds, then stomp the beetle (it turns at the
      //    crate) and spring onto the amber ledge
      pit(222, 232, 'C')
      crate(223, 12)
      mote(225, 8)
      mote(231, 7)
      beetle(229, 12)
      fill(233, 9, 236, 12, 'A')
      fill(237, 9, 239, 12, '#')
      mote(222, 10)
      mote(234, 8)
      checkpoint(238, 8)

      // 10. finale: two crates, a long cyan bridge, an amber ledge. Cyan, push one crate to the ledge and the
      //     other under the hanging amber curtain; climb it, swap, hop to the first crate and up.
      checkpoint(243, 12)
      mote(241, 9)
      mote(248, 9)
      col(245, 'c')
      fill(244, 10, 244, 10, 'v') // the reset spike: jump into it if the two crates jam
      col(247, 'A')
      crate(248, 12)
      crate(251, 12)
      pit(253, 262, 'C')
      fill(258, 7, 259, 8, 'a')
      fill(263, 9, 266, 12, 'A')
      fill(267, 9, 270, 12, '#')
      mote(255, 12)
      mote(259, 8)
      mote(261, 10)
      mote(263, 8)
      checkpoint(268, 8)

      // 11. last run: gapped bridges with two mid-air swaps under hanging thorns, then the gate
      checkpoint(274, 12)
      mote(272, 9)
      mote(290, 10)
      pit(277, 296)
      fill(277, 13, 280, 13, 'A')
      col(284, 'c')
      fill(285, 13, 289, 13, 'C')
      col(292, 'a')
      fill(293, 13, 296, 13, 'A')
      fill(281, 9, 284, 9, 'v')
      fill(290, 9, 292, 9, 'v')
      mote(282, 11)
      mote(287, 12)
      mote(291, 11)
      checkpoint(298, 12)
      pond(300, 306)
      mote(303, 12)
      checkpoint(308, 12)
      checkpoint(301, 12)
      checkpoint(313, 12)
      mote(310, 9)
      mote(316, 9)
      mote(314, 12)
      exit(318, 12)
      // integrator top-up so this level stays ahead of level 17: motes on the proven route's line, lanterns on safe floor
      mote(67, 8)
      mote(160, 12)
      mote(251, 12)
      checkpoint(98, 12)
      checkpoint(146, 12)
    }, 'ruins'),
}
