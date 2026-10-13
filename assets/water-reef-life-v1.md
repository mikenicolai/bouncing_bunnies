# Painted reef life v1

Created on 13 October 2026 with the built-in imagegen tool. Original transparent RGBA PNGs are preserved without raster processing:

- `assets/reef-fish-v1.png`: four golden, coral-pink, mint and lavender fish, 1254 × 1254.
- `assets/reef-coral-v1.png`: four branching coral clusters, 1254 × 1254.
- `assets/reef-seagrass-v1.png`: two textured sea-grass clumps, 1402 × 1122.

`water-reef-life-v1.json` records source rectangles. Sea-grass stems meet their root tuft at source y=1000, anchored to the local seabed; Canvas clipping buries the root tips along the slope. Every coral uses its own x coordinate for the floor height, fixing the floating base caused by using the adjacent grass's ground position. Plant heights fit beneath the waterline/cave roof. Grass sways around its planted base. Small coral paintings also replace the flat coral circles at the rock columns.

Fish retain all 21 five-fish school paths, colors, direction mirroring, gentle swimming motion, and rock/ship avoidance. Their painted silhouettes fit the existing 40 × 16 safe swimming envelope. This changes scenery only; swimming, enemies, oxygen, coins, and other gameplay retain their existing logic.

The five swimming turtles also use `reef-turtle-v1.png`, adapting the forest turtle identity with two registered flipper poses; see `reef-turtle-v1.md` for that exact built-in imagegen prompt. Their painted bodies fit within the existing swimming clearance and retain the same paths.

Runtime source: `assets/water-reef-life-v1.js`, embedded verbatim inside `WATER_REEF_LIFE_BEGIN/END` in `index.html`. Preview: `previews/water-reef-life.html`. Tests: `tests/water-surface-life.cjs` and `tests/water-reef-life-browser.cjs`.

## fish

Style reference: `sky-birds-flight-v1.png`.

Exact generation prompt:

```
Use case: illustration-story. Asset type: transparent production sprite atlas for Bouncing Bunnies, a hand-painted storybook 2D platform game. Match the provided image only as an ART STYLE reference: richly textured brushwork, soft sculpted volume, warm highlights, rounded friendly forms and subtle dark contour shadows, never flat vector shapes or photorealism. Orthographic side-on game view. Full silhouettes inside clearly separated cells with generous genuinely transparent margins. No labels, grid lines, scenery, background, text, watermark or painted checkerboard.
Create FOUR small friendly reef fish in a 2 by 2 equal-cell square sheet. All face RIGHT, tail on the left, entire body and all fins visible. Each is a separate color variant of the same plump elongated fish: top-left golden honey-yellow, top-right warm coral-pink, bottom-left pale mint/teal, bottom-right soft lavender-purple. Every fish is roughly 2.4 times wider than tall with compact rounded fins and tail, no long fin streamers; identical size and body center per cell. Gentle scale texture, layered translucent-looking fins, cream belly highlights, one kind dark glossy eye, tiny smiling mouth. Readable at a small 30-pixel-wide gameplay size. The style reference birds are not subjects: draw fish only, no birds.
```

## coral

Style reference: `wildwood-ground-v1.png`.

Exact generation prompt:

```
Use case: illustration-story. Asset type: transparent production sprite atlas for Bouncing Bunnies, a hand-painted storybook 2D platform game. Match the provided image only as an ART STYLE reference: richly textured brushwork, soft sculpted volume, warm highlights, rounded friendly forms and subtle dark contour shadows, never flat vector shapes or photorealism. Orthographic side-on game view. Full silhouettes inside clearly separated cells with generous genuinely transparent margins. No labels, grid lines, scenery, background, text, watermark or painted checkerboard.
Create FOUR natural branching coral clusters, each in its own equal square cell of a 2 by 2 square sheet. Top-left warm salmon-orange branching coral, top-right honey-gold coral with rounded branch tips, bottom-left rose-pink branching coral, bottom-right muted lavender sea fan coral. Organic uneven branches, small visible coral pores and warm soft highlights, darker undersides and recesses, several limbs that curl and fork naturally, no straight Y-shaped sticks. Each is a compact reef decoration about as wide as tall, full cluster, anchored at a small subtle pebble footing, footing sits on the same baseline in each cell. No huge rocks, seabed slab, flowers or terrestrial tree leaves. Preserve the established rounded painted game texture of the reference, but draw sea coral only.
```

## seagrass

Style reference: `wildwood-ground-v1.png`.

Exact generation prompt:

```
Use case: illustration-story. Asset type: transparent production sprite atlas for Bouncing Bunnies, a hand-painted storybook 2D platform game. Match the provided image only as an ART STYLE reference: richly textured brushwork, soft sculpted volume, warm highlights, rounded friendly forms and subtle dark contour shadows, never flat vector shapes or photorealism. Orthographic side-on game view. Full silhouettes inside clearly separated cells with generous genuinely transparent margins. No labels, grid lines, scenery, background, text, watermark or painted checkerboard.
Create TWO separate rooted sea-grass clumps side by side, in two equal columns, each full silhouette with ample transparent margins. Each clump consists of five to seven tall slender ribbon-like aquatic leaves, different natural heights, curved and tapering tips, clear thickness and textured soft brushwork, sunlit ridges and deeper green creases. Left clump olive/sage green; right clump teal/emerald green. About three times taller than wide. Both emerge from a small compact root tuft on the same bottom baseline, no broad rock base or seabed strip. These are submerged marine plants, not terrestrial ferns or trees. Organic flowing leaf shapes that can sway gently in the game, not three plain straight line strokes. No coral or animals in this atlas.
```

Fish and turtles face their actual horizontal swimming direction, turning at each patrol reversal. The Water world clock runs on the beach as well as underwater, so reef movement, flipper strokes and sea-grass sway continue while Benny is dry. Map, developer, death and advertisement screens still pause it. `tests/water-life-motion.cjs` and `tests/water-life-motion-browser.cjs` cover these cases.
