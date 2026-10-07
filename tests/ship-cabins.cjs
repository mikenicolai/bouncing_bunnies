const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';resetGame();soundOn=false;player.inWater=true;waterSharks=[];waterPirates=[]");
for(const fps of [30,60,120]){
  const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`update(1/${fps})`);};
  // Side walls prevent sideways air access from either side of both cabins.
  for(const id of [3,4])for(const side of [-1,1]){
    reset();run(`var p=waterAirPockets[${id}];player.x=${side<0?'p.x-90':'p.x+p.w+30'};player.y=p.surface-WATER_FLOAT_HEAD;player.air=8;keys.add('${side<0?'ArrowRight':'ArrowLeft'}')`);tick(2);
    assert(run(side<0?'player.x+player.w<=p.x':'player.x>=p.x+p.w'),`side ${side} cabin ${id} blocks at ${fps}`);
    assert(!run('waterAirPocket()'));assert(run('player.air<7&&!waterPortalKeyTaken'),'wall contact cannot grant air or key');
  }
  // All four visibly open floor hatches allow entry, breathing and a return dive.
  for(let id=0;id<4;id++){
    reset();run(`var h=WATER_SHIP_HATCHES[${id}];player.x=h.x+h.w/2-player.w/2;player.y=1120;player.air=8;keys.add('ArrowUp')`);tick(2);
    assert(run('waterAirPocket()===h.pocket&&player.air===WATER_AIR'));
    assert(run('player.y===h.pocket.surface-WATER_FLOAT_HEAD'),'head rises above its local waterline');
    run("keys.clear();keys.add('ArrowDown')");tick(1.4);
    assert(run('player.y>1048&&!waterAirPocket()'),'exit dive crosses the actual open floor');
  }
  // Swimming downward over intact floor cannot exit through its timber.
  reset();run("var p=waterAirPockets[3];player.x=p.x+230-player.w/2;player.y=p.surface-WATER_FLOAT_HEAD;keys.add('ArrowDown')");tick(2);
  assert(run('player.y+player.h<=1020&&!overlap(player,waterShipDeck[1])'));
  // Roof and keel remain solid; the lower side doorway is a genuine passage.
  reset();run("player.x=5584;player.y=750;keys.add('ArrowDown')");tick(2);assert(run('player.y+player.h<=838'));
  reset();run("player.x=6000;player.y=1160;keys.add('ArrowDown')");tick(2);assert(run('player.y+player.h<=1250'));
  reset();run("player.x=5100;player.y=1140;keys.add('ArrowRight')");tick(2);assert(run('player.x>5480'),'clear bow doorway enters the lower hold');
  // Complete a visit through one hatch and depart through its other hatch.
  reset();run("player.x=5531;player.y=1120;player.air=8;keys.add('ArrowUp')");tick(2);
  run("keys.clear();keys.add('ArrowRight')");
  for(let i=0;i<fps*3&&!run('waterPortalKeyTaken');i++)run(`update(1/${fps})`);
  assert(run('waterPortalKeyTaken'),'sealed cabin still permits reaching its key');
  for(let i=0;i<fps*2;i++){
    run("keys.clear();{const target=WATER_SHIP_HATCHES[1].x+WATER_SHIP_HATCHES[1].w/2-21,error=target-player.x-player.vx*.16;if(error>2)keys.add('ArrowRight');else if(error<-2)keys.add('ArrowLeft');}");run(`update(1/${fps})`);
  }
  run("keys.clear();keys.add('ArrowDown')");tick(1.4);
  assert(run('player.y>1048&&waterPortalKeyTaken&&lives===3'),'leave via second hatch carrying the key');
}
console.log('PASS ship: both cabin side walls, all four entry/exit hatches, head-above-water air, roof/floor/keel blocking, real bow entrance and key visit through separate hatches at 30/60/120 FPS.');
