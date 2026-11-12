import type { ThemeId } from './themes.ts'

export const T = 32 // tile size in world px
export const LEVEL_H = 16 // every level is 16 tiles tall: the camera fits this height to the screen

// '#' stone, 'A' amber block, 'C' cyan block, '^' floor thorns, 'v' ceiling thorns,
// 'U' gravity-up field, 'D' gravity-down field, 'a'/'c' prism curtain (passing through turns you amber/cyan),
// '~' pond water (solid underfoot: the wisp skims it; purely a look), '.' empty
export type Tile = '#' | 'A' | 'C' | '^' | 'v' | 'U' | 'D' | 'a' | 'c' | '~' | '.'

export interface Point {
  x: number
  y: number
}

export interface Level {
  w: number
  h: number
  tiles: Tile[][] // [row][col]
  start: Point
  motes: (Point & { taken: boolean })[]
  checkpoints: (Point & { active: boolean })[]
  crates: Point[] // tile coords of pushable crates
  beetles: Point[] // tile coords of patrolling beetles (stand on the tile below)
  signs: (Point & { text: string })[] // in-world hint text, world coords
  exit: Point
  theme: ThemeId
}

export interface LevelDef {
  id: string // stable key for saved progress; never reuse or rename
  name: string
  build: () => Level
}

const center = (tx: number, ty: number): Point => ({ x: tx * T + T / 2, y: ty * T + T / 2 })

export interface Builder {
  w: number
  fill: (x0: number, y0: number, x1: number, y1: number, t: Tile) => void
  mote: (tx: number, ty: number) => void
  checkpoint: (tx: number, ty: number) => void
  crate: (tx: number, ty: number) => void
  beetle: (tx: number, ty: number) => void
  sign: (tx: number, ty: number, text: string) => void
  start: (tx: number, ty: number) => void
  exit: (tx: number, ty: number) => void
  /** Turns the ground's top two rows into pond water between x0..x1. Plays exactly like ground. */
  pond: (x0: number, x1: number) => void
}

/**
 * Builds a level from fills. Every level starts as a closed box: ceiling (row 0),
 * ground (rows 13-15) and side walls; start defaults to (3,12), exit to the end wall at ground level.
 */
export function makeLevel(w: number, design: (b: Builder) => void, theme: ThemeId = 'garden'): Level {
  const h = LEVEL_H
  const tiles: Tile[][] = Array.from({ length: h }, () => Array<Tile>(w).fill('.'))
  const fill = (x0: number, y0: number, x1: number, y1: number, t: Tile) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y][x] = t
  }
  const lv: Level = {
    w,
    h,
    tiles,
    start: center(3, 12),
    motes: [],
    checkpoints: [],
    crates: [],
    beetles: [],
    signs: [],
    exit: center(w - 2, 12),
    theme,
  }
  fill(0, 0, w - 1, 0, '#')
  fill(0, 13, w - 1, 15, '#')
  fill(0, 1, 0, 12, '#')
  fill(w - 1, 1, w - 1, 12, '#')
  design({
    w,
    fill,
    mote: (tx, ty) => lv.motes.push({ ...center(tx, ty), taken: false }),
    checkpoint: (tx, ty) => lv.checkpoints.push({ ...center(tx, ty), active: false }),
    crate: (tx, ty) => lv.crates.push({ x: tx, y: ty }),
    beetle: (tx, ty) => lv.beetles.push({ x: tx, y: ty }),
    sign: (tx, ty, text) => lv.signs.push({ ...center(tx, ty), text }),
    start: (tx, ty) => (lv.start = center(tx, ty)),
    exit: (tx, ty) => (lv.exit = center(tx, ty)), // keep it against a wall so it can't be overshot
    pond: (x0, x1) => {
      for (let y = 13; y <= 14; y++) for (let x = x0; x <= x1; x++) if (tiles[y][x] === '#') tiles[y][x] = '~'
    },
  })
  return lv
}
