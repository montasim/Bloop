import { makeLevel, type LevelDef } from '../level.ts'

// Level 24: branching lanes. Every room is a fork with three lanes: a colour bridge (middle), the ground under it
// (low: thorn pits crossed on bridges of the OTHER colour, beetles) and a roof road (high, ridden upside down).
// Your colour on the tower picks the lane: roll on and the bridge holds you, hop through the hanging curtain and
// you turn the other colour and drop through the bridge into the low lane. Both lanes merge at an up-light; jump
// into it and the roof road carries you back LEFT over the room to a down-column above the fork, so every lane
// loops back and the other one can be taken. The roof road's colour says which lane to take first.
// Every roof stretch is closed by full-height 'D' columns (F and F+24); lanterns sit only on the fork tower and
// the merge ground, never over a lane you could respawn into in the wrong colour.
export const prismMaze: LevelDef = {
  id: 'prism-maze',
  name: 'Prism Maze',
  build: () =>
    makeLevel(384, ({ fill, mote, checkpoint, beetle, sign, pond, exit }) => {
      type Col = 'A' | 'C'
      const other = (c: Col): Col => (c === 'A' ? 'C' : 'A')
      const veil = (c: Col) => (c === 'A' ? 'a' : 'c')
      const col = (x: number, t: 'U' | 'D' | 'a' | 'c', y0 = 1, y1 = 12) => fill(x, y0, x, y1, t)
      let F = 0
      // all helpers below take offsets from the room's fork F
      const pit = (o0: number, o1: number, bridge?: Col) => {
        fill(F + o0, 13, F + o1, 14, '.')
        fill(F + o0, 14, F + o1, 14, '^')
        if (bridge) fill(F + o0, 13, F + o1, 13, bridge)
      }
      const gap = (o0: number, o1 = o0) => fill(F + o0, 10, F + o1, 10, '.') // a hole in the bridge
      const span = (o0: number, o1: number, c: Col) => fill(F + o0, 10, F + o1, 10, c) // recolour part of the bridge
      const bump = (o: number) => fill(F + o, 12, F + o, 12, '#')
      const bug = (o: number, y = 12) => beetle(F + o, y)
      const hang = (o: number, c: Col, y0 = 6, y1 = 8) => col(F + o, veil(c), y0, y1) // hanging curtain
      const road = (o0: number, o1: number, c: Col) => {
        fill(F + o0, 1, F + o1, 1, 'v')
        fill(F + o0, 2, F + o1, 2, c)
      }
      const hole = (o0: number, o1: number) => {
        fill(F + o0, 1, F + o1, 1, 'v')
        fill(F + o0, 2, F + o1, 2, '.')
      }
      const trap = (o: number, c: Col) => fill(F + o, 3, F + o, 3, veil(c)) // low on the roof road: hop it
      const m = (o: number, y: number) => mote(F + o, y)

      /**
       * The fork room from F to F+29 (p = the bridge's colour; the low lane belongs to the other one):
       * F: down-column (end of the roof road), F+1: curtain that makes you p, F+3..F+5: tower,
       * F+5: hanging curtain of the other colour, F+6..F+16: bridge (row 10), F+22: up-light, F+24: down-column.
       */
      const room = (f: number, p: Col) => {
        F = f
        col(F, 'D')
        col(F + 1, veil(p), 7, 12)
        fill(F + 3, 10, F + 5, 12, '#')
        hang(5, other(p))
        span(6, 16, p)
        fill(F + 1, 0, F + 23, 2, '#')
        col(F + 22, 'U', 3, 10)
        col(F + 24, 'D')
        checkpoint(F + 4, 9)
        checkpoint(F + 19, 12)
        checkpoint(F + 27, 12)
      }

      // intro
      pond(4, 9)
      checkpoint(12, 12)
      sign(7, 7, 'Forks: your colour picks the lane')

      // R0: amber rides the bridge, cyan drops to the cyan stones below; the light loops you back over the roof
      room(14, 'A')
      sign(F + 19, 6, 'Jump into the light: the roof leads back')
      gap(10, 11)
      pit(9, 12, 'C')
      m(10, 8)
      m(15, 9)
      m(11, 12)
      m(16, 12)
      m(18, 3)
      m(8, 3)

      // R1: cyan bridge, amber stones and a bump below, a thorny hole in the roof
      room(44, 'C')
      gap(10, 11)
      pit(8, 10, 'A')
      bump(14)
      hole(12, 14)
      m(10, 8)
      m(15, 9)
      m(9, 12)
      m(14, 10)
      m(13, 5)
      m(19, 3)

      // R2: an amber roof road with cyan traps: come back amber (bridge first); a beetle pen below
      room(74, 'A')
      gap(9, 10)
      gap(13, 14)
      bump(9)
      bug(12)
      bump(15)
      road(6, 20, 'A')
      trap(16, 'C')
      trap(10, 'C')
      m(9, 8)
      m(14, 8)
      m(12, 11)
      m(16, 11)
      m(16, 4)
      m(10, 4)
      m(20, 3)

      // R3: the roof road is amber but the bridge is cyan: take the amber low lane first
      room(104, 'C')
      pit(8, 10, 'A')
      pit(13, 15, 'A')
      gap(8)
      gap(14)
      bug(11, 9)
      road(4, 20, 'A')
      trap(17, 'C')
      trap(12, 'C')
      trap(7, 'C')
      m(9, 12)
      m(14, 12)
      m(11, 7)
      m(15, 9)
      m(12, 4)
      m(17, 4)

      // R4: swap in mid-air over a bridge gap (amber to cyan), so the roof road is cyan;
      //     the cyan half of the bridge is a low ceiling over the cyan low lane
      room(134, 'A')
      gap(11, 12)
      hang(11, 'C', 5, 8)
      hang(12, 'C', 5, 8)
      span(13, 16, 'C')
      pit(8, 10, 'C')
      pit(14, 15, 'C')
      road(5, 20, 'C')
      trap(15, 'A')
      trap(9, 'A')
      m(11, 8)
      m(15, 9)
      m(9, 12)
      m(14, 12)
      m(15, 4)
      m(9, 4)

      // R5: stepping-stone bridge; a beetle and amber stones below; two roof holes
      room(164, 'C')
      gap(8, 9)
      gap(12, 13)
      bump(9)
      bug(11)
      bump(13)
      pit(14, 16, 'A')
      hole(7, 8)
      hole(14, 16)
      m(8, 8)
      m(12, 8)
      m(16, 9)
      m(11, 11)
      m(15, 12)
      m(15, 5)
      m(8, 5)

      // R6: cyan roof road: low lane first (thorn gap between cyan stones), then the beetle bridge
      room(194, 'A')
      pit(8, 16)
      pit(8, 10, 'C')
      pit(13, 16, 'C')
      gap(8, 9)
      bug(12, 9)
      road(5, 20, 'C')
      trap(17, 'A')
      trap(13, 'A')
      trap(8, 'A')
      m(11, 11)
      m(15, 12)
      m(8, 8)
      m(12, 7)
      m(17, 4)
      m(13, 4)
      m(8, 4)

      // R7: hop short on the cyan bridge (an amber curtain hangs low over it); two beetles below
      room(224, 'C')
      gap(8, 9)
      gap(13, 14)
      hang(12, 'A', 7, 8)
      bump(8)
      bug(10)
      bump(12)
      bug(14)
      bump(16)
      road(3, 21, 'C')
      hole(10, 12)
      trap(16, 'A')
      m(9, 8)
      m(13, 8)
      m(16, 9)
      m(10, 11)
      m(14, 11)
      m(11, 5)
      m(16, 4)

      // R8: mid-air swap to cyan, then a colour seam on the roof: cyan road, amber curtain, amber road
      room(254, 'A')
      gap(10, 11)
      hang(10, 'C', 5, 8)
      hang(11, 'C', 5, 8)
      span(12, 16, 'C')
      pit(8, 10, 'C')
      pit(13, 14, 'C')
      road(13, 21, 'C')
      road(4, 12, 'A')
      trap(12, 'A')
      trap(8, 'C')
      m(10, 8)
      m(14, 9)
      m(9, 12)
      m(13, 12)
      m(17, 3)
      m(8, 4)

      // R9: amber roof road: low lane first (beetle pen, a thorn gap), then a gapped bridge
      room(284, 'C')
      bump(8)
      bug(10)
      bump(12)
      pit(13, 16)
      fill(F + 13, 13, F + 13, 13, 'A')
      fill(F + 16, 13, F + 16, 13, 'A')
      gap(9, 10)
      gap(14, 15)
      road(4, 20, 'A')
      hole(15, 16)
      trap(10, 'C')
      trap(6, 'C')
      m(10, 11)
      m(14, 11)
      m(10, 8)
      m(15, 8)
      m(17, 9)
      m(15, 5)
      m(10, 4)

      // R10: stomp the bridge beetle without bouncing into the low cyan curtain (it would drop you below);
      //      cyan stones with thorn gaps below; three traps on the roof road
      room(314, 'A')
      gap(8)
      bug(11, 9)
      hang(15, 'C', 7, 8)
      pit(8, 16)
      pit(8, 9, 'C')
      pit(12, 13, 'C')
      pit(16, 16, 'C')
      road(3, 21, 'A')
      trap(18, 'C')
      trap(14, 'C')
      trap(9, 'C')
      m(8, 8)
      m(11, 7)
      m(11, 11)
      m(15, 11)
      m(18, 4)
      m(14, 4)
      m(9, 4)

      // R11: amber roof road: low lane first (beetle pen), then the bridge that swaps you to amber in mid-air
      room(344, 'C')
      bump(8)
      bug(10)
      bump(12)
      pit(13, 15, 'A')
      gap(10, 11)
      hang(10, 'A', 5, 8)
      hang(11, 'A', 5, 8)
      span(12, 16, 'A')
      road(4, 20, 'A')
      trap(15, 'C')
      trap(8, 'C')
      m(10, 11)
      m(14, 12)
      m(10, 8)
      m(14, 9)
      m(15, 4)
      m(8, 4)

      // finale
      pond(373, 378)
      sign(376, 7, 'Every lane came back')
      mote(375, 11)
      exit(382, 12)
    }, 'mirage'),
}
