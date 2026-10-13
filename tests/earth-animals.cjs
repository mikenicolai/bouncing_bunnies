const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false");
const tick=(fps,seconds)=>{for(let i=0;i<fps*seconds;i++)run(`update(1/${fps})`);};
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// EARTH_ANIMALS_BEGIN\n')[1].split('\n// EARTH_ANIMALS_END')[0],fs.readFileSync('assets/wildwood-animals-v1.js','utf8'));
reset();assert.equal(run('earthPandas.length'),3);assert.equal(run('earthGroundBirds.length'),5);
for(const name of ['turtle','bird','panda']){
 const art=run(`EARTH_ANIMAL_ART.${name}`),b=fs.readFileSync(art.asset);
 assert.equal(b[25],6,'original RGBA sprite');assert(art.sx+art.sw<=b.readUInt32BE(16)&&art.sy+art.sh<=b.readUInt32BE(20),'registered crop stays inside source');
}
run('toggleEarthTurtle()');assert(!run('player.ridingTurtle'));
for(const fps of [30,60,120]){
 // Falling feet cross the moving shell; no O key or proximity shortcut.
 reset();run('player.x=earthTurtle.x+51;player.y=earthTurtlePlatform().y-player.h-15;player.vy=120;player.onGround=false');
 tick(fps,.3);assert(run('player.ridingTurtle'),'landing mounts the shell');assert.equal(run('player.h'),58);
 const offset=run('player.x-earthTurtle.x'),y=run('player.y');let seenLeft=false,seenRight=false;
 for(let i=0;i<fps*24;i++){
  const oldX=run('player.x');run(`update(1/${fps})`);
  assert(run('player.ridingTurtle'));assert(Math.abs(run('player.x-earthTurtle.x')-offset)<1e-8);
  assert(Math.abs(run('player.x')-oldX)<=48/fps+1e-8,'reversals never teleport');
  assert.equal(run('player.y'),y);assert.equal(run('lives'),3);assert.equal(run('player.vx'),0);
  assert(run('earthTurtle.x>=earthTurtle.min&&earthTurtle.x<=earthTurtle.max'));
  if(run('earthTurtle.facing===-1'))seenLeft=true;else seenRight=true;
 }
 assert(seenLeft&&seenRight,'carries through both directions');assert.equal(run('player.jumpAge'),9,'riding does not permit extra airborne jumps');
 // Riding still runs the ordinary input, coins, and camera pipeline.
 run("coins.push({x:player.x+21,y:player.y+29,r:12,taken:false,bob:0});update(1/60)");assert.equal(run('score'),1);
 assert(run('cameraX>0'));
 run("keys.add('ArrowDown');update(1/60)");assert.equal(run('player.h'),18);assert.equal(run('player.y+player.h'),run('earthTurtlePlatform().y'));
 run('jump()');assert(run('player.ridingTurtle'),'duck blocks a jump without releasing rider');run('keys.clear();update(1/60)');assert.equal(run('player.h'),58);
 const jumpX=run('player.x'),jumpY=run('player.y');run('jump()');assert(!run('player.ridingTurtle'));assert(run('player.vy<0'));assert.equal(run('player.x'),jumpX);assert.equal(run('player.y'),jumpY,'jump releases exactly where the rider stood');
 run('jump();jump()');assert.equal(run('player.boosts'),2);const vy=run('player.vy');run('jump()');assert.equal(run('player.vy'),vy,'no fourth jump');
 // Walking off releases the moving support and lands safely on grass.
 reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle()');assert(run('player.ridingTurtle'));
 run("keys.add('ArrowRight')");tick(fps,.8);assert(!run('player.ridingTurtle'));assert.equal(run('lives'),3);assert(run('player.onGround'));
 // O is an optional mount/dismount; jump-off never warps sideways.
 reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle()');assert(run('player.ridingTurtle'));
 const x=run('player.x');run('toggleEarthTurtle()');assert(!run('player.ridingTurtle'));assert.equal(run('player.x'),x);assert(run('player.vy<0'));
 // From underneath the shell, rising through it does not mount or block the jump.
 reset();run('player.x=earthTurtle.x+51;player.y=earthGroundAt(earthTurtle.x)-58;player.onGround=true;jump()');run(`update(1/${fps})`);assert(!run('player.ridingTurtle'));assert(run('player.vy<0'));
}
reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h-160;toggleEarthTurtle()');assert(!run('player.ridingTurtle'),'cannot mount from branch above');
// Paused/revive/other levels never advance the turtle, and blocked input cannot detach.
reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle()');
for(const paused of ['map','developer','lost','reviveAd']){
 run(`state='${paused}';revivePending=true;reviveLevel=level;reviveAdEndsAt=5000`);const x=run('earthTurtle.x');run('update(.1);jump();toggleEarthTurtle()');assert.equal(run('earthTurtle.x'),x);assert(run('player.ridingTurtle'));
}
run("state='playing';player.invincible=0;hurt()");assert(!run('player.ridingTurtle'),'damage releases the rider');
reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle();showEnd(false);resumeWithHearts(3)');assert(!run('player.ridingTurtle'));assert.equal(run('player.h'),58);assert.equal(run('player.x'),run('checkpoint.x'));
run("level='air';resetGame();toggleEarthTurtle()");const x=run('earthTurtle.x');tick(60,1);assert.equal(run('earthTurtle.x'),x);assert(!run('player.ridingTurtle'));
reset();run('earthTurtle.x=900;earthTurtle.facing=-1;resetGame()');assert.equal(run('earthTurtle.x'),650);assert.equal(run('earthTurtle.facing'),1);assert(!run('player.ridingTurtle'));
console.log('PASS painted wildlife assets; shell landings, stable left/right carrying, walking/jumping off, triple jump limits, duck, coins, camera, pause/revive/reset and one-way collision at 30/60/120 FPS.');
