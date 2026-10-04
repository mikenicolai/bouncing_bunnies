# Painted limb artwork and jumping review

Preview only; not integrated into the game.

The approved continuous run timing is retained. Placeholder limb strokes and elliptical paws are replaced by six painted raster cutouts: upper arm, forearm, thigh, shin, rear paw and front paw. Far limbs receive a runtime warm shade, preserving the painted texture and source alpha. Walking, running and running+jumping can be reviewed. The jump includes preparation, rise, tucked flight, fall and landing, with the body/quiver moving together. Eight run samples still split four leading poses per leg.

Built-in ImageGen output was copied unchanged to `previews/quiver-art/painted-limb-parts-v1.png`. Original: `/Users/mike/.codex/generated_images/01a0f81d-e540-7462-8853-e19774b7e891/exec-ebcd0877-ab26-4aff-afd2-2541e618b9ea.png`.

## Generation prompt

Use case: stylized-concept.
Asset type: transparent painted limb cutout atlas for the exact Bouncing Bunnies character.
Input image 1 is the torso's style/color reference. Input image 2 shows the original full bunny's natural organic chunky arms and legs. Preserve their hand-painted cream tones, warm shaded edges, soft brush shading and irregular hand-drawn black outlines. These are real bunny limb artwork pieces for a skeletal animation, NOT vector capsules, ellipses, circles or mechanical sticks.
Create a landscape 3-column by 2-row atlas of SIX separate fully isolated cream bunny limb parts, with equal rectangular cells. One part centered in each cell; no labels, no full bunny, no head, no torso, no quiver, no background, no shadow outside the part. Genuine alpha transparency, big clear gutters, no clipping.
Top-left cell: UPPER ARM, shoulder to elbow. Natural gently tapered and slightly curved cream upper arm, soft painted fur shading, rounded shoulder attachment at top and rounded elbow attachment at bottom. Long axis vertical.
Top-middle cell: FOREARM, elbow to wrist. Slightly curved cream forearm, thicker near elbow and tapered wrist. Long axis vertical, elbow attachment at top, wrist at bottom. NO hand attached.
Top-right cell: THIGH / upper hind leg. Chunky organic bunny haunch, fuller at upper hip then tapering toward knee, softly painted warm cream highlights, natural irregular contour, not a straight tube. Hip attachment at top, knee at bottom, main axis vertical.
Bottom-left cell: SHIN / lower hind leg, narrower and gently curved, knee attachment at top, ankle at bottom, long axis vertical. NO foot attached.
Bottom-middle cell: FOOT / bunny rear paw. A broad, naturally elongated bunny foot facing RIGHT. Ankle enters upper-left/heel area, rounded heel at left and longer rounded toe area to the right. Flat-ish gently curved sole, a couple of subtle hand-drawn toe creases near the right end. Cream shaded volume with irregular cartoon outline; NOT a smooth ellipse. Horizontal orientation.
Bottom-right cell: HAND / front paw. A small naturally mitten-shaped curled front paw, right-facing thumb bulge and subtle two-finger crease. Wrist attachment enters at the upper-left/top, organic lobed shape rather than circle/ellipse. Cream shading and black outlined style.
All six are the SAME character, same palette and outline weight as the original reference. Each fills roughly half to two-thirds of its cell, with the upper/lower limb attachment ends visible. No human fingernails, no realistic hair texture, no new colors, no arrows, no text, no borders. Paint these as polished character-animation cutout pieces, preserving genuine bitmap brush/shaded artwork.

## Final refinement prompt

Create a clean transparent cartoon game animation asset sheet using the two reference images. Image 1 is the six-component layout to preserve. Image 2 is the whole cheerful cream bunny character for style context. These are cartoon rabbit arm and leg animation pieces and paws for a children's platform game.
Keep the six pieces in the same three-column/two-row arrangement: upper arm, forearm, chunky upper back leg; lower back leg, long right-facing bunny foot with toe creases, mitten-shaped bunny front paw.
Preserve the existing painted cream shading, black hand-drawn outlines, organic shapes, size and placement of each piece. Remove the soft gray haze surrounding the parts. Fully clear alpha transparency between all parts, clean silhouette edges, no shadows, no outer glow, no background, no text. Nothing outside the black outlined cartoon shapes.

The first refinement attempt failed. The saved final output uses the successful second refinement. No source image processing was performed; crop coordinates and joint anchors are part of the preview renderer.

