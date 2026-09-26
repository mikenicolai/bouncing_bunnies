# Lava zombie — v3

Built-in image-generation edit of `lava-zombie-v2.png` on 26 September 2026. The selected 1536 × 1024 eight-pose source is `lava-zombie-v3.png`, embedded in `index.html` and shown in `previews/lava-zombie-animation.html`.

The black pupils are removed. Each open eye is now a plain white oval with a dark outline, shifted toward the direction of the right-facing walk. The game mirrors the sheet when the zombie turns left. The fourth top-row frame remains a closed-eye blink. The slow bunny-tracking behavior added with v2 is unchanged.

## Edit prompt

Use case: precise-object-edit. Edit this exact eight-pose lava zombie sheet. Change only the eye detail. Remove every black pupil/iris/dot from every open eye, so the eye is a plain empty white oval with a charcoal outline, like the original child drawing. Then shift each plain white oval slightly toward the right side of the head (the direction the zombie is walking in the four bottom-row poses), about one third of the eye's width farther right under the bangs, keeping it clearly visible. The game's renderer mirrors the frames for walking left. Keep exactly one eye per figure, no pupil, no extra facial marks; keep the fourth top-row closed-eye blink unchanged. Preserve the eight poses, bodies, hair, hands, shirt, red shorts, feet, proportions, colors, texture, 4x2 grid, cell positions, white background, and 1536x1024 dimensions. Do not change anything else.
