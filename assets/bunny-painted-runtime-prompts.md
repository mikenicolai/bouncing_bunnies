# Whole painted runtime bunny artwork

Generated/edited using the built-in ImageGen tool on 5 October 2026. Each frame is a single complete painting. Source sheets and exact prompts for the approved poses: [whole-pose-prompts.md](../previews/quiver-art/whole-pose-prompts.md).

Approved quiver sheets were copied unchanged to assets. The matching plain sheets were edited from their corresponding approved quiver sheets with this exact prompt:

```
Use case: precise-object-edit. Create the matching UNARMED version of this complete painted eight-pose bunny animation sheet. Change ONLY the equipment: remove the brown leather quiver, all arrows and red-orange fletchings, and the brown chest/back straps from ALL EIGHT bunnies. Fill the uncovered fur naturally with the existing cream shading and smooth hand-drawn outline. Keep each bunny's exact silhouette, feet/knees/arms, pink ears, ear tilt, head, face, smile, tooth, tail, pose, position, size and shading unchanged. Preserve the exact original canvas dimensions, same 4 columns x 2 rows sprite grid and original transparent gutters. Each cell remains ONE complete painted character with seamless connected limbs. Do not reposition, resize, rotate or redraw the movement; do not introduce parts or gear. True transparent background, no backdrop, halo, ground, shadows, text, gridlines or labels. All eight bunnies have NO quiver, NO arrows, NO harness.
```

Additional action sheet, referenced upright run quiver artwork:

```
Use case: game-sprite-variants. Paint a NEW full-character 4 column by 2 row sprite sheet with EIGHT complete seamless painted bunny poses. Match the reference EXACTLY: cream bunny with warm shading, black smooth hand-inked outline, long cream ears with coral pink interiors, small black vertical eyes, happy open mouth and single white tooth, round fluffy tail, brown leather quiver on its back with red-orange arrow feathers and brown diagonal chest strap. Same full-body cartoon painting style and proportions, no detached parts. All face right. Canvas 1536 by 1024 pixels, eight separate cells 384 by 512, feet baseline y=480 within every cell. Transparent gutters, each figure fully contained in own cell with at least 16 px margin. Paint these poses in row-major order: 1 upright standing relaxed, two feet planted and arms lowered; 2 slightly softer breathing upright idle with ears tilting backward gently; 3 lowering into a crouch knees bent, ears begin lying back; 4 deep low crouch almost belly down, ears swept backward, paws and feet tucked down; 5 standing back up from crouch; 6 upright punch wind-up, rear paw drawn back; 7 strong forward punching paw extended right, two feet firmly planted; 8 punch recovery returning to idle with paw lowered. The quiver stays securely on the back in every pose. Individual completed illustrations, no assembled limb pieces. Genuine transparent background, no glow, floor, shadow, lettering or gridlines.
```

The plain action sheet was derived from that complete action sheet with the same equipment-removal prompt above.

Archery edit, referenced original pink-ear-bunny-archery-v1.png and approved upright run quiver:

```
Use case: precise-object-edit. Edit ONLY the FIRST reference sprite sheet to add the brown leather QUIVER shown in the SECOND reference. Keep the FIRST sheet's exact canvas size 1774 by 887, 4 columns by 2 rows, same eight bunny poses, same body positions, silhouettes, feet, faces, ears, arms and hands. Replace the loose strapped arrow on the top four quadruped bunnies with a small brown leather quiver containing red-orange fletched arrows securely on the back and a brown shoulder strap. Add this same quiver on the back of all four upright aiming bunnies in the bottom row, behind their heads with the strap diagonal across their torsos; do NOT change their aiming arms, hands or feet, as a bow is added at runtime. Match cream shading and outline to the first sheet. Every frame is one complete painted character, no detached pieces. Do not reposition, rescale or add weapons in paws. Genuine transparent background, no backdrop, halo, floor, text, or labels.
```

Runtime assets: bunny-painted-{upright,four}-{run,jump}-{plain,quiver}-v1.png, bunny-painted-actions-{plain,quiver}-v1.png, bunny-painted-archery-quiver-v1.png. True RGBA transparency. No runtime limb assembly, ear deformation, or loose carried-arrow overlay. Bow and flying projectiles remain separate so aiming can rotate the bow.

