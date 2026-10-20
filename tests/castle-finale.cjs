const assert=require('node:assert/strict'),fs=require('node:fs'),{run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// CASTLE_FINALE_BEGIN\n')[1].split('\n// CASTLE_FINALE_END')[0],fs.readFileSync('assets/castle-finale-v1.js','utf8'));
function reset(){run("beginDeveloperSession();level='final';resetGame(true);soundOn=false;enterFinalKnightRoom();finalKnight.defenseChance=0;");}
for(const fps of [30,60,120]){
 reset();assert.equal(run('finalChapter'),'knight');assert.equal(run('state'),'playing');assert.equal(run('finalKnight.hp'),10);assert.equal(run('checkpoint.castleRoom'),'knight');
 run("player.x=1260;player.onGround=true;keys.add('ArrowRight')");for(let i=0;i<fps;i++)run(`update(1/${fps})`);assert(run('player.x+player.w<=1280'));assert(!run('enterFinalThroneRoom()'));
 // Locked door also blocks a swept trident dash and projectiles.
 run("keys.clear();player.x=1190;player.y=412;player.onGround=true;player.facing=1;selectFinalWeapon('trident');fireWaterTrident()");for(let i=0;i<fps;i++)run(`update(1/${fps})`);assert(run('player.x+player.w<=1280'));
 // Actual sword windup gives a warning, freezes aim, swings once, recovers.
 reset();run('finalKnight.x=500;player.x=finalKnight.x+finalKnight.w+40;finalKnight.cooldown=0;player.invincible=0;');run(`update(1/${fps})`);assert.equal(run('finalKnight.phase'),'windup');
 for(let i=0;i<Math.floor(fps*.35);i++)run(`update(1/${fps})`);assert.equal(run('lives'),3);assert.equal(run('finalKnight.phase'),'windup');
 for(let i=0;i<Math.ceil(fps*.25);i++)run(`update(1/${fps})`);assert.equal(run('lives'),2);assert.equal(run('finalKnight.phase'),'slash');
 for(let i=0;i<Math.ceil(fps*.3);i++)run(`update(1/${fps})`);assert.equal(run('finalKnight.phase'),'recover');assert.equal(run('lives'),2);
 // A hit cancels the pending sword strike and repeated overlap cannot drain HP.
 reset();run('finalKnight.phase="windup";finalKnight.age=.8;player.x=finalKnight.x-60;player.y=412;player.facing=1;attack();');assert.equal(run('finalKnight.hp'),9);
 run('player.attackCooldown=0;attack();updateFinalKnightRoom(.5)');assert.equal(run('finalKnight.hp'),9);assert.equal(run('lives'),3);
 // Real returning weapons and ground dash each cause one heart of damage.
 for(const weapon of ['bow','trident','knives','stars']){
  reset();run(`player.x=finalKnight.x-155;player.facing=1;player.onGround=true;player.invincible=99;selectFinalWeapon('${weapon}');fireArrow.angle=0;attack();`);
  for(let i=0;i<Math.ceil(fps*.45);i++)run(`update(1/${fps})`);
  assert.equal(run('finalKnight.hp'),9,`${weapon} hits once at ${fps} FPS`);
 }
 // Paid checkpoint continuation preserves the boss, coins and equipment.
 reset();run('coinWallet=50;score=4;finalKnight.hp=6;finalKnight.phase="slash";showEnd(false)');assert(run('buyReviveHeart()'));assert.equal(run('lives'),1);assert.equal(run('coinWallet'),30);assert.equal(run('score'),4);assert.equal(run('finalKnight.hp'),6);assert.equal(run('finalKnight.phase'),'guard');assert.equal(run('player.x'),90);
 // Ten spaced hits really defeat him; walking through unlocked door triggers story.
 reset();for(let i=0;i<10;i++){assert(run('hitFinalKnight()'));run('finalKnight.dizzy=0');}assert(run('finalKnight.defeated'));
 run("player.x=1200;player.onGround=true;player.y=412;keys.add('ArrowRight')");for(let i=0;i<fps*2&&run("state==='playing'");i++)run(`update(1/${fps})`);
 assert.equal(run('finalChapter'),'throne');assert.equal(run('state'),'finalReveal');const lives=run('lives');run('attack();jump();update(6)');assert.equal(run('lives'),lives);assert.equal(run('finalRevealTime'),6);
 run('openWorldMap();update(3)');assert.equal(run('finalRevealTime'),6);run("state=mapReturnState;update(6)");assert.equal(run('state'),'finalEnding');assert.equal(run('finalRevealTime'),12);
 // The test-ad contract remains a full Castle restart, not a boss shortcut.
 reset();run('finalKnight.hp=2;showEnd(false);restartWithHearts(3)');assert.equal(run('finalChapter'),'castle');assert.equal(run('finalKnight.hp'),10);assert.equal(run('player.x'),90);assert.equal(run('lives'),3);
}
console.log('PASS finale: locked chamber, telegraphed sword/recovery/stun, four real weapons at 30/60/120 FPS, one-heart checkpoint revive, ten-hit defeat, walking throne entry, harmless animated ending, map pause, full ad reset.');
