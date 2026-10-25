const assert=require('node:assert/strict'),{run}=require('./air.cjs');
function reset(){run("level='water';resetGame();soundOn=false;waterSharks=[];waterPirates=[];waterAquaSuit=true;waterTrident.owned=true;player.inWater=true;player.breaching=false;player.invincible=0;player.vx=player.vy=0;var shell=waterReefSwimmers[105];shell.x=2300;shell.y=600;");}
function place(axis,side){run(`player.x=${axis==='x'?`shell.x+${side<0?'-shell.hw-player.w-55':'shell.hw+55'}`:'shell.x-player.w/2'};player.y=${axis==='y'?`shell.y+${side<0?'-shell.hh-player.h-50':'shell.hh+50'}`:'shell.y-player.h/2'};player.vx=player.vy=0;keys.clear();keys.add('${axis==='x'?side<0?'ArrowRight':'ArrowLeft':side<0?'ArrowDown':'ArrowUp'}');`);}
function tick(fps,seconds,live=false){for(let i=0;i<Math.ceil(fps*seconds);i++)run(`${live?'update':'updateWater'}(1/${fps})`);}
function blocked(axis,side){return run(`!overlap(player,waterTurtleBody(shell))&&${axis==='x'?side<0?'player.x+player.w<=shell.x-shell.hw+.01':'player.x>=shell.x+shell.hw-.01':side<0?'player.y+player.h<=shell.y-shell.hh+.01':'player.y>=shell.y+shell.hh-.01'}`);}
for(const fps of [30,60,120]){
 for(const axis of ['x','y'])for(const side of [-1,1])for(const dash of [false,true]){
  reset();place(axis,side);
  if(dash){run("waterTrident.mode='dash';fireWaterTrident()");assert(run('waterTrident.dash>0'));}
  tick(fps,1);
  assert(blocked(axis,side),`${axis} side ${side}, dash ${dash}, ${fps} FPS blocks the actual swim movement`);
  assert.equal(run('lives'),3,'shell contact is harmless with immunity off');
  if(dash)assert.equal(run('waterTrident.dash'),0,'a dash cannot tunnel through the turtle');
 }
 // Swim around either the top or bottom, then continue past the little obstacle.
 for(const route of ['ArrowUp','ArrowDown']){
  reset();place('x',-1);tick(fps,1);assert(blocked('x',-1));
  run(`keys.clear();keys.add('${route}')`);tick(fps,.7);
  run("keys.clear();keys.add('ArrowRight')");tick(fps,1.4);
  assert(run('player.x>shell.x+shell.hw+10'),`swimming around ${route} gets past at ${fps} FPS`);assert.equal(run('lives'),3);
 }
 // The real world loop moves the animal first. Neither swimming body may cross the other.
 reset();place('x',-1);const initial=run('shell.x');
 for(let i=0;i<fps*3;i++){
  run(`update(1/${fps})`);assert(!run('overlap(player,waterTurtleBody(shell))'),`moving turtle stays solid at ${fps} FPS`);
 }
 assert(run('shell.x')>initial+15,'the turtle continues fleeing instead of becoming a fixed wall');assert.equal(run('lives'),3);
 reset();run('shell.vx=70;shell.vy=0;player.x=shell.x+shell.hw+1;player.y=shell.y-player.h/2;');
 const restingX=run('player.x');
 for(let i=0;i<fps;i++){run(`waterTime+=1/${fps};updateWaterReefLife(1/${fps})`);assert(!run('overlap(player,waterTurtleBody(shell))'),'a passing turtle cannot clip into a stationary bunny');}
 assert.equal(run('player.x'),restingX,'the animal yields without moving a resting bunny');
}
// A checkpoint overlap separates without damage, and the bunny can immediately swim away.
reset();run('player.x=shell.x-player.w/2;player.y=shell.y-player.h/2;updateWater(0)');assert(!run('overlap(player,waterTurtleBody(shell))'));assert.equal(run('lives'),3);
const x=run('player.x');run("keys.clear();keys.add('ArrowLeft')");tick(60,.5);assert(run('player.x')<x-20,'no checkpoint contact lock');
// Other reef fish remain decorative; only the five turtles become movement solids.
reset();assert.equal(run('waterTurtleSolids().length'),5);assert(run('waterTurtleSolids().every(b=>b.turtle.turtle)'));
console.log('PASS harmless solid swimming turtles: four swim and dash directions, routes above/below, live fleeing shell collision at 30/60/120 FPS, checkpoint separation and no fish blockers.');
