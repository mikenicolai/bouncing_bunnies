const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='fire';resetGame();fireFinished=false;");
const arena=()=>{reset();run("rollFireArrowType=()=> 'normal';");run("fireArrow.owned=true;fireArrow.ammo.fill('normal');beginSecondVolcano();player.x=10340;player.y=-558;player.onGround=true;player.facing=1;beginLavaKing();");};
// The relic is reachable and collected by walking, cannot be collected by zombies, and persists through respawn.
reset();assert(run('mazeOpen(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r)'));assert(run('mazeNext({c:1,r:1},FIRE_ARROW_CELL)'));
run('beginFireMaze();player.mazeC=24;player.mazeR=1;player.x=6739;player.y=1991;update(1/60)');assert.equal(run('fireMode'),'maze','exit requires the relic');
run('player.x=mazeCenter(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r).x-21;player.y=mazeCenter(FIRE_ARROW_CELL.c,FIRE_ARROW_CELL.r).y-29;player.mazeC=FIRE_ARROW_CELL.c;player.mazeR=FIRE_ARROW_CELL.r;collectFireArrow()');assert(run('fireArrow.owned'));assert.equal(run('score'),0,'inventory is separate from coins');
run('respawnFire()');assert(run('fireArrow.owned'));run('resetGame()');assert(!run('fireArrow.owned'));assert.equal(run('bunnyArrows.length'),0);
// Before acquisition, punching cannot damage the king and shooting is unavailable.
arena();run("fireArrow.owned=false;fireArrow.aiming=false;player.x=lavaKing.x-72;player.y=-558;attack()");assert.equal(run('lavaKing.hp'),10);assert.equal(run('fireBunnyArrow()'),false);
// Acquiring the arrow changes carry poses, and aiming changes idle/walking/release poses.
reset();run('fireArrow.owned=true;beginSecondVolcano();player.onGround=true;player.vx=0');assert.equal(run('archeryBunnyFrame()'),0);
run('player.vx=260;player.run=1');assert([1,2].includes(run('archeryBunnyFrame()')));run('player.onGround=false');assert.equal(run('archeryBunnyFrame()'),3);
run('player.onGround=true;toggleFireAim();player.vx=0');assert(run('fireArcheryMode()'));assert.equal(run('archeryBunnyFrame()'),4);
run('player.vx=260');assert([5,6].includes(run('archeryBunnyFrame()')));run('fireBunnyArrow()');assert.equal(run('archeryBunnyFrame()'),7);
// All jump paths are disabled while aiming, but up/down keys and joystick change the angle, not height.
for(const fps of [30,60,120]){
 arena();run("keys.add('ArrowUp');jump();updateJoystick({x:JOY.x,y:JOY.y-JOY.radius});");assert(run('player.onGround'));assert.equal(run('player.boosts'),0);
 for(let f=0;f<fps*.3;f++)run(`update(1/${fps})`);assert(run('fireArrow.angle>.4'));assert.equal(run('player.y'),-558);
 run("clearInputs();keys.add('ArrowDown')");for(let f=0;f<fps*.6;f++)run(`update(1/${fps})`);assert(run('fireArrow.angle<0'));assert.equal(run('player.h'),58);assert.equal(run('player.y'),-558);
 run("clearInputs();keys.add('ArrowRight')");const x=run('player.x');for(let f=0;f<fps*.4;f++)run(`update(1/${fps})`);assert(run('player.x')>x);assert(run('player.onGround'));
 run("clearInputs();keys.add('ArrowLeft')");for(let f=0;f<fps*.4;f++)run(`update(1/${fps})`);assert.equal(run('player.facing'),1,'backing away keeps the bow pointed toward the king');
}
// The displayed parabola and live arrow use exactly the same coordinates, mirrored for either facing.
for(const direction of [-1,1]){
 arena();run(`player.x=10600;player.facing=${direction};fireArrow.angle=.25;fireBunnyArrow();var archeryPrediction=arrowFlightPoint(bunnyArrows[0],.1);updateFireArchery(.1)`);
 assert.equal(run('bunnyArrows[0].x'),run('archeryPrediction.x'));assert.equal(run('bunnyArrows[0].y'),run('archeryPrediction.y'));assert.equal(Math.sign(run('bunnyArrows[0].vx')),direction);
 assert.equal(run('fireBunnyArrow()'),false,'fire cooldown');
}
// Real flying arrows hit the king; front shield blocks but a rear arrow bypasses it.
for(const [side,phase,hp] of [[-1,'shield',10],[1,'shield',9],[-1,'recover',9]]){
 arena();run(`player.x=lavaKing.x+${side===-1?'-180':'170'};player.facing=${-side};fireArrow.angle=.1;lavaKing.phase='${phase}';fireBunnyArrow()`);
 for(let f=0;f<30;f++)run('updateFireArchery(1/120)');assert.equal(run('lavaKing.hp'),hp);assert.equal(run('bunnyArrows.length'),0);
}
// Swept hits cannot tunnel through a fireball or boss at a long frame interval.
arena();run("player.x=10600;fireArrow.angle=0;fireBunnyArrow();const b=bunnyArrows[0];lavaKingFireballs=[{x:b.x+45,y:b.y,r:13,vx:0,age:0,alive:true}];updateFireArchery(.1)");assert.equal(run('lavaKingFireballs.length'),0);assert.equal(run('bunnyArrows.length'),0);assert.equal(run('lavaKing.hp'),10);
arena();run("player.x=10600;fireArrow.angle=.1;lavaKing.phase='recover';fireBunnyArrow();updateFireArchery(.3)");assert.equal(run('lavaKing.hp'),9);
// Win the actual fight by sprinting during flight and aiming at the moving boss
// or intercepting incoming projectiles. No health or hit results are forced.
for(const fps of [30,60,120]){
 arena();let shots=0,direction=1,priorK=null,sawFlight=false;
for(let f=0;f<fps*180&&!run('lavaKing.defeated')&&run("state==='playing'");f++){
 const q=JSON.parse(run('JSON.stringify({p:player,k:lavaKing,balls:lavaKingFireballs,ammo:fireArrow.ammo.filter(Boolean).length})')),p=q.p,k=q.k;
 const flight=k.phase==='flight'||k.y+k.h<-550;if(flight)sawFlight=true;
 if(p.x<10320)direction=1;if(p.x>11140)direction=-1;
 let movement=flight?direction:Math.abs(p.x+21-(k.x+45))<240?(p.x<k.x?-1:1):0;
 if(!flight&&p.x<10300&&movement<0||!flight&&p.x>11150&&movement>0)movement=0;
 run(`keys.clear();keys.add('ShiftLeft');${movement?`keys.add('${movement<0?'ArrowLeft':'ArrowRight'}');`:''}`);
 let ball=q.balls.filter(b=>Math.sign(b.vx)===Math.sign(p.x+21-b.x)&&Math.abs(b.x-(p.x+21))<120).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(q.ammo&&!run('fireArrow.cooldown')&&(ball||k.phase!=='shield'&&k.dizzy<=0&&!k.recoveryHit)){
  const target=ball||{x:k.x+45,y:k.y+65,vx:priorK?(k.x-priorK.x)*fps:0,vy:priorK?(k.y-priorK.y)*fps:0};
  const distance=Math.abs(target.x-p.x-21),lead=Math.min(.65,distance/900),tx=target.x+(target.vx||0)*lead,ty=target.y+(target.vy||0)*lead;
  const facing=tx>p.x+21?1:-1;let angle=.1;
  for(let i=0;i<5;i++){const ox=p.x+21+facing*(34+14*Math.cos(angle)),oy=p.y+p.h-35-14*Math.sin(angle),dx=Math.max(1,Math.abs(tx-ox)),time=dx/(900*Math.cos(angle));angle=Math.max(-.45,Math.min(1.3,Math.atan2(oy-ty+150*time*time,dx)));}
  run(`player.facing=${facing};fireArrow.angle=${angle};attack()`);shots++;
 }
 priorK=k;run(`update(1/${fps})`);
}
 assert(run('lavaKing.defeated'),`ranged flight fight ${fps}`);assert(run('lives')>0,'the limited-ammo fight remains winnable');assert(shots>=10);assert(sawFlight);
 assert(!run('fireArcheryMode()'));if(run("state==='playing'"))run('player.x=FIRE_EXIT_X-21;update(1/60)');assert.equal(run('state'),'map');assert(run('fireFinished'));
}
// Pause freezes projectiles and input; respawn clears projectiles without dropping the relic.
arena();run("fireBunnyArrow();state='map';const x=bunnyArrows[0].x;update(.1)");assert.equal(run('bunnyArrows[0].x'),run('x'));
run("state='playing';respawnFire()");assert.equal(run('bunnyArrows.length'),0);assert(run('fireArrow.owned'));assert(run('fireArrow.aiming'));
reset();assert(!run('fireArrow.owned'));assert(!run('fireArrow.aiming'));assert.equal(run('bunnyArrows.length'),0);
// The extra button works at the summit: stow restores jumping and punching, and never auto-equips.
arena();run("window.listeners.keydown[1]({code:'KeyZ',repeat:false,preventDefault(){}})");assert(!run('fireArrow.aiming'));
run('attack()');assert.equal(run('bunnyArrows.length'),0);assert(run('player.attack>0'));assert(!run('fireArrow.aiming'));
assert.equal(run('fireBunnyArrow()'),false);run('jump()');assert(!run('player.onGround'));assert(run('player.vy<0'));
run('respawnFire()');assert(!run('fireArrow.aiming'),'checkpoint respects stowed arrow');
run("fitTouchControls();canvas.listeners.pointerdown[0]({clientX:ACTIONS.ability2.x*960/W,clientY:ACTIONS.ability2.y*540/H,pointerId:71,preventDefault(){}})");assert(run('fireArcheryMode()'));
run('jump()');assert(run('player.onGround'));run('fireBunnyArrow()');assert.equal(run('bunnyArrows.length'),1);
run("canvas.listeners.pointerdown[0]({clientX:ACTIONS.ability2.x*960/W,clientY:ACTIONS.ability2.y*540/H,pointerId:72,preventDefault(){}})");assert(!run('fireArrow.aiming'));assert.equal(run('bunnyArrows.length'),1,'stowing leaves fired arrows in flight');
// Climb one ladder cell up and down with both weapon states, at multiple frame rates.
for(const fps of [30,60,120])for(const equipped of [false,true]){
 reset();run(`beginFireMaze();fireArrow.owned=true;fireArrow.aiming=${equipped};fireZombies=[];player.mazeC=11;player.mazeR=11;player.x=mazeCenter(11,11).x-21;player.y=mazeCenter(11,11).y-29;`);
 for(const [key,row] of [['ArrowUp',10],['ArrowDown',11]]){
  run(`keys.add('${key}');update(1/${fps});keys.clear()`);
  for(let f=0;f<fps*.6;f++)run(`update(1/${fps})`);
  assert.equal(run('player.mazeR'),row);assert.equal(run('player.mazeC'),11);assert.equal(run('player.y'),run(`mazeCenter(11,${row}).y-29`));assert.equal(run('fireArrow.aiming'),equipped);assert(run('fireArrow.owned'));
 }
 run('toggleFireAim()');assert.equal(run('fireArrow.aiming'),!equipped,'maze can stow and equip');
}
// Z replaces E, including repeat protection. Eight upright running poses form the normal cycle.
arena();run("window.listeners.keydown[1]({code:'KeyE',repeat:false,preventDefault(){}})");assert(run('fireArrow.aiming'));
run("window.listeners.keydown[1]({code:'KeyZ',repeat:true,preventDefault(){}})");assert(run('fireArrow.aiming'));
run("window.listeners.keydown[1]({code:'KeyZ',repeat:false,preventDefault(){}})");assert(!run('fireArrow.aiming'));
const gait=new Set();for(let phase=0;phase<8;phase++){run(`player.vx=260;player.onGround=true;player.run=${(phase+.1)/1.6}`);gait.add(run('uprightRunFrame()'));}assert.equal(gait.size,8);
for(const [vy,frame] of [[-500,5],[0,6],[500,7]]){run(`player.onGround=false;player.vy=${vy}`);assert.equal(run('fourPawFrame()'),frame);}
// Whole painted movement/equipment rendering is covered by upright-run.cjs.
console.log('PASS archery: relic/maze gate, carried and aim animation states, no-jump aiming, keys/touch/movement, matching preview parabola, arrows/cooldown/shield/swept hits, fireball interception, full ten-heart ranged fight at 30/60/120 FPS, pause/respawn/reset.');
