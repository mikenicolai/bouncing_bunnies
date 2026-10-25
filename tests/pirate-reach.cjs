const assert=require('node:assert/strict'),{run}=require('./air.cjs');
function reset(){run("level='water';resetGame();soundOn=false;waterSharks=[];waterPirates=[waterPirates[0]];var pirate=waterPirates[0];pirate.anchorX=2500;pirate.tetherPhase=0;pirate.swingCooldown=99;positionWaterPirate(pirate);player.inWater=true;player.invincible=0;player.vx=player.vy=0;waterAquaSuit=true;");}
for(const fps of [30,60,120]){
 // An empty gap of 25px is within Benny's punch reach and outside every weapon.
 for(const swing of [.65,.45,.25,.05])for(const side of [-1,1]){
  reset();run(`pirate.swing=${swing};player.x=pirate.x+${side<0?'-player.w-25':'pirate.w+25'};player.y=pirate.y+6;player.facing=${-side};updateWater(1/${fps})`);
  assert.equal(run('lives'),3,`safe punch approach from ${side}, swing ${swing}, ${fps} FPS`);
  run('attack()');assert.equal(run('pirate.hp'),1,'Benny can actually punch from this safe gap');assert.equal(run('pirate.swing'),0,'a punch interrupts the swing');
 }
 // The visible hook and blade remain dangerous at genuinely close range.
 for(const [swing,side] of [[.65,-1],[.45,1],[.25,-1],[.05,1]]){
  reset();run(`pirate.swing=${swing};{const b=pirateWeaponBox(pirate);player.x=pirate.x+${side<0?'-player.w-2':'pirate.w+2'};player.y=b.y+b.h/2-player.h/2;}updateWater(1/${fps})`);
  assert(!run('overlap(player,pirate)'),'weapon contact is tested separately from body contact');assert.equal(run('lives'),2,`close weapon ${swing} still hurts at ${fps} FPS`);
 }
 // Former phantom reach above the head and far outside the hook no longer hurts.
 for(const [swing,x,y] of [[.45,26,-125],[.65,-85,0],[.25,-85,0],[.05,80,-30]]){
  reset();run(`pirate.swing=${swing};player.x=pirate.x+${x};player.y=pirate.y+${y};updateWater(1/${fps})`);assert.equal(run('lives'),3,'empty water beyond the painted weapon is safe');
 }
}
reset();run('pirate.swing=.75');assert.equal(run('pirateWeaponBox(pirate)'),null,'initial windup stays harmless');
run('pirate.swing=0');assert.equal(run('pirateWeaponBox(pirate)'),null,'idle has no weapon hitbox');
// At both extremes of the chain's sway, a normal punch approach remains safe.
for(const angle of [-.5,.5])for(const swing of [.65,.45,.25,.05])for(const side of [-1,1]){
 reset();run(`pirate.tetherAngle=${angle};pirate.swing=${swing};player.x=pirate.x+${side<0?'-player.w-25':'pirate.w+25'};player.y=pirate.y+6;`);
 assert(!run('overlap(player,pirateWeaponBox(pirate))'),'swaying painting cannot restore the old reach');
}
// Castle pirates use the same shared weapon bounds.
run("meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();var castlePirate=finalMonsters.find(m=>m.kind==='pirate');castlePirate.swing=.05;");
assert.equal(run('pirateWeaponBox(castlePirate).x+pirateWeaponBox(castlePirate).w-castlePirate.x'),62);
console.log('PASS pirate reach: safe real punches from both sides in all four poses, close hook/blade hits, no distant phantom damage, unchanged windup and shared Castle bounds at 30/60/120 FPS.');
