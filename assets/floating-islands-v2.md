# Floating islands v2

Approved four-variant painted artwork, generated with the built-in image tool on 13 September 2026 from the approved flat island. Original output: `exec-d306f459-a60a-4959-ab39-72cf1c4a5322.png`. The unchanged source sheet is saved as `floating-islands-v2.png` and embedded in `index.html`.

Variants: white daisies; red/pink flowers; lavender/yellow flowers; one background tree and daisies. All share a flat grassy landing edge and rounded painted stones. Flowers, tree and rock undersides are decoration only.

Runtime crops (x, y, width, height, landing y within crop): (70,30,670,380,80), (848,30,670,380,80), (70,470,670,440,128), (848,410,670,500,188). Canvas removes border-connected ivory background (minimum RGB >220, channel spread <40); enclosed flower petals remain intact. Each crop uses a 620px walkable span with a 30px left inset, aligned to the collision plane. The four variants occupy platform IDs 0,6,10,15 respectively. The latter three gain 50px width; the starting island retains its tutorial recovery geometry.

Use `previews/islands-v2.html` to inspect the real renderer and bunny foot alignment. The approved source and previous versions remain available.
