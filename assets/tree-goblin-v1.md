# Tree goblin — animation study v1

`tree-goblin-v1.png` is a 1536 × 1024 transparent sprite sheet, four columns by three rows. The user's goblin sketch supplied the character design; `pink-ear-bunny-v2.png` and `air-hair-monster-v1.png` supplied the game's painted style. The goblin retains the swept double-point head, overlapping oval eyes with slit pupils, triangular teeth, mint body, tiny arms, and short feet.

| Row | Frames | Animation |
| --- | --- | --- |
| 0 | 0–3 | Idle: still, blink, glance, grin |
| 1 | 0–3 | Alternating grounded walking steps |
| 2 | 0–3 | Dance: sway left, sway right, hop, landing |

The standalone preview is `previews/tree-goblin-animation.html`. It plays all three loops together, supports speed and pause controls, and offers the sprite sheet for download. The goblin also appears in the playable Wildwood level. Near the bunny it walks toward them; while far away it chooses a dance loop with 70% probability and an idle loop with 30% probability every two to four seconds.
