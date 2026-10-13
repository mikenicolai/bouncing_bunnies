const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const arena=()=>run("level='fire';resetGame();fireFinished=false;fireArrow.owned=true;player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();lavaKing.hp=1;lavaKing.phase='flight';lavaKing.y=-810;lavaKingFireballs=[{x:10500,y:-600,r:13,vx:330,vy:150,age:0}];");
for(const fps of [30,60,120])for(const width of [480,960]){
 arena();run(`W=${width}`);assert(run('hitLavaKing(player,true,1)'));assert(run('lavaKing.defeated&&!fireArrow.aiming&&lavaKingFireballs.length===0'));assert(!run('lavaKingBodySolid()'));
 const start=run('lavaKing.deathY');run(`update(1/${fps})`);assert(run('lavaKing.deathY')>start,'defeated airborne boss falls');
 run("state='map';var pausedY=lavaKing.deathY;update(.2)");assert.equal(run('lavaKing.deathY'),run('pausedY'));run("state='playing'");
 for(let f=0;f<fps;f++)run(`update(1/${fps})`);
 assert(run('lavaKing.deathLanded'));assert.equal(run('lavaKingBody().y+lavaKingBody().h'),run('FIRE_KING_ARENA.y'));
 const corpse=run('JSON.stringify(lavaKingBody())');run('updateLavaKing(2)');assert.equal(run('JSON.stringify(lavaKingBody())'),corpse,'settled body does not float/bob');
 for(const direction of [-1,1]){
  run(`clearInputs();Object.assign(player,{x:lavaKingBody().x+(${direction}<0?LAVA_KING_BODY.w+10:-player.w-10),y:-558,h:58,vx:0,vy:0,onGround:true});keys.add('${direction<0?'ArrowLeft':'ArrowRight'}')`);
  for(let f=0;f<fps;f++)run(`update(1/${fps})`);
  assert.equal(run('player.x'),run(direction<0?'lavaKingBody().x+LAVA_KING_BODY.w':'lavaKingBody().x-player.w'),'walking cannot cross the body');
  run("keys.add('ArrowDown')");for(let f=0;f<fps/2;f++)run(`update(1/${fps})`);assert.equal(run('player.h'),18);assert.equal(run('player.x'),run(direction<0?'lavaKingBody().x+LAVA_KING_BODY.w':'lavaKingBody().x-player.w'),'crouching cannot cross the body');
  run("keys.delete('ArrowDown');updateDuck();jump()");assert(run('player.vy<0'));
  for(let f=0;f<fps*2;f++){
   run(`update(1/${fps})`);
   if(run(direction<0?'player.x+player.w<lavaKingBody().x':'player.x>lavaKingBody().x+LAVA_KING_BODY.w')){run('keys.clear()');break;}
  }
  assert(run(direction<0?'player.x+player.w<lavaKingBody().x':'player.x>lavaKingBody().x+LAVA_KING_BODY.w'),'normal jump crosses in either direction');
  for(let f=0;f<fps;f++)run(`update(1/${fps})`);
  assert.equal(run('lives'),3);assert.equal(run('state'),'playing');assert(run('player.onGround'));assert.equal(run('player.y+player.h'),-500,'walk off the corpse onto the plateau');
 }
 // The actual return route descends the full volcano and enters the open maze exit.
 run("player.x=10970;player.y=-558;player.onGround=true;player.vx=0;keys.add('ArrowLeft');jump();fireStoneClock=999;coins.forEach(c=>c.taken=true)");
 for(let f=0;f<fps*22&&run("fireMode!=='maze'");f++)run(`update(1/${fps})`);
 assert.equal(run('fireMode'),'maze');for(let f=0;f<fps*2&&run('player.mazeTarget!==null');f++)run(`update(1/${fps})`);assert.equal(run('player.mazeC'),24);assert(run('lavaKing.defeated'));assert.equal(run('lives'),3);assert.equal(run('state'),'playing');
 // Climb back through that same exit and revisit the fallen king without revival.
 run("keys.clear();keys.add('ArrowRight');fireStoneClock=999");
 for(let f=0;f<fps*22&&run("fireMode!=='king'");f++){run(`update(1/${fps});fireStoneClock=999`);}
 assert.equal(run('fireMode'),'king');assert(run('lavaKing.defeated&&!fireArcheryMode()'));assert.equal(run('JSON.stringify(lavaKingBody())'),corpse);run('keys.clear()');
 // Buying a heart also keeps the defeated body and current checkpoint.
 run('coinWallet=20;lives=1;player.invincible=0;hurt();buyReviveHeart()');assert.equal(run('lives'),1);assert(run('lavaKing.defeated'));assert.equal(run('lavaKing.phase'),'defeated');assert.equal(run('player.x'),run('checkpoint.x'));
 run('player.x=FIRE_EXIT_X;update(0)');assert.equal(run('state'),'map');assert(run('fireFinished'));
 run('resetGame()');assert(!run('lavaKing.defeated'));assert.equal(run('lavaKingBodySolid()'),null);assert.equal(run('lavaKing.deathY'),null);
}
console.log('PASS fallen Lava King: real airborne defeat, grounded static corpse, walk/crouch collision and jump both ways, full return to maze/revisit, paid checkpoint, pause, portal and reset at 30/60/120 FPS and phone/desktop widths.');
