const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';waterFinished=false;resetGame();soundOn=false;player.invincible=99");
for(const fps of [30,60,120]){
 // A locked portal never finishes the level, even after crossing its centre.
 reset();run('player.inWater=true;player.x=WATER_GATE_X+20;player.y=1100');
 for(let frame=0;frame<fps*2;frame++)run(`update(1/${fps})`);
 assert(!run('waterFinished'));assert.equal(run('state'),'playing');
 // Swim up the actual left hatch, refill air and travel along the waterline.
 reset();run("player.inWater=true;player.x=5584;player.y=1080;player.air=8;keys.add('ArrowUp')");
 for(let frame=0;frame<fps*2;frame++)run(`update(1/${fps})`);
 assert(run('waterAirPocket()===waterAirPockets[3]&&player.air===WATER_AIR'));
 assert(!run('waterPortalKeyTaken'),'entering the cabin alone does not grant the key');
 run("keys.clear();keys.add('ArrowRight')");
 for(let frame=0;frame<fps*2&&!run('waterPortalKeyTaken');frame++)run(`update(1/${fps})`);
 assert(run('waterPortalKeyTaken'),'head-above-water swimming reaches the hanging key');
 // A lost heart retains the inventory and returns to breathable cabin water.
 run('keys.clear();player.y=waterAirPockets[3].surface+80;player.vx=0;player.vy=0;player.air=.001');run(`update(1/${fps})`);
 assert.equal(run('lives'),2);assert(run('waterPortalKeyTaken&&waterBreathing()'));
 run('player.x=WATER_GATE_X+20;player.y=1100;player.vx=0;player.vy=0');run(`update(1/${fps})`);
 assert(run('waterFinished'),'the same portal opens after collecting the key');
 reset();assert(!run('waterPortalKeyTaken'),'restarting a run restores the key collectible');
 // Swimming below the hanging key cannot collect it through the cabin floor.
 run('player.inWater=true;player.x=WATER_PORTAL_KEY.x-player.w/2;player.y=waterAirPockets[3].surface+20');run(`update(1/${fps})`);
 assert(!run('waterPortalKeyTaken'));
}
assert(run('WATER_SHIP_HATCHES.every(h=>waterAirPockets.some(p=>p.ship&&h.x>=p.x&&h.x+h.w<=p.x+p.w&&h.y===p.surface))'),'both hatches open directly into their cabin waterline');
console.log('PASS: closed gate without key, reachable ship key via real hatch and surface swimming, retained key after drowning, key opens portal, restart restores collectible, no pickup through floor at 30/60/120 FPS.');
