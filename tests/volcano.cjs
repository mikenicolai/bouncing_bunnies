const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function slope(x=3350,vx=0){run(`level='fire';resetGame();fireMode='volcano';player.x=${x};player.y=fireSlopeY(player.x+21)-58;player.vx=${vx};player.onGround=true;fireStoneClock=100;`);}
// Jumps keep useful height relative to the slope in either direction.
for(const fps of [30,60,120])for(const direction of [-1,1]){
  slope(3350,direction*260);run(`keys.add('${direction>0?'ArrowRight':'ArrowLeft'}');jump()`);
  let clearance=0;
  for(let f=0;f<fps*1.3;f++){
    run(`update(1/${fps})`);
    clearance=Math.max(clearance,run('fireSlopeY(player.x+21)-(player.y+player.h)'));
  }
  assert(clearance>120,`jump clearance at ${fps} FPS, direction ${direction}`);
  assert(run('player.onGround'),'lands back on the slope');
  assert.equal(run('player.y+player.h'),run('fireSlopeY(player.x+21)'));
}
// Running and hopping leave roughly two-thirds of the view ahead of the bunny.
for(const width of [480,960])for(const fps of [30,60,120]){
  slope(3200,260);run(`W=${width};keys.add('ArrowRight')`);
  for(let f=0;f<fps*1.5;f++)run(`update(1/${fps})`);
  run('jump()');let highest=0;
  for(let f=0;f<fps;f++){
    run(`update(1/${fps})`);
    const screenX=run('player.x+player.w/2-cameraX');
    assert(Math.abs(screenX-width/3)<12,`one-third framing at ${width}/${fps}`);
    const feet=run('player.y+player.h-cameraY');
    assert(feet>65&&feet<run('H*.9'),'whole jump remains visible');
    highest=Math.max(highest,run('fireSlopeY(player.x+21)-(player.y+player.h)'));
  }
  assert(highest>120);
}
// Upright jumping keeps the actual slope-relative arc; four paws are grounded only.
slope();run('player.attack=0;player.duck=false;player.duckVisual=0;player.landingPaint=0');
assert.equal(run('paintedBunnyPose().name'),'fourRun');
run('jump()');assert.equal(run('paintedBunnyPose().name'),'uprightJump');assert(!run('fireHillCrawlMode()'));
// Animation reaches its apex relative to the rising ground, rather than world height.
slope(3350,260);run('player.onGround=false;player.vy=fireSlopeGrade(3371)*260');assert.equal(run('fourPawFrame()'),6);
// A single ordinary jump dodges each approaching stone across viewport sizes.
for(const width of [480,960])for(const fps of [30,60,120]){
  slope(2690);run(`W=${width};keys.add('ArrowRight');resetFireStones();jump()`);let hops=0;
  for(let f=0;f<fps*14&&run("fireMode==='volcano'");f++){
    if(run('player.onGround&&fireRollingStones.some(s=>s.x>player.x&&s.x-player.x<150)')){run('jump()');hops++;}
    run(`update(1/${fps})`);
  }
  assert(hops>=3,'stones require jumps along the ascent');
  assert.equal(run('lives'),3,'no damage when jumping over stones');
  assert.equal(run('fireMode'),'dropper');
}
// Contact costs one life, then normal immunity prevents repeated damage.
slope();run('fireRollingStones=[{x:player.x+21,y:player.y+40,r:21,speed:0,angle:0,variant:0,alive:true}];updateFireStones(0)');
assert.equal(run('lives'),2);assert(run('player.invincible>0'));
run('fireRollingStones=[{x:player.x+21,y:player.y+40,r:21,speed:0,angle:0,variant:0,alive:true}];updateFireStones(0)');
assert.equal(run('lives'),2);
// The touch stick can jump on the slope and rearms only after neutral.
slope();run('updateJoystick({x:JOY.x,y:JOY.y-JOY.radius})');
assert(!run('player.onGround'));assert.equal(run('player.boosts'),0);
run('updateJoystick({x:JOY.x,y:JOY.y-JOY.radius})');assert.equal(run('player.boosts'),0);
run('updateJoystick({x:JOY.x,y:JOY.y});updateJoystick({x:JOY.x,y:JOY.y-JOY.radius})');assert.equal(run('player.boosts'),1);
// Map pauses stones; restart removes hazards and restores the spawn delay.
slope();run("fireStoneClock=0;updateFireStones(0);state='map';const before=fireRollingStones[0].x;update(.1)");
assert.equal(run('fireRollingStones[0].x'),run('before'));
run('resetGame()');assert.equal(run('fireRollingStones.length'),0);assert.equal(run('fireStoneClock'),1.2);
// No late surprise stone spawns immediately beside the summit.
slope(4300);run('fireStoneClock=0;updateFireStones(.1)');assert.equal(run('fireRollingStones.length'),0);
console.log('PASS volcano: uphill/downhill jumps, landing, rolling-stone dodges at phone/desktop widths and 30/60/120 FPS, damage/immunity, touch rearming, pause/reset and summit fairness.');
