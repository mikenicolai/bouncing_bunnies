const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';waterFinished=false;resetGame();soundOn=false;player.inWater=true;waterSharks=[];waterPirates=[]");
const tick=(fps,seconds)=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`update(1/${fps})`);};
const armed=()=>run("waterGate.phase='open';waterTrident.owned=true;player.x=11500;player.y=1150;player.vx=0;player.vy=0;player.air=15");
assert.equal(run('waterAirPockets.length'),7,'two air pockets removed');
assert.equal(run('WATER_GATE.x'),10560,'old approach shortened by 600');
const html=fs.readFileSync('index.html','utf8'),sourceModule=fs.readFileSync('assets/water-ruins-v1.js','utf8');
assert.equal(html.split('// WATER_RUINS_BEGIN\n')[1].split('\n// WATER_RUINS_END')[0],sourceModule,'maintained source matches the embedded game');
for(const fps of [30,60,120]){
 reset();assert(!run('waterTrident.owned||waterAquaSuit||neptunus.active'));
 // Gate passage no longer completes the world, and both relics need a visit.
 run("waterGate.phase='open';player.x=10920;player.y=1081;keys.add('ArrowRight')");tick(fps,.8);
 assert(run('waterTrident.owned&&!waterFinished'),'nearby swimming picks up the trident beyond the gate');
 assert(run('player.air>14.5'),'pickup grants one breath to try the weapon');
 run("keys.clear();player.x=12130;player.y=1351;player.vx=0;keys.add('ArrowRight')");tick(fps,.8);
 assert(run('waterAquaSuit'));assert.equal(run('player.air'),15);
 run("keys.clear();player.x=12500;player.y=1350;player.air=.01;player.vx=0;player.vy=0");tick(fps,60);
 assert.equal(run('lives'),3,'aqua suit removes the underwater breath limit');
 assert.equal(run('player.air'),15);assert(run('checkpoint.suit'),'suit breathing preserves the ruins checkpoint');
 // Throw sends the weapon forward while ordinary swimming remains independent.
 reset();armed();run('player.facing=1;attack()');const before=run('player.x');tick(fps,.35);
 assert(run('waterTrident.shot.x>player.x+150'));assert(Math.abs(run('player.x')-before)<1,'throw does not carry the bunny');
 tick(fps,2);assert.equal(run('waterTrident.shot'),null,'one reusable trident returns after a miss');
 // Dash travels in the aimed direction, including diagonal/vertical touch input.
 reset();armed();run("waterTrident.mode='dash';joystick.active=true;joystick.dx=.8;joystick.dy=-.6;attack();joystick.dx=0;joystick.dy=0");
 const origin=run('({x:player.x,y:player.y})');tick(fps,.4);
 assert(run('player.x')>origin.x+200&&run('player.y')<origin.y-150,'the bunny rides the thrown trident');
 assert(run('waterTrident.dash>0'));tick(fps,2);assert.equal(run('waterTrident.dash'),0);assert.equal(run('waterTrident.shot'),null);
 // Fast dashes cannot tunnel through the locked gate, ship timber, reefs or roof.
 for(const fixture of [
  "waterGate.phase='locked';player.x=WATER_GATE.x-player.w-12;player.y=1050;player.facing=1",
  "player.x=5480;player.y=1090;keys.add('ArrowUp')",
  "player.x=waterReefs[2].x-player.w-12;player.y=1100;player.facing=1",
  "player.x=11500;player.y=waterSwimTopY(11521)+15;keys.add('ArrowUp')"
 ]){
  reset();armed();run(fixture+";waterTrident.mode='dash';attack()");tick(fps,.6);
  assert(run('waterPositionClear(player,[...waterReefs,...waterShipSolids(),...waterGateSolid(),...waterAdventureSolids()])'),'dash stops outside solid terrain');
  assert.equal(run('waterTrident.dash'),0);
 }
 // Drowning cancels flight and returns to the trident checkpoint, retaining gear.
 reset();armed();run("checkpoint={x:11109,y:1081,water:true,trident:true};waterTrident.mode='dash';attack();player.air=.001");tick(fps,1/fps);
 assert.equal(run('lives'),2);assert(run('waterTrident.owned&&waterTrident.shot===null&&waterTrident.dash===0'));
 assert.equal(run('player.x'),11109);
 // The boss arena activates after acquiring both items and seals its exit.
 reset();armed();run("waterAquaSuit=true;player.x=12720;player.y=1150");tick(fps,1/fps);
 assert(run('neptunus.active&&neptunus.hp===NEPTUNUS_HP'));
 run("player.x=WATER_ARENA.right-player.w-5;player.y=1100;keys.add('ArrowRight')");tick(fps,1);
 assert(run('player.x+player.w<=WATER_ARENA.right&&!waterFinished'),'exit stays sealed while the sea king lives');
 // Warnings give time to move; each attack hurts only through visible geometry.
 reset();armed();run("waterAquaSuit=true;neptunus.active=true;neptunus.turn=0;player.x=13400;player.y=1300;neptunus.cooldown=0;updateNeptunus(0)");
 assert.equal(run('neptunus.mode'),'tideWarn');const target=run('neptunus.targetX');
 run('player.x+=250');tick(fps,1);assert(run('neptunusShots.length>0'));assert.equal(run('neptunusShots[1].x'),target,'rising tide targets the warned location');
 reset();armed();run("waterAquaSuit=true;neptunus.active=true;neptunus.mode='thrust';neptunus.age=.1;player.x=neptunus.x-150;player.y=neptunus.y+85;updateNeptunus(0)");
 assert.equal(run('lives'),2,'large trident lunge hits beyond the body');run('updateNeptunus(0)');assert.equal(run('lives'),2,'immunity prevents repeated heart loss');
 reset();armed();run("waterAquaSuit=true;neptunus.active=true;neptunus.turn=2;neptunus.cooldown=0;updateNeptunus(0)");
 assert.equal(run('neptunus.mode'),'volleyWarn');run('updateNeptunus(1.05)');assert.equal(run('neptunusShots.length'),3);
 // A carried dash lands one heart of damage and ends before unsafe body contact.
 reset();armed();run("waterAquaSuit=true;neptunus.active=true;neptunus.cooldown=999;player.x=neptunus.x-230;player.y=neptunus.y+80;player.facing=1;waterTrident.mode='dash';attack()");tick(fps,.5);
 assert.equal(run('neptunus.hp'),run('NEPTUNUS_HP')-1);assert.equal(run('lives'),3);assert.equal(run('waterTrident.dash'),0);
 // Eight genuine projectile hits defeat Neptunus; repeated contact per throw cannot multiply damage.
 reset();armed();run("waterAquaSuit=true;neptunus.active=true;player.invincible=999;neptunus.cooldown=999");
 for(let hp=run('NEPTUNUS_HP');hp>0;hp--){
  run("keys.clear();waterTrident.shot=null;waterTrident.cooldown=0;neptunus.dizzy=0;neptunus.mode='idle';neptunus.cooldown=999;player.x=neptunus.x-160;player.y=neptunus.y+neptunus.h/2-29;player.vx=0;player.vy=0;player.facing=1;attack()");
  tick(fps,.55);assert.equal(run('neptunus.hp'),hp-1);
 }
 assert.equal(run('neptunusShots.length'),0,'defeat clears water attacks');tick(fps,2);
 run("player.x=WATER_ARENA.exit-50;player.y=1260;player.vx=0;keys.add('ArrowRight')");tick(fps,.8);
 assert(run('waterFinished'),'the final exit awards Water after Neptunus falls');
 // Fight with live AI, normal oxygen/lives/cooldowns and ordinary directional controls.
 // Keep range, leave tide/thrust warnings and swim above the aimed volley.
 reset();armed();run("waterAquaSuit=true;player.x=13440;player.y=850;neptunus.active=true");
 const victory=run(`(()=>{
  for(let i=0;i<${fps}*80&&state==='playing'&&neptunus.hp>0;i++){
   const b=neptunus;keys.clear();joystick.active=false;joystick.dx=0;joystick.dy=0;
   const gap=b.x-player.x;
   if(b.mode==='thrustWarn'||b.mode==='tideWarn')keys.add('ArrowLeft');
   else if(gap>430)keys.add('ArrowRight');else if(gap<290)keys.add('ArrowLeft');
   if(b.mode==='volleyWarn'||neptunusShots.some(s=>s.kind==='orb'&&s.life>3))keys.add('ArrowUp');
   else if(player.y<820)keys.add('ArrowDown');else if(player.y>880)keys.add('ArrowUp');
   if(!waterTrident.shot&&waterTrident.cooldown<=0){
    const dx=b.x+b.w/2-(player.x+21),dy=b.y+b.h/2-(player.y+29),d=Math.hypot(dx,dy);
    joystick.active=true;joystick.dx=dx/d;joystick.dy=dy/d;attack();joystick.active=false;joystick.dx=0;joystick.dy=0;
   }
   update(1/${fps});
  }
  return state==='playing'&&neptunus.hp===0&&lives>0;
 })()`);
 assert(victory,'the live encounter is winnable with normal movement and reusable throws');
 reset();assert(!run('waterTrident.owned||waterAquaSuit||neptunus.active'));assert.equal(run('neptunus.hp'),run('NEPTUNUS_HP'));
}
// Pause freezes oxygen, the projectile and boss; Z and touch share the mode switch.
reset();armed();run("attack();state='map'");const frozen=run('JSON.stringify({t:waterTrident,b:neptunus,air:player.air})');tick(60,3);
assert.equal(run('JSON.stringify({t:waterTrident,b:neptunus,air:player.air})'),frozen);
run("state='playing';window.listeners.keydown[1]({code:'KeyZ',repeat:false,preventDefault(){}})");assert.equal(run('waterTrident.mode'),'dash');
run("fitTouchControls();document.querySelector('#game').listeners.pointerdown[0]({clientX:ACTIONS.ability2.x,clientY:ACTIONS.ability2.y,pointerId:52,preventDefault(){}})");assert.equal(run('waterTrident.mode'),'throw');
console.log('PASS water ruins: relic pickups, unlimited suit breathing, aim/throw/dash/return, swept obstacle collisions, checkpoint/pause/reset, mode controls, three telegraphed attacks, eight-hit Neptunus defeat and final exit at 30/60/120 FPS.');
