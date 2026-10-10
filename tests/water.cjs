const assert=require('node:assert/strict');
const fs=require('node:fs');
const {run}=require('./air.cjs');
const step=(n=1)=>{for(let i=0;i<n;i++)run('update(1/60)');};
const reset=()=>run("level='water';resetGame();soundOn=false");

reset();
assert.equal(run('WORLD_W'),14900);
assert.equal(run('waterSharks.length'),6);
assert.equal(run('waterPirates.length'),3);
assert(run('waterSharks.every(s=>s.hp===2)'));
assert.equal(run('WATER_AIR'),15);
assert(run("worldDetails.water[2]==='Play Water level'"));
assert.equal(run('SWIM_FRAMES.length'),8);
const html=fs.readFileSync('index.html','utf8');
const embedded=html.match(/swimSheet\.src='data:image\/png;base64,([^']+)'/)[1];
assert(Buffer.from(embedded,'base64').equals(fs.readFileSync('assets/pink-ear-bunny-swim-v1.png')));
const sharkEmbedded=html.match(/sharkSheet\.src='data:image\/png;base64,([^']+)'/)[1];
assert(Buffer.from(sharkEmbedded,'base64').equals(fs.readFileSync('assets/shark-swim-v1.png')));
const pirateEmbedded=html.match(/pirateSheet\.src='data:image\/png;base64,([^']+)'/)[1];
assert(Buffer.from(pirateEmbedded,'base64').equals(fs.readFileSync('assets/pirate-skeleton-v1.png')));
assert.equal(run('SHARK_FRAMES.length'),8);
assert.equal(run('sharkFrame({phase:0})'),0);
assert.equal(run('sharkFrame({phase:7.5})'),5,'open-mouth row plays during patrol');
assert.equal(run('sharkFrame({phase:10.9})'),2,'mouth closes again');
run('player.vx=100;player.swimClock=.4');assert.equal(run('swimFrame()'),3);
run("keys.add('ArrowDown')");assert.equal(run('swimFrame()'),4);run("keys.clear()");
run('player.attack=.15');assert.equal(run('swimFrame()'),6);
run('player.attack=.04');assert.equal(run('swimFrame()'),7);

// Walking down the real shoreline enters swimming without sticking at the tide.
for(const fps of [30,60,120]){
  reset();run("player.x=1390;player.y=292;player.onGround=true;player.invincible=30;keys.add('ArrowRight')");
  for(let i=0;i<fps*3;i++)run(`update(1/${fps})`);
  assert(run('player.inWater && player.x>1850'),`the shallow shore flows into swimming at ${fps} FPS`);
}
run('keys.clear()');reset();
// A dry jump leads into water and changes movement mode.
run("player.x=1750;player.y=365;player.vy=100;player.onGround=false");step(10);
assert(run('player.inWater'));
assert(run('player.x>=WATER_START'));
reset();run("player.x=1750;player.y=417;player.h=18;player.duck=true;player.vy=100;keys.add('ArrowDown')");step();
assert(run('player.inWater && !player.duck && player.h===58'),'water entry releases land crouch');run('keys.clear()');
run("player.invincible=30;player.x=2350;player.y=520;player.vx=0;player.vy=0;keys.add('ArrowDown')");step(60);run("keys.clear()");
assert(run('player.y>560'),'Dive moves downward');
const beforeStroke=run('player.vy');run('jump()');assert(run('player.vy')<beforeStroke);
assert(run('player.stroke>0'));
run("keys.add('ArrowUp')");step(120);run("keys.clear()");
assert(run('player.y<560'),'swim up moves upward');
run("player.y=600;player.vy=0;joystick.dy=.9");step(30);assert(run('player.y>600'),'touch joystick dives');
run("joystick.dy=0;duckPointer=17;player.vy=0");const diveY=run('player.y');step(20);assert(run('player.y')>diveY,'Dive button moves downward');run('duckPointer=null');

// A surface jump clears the water, refills air, and splashes back into swim mode.
reset();run('player.inWater=true;player.x=1850;player.y=WATER_SURFACE-42;player.air=2;player.invincible=3');
run('jump()');assert(run('player.breaching'));
step(22);assert(run('player.y+player.h<WATER_SURFACE-15'),'bunny rises fully above the water');
assert.equal(run('player.air'),15);
step(55);assert(!run('player.breaching'),'bunny splashes back into swimming');
assert(run('player.y+player.h>=WATER_SURFACE'),'splashdown crosses the surface');
reset();run('player.inWater=true;player.x=1850;player.y=WATER_SURFACE-42;jump();keys.add("ArrowDown")');step(7);
assert(!run('player.breaching'),'Dive cuts short an airborne leap');run('keys.clear()');

// The surface refills air; expiry costs one heart and uses a water checkpoint.
reset();run('player.inWater=true;player.x=1850;player.y=348;player.air=1');step();
assert.equal(run('player.air'),15);
run('player.y=850;player.vy=0;player.air=.01');step();
assert.equal(run('lives'),2);assert.equal(run('player.air'),15);
assert(run('player.y<=WATER_SURFACE-20'));

// The shallow-water shark stays above the sloping seabed throughout patrol.
reset();run('player.inWater=true;player.x=2634;player.y=waterAirPockets[0].surface-42;player.invincible=30');
for(let i=0;i<720;i++){step();assert(run('waterSharks.every(s=>s.y+s.h<=waterFloorY(s.x+s.w/2)-19)'));}
// Hits remove one of each enemy's two hearts and stun between attacks.
reset();run('player.inWater=true;player.x=waterSharks[0].x-39;player.y=waterSharks[0].y;player.facing=1;attack()');
assert.equal(run('waterSharks[0].hp'),1);
run('player.attackCooldown=0;attack()');assert.equal(run('waterSharks[0].hp'),1);
run('waterSharks[0].dizzy=0;player.attackCooldown=0;attack()');assert.equal(run('waterSharks[0].hp'),0);
reset();run('player.inWater=true;player.x=waterPirates[0].x-39;player.y=waterPirates[0].y;player.facing=1;attack()');
assert.equal(run('waterPirates[0].hp'),1);
assert(run('waterPirates.every(p=>p.y+p.h<waterFloorY(p.anchorX+24)-110)'),'pirates float above their ballast anchors');

