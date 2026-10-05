const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='fire';resetGame();fireFinished=false;fireZombies=[];fireStoneClock=999");
const place=(mode,x)=>run(`fireMode='${mode}';player.x=${x};player.y=fireSlopeY(player.x+21)-58;Object.assign(player,{onGround:true,vx:0,attack:0,duck:false,duckVisual:0,landingPaint:0});`);
// Flat stretches of either volcano are upright, even though the journey mode has not changed.
for(const [mode,x,four] of [['volcano',3300,true],['volcano',4620,false],['secondVolcano',6890,false],['secondVolcano',8110,true],['secondVolcano',10300,false],['king',10400,false]]){
 reset();place(mode,x);assert.equal(run('fireHillCrawlMode()'),four);
 assert.equal(run('paintedBunnyPose().name'),four?'fourRun':'actions');
 run('player.vx=260');assert.equal(run('paintedBunnyPose().name'),four?'fourRun':'uprightWalk');
 run("keys.add('ShiftLeft')");assert.equal(run('paintedBunnyPose().name'),four?'fourRun':'uprightRun');run('keys.clear()');
 run('jump()');assert(!run('player.onGround'));assert.equal(run('paintedBunnyPose().name'),'uprightJump');assert(!run('fireHillCrawlMode()'));
}
// Walking speed stays usable; either Shift key makes the bunny faster, and releasing it restores walking.
for(const fps of [30,60,120])for(const key of ['ShiftLeft','ShiftRight']){
 const travel=sprint=>{reset();place('king',10400);run(`keys.add('ArrowRight');${sprint?`keys.add('${key}');`:''}`);for(let f=0;f<fps;f++)run(`update(1/${fps})`);return run('player.x-10400');};
 const walk=travel(false),sprint=travel(true);assert(sprint>walk*1.25);assert.equal(run('player.vx'),360);
 run(`keys.delete('${key}')`);for(let f=0;f<fps*.25;f++)run(`update(1/${fps})`);assert.equal(run('player.vx'),260);
 run("window.listeners.blur[0]()");assert(!run('sprintHeld()'));
}
// Maze sprint shortens a ladder step without skipping a wall or changing its destination.
for(const fps of [30,60,120]){
 const duration=sprint=>{reset();run(`beginFireMaze();player.mazeC=11;player.mazeR=11;player.x=mazeCenter(11,11).x-21;player.y=mazeCenter(11,11).y-29;keys.add('ArrowUp');${sprint?"keys.add('ShiftLeft');":''}update(1/${fps});keys.delete('ArrowUp');`);let frames=1;while(run('player.mazeTarget')&&frames<fps){run(`update(1/${fps})`);frames++;}assert.equal(run('player.mazeR'),10);return frames/fps;};
 assert(duration(true)<duration(false));
}
// Arrows use real updates, damage zombie hearts, and remain usable after a kill.
for(const fps of [30,60,120])for(const direction of [-1,1]){
 reset();run(`beginFireMaze();fireArrow.owned=true;fireArrow.aiming=true;fireArrow.angle=0;player.mazeC=11;player.mazeR=11;player.x=mazeCenter(11,11).x-21;player.y=mazeCenter(11,11).y-29;player.facing=${direction};var zombiePoint=mazeCenter(${11+direction*3},11);fireZombies=[{c:${11+direction*3},r:11,x:zombiePoint.x-24,y:zombiePoint.y-36,w:48,h:72,hp:2,dizzy:0,alive:true,progress:0,patrolTurn:0,target:null,phase:0}];`);
 assert(run('fireArcheryMode()'));assert(run('fireBunnyArrow()'));assert.equal(run('bunnyArrows[0].gravity'),0);
 for(let f=0;f<fps*1.3;f++)run(`update(1/${fps})`);assert.equal(run('fireZombies[0].hp'),1);assert(run('fireZombies[0].alive'));
 assert(run('fireBunnyArrow()'));for(let f=0;f<fps*.6;f++)run(`update(1/${fps})`);assert(!run('fireZombies[0].alive'));assert(run('fireArrow.owned'));
}
// The first maze wall stops a projectile before it can hit a zombie behind that wall.
reset();run("beginFireMaze();fireArrow.owned=true;fireArrow.aiming=true;fireArrow.angle=0;player.mazeC=5;player.mazeR=1;player.x=mazeCenter(5,1).x-21;player.y=mazeCenter(5,1).y-29;player.facing=1;var behindWall=mazeCenter(8,1);fireZombies=[{x:behindWall.x-24,y:behindWall.y-36,w:48,h:72,hp:2,dizzy:0,alive:true}];fireBunnyArrow();updateFireArchery(.5)");assert.equal(run('fireZombies[0].hp'),2);assert.equal(run('bunnyArrows.length'),0);
// Vertical ladder shooting and stowing both preserve climbing controls.
for(const direction of [-1,1]){
 reset();run(`beginFireMaze();fireArrow.owned=true;fireArrow.aiming=true;fireArrow.angle=0;player.mazeC=11;player.mazeR=11;player.x=mazeCenter(11,11).x-21;player.y=mazeCenter(11,11).y-29;player.facing=1;keys.add('${direction<0?'ArrowUp':'ArrowDown'}');update(1/60);keys.clear();var ladderTarget=mazeCenter(11,${11+2*direction});fireZombies=[{x:ladderTarget.x-24,y:ladderTarget.y-36,w:48,h:72,hp:1,dizzy:0,alive:true}];`);
 assert.equal(run('fireArrow.angle'),-direction*Math.PI/2);assert(run('fireBunnyArrow()'));run('updateFireArchery(.3)');assert(!run('fireZombies[0].alive'));
 run('toggleFireAim()');assert(!run('fireWeaponEquipped()'));assert(run('player.mazeTarget'),'stowing does not cancel a ladder step');
}
// The outdoor terrain settles at 80% height, leaving sky for the airborne boss and stable jumps.
for(const [width,height] of [[960,540],[480,920]])for(const fps of [30,60,120]){
 reset();run(`W=${width};H=${height}`);place('king',10400);
 for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 assert(Math.abs(run('FIRE_KING_ARENA.y-cameraY')-height*.8)<1);
 const y=run('cameraY');run('jump()');for(let f=0;f<fps*.3;f++)run(`update(1/${fps})`);assert(Math.abs(run('cameraY')-y)<1);assert(run('player.y+player.h-cameraY>0'));
}
// Flight moves the actual hitbox across the arena, casts three aimed shots, then lands.
for(const fps of [30,60,120]){
 reset();run("W=960;H=540;fireArrow.owned=true;fireArrow.aiming=true;fireMode='king';player.x=10400;player.y=-558;player.onGround=true;lavaKing.active=true;lavaKingPhase('flight');");
 const start=run('lavaKing.x');let maxLift=0,shots=0,lastShot=0;
 for(let f=0;f<fps*4.2;f++){
  run(`updateLavaKing(1/${fps})`);maxLift=Math.max(maxLift,run('FIRE_KING_ARENA.y-(lavaKing.y+lavaKing.h)'));
  const count=run('lavaKing.flightShot');if(count>lastShot){shots+=count-lastShot;lastShot=count;assert(run('lavaKingFireballs.some(b=>b.airborne&&b.vy>0)'));}
 }
 assert(maxLift>140);assert(Math.abs(run('lavaKing.x')-start)>400);assert.equal(shots,3);assert.equal(run('lavaKing.y+lavaKing.h'),-500);
 assert.equal(run('lavaKing.phase'),'recover');
}
// Hit reactions cannot cancel the flight; real upward arrows can hit the flying body.
reset();run("fireArrow.owned=true;fireArrow.aiming=true;fireMode='king';player.x=10600;player.y=-558;player.onGround=true;lavaKing.active=true;lavaKingPhase('flight');updateLavaKing(.6);");
// Aim ballistically at the current flying hitbox, then update the real projectile.
run("bunnyArrows=[];fireArrow.cooldown=0;player.facing=player.x+21<lavaKing.x+45?1:-1;fireArrow.angle=Math.atan2(player.y+player.h-35-(lavaKing.y+70),Math.abs(lavaKing.x+45-player.x-55));fireBunnyArrow();");
for(let i=0;i<60&&run('bunnyArrows.length');i++)run('updateFireArchery(1/120)');assert.equal(run('lavaKing.hp'),9);assert.equal(run('lavaKing.phase'),'flight');
// Ground fireballs are faster and have a shorter tell, while pause/respawn clear live attacks.
reset();place('king',10400);run("beginLavaKing();lavaKingPhase('cast');updateLavaKing(.5)");assert.equal(run('lavaKingFireballs.length'),0);
run('updateLavaKing(.06)');assert.equal(run('lavaKingFireballs.length'),1);assert.equal(run('Math.abs(lavaKingFireballs[0].vx)'),330);
run("state='map';var pausedKingY=lavaKing.y,pausedBallX=lavaKingFireballs[0].x;update(.2)");assert.equal(run('lavaKing.y'),run('pausedKingY'));assert.equal(run('lavaKingFireballs[0].x'),run('pausedBallX'));
run("state='playing';respawnFire()");assert.equal(run('lavaKingFireballs.length'),0);assert.equal(run('lavaKing.flightClock'),0);
console.log('PASS fire update: slope-only paws/upright jumping, Shift movement and ladders, zombie arrows and wall occlusion, vertical shooting/Z, low camera, flying/moving/shooting boss, airborne hits, faster fireballs, pause/respawn.');

