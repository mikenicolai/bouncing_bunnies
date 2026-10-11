const assert=require('node:assert/strict');
const {run,reset}=require('./air.cjs');
const counts={};
for(const fps of [30,60,120]){
 for(const world of ['air','earth','water','fire']){
  run(`level='${world}';resetGame();cameraX=0;cameraY=0`);
  assert.equal(run('backgroundBirds.length'),0,'each run begins with an empty sky');
  let quiet=0,birdSeconds=0,maxBirds=0;
  for(let frame=0;frame<fps*180;frame++){
   run(`updateBackgroundBirds(1/${fps})`);
   const count=run('backgroundBirds.length');maxBirds=Math.max(maxBirds,count);
   if(!count)quiet++;birdSeconds+=count/fps;
   if(world==='water')assert(run('backgroundBirds.every(b=>backgroundBirdPose(b).y< WATER_SURFACE-30)'), 'gulls stay above the waterline');
  }
  assert(quiet>fps*4,`${world} has quiet gaps`);
  if(world==='fire')assert.equal(maxBirds,0,'no birds in Fire');
  else{assert(maxBirds>0&&maxBirds<=5);assert(run('backgroundFlockNumber>1'),'birds return occasionally');}
  counts[world]=birdSeconds;
 }
 assert(counts.air>counts.earth*2&&counts.earth>counts.water,'Air has the most birds, Water and Earth only occasional flocks');
}
// Pausing freezes wing animation and flight, restarting clears the old flock.
run("level='air';resetGame();updateBackgroundBirds(6);state='map';var frozenBird=JSON.stringify(backgroundBirds);update(.5)");
assert.equal(run('JSON.stringify(backgroundBirds)'),run('frozenBird'));
run('resetGame()');assert.equal(run('backgroundBirds.length'),0);
// Camera scrolling applies gentle parallax; water birds disappear with the sky.
run("level='water';resetGame();cameraX=0;cameraY=0;for(let i=0;i<1200;i++)updateBackgroundBirds(1/60);var bird=backgroundBirds[0];var pose=backgroundBirdPose(bird);cameraX=100;cameraY=100");
assert(Math.abs(run('pose.x-backgroundBirdPose(bird).x')-12)<.0001);
assert(Math.abs(run('pose.y-backgroundBirdPose(bird).y')-100)<.0001);
run('cameraY=WATER_SURFACE+100;var birdDraws=0;ctx.save=()=>{};ctx.restore=()=>{};ctx.translate=()=>birdDraws++;drawBackgroundBirds()');
assert.equal(run('birdDraws'),0,'nothing flies through submerged caves');
run("level='fire';drawBackgroundBirds()");assert.equal(run('birdDraws'),0,'Fire skips bird rendering as well as spawning');
reset();console.log('PASS background birds: occasional flocks, Air density, empty Fire sky, surface-only gulls, parallax, pause and restart at 30/60/120 FPS.');
