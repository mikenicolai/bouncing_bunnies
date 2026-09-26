# Shark swim and bite sheet v1

`shark-swim-v1.png` is a transparent 1774 × 887, four-column by two-row sprite sheet. It was made with the built-in ImageGen tool and embedded in `index.html` for the self-contained game.

The user's `Photo 1.jpg` pencil shark is the primary design reference: long horizontal body, angular forked tail, tall middle dorsal fin, lower fins, wedge snout, pale lower jaw and triangular teeth. The game's original `pink-ear-bunny-v2.png` is the rendering-style reference for the bold organic outline, soft painted shading and readable cartoon shapes.

| Frame | Use |
| --- | --- |
| 0–3 | Mouth closed; subtle tail sweep across four phases |
| 4–7 | Mouth opening, open bite and closing, with a continuing tail sweep |

The runtime cycles tail frames while each shark patrols and periodically switches to the open-mouth row. Frames mirror to face the swimming direction. Sharks retain their two hearts, contact damage, and hit stun.

## Final generation prompt

Use case: stylized-concept. Asset type: production 2D enemy sprite sheet for the Bouncing Bunnies water level. Image 1 is the primary creature design reference, the user's pencil sketch: a long, almost horizontal dark-gray shark facing right, broad angular tail at left with unequal upper and lower points, tall triangular dorsal fin near center, smaller lower fins, squared wedge-like snout at right, white lower jaw and visible triangular teeth. Keep its distinctive long silhouette and fin placement; do not substitute a generic round shark. Image 2 is the exact visual style reference from this game: hand-painted cream and muted colors, strong slightly organic near-black outline, simple readable facial features, soft shading, no realistic texture. Create one truly transparent PNG sprite sheet, strict four columns by two rows, equal cells, eight fully isolated full-body poses with generous separation and no overlap. All frames same shark size and identity, side view facing right, matching the sketch shape. Top row frames 1–4: mouth closed or just slightly parted, tail swings gently left, back, right, back as it swims, dorsal fin and body stable. Bottom row frames 5–8: same tail-swing cycle but mouth visibly opens with white triangular teeth and dark interior, then begins closing; open mouth is especially clear in frames 6 and 7. The tail movement should be subtle but legible when cycled. Palette muted slate blue-gray upper body, pale ivory belly and jaw, thick black outline, painted shading like Image 2. Playful adventurous game style, no gore. No water, bubbles, scenery, text, letters, labels, border, checkerboard, or extra creatures. Truly transparent background.
