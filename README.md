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

The user's rough route-plan photo inspired a 6,000-pixel aerial route with 20 cloud platforms. White clouds are solid and set safe recovery checkpoints. Blue clouds follow the user's elongated scalloped drawing, with saturated cyan fill, downward arrows and flowing wisps. Jump upward through them; descending briefly settles for 0.14 seconds, then sinks at 45 pixels/second through a 60-pixel cloud before normal falling resumes. Press Jump during contact or sinking to escape; movement and crouching do not stop sinking. The early white recovery cloud catches missed tutorial landings and sink-throughs; later blue clouds can drop you into open sky. Green clouds retain spring-coil markings and launch the bunny at 850 pixels/second. Route positions are unchanged; the original two extra jump taps remain available.

Run `node tests/blue-cloud.cjs` for sinking, jump escape, no re-grounding, crouch/movement, recovery and later-death checks at 30/60/120 FPS. `previews/blue-cloud-review.png` shows the live renderer's sinking tutorial cloud.

Three lightning hazards use the approved eight-frame transparent storm-cloud sheet (`assets/storm-cloud-v1-source.png`, provenance in `assets/storm-cloud-v1.md`), embedded in the HTML. Each 4.8-second cycle starts with 2.7 seconds quiet, then 0.8 seconds of outlined/audio warning through faint charge, internal sparks, strong charge and an emerging bolt. Only the two full-strike frames hurt: 90ms each, followed by a harmless 120ms afterglow and 1 second quiet. Frame-driven glow, charge/strike audio and strike particles are synchronized. Damage costs one life and grants 1.7 seconds of invulnerability. Positions and the 34×130px damage lanes are unchanged. Falls return to the latest safe white cloud; losing all three lives restarts the selected level. Run `node tests/storm-cloud.cjs` for source/embedding, phase/offset and damage-window checks.

Tempest has six animated tentacles and cannot be damaged by Hit. Its 6.4-second attack cycle alternates a telegraphed low sweep (duck beneath it) and a marked vertical slam (move outside the lane). Cross the arena and reach the wind gate. All attacks have safe windows; no combat is required. Touch cancellation, pointer release, and window blur release Duck. Narrow screens use larger, separated Jump / Hit / Duck controls; landscape fullscreen provides the clearest view.

## Verification

### iPhone and joystick controls

Fullscreen uses the native API where available, otherwise a fixed edge-to-edge CSS view sized to the visual viewport, with safe-area padding, orientation/resize updates and scroll restoration on exit. iPhone Safari can retain its browser bars: the title-screen hint recommends **Share → Add to Home Screen** for the best fullscreen experience. Saved standalone apps start fitted to the available viewport. The exit toggle always remains available; this does not promise to hide Safari chrome.

The lower-right stick moves horizontally and diagonally. Pull up beyond 60% for one Jump; return above the −25% neutral boundary before pulling up again. Existing two-boost limits still apply. Pull down beyond 55% to hold Duck; return to 25% or less to release. Separate buttons continue to work. Cancellation, lost capture, blur/visibility, reset, death and map/end overlays clear stick input.

Title build metadata is defined in `BUILD_INFO`: v0.3.1, build 2026091202, 12 September 2026, 10:32 Europe/Brussels; deployment **GitHub Pages release — 12 September 2026, 10:32 Europe/Brussels**. This is the authorized release artifact's timestamp, not the later GitHub Pages job-completion time. `tests/mobile.cjs` covers joystick and viewport state regressions; `tests/mobile-preview.html` offers iPhone/CSS/standalone emulation fixtures. Emulation does not replace a real-device Safari check.

Run `node tests/air.cjs` for collision, spring, keyboard/touch duck, hazard immunity, boss evasion, death/restart/win and meadow regression checks. `node tests/route.cjs` checks all 19 mandatory cloud transitions against the actual movement integrator (hazard timing is isolated in the mechanics suite). Serve the project and open `tests/air-preview.html` for reproducible spawn, spring, blue, lightning, boss and win visual fixtures; **Live play** resumes from the selected fixture. These tests are not loaded by the game and add no runtime dependency.

The world map uses the user-selected `assets/world-map-parchment.png` as full-panel artwork. Accessible HTML controls align with its destinations, replay, sound and fullscreen buttons; score, completion and destination details update live. The map artwork is now embedded in the HTML as well, so the single HTML file is sufficient for hosting. The map retains its proportions in fullscreen.

The playable character uses `assets/pink-ear-bunny-v2.png`, an eight-pose sheet based on the user's pink-ear bunny drawing. It includes a running ear-flap cycle, jump/fall poses, and boxing windup/punch, mirrored to face movement direction. The sheet is embedded in `index.html`. Canvas removes the connected pale background and caches the frames; common scaling and foot anchors keep the body stable as the ears bend. See `assets/pink-ear-bunny-v2.md` for the generation brief and pose mapping. The previous character sheet is preserved in `assets/main-character-source.png`.

The approved jump/crouch update is preserved unchanged at `assets/pink-ear-bunny-jump-duck-v3-source.png` (1983 × 793 RGB with baked checkerboard). Provenance and exact crop/state mapping are documented in `assets/pink-ear-bunny-jump-duck-v3.md`. The game embeds these bytes and removes the checkerboard into cached transparent Canvas frames at load time. Four poses follow takeoff/ascent/apex/descent; four lower-row poses animate duck press/hold/release. Every crouch frame preserves its natural source aspect ratio at uniform scale .22; the artwork can extend above the separate fixed-feet 18px hurtbox. Short 60ms blends smooth press/lower/hold/release, with mirrored facing. Existing v2 idle/run/boxing sprites are retained. The original standing bookends in the new source are unused. No cleaned derivative is required on disk.

The full game, CSS, JavaScript, both runtime bunny sheets and map image are embedded in `index.html`; it has no external runtime assets or dependencies. Source PNGs remain under `assets/` for maintenance. Level scenery uses Canvas drawing. Colors and visual rendering are isolated in `THEME` and the `draw*` functions, while level geometry and gameplay remain separate. `node tests/motion.cjs` checks new pose phases, collider stability and embedding. The maintained review image under `previews/` is documentation only; local capture servers and disposable review helpers are not part of the published source.

Published game: <https://mikenicolai.github.io/bouncing_bunnies/>.
