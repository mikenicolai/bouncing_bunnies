const assert=require('node:assert/strict');
const {run,reset,place}=require('./air.cjs');
assert(run('airPlatforms[0].y-airPlatforms[19].y>=2100'));
for(const fps of [30,60,120])for(const width of [480,960]){
 reset();run(`W=${width};H=${width===480?960:540};cameraY=0;player.invincible=100;`);
 place(2800,-448);run('player.onGround=true;checkpoint={x:2445,y:-308}');
 let highest=0;
 for(let f=0;f<fps;f++){
  run(`update(1/${fps})`);highest=Math.min(highest,run('cameraY'));
 }
 assert(highest<-600,'camera follows high spring jumps');
 assert(run('player.y-cameraY>0 && player.y-cameraY<H'),'bunny remains visible');
 // A fall below a high checkpoint costs one life and restores the camera there.
 run('player.invincible=0;checkpoint={x:4265,y:-1468}');place(4200,-700);run(`update(1/${fps})`);
 assert.equal(run('lives'),2);assert.equal(run('player.x'),4265);
 assert(run('player.y-cameraY>0 && player.y-cameraY<H'));
 // Horizontal position alone cannot win below the summit.
 reset();place(5940,0);run(`update(1/${fps})`);assert.equal(run('state'),'playing');
}
// Real timed crossings of both storm-covered blue clouds, without immunity.
for(const [from,blue,to] of [[11,12,13],[17,18,19]]){
 let safe=false;
 for(let delay=0;delay<3&&!safe;delay+=.1){
  reset();run(`airTime=${delay};player.x=airPlatforms[${from}].x+airPlatforms[${from}].w*.6-21;player.y=airPlatforms[${from}].y-58;player.onGround=true;`);
  let landed=true;
  for(const [start,target] of [[from,blue],[blue,to]]){
   if(run(`airPlatforms[${start}].kind==='green'`))run('update(1/60)');else run('jump()');
   landed=false;
   for(let f=0;f<180;f++){
    if(f===5||f===10)run('jump()');
    run(`{const p=airPlatforms[${target}],error=p.x+Math.min(p.w/2,95)-player.x-21-player.vx*.16;keys.clear();if(error>5)keys.add('ArrowRight');else if(error<-5)keys.add('ArrowLeft');update(1/60);}`);
    if(run(`Math.abs(player.y+player.h-airPlatforms[${target}].y)<1&&player.onGround`)){landed=true;break;}
    if(run('lives<3'))break;
   }
   if(!landed||run('lives<3'))break;
  }
  safe=landed&&run('lives===3');
 }
 assert(safe,`storm crossing ${from} → ${blue} → ${to} has a safe timing window`);
}
run("level='meadow';resetGame();update(1/60)");assert.equal(run('cameraY'),0);
console.log('PASS: four-screen ascent; spring camera tracking; high checkpoint fall/recovery; summit-only win; both storm/blue crossings without damage; meadow camera.');
