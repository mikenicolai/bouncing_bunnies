# Gentle walk A runtime artwork

Mode: built-in image generation and editing.

The plain runtime sheet is an exact copy of the user's approved `previews/walking-art/gentle-walk-v1.png`. The quiver variant adds carried arrows while preserving the same eight complete poses.

Saved assets:
- `assets/bunny-painted-upright-walk-plain-v1.png`
- `assets/bunny-painted-upright-walk-quiver-v1.png`

## Plain artwork prompt

Edit image 1, an eight-frame bunny sprite sheet, using image 2 ONLY as the character painting/style reference. Make option A: gentle upright walking.
CRITICAL: preserve the individual leg/arm positions and frame order of image 1. Its alternating legs are already correct; repaint each pose without changing which leg is in front! Keep the far leg forward in frames 3,4,5,6 and the near leg forward in frames 7,8,1,2. All eight bunnies still face RIGHT. Do not mirror the characters. Do not replace the bottom four poses with copies of the top four. Respect each bent knee and lifted foot in the source.
Repaint all eight complete connected characters in the lovely smooth cream cartoon style of the upright bunnies in the bottom row of image 2: big rounded head, broad long pink-inner ears, little vertical black oval eyes, huge happy open black mouth with ONE square cream tooth, small oval warm beige belly patch, chunky soft paws, round tail, clean bold black outlines and subtle warm beige volume shading. Remove all quivers, straps and arrows. Keep both arms visible and counter-swinging. Gentle walk, modest steps, small body bob and gentle ear sway, no running leaps.
Exactly 4 equal columns by 2 equal rows, 1536x1024 PNG, eight whole separately painted poses with transparent gutters, no crop or overlap. Maintain image 1's cell positions and each foot baseline. Transparent background, no shadow, ground, scenery, text, frame labels or decoration. Eight whole painted illustrations, not rigged pieces.

## Quiver edit prompt

Use case: precise-object-edit.
Edit target: image 1 is the user-approved gentle upright walk A, eight complete painted bunny poses.
Primary request: add a small brown leather quiver holding three golden-shaft arrows with cream fletching on the bunny's BACK in EVERY pose. Quiver goes behind torso on left/back edge, with arrow tips extending behind shoulder, well below ears. A slim brown strap crosses torso like the game's archer bunny. Never put arrows in hands. It is carried while walking, not aiming.
CRITICAL invariants: preserve EXACTLY each existing whole bunny painting, all eight walking limb poses, foot positions, ear tilts, large round cream head, pink inner ears, black oval eyes, large smiling black mouth with ONE tooth, cream paws and beige belly, outlines and shading. Only add the quiver and strap. Do NOT alter leg animation, face, character size, proportions or frame alignment. Do not make the bunny taller.
Composition: keep EXACT4columns2rows1536x1024 with same equal384x512 cells and transparent gutters, feet in same position in each source cell. Paint quiver as part of each complete pose. All face RIGHT. No labels, text, ground, shadow or scenery. Genuine transparent background.

