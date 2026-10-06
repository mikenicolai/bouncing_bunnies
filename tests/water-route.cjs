const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
// Swim the complete route with ordinary controls and oxygen, at three frame rates.
// Enemy damage is disabled here so this measures traversal and breath spacing.
for(const fps of [30,60,120]){
 run("level='water';waterFinished=false;resetGame();soundOn=false;waterSharks=[];waterPirates.forEach(p=>p.swingCooldown=999);player.invincible=999;player.inWater=true;player.x=1800;player.y=348;player.vx=0;player.vy=0");
 const airY=i=>run(`waterAirPockets[${i}].surface-WATER_FLOAT_HEAD`);
 const route=[[2320,740],[2634,740],[2634,airY(0)],[2634,875],[2920,875],[2920,930],[3604,930],[3604,airY(1)],[3604,1075],[4549,1075],[4549,airY(2)],[4549,1130],[5150,1130],[5150,1030],[5584,1030],[5584,916],[5584,1130],[6429,1130],[6429,946],[6429,1050],[7000,1050],[7529,1130],[7529,airY(5)],[7529,1320],[8529,1320],[8529,airY(6)],[8529,1280],[9519,1280],[9519,airY(7)],[9519,875],[10190,875],[10190,820],[10539,820],[10539,airY(8)],[10539,1110],[11300,1110]];
 for(const [x,y] of route){
  let reached=false;
  const wantsAir=run(`!!waterPocketAtX(${x}+player.w/2)&&${y}<=waterPocketAtX(${x}+player.w/2).surface-WATER_FLOAT_HEAD`);
  for(let f=0;f<fps*14;f++){
   const p=run('({x:player.x,y:player.y,vx:player.vx,vy:player.vy})');
   if(Math.abs(p.x-x)<9&&Math.abs(p.y-y)<9&&(!wantsAir||run('waterBreathing()'))){reached=true;break;}
   // Brake near each destination rather than teleporting or zeroing velocity.
   const dx=x-p.x-p.vx*.16,dy=y-p.y-p.vy*.16;
   run(`keys.clear();${Math.abs(dx)>4?`keys.add('${dx>0?'ArrowRight':'ArrowLeft'}');`:''}${wantsAir&&!run('waterBreathing()')?`keys.add('ArrowUp');`:Math.abs(dy)>4?`keys.add('${dy>0?'ArrowDown':'ArrowUp'}');`:''}update(1/${fps})`);
   assert.equal(run('lives'),3,`${fps} FPS: air expired en route to ${x},${y}`);
   if(run('waterFinished')){reached=true;break;}
  }
  assert(reached,`${fps} FPS: blocked en route to ${x},${y}; actual ${run('JSON.stringify({x:player.x,y:player.y,air:player.air})')}`);
 }
 assert(run('waterFinished'),`${fps} FPS: gate reached`);
 assert(run('coins.filter(c=>c.taken&&c.x>5200&&c.x<6900).length>=4'),'treasure is collected through the ship hold');
}
console.log('PASS: full 11,500-unit water route, reefs, both ship hatches, air pockets and tide gate at 30/60/120 FPS.');
