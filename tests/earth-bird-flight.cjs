const assert=require('node:assert/strict'),{run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false");
const approach=(side,height=0)=>run(`Object.assign(player,{x:earthBirds[0].x+(${side}<0?-90:48),y:earthBirds[0].y-player.h-${height},vx:0,vy:0,onGround:true})`);
const results=[];
for(const fps of [30,60,120]){
 const tick=s=>{for(let i=0;i<Math.round(fps*s);i++)run(`updateEarthBirds(1/${fps})`);};
 reset();assert.equal(run('earthBirds.length'),5);tick(2);assert(run("earthBirds.every(b=>b.mode==='perched'&&b.x===b.homeX)"),'far birds stay on their perches');
 for(const side of [-1,1]){
  reset();approach(side);const x=run('earthBirds[0].x'),y=run('earthBirds[0].y'),lives=run('lives');
  tick(1/fps);assert.equal(run('earthBirds[0].mode'),'takeoff');assert.equal(run('earthBirds[0].facing'),-side);assert(run('earthBirds[0].y')<y,'bird lifts immediately');assert(Math.abs(run('earthBirds[0].x')-x)<6,'no takeoff position snap');
  tick(.2);assert.equal(run('earthBirds[0].mode'),'flying');assert(run(`(earthBirds[0].x-${x})*${-side}>0`),'flees away from approach');
  tick(2);assert(run('earthBirds[0].y')<y-170);assert.equal(run('lives'),lives);assert.equal(run('score'),0);assert.equal(run('earthBirds[1].mode'),'perched','nearby wildlife is not globally triggered');
 }
 reset();approach(-1,180);tick(.5);assert.equal(run('earthBirds[0].mode'),'perched','a distant branch above does not scare a ground bird');
 approach(-1,60);tick(1/fps);assert.equal(run('earthBirds[0].mode'),'takeoff','a close airborne bunny also startles it');
 reset();approach(-1);tick(2);results.push(run('({x:earthBirds[0].x,y:earthBirds[0].y})'));
 // Move the bunny around the flying bird: its horizontal turn eases through zero.
 run('player.x=earthBirds[0].x+40;player.y=earthBirds[0].y-40');const vx=run('earthBirds[0].vx');tick(1/fps);assert(run('earthBirds[0].vx')>0);assert(run('earthBirds[0].vx')<vx);assert.equal(run('earthBirds[0].facing'),-1);
 // Real movement, rather than a proximity call alone, starts the first takeoff.
 reset();run("player.x=260;player.y=earthGroundAt(460)-player.h;player.onGround=true;keys.add('ArrowRight')");
 for(let i=0;i<fps*2&&run("earthBirds[0].mode==='perched'");i++)run(`update(1/${fps})`);
 assert.notEqual(run('earthBirds[0].mode'),'perched');assert.equal(run('lives'),3);
}
for(const p of results)assert(Math.abs(p.x-results[0].x)<1e-7&&Math.abs(p.y-results[0].y)<1e-7,'eased flight distance is frame independent');
reset();approach(-1);run('updateEarthBirds(.3)');
for(const state of ['map','developer','lost','reviveAd']){
 run(`state='${state}'`);const frozen=run('JSON.stringify(earthBirds)');run('update(.1);updateEarthBirds(.1)');assert.equal(run('JSON.stringify(earthBirds)'),frozen,'all paused screens freeze position and wings');
}
run("state='playing';level='air'");const frozen=run('JSON.stringify(earthBirds)');run('updateEarthBirds(1)');assert.equal(run('JSON.stringify(earthBirds)'),frozen,'other worlds do not advance Earth wildlife');
reset();assert(run("earthBirds.every(b=>b.mode==='perched'&&b.age===0&&b.x===b.homeX&&b.y===earthGroundAt(b.homeX)+1)"),'a fresh run restores each original perch');
// Foreground rendering uses full world-camera movement and actual travel direction.
run("earthBirds[0].mode='flying';earthBirds[0].age=.5;earthBirds[0].vx=-50;skyBirdSheet.complete=true;skyBirdSheet.naturalWidth=1254;var birdTranslations=[],birdScales=[];ctx.save=()=>{};ctx.restore=()=>{};ctx.translate=(x,y)=>birdTranslations.push({x,y});ctx.scale=(x,y)=>birdScales.push({x,y});ctx.drawImage=()=>{};skyBirdPainting=()=>({});cameraX=100;drawEarthGroundBird(earthBirds[0],0)");
assert.equal(run('birdTranslations[0].x'),run('earthBirds[0].x-100'));assert.equal(run('birdTranslations[0].y'),run('earthBirds[0].y-18'));assert.equal(run('birdScales[0].x'),-1,'beak follows actual velocity while turning');
console.log('PASS foreground birds: proximity/walk/jump takeoff, both escape directions, flapping flight state, smooth turns, frame-independent paths, harmless wildlife, pause/world/reset and foreground camera at 30/60/120 FPS.');