// Crater tracking leaves 80% of the view below the falling bunny at every frame rate.
for(const [width,height] of [[960,540],[480,920]])for(const fps of [30,60,120]){
 reset();run(`W=${width};H=${height};fireMode='dropper';player.x=5000;player.y=-900;player.vy=300;player.onGround=false;cameraY=-1500`);
 for(let f=0;f<fps*.6;f++){
  run(`update(1/${fps})`);
  assert.equal(run('fireMode'),'dropper');
  assert(Math.abs(run('(player.y+player.h/2-cameraY)*fireViewSize().scale')-height*.2)<1e-9,'no tracking lag hides the approaching ledge');
 }
 assert.equal(run('lives'),3);
}
// Entering the real crater never teleports the view; the settled walls do not follow steering.
for(const [width,height] of [[960,540],[480,920]])for(const fps of [30,60,120]){
 reset();run(`W=${width};H=${height};fireMode='volcano';player.x=4730;player.y=-1108;player.vx=260;player.onGround=true;cameraX=player.x+21-W/3;cameraY=fireCameraTargetY();keys.add('ArrowRight')`);
 let largestStep=0,previous=run('cameraY');
 for(let f=0;f<fps*1.7;f++){
  run(`update(1/${fps})`);
  largestStep=Math.max(largestStep,Math.abs(run('cameraY')-previous)*run('fireViewSize().scale'));previous=run('cameraY');
 }
 assert.equal(run('fireMode'),'dropper');assert.equal(run('lives'),3);
 assert(largestStep<40*30/fps,`smooth crater entry at ${width}/${fps}: ${largestStep}`);
 assert(Math.abs(run('(player.y+player.h/2-cameraY)*fireViewSize().scale')-height*.2)<1e-8);
 const wallX=run('(FIRE_DROPPER.left-cameraX)*fireViewSize().scale');
 const opposite=run('(FIRE_DROPPER.right-cameraX)*fireViewSize().scale');
 assert(wallX>0&&opposite<width,'both shaft walls fit the view, including portrait');
 run("keys.clear();keys.add('ArrowLeft')");for(let f=0;f<fps*.15;f++)run(`update(1/${fps})`);
 assert(Math.abs(run('(FIRE_DROPPER.left-cameraX)*fireViewSize().scale')-wallX)<1e-8,'steering does not pan the walls');
 run('resetGame()');assert.equal(run('fireCraterViewBlend'),0);assert.equal(run('fireDropCamera'),null);
}
// The final ladder remains inside the maze; the second ground begins at its outside edge.
assert.equal(run('FIRE_SECOND_VOLCANO[0][0]'),run('FIRE_MAZE.x+FIRE_MAZE.rows[0].length*FIRE_MAZE.tile'));
assert.equal(run('FIRE_SECOND_VOLCANO[0][1]'),run('FIRE_MAZE.y+2*FIRE_MAZE.tile'));
for(const fps of [30,60,120]){
 reset();run("W=960;H=540;beginFireMaze();fireArrow.owned=true;player.mazeC=23;player.mazeR=3;player.x=mazeCenter(23,3).x-21;player.y=mazeCenter(23,3).y-29;keys.add('ArrowUp')");
 for(let f=0;f<fps*1.1;f++)run(`update(1/${fps})`);
 assert.equal(run('player.mazeR'),1);assert.equal(run('fireMode'),'maze');
 run("keys.clear();keys.add('ArrowRight')");
 for(let f=0;f<fps*1.5;f++)run(`update(1/${fps})`);
 assert.equal(run('fireMode'),'secondVolcano');assert.equal(run('lives'),3);assert(run('player.onGround'));
 assert(run('player.x>FIRE_SECOND_VOLCANO[0][0]'));assert.equal(run('player.y+player.h'),2060);
 assert(!run('fireHillCrawlMode()'));
}
console.log('PASS crater camera: 20% high tracking at desktop/portrait sizes and 30/60/120 FPS; clear final ladder and continuous outer-edge exit.');
