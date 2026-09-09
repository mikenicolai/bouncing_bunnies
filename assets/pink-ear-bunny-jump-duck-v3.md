# Approved jump / crouch poses v3

Original, unmodified approved source: `pink-ear-bunny-jump-duck-v3-source.png`.

Provenance: the requested generated output `exec-1727db2e-8753-4b02-9be2-2bed06ffd820.png` was absent. The latest corrected output `exec-4f17855d-cc42-4e0e-b161-fdf187952a41.png` (September 9, 2026) was inspected and used per fallback instructions. It matches the approved runtime character: cream-white bunny, pink ear interiors, simple vertical eyes and broad black mouth. The rejected blue-belly/forelock design is not used. The unchanged source is preserved alongside this document.

Source dimensions: 1983 × 793, RGB PNG, no alpha; gray checkerboard is baked in. Four upper jump poses and four intermediate lower crouch poses are used. The standing bookends at the ends of the lower row are unused.

Runtime: `index.html` embeds the complete original PNG as `motionSheet.src`. `MOTION_FRAMES` defines explicit crop rectangles and foot anchors. Canvas removes border-connected neutral checkerboard and neutral mid-gray enclosed background gaps, then caches eight alpha canvases. There is no separate raster derivative on disk and no new image generation.

Frames 0–3: takeoff (<0.09s), ascent (<−160px/s), apex (−160…160px/s), descent (>160px/s). Frames 4–6: duck press, lower, sustained flat hold; release uses frame 7 followed by 4 before returning to idle. All crouch artwork uses uniform .22 scaling on both axes. The former hold-only .125 vertical scale was removed because it crushed the source to 57% of its natural height. Artwork height is independent of the fixed-feet 18px collider and can extend above it. Three 60ms foot-anchored blends smooth idle → press → lower → hold and hold → release → press → idle. Foot anchors and horizontal facing mirror are retained. Old v2 idle, running and attack frames remain authoritative for those states. Only visual phase timing is added; collider and movement rules are unchanged.

Run `node tests/motion.cjs` and `node tests/route.cjs` for regression checks. Serve the repository root and open `tests/air-preview.html` for the maintained visual fixtures, including the fully crouched boss-evasion pose.
