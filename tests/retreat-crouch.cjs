const assert=require('node:assert/strict');
const {run}=require('./air.cjs');

run("level='earth';resetGame();keys.add('ArrowDown');updateDuck()");
assert.equal(run('player.h'),18,'bunny crouches under the first branch');
run('keys.clear();updateDuck()');
assert.equal(run('player.h'),58,'one-way branch does not trap the bunny crouched');

run("level='fire';resetGame();player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();lavaKing.defeated=true;fireArrow.aiming=false;keys.add('ArrowDown');update(1/60)");
assert.equal(run('player.h'),18,'Down crouches after the Lava King falls');
run('keys.clear();update(1/60)');
assert.equal(run('player.h'),58,'releasing Down stands up after the fight');
run('updateJoystick({x:JOY.x,y:JOY.y+JOY.radius-12})');
assert.equal(run('player.h'),18,'touch joystick crouches after the fight');
run('updateJoystick({x:JOY.x,y:JOY.y})');
assert.equal(run('player.h'),58,'touch joystick releases the crouch');

run("level='air';resetGame();bossAwake=true;player.x=4900;player.y=-1748;tempest.shotCooldown=0;tempestWinds=[{x:5040,y:-1741,w:35,h:18,vx:-330,age:0}];updateTempest(.5)");
assert.equal(run('lives'),3,'returning toward the wind-star ledge is safe');
assert.equal(run('tempestWinds.length'),0,'gusts fade before the retreat path');
run('player.x=5100;tempest.shotCooldown=0;updateTempest(0)');
assert(run('tempestWinds.length>0'),'Tempest still attacks inside the arena');

assert(run('airMonsters.length===1&&airMonsters[0].platform===airPlatforms[6]'));
console.log('PASS: Earth and post-king Fire crouch release, safe Tempest retreat, and clear second Air island.');
