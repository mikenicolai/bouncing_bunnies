# Wildwood bosses · painted animation study

Source drawings: `wood-rookie-sketch-source.jpg` and `wood-giant-sketch-source.jpg`, copied unchanged from the two user attachments. Built-in imagegen produced the painted sheets using the existing tree goblin as the style reference. Exact prompts and layout revisions are recorded in [wood-boss-generation-prompts-v1.md](wood-boss-generation-prompts-v1.md).

Final art: `wood-rookie-v2.png` and `wood-giant-v2.png`, each 1448 × 1086 RGBA, with twelve poses in four columns and three rows. The generated files remain unchanged. **Use the reviewed rectangles and foot anchors in `WoodBossAnimation.atlas`; do not divide the sheets into equal cells.** Rectangles preserve complete feet, clubs, diamonds, swipe effects and rubble; per-pose anchors keep the body planted rather than following the bounding-box center of extended weapons.

Preview: [wood-boss-animation.html](../previews/wood-boss-animation.html). Renderer: [wood-boss-animation-v1.js](wood-boss-animation-v1.js). The complete demonstration lasts 28.8 seconds. The small boss displays five hearts and the giant displays eight. The small boss is 112 world units tall; the giant is 336 units tall, including its floating diamond. This is the requested 3:1 standing-height ratio. Both directions, pause/restart, quarter-speed playback, timeline scrubbing, and individual actions are available. Reduced-motion preference starts paused and suppresses earthquake camera shake.

| Pose | Small stone boss | Forest giant |
| --- | --- | --- |
| 0 | Idle | Idle |
| 1 | Breathing | Breathing |
| 2 | Step study A | Step study A |
| 3 | Step study B | Step study B |
| 4 | Swipe windup | Rock windup |
| 5 | Swipe | Rock release |
| 6 | Hurt | Raised stomp / club windup |
| 7 | Crouch / glowing cracks | Earthquake impact |
| 8 | Splitting into chunks | Mountain summon windup |
| 9 | Shattering | Summon follow-through |
| 10 | Falling rubble | Hurt |
| 11 | Settled rubble | Kneeling defeat |

The 16 review views include a comparison, the full sequence, and fourteen individual actions. Walk loops blend the complete neutral and two step paintings, preserving curved silhouettes without separately rotated rectangular legs. Standing poses share a normalized height; short eased blends are composed on a cached additive Canvas surface so overlapping bodies stay opaque. Collapse and rubble retain their authored heights. Other character actions use complete painted poses, with the released rock excluded from the throw-pose crop and animated independently. Debris particles sample the original gray stone feet and moss cap without sampling facial features. Assembly carries those fragments upward and introduces more slabs from a wider patch of ground. Forty parts of the giant’s original painting assemble from the feet upward, finishing with its crown and diamond. Original painted materials remain visible throughout.

The original rendered 24 FPS study of the full sequence is saved as [wood-boss-animation-v1.webm](../previews/wood-boss-animation-v1.webm). The [contact sheet](../previews/wood-boss-animation-contact-sheet.png) shows the size comparison, shatter stages, construction stages, and each major attack.

Rock throwing adds a rotating painted stone projectile on a ballistic arc. The earthquake follows an 850ms windup with a stomp, ground ripples, bouncing stones and a brief shake. Mountain summoning creates a pulsing red patch at the giant’s old position at 300ms; the giant steps aside, peaks begin rising at 1.65 seconds, reach full height at 2.4 seconds, start retreating at 3.55 seconds and disappear by 4.9 seconds. The playable encounter follows these timings but fixes the warning at the bunny’s position when the attack begins, allowing the bunny to escape before the peaks rise. Its fourth attack has a 650ms vine windup, then reaches toward the bunny and pulls a caught target for at most 850ms. Jumping or throwing a ready knife releases the grab. The vine retracts completely and resets with the fight.

The two-stage encounter is now installed at the end of Wildwood in `index.html`, with five rookie hearts and eight giant hearts, an enlarged flat arena, telegraphed attacks, and a boss-gated exit. The runtime embeds both final PNGs and the reusable animation and encounter source. [Play the actual fight](../previews/wood-boss-fight.html). `tests/wood-boss-fight.cjs` checks combat, transformation, hazard avoidance, gate completion and restart at 30/60/120 FPS; `tests/wood-boss-browser.cjs` checks real artwork and desktop/phone rendering.

Verification: `node tests/wood-boss-animation.cjs` checks the size ratio, ordered transformation, and valid frames at 30/60/120 FPS. With Playwright available, `node tests/wood-boss-animation.cjs --browser` renders every view in both directions, checks controls and phone overflow, and saves desktop / phone review screenshots plus `previews/wood-boss-animation-contact-sheet.png`.

Tempest keeps its original source PNG. Registered face centers and reviewed horizontal crops remove pose drift and adjacent-wing bleed. A feathered neutral face remains steady while the complete wing/vortex paintings blend. Slow sway and bob continue between poses; its health and wind-star balance are unchanged. `previews/boss-refinements.html` shows both bosses in the actual runtime. `tests/boss-smoothing-browser.cjs` verifies opaque mixing and pixel continuity at gait/frame boundaries, then captures the vine, bunny-targeted spike warning and Tempest.
