# Pink-ear bunny swim and dive sheet v1

`pink-ear-bunny-swim-v1.png` is a transparent 1536 × 1024, four-column by two-row sprite sheet. It is embedded in `index.html` so the game remains a single-file runtime.

The original `pink-ear-bunny-v2.png` is the primary style reference. The user's attached hand drawing, `Photo 1.jpg`, is the diving-pose reference. The sheet was created with the built-in ImageGen tool. The original bunny's cream body, pink inner ears, dark outline, simple eyes, one-tooth smile, oval belly, and rounded paws are preserved.

| Frame | Use |
| --- | --- |
| 0–3 | Horizontal swim cycle with alternating paws and feet and changing ear bends |
| 4–5 | Downward dive cycle |
| 6 | Underwater hit windup |
| 7 | Underwater forward punch |

The runtime selects frames from movement, dive input, and attack time. It mirrors all frames for leftward movement. While the sheet loads, it briefly shows a pose from the original painted bunny sheet.

## Final generation prompt

Use case: stylized-concept. Asset type: production 2D game sprite sheet for the Bouncing Bunnies water level. Image 1 is the primary exact character and rendering style reference: preserve the same cream-white bunny, bold slightly organic black outlines, long pink inner ears, simple vertical eyes, open black smile with one white tooth, oval cream belly, rounded paws, and clean soft hand-painted cartoon shading. Image 2 is the user's pose/concept reference for underwater swimming: bunny oriented toward the right, ears swept backward, body angled in a dive, front arm extended, feet kicking. Generate one transparent PNG sprite sheet with exactly eight separate full-body poses in a strict four-column by two-row grid, equal cell size, generous separation and no overlap between cells. Top row frames 1–4: seamless horizontal swimming cycle facing right; body, head and face stay consistently placed and sized, alternating forward arm paddles, rear foot kicks, and ears bending and bouncing at different phases. Bottom row frames 5–6: diving downward poses with forward-reaching paws and ears streaming upward and back; feet different between frames. Bottom row frames 7–8: underwater hitting poses, first fist pulled back then a clear forward punch, while feet and ears continue their swimming motion. All poses use exactly the same bunny design and scale as Image 1; horizontal side view, expressive but readable at small game size. Transparent background, isolated character in each cell, no scenery, water, bubbles, text, letters, labels, border, checkerboard, or extra characters. The swim poses should look like newly painted poses for the existing Image 1 sheet.
