// Visual environments. Pure drawing: nothing here changes how a level plays.
// Each level picks one in makeLevel(); colours, scenery, ground/ceiling decor and ambient particles follow it.

export type ThemeId =
  | 'garden'
  | 'dusk'
  | 'hollow'
  | 'peaks'
  | 'roots'
  | 'prism'
  | 'lagoon'
  | 'canyon'
  | 'bloom'
  | 'autumn'
  | 'rift'
  | 'grotto'
  | 'abyss'
  | 'tundra'
  | 'moonhall'
  | 'quarry'
  | 'marsh'
  | 'ruins'
  | 'burrow'
  | 'echo'
  | 'thornwood'
  | 'starfield'
  | 'mirage'
  | 'undergrowth'
  | 'daybreak'
  | 'bramble'
  | 'starfall'
  | 'lastlight'
  | 'dawngate'

export interface Theme {
  id: ThemeId
  name: string
  sky: [string, string, string]
  stars: number
  starColor: string
  orb?: { x: number; y: number; r: number; color: string; disc?: string } // moon/sun, in screen fractions
  /** The sky brightens from `night` to `sky` by tile `skyAt`; the orb rises from below the hills between tiles `sunFrom` and `sunTo`. */
  sunrise?: { night: [string, string, string]; skyAt: number; sunFrom: number; sunTo: number }
  aurora?: [string, string]
  clouds?: string
  hills: [string, string]
  hillShape: 'round' | 'jagged' | 'pines' | 'cave'
  rock: { fill: string; speckle: string; edge: string }
  top: string // surface strip on top of rock (moss, sand, snow...)
  topGlow: string
  ground: 'grass' | 'drygrass' | 'mushrooms' | 'snow' | 'ferns' | 'crystals'
  groundColor: string
  buds: [string, string]
  ceiling: 'vines' | 'roots' | 'stalactites' | 'icicles' | 'crystals'
  ceilingColor: string
  fireflies: { color: string; density: number }
  ambient?: { kind: 'petals' | 'snow' | 'spores' | 'embers'; color: string; count: number }
  fog?: string
  water: { top: string; body: string }
  thorn: { fill: string; stroke: string }
}

