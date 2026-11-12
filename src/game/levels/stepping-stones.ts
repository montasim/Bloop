import { makeLevel, type LevelDef } from '../level.ts'

// Level 17, chapter 4: several crates where the order matters. A pushed crate stops against another,
// so pushing the near crate first jams the pair: jump over it and push the far one first.
// Soft-locks: every crate room has a thorn slot or pit you can always reach, so a stuck player can
// drop in on purpose (respawning puts every crate back); in the marsh tunnel any jump hits the thorn roof.
// Crates sit 2px low in a filled slot and snag there, so no puzzle asks a crate to slide over a filled slot.
export const steppingStones: LevelDef = {
  id: 'stepping-stones',
  name: 'Stepping Stones',
  build: () =>
    makeLevel(
      312,
      ({ fill, mote, checkpoint, crate, beetle, sign, pond, exit }) => {
        const pit = (x0: number, x1: number) => {
          fill(x0, 13, x1, 14, '.')
          fill(x0, 14, x1, 14, '^')
        }
        const slot = (x: number, y = 13) => fill(x, y, x, y, '^') // 1-wide thorn slot: one crate fills it flush
        const col = (x: number, t: 'a' | 'c') => fill(x, 1, x, 12, t)

        // 0. start
        pond(5, 11)
        mote(7, 12)
        mote(10, 12)
        mote(14, 12)
        sign(8, 8, 'Crates stop against crates: push the far one first')
        checkpoint(9, 12)
        checkpoint(14, 12)

        // 1. the jam: hop over A and push B to the wall. Push A first and it jams against B (drop in the pit to retry).
        pit(17, 19)
        mote(18, 9)
        crate(23, 12)
        crate(27, 12)
        mote(25, 12)
        mote(30, 12)
        fill(35, 9, 44, 12, '#')
        mote(34, 8)
        mote(38, 8)
        mote(43, 8)
        checkpoint(41, 8)

        // T1. down off the plateau: thorn pits under a low thorn roof (hop, never hold), beetle island, beetle run
        fill(46, 1, 71, 8, '#')
        fill(46, 9, 71, 9, 'v') // low thorn roof: only low hops (a held jump or a held stomp hits it)
        pit(51, 53)
        beetle(56, 12)
        pit(58, 60)
        pit(66, 69)
        mote(52, 10)
        mote(57, 11)
        mote(60, 10)
        mote(65, 12)
        mote(67, 10)
        checkpoint(48, 12)
        checkpoint(64, 12)
        checkpoint(72, 12)
        fill(73, 12, 73, 12, 'C') // cyan sill: the beetle turns, the amber ball rolls through
        beetle(77, 12)
        mote(75, 10)
        mote(79, 10)
        checkpoint(81, 12)

        // 2. the stack: drop both crates off the ledge into the slot (the second lands on the first),
        //    then climb the stack. The ledge's lip sits in a crate-high tunnel, so you can never stand on a crate
        //    left on the lip (it would be exactly as high as the stack).
        pit(84, 86)
        fill(87, 12, 96, 12, '#')
        fill(93, 1, 95, 10, '#')
        crate(90, 11)
        crate(94, 11)
        fill(98, 8, 107, 12, '#')
        mote(85, 10)
        mote(92, 10)
        mote(89, 10)
        mote(97, 9)
        mote(102, 7)
        mote(106, 7)
        checkpoint(100, 7)
        checkpoint(104, 7)

        // 3. the marsh: a thorn roof (no jumping) over thorn slots; push each crate into the next slot and roll over
        checkpoint(112, 12)
        fill(116, 1, 140, 10, '#')
        fill(116, 11, 140, 11, 'v')
        crate(118, 12)
        slot(121)
        crate(123, 12)
        slot(126)
        crate(128, 12)
        slot(131)
        crate(133, 12)
        slot(136)
        mote(117, 12)
        mote(122, 12)
        mote(127, 12)
        mote(132, 12)
        mote(137, 12)
        mote(141, 12)
        checkpoint(127, 12)
        checkpoint(143, 12)

        // T2. cyan stepping blocks over a long pit, then an amber curtain, a cyan wall and a beetle run
        col(147, 'c')
        pit(150, 162)
        fill(153, 13, 154, 13, 'C')
        fill(158, 13, 159, 13, 'C')
        checkpoint(149, 12)
        mote(151, 10)
        mote(156, 9)
        mote(161, 10)
        checkpoint(165, 12)
        col(167, 'a')
        fill(169, 1, 169, 12, 'C')
        beetle(173, 12)
        mote(173, 9)
        mote(170, 9)
        fill(177, 12, 177, 12, 'C') // a cyan sill: the amber ball rolls through, the beetle turns
        checkpoint(179, 12)

        // 4. the cyan tower: only a cyan ball can climb it, and only off a crate. Hop the reset slot, hop the
        //    near crate, push the far one to the tower; then jump the pit onto a beetle-guarded plateau
        checkpoint(180, 12)
        col(182, 'c')
        slot(185)
        crate(188, 12)
        crate(192, 12)
        fill(199, 9, 201, 12, 'C')
        pit(202, 204)
        fill(205, 9, 214, 12, '#')
        beetle(211, 8)
        mote(185, 11)
        mote(190, 12)
        mote(195, 12)
        mote(198, 8)
        mote(200, 8)
        mote(204, 7)
        checkpoint(207, 8)
        col(217, 'a')

        // T3. thorn run: pits, hanging thorns and a thorn overhang (hop low, never hold)
        checkpoint(219, 12)
        pit(222, 225)
        checkpoint(227, 12)
        fill(230, 1, 233, 7, '#')
        fill(230, 8, 233, 8, 'v')
        pit(230, 233)
        fill(236, 1, 238, 9, '#')
        fill(236, 10, 238, 10, 'v')
        pit(241, 243)
        checkpoint(246, 12)
        pit(248, 250)
        fill(247, 9, 250, 9, 'v')
        mote(224, 9)
        mote(231, 9)
        mote(237, 12)
        mote(242, 10)
        mote(249, 11)

        // 5. finale: three crates on a high ledge, a 1-wide slot and a 6-tall wall: it takes a 3-crate stack.
        //    Far crate first, then the middle, then the near one; push the near one early and it jams.
        pond(255, 259)
        checkpoint(259, 12)
        pit(261, 263)
        fill(264, 11, 281, 12, '#')
        fill(278, 1, 280, 9, '#')
        crate(268, 10)
        crate(272, 10)
        crate(276, 10)
        fill(283, 7, 310, 12, '#')
        mote(262, 9)
        mote(255, 12)
        mote(266, 9)
        mote(270, 10)
        mote(274, 10)
        mote(282, 7)
        mote(286, 6)
        checkpoint(288, 6)
        checkpoint(291, 6)
        mote(292, 6)
        checkpoint(295, 6)
        mote(298, 6)
        checkpoint(300, 6)
        mote(304, 6)
        checkpoint(305, 6)
        exit(310, 6)
      },
      'marsh',
    ),
}
