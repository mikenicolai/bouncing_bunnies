const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false)");
const enter=()=>run("player.x=EARTH_ARENA.left+30;player.y=EARTH_ARENA.floor-58;player.vx=0;player.vy=0;player.onGround=true;update(1/60)");
const tick=(fps,n)=>{for(let i=0;i<n;i++)run(`update(1/${fps})`);};
const attackBoss=()=>run("{const box=earthBossBox();player.x=box.x-player.w-20;player.y=EARTH_ARENA.floor-player.h;player.facing=1;player.vx=0;player.vy=0;player.onGround=true;player.attackCooldown=0;attack();}");
const safe=()=>run("player.x=EARTH_ARENA.left+30;player.y=EARTH_ARENA.floor-58;player.vx=0;player.vy=0;player.onGround=true;player.invincible=100");
reset();assert.equal(run('WORLD_W'),8100);assert.equal(run('EARTH_GATE_X'),8000);
assert.equal(run('earthGround.at(-1).x+earthGround.at(-1).w'),run('WORLD_W'));
assert.equal(run('earthBoss.hp'),5);assert(!run('earthBoss.active'));
enter();assert(run('earthBoss.active'));assert.equal(run('checkpoint.x'),7030);
// A live boss seals the gate, including a bunny trying to skip the arena.
run("player.x=EARTH_GATE_X;player.y=EARTH_ARENA.floor-58;player.onGround=true;update(1/60)");
assert.equal(run('state'),'playing');assert.equal(run('player.x'),run('EARTH_GATE_X-62'));
for(const fps of [30,60,120]){
 // The existing last branch leads naturally down onto the enlarged plateau.
 reset();run("player.x=earthPlatforms.at(-1).x+earthPlatforms.at(-1).w-65;player.y=earthPlatforms.at(-1).y-58;player.onGround=true;player.invincible=10;keys.add('ArrowRight')");
 tick(fps,fps*2);assert(run('earthBoss.active'));assert.equal(run('player.y+player.h'),run('EARTH_ARENA.floor'));assert(run('player.x>EARTH_ARENA.left'));
 reset();enter();
 for(let hit=0;hit<5;hit++){
  run('earthBoss.dizzy=0');attackBoss();assert.equal(run('earthBoss.hp'),4-hit);
  if(hit<4){attackBoss();assert.equal(run('earthBoss.hp'),4-hit,'one hit per hurt window');}
 }
 assert.equal(run('earthBoss.stage'),'shatter');assert.equal(run('earthBossRocks.length'),0);
 assert(!run('hitEarthBoss()'),'transformation is invulnerable');
 safe();tick(fps,Math.ceil(2.5*fps));assert.equal(run('earthBoss.stage'),'rebuild');
 tick(fps,Math.ceil(5.7*fps));assert.equal(run('earthBoss.stage'),'giant');assert.equal(run('earthBoss.hp'),5);
 // The second form takes exactly five real punches, then opens the gate.
 for(let hit=0;hit<5;hit++){run('earthBoss.dizzy=0');attackBoss();assert.equal(run('earthBoss.hp'),4-hit);}
 assert.equal(run('earthBoss.stage'),'defeat');safe();tick(fps,Math.ceil(1.6*fps));assert.equal(run('earthBoss.stage'),'done');
 assert.equal(run('earthBossRocks.length+earthBossWaves.length+earthBossMountains.length'),0);
 run("player.x=EARTH_GATE_X-15;player.y=EARTH_ARENA.floor-58;player.onGround=true;player.vy=0");tick(fps,2);
 assert.equal(run('state'),'map');assert(run('earthFinished'));
 // A physical stomp defeats a rookie heart and bounces the bunny.
 reset();enter();run("{const box=earthBossBox();player.x=box.x+10;player.y=box.y-player.h+3;player.previousFeet=box.y;player.vy=200;updateEarthBoss(0);}");
 assert.equal(run('earthBoss.hp'),4);assert.equal(run('player.vy'),-460);
 // Warning is harmless; mountain growth damages only its visible footprint.
 reset();enter();run("earthBoss.stage='giant';earthBoss.phase='mountain';earthBoss.phaseAge=0;earthBoss.retreatFrom=earthBoss.x;earthBoss.retreatTo=earthBoss.x+210;earthBossMountains=[{x:earthBoss.x,age:.3}];player.x=earthBoss.x-21;player.y=EARTH_ARENA.floor-58;player.invincible=0;earthBoss.dizzy=10");
 run(`updateEarthBossHazards(1/${fps})`);assert.equal(run('lives'),3);
 run('earthBossMountains[0].age=2.6');run(`updateEarthBossHazards(1/${fps})`);assert.equal(run('lives'),2);
 run(`updateEarthBossHazards(1/${fps})`);assert.equal(run('lives'),2,'normal immunity prevents repeated mountain hits');
 reset();enter();run("earthBossMountains=[{x:7460,age:2.6}];player.x=7700;player.y=EARTH_ARENA.floor-58;updateEarthBossHazards(0)");assert.equal(run('lives'),3,'running beyond the patch avoids the peak');
 run('earthBossMountains[0].age=4.91');assert.equal(run('earthMountainBoxes(earthBossMountains[0]).length'),0);
 run('updateEarthBossHazards(.3)');assert.equal(run('earthBossMountains.length'),0);
 // Ground waves hurt standing/ducking; jumping clears them at all rates.
 for(const airborne of [false,true]){
  reset();enter();run(`earthBossWaves=[{x:7200,vx:310,age:0}];player.x=7200;player.y=EARTH_ARENA.floor-player.h-${airborne?65:0};player.invincible=0;updateEarthBossHazards(1/${fps})`);
  assert.equal(run('lives'),airborne?3:2);
 }
 // Rock collision uses a swept segment, so faster frames cannot tunnel.
 reset();enter();run(`player.x=7200;player.y=EARTH_ARENA.floor-58;earthBossRocks=[{x:7160,y:EARTH_ARENA.floor-30,vx:6000,vy:0,r:20,age:0,spin:0}];updateEarthBossHazards(1/${fps})`);assert.equal(run('lives'),2);
}
// Play without bypassing the actual hurt/cooldown timers or player immunity.
reset();enter();run('lives=3');
for(const stage of ['small','giant']){
 for(let hit=0;hit<5;hit++){
  attackBoss();assert.equal(run('earthBoss.hp'),4-hit);safe();run('player.invincible=0');tick(60,66);
  assert(run('lives')>0,'five hits per form must be achievable within the normal three-life run');
 }
 if(stage==='small'){safe();tick(60,8*60);assert.equal(run('earthBoss.stage'),'giant');}
}
reset();assert.equal(run('earthBoss.stage'),'small');assert.equal(run('earthBoss.hp'),5);assert(!run('earthBoss.active'));
run("earthBoss.stage='giant';earthBoss.hp=5;earthBoss.x=7460;cameraX=earthBoss.x-W*.6;cameraY=EARTH_ARENA.floor-336-24-50;var oldHeartRenderer=woodBossRenderer.hearts;var renderedBossHearts=null;woodBossRenderer.hearts=(ctx,x,y,count)=>renderedBossHearts={x,y,count};drawEarthBossHearts();woodBossRenderer.hearts=oldHeartRenderer;");
assert.equal(run('renderedBossHearts.count'),5);
assert(run('renderedBossHearts.x-45>W/2+105'),'hearts must move clear of the hero HUD when the camera raises them');
const html=fs.readFileSync('index.html','utf8');
for(const [name,file] of [['ANIMATION','wood-boss-animation-v1.js'],['ENCOUNTER','wood-boss-encounter-v1.js']]){
 const source=html.split(`// WILDWOOD_${name}_BEGIN\n`)[1].split(`\n// WILDWOOD_${name}_END`)[0];
 assert.equal(source,fs.readFileSync('assets/'+file,'utf8'),'embedded runtime must match reusable source');
}
assert.equal(run('BUILD_INFO.version'),'0.16.1');
console.log('PASS Wildwood bosses: five hearts each, punch/stomp and immunity, shatter/rebuild, sealed exit, complete fight with real cooldowns, rock sweep, jumpable earthquakes, warned/retracting mountains, clean restart at 30/60/120 FPS.');
