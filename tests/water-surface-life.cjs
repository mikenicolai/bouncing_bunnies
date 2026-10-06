const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';resetGame();soundOn=false");
// Hold Up and swim strokes in every breathing chamber. The head reaches air,
// while the swimming body remains in water, even after a drowning respawn.
for(const fps of [30,60,120])for(let index=0;index<9;index++){
 reset();run(`var pocket=waterAirPockets[${index}];player.inWater=true;player.invincible=99;player.x=pocket.x+pocket.w/2-player.w/2;player.y=pocket.surface+60;player.air=5;keys.add('ArrowUp')`);
 for(let frame=0;frame<fps*3;frame++){
  if(frame%fps===0)run('jump()');
  run(`update(1/${fps})`);
  assert(run('player.y>=pocket.surface-WATER_FLOAT_HEAD'),'swimming cannot lift the body into dry air');
  assert(!run('player.breaching'),'strokes cannot become air jumps inside recesses');
 }
 assert(run('waterBreathing() && player.air===WATER_AIR'),'surface contact replenishes breath');
 run('keys.clear();player.y=pocket.surface+80;player.vy=0;player.air=.001');run(`update(1/${fps})`);
 assert.equal(run('lives'),2);
 assert(run('waterBreathing()&&player.y===pocket.surface-WATER_FLOAT_HEAD'),'respawn floats at the saved waterline');
}
// The old floating position leaves the painted face submerged: no air there.
reset();run('var pocket=waterAirPockets[0];player.inWater=true;player.x=pocket.x+pocket.w/2-player.w/2;player.y=pocket.surface-30;player.air=2;update(1/60)');
assert(run('player.air<2'),'breath only refills once the head is out of the water');
// A two-minute sweep covers every school through its full oscillation.
reset();const collision=run(`(()=>{
 for(let frame=0;frame<7200;frame++)for(let school=0;school<21;school++)for(let i=0;i<5;i++){
  const p=waterFishPose(school,i,frame/60),box={x:p.x-20,y:p.y-8,w:40,h:16};
  if([...waterReefs,...waterShipDeck].some(r=>overlap(box,r)))return {frame,school,i,p};
  for(const x of [box.x,p.x,box.x+box.w]){
   const roof=x<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,x);
   if(box.y<roof||box.y+box.h>waterFloorY(x))return {frame,school,i,p,boundary:true};
  }
 }
 return null;
})()`);
assert.equal(collision,null,JSON.stringify(collision));
assert(run('waterPlatforms[0].x<-100&&waterPlatforms[0].x+waterPlatforms[0].w===WATER_FLOOR[0][0]'),'the starting sand extends beyond the screen and still joins the shore');
console.log('PASS: surface-only breathing and respawns in all cave/ship chambers at 30/60/120 FPS; fish stay clear of stone, roof and floor for two minutes; filled beach start.');
