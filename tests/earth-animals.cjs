const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false");
reset();assert.equal(run('earthPandas.length'),3);assert.equal(run('earthGroundBirds.length'),5);
run('toggleEarthTurtle()');assert(!run('player.ridingTurtle'));
for(const fps of [30,60,120]){
 reset();run('player.x=earthTurtle.x-10;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle()');assert(run('player.ridingTurtle'));
 const y=run('player.y');for(let i=0;i<fps;i++)run(`update(1/${fps})`);
 assert.equal(run('player.y'),y);assert.equal(run('lives'),3);assert.equal(run('player.vx'),0);
 run('toggleEarthTurtle()');assert(!run('player.ridingTurtle'));assert.equal(run('player.h'),58);assert(run('player.onGround'));
 run('toggleEarthTurtle();jump()');assert(!run('player.ridingTurtle'));assert(run('player.vy<0'));
}
reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h-160;toggleEarthTurtle()');assert(!run('player.ridingTurtle'),'cannot mount from branch above');
run("level='air';resetGame();toggleEarthTurtle()");assert(!run('player.ridingTurtle'));
reset();run('player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle();resetGame()');assert(!run('player.ridingTurtle'));
console.log('PASS ground wildlife, turtle proximity/height, sitting at 30/60/120 FPS, O dismount, jump-off, level isolation and reset.');
