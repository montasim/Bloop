# Bloop: 30-level roadmap

Each level is one file in `src/game/levels/`, registered in order in `src/game/levels/index.ts`.
Every level must have a bot playthrough in `scripts/playthrough.ts` that collects **all motes** and reaches the gate,
so `pnpm check:game` proves each level is completable. For left-to-right levels, `node scripts/solve-level.ts <id>`
searches a route and prints a ready-made `jumpsBot([...])` entry. For levels with springboards or other stop-and-think
spots, chain hand-written steps from `scripts/bot.ts` (`springboard`, `settleAt`) with segments found by
`solveSegment` in `scripts/solve-segment.ts`, which starts searching from wherever those steps leave the ball.

## Building levels in parallel (batches of 3)

Each level owns exactly two files: `src/game/levels/<id>.ts` and `scripts/bots/<id>.ts`.
Before a batch, the integrator registers placeholder versions of all three (flat run, reserved width range, theme)
in `src/game/levels/index.ts` and `scripts/bots/index.ts`, so builders never touch shared files.
Builders verify their own level with `LEVEL=<id> node scripts/check-game.ts` and `LEVEL=<id> node scripts/playthrough.ts`;
the integrator then runs the full `pnpm check:game`, builds, and updates this roadmap.

Batch 1 (done): #7 Prism Bridges (lagoon), #8 Colour Steps (canyon), #9 Beetle Prism (bloom).
Batch 2 (done): #10 Lantern Run (autumn), #11 Upside Down (rift), #12 Ceiling Thorns (grotto).
Batch 3 (done): #13 Flip Flop (abyss), #14 Inverted Prism (tundra), #15 Moon Hall (moonhall).
Batch 4 (done): #16 Heavy Stone (quarry), #17 Stepping Stones (marsh), #19 Crate & Colour (ruins).
Batch 5 (done): #20 Burrow Works (burrow), #21 Echo Caves (echo), #22 Thorn Garden (thornwood). playthrough.ts now allows 300 s of game time (Burrow Works waits on beetle patrols, ~171 s).
Batch 6 (done): #23 Twin Gravity (starfield), #24 Prism Maze (mirage), #25 The Undergrowth (undergrowth). Watch: Prism Maze is 12 rooms on one frame (bridge / low lane / roof loop-back), and The Undergrowth reuses section geometry from Burrow Works, Moon Hall and Thorn Garden.
Batch 7 (done): #26 Swift Roots (daybreak), #27 Thousand Thorns (bramble), #28 Starfall Shaft (starfall). New check every level should get: respawn at rest on each lantern (its colour, gravity down) and prove a route to the next one — flow levels can hide lines that only work with a run-up. Swift Roots and Thousand Thorns were proven this way; Starfall Shaft was idle-tested and sweep-tested from every lantern.
Batch 8 (done, all 30 built): #29 Last Lantern (lastlight), #30 Dawn Gate (dawngate). Both proven restartable from rest on every lantern. Last Lantern lanterns stand on rock (in a curtain where the next stretch needs a colour), so a wrong-colour respawn can't loop. Finishing #30 shows the "Dawn reached" ending with total motes and "Start again from level 1".
Crate design lessons: fence puzzles with 2-wide colour columns (crates stop, the wisp in the other colour passes) so a crate can always be pushed back; every wrong push/order must leave a route or a reachable reset hazard (tested per puzzle).
Crate physics fixes (regression tests in check-game): a pushed crate stops at a live beetle; pushing needs the wisp on the ground; a crate steps over lips up to 3 px, so it slides across a crate sitting in a 1-wide slot. All crate levels re-proven; the L16/L17 wrong-push cases still end in a reset or an escape. Night Garden now sits in its planned #18 slot. Crates now collide with each other (a pushed crate stops against another; a falling crate stacks).

