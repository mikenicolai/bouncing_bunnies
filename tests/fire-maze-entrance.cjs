const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function reset(owned){run(`keys.clear();joystick.dx=joystick.dy=0;level='fire';resetGame();soundOn=false;fireZombies=[];player.invincible=999;fireArrow.owned=${owned};fireArrow.ammo=['fire','rainbow','normal','fire','normal'];beginFireMaze();collectCoin(coins[0]);lavaKing.hp=7`);}
for(const fps of [30,60,120])for(const width of [480,960])for(const owned of [false,true]){
 reset(owned);run(`W=${width};keys.add('ArrowUp')`);const wallet=run('coinWallet'),ammo=run('JSON.stringify(fireArrow.ammo)');
 for(let f=0;f<fps*2&&run("fireMode==='maze'");f++){
  const p=run('({x:player.x,y:player.y})');run(`update(1/${fps})`);
  assert.equal(run('player.x'),p.x,'the entrance ladder does not move sideways');assert(Math.abs(run('player.y')-p.y)<=230/fps+.01,'climbing out is continuous');
 }
 assert.equal(run('fireMode'),'landing');assert.equal(run('player.y+player.h'),1900);assert.equal(run('checkpoint.mode'),'landing');
 for(let f=0;f<fps;f++)run(`update(1/${fps})`);assert.equal(run('fireMode'),'landing','holding Up cannot pull the bunny back inside');
 assert.equal(run('score'),1);assert.equal(run('coinWallet'),wallet);assert.equal(run('fireArrow.owned'),owned);assert.equal(run('JSON.stringify(fireArrow.ammo)'),ammo);assert.equal(run('lavaKing.hp'),7);
 // Walk away, press Down over stone, then walk back to the real ladder mouth.
 run("keys.clear();keys.add('ArrowLeft')");for(let f=0;f<Math.ceil(fps*.4);f++)run(`update(1/${fps})`);
 const x=run('player.x');run("keys.clear();keys.add('ArrowDown')");for(let f=0;f<fps*.3;f++)run(`update(1/${fps})`);assert.equal(run('fireMode'),'landing');assert.equal(run('player.x'),x);
 run("keys.clear();keys.add('ArrowRight')");for(let f=0;f<fps&&run('Math.abs(player.x+player.w/2-mazeCenter(1,1).x)>18');f++)run(`update(1/${fps})`);
 assert(run('Math.abs(player.x+player.w/2-mazeCenter(1,1).x)<=18'));
 run("keys.clear();keys.add('ArrowDown')");
 for(let f=0;f<fps*2&&run("fireMode!=='maze'");f++){
  const p=run('({x:player.x,y:player.y})');run(`update(1/${fps})`);
  assert(Math.abs(run('player.x')-p.x)<=260/fps+.01,'re-entry aligns without a sideways teleport');assert(Math.abs(run('player.y')-p.y)<=240/fps+.1);
 }
 assert.equal(run('fireMode'),'maze');assert.equal(run('player.mazeC'),1);assert.equal(run('player.mazeR'),1);assert.equal(run('score'),1);assert.equal(run('coinWallet'),wallet);
 // Repeat the trip; paused ladders freeze, and the upper checkpoint stays outside.
 run("keys.clear();keys.add('ArrowUp');update(1/"+fps+");state='map';var frozenEntrance=JSON.stringify(player);update(.5)");assert(run('JSON.stringify(player)===frozenEntrance'));
 run("state='playing'");for(let f=0;f<fps*2&&run("fireMode==='maze'");f++)run(`update(1/${fps})`);
 assert.equal(run('fireMode'),'landing');run('keys.clear();respawnFire()');assert.equal(run('lives'),2);assert.equal(run('fireMode'),'landing');assert(run('fireUnderground'));assert.equal(run('player.y+player.h'),1900);
 for(let f=0;f<fps;f++)run(`update(1/${fps})`);assert.equal(run('fireMode'),'landing');assert.equal(run('fireArrow.owned'),owned);
}
console.log('PASS entrance ladder: climb out, stay outside, walk away/back, intentional Down re-entry with smooth alignment, repeated trips, paused climb, upper checkpoint and retained wallet/coins/gear at phone/desktop widths and 30/60/120 FPS.');
