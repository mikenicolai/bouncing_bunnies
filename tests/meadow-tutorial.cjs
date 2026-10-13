const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=width=>run(`level='meadow';meadowFinished=false;W=${width};H=${width===480?960:540};resetGame();soundOn=false;player.x=4860;player.y=412;player.onGround=true`);
for(const width of [480,960])for(const fps of [30,60,120]){
 reset(width);
 const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`update(1/${fps})`);};
 tick(.1);assert(run('fireArrow.owned&&meadowLesson.bowTaken'),'walking past the practice bow collects it');
 assert.equal(run('WORLD_W'),7500);
 run('fireArrow.angle=0;attack()');tick(1.2);
 assert.equal(run('meadowBalloonsPopped()'),0,'a missed arrow cannot unlock the door');
 // Find a firing angle using the ballistic trajectory; all impacts are real shots.
 for(let id=0;id<3;id++){
  const angle=run(`(()=>{const target=meadowLesson.balloons[${id}];for(let angle=.01;angle<1.3;angle+=.002){fireArrow.angle=angle;const o=arrowOrigin(),a={ox:o.x,oy:o.y,vx:Math.cos(angle)*FIRE_ARROW_SPEED,vy:-Math.sin(angle)*FIRE_ARROW_SPEED};let old=o;for(let time=.01;time<2;time+=.01){const point=arrowFlightPoint(a,time),hit=arrowFirstCollision(old,point);if(hit){if(hit.kind==='balloon'&&hit.target===target)return angle;break;}old=point;}}return null;})()`);
  assert.notEqual(angle,null,'each balloon can be hit from the practice station');
  run(`fireArrow.angle=${angle};attack()`);tick(1.2);
  assert.equal(run('meadowBalloonsPopped()'),id+1,'one arrow pops one target');
  if(id<2)assert.equal(run('meadowLesson.lift'),0,'all three targets are required');
 }
 tick(.8);assert.equal(run('meadowLesson.lift'),1);
 run("keys.add('ArrowRight')");
 for(let f=0;f<fps*9&&!run('player.inWater');f++)run(`update(1/${fps})`);
 assert(run('player.inWater'),`ordinary movement enters the pond: ${run('JSON.stringify({x:player.x,y:player.y,vx:player.vx,gate:meadowLesson.lift})')}`);
 assert(run('meadowLesson.bowStored&&!fireArrow.owned&&!fireArrow.aiming&&!bunnyArrows.length'),'the bow is left at the rack before swimming');
 tick(3);
 assert(run('player.x+player.w<=MEADOW_DIVE_ROCK.x+.1'),'swimming at the surface cannot bypass the rock');
 assert(!run('meadowLesson.swamThrough'));
 run("keys.add('ArrowDown')");tick(1.6);
 assert(run('meadowLesson.diveStarted&&!player.duck&&player.h===58'),'Dive moves the swimming bunny rather than crouching');
 for(let f=0;f<fps*10&&!run('meadowLesson.swamThrough');f++)run(`update(1/${fps})`);
 assert(run('meadowLesson.swamThrough'),'the submerged passage is crossed');
 run("keys.delete('ArrowDown');keys.add('ArrowUp')");
 for(let f=0;f<fps*6&&run('player.inWater');f++)run(`update(1/${fps})`);
 assert(!run('player.inWater'),'the far bank restores walking');
 run("keys.delete('ArrowUp')");
 for(let f=0;f<fps*6&&run("state==='playing'");f++)run(`update(1/${fps})`);
 assert.equal(run('state'),'map');assert(run('meadowFinished'));assert.equal(run('lives'),3,'the tutorial can be completed without damage');
}
// No early completion at either the former shrine or the new shrine without lessons.
reset(960);run('player.x=4680;update(1/60)');assert.equal(run('state'),'playing');
run('player.x=7370;player.y=412;player.onGround=true;update(1/60)');assert.equal(run('state'),'playing');
// Closed gate collision prevents running, jumping or touching targets from opening it.
reset(960);run('player.x=5580;fireArrow.owned=false;keys.add("ArrowRight");jump()');
for(let f=0;f<150;f++){if(f===6||f===12)run('jump()');run('update(1/60)');}
assert(run('player.x+player.w<=MEADOW_GATE.x+.1'));assert.equal(run('meadowBalloonsPopped()'),0);
// Ammo returns after misses; pause freezes the lesson; drowning keeps gate progress.
reset(960);run('update(1/60);fireArrow.ammo.fill(null);state="paused"');run('update(9)');assert(run('fireArrow.ammo.every(a=>a===null)'));
run('state="playing"');for(let i=0;i<181;i++)run('update(1/60)');assert.equal(run('fireArrow.ammo.filter(Boolean).length'),1);
run('meadowLesson.balloons.forEach(b=>b.popped=true);meadowLesson.lift=1;meadowLesson.bowTaken=true;player.x=5900;update(1/60);player.x=6410;player.y=720;player.inWater=true;player.air=.01;update(1/60)');
assert.equal(run('lives'),2);assert(!run('player.inWater'));assert(run('meadowBalloonsPopped()===3&&meadowLesson.bowStored&&!fireArrow.owned'));
assert.equal(run('player.x'),5880);
run('resetGame()');assert.equal(run('meadowBalloonsPopped()'),0);assert(!run('meadowLesson.bowTaken||meadowLesson.bowStored||meadowLesson.swamThrough'));assert.equal(run('meadowLesson.lift'),0);
console.log('PASS Meadow tutorial: real balloon shots, three-target gate, mandatory unarmed diving, far-bank exit and shrine completion at 30/60/120 FPS on phone/desktop; misses, ammo returns, pause, drowning checkpoint and restart.');
