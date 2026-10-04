# Upright quiver animation revision

Preview only. The game renderer remains unchanged.

The upright preview now uses continuous limb motion: legs follow one shared foot path half a cycle apart, planted paws stay on the ground, knees bend during recovery, and the two arms use opposite swings. Each paw contacts the ground for 42% of its cycle, leaving a short flight phase between contacts. Bone lengths stay fixed, and the body follows the flight lift. Near limbs are cream; far limbs are shaded warm beige to make the alternation visible. Eight manual review poses sample the same continuous cycle. Review starts at half speed, with a two-second cycle.

The unchanged, alpha-transparent body artwork was generated with the built-in ImageGen tool and saved as `previews/quiver-art/upright-quiver-body-v2.png`. Original: `/Users/mike/.codex/generated_images/01a0f81d-e540-7462-8853-e19774b7e891/exec-a9582116-3233-4246-b453-ee63e4ede88e.png`.

Final body-art prompt:

+Use case: precise-object-edit.
Asset type: single transparent torso cutout for a smooth skeletal bunny animation preview.
Input image is character/style reference only: use the first upright bunny's exact identity, colors, joyful face, pink ears and brown leather quiver containing three red-orange fletched arrows with diagonal shoulder strap.
Create ONE upright right-facing bunny HEAD + EARS + TORSO + QUIVER + small round TAIL, as a clean isolated cutout. REMOVE ALL ARMS, HANDS, LEGS AND FEET entirely. This is an animation rig body piece; the moving limbs will be drawn separately. Torso ends at the rounded hips. Outline the complete cream torso with rounded lower hips, cream oval belly, slim shoulder strap across belly. Quiver sits behind upper-left shoulder with arrows sticking out behind ears, no loose arrow across face.
Keep exactly the same original cartoon cream bunny with bold black hand-drawn outlines and subtle warm shading, no redesign. Single bunny torso/head, not an atlas, no extra components. Side view, facing right, upright torso. Center comfortably on the transparent canvas, include whole ears and arrow fletchings with generous margins. No arms, no hands, no legs, no feet, no separate parts, no scenery, no ground, no shadow, no halo, no text. Actual alpha-transparent background.
