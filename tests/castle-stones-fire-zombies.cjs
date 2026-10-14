const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const castle=()=>run("meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();soundOn=false;player.invincible=999;");
for(const fps of [30,60,120]){
 for(const kind of ['zombie','goblin','pirate','air','lava'])for(const side of [-1,1])for(const id of [0,1,2]){
  castle();run(`var block=finalPlatforms.filter(finalHallBlock)[${id}];var m={...finalMonsters.find(m=>m.kind==='${kind}'),x:block.x+(${side}<0?-90:block.w+40),min:block.x-200,max:block.x+block.w+200,patrolDir:${side<0?1:-1},facing:${side<0?1:-1}};finalMonsters=[m];player.x=${side}<0?block.x+block.w+1:block.x-43;player.y=412`);
  const start=run('m.x');let moved=false;
  for(let i=0;i<fps*3;i++){run(`updateFinalMonsters(1/${fps})`);assert(!run('overlap(m,block)'),kind+' stays outside its stone');if(Math.abs(run('m.x')-start)>5)moved=true;}
  assert(moved,kind+' '+side+' '+id+' patrols beside the stone');
  assert(run(side<0?'m.x+m.w<=block.x-24':'m.x>=block.x+block.w+24'),'painted body has clearance from foreground stone');
 }
 // The last surface zombie walks beyond its old platform edge onto the actual slope.
 run("level='fire';resetGame();fireStoneClock=999;player.invincible=999;fireMode='volcano';player.x=3250;player.y=fireSlopeY(3271)-58;player.onGround=true;var z=fireZombies.find(z=>z.surface&&z.platform===5);z.x=2770;z.facing=1;var oldPhase=z.phase;var farZombie=fireZombies.find(z=>z.surface&&z.platform===1);var farX=farZombie.x;var farPhase=farZombie.phase");
 for(let i=0;i<fps*4;i++)run(`update(1/${fps});fireStoneClock=999`);
 assert(run('z.x>2800&&z.walking&&z.phase>oldPhase'),'zombie moves and animates after climb mode starts');assert(Math.abs(run('z.y+z.h-fireSlopeY(z.x+z.w/2)'))<.001,'feet follow the volcano');assert(run('farZombie.x!==farX&&farZombie.phase>farPhase'),'other outdoor zombies still animate');
 run('z.x=3400;z.facing=-1;player.x=3000;player.y=fireSlopeY(3021)-58;player.onGround=true');const high=run('z.y');for(let i=0;i<fps;i++)run(`update(1/${fps});fireStoneClock=999`);assert(run('z.x<3400'));assert(Math.abs(run('z.y+z.h-fireSlopeY(z.x+z.w/2)'))<.001);
 run("z.dizzy=.5;var dizzyX=z.x;state='map';var frozenPhase=z.phase;update(.2)");assert.equal(run('z.phase'),run('frozenPhase'));run("state='playing';updateFireSurfaceZombies(.2)");assert.equal(run('z.x'),run('dizzyX'),'hit stun still stops walking briefly');run('updateFireSurfaceZombies(.4)');assert(run('z.x!==dizzyX'),'walking recovers after stun');
 run('player.invincible=0;player.x=z.x;player.y=z.y;var beforeContact=lives;updateFireSurfaceZombies(0)');assert.equal(run('lives'),run('beforeContact-1'),'moving volcano zombie contact still hurts');run('updateFireSurfaceZombies(0)');assert.equal(run('lives'),run('beforeContact-1'),'damage immunity prevents duplicate contact');
 // Castle stars are a two-slot returning pair, with exactly one heart per hit.
 castle();run("player.x=3600;player.y=412;player.onGround=true;player.vx=0;finalMonsters=[];selectFinalWeapon('stars');attack();");assert.equal(run('windStars.slots.length'),2);
 for(let i=0;i<Math.floor(fps*.46);i++)run(`update(1/${fps})`);run('player.attackCooldown=0;attack()');assert.equal(run("windStars.slots.filter(s=>s.state==='flying').length"),2);run('player.attackCooldown=0;attack()');assert.equal(run("windStars.slots.filter(s=>s.state==='flying').length"),2,'only two stars can be out');
 run("selectFinalWeapon('knives')");for(let i=0;i<fps*3;i++)run(`update(1/${fps})`);assert(run("windStars.slots.every(s=>s.state==='ready')"),'misses/wall hits return automatically even after switching');
 castle();run("player.x=3600;player.y=412;player.onGround=true;finalMonsters=[{...finalMonsters[0],x:3740,min:3740,max:3740,hp:3,maxHP:3,dizzy:0}];selectFinalWeapon('stars');attack()");for(let i=0;i<fps*2;i++)run(`update(1/${fps})`);assert.equal(run('finalMonsters[0].hp'),2);assert(run("windStars.slots.every(s=>s.state==='ready')"));
}
// R cannot reset a run or bypass game-over/map progression in any world.
for(const world of ['meadow','air','earth','water','fire','final'])for(const mode of ['playing','map','lost','title']){
 run(`level='${world}';resetGame();player.x=1500;score=5;coinWallet=23;tempest.hp=4;lavaKing.hp=6;state='${mode}';revivePending=state==='lost';var beforeR=JSON.stringify({level,state,player,score,coinWallet,coins,tempest,lavaKing,fireArrow,waterTrident})`);
 run("window.listeners.keydown[1]({code:'KeyR',repeat:false,preventDefault(){}})");assert.equal(run('JSON.stringify({level,state,player,score,coinWallet,coins,tempest,lavaKing,fireArrow,waterTrident})'),run('beforeR'),world+' R has no reset action');assert(!run("keys.has('KeyR')"));
}
run("level='air';resetGame()");assert.equal(run('windStars.slots.length'),8,'Air retains its existing Tempest star mechanics');
console.log('PASS Castle/Fire fixes: all five monsters blocked by each foreground stone from both sides, animated uphill/downhill zombies and stun/pause, two returning one-heart Castle stars, and no R reset in every world/state at 30/60/120 FPS.');
