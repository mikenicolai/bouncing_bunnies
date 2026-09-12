# Storm cloud v1

Approved source: `storm-cloud-v1-source.png`, copied unchanged from generated output `exec-5c06172b-8511-47f3-a509-6dc886dea6fa.png` supplied by the user on September 12, 2026. Source is 2172×724 PNG with alpha. No background removal, repainting or resampling is applied to the stored source.

Eight equal horizontal cells (271.5px each): inactive, faint charge, internal sparks, strong charge, emerging bolt, full strike A, full strike B, afterglow. Runtime draws source y150–724 at uniform scale .35 with a 4px inset at each cell edge to exclude neighboring-frame slivers; the shared baseline is each existing hazard's ground y. Empty transparent space above is omitted. Complete source bytes are embedded in `index.html`; there is no external asset request.

Cycle 3s: frame0 0–1.7s; frame1 1.7–1.85; frame2 1.85–2; frame3 2–2.2; frame4 2.2–2.25; frame5 2.25–2.31; frame6 2.31–2.37; frame7 2.37–2.47; frame0 2.47–3. Intervals are start-inclusive/end-exclusive. The cloud body always hurts on contact (ellipse radius44×29, centered168px above the hazard ground). Only frames5–6 damage the existing 34×130px downward lane. There is no ground outline or charging label: the internal cloud animation is the visual warning. Charge sound starts on frame1; strike sound and ground particles on frame5; glow follows the same frame selection. Existing 1.7s invulnerability prevents repeat hits.

Tests: `node tests/storm-cloud.cjs`. Visual fixtures: serve the repository and open `tests/air-preview.html` (lightning warning/active scenes). Source and embedding identity, PNG alpha metadata, phase boundaries, offsets, timing, damage exclusion and invulnerability are tested.
