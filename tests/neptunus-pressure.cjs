const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function reset(){run("level='water';resetGame();soundOn=false;waterSharks=[];waterPirates=[];waterGate.phase='open';waterGate.lift=1;waterTrident.owned=true;waterAquaSuit=true;player.inWater=true;player.vx=player.vy=0;player.x=WATER_ARENA.left+130;player.y=1200;");}
for(const fps of [30,60,120]){
 // Normal entry replaces the outside suit checkpoint with an inside checkpoint.
 reset();run("checkpoint={x:WATER_SUIT_SPOT.x-21,y:WATER_SUIT_SPOT.y-29,water:true,suit:true};updateNeptunus(0)");
 assert(run('checkpoint.arena&&checkpoint.x>WATER_ARENA.left+80'));
 // Reproduce an already-started fight with the old checkpoint as well. A paid
 // continuation repairs it, retaining boss HP, cyber upgrade, gear and collected coins.
 for(const oldCheckpoint of [false,true]){
  reset();run(`updateNeptunus(0);neptunus.hp=5;waterTrident.cyber=true;coinWallet=39;resetRunWallet();collectCoin(coins[0]);${oldCheckpoint?"checkpoint={x:12199,y:1351,water:true,suit:true};":''}player.x=neptunus.x-60;player.y=neptunus.y+90;neptunusShots=[{x:player.x,y:player.y,r:23,vx:0,vy:0,life:3,kind:'tide'}];lives=1;player.invincible=0;hurt();`);
  assert.equal(run('state'),'lost');assert(run('buyReviveHeart()'));
  assert(run("state==='playing'&&coinWallet===20&&lives===1&&score===1&&coins[0].taken"));
  assert(run('player.inWater&&waterAquaSuit&&waterTrident.owned&&waterTrident.cyber&&neptunus.hp===5&&neptunus.active'));
  assert(run('player.x>WATER_ARENA.left+80&&waterPositionClear(player,[...waterReefs,...waterShipSolids(),...waterAdventureSolids()])'),'revival is inside the sealed arena and clear of stone');
  assert.equal(run('neptunusShots.length'),0);
  const start=run('player.x');run("keys.add('ArrowRight')");for(let f=0;f<fps;f++)run(`update(1/${fps})`);
  assert(run('player.x')>start+100,'normal movement can continue towards the boss');
  assert(run('fireWaterTrident()'),'the retained trident still attacks');
  assert(!run('buyReviveHeart()'));assert.equal(run('coinWallet'),20,'one purchase only');
 }
 // A hit still cancels the current windup and its shots, but no longer stuns the
 // king for a whole dash cycle. Water guard visibly rejects the next dash.
 reset();run("neptunus.active=true;neptunus.mode='volleyWarn';neptunusShots=[{x:0,y:0,life:3}];hitNeptunus()");
 assert.equal(run('neptunusShots.length'),0);assert.equal(run('neptunus.mode'),'hurt');
 for(let f=0;f<Math.ceil(fps*.5);f++)run(`updateNeptunus(1/${fps})`);
 assert(run("neptunus.mode.endsWith('Warn')&&neptunus.guard>0"),'boss starts a readable counterattack before guard expires');
 run("player.x=neptunus.x-80;player.y=neptunus.y+80;waterTrident.mode='dash';fireWaterTrident();var guardHP=neptunus.hp;hitNeptunus()");
 assert(run('neptunus.hp===guardHP&&waterTrident.dash===0&&waterTrident.shot.returning'),'guard deflects a spammed dash without losing a heart');
 // Repeated attack attempts cannot keep the boss in an endless stun. He gets
 // actual tide/volley/lunge attacks off while the player keeps attacking.
 reset();const pressure=run(`(()=>{
  neptunus.active=true;player.invincible=999;let nextHit=0,tides=0,orbs=0,lunges=0,oldMode='',beforeShots=new Set();
  for(let f=0;f<${fps}*12;f++){
   const time=f/${fps};if(time>=nextHit){hitNeptunus();nextHit+=.85;}
   updateNeptunus(1/${fps});
   for(const p of neptunusShots)if(!beforeShots.has(p)){if(p.kind==='tide')tides++;else orbs++;beforeShots.add(p);}
   if(neptunus.mode==='thrust'&&oldMode!=='thrust')lunges++;oldMode=neptunus.mode;
  }return {tides,orbs,lunges,hp:neptunus.hp};
 })()`);
 assert(pressure.tides>0&&pressure.orbs>0&&pressure.lunges>0,JSON.stringify(pressure));
 // Both phases have a visible warning; the low-health phase casts more quickly.
 const castTimes=[];
 for(const hp of [10,5]){
  reset();castTimes.push(run(`(()=>{neptunus.active=true;neptunus.hp=${hp};neptunus.cooldown=0;neptunus.turn=2;updateNeptunus(0);let time=0;while(!neptunusShots.length&&time<2){updateNeptunus(1/${fps});time+=1/${fps};}return time;})()`));
 }
 assert(castTimes[0]>=.5&&castTimes[0]<.57);assert(castTimes[1]>=.4&&castTimes[1]<castTimes[0]);
}
// Pause freezes the guard and all fight state; a fresh world resets the encounter.
reset();run('neptunus.active=true;hitNeptunus();state=\'map\'');const before=run('JSON.stringify(neptunus)');run('update(.5)');assert.equal(run('JSON.stringify(neptunus)'),before);
run('resetGame()');assert(run('neptunus.hp===10&&!neptunus.active&&neptunus.guard===0&&!checkpoint.arena'));
console.log('PASS Neptunus: inside-arena entry and legacy paid respawn, one-heart/20-coin continuation retains progress and attacks, faster telegraphed phases, water guard breaks dash stun-lock, real counterattacks and pause/reset at 30/60/120 FPS.');
