const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=(width=960)=>run(`meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';W=${width};H=${width===480?960:540};start();soundOn=false;finalMonsters=[];player.x=FINAL_TOWER.entryX;player.y=FINAL_FLOOR-player.h;player.onGround=true;update(0)`);
assert.equal(run('FINAL_TOWER.height'),3*540);
for(const width of [960,480])for(const fps of [30,60,120]){
 reset(width);const tick=()=>run(`update(1/${fps})`);
 assert(run('finalTowerEntered'));assert.equal(run('checkpoint.x'),run('FINAL_TOWER.entryX'));
 const baseCheckpoint=run('JSON.stringify(checkpoint)');let previous=run('finalTowerPlatforms[0]');
 for(let id=1;id<=12;id++){
  const target=run(`finalTowerPlatforms[${id}]`),right=target.x>previous.x;
  const launch=right?previous.x+previous.w-64:previous.x+22;
  for(let frame=0;frame<fps*3;frame++){
   const x=run('player.x');if(Math.abs(x-launch)<8)break;
   run(`keys.clear();keys.add('${x<launch?'ArrowRight':'ArrowLeft'}')`);tick();
  }
  assert(run('player.onGround'),`launch ${id} is on stone at ${fps} FPS`);
  run(`keys.clear();keys.add('${right?'ArrowRight':'ArrowLeft'}');jump()`);
  let boosted=0,landed=false;
  const landing=right?target.x+45:target.x+target.w-87;
  for(let frame=0;frame<fps*2;frame++){
   const age=run('player.jumpAge');if(boosted<2&&age>=(boosted+1)*.06){run('jump()');boosted++;}
   const x=run('player.x'),vx=run('player.vx'),dx=landing-x-vx*.16;
   run(`keys.clear();${Math.abs(dx)>5?`keys.add('${dx>0?'ArrowRight':'ArrowLeft'}')`:''}`);tick();
   if(run('player.onGround')){landed=true;break;}
  }
  assert(landed,`platform ${id} has a reachable landing at ${fps} FPS`);
  assert(Math.abs(run('player.y+player.h')-target.y)<1,`platform ${id} at ${fps} FPS: ${run('JSON.stringify({x:player.x,y:player.y,vy:player.vy,lives,state})')}`);
  // Walk along the ledge to its coin; the traversal uses normal movement throughout.
  const coinX=target.x+target.w*.5-21;
  for(let frame=0;frame<fps*2&&run("state==='playing'");frame++){
   const x=run('player.x');if(Math.abs(x-coinX)<7)break;
   run(`keys.clear();keys.add('${x<coinX?'ArrowRight':'ArrowLeft'}')`);tick();
  }
  run('keys.clear()');
  assert.equal(run('lives'),3);assert.equal(run('JSON.stringify(checkpoint)'),baseCheckpoint,'no safe checkpoint halfway up the lava shaft');
  if(id<12)assert.equal(run('state'),'playing','only the summit finishes this chapter');
  previous=target;
 }
 assert.equal(run('state'),'castleOpeningComplete');assert(!run("worldCompleted('final')"));assert(run('cameraY<-900'),'camera follows the three-screen climb');
 assert.equal(run('score'),12,'each climbing coin credits the real collection path');
}
// Lava ignores damage immunity, returns to the entrance and retains collected coins/gear.
for(const fps of [30,60,120]){
 reset();run("coinWallet=20;collectCoin(coins.at(-1));player.x=9200;player.y=FINAL_TOWER.lavaY-65;player.vy=850;player.onGround=false;player.invincible=99;fireArrow.ammo=['normal',null,'fire','rainbow',null];cameraY=-900");
 run(`update(1/${fps})`);assert.equal(run('lives'),2);assert.equal(run('player.x'),run('FINAL_TOWER.entryX'));assert.equal(run('cameraY'),0);assert.equal(run('coinWallet'),21);assert(run('coins.at(-1).taken'));assert.equal(run('JSON.stringify(fireArrow.ammo)'),JSON.stringify(['normal',null,'fire','rainbow',null]));
 run('lives=1;player.x=9200;player.y=FINAL_TOWER.lavaY-50;player.vy=850;player.onGround=false');run(`update(1/${fps})`);assert.equal(run('state'),'lost');assert(run('buyReviveHeart()'));assert.equal(run('player.x'),run('FINAL_TOWER.entryX'));assert.equal(run('coinWallet'),1);assert(run('finalTowerEntered'));assert(run('coins.at(-1).taken'));assert.equal(run('JSON.stringify(fireArrow.ammo)'),JSON.stringify(['normal',null,'fire','rainbow',null]));assert(run('fireArrow.owned'));
}
reset();run('finalTowerDoorLift=.5;finalTowerEntered=true;start()');assert(!run('finalTowerEntered'));assert.equal(run('finalTowerDoorLift'),0,'restart resets the tower door and run');
console.log('PASS Castle tower: actual three-screen climb with limited boosted jumps and 12 coins at 30/60/120 FPS on desktop/phone; summit-only chapter end, vertical camera, lava and checkpoint/revive preserving wallet/gear, restart reset.');
