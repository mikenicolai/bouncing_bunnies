const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='fire';resetGame();fireFinished=false;");
const arena=()=>{reset();run("fireArrow.owned=true;beginSecondVolcano();player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();");};
// Exiting the labyrinth after finding the arrow starts the second outdoor climb.
reset();run('beginFireMaze();fireArrow.owned=true;player.mazeC=23;player.mazeR=1;player.x=mazeCenter(23,1).x-21;player.y=mazeCenter(23,1).y-29;update(1/60)');
assert.equal(run('fireMode'),'secondVolcano');assert.equal(run('fireUnderground'),false);assert.equal(run('fireFinished'),false);assert.equal(run('player.y+58'),2050);assert.equal(run('checkpoint.mode'),'secondVolcano');assert(run('mazeOpen(24,1)'));
// Traverse the entire second slope with normal movement and jumps before aiming at the summit.
for(const width of [480,960])for(const fps of [30,60,120]){
 reset();run(`fireArrow.owned=true;W=${width};player.x=6659;beginSecondVolcano();keys.add('ArrowRight')`);let jumps=0;
 for(let f=0;f<fps*20&&run("fireMode==='secondVolcano'");f++){
  if(run('player.onGround&&fireRollingStones.some(s=>s.x>player.x&&s.x-player.x<150)')){run('jump()');jumps++;}run(`update(1/${fps})`);
 }
 assert.equal(run('fireMode'),'king');assert.equal(run('lives'),3);assert(jumps>=4);assert.equal(run('lavaKing.hp'),10);assert(run('lavaKing.active'));assert(run('fireArcheryMode()'));assert.equal(run('checkpoint.mode'),'king');assert.equal(run('fireRollingStones.length'),0);
}
// Aiming disables jumps, while sword and casting warnings retain their timing.
arena();run('jump()');assert(run('player.onGround'));assert.equal(run('player.vy'),0);
run("lavaKingPhase('windup');updateLavaKing(.6)");assert.equal(run('lavaKing.phase'),'windup');assert.equal(run('lives'),3);
run('updateLavaKing(.06)');assert.equal(run('lavaKing.phase'),'slash');run('updateLavaKing(.25)');assert.equal(run('lavaKing.phase'),'recover');
run("lavaKingPhase('cast');updateLavaKing(.7)");assert.equal(run('lavaKingFireballs.length'),0);run('updateLavaKing(.11)');assert.equal(run('lavaKingFireballs.length'),1);
const x=run('lavaKingFireballs[0].x'),y=run('lavaKingFireballs[0].y');run('updateLavaKing(.1)');assert(run('lavaKingFireballs[0].x')<x);assert(run('lavaKingFireballs[0].y')>y);
// The portal is still locked until defeating the ten-heart king.
arena();run('player.x=FIRE_EXIT_X;update(0)');assert.equal(run('state'),'playing');assert.equal(run('fireFinished'),false);
// Respawn and map pause retain progress; a fresh run replenishes the encounter.
arena();run("lavaKing.hp=7;lavaKingPhase('throw');respawnFire()");assert.equal(run('lavaKing.hp'),7);assert.equal(run('fireMode'),'king');assert.equal(run('lavaKingFireballs.length'),0);assert.equal(run('player.y'),-558);assert(run('fireArcheryMode()'));
run("state='map';const age=lavaKing.age;update(.1)");assert.equal(run('lavaKing.age'),run('age'));
reset();assert.equal(run('lavaKing.hp'),10);assert.equal(run('lavaKing.active'),false);assert.equal(run('lavaKingFireballs.length'),0);
console.log('PASS Lava King: maze exit with arrow, second climb at phone/desktop widths and 30/60/120 FPS, aiming at summit, attack warnings, checkpoints, pause and reset.');
