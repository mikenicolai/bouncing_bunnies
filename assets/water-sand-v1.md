# Continuous beach and underwater sand v1

The Water beach and seabed now use a single painted texture layer made from the existing `sandy-pit-edge-v1.png`. The original PNG is unchanged. No new generated artwork or runtime pixel readback is needed.

The previous dry painting was only about 340 world units tall, exposing its flat fill below that strip. The seabed used a different crop and scale, creating a hard texture boundary at x=1410. `water-sand-v1.js` replaces both with one world-aligned repeating painting. Four opaque interior crops, staggered and feathered, provide detailed sand, stones and roots through the full visible depth. A faded painted cap follows the existing flat beach and sloping floor. Warm dry sand blends into a cooler wet tint through a soft, slightly irregular coastal boundary and a gradual depth fade.

The painting and wetness rows are anchored in world coordinates, so scrolling and rotation do not move the texture. The beach, seabed, cactus and swimming collision geometry is preserved. The existing foam wash remains at the shore. Direct-file play works without reading pixels from external artwork.

Runtime source: `assets/water-sand-v1.js`, embedded verbatim inside the `WATER_SAND_BEGIN/END` markers in `index.html`. Preview: `previews/water-sand-review.html`. `tests/water-sand-browser.cjs` checks opaque texture at several depths on both sides of the former join, the missing beach area, a soft colour boundary, camera stability, clear sky, desktop/portrait/landscape, and direct-file rendering.
