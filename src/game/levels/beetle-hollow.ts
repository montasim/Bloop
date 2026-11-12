import { makeLevel, type LevelDef } from '../level.ts'

// Level 3: beetles. Land on them to squash them; touching one from the side hurts.
// Harder than level 2: beetles guard landings, share low corridors and sit on the pillars
// over a thorn floor, so every jump has to account for something that moves.
// A stomp bounces you up, so there is always room to come down after a beetle before the next hazard.
export const beetleHollow: LevelDef = {
  id: 'beetle-hollow',
  name: 'Beetle Hollow',
  build: () =>
    makeLevel(124, ({ fill, mote, checkpoint, sign, beetle, pond }) => {
      // ponds: the wisp skims across them (plays exactly like ground)
      pond(52, 57)
      pond(89, 93)

      const pit = (x0: number, x1: number) => {
        fill(x0, 13, x1, 14, '.')
        fill(x0, 14, x1, 14, '^')
      }

      // A. safe intro: one beetle penned between two bumps
      sign(5, 8, 'Land on beetles to squash them')
      fill(8, 12, 8, 12, '#')
      fill(17, 12, 17, 12, '#')
      beetle(13, 12)
      mote(11, 10)
      mote(14, 10)
      checkpoint(21, 12)

      // B. a beetle guards the top of a platform; land on it, come down, then clear the pit
      sign(24, 7, 'Hold jump as you land to bounce higher')
      fill(26, 11, 31, 12, '#') // 2 tall: easy to land on, the beetle is the challenge
      beetle(29, 10)
      mote(27, 10) // on the platform surface: the risk is landing up there next to the beetle
      checkpoint(34, 12) // on the runway: a safe save after the beetle
      pit(36, 39)
      mote(38, 9)

      // C. a trench too wide to jump, two beetles inside
      fill(43, 13, 51, 13, '.')
      beetle(45, 13)
      beetle(49, 13)
      mote(46, 13)
      mote(48, 10) // on the stomp-bounce arc: squash a beetle well to reach it
      checkpoint(55, 12)

      // D. a beetle patrols the landing after a pit
      pit(59, 61)
      fill(67, 12, 67, 12, '#')
      beetle(64, 12)
      mote(60, 9)
      mote(65, 10)

      // E. low corridor with a beetle: short hops only
      checkpoint(70, 12)
      fill(73, 1, 88, 8, '#')
      fill(73, 12, 73, 12, '#')
      fill(88, 12, 88, 12, '#')
      beetle(81, 12)
      mote(77, 11)
      mote(84, 11)

      // F. thorn floor, pillars, a beetle on the wide middle pillar
      checkpoint(92, 12)
      pit(95, 110)
      fill(98, 11, 99, 14, '#')
      fill(102, 10, 106, 14, '#')
      beetle(104, 9)
      fill(109, 11, 110, 14, '#')
      mote(98, 10)
      mote(104, 8)
      mote(109, 10)

      // G. a beetle guards the gate
      checkpoint(113, 12)
      fill(115, 12, 115, 12, '#')
      beetle(118, 12)
      mote(117, 10)
      mote(120, 10)
    }, 'hollow'),
}
