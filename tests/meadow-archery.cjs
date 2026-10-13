const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='meadow';resetGame();soundOn=false;player.x=4860;player.y=412;player.onGround=true;update(1/60)");
for(const fps of [30,60,120]){
 const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`update(1/${fps})`);};
 // Each of the nine actual monsters can be defeated by a real practice-bow shot.
 for(let id=0;id<9;id++)for(const facing of [-1,1]){
  reset();run(`{const m=enemies[${id}];enemies=[m];m.x=m.min=m.max=5150;m.y=470-m.h;m.vx=0;player.x=${facing===1?4960:5360};player.y=412;player.onGround=true;player.facing=${facing};fireArrow.angle=.1;attack();}`);
  assert.equal(run('bunnyArrows.length'),1);tick(.4);
  assert.equal(run('enemies[0].hp'),0,`monster ${id}, direction ${facing}, ${fps} FPS`);
  assert(!run('enemies[0].alive'));assert.equal(run('bunnyArrows.length'),0,'a hit consumes the arrow');
  assert.equal(run('fireArrow.ammo.filter(Boolean).length'),4);
  assert.equal(run('meadowBalloonsPopped()'),0,'monster hits do not count toward the balloon gate');
  assert.equal(run('meadowLesson.lift'),0);
  run('player.x=enemies[0].x;player.y=enemies[0].y;player.vy=0;player.invincible=0;updateMeadowZombies(1/60)');assert.equal(run('lives'),3,'defeated monsters cannot damage the bunny');
 }
 // Choose the nearest swept collision, regardless of the enemy array's order.
 reset();run("{const near=enemies[0],far=enemies[1];Object.assign(near,{x:5150,y:410,min:5150,max:5150,vx:0});Object.assign(far,{x:5270,y:410,min:5270,max:5270,vx:0});enemies=[far,near];player.x=4960;player.y=412;player.onGround=true;player.facing=1;fireArrow.angle=.1;attack();updateFireArchery(.6)}");
 assert(!run('enemies[1].alive'));assert(run('enemies[0].alive'),'one arrow cannot pass through the nearest monster');
 run('fireArrow.cooldown=0;attack();updateFireArchery(.6)');assert(!run('enemies[0].alive'),'the next arrow passes the defeated monster and hits the survivor');
 // The closed door shields a monster behind it, including during a long frame.
 reset();run("{const m=enemies[0];Object.assign(m,{x:5770,y:410,min:5770,max:5770,vx:0});enemies=[m];player.x=5500;player.facing=1;fireArrow.angle=.1;attack();updateFireArchery(.6)}");
 assert(run('enemies[0].alive'));assert.equal(run('bunnyArrows.length'),0,'the wooden door still blocks arrows');
 // Aiming above the monster leaves it alive.
 reset();run("{const m=enemies[0];Object.assign(m,{x:5150,y:410,min:5150,max:5150,vx:0});enemies=[m];player.x=4960;player.facing=1;fireArrow.angle=1.2;attack()}");tick(.4);assert(run('enemies[0].alive'));
}
console.log('PASS Meadow archery: real bow shots defeat all nine monsters in both directions at 30/60/120 FPS; nearest swept hits, arrow consumption, harmless defeated monsters, misses and door protection; balloon progress stays separate.');
