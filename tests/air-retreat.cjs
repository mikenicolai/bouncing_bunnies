const assert=require('node:assert/strict'),{run}=require('./air.cjs');
const summit=()=>run("level='air';resetGame();soundOn=false;tempest.hp=0;player.invincible=999;player.x=4800;player.y=airPlatforms[19].y-58;player.onGround=true;player.airCloud=airPlatforms[19];update(0)");
let failures=0;
for(const fps of [30,60,120]){
 const tick=seconds=>{for(let i=0;i<Math.round(fps*seconds);i++)run(`update(1/${fps})`);};
 summit();run("keys.add('ArrowLeft')");tick(6);
 try{assert.equal(run('lives'),3,'walking back past the tree island must not hit a summit-height death plane');assert(run('player.x<3500'),'the return continues to the earlier clouds');}
 catch(e){console.error(`FAIL tree return ${fps} FPS:`,run('JSON.stringify({x:player.x,y:player.y,lives,checkpoint})'));failures++;}
 // Enter the actual dropper, miss its blue waypoint, then steer left from respawn.
 summit();run('player.x=5920');tick(1/fps);assert(run('descentStarted'));
 run('player.x=6100;player.y=1000');tick(1/fps);assert.equal(run('lives'),2);assert.equal(run('player.x'),5890);
 run("keys.add('ArrowLeft');player.invincible=999");let teleported=false,previous=run('player.x');
 for(let i=0;i<fps*9;i++){run(`update(1/${fps})`);const x=run('player.x');if(x>previous+100){teleported=true;break;}previous=x;}
 try{assert(!teleported,'retreating left must not be clamped back into the old dropper');assert(!run('descentStarted'));assert.equal(run('lives'),2);assert(run('checkpoint.x<5000'),'returning restores a main-route checkpoint');}
 catch(e){console.error(`FAIL dropper return ${fps} FPS:`,run('JSON.stringify({x:player.x,y:player.y,lives,descentStarted,checkpoint})'));failures++;}
 // Tree-island crouching stays safe and a genuine missed landing still costs a heart.
 summit();run("keys.add('ArrowLeft')");
 for(let i=0;i<fps*6;i++){run(`update(1/${fps})`);if(run('player.onGround&&player.airCloud===airPlatforms[15]'))break;}
 assert(run('player.airCloud===airPlatforms[15]&&player.onGround'));assert.equal(run('checkpoint.x'),3725);
 run("keys.clear();keys.add('ArrowDown')");tick(.2);assert.equal(run('lives'),3);assert.equal(run('player.h'),18);
 run("keys.clear();updateDuck();player.x=3600;player.y=checkpoint.y+651;player.onGround=false;player.vy=100");tick(1/fps);assert.equal(run('lives'),2);assert.equal(run('player.x'),3725);assert.equal(run('player.y'),-1098);
 // A paid continuation at the dropper can also retreat, then retry normally.
 summit();run('player.x=5920');tick(1/fps);
 run('coinWallet=20;resetRunWallet();lives=1;player.invincible=0;hurt();buyReviveHeart()');assert.equal(run('lives'),1);assert.equal(run('coinWallet'),0);
 run("player.invincible=999;keys.add('ArrowLeft')");tick(6.5);assert.equal(run('lives'),1);assert(!run('descentStarted'));assert(run('checkpoint.x<5000'));assert.equal(run('tempest.hp'),0);
 run("keys.clear();player.x=5890;player.y=-1748;player.vx=0;player.vy=0;player.onGround=true;player.airCloud=airPlatforms[19];keys.add('ArrowRight')");tick(.5);assert(run('descentStarted'));assert.equal(run('checkpoint.x'),5890);assert(!run('descentBlueReached'));
}
if(failures){console.error(`${failures} retreat scenarios failed`);process.exitCode=1;}
else console.log('PASS real Tempest-to-tree retreat and dropper-death-to-left-retreat without phantom deaths or shaft teleports; safe crouch, real void falls, paid continuation and dropper retry at 30/60/120 FPS.');