export const THEMES: Record<ThemeId, Theme> = {
  garden: {
    id: 'garden',
    name: 'Night Garden',
    sky: ['#0a0d26', '#1a1342', '#2b1a45'],
    stars: 90,
    starColor: '#e8e4ff',
    orb: { x: 0.78, y: 0.2, r: 0.25, color: 'rgba(255,230,200,0.35)' },
    hills: ['#15183a', '#1b1f4a'],
    hillShape: 'round',
    rock: { fill: '#1f2550', speckle: '#262d5e', edge: '#141838' },
    top: '#7fe0b0',
    topGlow: 'rgba(127,224,176,0.25)',
    ground: 'grass',
    groundColor: '#7fe0b0',
    buds: ['#ff9ad8', '#8ff5ff'],
    ceiling: 'vines',
    ceilingColor: '#4fa883',
    fireflies: { color: '#d9ff8a', density: 0.6 },
    water: { top: '#9fe8ff', body: 'rgba(60,120,200,0.55)' },
    thorn: { fill: '#c9b8ff', stroke: '#7b62d9' },
  },
  dusk: {
    id: 'dusk',
    name: 'Ember Dusk',
    sky: ['#2a0f2e', '#7a2e3e', '#e0794a'],
    stars: 25,
    starColor: '#ffe3c8',
    orb: { x: 0.3, y: 0.58, r: 0.3, color: 'rgba(255,170,90,0.55)', disc: '#ffcf8a' },
    hills: ['#4a1a33', '#2c0f22'],
    hillShape: 'jagged',
    rock: { fill: '#3b1f33', speckle: '#4a2840', edge: '#22101e' },
    top: '#e8a25c',
    topGlow: 'rgba(232,162,92,0.25)',
    ground: 'drygrass',
    groundColor: '#e8b06a',
    buds: ['#ffd36b', '#ff8fa3'],
    ceiling: 'vines',
    ceilingColor: '#a8643e',
    fireflies: { color: '#ffcf7a', density: 0.3 },
    ambient: { kind: 'petals', color: '#ff9fb0', count: 34 },
    water: { top: '#ffc18a', body: 'rgba(150,60,80,0.55)' },
    thorn: { fill: '#ffb08a', stroke: '#a8434f' },
  },
  hollow: {
    id: 'hollow',
    name: 'Mushroom Hollow',
    sky: ['#120a06', '#1d120a', '#2a1a0e'],
    stars: 0,
    starColor: '#ffd28a',
    hills: ['#24170d', '#2e1d11'],
    hillShape: 'cave',
    rock: { fill: '#3a2a1c', speckle: '#46331f', edge: '#1e140c' },
    top: '#c9a36a',
    topGlow: 'rgba(201,163,106,0.22)',
    ground: 'mushrooms',
    groundColor: '#b89a62',
    buds: ['#ffcf6b', '#7ff0d0'],
    ceiling: 'stalactites',
    ceilingColor: '#5a4330',
    fireflies: { color: '#ffb35c', density: 0.45 },
    ambient: { kind: 'spores', color: '#ffd28a', count: 40 },
    water: { top: '#8fe6d6', body: 'rgba(40,110,100,0.55)' },
    thorn: { fill: '#e6c9a0', stroke: '#8a5a2b' },
  },
  peaks: {
    id: 'peaks',
    name: 'Frost Peaks',
    sky: ['#0b1a33', '#1f3a66', '#4f7fb0'],
    stars: 70,
    starColor: '#ffffff',
    orb: { x: 0.72, y: 0.17, r: 0.22, color: 'rgba(230,240,255,0.4)', disc: '#f4f8ff' },
    clouds: 'rgba(220,235,255,0.16)',
    hills: ['#1b3a63', '#122a4a'],
    hillShape: 'pines',
    rock: { fill: '#2a3b5c', speckle: '#33476d', edge: '#18233a' },
    top: '#f0f6ff',
    topGlow: 'rgba(240,246,255,0.35)',
    ground: 'snow',
    groundColor: '#f0f6ff',
    buds: ['#bfe6ff', '#ffffff'],
    ceiling: 'icicles',
    ceilingColor: '#cfeaff',
    fireflies: { color: '#cfeaff', density: 0 },
    ambient: { kind: 'snow', color: '#ffffff', count: 60 },
    water: { top: '#d6f0ff', body: 'rgba(120,180,230,0.5)' },
    thorn: { fill: '#dff1ff', stroke: '#5a7fb5' },
  },
  roots: {
    id: 'roots',
    name: 'Root Wilds',
    sky: ['#06140e', '#0d2418', '#163322'],
    stars: 20,
    starColor: '#c8ffd8',
    orb: { x: 0.6, y: 0.22, r: 0.2, color: 'rgba(180,255,200,0.18)' },
    hills: ['#0e2619', '#0a1c12'],
    hillShape: 'round',
    rock: { fill: '#1c2a20', speckle: '#243628', edge: '#0f1812' },
    top: '#5fcf7a',
    topGlow: 'rgba(95,207,122,0.22)',
    ground: 'ferns',
    groundColor: '#5fcf7a',
    buds: ['#c6ff9a', '#ffe17a'],
    ceiling: 'roots',
    ceilingColor: '#5b4a33',
    fireflies: { color: '#b6ff7a', density: 0.9 },
    ambient: { kind: 'spores', color: '#c6ff9a', count: 30 },
    fog: 'rgba(160,220,180,0.05)',
    water: { top: '#8ff0c8', body: 'rgba(40,120,90,0.55)' },
    thorn: { fill: '#d6f5b0', stroke: '#4f7a3a' },
  },
  prism: {
    id: 'prism',
    name: 'Prism Caverns',
    sky: ['#0a0618', '#1c0f3a', '#2b1650'],
    stars: 60,
    starColor: '#ffe6fb',
    aurora: ['rgba(77,225,255,0.20)', 'rgba(255,120,220,0.16)'],
    hills: ['#1d1240', '#150c30'],
    hillShape: 'jagged',
    rock: { fill: '#241a45', speckle: '#2e2257', edge: '#140e2a' },
    top: '#8ff5ff',
    topGlow: 'rgba(143,245,255,0.22)',
    ground: 'crystals',
    groundColor: '#8ff5ff',
    buds: ['#ff9ad8', '#8ff5ff'],
    ceiling: 'crystals',
    ceilingColor: '#c79bff',
    fireflies: { color: '#ff9ad8', density: 0.5 },
    water: { top: '#e2c8ff', body: 'rgba(120,80,200,0.5)' },
    thorn: { fill: '#ffd1f4', stroke: '#b04fa0' },
  },
  lagoon: {
    id: 'lagoon',
    name: 'Moon Lagoon',
    sky: ['#04121f', '#0b2a3f', '#13465a'],
    stars: 110,
    starColor: '#d8f6ff',
    orb: { x: 0.5, y: 0.16, r: 0.24, color: 'rgba(200,240,255,0.3)', disc: '#e8fbff' },
    clouds: 'rgba(160,220,240,0.08)',
    hills: ['#0a2a36', '#071f29'],
    hillShape: 'round',
    rock: { fill: '#163746', speckle: '#1d4555', edge: '#0b2029' },
    top: '#9be7d8',
    topGlow: 'rgba(155,231,216,0.22)',
    ground: 'drygrass', // reeds
    groundColor: '#7fcfb4',
    buds: ['#e8fbff', '#ffd98a'],
    ceiling: 'vines',
    ceilingColor: '#3f8f86',
    fireflies: { color: '#bff8ff', density: 0.5 },
    ambient: { kind: 'spores', color: '#bff8ff', count: 26 },
    water: { top: '#c8f6ff', body: 'rgba(40,140,180,0.55)' },
    thorn: { fill: '#bfeee6', stroke: '#2f7f88' },
  },
  canyon: {
    id: 'canyon',
    name: 'Red Canyon',
    sky: ['#1a0a12', '#4a1a1a', '#8a3a22'],
    stars: 60,
    starColor: '#ffe9d6',
    orb: { x: 0.82, y: 0.24, r: 0.2, color: 'rgba(255,200,150,0.3)', disc: '#ffe2c4' },
    hills: ['#3a1410', '#2a0e0c'],
    hillShape: 'jagged',
    rock: { fill: '#5a2a1e', speckle: '#6e3624', edge: '#2e140e' },
    top: '#e0a060',
    topGlow: 'rgba(224,160,96,0.22)',
    ground: 'drygrass',
    groundColor: '#c99a5a',
    buds: ['#ff6b4a', '#ffd36b'],
    ceiling: 'stalactites',
    ceilingColor: '#7a3a26',
    fireflies: { color: '#ffb36b', density: 0.25 },
    ambient: { kind: 'embers', color: '#ff9a5a', count: 30 },
    water: { top: '#ffd0a0', body: 'rgba(160,80,50,0.5)' },
    thorn: { fill: '#ffd0a8', stroke: '#9a3a22' },
  },
  bloom: {
    id: 'bloom',
    name: 'Dawn Bloom',
    sky: ['#2a1a4a', '#a0508a', '#ffb08a'],
    stars: 15,
    starColor: '#fff0f6',
    orb: { x: 0.2, y: 0.7, r: 0.35, color: 'rgba(255,210,170,0.45)', disc: '#fff1d6' },
    clouds: 'rgba(255,220,240,0.14)',
    hills: ['#5a2f6a', '#3f2050'],
    hillShape: 'round',
    rock: { fill: '#3e2a55', speckle: '#4a3366', edge: '#25183a' },
    top: '#a6f0a0',
    topGlow: 'rgba(166,240,160,0.25)',
    ground: 'grass',
    groundColor: '#a6f0a0',
    buds: ['#ff8fc8', '#ffe27a'],
    ceiling: 'vines',
    ceilingColor: '#8acf8a',
    fireflies: { color: '#fff3a0', density: 0.35 },
    ambient: { kind: 'petals', color: '#ffc2e0', count: 40 },
    water: { top: '#ffe0f0', body: 'rgba(150,90,170,0.5)' },
    thorn: { fill: '#ffd6ec', stroke: '#a04a8a' },
  },
  autumn: {
    id: 'autumn',
    name: 'Amber Woods',
    sky: ['#1a0f1e', '#4a2418', '#a8521e'],
    stars: 40,
    starColor: '#fff0d8',
    orb: { x: 0.68, y: 0.3, r: 0.28, color: 'rgba(255,170,80,0.4)', disc: '#ffcf8a' },
    hills: ['#3a1c14', '#28120e'],
    hillShape: 'pines',
    rock: { fill: '#3a2418', speckle: '#4a2e1e', edge: '#20140c' },
    top: '#e08a3a',
    topGlow: 'rgba(224,138,58,0.25)',
    ground: 'drygrass',
    groundColor: '#e8a050',
    buds: ['#ff6a3a', '#ffd36b'],
    ceiling: 'roots',
    ceilingColor: '#6a4024',
    fireflies: { color: '#ffd07a', density: 0.4 },
    ambient: { kind: 'petals', color: '#ff8a3a', count: 46 }, // falling leaves
    water: { top: '#ffc890', body: 'rgba(130,70,40,0.5)' },
    thorn: { fill: '#ffc8a0', stroke: '#8a3a1a' },
  },
  rift: {
    id: 'rift',
    name: 'Starfall Rift',
    sky: ['#020210', '#0a0a2a', '#1a0f3a'],
    stars: 180,
    starColor: '#ffffff',
    orb: { x: 0.25, y: 0.3, r: 0.32, color: 'rgba(140,110,255,0.3)', disc: '#b8a8ff' }, // a ringed giant
    aurora: ['rgba(120,90,255,0.12)', 'rgba(80,200,255,0.10)'],
    hills: ['#120c2c', '#0c0820'],
    hillShape: 'jagged',
    rock: { fill: '#1c1838', speckle: '#262048', edge: '#0e0c20' },
    top: '#b8a8ff',
    topGlow: 'rgba(184,168,255,0.22)',
    ground: 'crystals',
    groundColor: '#b8a8ff',
    buds: ['#8fd8ff', '#e0b8ff'],
    ceiling: 'crystals',
    ceilingColor: '#8fd8ff',
    fireflies: { color: '#e0e8ff', density: 0.3 },
    ambient: { kind: 'spores', color: '#ffffff', count: 50 }, // drifting star dust
    water: { top: '#c8d8ff', body: 'rgba(80,80,200,0.45)' },
    thorn: { fill: '#e8e0ff', stroke: '#6a5ac8' },
  },
  grotto: {
    id: 'grotto',
    name: 'Glow Grotto',
    sky: ['#010a10', '#03141e', '#06202a'],
    stars: 0,
    starColor: '#8ff5ff',
    hills: ['#041820', '#06222c'],
    hillShape: 'cave',
    rock: { fill: '#0e2a33', speckle: '#14363f', edge: '#06161c' },
    top: '#4ff0d8',
    topGlow: 'rgba(79,240,216,0.22)',
    ground: 'mushrooms',
    groundColor: '#3fc8b8',
    buds: ['#4ff0ff', '#a0ff8a'],
    ceiling: 'stalactites',
    ceilingColor: '#1c4a52',
    fireflies: { color: '#6ff8ff', density: 0.7 },
    ambient: { kind: 'spores', color: '#6ff8ff', count: 44 },
    water: { top: '#8ff8ff', body: 'rgba(20,140,160,0.5)' },
    thorn: { fill: '#b0fff0', stroke: '#1a8a7a' },
  },
  abyss: {
    id: 'abyss',
    name: 'Sunken Deep',
    sky: ['#010614', '#031a32', '#05304a'],
    stars: 0,
    starColor: '#9fe8ff',
    orb: { x: 0.5, y: -0.05, r: 0.45, color: 'rgba(120,210,255,0.22)' }, // light from the surface far above
    hills: ['#04203a', '#031828'],
    hillShape: 'round',
    rock: { fill: '#0c2a40', speckle: '#12364f', edge: '#061622' },
    top: '#ff9a7a', // coral
    topGlow: 'rgba(255,154,122,0.2)',
    ground: 'crystals', // coral fans
    groundColor: '#ff9a7a',
    buds: ['#ff7aa8', '#ffd07a'],
    ceiling: 'roots', // kelp
    ceilingColor: '#2f8a5a',
    fireflies: { color: '#7fe8ff', density: 0.5 }, // glowing plankton
    ambient: { kind: 'spores', color: '#cff4ff', count: 55 }, // rising bubbles
    fog: 'rgba(80,160,220,0.05)',
    water: { top: '#9fe8ff', body: 'rgba(30,110,170,0.5)' },
    thorn: { fill: '#ffc0d0', stroke: '#b04a6a' }, // urchin spines
  },
  tundra: {
    id: 'tundra',
    name: 'Aurora Tundra',
    sky: ['#020a10', '#06202a', '#0c3238'],
    stars: 120,
    starColor: '#e8fff6',
    aurora: ['rgba(80,255,170,0.24)', 'rgba(120,200,255,0.16)'],
    hills: ['#0a2a2a', '#071e20'],
    hillShape: 'jagged',
    rock: { fill: '#1e3a44', speckle: '#264652', edge: '#0f2026' },
    top: '#e8fbff',
    topGlow: 'rgba(232,251,255,0.3)',
    ground: 'snow',
    groundColor: '#e8fbff',
    buds: ['#8affc8', '#bfe8ff'],
    ceiling: 'icicles',
    ceilingColor: '#c8f0ff',
    fireflies: { color: '#8affc8', density: 0.15 },
    ambient: { kind: 'snow', color: '#ffffff', count: 40 },
    water: { top: '#d0f8ff', body: 'rgba(90,170,200,0.5)' },
    thorn: { fill: '#d8fff0', stroke: '#3a8a7a' },
  },
  moonhall: {
    id: 'moonhall',
    name: 'Moon Hall',
    sky: ['#05060f', '#141832', '#262c50'],
    stars: 100,
    starColor: '#f4f6ff',
    orb: { x: 0.62, y: 0.32, r: 0.5, color: 'rgba(220,226,255,0.32)', disc: '#eef0ff' }, // a huge moon
    hills: ['#1a1e3a', '#12152c'],
    hillShape: 'pines',
    rock: { fill: '#3a4060', speckle: '#464d70', edge: '#20243a' }, // pale moonstone
    top: '#dfe4ff',
    topGlow: 'rgba(223,228,255,0.25)',
    ground: 'crystals',
    groundColor: '#dfe4ff',
    buds: ['#ffffff', '#b8c4ff'],
    ceiling: 'crystals',
    ceilingColor: '#b8c4ff',
    fireflies: { color: '#ffffff', density: 0.35 },
    ambient: { kind: 'spores', color: '#e8ecff', count: 30 },
    fog: 'rgba(200,210,255,0.04)',
    water: { top: '#eef0ff', body: 'rgba(130,140,220,0.45)' },
    thorn: { fill: '#f0f2ff', stroke: '#6a72b0' },
  },
  quarry: {
    id: 'quarry',
    name: 'Old Quarry',
    sky: ['#140e08', '#3a2814', '#6a4a24'],
    stars: 50,
    starColor: '#fff2d8',
    orb: { x: 0.3, y: 0.22, r: 0.24, color: 'rgba(255,220,160,0.3)', disc: '#ffe8c0' },
    clouds: 'rgba(255,220,170,0.08)', // drifting dust
    hills: ['#3a2a18', '#2a1e10'],
    hillShape: 'jagged',
    rock: { fill: '#5a4630', speckle: '#6a5438', edge: '#2e2416' },
    top: '#d8b878',
    topGlow: 'rgba(216,184,120,0.22)',
    ground: 'drygrass',
    groundColor: '#c8a868',
    buds: ['#ffd27a', '#fff2c0'],
    ceiling: 'stalactites',
    ceilingColor: '#4a3a26',
    fireflies: { color: '#ffe08a', density: 0.25 },
    ambient: { kind: 'embers', color: '#e8c890', count: 28 }, // quarry dust in the air
    water: { top: '#e8d0a0', body: 'rgba(120,100,70,0.5)' },
    thorn: { fill: '#f0dcb0', stroke: '#8a6a3a' },
  },
  marsh: {
    id: 'marsh',
    name: 'Mist Marsh',
    sky: ['#060c0a', '#10201a', '#1c3428'],
    stars: 35,
    starColor: '#d8ffe8',
    orb: { x: 0.75, y: 0.25, r: 0.22, color: 'rgba(200,255,220,0.2)', disc: '#e0ffe8' },
    hills: ['#10261c', '#0a1c14'],
    hillShape: 'round',
    rock: { fill: '#22301e', speckle: '#2c3c26', edge: '#121c10' },
    top: '#8ad870',
    topGlow: 'rgba(138,216,112,0.22)',
    ground: 'drygrass', // reeds
    groundColor: '#7ac868',
    buds: ['#ffef8a', '#ff9ad8'],
    ceiling: 'roots',
    ceilingColor: '#3a5030',
    fireflies: { color: '#e8ff7a', density: 1 },
    ambient: { kind: 'spores', color: '#e8ff9a', count: 36 },
    fog: 'rgba(170,220,190,0.07)',
    water: { top: '#b8f0c8', body: 'rgba(50,110,70,0.55)' },
    thorn: { fill: '#e0f8c0', stroke: '#5a7a3a' },
  },
  ruins: {
    id: 'ruins',
    name: 'Sunken Ruins',
    sky: ['#0a0812', '#1e1830', '#3a2c48'],
    stars: 80,
    starColor: '#fff8e8',
    orb: { x: 0.8, y: 0.2, r: 0.2, color: 'rgba(255,240,210,0.28)', disc: '#fff4dc' },
    hills: ['#241e32', '#1a1626'],
    hillShape: 'pines', // broken columns on the skyline read like this
    rock: { fill: '#4a4258', speckle: '#565068', edge: '#262234' },
    top: '#9ad89a',
    topGlow: 'rgba(154,216,154,0.2)',
    ground: 'ferns',
    groundColor: '#8ac88a',
    buds: ['#ffd27a', '#c8b8ff'],
    ceiling: 'vines',
    ceilingColor: '#5a8a5a',
    fireflies: { color: '#ffe8a0', density: 0.45 },
    ambient: { kind: 'petals', color: '#c8b8ff', count: 22 },
    water: { top: '#d8d0ff', body: 'rgba(90,80,150,0.5)' },
    thorn: { fill: '#f0e8ff', stroke: '#7a6aa0' },
  },
  burrow: {
    id: 'burrow',
    name: 'Burrow Works',
    sky: ['#0e0806', '#24140c', '#3c2414'],
    stars: 0,
    starColor: '#ffe0c0',
    hills: ['#2e1c10', '#22140a'],
    hillShape: 'cave',
    rock: { fill: '#5a3a24', speckle: '#6c4a2e', edge: '#2a1a0e' },
    top: '#c8a060',
    topGlow: 'rgba(200,160,96,0.22)',
    ground: 'mushrooms',
    groundColor: '#e8a868',
    buds: ['#ff9a5a', '#ffe0a0'],
    ceiling: 'roots',
    ceilingColor: '#6a4428',
    fireflies: { color: '#ffb86a', density: 0.6 },
    ambient: { kind: 'spores', color: '#ffc890', count: 30 }, // drifting soil motes
    water: { top: '#e8c8a0', body: 'rgba(110,70,40,0.55)' },
    thorn: { fill: '#f8d8b0', stroke: '#8a5a30' },
  },
  echo: {
    id: 'echo',
    name: 'Echo Caves',
    sky: ['#02060e', '#081428', '#102440'],
    stars: 0,
    starColor: '#c0e0ff',
    hills: ['#0c1a30', '#081224'],
    hillShape: 'cave',
    rock: { fill: '#24344e', speckle: '#2e4060', edge: '#101a2c' },
    top: '#7ad0f0',
    topGlow: 'rgba(122,208,240,0.22)',
    ground: 'crystals',
    groundColor: '#8ae0ff',
    buds: ['#7af0ff', '#d0b8ff'],
    ceiling: 'stalactites',
    ceilingColor: '#2c4262',
    fireflies: { color: '#9ae8ff', density: 0.5 },
    ambient: { kind: 'spores', color: '#a8e8ff', count: 26 }, // drips catching the light
    fog: 'rgba(120,180,240,0.06)',
    water: { top: '#a8e8ff', body: 'rgba(40,90,150,0.55)' },
    thorn: { fill: '#d8f4ff', stroke: '#4a7aa0' },
  },
  thornwood: {
    id: 'thornwood',
    name: 'Thorn Garden',
    sky: ['#12060a', '#2c0e18', '#4a1a28'],
    stars: 60,
    starColor: '#ffe0e8',
    orb: { x: 0.7, y: 0.22, r: 0.22, color: 'rgba(255,190,200,0.26)', disc: '#ffe4ea' },
    hills: ['#30101c', '#220a14'],
    hillShape: 'jagged',
    rock: { fill: '#3e2430', speckle: '#4c2e3c', edge: '#1e1018' },
    top: '#e87a9a',
    topGlow: 'rgba(232,122,154,0.22)',
    ground: 'ferns',
    groundColor: '#c86a8a',
    buds: ['#ff6a8a', '#ffd0dc'],
    ceiling: 'vines',
    ceilingColor: '#6a3048',
    fireflies: { color: '#ffb0c8', density: 0.55 },
    ambient: { kind: 'petals', color: '#ff9ab8', count: 30 },
    water: { top: '#ffc8d8', body: 'rgba(130,50,80,0.5)' },
    thorn: { fill: '#ffe0e8', stroke: '#a03a5a' },
  },
  starfield: {
    id: 'starfield',
    name: 'Twin Skies',
    sky: ['#04020e', '#120a2c', '#24124a'],
    stars: 140,
    starColor: '#e8dcff',
    orb: { x: 0.22, y: 0.3, r: 0.18, color: 'rgba(200,180,255,0.28)', disc: '#efe6ff' },
    aurora: ['rgba(160,120,255,0.12)', 'rgba(90,200,255,0.08)'],
    hills: ['#1c1236', '#120a26'],
    hillShape: 'jagged',
    rock: { fill: '#34285a', speckle: '#40326c', edge: '#181030' },
    top: '#b8a0ff',
    topGlow: 'rgba(184,160,255,0.22)',
    ground: 'crystals',
    groundColor: '#c8b0ff',
    buds: ['#b89aff', '#8ae0ff'],
    ceiling: 'crystals',
    ceilingColor: '#5a46a0',
    fireflies: { color: '#d8c8ff', density: 0.4 },
    ambient: { kind: 'snow', color: '#e0d4ff', count: 24 }, // slow star dust
    water: { top: '#d0c0ff', body: 'rgba(80,60,160,0.5)' },
    thorn: { fill: '#f0e8ff', stroke: '#6a50b0' },
  },
  mirage: {
    id: 'mirage',
    name: 'Prism Mirage',
    sky: ['#140a06', '#3a1a10', '#7a3a1a'],
    stars: 20,
    starColor: '#fff0d0',
    orb: { x: 0.5, y: 0.34, r: 0.3, color: 'rgba(255,170,90,0.3)', disc: '#ffd8a0' },
    clouds: 'rgba(255,200,150,0.08)',
    hills: ['#4a2214', '#34180e'],
    hillShape: 'round',
    rock: { fill: '#7a4a2a', speckle: '#8a5634', edge: '#3a2010' },
    top: '#ffc870',
    topGlow: 'rgba(255,200,112,0.24)',
    ground: 'crystals',
    groundColor: '#ff9ad0',
    buds: ['#7af0ff', '#ff8ad0'],
    ceiling: 'crystals',
    ceilingColor: '#a85a3a',
    fireflies: { color: '#ffe0a0', density: 0.3 },
    ambient: { kind: 'embers', color: '#ffd090', count: 26 }, // heat shimmer
    water: { top: '#ffe0b0', body: 'rgba(150,80,40,0.5)' },
    thorn: { fill: '#fff0d8', stroke: '#a0602a' },
  },
  undergrowth: {
    id: 'undergrowth',
    name: 'The Undergrowth',
    sky: ['#020804', '#06180c', '#0e2a16'],
    stars: 10,
    starColor: '#e0ffe0',
    hills: ['#0a2010', '#06180a'],
    hillShape: 'pines',
    rock: { fill: '#1e3420', speckle: '#284228', edge: '#0c1a0c' },
    top: '#5ad86a',
    topGlow: 'rgba(90,216,106,0.24)',
    ground: 'ferns',
    groundColor: '#4ac85a',
    buds: ['#c8ff6a', '#ffb0e0'],
    ceiling: 'vines',
    ceilingColor: '#2a6a30',
    fireflies: { color: '#d0ff7a', density: 1.2 },
    ambient: { kind: 'spores', color: '#d8ff9a', count: 40 },
    fog: 'rgba(120,220,140,0.07)',
    water: { top: '#a8f0b0', body: 'rgba(30,90,40,0.55)' },
    thorn: { fill: '#e8ffd0', stroke: '#3a7a3a' },
  },
  daybreak: {
    id: 'daybreak',
    name: 'Swift Roots',
    sky: ['#1a2a4a', '#7a5a8a', '#ffb07a'],
    stars: 15,
    starColor: '#fff4e0',
    orb: { x: 0.85, y: 0.72, r: 0.3, color: 'rgba(255,200,130,0.35)', disc: '#ffe0a8' }, // sun just rising
    clouds: 'rgba(255,220,200,0.14)',
    hills: ['#4a3a5a', '#2e2440'],
    hillShape: 'round',
    rock: { fill: '#5a4a3a', speckle: '#6a5846', edge: '#2e241a' },
    top: '#9ae07a',
    topGlow: 'rgba(154,224,122,0.22)',
    ground: 'grass',
    groundColor: '#8ad06a',
    buds: ['#ffd07a', '#ff9aa8'],
    ceiling: 'roots',
    ceilingColor: '#6a5040',
    fireflies: { color: '#fff0b0', density: 0.2 },
    ambient: { kind: 'petals', color: '#ffc8a0', count: 24 },
    water: { top: '#ffe0c8', body: 'rgba(120,110,170,0.5)' },
    thorn: { fill: '#fff0e0', stroke: '#8a5a4a' },
  },
  bramble: {
    id: 'bramble',
    name: 'Thousand Thorns',
    sky: ['#1a0e0a', '#5a2a1a', '#d8784a'],
    stars: 5,
    starColor: '#fff0e0',
    orb: { x: 0.2, y: 0.5, r: 0.26, color: 'rgba(255,150,90,0.32)', disc: '#ffc890' },
    hills: ['#3a1a14', '#26100c'],
    hillShape: 'jagged',
    rock: { fill: '#4a2a22', speckle: '#5a342a', edge: '#220e0a' },
    top: '#c8b060',
    topGlow: 'rgba(200,176,96,0.22)',
    ground: 'drygrass',
    groundColor: '#b89a50',
    buds: ['#ff7a5a', '#ffd08a'],
    ceiling: 'vines',
    ceilingColor: '#5a2a1e',
    fireflies: { color: '#ffc87a', density: 0.3 },
    ambient: { kind: 'embers', color: '#ffa070', count: 30 },
    water: { top: '#ffd0b0', body: 'rgba(140,60,40,0.5)' },
    thorn: { fill: '#ffe8d8', stroke: '#9a3a2a' },
  },
  starfall: {
    id: 'starfall',
    name: 'Starfall Shaft',
    sky: ['#020210', '#0a0a30', '#3a2a6a'],
    stars: 180,
    starColor: '#fff8e0',
    aurora: ['rgba(255,220,140,0.1)', 'rgba(140,160,255,0.1)'],
    hills: ['#14143a', '#0c0c28'],
    hillShape: 'cave',
    rock: { fill: '#2a2a4a', speckle: '#36365c', edge: '#121226' },
    top: '#ffe08a',
    topGlow: 'rgba(255,224,138,0.24)',
    ground: 'crystals',
    groundColor: '#ffe8a0',
    buds: ['#fff0a0', '#a8b8ff'],
    ceiling: 'crystals',
    ceilingColor: '#4a4a8a',
    fireflies: { color: '#fff0b0', density: 0.5 },
    ambient: { kind: 'snow', color: '#fff4c0', count: 34 }, // falling stars
    water: { top: '#e0e0ff', body: 'rgba(60,60,150,0.55)' },
    thorn: { fill: '#fffbe8', stroke: '#6a6ab0' },
  },
  lastlight: {
    id: 'lastlight',
    name: 'Last Lantern',
    sky: ['#06040e', '#1a1030', '#4a2a4a'],
    stars: 90,
    starColor: '#ffe8c8',
    orb: { x: 0.15, y: 0.78, r: 0.22, color: 'rgba(255,170,110,0.22)', disc: '#ffcf98' }, // the first hint of dawn
    aurora: ['rgba(255,190,120,0.08)', 'rgba(170,130,255,0.08)'],
    hills: ['#24183a', '#160e28'],
    hillShape: 'pines',
    rock: { fill: '#3a3048', speckle: '#463a58', edge: '#1a1424' },
    top: '#ffd07a',
    topGlow: 'rgba(255,208,122,0.24)',
    ground: 'grass',
    groundColor: '#c8b070',
    buds: ['#ffd07a', '#b8a0ff'],
    ceiling: 'vines',
    ceilingColor: '#4a3a5a',
    fireflies: { color: '#ffd890', density: 1 }, // a sky full of lanterns
    ambient: { kind: 'embers', color: '#ffc880', count: 34 },
    water: { top: '#ffe0c0', body: 'rgba(90,70,140,0.5)' },
    thorn: { fill: '#fff0dc', stroke: '#7a5a8a' },
  },
  dawngate: {
    id: 'dawngate',
    name: 'Dawn Gate',
    sky: ['#3a6ab0', '#f0a8a0', '#ffe0a0'],
    stars: 0,
    starColor: '#ffffff',
    orb: { x: 0.8, y: 0.3, r: 0.34, color: 'rgba(255,240,180,0.45)', disc: '#fff6d8' }, // full sunrise
    sunrise: { night: ['#0a0c24', '#2a1c48', '#6a3a5a'], skyAt: 400, sunFrom: 380, sunTo: 440 }, // the meadow starts at 388
    clouds: 'rgba(255,255,255,0.2)',
    hills: ['#8a7aa8', '#6a5a8a'],
    hillShape: 'round',
    rock: { fill: '#7a6a5a', speckle: '#8a7a68', edge: '#4a3e32' },
    top: '#a8f08a',
    topGlow: 'rgba(168,240,138,0.26)',
    ground: 'grass',
    groundColor: '#9ae07a',
    buds: ['#ffe07a', '#ffa8c8'],
    ceiling: 'vines',
    ceilingColor: '#7aa86a',
    fireflies: { color: '#fff8c0', density: 0.15 },
    ambient: { kind: 'petals', color: '#ffd0e0', count: 36 },
    water: { top: '#e8f8ff', body: 'rgba(110,160,220,0.5)' },
    thorn: { fill: '#fff8f0', stroke: '#9a6a6a' },
  },
}

