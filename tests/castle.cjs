const assert=require('node:assert/strict');
const {run,step}=require('./air.cjs');
const clear=()=>run('meadowFinished=false;airFinished=false;waterFinished=false;earthFinished=false;fireFinished=false;keys.clear();soundOn=false');
clear();
run('const castleSaved=new Map();window.localStorage={getItem:k=>castleSaved.get(k)||null,setItem:(k,v)=>castleSaved.set(k,v)}');
assert.equal(run('nextWorld()'),'air');assert(!run('finalUnlocked()'));
// All elemental levels remain individually available, but neither selection nor start bypasses the castle lock.
for(const world of ['air','water','earth','fire'])assert(run(`canPlayWorld('${world}')`));
assert(!run("canPlayWorld('final')"));run("level='final';start()");assert.equal(run('state'),'map');
// Losing never records completion. Real victories recommend the first missing world, including out-of-order play.
run("level='fire';resetGame();showEnd(false)");assert(!run('fireFinished'));assert.equal(run('nextWorld()'),'air');
run("level='fire';resetGame();showEnd(true)");assert(run('fireFinished'));assert(!run('finalUnlocked()'));assert.equal(run('selectedWorld'),'air');
for(const [world,next] of [['air','water'],['water','earth'],['earth','final']]){
  run(`level='${world}';resetGame();showEnd(true)`);assert(run(`worldCompleted('${world}')`));assert.equal(run('selectedWorld'),next);
}
assert(run('finalUnlocked()'));assert(run("canPlayWorld('final')"));
const saved=run('castleSaved.get(WORLD_PROGRESS_KEY)');assert.equal(JSON.parse(saved).completed.fire,true);
clear();run('restoreWorldProgress()');assert(run('finalUnlocked()'),'completion survives reload');
run('castleSaved.set(WORLD_PROGRESS_KEY,\'{"version":1,"completed":{"air":"true","water":true,"earth":true}}\')');clear();run('restoreWorldProgress()');assert(!run('airFinished'));assert(!run('finalUnlocked()'));
run("castleSaved.set(WORLD_PROGRESS_KEY,'broken JSON')");run('restoreWorldProgress()');assert(!run('finalUnlocked()'));
run('window.localStorage={getItem(){throw Error("blocked")},setItem(){throw Error("blocked")}};completeWorld("air")');assert(run('airFinished'),'blocked storage still allows session progress');
run('WORLD_ORDER.forEach(completeWorld)');
// Closed gate blocks passage; earned elements raise it. The real integrator can traverse the entire opening.
run("level='final';start();player.x=FINAL_GATE.x-20;player.y=FINAL_FLOOR-58;player.vx=260;updateFinalCastle(0)");assert.equal(run('player.x'),run('FINAL_GATE.x-player.w'));
run('updateFinalCastle(1.4)');assert.equal(run('finalGateLift'),1);
for(const fps of [30,60,120]){
  run("level='final';start();player.onGround=true;player.y=FINAL_FLOOR-58;keys.add('ArrowRight')");
  const jumps=[855,2090,3370,3850,4320];let nextJump=0;
  for(let frame=0;frame<fps*35&&run("state==='playing'");frame++){
    if(nextJump<jumps.length&&run('player.onGround')&&run('player.x')>=jumps[nextJump]){run('jump()');nextJump++;}
    run(`update(1/${fps})`);
  }
  assert.equal(run('state'),'castleOpeningComplete',`forest, gaps, gate and hall are reachable at ${fps} FPS`);
  assert.equal(run('lives'),3,`opening traversal is safe at ${fps} FPS`);
  assert.equal(run('finalGateLift'),1);assert(!run("worldCompleted('final')"),'opening does not claim the unbuilt villain is defeated');
}
run("level='final';start();player.x=1300;player.y=412;player.onGround=true;updateFinalCastle(.1)");const checkpointX=run('checkpoint.x');run('player.y=800');step();assert.equal(run('player.x'),checkpointX);assert.equal(run('lives'),2);assert(run('finalUnlocked()'));
console.log('PASS persistent completion, ordered recommendations, independent worlds, four-world castle lock, gate blocking/lift, full opening at 30/60/120 FPS, checkpoint recovery and no false final victory.');
