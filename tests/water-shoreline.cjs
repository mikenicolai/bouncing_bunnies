const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function reset(x=1800){run(`keys.clear();joystick.dx=joystick.dy=0;level='water';resetGame();soundOn=false;player.invincible=999;player.inWater=true;player.x=${x};player.y=WATER_SURFACE-WATER_FLOAT_HEAD;player.vx=player.vy=0;player.facing=-1`);}
for(const fps of [30,60,120]){
 for(const jumpOut of [false,true]){
  reset(jumpOut?1600:1800);run(`keys.add('ArrowLeft');${jumpOut?'jump();':''}`);
  let exited=false,landed=false,airborneExit=false;
  for(let frame=0;frame<fps*3;frame++){
   const x=run('player.x');run(`update(1/${fps})`);
   assert(Math.abs(run('player.x')-x)<300/fps,'crossing the shoreline cannot teleport the bunny');
   assert(run('player.y+player.h<=waterFloorY(player.x+player.w/2)+.01'),'the bunny never passes through the sand');
   if(!run('player.inWater')){exited=true;if(!run('player.onGround'))airborneExit=true;else landed=true;}
  }
  assert(exited&&landed,`${jumpOut?'jump':'swim'} out reaches solid land at ${fps} FPS`);
  if(jumpOut)assert(airborneExit,'jump-out preserves the airborne part of the leap');
  assert(run('player.x<1350 && !player.inWater && !player.breaching && player.onGround'));
  assert.equal(run('player.y+player.h'),350);assert.equal(run('lives'),3);assert.equal(run('state'),'playing');
  run('keys.clear();jump()');assert(run('player.vy<0&&!player.onGround&&!player.inWater'),'ordinary jumping works after landing');
 }
 // Repeated shore crossings use ordinary movement; no resets or position changes between trips.
 reset(1600);run("keys.add('ArrowLeft')");for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 for(let trip=0;trip<3;trip++){
  run("keys.clear();keys.add('ArrowRight')");for(let f=0;f<fps*2;f++)run(`update(1/${fps})`);
  assert(run('player.inWater&&player.x>1700'),'walking down the bank re-enters swimming');
  run("keys.clear();keys.add('ArrowLeft')");for(let f=0;f<fps*4&&run('player.x>1380');f++)run(`update(1/${fps})`);
  assert(run('!player.inWater&&player.onGround&&player.x<1450'),'swimming back returns to walking each time');
 }
 // Moving against the bank while deep underwater cannot walk through it.
 reset(1900);run("player.y=waterFloorY(player.x+player.w/2)-player.h;keys.add('ArrowLeft');keys.add('ArrowDown')");
 for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 assert(run('player.inWater&&player.x>1600'),'deep water remains swimming and the bank remains solid');
 assert(run('player.y+player.h<=waterFloorY(player.x+player.w/2)+.01'));
}
console.log('PASS shoreline: swim-out, jump-out and normal landing/jumping, no teleport or sand penetration, repeated enter/exit and deep-bank collision at 30/60/120 FPS.');