export function rand(i: number) {
  const s = Math.sin(i * 127.1) * 43758.5453
  return s - Math.floor(s)
}

// ---------- backdrop (screen space) ----------

const mixHex = (a: string, b: string, t: number) => {
  const c = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16)
  return `rgb(${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * t)).join(',')})`
}
const ramp = (x: number, a: number, b: number) => Math.max(0, Math.min(1, (x - a) / (b - a)))

/** viewTile: the tile at the centre of the view (only themes with `sunrise` use it). */
export function drawBackdrop(ctx: CanvasRenderingContext2D, th: Theme, w: number, h: number, camX: number, now: number, viewTile = 0) {
  const sr = th.sunrise
  const day = sr ? ramp(viewTile, 0, sr.skyAt) ** 2 : 1 // stays dark most of the way, brightens near the end
  const rise = sr ? ramp(viewTile, sr.sunFrom, sr.sunTo) : 1
  const skyCol = (i: number) => (sr ? mixHex(sr.night[i], th.sky[i], day) : th.sky[i])
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, skyCol(0))
  sky.addColorStop(0.6, skyCol(1))
  sky.addColorStop(1, skyCol(2))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  if (th.aurora) {
    for (let band = 0; band < 2; band++) {
      ctx.fillStyle = th.aurora[band]
      ctx.beginPath()
      ctx.moveTo(0, h * 0.1)
      for (let x = 0; x <= w; x += 12) {
        const wx = x + camX * 0.03
        ctx.lineTo(x, h * (0.18 + band * 0.08) + Math.sin(wx * 0.006 + now * 0.0004 + band) * h * 0.05)
      }
      for (let x = w; x >= 0; x -= 12) {
        const wx = x + camX * 0.03
        ctx.lineTo(x, h * (0.3 + band * 0.08) + Math.sin(wx * 0.005 + now * 0.0003 + band * 2) * h * 0.06)
      }
      ctx.fill()
    }
  }

  const stars = sr ? Math.round(80 * (1 - day)) : th.stars // pre-dawn stars fade out as the sky lightens
  for (let i = 0; i < stars; i++) {
    const x = (((rand(i) * w * 2 - camX * 0.05) % w) + w) % w
    const y = rand(i + 500) * h * 0.7
    ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(now * 0.001 + i))
    ctx.fillStyle = th.starColor
    ctx.fillRect(x, y, 1.5, 1.5)
  }
  ctx.globalAlpha = 1

  if (th.orb && rise > 0) {
    const { x, r, color, disc } = th.orb
    const y = th.orb.y + (1 - rise) * (0.85 - th.orb.y) // from behind the hills up to its place
    ctx.globalAlpha = rise
    const g = ctx.createRadialGradient(w * x, h * y, 0, w * x, h * y, h * r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
    if (disc) {
      ctx.fillStyle = disc
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.arc(w * x, h * y, h * r * 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  if (th.clouds) {
    ctx.fillStyle = th.clouds
    for (let i = 0; i < 7; i++) {
      const span = w + 300
      const cx = ((((rand(i + 40) * span + now * 0.006 * (0.5 + rand(i)) - camX * 0.08) % span) + span) % span) - 150
      const cy = h * (0.12 + rand(i + 80) * 0.3)
      for (let k = 0; k < 4; k++) {
        ctx.beginPath()
        ctx.ellipse(cx + k * 26 - 40, cy + Math.sin(k * 2) * 6, 40 - k * 4, 14, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const hill = (color: string, par: number, base: number, amp: number, freq: number, layer: number) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 8) {
      const wx = x + camX * par
      let y = h * base - Math.sin(wx * freq) * amp - Math.sin(wx * freq * 2.7) * amp * 0.4
      if (th.hillShape === 'jagged') y -= Math.abs(((wx * freq * 6) % 2) - 1) * amp * 0.9
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.fill()
    if (th.hillShape === 'pines') {
      // a row of pines along the ridge
      for (let x = -20; x <= w + 20; x += 18 + layer * 6) {
        const wx = x + camX * par
        const seed = Math.floor(wx / (18 + layer * 6))
        if (rand(seed + layer * 99) < 0.35) continue
        const y = h * base - Math.sin(wx * freq) * amp - Math.sin(wx * freq * 2.7) * amp * 0.4
        const ph = (22 + rand(seed) * 18) * (1 - layer * 0.25)
        ctx.beginPath()
        ctx.moveTo(x - ph * 0.3, y + 4)
        ctx.lineTo(x, y - ph)
        ctx.lineTo(x + ph * 0.3, y + 4)
        ctx.fill()
      }
    }
  }
  if (th.hillShape === 'cave') {
    // rock silhouettes hanging from above and rising from below
    ctx.fillStyle = th.hills[0]
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let x = 0; x <= w; x += 10) {
      const wx = x + camX * 0.2
      ctx.lineTo(x, h * 0.12 + Math.abs(Math.sin(wx * 0.013)) * h * 0.14 + Math.sin(wx * 0.05) * 6)
    }
    ctx.lineTo(w, 0)
    ctx.fill()
  }
  hill(th.hills[0], 0.15, 0.62, h * 0.06, 0.004, 0)
  hill(th.hills[1], 0.3, 0.75, h * 0.05, 0.007, 1)
}

/** Falling / drifting particles in front of the sky (screen space, stateless). */
export function drawAmbient(ctx: CanvasRenderingContext2D, th: Theme, w: number, h: number, camX: number, now: number) {
  const a = th.ambient
  if (!a) return
  ctx.fillStyle = a.color
  for (let i = 0; i < a.count; i++) {
    const sp = 0.4 + rand(i + 7) * 0.8
    let x: number
    let y: number
    const t = now * 0.001 * sp
    if (a.kind === 'snow') {
      x = rand(i) * w + Math.sin(t * 1.5 + i) * 20 - camX * 0.3
      y = ((rand(i + 3) * h + t * 40) % (h + 20)) - 10
    } else if (a.kind === 'petals') {
      x = rand(i) * w + t * 30 - camX * 0.4
      y = ((rand(i + 3) * h + t * 25 + Math.sin(t * 2 + i) * 10) % (h + 20)) - 10
    } else {
      // spores / embers rise slowly
      x = rand(i) * w + Math.sin(t + i) * 15 - camX * 0.35
      y = h - ((rand(i + 3) * h + t * 18) % (h + 20)) + 10
    }
    x = ((x % (w + 20)) + w + 20) % (w + 20) - 10
    ctx.globalAlpha = a.kind === 'spores' ? 0.25 + 0.35 * Math.abs(Math.sin(t * 3 + i)) : 0.7
    if (a.kind === 'petals') {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(t * 2 + i)
      ctx.beginPath()
      ctx.ellipse(0, 0, 3.5, 1.8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.arc(x, y, a.kind === 'snow' ? 1.2 + rand(i) * 1.4 : 1.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}

/** Soft drifting mist in the lower half of the screen. */
export function drawFog(ctx: CanvasRenderingContext2D, th: Theme, w: number, h: number, camX: number, now: number) {
  if (!th.fog) return
  ctx.fillStyle = th.fog
  for (let band = 0; band < 3; band++) {
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 16) {
      const wx = x + camX * (0.5 + band * 0.2) + now * 0.01 * (band + 1)
      ctx.lineTo(x, h * (0.55 + band * 0.1) + Math.sin(wx * 0.004 + band) * h * 0.04)
    }
    ctx.lineTo(w, h)
    ctx.fill()
  }
}

// ---------- ground and ceiling decor (world space) ----------

/** Decor growing on an exposed rock top. lean(bx) bends things away from the wisp. */
export function drawGroundDecor(ctx: CanvasRenderingContext2D, th: Theme, tx: number, top: number, T: number, now: number, lean: (bx: number) => number) {
  const seed0 = tx * 31 + Math.floor(top)
  if (th.ground === 'snow') {
    // snow drift bumps and the odd sparkle
    ctx.fillStyle = th.groundColor
    ctx.beginPath()
    ctx.ellipse(tx * T + T / 2, top, T * 0.55, 3 + rand(seed0) * 3, 0, Math.PI, 0)
    ctx.fill()
    if (rand(seed0 + 5) > 0.7) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 0.005 + tx)
      ctx.fillRect(tx * T + rand(seed0 + 2) * T, top - 4, 1.5, 1.5)
      ctx.globalAlpha = 1
    }
    return
  }
  if (th.ground === 'crystals') {
    if (rand(seed0) > 0.55) {
      const n = 2 + Math.floor(rand(seed0 + 1) * 3)
      for (let i = 0; i < n; i++) {
        const bx = tx * T + 4 + rand(seed0 + i) * (T - 8)
        const hh = 5 + rand(seed0 + i + 9) * 11
        const col = rand(seed0 + i + 3) > 0.5 ? th.buds[0] : th.buds[1]
        ctx.globalAlpha = 0.55 + 0.25 * Math.sin(now * 0.003 + bx)
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.moveTo(bx - 3, top)
        ctx.lineTo(bx + (i - 1) * 1.5, top - hh)
        ctx.lineTo(bx + 3, top)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    return
  }
  // blade-based grounds
  const dry = th.ground === 'drygrass'
  const blades = th.ground === 'ferns' ? 2 : 4
  ctx.strokeStyle = th.groundColor
  ctx.lineWidth = 1.5
  for (let i = 0; i < blades; i++) {
    const seed = tx * 7 + i
    const bx = tx * T + 3 + i * (T / blades) + rand(seed) * 4
    const hgt = (dry ? 8 : 5) + rand(seed + 50) * (dry ? 12 : 8)
    const l = Math.sin(now * 0.0018 + bx * 0.05) * 2.2 + lean(bx)
    ctx.globalAlpha = 0.55 + rand(seed + 9) * 0.4
    ctx.beginPath()
    if (th.ground === 'ferns') {
      // a curled frond
      ctx.moveTo(bx, top)
      ctx.quadraticCurveTo(bx + l * 0.4, top - hgt, bx + l + 6, top - hgt * 1.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(bx + l + 6, top - hgt * 1.2 + 2.5, 2.5, Math.PI, Math.PI * 2.6)
      ctx.stroke()
    } else {
      ctx.moveTo(bx, top)
      ctx.quadraticCurveTo(bx + l * 0.3, top - hgt * 0.6, bx + l, top - hgt)
      ctx.stroke()
    }
    if (rand(seed + 77) > (dry ? 0.8 : 0.93)) {
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(now * 0.003 + seed)
      ctx.fillStyle = seed % 2 ? th.buds[0] : th.buds[1]
      ctx.beginPath()
      ctx.arc(bx + l, top - hgt - 1.5, dry ? 1.6 : 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
  if (th.ground === 'mushrooms' && rand(seed0 + 11) > 0.72) {
    // a glowing mushroom
    const mx = tx * T + 6 + rand(seed0 + 12) * (T - 12)
    const mh = 6 + rand(seed0 + 13) * 7
    const col = rand(seed0 + 14) > 0.5 ? th.buds[0] : th.buds[1]
    ctx.fillStyle = '#e8d8b8'
    ctx.fillRect(mx - 1, top - mh, 2, mh)
    ctx.shadowColor = col
    ctx.shadowBlur = 10
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(now * 0.002 + mx)
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.ellipse(mx, top - mh, 5 + mh * 0.25, 3.5, 0, Math.PI, 0)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }
}

/** Decor hanging under an exposed rock bottom. */
export function drawCeilingDecor(ctx: CanvasRenderingContext2D, th: Theme, tx: number, bottom: number, T: number, now: number) {
  const seed = tx * 13 + Math.floor(bottom) * 7
  if (rand(seed) < (th.ceiling === 'vines' ? 0.7 : 0.55)) return
  const x = tx * T + 6 + rand(seed + 1) * 20
  const len = 8 + rand(seed + 2) * 20
  const sway = Math.sin(now * 0.0012 + x * 0.1) * 3
  ctx.strokeStyle = th.ceilingColor
  ctx.fillStyle = th.ceilingColor
  if (th.ceiling === 'vines' || th.ceiling === 'roots') {
    const thick = th.ceiling === 'roots'
    ctx.globalAlpha = 0.8
    ctx.lineWidth = thick ? 3 : 1.5
    ctx.beginPath()
    ctx.moveTo(x, bottom)
    ctx.quadraticCurveTo(x + sway * 0.4, bottom + len * 0.5, x + sway, bottom + len * (thick ? 1.3 : 1))
    ctx.stroke()
    if (thick) {
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x + sway * 0.2, bottom + len * 0.45)
      ctx.quadraticCurveTo(x + 6, bottom + len * 0.6, x + 9 + sway, bottom + len * 0.85)
      ctx.stroke()
    } else {
      ctx.fillStyle = th.groundColor
      ctx.beginPath()
      ctx.arc(x + sway, bottom + len, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    // stalactites / icicles / crystals: hanging spikes (decor only)
    const n = th.ceiling === 'icicles' ? 3 : 2
    for (let i = 0; i < n; i++) {
      const sx = x + i * 7 - 6
      const sl = len * (0.5 + rand(seed + i + 3) * 0.6)
      ctx.globalAlpha = th.ceiling === 'crystals' ? 0.6 + 0.2 * Math.sin(now * 0.003 + sx) : 0.85
      if (th.ceiling === 'crystals') ctx.fillStyle = rand(seed + i) > 0.5 ? th.buds[0] : th.ceilingColor
      ctx.beginPath()
      ctx.moveTo(sx - (th.ceiling === 'icicles' ? 2 : 3.5), bottom)
      ctx.lineTo(sx, bottom + sl)
      ctx.lineTo(sx + (th.ceiling === 'icicles' ? 2 : 3.5), bottom)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}

/** A body of water: '~' tiles. Solid underfoot (the wisp skims it), drawn as rippling water. */
export function drawWater(ctx: CanvasRenderingContext2D, th: Theme, px: number, py: number, T: number, surface: boolean, now: number) {
  ctx.fillStyle = th.water.body
  ctx.fillRect(px, py, T, T)
  if (!surface) return
  ctx.strokeStyle = th.water.top
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  for (let x = 0; x <= T; x += 4) {
    const y = py + 2 + Math.sin((px + x) * 0.18 + now * 0.004) * 1.5
    if (x === 0) ctx.moveTo(px + x, y)
    else ctx.lineTo(px + x, y)
  }
  ctx.stroke()
  // shimmer
  ctx.globalAlpha = 0.25 + 0.2 * Math.sin(now * 0.003 + px)
  ctx.fillStyle = th.water.top
  ctx.fillRect(px + ((now * 0.02 + px) % T), py + 6, 6, 1.5)
  ctx.globalAlpha = 1
  ctx.lineWidth = 1
}
