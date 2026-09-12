# Storm cloud v1

Approved source: `storm-cloud-v1-source.png`, copied unchanged from generated output `exec-5c06172b-8511-47f3-a509-6dc886dea6fa.png` supplied by the user on September 12, 2026. Source is 2172×724 PNG with alpha. No background removal, repainting or resampling is applied to the stored source.

Eight equal horizontal cells (271.5px each): inactive, faint charge, internal sparks, strong charge, emerging bolt, full strike A, full strike B, afterglow. Runtime draws source y150–724 at uniform scale .35 with a 4px inset at each cell edge to exclude neighboring-frame slivers; the shared baseline is each existing hazard's ground y. Empty transparent space above is omitted. Complete source bytes are embedded in `index.html`; there is no external asset request.

Cycle 4.8s: frame0 0–2.7s; frame1 2.7–2.95; frame2 2.95–3.15; frame3 3.15–3.45; frame4 3.45–3.5; frame5 3.5–3.59; frame6 3.59–3.68; frame7 3.68–3.8; frame0 3.8–4.8. Intervals are start-inclusive/end-exclusive. Only frames5–6 deal damage in the existing 34×130px lane. The warning outline is exactly that lane. Charge sound starts on frame1; strike sound and ground particles on frame5; glow follows the same frame selection. Existing 1.7s invulnerability prevents repeat hits.

Tests: `node tests/storm-cloud.cjs`. Visual fixtures: serve the repository and open `tests/air-preview.html` (lightning warning/active scenes). Source and embedding identity, PNG alpha metadata, phase boundaries, offsets, timing, damage exclusion and invulnerability are tested.
