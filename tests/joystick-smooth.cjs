const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='air';resetGame();platforms=[{x:0,y:440,w:2000,h:100}];player.x=100;player.y=382;player.onGround=true;player.vx=0;player.vy=0;player.invincible=999;");
const pull=(x,y)=>run(`updateJoystick({x:JOY.x+${x}*(JOY.radius-12),y:JOY.y+${y}*(JOY.radius-12)})`);
for(const fps of [30,60,120]){
 const speeds=[];
 for(const amount of [.1,.2,.4,.6,1]){
  reset();pull(amount,0);for(let i=0;i<fps;i++)run(`update(1/${fps})`);speeds.push(run('player.vx'));
 }
 assert.equal(speeds[0],0);for(let i=1;i<speeds.length;i++)assert(speeds[i]>speeds[i-1]);assert.equal(speeds.at(-1),360);assert(speeds[2]<130,'a gentle pull stays slow rather than eventually reaching full walk speed');
 reset();pull(1,0);run('joystick.active=true;joystick.pointerId=9');for(let i=0;i<fps/2;i++)run(`update(1/${fps})`);assert.equal(run('paintedBunnyPose().name'),'uprightRun');
 pull(.65,0);assert(run('joystick.sprint'),'sprint boundary hysteresis avoids jitter');pull(.55,0);assert(!run('joystick.sprint'));pull(1,0);run(`update(1/${fps})`);const before=run('player.vx');
 pull(-1,0);run(`update(1/${fps})`);assert(run('player.vx')>0,'reversing does not snap to the opposite speed');assert(before-run('player.vx')<=1900/fps+.001);for(let i=0;i<fps/2;i++)run(`update(1/${fps})`);assert.equal(run('player.vx'),-360);assert.equal(run('player.facing'),-1);
 run('releaseJoystick({pointerId:9})');assert(!run('sprintHeld()'));for(let i=0;i<fps/2;i++)run(`update(1/${fps})`);assert.equal(run('player.vx'),0,'releasing the stick brakes smoothly to a stop');
 // A strong upward pull spends the same limited boosts as quick extra taps.
 const peaks=[];
 for(const up of [.6,.7,1]){
  reset();pull(0,-up);const takeoff=run('player.vy');if(up===1){assert.equal(takeoff,-720);assert.equal(run('player.boosts'),2);}
  let peak=382;for(let i=0;i<fps*2;i++){run(`update(1/${fps})`);peak=Math.min(peak,run('player.y'));}
  peaks.push(382-peak);assert(run('player.onGround'));pull(0,-up);assert.equal(run('player.vy'),0,'holding up does not autojump after landing');
 }
 assert(peaks[2]>peaks[1]&&peaks[1]>peaks[0]);
 reset();pull(0,-.6);run(`update(1/${fps})`);pull(0,-1);assert.equal(run('player.vy'),-720,'a continuous drag can strengthen the initial hop');assert.equal(run('player.boosts'),2);
 for(let i=0;i<5;i++){pull(0,0);pull(0,-1);}assert.equal(run('player.boosts'),2);assert.equal(run('player.vy'),-720,'repeated pulls cannot create unlimited air jumps');
 reset();pull(0,-.6);for(let i=0;i<fps*.6;i++)run(`update(1/${fps})`);const late=run('player.vy');pull(0,-1);assert.equal(run('player.vy'),late,'late pressure does not bypass the jump window');
 reset();run('player.onGround=false;player.jumpAge=9;player.boosts=2;player.vy=100');pull(0,-1);assert.equal(run('player.vy'),100,'falling/monster bounce cannot grant a fresh air jump');
 reset();pull(.707,-.707);assert(run('joystick.sprint&&player.vy===-720&&player.boosts===2'),'a full diagonal pull supports running and jumping together');
}
// Every jumping world uses the same strength controls; equipped aim/maze/swim stay specialized.
for(const world of ['meadow','air','earth','water','fire','final']){
 run(`level='${world}';resetGame();player.onGround=true;player.vy=0;player.inWater=false;player.ridingTurtle=false;`);pull(0,-1);assert.equal(run('player.vy'),-720,world+' strong jump');assert.equal(run('player.boosts'),2);
}
run("level='fire';resetGame();fireArrow.owned=true;player.x=10340;player.y=-558;player.onGround=true;beginLavaKing()");pull(0,-1);assert.equal(run('player.vy'),-720,'equipped bow permits the highest joystick jump');assert.equal(run('player.boosts'),2);
run('fireArrow.aiming=false;beginFireMaze()');pull(0,-1);assert.equal(run('player.vy'),0,'maze climbing does not jump');
run("level='water';resetGame();player.inWater=true;player.x=2200;player.y=600;waterReefs.length=0;player.vx=0;player.vy=0;waterPirates=[];waterSharks=[];player.invincible=999");pull(.4,0);for(let i=0;i<120;i++)run('update(1/120)');assert(run('player.vx>20&&player.vx<130'),'swimming also responds proportionally');
for(const action of ['clearInputs()',"window.listeners.blur[0]()",'openWorldMap()','showEnd(false)','resetGame()']){reset();pull(1,-1);run(action);assert(!run('joystick.sprint||joystick.motion||joystick.jumpGesture'));}
console.log('PASS smooth joystick: analog walk/run/swim, gentle acceleration/reversal/release, sprint hysteresis/art, pressure jump height and finite charges, every world, aim/maze guards and reset safety at 30/60/120 FPS.');
