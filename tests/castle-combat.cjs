const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("keys.clear();joystick.active=false;joystick.dx=joystick.dy=0;meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();soundOn=false;player.onGround=true;player.y=FINAL_FLOOR-58;finalGateLift=1");
for(const fps of [30,60,120]){
 const tick=(seconds)=>{for(let i=0;i<Math.round(seconds*fps);i++)run(`update(1/${fps})`);};
 // A falling head contact must preserve Fire's damaging lava-zombie rule.
 reset();run("{const m=finalMonsters.find(m=>m.kind==='lava');player.x=m.x+5;player.y=m.y-player.h+3;player.previousFeet=m.y-1;player.vy=220;player.onGround=false;updateFinalMonsters(0)}");
 assert.equal(run('lives'),2);assert.equal(run("finalMonsters.find(m=>m.kind==='lava').hp"),2);assert.equal(run('player.vy'),-260);
 // A ground jump has exactly two quick extra taps, through each input path.
 const press=(repeat=false)=>run(`window.listeners.keydown[1]({code:'Space',repeat:${repeat},preventDefault(){}})`);
 const touch=()=>run("fitTouchControls();document.querySelector('#game').listeners.pointerdown[0]({clientX:ACTIONS.jump.x,clientY:ACTIONS.jump.y,pointerId:81,preventDefault(){}});document.querySelector('#game').listeners.pointerup[0]({pointerId:81})");
 const stick=()=>run('updateJoystick({x:JOY.x,y:JOY.y});updateJoystick({x:JOY.x,y:JOY.y-.6*(JOY.radius-12)})');
 for(const input of [()=>run('jump()'),()=>press(),touch,stick]){
  reset();input();assert.equal(run('player.vy'),-570);assert.equal(run('player.boosts'),0);
  tick(1/fps);input();assert.equal(run('player.boosts'),1);assert(run('player.vy<-570'));
  tick(1/fps);input();assert.equal(run('player.boosts'),2);assert.equal(run('player.vy'),-720);
  for(let i=0;i<12;i++)input();assert.equal(run('player.vy'),-720);assert.equal(run('player.boosts'),2,'extra inputs cannot exceed three jumps');
  run('clearInputs()');tick(1.8);assert(run('player.onGround'));input();assert.equal(run('player.vy'),-570);assert.equal(run('player.boosts'),0,'landing restores a fresh jump sequence');
 }
 reset();press();press(true);assert.equal(run('player.boosts'),0,'holding the key cannot consume the extra taps');
 reset();run('jump()');tick(.55);const late=run('player.vy');run('jump()');assert.equal(run('player.vy'),late,'late taps cannot restart the jump in midair');
 reset();run('player.onGround=false;player.jumpAge=9;player.vy=100;jump()');assert.equal(run('player.vy'),100,'walking off a ledge cannot start a midair jump');
 reset();run('jump();player.vy=200;jump()');assert.equal(run('player.boosts'),0,'falling too fast cannot be turned into flight');
 // A monster bounce cannot refill the boost budget or restart its timer.
 reset();run("{const m=finalMonsters.find(m=>m.kind==='air');player.x=m.x+5;player.y=m.y-player.h+3;player.previousFeet=m.y-1;player.vy=220;player.onGround=false;updateFinalMonsters(0)}");
 assert.equal(run("finalMonsters.find(m=>m.kind==='air').hp"),2);assert.equal(run('player.vy'),-460);run('jump();jump();jump()');assert.equal(run('player.vy'),-460);assert.equal(run('player.boosts'),2);
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
 // Aiming allows jumps and preserves angle controls, with crouching still stowed.
 reset();run("toggleFireAim();keys.add('ArrowUp');jump()");tick(.25);assert(!run('player.onGround'));assert(run('fireArrow.angle>.3'));run('clearInputs()');tick(1.2);assert(run('player.onGround'));
 run("keys.clear();keys.add('ArrowDown')");tick(.25);assert.equal(run('player.h'),58);assert(!run('player.duck'));
 run("keys.clear();toggleFireAim();jump()");assert(run('player.vy<0'));
 // Pausing freezes recharge/projectiles; losing a heart keeps gear and clears old shots.
 reset();run("toggleFireAim();attack();state='map'");const frozen=run('JSON.stringify({ammo:fireArrow.ammo,recharge:fireArrow.recharge,shots:bunnyArrows})');tick(2);assert.equal(run('JSON.stringify({ammo:fireArrow.ammo,recharge:fireArrow.recharge,shots:bunnyArrows})'),frozen);
 run("state='playing';player.y=800;checkpoint={x:100,y:FINAL_FLOOR-58}");tick(1/fps);assert(run('fireArrow.owned'));assert.equal(run('bunnyArrows.length'),0);assert.equal(run('lives'),2);
}
run("level='air';resetGame();player.onGround=true;jump();jump();jump();jump()");assert.equal(run('player.boosts'),2,'Air retains its two limited extra taps');
console.log('PASS castle combat: damaging lava heads; limited triple jumps across keyboard/touch/joystick and safe monster bounces; bow restoration and carried ammunition; real typed arrows against all five monster kinds, terrain/gate collisions, aiming/stowing, recharge, pause and respawn at 30/60/120 FPS.');
