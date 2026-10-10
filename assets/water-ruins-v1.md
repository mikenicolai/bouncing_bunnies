# Water ruins and Neptunus · v1

Created with the built-in imagegen tool on 10 October 2026. Project assets:

- `assets/neptunus-v1-source.png`: original generated pose reference, preserved for provenance.
- `assets/neptunus-v1.png`: final transparent eight-pose sea king (1774 × 887), after the layout/trident refinement.
- `assets/ancient-water-ruins-v1.png`: transparent temple scenery (1774 × 887).
- `assets/water-ruins-v1.js`: maintained gameplay and Canvas rendering source, embedded verbatim between WATER_RUINS markers in `index.html`.

Neptunus uses guard, two swimming steps, raised summon, thrust wind-up, extended thrust, recoil, and kneeling defeat. Authored source bounds, body anchors and silhouette clips isolate each pose before caching. Uniform source scale and 120 ms eased blends keep the painted body steady. The large painted trident follows the thrust animation; its collision reaches ahead of the body only during the lunge.

The small reusable trident, pedestals, dive helmet/suit, attack bubbles and warnings use native Canvas art. Ruins are background scenery with sea-king and seashell motifs. The encounter's force barriers and terrain are separate gameplay geometry. Phone portrait battles use a .68 view scale to show more swimming room above the touch dock.

Review: [Water adventure](../previews/water-ruins-review.html). Runtime and full-route tests: `tests/water-ruins.cjs`, `tests/water-route.cjs`. Browser artwork and keyboard/touch checks: `tests/water-ruins-browser.cjs`.

## Original Neptunus prompt

Use case: stylized-concept. Asset type: transparent 2D side-scrolling game boss sprite sheet. Create Neptunus, the ancient underwater king and final boss for a friendly hand-painted bunny platformer. Eight full-body poses in a precise 4-column by 2-row evenly spaced grid, identical character and scale, facing LEFT in every pose. Character: imposing sea king, turquoise skin, flowing white beard, golden seashell crown, teal and deep blue fish-scale armor and flowing fin cloak, sturdy boots, carrying a very large golden three-pronged trident with luminous aqua tips. Soft painted texture, dark clean expressive outlines, colorful children's storybook game art, cartoon proportions, coherent anatomy. No gore. Row1 poses: calm guard holding trident diagonally, swimming step A, swimming step B, raising trident to summon water. Row2 poses: winding up horizontal thrust, extending trident to the left in a lunge, recoiling from a hit, defeated kneeling with lowered trident. Every cell contains the entire character including the complete weapon, uncropped, generous transparent padding, feet aligned to same baseline in each row. Absolutely transparent background, no scenery, no floor, no panels, no text, no labels, no numbers, no shadow outside character. Wide sheet.

## Neptunus refinement prompt

Edit target: the Neptunus sprite sheet supplied. Preserve this exact sea king's identity, armor, crown, beard, colors, painted style and eight poses. Fix ONLY sheet layout and trident silhouette. Make a clean 4-column by 2-row sprite atlas with equal 512x512 spacious cells. Each complete character AND full large trident must fit INSIDE its own cell with at least 35 pixels transparent padding from every boundary. Shrink characters within cells if necessary. No adjacent pose must touch or overlap another pose, no cropped weapon tip at outer image edges. Align character feet within each row. Every trident head should visibly have THREE distinct long prongs with gold metal and aqua magical tips. Keep transparent alpha background; no checkerboard, panels, scenery, floor, text or labels. Facing LEFT for all poses. Top row guard, swim step A, swim step B, raised summon. Bottom row wind-up thrust, extended left thrust, recoil hit, kneeling defeated. Composition accuracy and isolated cells are paramount.

## Ruins prompt

Use case: stylized-concept. Asset type: transparent background scenery for a 2D side scrolling children's storybook platform game. A wide ancient underwater temple ruin, full structure isolated on transparent background. Weathered pale turquoise sandstone columns, broken classical arches, carved seashell and wave motifs, bronze ancient sea-king ornaments, colorful coral and seaweed growing on the fallen stones. Two substantial broken archways with fully OPEN transparent passages between the columns, one shorter collapsed arch on left and a tall royal arch on right. Side-on view, no perspective floor, level horizontal base, no sky, no sea backdrop, no water field, no characters, no text. Hand painted shaded surface texture with dark clean outlines, soft storybook illustration, harmonious teal aqua gold palette, light shining from above. Whole structure uncropped with transparent margin all around. A wide landscape sprite, large airy open swim spaces between sparse pillars.
