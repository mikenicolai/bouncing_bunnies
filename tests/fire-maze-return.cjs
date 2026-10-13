const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function exitCell(owned=true){run(`keys.clear();joystick.dx=joystick.dy=0;level='fire';resetGame();soundOn=false;fireZombies=[];player.invincible=999;fireArrow.owned=${owned};beginFireMaze();player.mazeC=24;player.mazeR=1;player.x=mazeCenter(24,1).x-player.w/2;player.y=mazeCenter(24,1).y-player.h/2`);}
for(const fps of [30,60,120])for(const width of [480,960]){
 exitCell(false);run(`W=${width};keys.add('ArrowRight')`);for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 assert.equal(run('fireMode'),'maze');assert.equal(run('player.mazeC'),24,'the bow still gates the exit');
 exitCell();run(`W=${width};lavaKing.hp=7`);for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 assert.equal(run('fireMode'),'maze','standing in the exit cell does not enable outdoor jumps');run('jump()');assert.equal(run('player.vy'),0);
 run("keys.add('ArrowRight')");
 for(let f=0;f<fps*2&&run("fireMode==='maze'");f++){
  const old=run('({x:player.x,y:player.y})');run(`update(1/${fps})`);
  assert(Math.abs(run('player.x')-old.x)<=360/fps+.01,'leaving the corridor is continuous');assert(Math.abs(run('player.y')-old.y)<3,'there is no floor teleport at the doorway');
 }
 assert.equal(run('fireMode'),'secondVolcano');assert(run('player.x>=FIRE_SECOND_VOLCANO[0][0]'));assert.equal(run('player.y+player.h'),2060);
 run("keys.clear();keys.add('ArrowLeft')");
 for(let f=0;f<fps*2&&run("fireMode!=='maze'||player.mazeC>23");f++){
  const x=run('player.x');run(`update(1/${fps})`);assert(Math.abs(run('player.x')-x)<=360/fps+.01,'returning through the opening does not teleport');
 }
 assert.equal(run('fireMode'),'maze');assert.equal(run('player.mazeC'),23);assert.equal(run('player.mazeR'),1);assert(run('fireUnderground&&fireArrow.owned'));assert.equal(run('lavaKing.hp'),7,'backtracking retains boss progress');
 run('keys.clear();jump()');assert.equal(run('player.vy'),0,'jumping is disabled again inside the labyrinth');
 for(let trip=0;trip<2;trip++){
  run("keys.clear();keys.add('ArrowRight')");for(let f=0;f<fps*2&&run("fireMode==='maze'");f++)run(`update(1/${fps})`);
  assert.equal(run('fireMode'),'secondVolcano');
  run("keys.clear();keys.add('ArrowLeft')");for(let f=0;f<fps*2&&run("fireMode!=='maze'||player.mazeC>23");f++)run(`update(1/${fps})`);
  assert.equal(run('fireMode'),'maze');assert.equal(run('player.mazeC'),23);assert.equal(run('lavaKing.hp'),7);
 }
 // Dying after re-entry returns to the exit corridor, with matching grid coordinates.
 run('respawnFire()');assert.equal(run('lives'),2);assert.equal(run('player.mazeC'),24);assert.equal(run('player.mazeR'),1);assert.equal(run('player.x'),run('mazeCenter(24,1).x-player.w/2'));
 run("keys.add('ArrowLeft');update(1/"+fps+")");assert(run('Math.abs(player.x-checkpoint.x)<10'),'the first respawn step cannot snap to the entrance');
 // A real boosted jump against the outer wall cannot enter the roof/stone tiles.
 exitCell();run("player.x=6880;beginSecondVolcano();keys.add('ArrowLeft');keys.add('ShiftLeft');jump()");let blocked=false;
 for(let f=0;f<fps*2;f++){
  if(f===Math.round(fps*.06)||f===Math.round(fps*.12))run('jump()');run(`update(1/${fps})`);
  if(run("fireMode==='secondVolcano'")){
   assert(run('player.x>=FIRE_SECOND_VOLCANO[0][0]'),'the wall blocks the whole bunny at every jump height');
   if(run('player.y<1980&&player.x===6800'))blocked=true;
   if(run('player.onGround'))assert.equal(run('player.y+player.h'),2060,'the bunny cannot land on an internal stone tile');
  }
 }
 assert(blocked,'the boosted jump actually reaches the closed wall above the exit');assert.equal(run('lives'),3);
}
console.log('PASS maze return: bow-gated explicit exit, continuous doorway travel both ways, disabled indoor jumps, solid outer roof/wall during boosted jumps, retained gear/boss HP, and exit checkpoint respawn at phone/desktop widths and 30/60/120 FPS.');
