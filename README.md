# Elemental Bunnies

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

The playable character uses the six-pose sketch-derived sprite sheet preserved in `assets/main-character-source.png` (1774 × 887, RGB). Its bytes are embedded in `index.html`, so the assets folder is not needed to distribute or play the game. During loading, Canvas removes the connected pale checkerboard around each outlined character and prepares six cached frames. `CHARACTER_FRAMES` defines individual crops; poses map to idle, two walking frames, ascent, descent, and attack, with horizontal mirroring for leftward movement. The original collision box and jump physics are unchanged.

The game is entirely contained in `index.html`, including CSS and JavaScript. The current graphics are original Canvas-drawn placeholders. Colors and visual rendering are isolated in `THEME` and the `draw*` functions in the embedded script, while level geometry and gameplay remain separate. This keeps the visual layer straightforward to replace once reference artwork is available.