### Physics fixes (after batch 3), with regression tests in scripts/check-game.ts
- Bounce: restitution ramps smoothly between impacts of 230 and 250 px/s (was a hard cutoff at 240), so 4-row tube flips no longer coin-flip a second bounce.
- Coyote time: a colour change that removes the floor under you cancels it (old engine let a jump fire after the floor vanished). Gravity flips are unaffected.
- Corners: impacts over 750 px/s total (big falls) onto an outer corner absorb instead of flinging sideways (was up to ~650 px/s); corners on seams between solid tiles act flat. Ordinary jumps (~620 total) are unaffected.
- Every level was re-proven afterwards (bots replay exact timings, so routes had to be re-solved; layouts unchanged except: one Night Garden mote moved onto the new bounce line, and in Moon Hall one curtain and one trap curtain moved a tile so its two tightest jumps went from 50 ms back to 108-117 ms; soft-lock sweep re-run, 0 soft-locks).
- Tooling idea still open: solveSegment could test beetle timings and start offsets and prefer wide windows; level-difficulty.ts could shift presses by frame (buffer/coyote aware).

Rules for every level:
- 16 tiles tall (camera fits this height to the screen); width is free.
- Controls are only roll + jump. No mechanic may need an extra key.
- Motes are score, never a requirement. The gate is always open.
- Gate sits against the end wall so it can't be overshot.
- **Levels grow**: every level is wider than the one before (rough target: 74 tiles at #1, about +12 per level, ~420 by #30).
- **Lanterns keep pace**: never more than 30 tiles between start, lanterns and gate, so bigger levels get more lanterns.
- **Difficulty rises**: wider pits, tighter landings, hazards closer together, motes on riskier lines. Check jump windows with `node scripts/level-difficulty.ts <id>`; a single jump under ~100 ms before chapter 5 is a sign to widen a landing.
- **Every level has its own look**: pass a theme to makeLevel (garden, dusk, hollow, peaks, roots, prism; see src/game/themes.ts) and add a pond or two with pond(x0, x1) on flat ground. Ponds play exactly like ground.
- Introduce one new idea per level, in a safe spot first, then test it.
- After anything that bounces you (a beetle stomp, a big landing) leave room to come down before the next hazard (a big landing bounces ~4 tiles).
- Squashed beetles regrow after 6 s (away from you) and reset on respawn, so beetle springboards can never be used up.
- Lanterns never sit next to a beetle spawn (checked): respawning resets beetles.
- Spots where a player would stop and think (lining up a jump, waiting for a beetle) get hand-written bot steps; the solver only rolls right.

| # | Name | New idea | Status |
|---|------|----------|--------|
| **Chapter 1: First Steps** ||||
| 1 | First Light | roll, jump, motes, hint signs | ✅ built (74 wide, 2 lanterns, 11 motes) |
| 2 | Thorn Path | thorn pits, stepping pillars, low roof (hop short), long leap | ✅ built (104 wide, 4 lanterns, 13 motes) |
| 3 | Beetle Hollow | beetles: stomp from above (hold jump for a higher stomp bounce); beetles guarding landings, trench, low corridor, pillars | ✅ built (124 wide, 6 lanterns, 15 motes) |
| 4 | High Hops | rising steps, optional ledge climb, beetle springboards over 4-tall walls, flat hops under hanging rock, narrow pillar stair | ✅ built (144 wide, 7 lanterns, 17 motes) |
| 5 | Root Maze | chapter test: beetle on a landing, beetle trench into a springboard onto a guarded shelf, beetle islands in a thorn field, low corridor with pits + beetles, beetles on stair treads | ✅ built (164 wide, 8 lanterns, 20 motes) |
| **Chapter 2: Two Lights** ||||
| 6 | Two Lights | colour curtains + walls, colour bridge with a beetle, colour roof, trap curtain, narrow colour platforms (mid-air swaps, beetle on one), beetle pens, colour stair | ✅ built (176 wide, 9 lanterns, 21 motes) |
| 7 | Prism Bridges | gapped multi-colour bridges, mid-air swaps, beetle bridges with ghost bumps, 3-curtain trap bridge (tap, don't hold), bridges at 4 heights, thorn roofs, ledge gate (lagoon) | ✅ built (195 wide, 10 lanterns, 27 motes) |
| 8 | Colour Steps | colour stairs up/down with mid-air swaps, early-swap trap curtains, colour roof + tower, high cyan bridge with beetle, climb to the canyon rim (canyon) | ✅ built (207 wide, 13 lanterns, 27 motes); timing is lenient (held-jump bounces climb stairs): tighten later |
| 9 | Beetle Prism | beetles on ghost bridges, coloured springboard pens, springboards through curtains, held-stomp colour swap onto a ledge, low beetle corridor with trap, pillar stomps (bloom) | ✅ built (214 wide, 12 lanterns, 27 motes, 10 beetles) |
| 10 | Lantern Run | chapter test: gapped colour bridges under thorn roofs, tap-tap-tap trap bridge, colour roof + tower, narrow colour stairs, beetle corridor, springboard through a curtain, beetle bridge finale (autumn) | ✅ built (226 wide, 15 lanterns, 31 motes; tightest jump ~133 ms) |
| **Chapter 3: Upside Down** ||||
| 11 | Upside Down | gravity intro, roof roads over thorn pits, jump into an up-light mid-air, colours while inverted, springboard into a high up-light, up-down-up, finale (rift) | ✅ built (244 wide, 16 lanterns, 32 motes; tightest ~101 ms; 0 soft-locks in 660 runs) |
| 12 | Ceiling Thorns | long roof runs with hanging thorn patches, low "zipper" tubes (up/down/up) with thorns both sides, beetle pens below a thorny roof, colour traps while inverted (grotto) | ✅ built (257 wide, 17 lanterns, 35 motes; tightest ~107 ms; 0 soft-locks in 1272 runs) |
| 13 | Flip Flop | ping-pong tubes, shafts between an upper and lower lane, flip-flop over a thorn pit, roof run over a beetle lane (abyss) | ✅ built (269 wide, 19 lanterns, 39 motes; tightest ~80 ms; 0 soft-locks in 1528 runs) |
| 14 | Inverted Prism | coloured roof roads ridden inverted (wrong colour drops you up), mid-air colour swap + flip, colour seams, finale tube: 2 colour changes + 4 flips (tundra) | ✅ built (281 wide, 20 lanterns, 40 motes; tightest ~100 ms; 0 soft-locks in 1728 runs) |
| 15 | Moon Hall | chapter test: springboard into an up-field, colour roofs inverted, zipper tube, the thorn hall (floor/roof alternate every ~10 tiles), springboard-through-curtain finale (moonhall) | ✅ built (292 wide, 21 lanterns, 42 motes; tightest ~67 ms; 0 soft-locks in 1680 runs) |
| **Chapter 4: Heavy Stones** ||||
| 16 | Heavy Stone | crate intro; crates down shafts as tunnel bridges; overhang (don't push too far); two crates, one notch (order); beetle island; springboard + tunnel crate; drop bridge into a thorn pit; 2-crate finale. Crate puzzles fenced by 2-wide colour columns so crates can always be pushed back (quarry) | ✅ built (296 wide, 25 lanterns, 51 motes, 11 crates; tightest ~101 ms) |
| 17 | Stepping Stones | push-order jams, 2-high stack dropped through a lip tunnel, 4-crate marsh bridge under a thorn roof, colour + beetle crate room, 3-crate stack finale (marsh) | ✅ built (312 wide, 26 lanterns, 54 motes, 13 crates; tightest ~95 ms) |
| 18 | Night Garden | everything so far (the original prototype level) | ✅ built (in its planned #18 slot) |
| 19 | Crate & Colour | crates stopped by colour walls you pass through, crates riding ghost bridges, colour-gated pens, coloured shelf stacking, crate-penned springboard, 2-crate finale with a reset spike (ruins) | ✅ built (320 wide, 27 lanterns, 55 motes, 10 crates; tightest ~83 ms) |
| 20 | Burrow Works | crates + beetles: crate-penned springboard, beetle stops a crate (no-hold stomp under thorns), overhang drop pens a trench beetle, guarded shelf, crate shield down a thorn burrow, combo finale (burrow) | ✅ built (330 wide, 28 lanterns, 59 motes, 9 crates, 15 beetles; tightest ~113 ms; every wrong push tested) |
| **Chapter 5: Deep Garden** ||||
| 21 | Echo Caves | echoes: each challenge first safe, then harder — hop pits, roof roads, springboard through a curtain, colour bridges (then inverted), crate over a colour bridge, beetle island (echo) | ✅ built (349 wide, 30 lanterns, 64 motes, 4 beetles, 2 crates; tightest ~130 ms, 89 ms on a mote line; 0 soft-locks in 6000 gravity + 2000 crate runs) |
| 22 | Thorn Garden | precision: 1-wide stones over thorns, thorn roofs (tap hops), long leaps onto 2-wide islands, stomp chains on beetle stones, colour platforms over thorns, thorn hall, colour stair (thornwood) | ✅ built (360 wide, 34 lanterns, 69 motes, 6 beetles; tightest ~71 ms; 0 soft-locks in 600 runs) |
| 23 | Twin Gravity | gravity + crates (crates always fall): knock perched stones off from the roof, stone chutes that plug thorn slots, 2-tall stacks knocked down, crates as steps up into high up-lights, 2-stone stack finale (starfield) | ✅ built (368 wide, 35 lanterns, 73 motes, 13 crates; tightest ~107 ms; 0 soft-locks in 2200 gravity runs, wrong pushes swept) |
| 24 | Prism Maze | branching lanes: 12 fork rooms, your colour picks the bridge or the low lane, an inverted roof road loops back to take the other (mirage) | ✅ built (384 wide, 37 lanterns, 79 motes, 9 beetles; tightest ~107 ms survival, 71 ms on a mote line; 0 soft-locks in 1344 runs) |
| 25 | The Undergrowth | chapter test: tap-hop colour stones under thorn roofs, crate over a colour bridge, stomp chain into an up-light, crate-penned springboard through a curtain, inverted colour roads, zipper tube, colour stair, finale (undergrowth) | ✅ built (397 wide, 40 lanterns, 83 motes, 3 crates, 13 beetles; tightest ~67 ms; 0 soft-locks in 1600 runs) |
| **Chapter 6: Dawn** ||||
| 26 | Swift Roots | speed and flow: landing-fed stride chains, held bounce lines over thorn beds, colour stride under a thorn roof, roof rides with thorn gaps, stomps in stride, thorny burrow, leaps (daybreak) | ✅ built (406 wide, 41 lanterns, 88 motes, 4 beetles; bot never stops, 47.6 s; tightest ~75 ms; every lantern restartable from rest; 0 soft-locks in 1750 runs) |
| 27 | Thousand Thorns | hard precision: briar stones, thorn floor + roof seams, hold-gauged climbs, tap vs held stomps under thorn roofs, thorn zipper, height-picked colour windows, needles, inverted bramble, flip stones (bramble) | ✅ built (418 wide, 43 lanterns, 92 motes, 7 beetles; tightest ~67 ms, hold tolerance ≥0.05 s; every lantern restartable; 0 soft-locks in 1200 runs) |
| 28 | Starfall Shaft | gravity mastery: fall up through curtains, the comb shaft, starlight bridges (hover seams where a down-light sits on an up-light), chimneys steered mid-fall, inverted colour road, beetle drops, flip chains at full roll, prism climb, star stair (starfall) | ✅ built (428 wide, 45 lanterns, 97 motes, 3 beetles; jumps ≥196 ms but chimneys need roll-speed control; 0 soft-locks in 5550 final runs) |
| 29 | Last Lantern | everything, long: briar road, beetle ridge, prism bridges, roof roads, stone works, deep garden, dawn run, home meadow (lastlight) | ✅ built (440 wide, 47 lanterns, 102 motes, 3 crates, 13 beetles; tightest ~92 ms, tight hold bands; 0 soft-locks in 3200 gravity runs; beetle legs work after any 0–12 s wait) |
| 30 | Dawn Gate | finale: springboard roof ride, crate on a vanishing bridge, starlight tunnel, stomp chain, flip ladder, prism stair, crate slot, night watch, flow line, then a calm dawn meadow (dawngate) | ✅ built (456 wide, 50 lanterns, 108 motes, 2 crates, 8 beetles; tightest ~83 ms (108 ms survival); 0 soft-locks in 1560 gravity + 1200 crate runs) |
