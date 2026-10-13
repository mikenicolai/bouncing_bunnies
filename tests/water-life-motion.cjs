const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function reset(){run("keys.clear();level='water';resetGame();soundOn=false;player.invincible=99");}
// One world second passes on shore, swimming and breaching, at every supported rate.
for(const fps of [30,60,120])for(const mode of ['shore','swim','breach']){
 reset();
 if(mode!=='shore')run(`player.inWater=true;player.x=1800;player.y=WATER_SURFACE-WATER_FLOAT_HEAD;player.air=WATER_AIR;player.breaching=${mode==='breach'};player.vy=${mode==='breach'?-250:0}`);
 const before=run('waterTime');
 for(let i=0;i<fps;i++)run(`update(1/${fps})`);
 assert(Math.abs(run('waterTime')-before-1)<1e-9,`${mode}: clock advances once per tick at ${fps} FPS`);
 assert.equal(run('state'),'playing');
 if(mode==='shore')assert(!run('player.inWater'),'dry bunny stays on shore');
}
// Pausing, death and the fake ad cannot animate the reef or spend game time.
for(const state of ['map','developer','lost','reviveAd']){
 reset();const before=run('waterTime');run(`state='${state}';update(.25);updateWorld(.25)`);
 assert.equal(run('waterTime'),before,`${state} freezes water animation`);
}
reset();run("level='earth';resetGame();var previousWaterTime=waterTime;update(.25)");assert(run('waterTime===previousWaterTime'),'other worlds do not tick Water');
reset();run('waterTime=12;resetGame()');assert.equal(run('waterTime'),0,'new Water run resets the clock');
// Measure the actual path on either side of each pose; artwork must face its movement.
const failure=run(`(()=>{
 const check=(pose,i,t,kind)=>{
  const p=pose(i,t),dx=pose(i,t+.0001).x-pose(i,t-.0001).x;
  if(Math.abs(dx)>1e-8&&p.direction!==Math.sign(dx))return {kind,i,t,dx,direction:p.direction};
 };
 for(let frame=0;frame<720;frame++){
  const t=frame/6;
  for(let school=0;school<21;school++){const fail=check((i,t)=>waterFishPose(i,0,t),school,t,'fish');if(fail)return fail;}
  for(let i=0;i<5;i++){const fail=check(waterTurtlePose,i,t,'turtle');if(fail)return fail;}
 }
 // Check both sides of every first reversal, including alternating school paths.
 for(let school=0;school<21;school++){
  const t=((Math.PI/2-school)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)/.55;
  if(waterFishPose(school,0,t-.01).direction===waterFishPose(school,0,t+.01).direction)return {kind:'fish turn',school,t};
 }
 for(let i=0;i<5;i++){
  const t=((Math.PI/2-i)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)/.33;
  if(waterTurtlePose(i,t-.01).direction===waterTurtlePose(i,t+.01).direction)return {kind:'turtle turn',i,t};
 }
 return null;
})()`);
assert.equal(failure,null,JSON.stringify(failure));
console.log('PASS reef motion: shore/swim/breach clocks at 30/60/120 FPS, pause/death/ad/reset, and actual fish/turtle travel directions through two minutes and reversals.');
