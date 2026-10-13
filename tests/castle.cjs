const assert=require('node:assert/strict');
const {run,step}=require('./air.cjs');
const clear=()=>run('meadowFinished=false;airFinished=false;waterFinished=false;earthFinished=false;fireFinished=false;keys.clear();soundOn=false');
clear();
run('const castleSaved=new Map();window.localStorage={getItem:k=>castleSaved.get(k)||null,setItem:(k,v)=>castleSaved.set(k,v)}');
assert.equal(run('nextWorld()'),'meadow');assert(!run('finalUnlocked()'));
// Normal progression starts with Meadow; neither the map nor a start can skip it.
for(const world of ['air','water','earth','fire','final'])assert(!run(`canPlayWorld('${world}')`));
run("level='final';start()");assert.equal(run('state'),'map');assert.equal(run('selectedWorld'),'meadow');
// Death never records completion. Every victory advances exactly one world.
run("level='meadow';resetGame();showEnd(false)");assert(!run('meadowFinished'));assert.equal(run('nextWorld()'),'meadow');
for(const [world,next] of [['meadow','air'],['air','water'],['water','earth'],['earth','fire'],['fire','final']]){
  run(`level='${world}';resetGame();showEnd(true)`);assert(run(`worldCompleted('${world}')`));assert.equal(run('selectedWorld'),next);assert(run(`canPlayWorld('${next}')`));
}
assert(run('finalUnlocked()'));assert(run("canPlayWorld('final')"));
assert(run('FINAL_W>=8500'));
assert.equal(run("finalMonsterSpawns.map(s=>s[0]).join(',')"),'zombie,goblin,pirate,air,lava,goblin,zombie,air,pirate');
const saved=run('castleSaved.get(WORLD_PROGRESS_KEY)');assert.equal(JSON.parse(saved).completed.fire,true);
clear();run('restoreWorldProgress()');assert(run('finalUnlocked()'),'completion survives reload');
run('castleSaved.set(WORLD_PROGRESS_KEY,\'{"version":1,"completed":{"air":"true","water":true,"earth":true}}\')');clear();run('restoreWorldProgress()');assert(!run('airFinished'));assert(!run('finalUnlocked()'));
run("castleSaved.set(WORLD_PROGRESS_KEY,'broken JSON')");run('restoreWorldProgress()');assert(!run('finalUnlocked()'));
run('window.localStorage={getItem(){throw Error("blocked")},setItem(){throw Error("blocked")}};completeWorld("air")');assert(run('airFinished'),'blocked storage still allows session progress');
run("['meadow',...WORLD_ORDER].forEach(completeWorld)");
run("level='final';start();soundOn=false");
assert.equal(run('finalMonsters.length'),9);
run("{const m=finalMonsters[0];player.x=m.x-43;player.y=m.y;player.facing=1;player.attackCooldown=0;attack()}");
assert.equal(run('finalMonsters[0].hp'),1,'a castle zombie can be punched');
run('finalMonsters[0].dizzy=0;player.attackCooldown=0;attack()');
assert.equal(run('finalMonsters[0].alive'),false,'a regular monster can be defeated');
run("{const m=finalMonsters[1];player.x=m.x-43;player.y=m.y;player.facing=1;player.attackCooldown=0;attack()}");
assert.equal(run('finalMonsters[1].hp'),1,'a castle goblin can be punched');
run("{const m=finalMonsters.find(m=>m.kind==='pirate');m.swingCooldown=0;player.x=m.x+45;player.y=m.y;player.invincible=0;updateFinalMonsters(.1)}");
assert(run('finalMonsters.some(m=>m.kind===\'pirate\'&&m.swing>0)'),'castle pirates attack');
// Closed gate blocks passage; earned elements raise it. The real integrator can traverse the entire opening.
run("level='final';start();player.x=FINAL_GATE.x-20;player.y=FINAL_FLOOR-58;player.vx=260;updateFinalCastle(0)");assert.equal(run('player.x'),run('FINAL_GATE.x-player.w'));
run('updateFinalCastle(1.4)');assert.equal(run('finalGateLift'),1);
for(const fps of [30,60,120]){
  run("level='final';start();player.onGround=true;player.y=FINAL_FLOOR-58;player.invincible=1000;keys.add('ArrowRight')");
  const jumps=[855,2090,3370,3850,4320];let nextJump=0;
  for(let frame=0;frame<fps*50&&run("state==='playing'&&!(finalTowerEntered&&player.x>FINAL_TOWER.left)");frame++){
    if(nextJump<jumps.length&&run('player.onGround')&&run('player.x')>=jumps[nextJump]){run('jump()');nextJump++;}
    run(`update(1/${fps})`);
  }
  assert.equal(run('state'),'playing');assert(run('finalTowerEntered'),`forest, gaps, gate and hall reach the tower at ${fps} FPS`);
  assert.equal(run('lives'),3,`terrain traversal is safe at ${fps} FPS`);
  assert.equal(run('finalGateLift'),1);assert(!run("worldCompleted('final')"),'opening does not claim the unbuilt villain is defeated');
}
run("level='final';start();player.x=1300;player.y=412;player.onGround=true;updateFinalCastle(.1)");const checkpointX=run('checkpoint.x');run('player.y=800');step();assert.equal(run('player.x'),checkpointX);assert.equal(run('lives'),2);assert(run('finalUnlocked()'));
console.log('PASS extended castle, nine cross-world enemies and combat, Meadow/four-world lock, gate, route at 30/60/120 FPS, checkpoints and no false final victory.');
