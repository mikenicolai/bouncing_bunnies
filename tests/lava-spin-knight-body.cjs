const assert=require('node:assert/strict'),fs=require('node:fs'),{run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// LAVA_KING_EFFECTS_BEGIN\n')[1].split('\n// LAVA_KING_EFFECTS_END')[0],fs.readFileSync('assets/lava-king-effects-v1.js','utf8'));
const king=()=>run("keys.clear();level='fire';resetGame();soundOn=false;fireArrow.owned=true;player.x=10340;player.y=-558;player.invincible=999;beginLavaKing();fireArrow.ammo.fill('normal')");
const knight=()=>run("beginDeveloperSession();level='final';resetGame();soundOn=false;enterFinalKnightRoom();finalKnight.x=600;finalKnight.cooldown=999;player.invincible=999;fireArrow.ammo.fill('normal')");
for(const fps of [30,60,120]){
 const tick=(fn,seconds)=>{for(let i=0;i<Math.round(fps*seconds);i++)run(`${fn}(1/${fps})`);};
 king();let naturalSpin=false;for(let i=0;i<fps*35;i++){run(`updateLavaKing(1/${fps})`);if(run("lavaKing.phase==='spin'")){naturalSpin=true;break;}}assert(naturalSpin,'an untouched real encounter reaches the spin without forcing its phase or turn');
 king();run("lavaKing.turn=3;lavaKingPhase('shield')");tick('updateLavaKing',.9);assert.equal(run('lavaKing.phase'),'spinWarn','normal rotation selects the additional attack');
 tick('updateLavaKing',.65);assert.equal(run('lavaKing.phase'),'spinWarn','warning leaves time to move or shoot');tick('updateLavaKing',.1);assert.equal(run('lavaKing.phase'),'spin');
 const start=run('lavaKing.x');tick('updateLavaKing',.5);assert(Math.abs(run('lavaKing.x')-start)>60,'spin advances across the floor');assert.equal(run('lavaKing.phase'),'spin');
 tick('updateLavaKing',1.25);assert.equal(run('lavaKing.phase'),'recover');assert.equal(run('lavaKing.turn'),4);
 // Neither frontal nor rear arrows are shielded during the spin.
 for(const side of [-1,1]){
  king();run(`lavaKingPhase('spin');player.x=lavaKing.x+(${side<0?-220:210});player.facing=${-side};fireArrow.angle=0;fireBunnyArrow()`);
  tick('update',.4);assert.equal(run('lavaKing.hp'),9,'an actual arrow interrupts a spin from either side');assert.equal(run('lavaKing.phase'),'recover');assert(run('lavaKing.dizzy>0'));assert(!run('hitLavaKing(player,true)'),'no repeat damage during recoil');
 }
 king();run("lavaKingPhase('spin');player.x=lavaKing.x-100;player.invincible=0;player.y=-558;player.onGround=true");tick('updateLavaKing',.05);assert.equal(run('lives'),2,'spin sword reaches beyond the body');
 king();run("lavaKingPhase('spin');player.x=lavaKing.x-100;player.invincible=0;player.y=FIRE_KING_ARENA.y-210;player.onGround=false");tick('updateLavaKing',.05);assert.equal(run('lives'),3,'jumping clear of the sword sweep is safe');
 king();run("lavaKingPhase('spin');lavaKing.hp=1;hitLavaKing(player,true)");assert(run('lavaKing.defeated&&lavaKingFireballs.length===0'));
 king();run("lavaKingPhase('spin');state='map';var snapshot=JSON.stringify(lavaKing);update(.5)");assert.equal(run('JSON.stringify(lavaKing)'),run('snapshot'));run("state='playing';restoreFireCheckpoint()");assert.equal(run('lavaKing.phase'),'patrol');
 for(const direction of [-1,1]){
  knight();run(`finalKnight.dizzy=5;finalKnight.phase='hurt';player.x=finalKnight.x+(${direction}>0?-player.w-10:finalKnight.w+10);keys.add('${direction>0?'ArrowRight':'ArrowLeft'}')`);
  tick('update',.6);assert.equal(run('player.x'),run(direction>0?'finalKnight.x-player.w':'finalKnight.x+finalKnight.w'),'cannot walk through a stunned knight');
  run("keys.add('ArrowDown')");tick('update',.2);assert.equal(run('player.x'),run(direction>0?'finalKnight.x-player.w':'finalKnight.x+finalKnight.w'),'cannot duck through');
  run("keys.delete('ArrowDown');updateDuck();jump();jump();jump()");let crossed=false;
  for(let i=0;i<fps*1.4;i++){run(`update(1/${fps})`);if(run(direction>0?'player.x>finalKnight.x+finalKnight.w':'player.x+player.w<finalKnight.x')){crossed=true;break;}}
  assert(crossed,'a boosted jump crosses the knight in either direction');assert.equal(run('lives'),3);
  knight();run(`player.x=finalKnight.x+(${direction}>0?-player.w-30:finalKnight.w+30);player.facing=${direction};selectFinalWeapon('trident');keys.add('${direction>0?'ArrowRight':'ArrowLeft'}');attack()`);tick('update',.4);
  assert.equal(run('finalKnight.hp'),9,'dash still deals one heart');assert.equal(run('waterTrident.dash'),0);assert.equal(run('player.x'),run(direction>0?'finalKnight.x-player.w':'finalKnight.x+finalKnight.w'),'dash stops at the hurt body');
 }
 knight();run('finalKnight.dizzy=5;player.x=900;player.y=412;blockFinalKnight(500)');assert.equal(run('player.x'),run('finalKnight.x-player.w'),'large horizontal sweep cannot tunnel through recoil');
 run('finalKnight.defeated=true;player.x=900;blockFinalKnight(500)');assert.equal(run('player.x'),900,'victory still opens the way to the throne');
}
console.log('PASS Lava King spin warning/selection/travel/recovery, real frontal/rear arrow interrupts, sword reach/jump safety, defeat/pause/respawn; solid hurt knight against walk/duck/dash, jump over both sides and swept tunneling at 30/60/120 FPS.');
