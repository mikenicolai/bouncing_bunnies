const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("keys.clear();joystick.active=false;joystick.dx=joystick.dy=0;meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();soundOn=false;player.onGround=true;player.y=FINAL_FLOOR-58;finalGateLift=1");
for(const fps of [30,60,120]){
 const tick=(seconds)=>{for(let i=0;i<Math.round(seconds*fps);i++)run(`update(1/${fps})`);};
 // A falling head contact must preserve Fire's damaging lava-zombie rule.
 reset();run("{const m=finalMonsters.find(m=>m.kind==='lava');player.x=m.x+5;player.y=m.y-player.h+3;player.previousFeet=m.y-1;player.vy=220;player.onGround=false;updateFinalMonsters(0)}");
 assert.equal(run('lives'),2);assert.equal(run("finalMonsters.find(m=>m.kind==='lava').hp"),2);assert.equal(run('player.vy'),-260);
 // Ground jumps cannot be refreshed by keyboard, touch or a guardian bounce.
 reset();run('jump()');const vy=run('player.vy');run('jump();jump();jump()');assert.equal(run('player.vy'),vy);assert.equal(run('player.boosts'),0);
 run("window.listeners.keydown[1]({code:'Space',repeat:false,preventDefault(){}})");assert.equal(run('player.vy'),vy);
 run("fitTouchControls();document.querySelector('#game').listeners.pointerdown[0]({clientX:ACTIONS.jump.x,clientY:ACTIONS.jump.y,pointerId:81,preventDefault(){}})");assert.equal(run('player.vy'),vy);
 reset();run("{const m=finalMonsters.find(m=>m.kind==='air');player.x=m.x+5;player.y=m.y-player.h+3;player.previousFeet=m.y-1;player.vy=220;player.onGround=false;updateFinalMonsters(0)}");
 assert.equal(run("finalMonsters.find(m=>m.kind==='air').hp"),2);assert.equal(run('player.vy'),-460);run('jump();jump();jump()');assert.equal(run('player.vy'),-460);
 reset();run('jump()');tick(1);assert(run('player.onGround'));run('jump()');assert.equal(run('player.vy'),-570,'landing restores the next normal jump');
 // The bow is restored from Fire completion after visiting another world/reloading.
 run("level='meadow';resetGame();level='final';start()");assert(run('fireArrow.owned&&!fireArrow.aiming'));assert.equal(run('fireArrow.ammo.filter(Boolean).length'),5);
 // Entering directly from Fire retains spent slots, variants and partial recharge.
 run("level='fire';resetGame();fireArrow.owned=true;fireArrow.ammo=['normal',null,'fire','rainbow',null];fireArrow.recharge=1.25;fireFinished=true;level='final';start()");
 assert.equal(run('JSON.stringify(fireArrow.ammo)'),JSON.stringify(['normal',null,'fire','rainbow',null]));assert.equal(run('fireArrow.recharge'),1.25);
 run("player.onGround=true;player.y=FINAL_FLOOR-58;player.x=100;finalMonsters=[]");tick(1.75);assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);
 // All five castle enemy types receive the real arrow's one/two/three-heart damage.
 for(const kind of ['zombie','goblin','pirate','air','lava'])for(const [type,damage] of [['normal',1],['fire',2],['rainbow',3]]){
  reset();run(`{const m=finalMonsters.find(m=>m.kind==='${kind}');finalMonsters=[m];m.x=5300;m.min=m.max=m.x;m.swingCooldown=99;player.x=m.x-190;player.facing=1;fireArrow.ammo.fill('${type}');toggleFireAim();attack()}`);
  const hp=run('finalMonsters[0].hp');tick(.4);
  assert.equal(run('finalMonsters[0].hp'),Math.max(0,hp-damage),`${kind}: ${type} arrow at ${fps} FPS`);
  assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);assert.equal(run('bunnyArrows.length'),0);
 }
 // Castle masonry/gate wins the nearest collision, including a swept long step.
 reset();run("finalMonsters=[];player.x=3900;player.facing=1;fireArrow.ammo.fill('normal');toggleFireAim();fireArrow.angle=0;attack();updateFireArchery(.5)");assert.equal(run('bunnyArrows.length'),0,'low castle rubble blocks arrows');
 reset();run("finalMonsters=[];finalGateLift=0;player.x=FINAL_GATE.x-130;player.facing=1;toggleFireAim();attack();updateFireArchery(.5)");assert.equal(run('bunnyArrows.length'),0,'closed elemental gate blocks arrows');
 // Aiming uses up/down without crouching or jumping; stowing restores both actions.
 reset();run("toggleFireAim();keys.add('ArrowUp');jump()");tick(.25);assert(run('player.onGround'));assert(run('fireArrow.angle>.3'));
 run("keys.clear();keys.add('ArrowDown')");tick(.25);assert.equal(run('player.h'),58);assert(!run('player.duck'));
 run("keys.clear();toggleFireAim();jump()");assert(run('player.vy<0'));
 // Pausing freezes recharge/projectiles; losing a heart keeps gear and clears old shots.
 reset();run("toggleFireAim();attack();state='map'");const frozen=run('JSON.stringify({ammo:fireArrow.ammo,recharge:fireArrow.recharge,shots:bunnyArrows})');tick(2);assert.equal(run('JSON.stringify({ammo:fireArrow.ammo,recharge:fireArrow.recharge,shots:bunnyArrows})'),frozen);
 run("state='playing';player.y=800;checkpoint={x:100,y:FINAL_FLOOR-58}");tick(1/fps);assert(run('fireArrow.owned'));assert.equal(run('bunnyArrows.length'),0);assert.equal(run('lives'),2);
}
run("level='air';resetGame();player.onGround=true;jump();jump();jump();jump()");assert.equal(run('player.boosts'),2,'Air retains its two limited extra taps');
console.log('PASS castle combat: damaging lava heads; single ground/bounce jumps; bow restoration and carried ammunition; real typed arrows against all five monster kinds, terrain/gate collisions, aiming/stowing, recharge, pause and respawn at 30/60/120 FPS.');
