# Bouncing Bunnies

A small, original side-scrolling platform game made with the HTML5 Canvas API. It has no external runtime dependencies or borrowed game assets.

## Play

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

- Move: left/right arrow keys (or `A` / `D`)
- Jump: `W`, up arrow, or space. Tap again quickly (up to twice) for a higher jump.
- Hit: `X` or `F`
- Duck: hold down arrow / `S`, or hold the **DUCK** touch button. Release to stand. Ducking preserves foot position, reduces the hurt box from 58 to 18 pixels, limits movement, and blocks jumping/attacking.
- Restart: `R`
- Drag the on-screen joystick with a finger or mouse; use the on-screen jump button to hop.

## Art direction

Finishing a level opens the world map. **Air → Play Air level** launches Cloud Paths; **First Meadow → Playable now** returns to the original meadow. The World map button pauses the current run, which can be continued. Water, Fire, Plants / Earth, and the final villain map remain future destinations. The Air monster is separate from that final villain.

## Air — Cloud Paths

The user's rough route-plan photo inspired a 6,000-pixel aerial route with 20 cloud platforms. White clouds are solid and set safe recovery checkpoints. Blue clouds carry upward-arrow markings: jump through them from below and land on their tops while falling. An early white recovery cloud catches missed tutorial landings. Green clouds have spring-coil markings and launch the bunny at 850 pixels/second, with squash, particles, and a spring tone. Later high-to-low landings require steering/braking in flight; the original two extra jump taps remain available.

Three lightning emitters cycle every 4.8 seconds: 2.5 seconds quiet, 1 second outlined/audio warning, 0.75 seconds active, then 0.55 seconds quiet. Damage costs one life and grants 1.7 seconds of invulnerability. Falls return to the latest safe white cloud; losing all three lives restarts the selected level.

Tempest has six animated tentacles and cannot be damaged by Hit. Its 6.4-second attack cycle alternates a telegraphed low sweep (duck beneath it) and a marked vertical slam (move outside the lane). Cross the arena and reach the wind gate. All attacks have safe windows; no combat is required. Touch cancellation, pointer release, and window blur release Duck. Narrow screens use larger, separated Jump / Hit / Duck controls; landscape fullscreen provides the clearest view.

## Verification

Run `node tests/air.cjs` for collision, spring, keyboard/touch duck, hazard immunity, boss evasion, death/restart/win and meadow regression checks. `node tests/route.cjs` checks all 19 mandatory cloud transitions against the actual movement integrator (hazard timing is isolated in the mechanics suite). Serve the project and open `tests/air-preview.html` for reproducible spawn, spring, blue, lightning, boss and win visual fixtures; **Live play** resumes from the selected fixture. These tests are not loaded by the game and add no runtime dependency.

The world map uses the user-selected `assets/world-map-parchment.png` as full-panel artwork. Accessible HTML controls align with its destinations, replay, sound and fullscreen buttons; score, completion and destination details update live. Keep the assets folder alongside the HTML when hosting. The map retains its proportions in fullscreen.

The playable character uses `assets/pink-ear-bunny-v2.png`, an eight-pose sheet based on the user's pink-ear bunny drawing. It includes a running ear-flap cycle, jump/fall poses, and boxing windup/punch, mirrored to face movement direction. The sheet is embedded in `index.html`. Canvas removes the connected pale background and caches the frames; common scaling and foot anchors keep the body stable as the ears bend. See `assets/pink-ear-bunny-v2.md` for the generation brief and pose mapping. The previous character sheet is preserved in `assets/main-character-source.png`.

Game code, CSS and JavaScript are contained in `index.html`; map artwork is a local asset. Level scenery uses Canvas drawing. Colors and visual rendering are isolated in `THEME` and the `draw*` functions, while level geometry and gameplay remain separate.

Published game: <https://mikenicolai.github.io/bouncing_bunnies/>.
