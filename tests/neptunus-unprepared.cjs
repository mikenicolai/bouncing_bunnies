const assert=require('node:assert/strict'),{run}=require('./air.cjs');
function reset(suit=false,trident=false){run(`level='water';resetGame();soundOn=false;waterSharks=[];waterPirates=[];waterGate.phase='open';waterGate.lift=1;waterAquaSuit=${suit};waterTrident.owned=${trident};neptunusHelpSeen=false;neptunusHelpTime=0;player.inWater=true;player.x=WATER_ARENA.left+300;player.y=1100;player.vx=player.vy=0;player.invincible=999;checkpoint={x:WATER_SUIT_SPOT.x-21,y:WATER_SUIT_SPOT.y-29,water:true};clearInputs();`);}
for(const fps of [30,60,120])for(const suit of [false,true])for(const trident of [false,true]){
 reset(suit,trident);const before=run('({x:neptunus.x,y:neptunus.y})');
 let attacked=false;
 for(let i=0;i<fps*4;i++){run(`update(1/${fps})`);attacked ||=run("neptunus.mode!=='idle'");}
 assert(run('neptunus.active')&&attacked,'boss attacks regardless of equipment');
 assert(run(`neptunus.x!==${before.x}||neptunus.y!==${before.y}`),'boss moves without relics');
 assert.equal(run('neptunus.sealed'),suit&&trident,'unprepared players may retreat for relics');
 assert.equal(run('neptunusHelpLines().length'),0,'no hint spoils a first attempt');
 assert.equal(run('waterAquaSuit'),suit);assert.equal(run('waterTrident.owned'),trident,'activation never grants equipment');
 if(!suit||!trident){
  const cp=run('JSON.stringify(checkpoint)');run('ensureNeptunusCheckpoint()');assert.equal(run('JSON.stringify(checkpoint)'),cp,'no forced unequipped checkpoint inside the arena');
  run('player.invincible=0;lives=1;hurt()');assert.equal(run('state'),'lost');
  const lines=run('neptunusHelpLines()');assert.equal(lines.length,Number(!suit)+Number(!trident));
  assert(lines.every(l=>l.includes('Aqua Suit')||l.includes('Trident')));assert(!run("document.querySelector('#waterRetryHint').hidden"));
  run('coinWallet=20');assert(run('buyReviveHeart()'));assert(run('player.x<WATER_ARENA.left'),'paid retry is not trapped away from missing gear');
  assert.equal(run('coinWallet'),0);assert.equal(run('lives'),1);assert.equal(run('waterAquaSuit'),suit);assert.equal(run('waterTrident.owned'),trident);
  // The hint survives a full level restart and waits until the relic region.
  run('resetGame();updateWaterGuidance(20)');assert(run('neptunusHelpTime>0'),'hint does not expire on the starting beach');
  run('player.x=WATER_GATE.exitX;updateWaterGuidance(2)');assert.equal(run('neptunusHelpTime'),8);
  run('waterTrident.owned=true;waterAquaSuit=true');assert.equal(run('neptunusHelpLines().length'),0,'hints stop once both items are owned');
 }
}
// A bare-handed player can land a normal, single-heart hit.
reset();run("updateNeptunus(0);player.x=neptunus.x-player.w-10;player.y=neptunus.y+80;player.facing=1;attack()");assert.equal(run('neptunus.hp'),9);assert(run('neptunus.dizzy>0'));
// Drowning is a failed attempt too, even with hearts left.
reset();run('updateNeptunus(0);player.air=.001;player.invincible=0;updateWater(1/60)');assert.equal(run('lives'),2);assert(run('neptunusHelpSeen'));assert(run('player.x<WATER_ARENA.left'));
// Collecting missing gear outside must not close the return path too early.
reset();run('updateNeptunus(0);player.x=WATER_SUIT_SPOT.x;waterAquaSuit=waterTrident.owned=true;updateNeptunus(0)');assert(!run('neptunus.sealed'));
run('player.x=WATER_ARENA.left+150;updateNeptunus(0)');assert(run('neptunus.sealed&&checkpoint.arena'));
console.log('PASS unprepared Neptunus: attacks/movement with every gear combination, harmless first attempt guidance, failure-only item hints, unarmed hit, drowning/paid retry, retreat and equipped return seal at 30/60/120 FPS.');
