const assert=require('node:assert/strict');
const {run,reset,place,step}=require('./air.cjs');
assert(run("airMonsters.length===2&&airMonsters.every(m=>m.platform.kind==='white'&&m.platform.w>=300)"));
for(const fps of [30,60,120]){
 reset();run('player.airCloud=airPlatforms[6];player.x=1350;player.y=342;');
 const x=run('airMonsters[0].x');run(`updateAirMonsters(1/${fps})`);
 assert(run('airMonsters[0].x')<x);assert.equal(run('airMonsters[0].facing'),-1);
 // Remain interested throughout a jump over this cloud, reversing to follow.
 run('player.x=1620;player.y=140');run(`updateAirMonsters(1/${fps})`);
 assert.equal(run('airMonsters[0].facing'),1);assert(run('airMonsters[0].walking'));
 assert.equal(run('airMonsters[0].y+airMonsters[0].h'),400);
 run('player.airCloud=airPlatforms[5]');const stopped=run('airMonsters[0].x');run('updateAirMonsters(.5)');
 assert.equal(run('airMonsters[0].x'),stopped);assert(!run('airMonsters[0].walking'));
 run('player.airCloud=airPlatforms[6];player.y=-100');run('updateAirMonsters(.5)');assert.equal(run('airMonsters[0].x'),stopped,'cloud above never triggers chase');
 run('player.y=342;player.x=1900');run('updateAirMonsters(8)');assert.equal(run('airMonsters[0].x'),stopped,'do not follow off the cloud');
 run('player.x=airMonsters[0].x;player.y=342;player.invincible=0;updateAirMonsters(0)');assert.equal(run('lives'),2);
 run('updateAirMonsters(0)');assert.equal(run('lives'),2,'contact respects immunity');
 // A complete descent through the production movement/collision integrator.
 for(const width of [480,960]){
  reset();run(`W=${width};H=${width===480?960:540};`);place(5900,-1748);step(2);
  let blueJump=false;let minLives=3;let cleared=0;
  for(let f=0;f<fps*30&&run("state==='playing'");f++){
   const feet=run('player.y+player.h');
   const obstacles=run('descentObstacles.map(o=>({y:o.y,h:o.h,x:o.x}))');
   while(cleared<obstacles.length&&run('player.y')>obstacles[cleared].y+obstacles[cleared].h+15)cleared++;
   let aim=cleared<obstacles.length?(obstacles[cleared].x===6000?6470:6150):6775;
   if(cleared===3&&!run('descentBlueReached'))aim=6320;
   if(run('player.blueContact?.platform===airPlatforms[20]')&&!blueJump){run('jump()');blueJump=true;}
   if(!run('descentStarted'))aim=6470;
   run(`{const error=${aim}-player.x-21-player.vx*.16;keys.clear();if(error>5)keys.add('ArrowRight');else if(error<-5)keys.add('ArrowLeft');update(1/${fps});}`);
   minLives=Math.min(minLives,run('lives'));
  }
  assert(blueJump,`blue waypoint reached at ${fps} FPS width ${width}`);
  assert.equal(run('state'),'map',`descent completes at ${fps} FPS width ${width}`);
  assert.equal(minLives,3,`descent safe at ${fps} FPS width ${width}`);
 }
}
// Idle glance/blink frames and four walk frames; facing is a renderer transform.
reset();run('airMonsters[0].walking=true');
for(let f=0;f<4;f++){run(`airMonsters[0].phase=${f}`);assert.equal(run('airMonsterFrame(airMonsters[0])'),4+f);}
// Missed blue/final landings return to the summit, not into the void.
reset();run('beginDescent();descentBlueReached=true');place(6200,1900);step();assert.equal(run('player.x'),5890);assert.equal(run('player.y'),-1748);assert(!run('descentBlueReached'));
reset();run('beginDescent()');place(6100,700);step(2);assert.equal(run('lives'),2);assert.equal(run('player.x'),5890);
run("level='meadow';resetGame()");assert.equal(run('enemies.length'),9);assert(!run('descentStarted'));
console.log('PASS: same-cloud chase; reverse/stop/edge bounds; grounded feet; contact immunity; left/right animation states; full no-damage descent with blue jump at 30/60/120 FPS on phone/desktop; missed-waypoint recovery.');
