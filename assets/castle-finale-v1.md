# Castle finale artwork v1

Generated with the built-in imagegen tool; native PNG bytes and transparency preserved. No image post-processing.

- [Sword knight atlas](castle-knight-v1.png): 1536 × 1024, RGBA, 3 × 2 poses; guard, windup, slash, recover, hurt, kneel.
- [Crowned Benny atlas](crowned-bunny-v1.png): 1254 × 1254, RGBA, 2 × 2 poses. Same cream bunny, pink ears and tooth, rounder seated body, gold crown and grim expression.
- [Empty throne room](castle-throne-room-v1.png): 1536 × 1024, RGB. Characters and the ending text are animated/drawn separately in the runtime.
- Knight chamber reuses the approved castle-torch-hall-v1.png painting.

The final knight cutout and grim expression were targeted edits; discarded cheerful/hazy variants remain outside the project. Runtime cropping and foot anchors preserve character registration. The court reuses the existing enemy/boss assets.

## Prompts

### thronePrompt

Use case: illustration-story. Asset type: one opaque painted background for the final throne-room reveal in the HTML5 game Bouncing Bunnies. Reference image is the existing castle hall; match its hand-painted blue-grey masonry, soft chunky weathered stones, amber mounted torches, moon-blue gothic windows and deep plum banners. Create a new grand castle throne room in FRONT ELEVATION / side-view cutaway, not a corridor vanishing into perspective. Centered high-backed carved dark wood throne with gold trim, bunny-ear finials and a plum velvet seat, on a low three-step stone dais. The throne is EMPTY: our crowned bunny will be animated separately. Room is majestic, slightly mysterious, child-friendly. Six mounted torches and moonlit arched windows arranged naturally; continuous painted stone floor across the lower 20 percent; clear open standing spaces on both sides of the throne for an enemy court we animate separately. Chair seat approximately centered horizontally at 65 percent image height, throne foot on the floor at 86 percent. Wide landscape composition, fully painted edges, no repeating half-objects, no foreground pillars obscuring the throne. No characters, enemies, king, text, UI, title, sign, watermarks or unrelated props.

### kingPrompt

Use case: illustration-story. Asset type: transparent four-pose character animation atlas for Bouncing Bunnies. First reference is Benny's approved character sheet: preserve his cream fur, long pink-inner ears, black vertical oval eyes, small muzzle and one white front tooth, bold organic dark outlines, soft warm painted shadows. Second reference is the castle throne room for material/palette harmony. Create an OLDER, modestly ROUNDER version of the same bunny as the secret ruler, not a human, sitting on an invisible chair with his feet forward and paws resting on invisible armrests or his rounded belly. He wears a small ornate gold crown between his ears and a short deep-plum royal mantle with warm gold trim. Friendly but quietly smug and mysterious, suggesting an experienced former player; NOT grotesque, not enormous, not scary, no weapon. Front-facing slight three-quarter view toward viewer. Exactly FOUR complete registered poses in a TWO BY TWO equal square cell atlas: upper-left relaxed seated idle with eyes open and a small knowing smile; upper-right same seated pose with eyes gently closed blinking; lower-left same seated pose with one paw raised in a slow welcoming gesture; lower-right same seated pose with a slightly broader smug smile, shoulders lifted in a soft chuckle. Same character proportions, crown and ears placement, seated foot baseline, chair-seat hip position and scale in every cell. Whole crown, ears, paws, tail, round belly and feet visible. Each pose fits wholly in its cell with at least 10 percent transparent margin, no crossing cells. There is NO throne or chair drawn, no background, no baked shadow cloud, no scene, no text, grid, labels or watermark. Use genuine transparent alpha. Painterly shading should fit the rich storybook castle but retain the approved bunny's simple readable face and rounded silhouette.

### grimKingPrompt

Use case: identity-preserve. Edit target: the attached 2 by 2 transparent seated crowned bunny animation atlas. Change ONLY his expression from cheerful to grim and imposing: narrowed familiar black oval eyes with stern angled eyebrows, a restrained knowing smirk with the familiar single front tooth, a stern closed-eye blink, the lifted paw a quiet commanding gesture, final pose a stern chin lift instead of laughing. Keep unmistakably the SAME Benny bunny, cream fur, pink ears, crown, round belly, plum/gold cape, every pose size and registration and four-cell layout unchanged. Child-friendly painted game artwork, not horror. Preserve full transparency, no throne, no text, no new features.

### knightPrompt

Use case: illustration-story. Asset: transparent game sprite animation atlas, 3 columns by 2 rows, six equal cells, landscape 1536x1024. A single formidable castle knight with a sword in a hand-painted children's adventure platform game style: chunky rounded blue-grey steel armor with warm hand-painted highlights, heavy dark contour lines, closed dark helmet visor, short worn plum cape, gold-hilted steel sword, small bunny insignia on breastplate. Match storybook stone castle and cream cartoon bunny style. All six cells depict exactly the same knight facing RIGHT in side/three-quarter view. Row1: relaxed standing guard sword down; raised sword windup; forward horizontal slash. Row2: recovery standing sword down; recoiling hurt; defeated kneeling with sword resting on floor. Register standing foot baseline and body centers consistently, sword completely inside each cell, generous transparent gutters, no cropped parts, no overlapping cells. Genuine transparent background, no floor/shadows/text/cell borders, no other characters, no fire, no photorealism.

### knightCutoutPrompt

Use case: background-extraction. Edit the attached six-pose knight animation sheet. Remove ALL cloudy background, grey glow, colored haze and shadows between and behind the knights to actual zero-alpha transparency. Keep only the six knight figures, their capes and swords with clean edges. Preserve exactly the painted characters, all poses, colors, locations, size, 3-column 2-row cell registration, and full sword tips. No checkerboard painted into pixels. This is a production transparent game sprite atlas, background must have alpha zero everywhere outside the characters.

