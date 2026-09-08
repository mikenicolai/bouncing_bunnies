const assert=require('node:assert/strict');
const {run,reset,step}=require('./air.cjs');
// Each mandatory platform transition uses the production integrator, acceleration,
// gravity and jump rules. Immunity isolates reachability from hazard timing tests.
const route=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
for(const fps of [30,60,120])for(let i=0;i<route.length-1;i++){
  const from=route[i],to=route[i+1];let success=false;
  for(const offset of [.3,.6,.85]){
    reset();run('player.invincible=100;');
    run(`player.x=airPlatforms[${from}].x+airPlatforms[${from}].w*${offset}-21;player.y=airPlatforms[${from}].y-58;player.onGround=true;`);
    const spring=run(`airPlatforms[${from}].kind==='green'`);if(spring)step(1);else run('jump()');
    for(let f=0;f<300;f++){
      if(f===Math.round(fps/12)||f===Math.round(fps/6))run('jump()');
      run(`{const target=airPlatforms[${to}],aim=${to===2?'500':'target.x+Math.min(target.w/2,95)'},error=aim-player.x-21-player.vx*.16;keys.clear();if(error>5)keys.add('ArrowRight');else if(error<-5)keys.add('ArrowLeft');}`);
      run(`update(${1/fps})`);
      if(run(`player.x+player.w>airPlatforms[${to}].x&&player.x<airPlatforms[${to}].x+airPlatforms[${to}].w&&Math.abs(player.y+player.h-airPlatforms[${to}].y)<1&&(player.onGround||airPlatforms[${to}].spring>0)`)){success=true;break;}
      if(run('player.y>620'))break;
    }
    if(success)break;
  }
  assert(success,`Unreachable transition ${from} → ${to} at ${fps} FPS`);console.log(`PASS ${fps} FPS route ${from} → ${to}`);
}
