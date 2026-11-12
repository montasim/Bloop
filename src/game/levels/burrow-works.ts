import { makeLevel, type LevelDef } from '../level.ts'

// Level 20: crates + beetles. Beetles turn at crates and a pushed crate stops at a live beetle, so a crate
// is a movable wall for a beetle's patrol: shorten it, pen a beetle into a springboard spot, shield yourself.
// Soft-locks: every crate puzzle keeps a thorn pit or a hanging thorn within reach for a deliberate reset
// (crates go home on respawn); the intro pen has no thorns but any push still leaves a springboard or a step.
export const burrowWorks: LevelDef = {
  id: 'burrow-works',
  name: 'Burrow Works',
  build: () =>
    makeLevel(330, ({ fill, mote, checkpoint, crate, beetle, sign, pond, exit }) => {
      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. intro: push the crate into the beetle's walk until the pen is springboard-sized, spring over the wall
      pond(4, 8)
      mote(6, 12)
      checkpoint(9, 12)
      sign(9, 8, 'Beetles turn at crates')
      crate(13, 12)
      mote(17, 12)
      mote(19, 12)
      beetle(23, 12)
      fill(26, 12, 26, 12, '#')
      fill(28, 9, 31, 12, '#')
      mote(27, 7)
      checkpoint(30, 8)

      // B. a beetle blocks the crate: stomp it (don't hold: thorns above), then push the crate to the wall
      checkpoint(34, 12)
      sign(34, 9, 'A beetle stops a crate')
      pit(37, 38)
      mote(38, 9)
      checkpoint(39, 12)
      crate(41, 12)
      mote(42, 12)
      beetle(46, 12)
      fill(40, 8, 50, 8, 'v')
      mote(44, 12)
      mote(48, 12)
      mote(51, 12)
      fill(52, 9, 66, 12, '#')
      mote(51, 8)
      checkpoint(54, 8)

      // C. the overhang: push the crate off the ledge into the trench to pen its beetle, then spring out
      crate(60, 8)
      mote(58, 8)
      mote(64, 8)
      mote(68, 8)
      fill(67, 9, 71, 9, '#')
      fill(69, 10, 69, 10, 'v')
      beetle(76, 12)
      fill(80, 9, 83, 12, '#')
      mote(73, 11)
      mote(78, 8)
      checkpoint(82, 8)

      // D. a beetle guards the top: push the crate to the wall, climb when the beetle walks away, hop it low
      checkpoint(86, 12)
      pit(88, 89)
      mote(88, 9)
      checkpoint(90, 12)
      mote(91, 12)
      crate(92, 12)
      mote(94, 12)
      fill(97, 9, 102, 12, '#')
      fill(97, 4, 102, 4, 'v')
      beetle(100, 8)
      mote(96, 8)
      mote(98, 8)
      mote(100, 7)
      mote(103, 8)
      checkpoint(104, 12)

      // E. a pond and a beetle run
      checkpoint(106, 12)
      pond(107, 112)
      mote(110, 12)
      checkpoint(113, 12)
      pit(115, 117)
      mote(116, 10)
      fill(119, 12, 119, 12, '#')
      beetle(122, 12)
      fill(126, 12, 126, 12, '#')
      mote(122, 9)
      pit(128, 130)
      mote(129, 10)

      // F. the crate shield: push the crate down the thorn-roofed burrow, the beetle turns at it every time,
      //    until it is pinned at the end, then climb the crate up the wall. Without the crate the beetle wins.
      checkpoint(132, 12)
      sign(132, 8, 'Push it ahead of you')
      pit(134, 135)
      checkpoint(137, 12)
      crate(138, 12)
      mote(140, 12)
      fill(139, 1, 152, 9, '#')
      fill(139, 10, 152, 10, 'v')
      beetle(153, 12)
      fill(155, 9, 178, 12, '#')
      mote(143, 12)
      mote(148, 12)
      mote(151, 12)
      mote(154, 8)
      checkpoint(158, 8)

      // G. on the deck a beetle blocks the crate (stomp it, don't hold: thorns above); then push the crate
      //    off the overhang to pen the trench beetle and spring out
      checkpoint(164, 8)
      crate(166, 8)
      beetle(173, 8)
      fill(167, 4, 183, 4, 'v')
      mote(168, 8)
      mote(170, 8)
      mote(176, 8)
      mote(180, 8)
      fill(179, 9, 183, 9, '#')
      fill(181, 10, 181, 10, 'v')
      beetle(188, 12)
      fill(192, 9, 195, 12, '#')
      mote(184, 10)
      mote(190, 8)
      checkpoint(194, 8)

      // H. a pond, a beetle under a thorn roof (hop it low)
      checkpoint(198, 12)
      pond(199, 204)
      mote(201, 12)
      checkpoint(205, 12)
      pit(207, 209)
      mote(208, 10)
      fill(211, 12, 211, 12, '#')
      beetle(214, 12)
      fill(217, 12, 217, 12, '#')
      fill(210, 9, 218, 9, 'v')
      mote(214, 11)
      pit(220, 221)
      checkpoint(223, 12)

      // I. pen the beetle with the crate and spring onto a shelf with a guard on it: spring while it walks away
      crate(226, 12)
      mote(228, 12)
      mote(230, 12)
      mote(232, 12)
      beetle(236, 12)
      fill(239, 12, 239, 12, '#')
      fill(241, 9, 248, 12, '#')
      fill(241, 4, 248, 4, 'v')
      beetle(245, 8)
      mote(240, 7)
      mote(245, 7)
      mote(248, 8)

      checkpoint(250, 12)

      // J. a pit, then a beetle between bumps under a thorn roof: hop it low
      checkpoint(253, 12)
      pit(256, 258)
      mote(257, 9)
      checkpoint(259, 12)
      fill(261, 12, 261, 12, '#')
      beetle(264, 12)
      fill(267, 12, 267, 12, '#')
      fill(260, 8, 268, 8, 'v')
      mote(266, 10)
      checkpoint(268, 12)
      mote(269, 12)

      // K. finale: shield the crate down the burrow and climb; on the deck stomp the beetle that blocks the
      //    second crate, push it off the overhang to pen the trench beetle, and spring out to the gate
      checkpoint(271, 12)
      pit(273, 274)
      checkpoint(276, 12)
      crate(277, 12)
      mote(279, 12)
      fill(278, 1, 287, 9, '#')
      fill(278, 10, 287, 10, 'v')
      beetle(288, 12)
      mote(282, 12)
      mote(285, 12)
      fill(290, 9, 304, 12, '#')
      mote(289, 8)
      checkpoint(292, 8)
      crate(296, 8)
      beetle(301, 8)
      fill(297, 4, 309, 4, 'v')
      mote(298, 8)
      mote(300, 8)
      mote(304, 8)
      fill(305, 9, 309, 9, '#')
      fill(307, 10, 307, 10, 'v')
      beetle(314, 12)
      fill(318, 9, 321, 12, '#')
      mote(311, 11)
      mote(316, 8)
      checkpoint(320, 8)
      checkpoint(323, 12)
      mote(326, 12)
      exit(328, 12)
    }, 'burrow'),
}
