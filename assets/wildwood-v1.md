# Wildwood environment art

`wildwood-trees-v2.png` is the runtime tree atlas: a tall oak, a shorter round oak, and a pale-barked beech. Each painted tree includes its own broad mossy branch with a flat landing top. The renderer aligns that top with a branch collider and extends the lower trunk to the grassy plateau below. The roots are covered by the ground painting, so every playable tree stands on the terrain.

`wildwood-ground-v1.png` supplies a continuous painted grass line and rooted earth beneath it. Seven adjoining terrain sections form a 6,900-pixel floor. Each section rises into a cliff that blocks walking, leading the bunny to climb the tree branches. `wildwood-mushrooms-v1.png` contains two safe bounce mushrooms (gold and blue) and two spiked red lethal mushrooms.

The tree and ground paintings follow the world map and existing level art. `wildwood-trees-v1.png` and `wildwood-boughs-v1.png` are earlier design studies. The game's collision surfaces are code-defined so branch and mushroom landings stay precise while the paintings provide the visuals.

The branch route rises from y=440 to y=-1605. Mushroom bounce velocity is -730 pixels/second, below Air's -850. Red mushrooms cause immediate game over on contact. Goblins and the bunny use the same 260-pixel/second ground speed and 1,500-pixel/second² acceleration. The goblin sheet and animation mapping are documented in `tree-goblin-v1.md`.
