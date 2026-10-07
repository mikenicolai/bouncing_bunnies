const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='fire';resetGame();fireFinished=false;");
const arena=()=>{reset();run("fireArrow.owned=true;beginSecondVolcano();player.x=10600;player.y=-558;player.onGround=true;player.facing=1;beginLavaKing();fireArrow.angle=0;lavaKing.phase='recover';");};
// New runs choose different reachable corridors; checkpoint recovery keeps the pickup.
let last=null,locations=new Set();
for(let i=0;i<80;i++){
 reset();const cell=run('JSON.stringify(FIRE_ARROW_CELL)');assert.notEqual(cell,last);last=cell;locations.add(cell);
 assert(run('mazeOpen(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r)'));assert(run('mazeNext(FIRE_MAZE.entrance,FIRE_ARROW_CELL)'));assert(run('mazeNext(FIRE_ARROW_CELL,FIRE_MAZE.exit)'));
 run('beginFireMaze();respawnFire()');assert.equal(run('JSON.stringify(FIRE_ARROW_CELL)'),cell);
 run('player.x=mazeCenter(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r).x-21;player.y=mazeCenter(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r).y-29;collectFireArrow()');assert(run('fireArrow.owned'));assert.equal(run('fireArrow.ammo.filter(Boolean).length'),5);
}
assert(locations.size>20);
// Exactly 89/10/1 outcomes over evenly spaced probability inputs, plus thresholds.
run('var savedArrowRandom=Math.random;var arrowRoll=0;Math.random=()=>arrowRoll;');
const counts={normal:0,fire:0,rainbow:0};
for(let i=0;i<100;i++){run(`arrowRoll=${(i+.5)/100}`);counts[run('rollFireArrowType()')]++;}
assert.deepEqual(counts,{normal:89,fire:10,rainbow:1});
for(const [value,type] of [[0,'normal'],[.889999,'normal'],[.89,'fire'],[.989999,'fire'],[.99,'rainbow'],[.999999,'rainbow']]){run(`arrowRoll=${value}`);assert.equal(run('rollFireArrowType()'),type);}
run('Math.random=savedArrowRandom;');
// Five shots exhaust ammo, including misses; cooldown and failed shots never spend ammo.
for(const fps of [30,60,120]){
 arena();run("fireArrow.ammo.fill('normal')");
 for(let i=0;i<5;i++){run('fireArrow.cooldown=0');assert(run('fireBunnyArrow()'));assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4-i);assert(!run('fireBunnyArrow()'));}
 run('fireArrow.cooldown=0');assert(!run('fireBunnyArrow()'));assert.equal(run('bunnyArrows.length'),5);
 for(let i=0;i<fps*3-1;i++)run(`updateFireArchery(1/${fps})`);
 assert.equal(run('fireArrow.ammo.filter(Boolean).length'),0);run(`updateFireArchery(1/${fps})`);assert.equal(run('fireArrow.ammo.filter(Boolean).length'),1);
 run('toggleFireAim()');assert(!run('fireArrow.aiming'));run('updateFireArchery(12)');assert.equal(run('fireArrow.ammo.filter(Boolean).length'),5);assert.equal(run('fireArrow.recharge'),0);
 // Another shot while recharging keeps progress toward the next return.
 run('toggleFireAim();fireBunnyArrow();updateFireArchery(2);fireArrow.cooldown=0;fireBunnyArrow()');assert.equal(run('fireArrow.recharge'),2);run('updateFireArchery(1)');assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);
 run("state='map';var beforeRecharge=fireArrow.recharge;update(2)");assert.equal(run('fireArrow.recharge'),run('beforeRecharge'));
 run("state='playing';respawnFire()");assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);assert(run('fireArrow.owned'));reset();assert.equal(run('fireArrow.ammo.filter(Boolean).length'),5);assert(!run('fireArrow.owned'));
}
// Real swept projectiles apply one damage event to zombies and the king.
for(const [type,damage] of [['normal',1],['fire',2],['rainbow',3]])for(const fps of [30,60,120]){
 arena();run(`fireArrow.ammo.fill('${type}');fireBunnyArrow()`);assert.equal(run('bunnyArrows[0].damage'),damage);assert.equal(run('bunnyArrows[0].type'),type);
 for(let i=0;i<fps*.4;i++)run(`updateFireArchery(1/${fps})`);assert.equal(run('lavaKing.hp'),10-damage);
 arena();run(`lavaKing.active=false;var zp=arrowOrigin();fireZombies=[{x:zp.x+100,y:zp.y-25,w:48,h:72,hp:4.5,alive:true,dizzy:0}];fireArrow.ammo.fill('${type}');fireBunnyArrow()`);
 for(let i=0;i<fps*.3;i++)run(`updateFireArchery(1/${fps})`);assert.equal(run('fireZombies[0].hp'),4.5-damage);assert.equal(run('bunnyArrows.length'),0);
 arena();run(`lavaKing.hp=1;fireArrow.ammo.fill('${type}');fireBunnyArrow();updateFireArchery(.3)`);assert.equal(run('lavaKing.hp'),0);assert(run('lavaKing.defeated'));
 arena();run(`lavaKing.phase='shield';fireArrow.ammo.fill('${type}');fireBunnyArrow();updateFireArchery(.3)`);assert.equal(run('lavaKing.hp'),10);assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);
}
console.log('PASS arrow upgrade: varied reachable pickups, checkpoint persistence, exact 89/10/1 thresholds, five-shot limit, sequential 3-second returns, pause/stow/reset, real 1/2/3-heart hits and shield blocking at 30/60/120 FPS.');
