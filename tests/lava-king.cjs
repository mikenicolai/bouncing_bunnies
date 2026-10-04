const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='fire';resetGame();fireFinished=false;");
const arena=()=>{reset();run("beginSecondVolcano();player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();");};
// Exiting the labyrinth starts the second outdoor climb instead of completing Fire.
reset();run('beginFireMaze();player.mazeC=23;player.mazeR=1;player.x=mazeCenter(23,1).x-21;player.y=mazeCenter(23,1).y-29;update(1/60)');
assert.equal(run('fireMode'),'secondVolcano');assert.equal(run('fireUnderground'),false);assert.equal(run('fireFinished'),false);
assert.equal(run('player.y+58'),2050);assert.equal(run('checkpoint.mode'),'secondVolcano');assert(run('mazeOpen(24,1)'));
// Traverse the whole second slope with normal movement and jumps, at common frame rates.
for(const width of [480,960])for(const fps of [30,60,120]){
  reset();run(`W=${width};player.x=6659;beginSecondVolcano();keys.add('ArrowRight')`);let jumps=0;
  for(let f=0;f<fps*20&&run("fireMode==='secondVolcano'");f++){
    if(run('player.onGround&&fireRollingStones.some(s=>s.x>player.x&&s.x-player.x<150)')){run('jump()');jumps++;}
    run(`update(1/${fps})`);
  }
  assert.equal(run('fireMode'),'king',`route ${width}/${fps}`);assert.equal(run('lives'),3);assert(jumps>=4);
  assert.equal(run('lavaKing.hp'),10);assert(run('lavaKing.active'));assert.equal(run('checkpoint.mode'),'king');assert.equal(run('fireRollingStones.length'),0);
}
// Same slope-relative jumping, camera framing and touch controls on the new mountain.
reset();run("beginSecondVolcano();player.x=8200;player.y=fireSlopeY(8221)-58;player.vx=260;keys.add('ArrowRight');W=960;cameraX=8221-W/3;cameraY=fireSlopeY(8221)-H*.62;fireStoneClock=100;updateJoystick({x:JOY.x,y:JOY.y-JOY.radius})");
assert(!run('player.onGround'));let clearance=0;
for(let f=0;f<60;f++){run('update(1/60)');clearance=Math.max(clearance,run('fireSlopeY(player.x+21)-player.y-player.h'));assert(Math.abs(run('player.x+21-cameraX')-320)<15);}
assert(clearance>120);
// Front shield blocks, attacking the rear works, and stun prevents repeated damage.
arena();run("lavaKing.phase='shield';lavaKing.facing=-1;player.x=lavaKing.x-72;player.y=-558;player.facing=1;attack()");assert.equal(run('lavaKing.hp'),10);
run('player.x=lavaKing.x+lavaKing.w+30;player.facing=-1;player.attackCooldown=0;attack()');assert.equal(run('lavaKing.hp'),9);
run('player.attackCooldown=0;attack()');assert.equal(run('lavaKing.hp'),9);
run('player.x=lavaKing.x+10;updateLavaKing(0)');assert.equal(run('lives'),3,'hit stun prevents retaliation');
// Sword warning lasts .65 seconds before a short directed slash; a normal jump clears it.
for(const fps of [30,60,120]){
  arena();run("lavaKingPhase('windup');player.x=lavaKing.x-135;player.y=-558;player.onGround=true;");
  for(let f=0;f<Math.floor(fps*.3);f++)run(`updateLavaKing(1/${fps})`);
  assert.equal(run('lavaKing.phase'),'windup');assert.equal(run('lives'),3);
  run('jump()');for(let f=0;f<fps*.9;f++)run(`update(1/${fps})`);assert.equal(run('lives'),3,'jump clears the sword');
}
arena();run("lavaKingPhase('slash');player.x=lavaKing.x-120;player.y=-558;updateLavaKing(.1)");assert.equal(run('lives'),2);assert(!run('player.onGround'));
run('updateLavaKing(.05)');assert.equal(run('lives'),2,'slash immunity');
// Cast has an .8 second warning. Fireballs move, can be jumped, cost one heart on contact.
arena();run("lavaKingPhase('cast');updateLavaKing(.7)");assert.equal(run('lavaKingFireballs.length'),0);
run('updateLavaKing(.11)');assert.equal(run('lavaKingFireballs.length'),1);const x=run('lavaKingFireballs[0].x'),y=run('lavaKingFireballs[0].y');run('updateLavaKing(.1)');assert(run('lavaKingFireballs[0].x')<x);assert(run('lavaKingFireballs[0].y')>y,'fireball descends from the throwing hand toward the ground');
for(const fps of [30,60,120]){
  arena();run("player.x=10600;player.y=-558;player.onGround=true;lavaKingPhase('throw');jump()");
  for(let f=0;f<fps*.8;f++)run(`update(1/${fps})`);assert.equal(run('lives'),3,'jump clears a fireball');
}
arena();run('lavaKingFireballs=[{x:player.x+21,y:player.y+30,r:13,vx:-255,age:0,alive:true}];updateLavaKing(0)');assert.equal(run('lives'),2);assert.equal(run('lavaKingFireballs.length'),0);
// Ten real attacks remove ten hearts; Fire remains incomplete until reaching the unlocked portal.
arena();run('player.x=FIRE_EXIT_X;update(0)');assert.equal(run('state'),'playing');assert.equal(run('fireFinished'),false);
for(let h=1;h<=10;h++){
 run("lavaKing.phase='recover';lavaKing.recoveryHit=false;lavaKing.dizzy=0;player.x=lavaKing.x-72;player.y=-558;player.facing=1;player.attackCooldown=0;attack()");assert.equal(run('lavaKing.hp'),10-h);
}
assert(run('lavaKing.defeated'));assert.equal(run('lavaKingFireballs.length'),0);assert.equal(run('state'),'playing');
run('player.x=FIRE_EXIT_X-21;update(1/60)');assert.equal(run('state'),'map');assert(run('fireFinished'));
// A complete battle uses the live phase machine and normal jump/punch input, without changing boss health or stun.
for(const fps of [30,60,120]){
 arena();run('player.x=lavaKing.x-72;player.y=-558;player.facing=1;player.onGround=true;');
 let jumps=0;
 for(let f=0;f<fps*90&&!run('lavaKing.defeated');f++){
   if(run("player.onGround&&((lavaKing.phase==='windup'&&lavaKing.age>.32)||(lavaKing.phase==='cast'&&lavaKing.age>.4))")){run('jump()');jumps++;}
   if(run("player.onGround&&lavaKing.phase==='recover'&&lavaKing.dizzy<=0"))run('attack()');
   run(`update(1/${fps})`);
 }
 assert(run('lavaKing.defeated'),`full fight ${fps}`);assert.equal(run('lives'),3);assert(jumps>=10);
}
// Checkpoints retain progress; restart clears combat and replenishes the boss.
arena();run("lavaKing.hp=7;lavaKingPhase('throw');respawnFire()");assert.equal(run('lavaKing.hp'),7);assert.equal(run('fireMode'),'king');assert.equal(run('lavaKingFireballs.length'),0);assert.equal(run('player.y'),-558);
run("state='map';const age=lavaKing.age;update(.1)");assert.equal(run('lavaKing.age'),run('age'));
reset();assert.equal(run('lavaKing.hp'),10);assert.equal(run('lavaKing.active'),false);assert.equal(run('lavaKingFireballs.length'),0);
console.log('PASS Lava King: maze exit, second climb and checkpoints, slope/touch jumps, ten hearts, directional shield, sword/cast warnings, jumpable attacks, damage immunity, stun, defeat-gated completion and reset.');
