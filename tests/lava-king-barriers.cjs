const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const arena=()=>run("level='fire';resetGame();fireArrow.owned=true;beginLavaKing();lavaKing.dizzy=1000;player.y=FIRE_KING_ARENA.y-player.h;player.onGround=true;");
for(const fps of [30,60,120])for(const width of [480,960])for(const side of [0,1])for(const aiming of [false,true]){
  arena();run(`W=${width};fireArrow.aiming=${aiming};player.x=${side===0?'FIRE_KING_BARRIERS[0].x+FIRE_KING_BARRIERS[0].w+35':'FIRE_KING_BARRIERS[1].x-player.w-35'};keys.add('${side===0?'ArrowLeft':'ArrowRight'}');`);
  for(let f=0;f<fps*.55;f++)run(`update(1/${fps})`);
  assert.equal(run('lives'),2,'flame contact takes exactly one heart');
  assert(run('player.x>=FIRE_KING_BARRIERS[0].x+40&&player.x+player.w<=FIRE_KING_BARRIERS[1].x'),'barriers hold the arena boundary');
  assert.equal(run('state'),'playing');
  assert(run('player.invincible>0'),'normal damage immunity prevents frame-by-frame damage');
  // Defeating the King extinguishes the flames, including their damage.
  run(`keys.clear();lavaKing.defeated=true;player.invincible=0;player.x=FIRE_KING_BARRIERS[${side}].x;player.y=FIRE_KING_ARENA.y-player.h;updateLavaKingBarriers();`);
  assert(!run('lavaKingBarriersActive()'));assert.equal(run('lives'),2);
}
// Swept contact detects a fast crossing, and pushes the bunny into the arena.
arena();run('player.x=FIRE_KING_ARENA.left+8;updateLavaKingBarriers(FIRE_KING_ARENA.left+150)');
assert.equal(run('lives'),2);assert.equal(run('player.x'),run('FIRE_KING_BARRIERS[0].x+40'));
// An airborne bunny also takes damage; the flame wall spans the full jump height.
arena();run('player.x=FIRE_KING_BARRIERS[1].x-20;player.y=FIRE_KING_ARENA.y-210;player.onGround=false;updateLavaKingBarriers()');assert.equal(run('lives'),2);
run("level='fire';resetGame();fireMode='secondVolcano';player.x=FIRE_KING_BARRIERS[0].x;player.y=-558;updateLavaKingBarriers()");assert.equal(run('lives'),3,'no barrier before the fight');
console.log('PASS Lava King flame barriers: left/right, equipped/stowed, one-heart contact and immunity, solid bounds, airborne/swept hits, and defeat/approach safety at phone/desktop sizes and 30/60/120 FPS.');
