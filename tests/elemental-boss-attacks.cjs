const assert=require('node:assert/strict'),fs=require('node:fs');const {run}=require('./air.cjs');
function earth(){run("level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false);earthBoss.active=true;earthBoss.stage='giant';earthBoss.hp=8;earthBoss.treeGrowth=1;player.x=7140;player.y=EARTH_ARENA.floor-player.h;player.onGround=true;player.vx=player.vy=0;");}
for(const fps of [30,60,120]){
 // Enter the protective bubble from both sides and during an attack. Its push
 // moves the actual body without reducing hearts or tunnelling into terrain.
 for(const side of [-1,1]){
  run(`level='water';resetGame();soundOn=false;waterTrident.owned=true;waterAquaSuit=true;player.inWater=true;neptunus.active=true;neptunus.guard=1;neptunus.mode='thrust';neptunus.age=0;neptunus.facing=${side};player.x=neptunus.x+neptunus.w/2+${side}*72-player.w/2;player.y=neptunus.y+neptunus.h/2-player.h/2;player.invincible=0;var pushStart=player.x;`);
  for(let f=0;f<Math.round(fps*.22);f++)run(`updateNeptunus(1/${fps})`);
  assert.equal(run('lives'),3,'bubble contact never takes a heart');assert(run(`(player.x-pushStart)*${side}>25`),'bubble pushes Benny back');
  assert(run('waterPositionClear(player,[...waterReefs,...waterShipSolids(),...waterAdventureSolids()])'));
 }
 // A long-distance vine visibly lifts Benny and carries him all the way to the
 // giant's safe front position, even when movement input opposes the pull.
 earth();run("earthBoss.turn=3;earthBoss.cooldown=0;updateEarthBoss(0);keys.add('ArrowLeft');var vineStart=player.x;");
 for(let f=0;f<Math.round(fps*2.4);f++)run(`moveBunnyHorizontal(1/${fps});updateEarthVine(1/${fps})`);
 assert(run('player.x>vineStart+150'),'vine drags far beyond the previous short tug');assert(run('player.y+player.h<EARTH_ARENA.floor-25'),'caught bunny is lifted');
 assert(run('Math.abs(earthBoss.x-player.x-player.w/2)<125'),'vine reaches the boss');assert.equal(run('lives'),3);
 earth();run('earthBoss.turn=3;earthBoss.cooldown=0;updateEarthBoss(0)');for(let f=0;f<Math.round(fps*1.3);f++)run(`updateEarthVine(1/${fps})`);
 assert(run('earthBossVine.grabbed'));run('keys.clear();jump()');assert(run('earthBossVine.released&&player.vy<0'),'jump escapes a lifted grab');
 // New stones warn harmlessly, rise through a matching low footprint, hurt on
 // the ground, and can be cleared by an ordinary jump. They fully retract.
 for(const raised of [0,80]){
  earth();run(`earthBoss.turn=4;earthBoss.cooldown=0;updateEarthBoss(0);player.x=earthBossStones[0].x-player.w/2;player.y=EARTH_ARENA.floor-player.h-${raised};player.invincible=0;updateEarthBossHazards(.5)`);
  assert.equal(run('lives'),3,'stone warning is harmless');run('updateEarthBossHazards(.5)');assert.equal(run('lives'),raised?3:2,'jump clears rising stones');
  run('updateEarthBossHazards(3)');assert.equal(run('earthBossStones.length'),0);
 }
 // Exercise a real unboosted jump through the complete hazard, including
 // landing, rather than checking only a manually raised hurt box.
 earth();run('earthBoss.turn=4;earthBoss.cooldown=0;updateEarthBoss(0);player.x=earthBossStones[0].x-player.w/2');
 for(let f=0;f<Math.round(fps*.65);f++)run(`update(1/${fps})`);run('jump()');
 for(let f=0;f<Math.round(fps*1.1);f++)run(`update(1/${fps})`);
 assert.equal(run('lives'),3,'one ordinary jump clears the rising stone through landing');
 // The fight's tree stops retreat to the old perch and blocks ranged knives.
 earth();run("earthKnives.equipped=true;earthKnives.slots[0].state='ready';player.x=6900;player.y=EARTH_ARENA.floor-185;player.facing=1;player.attackCooldown=0;throwEarthKnife();");
 for(let f=0;f<fps;f++)run(`updateEarthKnives(1/${fps})`);assert.equal(run('earthBoss.hp'),8,'outside perch cannot snipe through the tree');
 run("player.x=EARTH_ARENA.left+10;player.y=EARTH_ARENA.floor-58;player.vx=-200;keys.clear();keys.add('ArrowLeft');");for(let f=0;f<Math.round(fps*.5);f++)run(`update(1/${fps})`);
 assert(run('player.x>=EARTH_ARENA.left-8'),'solid trunk blocks retreat through it');
 run("earthBoss.stage='done'");assert.equal(run('earthArenaTreeSolids().length'),0,'defeat opens the return route');
 earth();run("earthBoss.turn=4;earthBoss.cooldown=0;updateEarthBoss(0);hitEarthBoss('knife')");assert.equal(run('earthBossStones.length'),0,'knife interruption clears stone attacks');
 earth();run("earthBoss.turn=4;earthBoss.cooldown=0;updateEarthBoss(0);state='map'");const frozen=run('JSON.stringify(earthBossStones)');run('update(.5)');assert.equal(run('JSON.stringify(earthBossStones)'),frozen);run('resetGame()');assert.equal(run('earthBossStones.length'),0);
}
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// ELEMENTAL_BOSS_EFFECTS_BEGIN\n')[1].split('\n// ELEMENTAL_BOSS_EFFECTS_END')[0],fs.readFileSync('assets/elemental-boss-effects-v1.js','utf8'));
for(const a of Object.values(run('BOSS_EFFECT_ART'))){const p=fs.readFileSync(a.asset);assert.equal(p[25],6);assert.equal(p.readUInt32BE(16),a.width);assert.equal(p.readUInt32BE(20),a.height);for(const [x,y,w,h]of Object.values(a.frames))assert(x>=0&&y>=0&&x+w<=a.width&&y+h<=a.height);}
console.log('PASS elemental bosses: harmless swept bubble push, lifted long vine drag and escape, jumpable/retracting stone row, tree perch/knife barrier and return after defeat, interruption/pause/reset and native atlas registration at 30/60/120 FPS.');
