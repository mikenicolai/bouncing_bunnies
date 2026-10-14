const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
for(const fps of [30,60,120]){
 const tick=(fn,seconds)=>{for(let i=0;i<Math.round(seconds*fps);i++)run(`${fn}(1/${fps})`);};
 // Interrupt every Water windup just before it would produce an attack.
 for(const mode of ['tideWarn','thrustWarn','volleyWarn','thrust']){
  run(`level='water';resetGame();player.inWater=true;waterTrident.owned=true;waterAquaSuit=true;neptunus.active=true;neptunus.mode='${mode}';neptunus.age=.89;neptunus.cooldown=0;player.x=neptunus.x+10;player.y=neptunus.y+80;neptunusShots=[{x:player.x,y:player.y,r:23,vx:0,vy:0,life:3,kind:'tide'}]`);
  assert(run('hitNeptunus()'));assert.equal(run('neptunus.hp'),9);assert.equal(run('neptunusShots.length'),0);
  const before=run('JSON.stringify({x:neptunus.x,y:neptunus.y})');
  tick('updateNeptunus',1);
  assert.equal(run('neptunus.mode'),'hurt');assert.equal(run('JSON.stringify({x:neptunus.x,y:neptunus.y})'),before);
  assert.equal(run('lives'),3,'a struck boss cannot hurt the bunny while stunned');
  assert(!run('hitNeptunus()'),'one heart per hurt window');
  run('player.x=WATER_ARENA.left+100');tick('updateNeptunus',.6);
  assert.equal(run('neptunus.mode'),'idle');assert.equal(run('neptunusShots.length'),0,'recovery does not spawn a retaliation');
  run('neptunus.dizzy=0;neptunus.hp=6;hitNeptunus()');assert(run('waterTrident.cyber'));
  run('neptunus.dizzy=0;hitNeptunus()');assert(run('waterTrident.cyber'),'upgrade stays on below five hearts');
 }
 // The shorter dash keeps swept movement and ends after roughly 490px.
 run("level='water';resetGame();player.inWater=true;waterTrident.owned=true;waterAquaSuit=true;waterSharks=[];waterPirates=[];player.x=11500;player.y=1150;waterGate.phase='open';waterTrident.mode='dash';attack()");
 tick('update',.7);assert(run('player.x>11985&&player.x<12005&&waterTrident.dash===0'),'shortened dash travels about 490px in .68s');
 // Return from 650px away takes under half a second, including cooldown.
 run("waterTrident.dash=0;waterTrident.cooldown=.3;waterTrident.shot={x:player.x+21+650,y:player.y+29,returning:true,age:.9}");
 tick('updateWaterTrident',.5);assert.equal(run('waterTrident.shot'),null);assert.equal(run('waterTrident.cooldown'),0);
 // Both Wildwood forms cancel their action, hazards and pending projectiles.
 for(const stage of ['small','giant'])for(const phase of stage==='small'?['swipe']:['rock','quake','mountain','vine']){
  run(`level='earth';resetGame();earthBoss.active=true;earthBoss.stage='${stage}';earthBoss.hp=5;earthBoss.phase='${phase}';earthBoss.phaseAge=.69;earthBoss.cooldown=0;earthBoss.shot=false;earthBossVine={grabbed:false,age:.1};earthBossMountains=[{x:7400,age:0}];player.x=7000;player.y=EARTH_ARENA.floor-58`);
  assert(run(`hitEarthBoss('${stage==='giant'?'knife':'punch'}')`));
  const x=run('earthBoss.x');tick('updateEarthBoss',.5);
  assert.equal(run('earthBoss.x'),x);assert.equal(run('earthBoss.phase'),'idle');assert.equal(run('earthBoss.phaseAge'),0);
  assert.equal(run('earthBossRocks.length+earthBossWaves.length+earthBossMountains.length'),0);assert.equal(run('earthBossVine'),null);
  tick('updateEarthBoss',.7);assert.equal(run('earthBoss.phase'),'idle','next attack still waits for its cooldown');
 }
 // Tempest visibly stops and cancels gusts, then waits before firing again.
 for(const source of ['punch','star']){
  run("level='air';resetGame();bossAwake=true;bossTime=5;player.x=5100;player.y=-1748;tempest.shotCooldown=0;updateTempest(0)");
  assert(run('tempestWinds.length>0'));assert(run(`hitTempest('${source}')`));
  assert.equal(run('tempestWinds.length'),0);const x=run('tempest.x');
  run('bossTime+=.5');tick('updateTempest',.5);assert.equal(run('tempest.x'),x);assert.equal(run('tempestWinds.length'),0);
 }
}
console.log('PASS boss hit reactions: Water windup/lunge cancellation, harmless stationary hurt windows, five-heart cyber unlock, shorter dash and faster return; both Wildwood forms interrupt all attacks; Tempest stops and cancels gusts at 30/60/120 FPS.');
