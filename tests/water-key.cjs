const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';waterFinished=false;resetGame();soundOn=false;player.invincible=99");
for(const fps of [30,60,120]){
 // Cross both cabin widths in the water ABOVE their roofs, then turn back.
 // Previously the cabin ceiling blocked this visibly open upper route.
 reset();run("player.inWater=true;player.x=5300;player.y=750;player.air=15;keys.add('ArrowRight')");
 for(let frame=0;frame<fps*8;frame++){
  run("if(player.y<745)keys.add('ArrowDown');if(player.y>755)keys.delete('ArrowDown')");
  run(`update(1/${fps})`);
  assert(run('player.y<800'),'upper route must not snap the bunny into cabin air');
  assert(!run('waterAirPocket()||waterPortalKeyTaken'),'passing above a cabin gives neither air nor its key');
 }
 assert(run('player.x>6880'),'both ship cabin boundaries can be crossed');
 assert(run('player.air<8&&lives===3'),'bypass consumes oxygen normally');
 run("keys.clear();keys.add('ArrowLeft')");
 for(let frame=0;frame<fps*4;frame++){
  run("if(player.y<745)keys.add('ArrowDown');if(player.y>755)keys.delete('ArrowDown')");run(`update(1/${fps})`);
 }
 assert(run('player.x<6350'),'the upper bypass also permits returning toward the ship');
 // The timber roof prevents diving straight through into the key cabin.
 reset();run("player.inWater=true;player.x=5544;player.y=750;keys.add('ArrowDown')");
 for(let frame=0;frame<fps*2;frame++)run(`update(1/${fps})`);
 assert(run('player.y+player.h<=waterShipRoofs[0].y&&!waterPortalKeyTaken'));
 // The closed gate blocks the entire cave height, including routes above/below the lock.
 for(const y of [800,1067,1260]){
  reset();run(`player.inWater=true;player.x=WATER_GATE.x-player.w-8;player.y=${y};keys.add('ArrowRight')`);
  for(let frame=0;frame<fps*2;frame++)run(`update(1/${fps})`);
  assert(run("waterGate.phase==='locked'&&player.x+player.w<=WATER_GATE.x&&!waterFinished"));
 }
 // Swim up the actual left hatch, refill air and travel along the waterline.
 reset();run("player.inWater=true;player.x=5544;player.y=1080;player.air=8;keys.add('ArrowUp')");
 for(let frame=0;frame<fps*2;frame++)run(`update(1/${fps})`);
 assert(run('waterAirPocket()===waterAirPockets[3]&&player.air===WATER_AIR'));
 assert(!run('waterPortalKeyTaken'),'entering the cabin alone does not grant the key');
 run("keys.clear();keys.add('ArrowRight')");
 for(let frame=0;frame<fps*2&&!run('waterPortalKeyTaken');frame++)run(`update(1/${fps})`);
 assert(run('waterPortalKeyTaken'),'head-above-water swimming reaches the hanging key');
 // A lost heart retains the inventory and returns to breathable cabin water.
 run('keys.clear();player.y=waterAirPockets[3].surface+80;player.vx=0;player.vy=0;player.air=.001');run(`update(1/${fps})`);
 assert.equal(run('lives'),2);assert(run('waterPortalKeyTaken&&waterBreathing()'));
 // Carrying the key alone doesn't remove the physical barrier. Swim to the lock.
 run("player.x=WATER_GATE.lockX-60;player.y=WATER_GATE.lockY-player.h/2;player.vx=0;player.vy=0;keys.add('ArrowRight')");
 for(let frame=0;frame<fps*.4;frame++)run(`update(1/${fps})`);
 assert.equal(run('waterGate.phase'),'inserting');assert.equal(run('waterGate.lift'),0);
 assert(run('player.x+player.w<=WATER_GATE.x&&!waterFinished'),'key insertion does not allow early passage');
 for(let frame=0;frame<fps*1.1;frame++)run(`update(1/${fps})`);
 assert.equal(run('waterGate.phase'),'lifting');assert(run('waterGate.lift>0&&waterGate.lift<1'));
 assert(run('player.x+player.w<=WATER_GATE.x&&!waterFinished'),'rising gate still blocks the passage');
 for(let frame=0;frame<fps*1.3;frame++)run(`update(1/${fps})`);
 assert.equal(run('waterGate.phase'),'open');assert.equal(run('waterGate.lift'),1);
 assert(!run('waterFinished'),'opening alone does not finish: swim through to the right');
 for(let frame=0;frame<fps*3&&run('player.x<WATER_GATE.exitX+100');frame++)run(`update(1/${fps})`);
 assert(!run('waterFinished')&&run('player.x>WATER_GATE.exitX'),'the raised gate opens the continuation without completing Water');
 reset();assert(!run('waterPortalKeyTaken'),'restarting a run restores the key collectible');
 assert.equal(run('waterGate.phase'),'locked');assert.equal(run('waterGate.lift'),0);
 // Swimming below the hanging key cannot collect it through the cabin floor.
 run('player.inWater=true;player.x=WATER_PORTAL_KEY.x-player.w/2;player.y=waterAirPockets[3].surface+20');run(`update(1/${fps})`);
 assert(!run('waterPortalKeyTaken'));
}
assert(run('WATER_SHIP_HATCHES.every(h=>waterAirPockets.some(p=>p.ship&&h.x>=p.x&&h.x+h.w<=p.x+p.w&&h.y>p.surface&&h.pocket===p))'),'four floor hatches lead into the two enclosed cabins');
console.log('PASS: upper ship bypass and return without air/key, solid cabin roofs, closed gate without key, reachable ship key via real hatch and surface swimming, retained key after drowning, key inserts before upward gate movement and rightward passage, restart restores collectible, no pickup through floor at 30/60/120 FPS.');
