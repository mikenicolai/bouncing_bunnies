# Wildwood throwing knives

Three small steel blades with wooden grips and green guards are drawn directly with Canvas paths in the woodland palette. `wood-throwing-knives-v1.js` is embedded verbatim in `index.html` between the `WILDWOOD_KNIVES` markers. The same drawing supplies the hidden pickups, spinning projectiles, held knife, return flourish and inventory icons.

The three pickups sit at x=6475, 6540 and 6605 on a hidden tree bough at y=-1400, 150 pixels beneath the final approach branch. Drop left from the approach to the preceding branch, then walk off that branch's right end onto the lower bough. Collect the knives individually and use the standard boosted jump to return. The ledge is drawn as a rooted tree using the existing Wildwood atlas.

The inventory holds three slots. Picking up a knife equips the weapon. X/F or the touch THROW button launches a ready knife at 680 world pixels/second in the direction the bunny faces; the throw cooldown is 0.45 seconds. Z or the touch STOW/EQUIP button restores punching or equips knives. Jumping and ducking retain their normal behavior; ducking blocks throws.

Each thrown knife has its own five-second timer, beginning at release. Hits, terrain collisions and misses leave the knife unavailable until that timer expires, then it returns automatically. The final half-second has a short return flourish near the bunny. Inventory icons dim and show the remaining seconds. Pausing freezes the timers. Restart clears all ownership and restores the three pickups.

Swept segment collision resolves the first solid platform, living goblin or active boss encountered, so cliffs block throws and low frame rates cannot skip targets. Each knife removes one goblin or boss heart, respecting hurt immunity. The small boss also accepts punches and stomps. The giant requires five knife hits. Its transformation and collapse cannot be damaged. The boss gate remains sealed until the giant is defeated.

`tests/wood-knives.cjs` checks the actual detour and return, inventory cap, separate return timing, left/right hits, cliff blocking, goblin damage, giant armor, pause/stow/jump/reset and embedded-source parity at 30/60/120 FPS on phone and desktop. `tests/wood-knives-browser.cjs` checks the actual drawing and installed keyboard/touch listeners. `previews/wood-knives.html` offers the pickup detour and a practice giant fight; the practice fight provides three knives so it can be tested directly.
