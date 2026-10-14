# Painted Wildwood animals v1

Created with the built-in imagegen tool on 13 October 2026. Each original RGBA PNG is preserved without image processing. Source rectangles in `wildwood-animals-v1.js` omit transparent margins for consistent ground registration; runtime drawing does not read pixels, so direct-file play works.

## turtle

Saved asset: `assets/wildwood-turtle-v1.png`

Exact generation prompt:

```
Use case: illustration-story. Asset type: transparent sprite for a side-scrolling painted forest platform game called Bouncing Bunnies. Style: richly hand-painted storybook game art, warm soft sunlight, organic brush texture, subtle brown contour shadows, sculpted rounded volume, moss-green forest palette. Match a whimsical forest with textured ochre tree bark, lush painted grass, and an ivory bunny. Charming animal proportions, crisp readable silhouette at small gameplay size. Single animal only, full body centered with generous transparent margin, no terrain, no props, no background, no text, no border, no watermark. Genuinely transparent alpha background. Orthographic side-scrolling game view, feet all on one horizontal baseline.
Subject: a friendly forest turtle walking to the RIGHT in side profile. Broad low domed shell with individual earthy olive and golden moss scutes, softly textured green leathery legs and little claws, kind dark round eye, small smiling head extended to the right. Four short sturdy legs, low gentle dome that a bunny can land on. Entire silhouette including tail and toes, turtle wider than tall, avoid flat vector shapes or heavy black outlines.
```

## bird

Saved asset: `assets/wildwood-bird-v1.png`

Exact generation prompt:

```
Use case: illustration-story. Asset type: transparent sprite for a side-scrolling painted forest platform game called Bouncing Bunnies. Style: richly hand-painted storybook game art, warm soft sunlight, organic brush texture, subtle brown contour shadows, sculpted rounded volume, moss-green forest palette. Match a whimsical forest with textured ochre tree bark, lush painted grass, and an ivory bunny. Charming animal proportions, crisp readable silhouette at small gameplay size. Single animal only, full body centered with generous transparent margin, no terrain, no props, no background, no text, no border, no watermark. Genuinely transparent alpha background. Orthographic side-scrolling game view, feet all on one horizontal baseline.
Subject: a small friendly woodland songbird standing and facing RIGHT, entire body with two little ochre feet, short tail pointing left, small pointed golden beak, bright dark eye. Soft blue-teal wing feathers with layered painterly detail, creamy buff breast and sage head, plump charming proportions. Ground bird resting with wings folded, no flying pose, no background shadows.
```

The panda was removed from the game and its asset deleted on 14 October 2026.

The turtle patrols at 48 world units per second between x=500 and x=970 in the opening clearing. Its 58-unit-wide one-way shell is 63 units above ground. Landing mounts automatically; normal movement can walk off, Jump releases in place, and O remains an optional nearby mount/hop-off shortcut. Physics carries the rider by the turtle's actual displacement, including reversals, then processes ordinary coins, enemies, ducking, and camera updates. Map/developer/death/ad states pause the turtle, and restarting resets its patrol.
