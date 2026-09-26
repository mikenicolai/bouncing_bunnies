# Sea-floor pirate skeleton v1

`pirate-skeleton-v1.png` is a transparent 1536 × 1024 sheet in a four-column by two-row grid. The built-in ImageGen tool used the user's `Photo 1.jpg` as the primary character reference and `pink-ear-bunny-v2.png` as the game's rendering-style reference. A second ImageGen pass tightened cell spacing so sword tips do not appear in neighboring frames. The selected final sheet is embedded in `index.html`.

The pirate keeps the drawing's long skull, slanted eyes, blue-and-white checked bandana with a blue tie, exposed ribs, torn orange clothes, left hook and right cutlass.

| Frames | Animation |
| --- | --- |
| 0–3 | Small planted steps and side-to-side sway |
| 4 | Hook reaches left; brief warning before its hit window |
| 5 | Cutlass rises on the right |
| 6 | Cutlass crosses in front and toward the left |
| 7 | Cutlass reaches right, then returns to idle |

The sprite's feet are anchored to the sea floor. Each pirate patrols only 30 world units either side of its starting point. A nearby bunny triggers the 0.8-second swing cycle; its active weapon hitboxes extend beyond the body. A landed Hit interrupts the swing and stuns the pirate. Pirates retain two hearts.

## Final prompt set

**Generation:** Use the user's drawing as the exact design reference for a tall skinny skeleton pirate with a long narrow white skull, vertical jaw marks, slanted eyes, blue-and-white checked bandana and loose blue tie, ragged orange coat and trousers over visible ribs, dark hook-like left hand, and curved silver cutlass in the right hand. Match the original bunny sheet's friendly hand-painted cartoon style, organic near-black outlines and soft shading. Create one truly transparent 4 × 2 sprite sheet with eight full-body poses and fixed foot baseline: four subtle planted sway/step poses, followed by four hook-and-cutlass swing poses reaching left, crossing the body and reaching right. Keep every weapon complete within its frame; no water, scenery, text, grid or extra characters.

**Spacing revision:** Preserve the exact painted pirate design and eight poses from the first sheet. Change only pose size and spacing so each full sword, hook, shoe and shadow stays within its own 4 × 2 grid cell, with transparent separation. Keep the same foot baseline and transparent background.
