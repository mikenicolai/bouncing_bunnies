const assert=require('node:assert/strict');
const {run,reset}=require('./air.cjs');
assert.equal(run('airSecretIsland.x+airSecretIsland.w/2'),run('DESCENT.gateX'));
assert(run('airSecretIsland.y>airPlatforms[DESCENT.finish].y'));
for(const width of [480,960])for(const fps of [30,60,120]){
  reset();run(`W=${width};H=${width===480?960:540};airFinished=false;beginDescent();descentBlueReached=true;player.x=6690;player.y=1712;player.onGround=true;player.airCloud=airPlatforms[21];keys.add('ArrowRight');jump()`);
  let turned=false,landed=false;
  // Jump past the portal, fall around the cloud's right edge, then steer back.
  for(let f=0;f<fps*8;f++){
    if(f===Math.round(fps/12)||f===Math.round(fps/6))run('jump()');
    if(run('player.x>=6850&&player.y+player.h>1780'))turned=true;
    run(`keys.clear();keys.add('${turned?'ArrowLeft':'ArrowRight'}');update(1/${fps})`);
    if(run('player.onGround&&player.airCloud===airSecretIsland')){landed=true;break;}
    assert.equal(run('state'),'playing','passing the portal in the air does not finish');
  }
  assert(landed,`secret island reachable at ${width}/${fps}`);
  assert.equal(run('lives'),3);
  assert.equal(run('checkpoint.y'),-1748,'the secret does not replace summit recovery');
  assert(run('player.y+player.h-cameraY<H-40'),'camera shows the secret landing');
  assert.equal(run('player.y+player.h'),run('airSecretIsland.y'));
  // The normal two extra jump taps return through the cloud to the portal.
  run('keys.clear();player.vx=0;jump()');
  for(let f=0;f<fps*5&&run("state==='playing'");f++){
    if(f===Math.round(fps/12)||f===Math.round(fps/6))run('jump()');
    run(`{const error=6750-player.x-21-player.vx*.16;keys.clear();if(error>3)keys.add('ArrowRight');else if(error<-3)keys.add('ArrowLeft');update(1/${fps});}`);
  }
  assert.equal(run('state'),'map',`return to wind gate at ${width}/${fps}`);
  assert(run('airFinished'));assert.equal(run('lives'),3);
}
// Ground beyond the gate is safe for exploration until the portal is touched.
reset();run('beginDescent();descentBlueReached=true;player.x=6815;player.y=1712;player.vx=0;player.vy=0;update(1/60)');
assert.equal(run('state'),'playing');
// Missing the little island still uses the established summit checkpoint.
run('player.x=6858;player.y=2200;update(1/60)');
assert.equal(run('lives'),2);assert.equal(run('player.x'),5890);assert.equal(run('player.y'),-1748);
reset();console.log('PASS Secret island: optional landing, visible camera, harmless exploration, boosted return to gate and summit recovery at 30/60/120 FPS on phone/desktop.');
