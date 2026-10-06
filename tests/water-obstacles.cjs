const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';resetGame();soundOn=false");
// Air chambers and their waterlines must be above both sides of the rock mouth.
reset();
assert(run('waterAirPockets.filter(p=>!p.ship).every(p=>p.surface<=Math.min(waterProfileY(WATER_ROOF,p.x+12),waterProfileY(WATER_ROOF,p.x+p.w-12))-29)'));
for(let i=0;i<run('waterAirPockets.length');i++){
 if(run(`waterAirPockets[${i}].ship`))continue;
 reset();run(`var pocket=waterAirPockets[${i}];player.inWater=true;player.x=pocket.x+pocket.w/2-player.w/2;player.y=pocket.surface-15;player.air=2;player.invincible=30;update(1/60)`);
 assert(run('player.air<2'),'head beneath the chamber waterline cannot breathe');
 run('player.y=pocket.surface-35;player.vy=0;update(1/60)');assert.equal(run('player.air'),15);
 run('jump()');assert(!run('player.breaching'),'a roof pocket gives a stroke, not an airborne leap');
}
for(const fps of [30,60,120]){
 // A single normal-speed jump clears each cactus, with no immunity or double jump.
 reset();run("player.onGround=true;keys.add('ArrowRight')");let jumps=0;
 for(let i=0;i<fps*8&&run('player.x<1440');i++){
  if(run('player.onGround&&waterCacti.some(c=>player.x<c.x&&player.x+player.w>=c.x-20)')){run('jump()');jumps++;}
  run(`update(1/${fps})`);assert.equal(run('lives'),3,`cactus course can be jumped at ${fps} FPS`);
 }
 assert(run('player.x>1420'),'continuous beach reached');assert.equal(jumps,3);
 // Floating movement follows a fixed-length chain and leaves the ship deck clear.
 reset();run('player.inWater=true;player.x=2634;player.y=waterAirPockets[0].surface-42');
 for(let i=0;i<fps*10;i++){
  run(`update(1/${fps})`);
  assert(run('waterPirates.every(p=>Math.abs(Math.hypot(waterPirateAnkle(p).x-waterPirateAnchor(p).x,waterPirateAnkle(p).y-waterPirateAnchor(p).y)-p.chainLength)<.01)'));
  assert(run('waterPirates.every(p=>p.y+p.h<waterFloorY(p.anchorX+24)-100&&!waterShipDeck.some(d=>overlap(p,d)))'));
 }
}
reset();run('player.x=waterCacti[0].x+30;player.y=292;player.onGround=true;update(1/60)');assert.equal(run('lives'),2,'walking into cactus spines costs a heart');
// An intact chain and iron ballast are physical obstacles. Defeating its pirate
// clears the tether, while the independent combat suite checks both weapons.
reset();run('player.inWater=true;player.invincible=30;var link=waterTetherSolids(waterPirates[2])[8];player.x=link.x-player.w/2;player.y=link.y-15;update(1/60)');
assert(run('!waterTetherSolids(waterPirates[2]).some(s=>overlap(player,s))'),'a chain that sways into the bunny pushes it clear instead of trapping its controls');
reset();assert(run('waterTetherSolids(waterPirates[2]).length>10'));
run('waterPirates[0].hp=0;waterPirates[1].hp=0;waterPirates[2].swingCooldown=999;player.inWater=true;player.invincible=30;player.x=10200;player.y=1190;keys.add("ArrowRight")');
for(let i=0;i<120;i++)run('update(1/60)');
assert(run('player.x<10410'),'the intact tether blocks crossing below its floating pirate');
run('waterPirates[2].hp=0');for(let i=0;i<90;i++)run('update(1/60)');
assert(run('player.x>10450'),'defeating the pirate releases the obstructing chain');
console.log('PASS: roof-bound air waterlines, cactus damage and three clean jumps, floating fixed-length pirate tethers, solid chains and defeat clearance.');
