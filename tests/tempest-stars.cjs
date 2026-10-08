const assert=require('node:assert/strict');
const {run,reset}=require('./air.cjs');
for(const width of [480,960])for(const fps of [30,60,120]){
  run(`W=${width};H=${width===480?960:540}`);
  const tick=(seconds,fn='update')=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`${fn}(1/${fps})`);};
  // Real detour: turn back from the summit, drop to the nook, walk to the stars.
  reset();run("player.x=4690;player.y=-1748;player.onGround=true;player.airCloud=airPlatforms[19];checkpoint={x:4685,y:-1748};keys.add('ArrowLeft')");
  let landed=false;
  for(let i=0;i<fps*4;i++){
    if(run('player.y+player.h>-1655'))run("keys.clear();if(player.x<4610)keys.add('ArrowRight')");
    run(`update(1/${fps})`);
    if(run('player.onGround&&player.airCloud===windStarLedge')){landed=true;break;}
  }
  assert(landed,`nook reachable at ${fps}`);assert.equal(run('lives'),3);
  run("keys.clear();keys.add('ArrowRight')");
  for(let i=0;i<fps*3&&!run('windStars.owned');i++)run(`update(1/${fps})`);
  assert(run('windStars.owned&&windStars.equipped'));assert.equal(run("windStars.slots.filter(s=>s.state==='ready').length"),8);
  assert.equal(run('checkpoint.y'),-1748,'hidden nook preserves the summit checkpoint');
  // Walk back out from below the overhanging cloud; jump onto the blue cloud.
  run("keys.clear();keys.add('ArrowLeft')");
  for(let i=0;i<fps*2&&run('player.x>4610');i++)run(`update(1/${fps})`);
  run('jump()');
  let onBlue=false;
  for(let i=0;i<fps*2;i++){
    if(run('player.x<4570'))run('keys.clear()');
    run(`update(1/${fps})`);
    if(run('player.blueContact?.platform===airPlatforms[18]')){onBlue=true;break;}
  }
  assert(onBlue,`return to approach cloud at ${fps}`);
  run("keys.clear();keys.add('ArrowRight');jump()");
  let returned=false;
  for(let i=0;i<fps*3;i++){
    if(i===Math.round(fps/12)||i===Math.round(fps/6))run('jump()');
    run(`update(1/${fps})`);
    if(run('player.onGround&&player.airCloud===airPlatforms[19]')){returned=true;break;}
  }
  assert(returned,`return to summit at ${fps}`);assert.equal(run('lives'),3);
  // Horizontal throws, actual swept projectile collisions and the full five-hit fight.
  reset();run('windStars.owned=true;windStars.equipped=true;bossAwake=true;player.invincible=1000;player.x=4950;player.y=-1748;player.facing=1');
  const expected=[7,7,4,1,0];
  for(let hit=0;hit<5;hit++){
    run('player.attackCooldown=0;attack()');tick(2,'updateAir');
    assert.equal(run('tempest.hp'),expected[hit],`star ${hit+1} at ${fps}`);
    assert.equal(run('tempest.lodged'),hit+1);assert.equal(run("windStars.slots.filter(s=>s.state==='lodged').length"),hit+1);
    if(hit===1)assert(run('tempest.enraged&&tempest.regenerated'));
  }
  assert.equal(run("windStars.slots.filter(s=>s.state==='ready').length"),3,'five accurate hits leave three spare stars');
  assert.equal(run('tempestWinds.length'),0);assert.equal(run('airMonsters.length'),2,'boss fight preserves only the two earlier guardians');
  run('player.x=5950;player.y=-1748;updateDescent()');assert(run('descentStarted'),'victory opens downdraft');
  reset();run('windStars.owned=true;windStars.equipped=true;player.x=4950;player.y=-1748');
  for(let i=0;i<8;i++){run('player.attackCooldown=0');assert(run('throwWindStar()'));}
  run('player.attackCooldown=0');assert(!run('throwWindStar()'),'eight-star inventory cannot fire a ninth');
  assert.equal(run("windStars.slots.filter(s=>s.state==='flying').length"),8);
  // A miss settles on a solid cloud and can be physically collected and thrown again.
  reset();run('windStars.owned=true;windStars.equipped=true;player.x=4860;player.y=-1748;player.facing=1;attack()');tick(1.1,'updateWindStars');
  assert.equal(run('windStars.slots[0].state'),'dropped');
  run('player.x=windStars.slots[0].x-21;player.y=windStars.slots[0].y-29;updateWindStars(0)');
  assert.equal(run('windStars.slots[0].state'),'ready');
  // A star hitting the recharge shield is recoverable, never spent or lodged.
  run("bossAwake=true;tempest.regen=.7;tempest.regenerated=true;tempest.hp=5;player.x=tempest.x-150;player.y=-1748;player.facing=1;player.attackCooldown=0;attack()");tick(.4,'updateWindStars');
  assert.equal(run('windStars.slots[0].state'),'dropped');assert.equal(run('tempest.lodged'),0);assert.equal(run('tempest.hp'),5);
  // Gusts use their drawn vertical lanes: standing hurts, ducking and jumping clear.
  for(const mode of ['stand','duck','jump']){
    reset();run(`bossAwake=true;tempest.enraged=true;player.x=5000;player.y=${mode==='jump'?-1870:-1748};player.vy=0;player.onGround=${mode==='jump'?'false':'true'};`);
    if(mode==='duck')run("keys.add('ArrowDown');updateDuck()");
    run("tempestWinds=[{x:5100,y:-1741,w:35,h:18,vx:-330,age:0},{x:5100,y:-1787,w:35,h:18,vx:-330,age:0}]");tick(.5,'updateTempestWinds');
    assert.equal(run('lives'),mode==='stand'?2:3,`${mode} gust avoidance at ${fps}`);
  }
  // The real boosted jump clears both lanes while they move through the arena.
  reset();run("bossAwake=true;tempest.shotCooldown=Infinity;player.x=5000;player.y=-1748;player.onGround=true;player.airCloud=airPlatforms[19];tempestWinds=[{x:5230,y:-1741,w:35,h:18,vx:-330,age:0},{x:5230,y:-1787,w:35,h:18,vx:-330,age:0}];jump()");
  for(let i=0;i<fps;i++){
    if(i===Math.round(fps/12)||i===Math.round(fps/6))run('jump()');
    run(`update(1/${fps})`);
  }
  assert.equal(run('lives'),3,`real jump clears paired gusts at ${width}/${fps}`);
  reset();run('bossAwake=true;tempest.shotCooldown=0;updateTempest(0)');assert.equal(run('tempestWinds.length'),1);
  run('tempest.enraged=true;tempest.shotCooldown=0;updateTempest(0)');assert.equal(run('tempestWinds.length'),3);
  // A prolonged stronger phase must never add creatures to the summit arena.
  run('player.x=4950;player.y=-1748;player.invincible=1000');
  tick(60,'updateAir');
  assert.equal(run('airMonsters.length'),2,'only the original approach guardians remain');
  assert(run('airMonsters.every(m=>m.platform===airPlatforms[6]||m.platform===airPlatforms[10])'),'no creatures spawn on the boss cloud');
  assert(run('tempestWinds.length>0'),'Tempest still fires gusts throughout the solo fight');
  // No second heal, even after returning to five hearts in the stronger phase.
  run("tempest.hp=5;tempest.regenerated=true;tempest.regen=0;tempest.dizzy=0;hitTempest('star')");assert.equal(run('tempest.hp'),2);assert.equal(run('tempest.regen'),0);
  reset();run('player.x=5960;player.y=-1748;updateDescent()');assert(!run('descentStarted'));assert.equal(run('player.x'),5910,'cannot bypass a living boss');
  run('windStars.owned=true;windStars.equipped=true;toggleWindStars()');assert(!run('windStars.equipped'));
  run('player.onGround=true;jump()');assert(run('player.vy<0'),'stowed stars preserve jumping');
  reset();assert.equal(run('windStars.owned'),false);assert.equal(run('tempest.hp'),10);assert.equal(run('tempest.regenerated'),false);
}
console.log('PASS Tempest: reachable detour and return, five actual star hits, one recovery at five to seven, faster paired gusts, duck/jump avoidance, solo boss arena, miss/shield recovery, stow/jump, reset and victory gate at 30/60/120 FPS.');