// A nearby bunny triggers a hook-to-cutlass sequence while feet remain grounded.
reset();run('player.inWater=true;player.x=waterPirates[0].x+75;player.y=waterPirates[0].y-80;player.invincible=30;waterPirates[0].swingCooldown=0');step();
assert(run('waterPirates[0].swing>0'));
assert.equal(run('pirateFrame(waterPirates[0])'),4);
step(30);assert(run('pirateFrame(waterPirates[0])>=6'));
assert(run('Math.abs(waterPirates[0].x-waterPirates[0].anchorX-12)<=waterPirates[0].chainLength*.5'));
reset();run('player.inWater=true;player.x=1850;player.y=348;player.invincible=30');step(360);
assert(run('waterPirates.every(p=>Math.abs(Math.hypot(waterPirateAnkle(p).x-waterPirateAnchor(p).x,waterPirateAnkle(p).y-waterPirateAnchor(p).y)-p.chainLength)<.01)'),'floating pirates remain on their chain length');

// Both the left hook and right cutlass can hit beyond the pirate's body.
for(const [swing,side] of [[.65,-45],[.16,72]]){
  reset();run(`player.inWater=true;player.x=waterPirates[0].x+${side};player.y=waterPirates[0].y-30;player.air=15;waterPirates[0].swing=${swing};waterPirates[0].swingCooldown=10`);
  assert(run('!overlap(player,waterPirates[0])'));
  step();assert.equal(run('lives'),2,`weapon swing ${swing} catches bunny`);
}
reset();run('player.inWater=true;player.x=waterPirates[0].x-39;player.y=waterPirates[0].y;player.facing=1;waterPirates[0].swing=.4;attack()');
assert.equal(run('waterPirates[0].swing'),0,'a landed punch interrupts the swing');

// Cave pockets replenish air, but a stroke cannot leap through the rock roof.
reset();run('player.inWater=true;player.x=2634;player.y=waterAirPockets[0].surface-42;player.air=1');step();
assert.equal(run('player.air'),15);assert(run('checkpoint.water'));
run('jump()');assert(!run('player.breaching'));assert(run('player.stroke>0'));
run('player.x=2840;player.y=850;player.vy=0;player.air=.01');step();
assert.equal(run('lives'),2);assert(run('player.x>2500&&player.x<2780'));
assert(run('waterBreathing()'),'drowning returns to the last air pocket');
reset();run('player.inWater=true;player.x=2310;player.y=348;player.invincible=30;jump();keys.add("ArrowRight")');step(150);
assert(run('player.x+player.w/2<WATER_CAVE_START'),'surface leaps cannot bypass the cave entrance');
run('keys.clear()');
// The wreck deck is solid except for the real cabin hatches.
reset();run('player.inWater=true;player.invincible=30;player.x=5400;player.y=1080;keys.add("ArrowUp")');step(90);
assert(run('player.y>=1007'),'solid deck blocks upward swimming');
run('keys.clear();player.x=5544;player.y=1080;player.vx=0;player.vy=0;keys.add("ArrowUp")');step(90);
assert(run('waterAirPocket()?.ship'),'open hatch reaches cabin air');
run('keys.clear()');
reset();run('W=480;H=900;canvas.width=480;canvas.height=900;touchDockHeight=220;player.inWater=true;player.x=8700;player.y=1442;player.invincible=30');step(120);
assert(run('waterFloorY(player.x)-cameraY<playfieldHeight()'),'sea floor remains above portrait touch controls');
run('W=960;H=540;canvas.width=960;canvas.height=540;touchDockHeight=0');
// Render both the dry shoreline and the deep scene with a minimal Canvas spy.
run(`for(const method of ['save','restore','beginPath','closePath','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','arc','ellipse','rect','roundRect','fillRect','fill','stroke','clip','translate','scale','rotate','transform','fillText','strokeText','drawImage'])ctx[method]=()=>{};
ctx.createLinearGradient=()=>({addColorStop(){}});`);
reset();run('render(0)');run('player.inWater=true;player.x=3800;player.y=1000;cameraX=1800;cameraY=500;render(1)');
run('for(let i=0;i<8;i++)swimSprites.push({width:100,height:100});ctx.drawImage=()=>ctx.swimDraws=(ctx.swimDraws||0)+1;render(1)');
assert(run('ctx.swimDraws>0'),'painted swim frames render once loaded');
run('sharkSheet.complete=true;sharkSheet.naturalWidth=1774;ctx.drawImage=(source)=>{if(source===sharkSheet)ctx.sharkDraws=(ctx.sharkDraws||0)+1;};render(1)');
assert(run('ctx.sharkDraws===6'),'painted shark frames render for all patrols');
run('pirateSheet.complete=true;pirateSheet.naturalWidth=1536;ctx.drawImage=(source)=>{if(source===pirateSheet)ctx.pirateDraws=(ctx.pirateDraws||0)+1;};render(1)');
assert(run('ctx.pirateDraws===3'),'painted pirate frames render on the sea floor');
console.log('PASS: water entry, swim, surface leap and dive, oxygen recovery, two-heart enemies, cave breath checkpoints, solid wreck deck and open cabin hatches.');
