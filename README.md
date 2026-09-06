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
- Restart: `R`
- Drag the on-screen joystick with a finger or mouse; use the on-screen jump button to hop.

## Art direction

Finishing the meadow opens the world map, marks the meadow finished, and offers four selectable destinations: Water (Tide Pools), Fire (Ember Peaks), Plants / Earth (Wildwood), and Air (Cloud Paths). These lead to the locked final villain map. Destination selections currently show descriptions; the four elemental levels and boss level are not yet built. The World map button also lets players inspect the route and return to their current run.

The world map uses the user-selected `assets/world-map-parchment.png` as full-panel artwork. Accessible HTML controls align with its destinations, replay, sound and fullscreen buttons; score, completion and destination details update live. Keep the assets folder alongside the HTML when hosting. The map retains its proportions in fullscreen.

The playable character uses `assets/pink-ear-bunny-v2.png`, an eight-pose sheet based on the user's pink-ear bunny drawing. It includes a running ear-flap cycle, jump/fall poses, and boxing windup/punch, mirrored to face movement direction. The sheet is embedded in `index.html`. Canvas removes the connected pale background and caches the frames; common scaling and foot anchors keep the body stable as the ears bend. See `assets/pink-ear-bunny-v2.md` for the generation brief and pose mapping. The previous character sheet is preserved in `assets/main-character-source.png`.

Game code, CSS and JavaScript are contained in `index.html`; map artwork is a local asset. Level scenery uses Canvas drawing. Colors and visual rendering are isolated in `THEME` and the `draw*` functions, while level geometry and gameplay remain separate.

Published game: <https://mikenicolai.github.io/bouncing_bunnies/>.
