const assert=require('node:assert/strict');
const {run,step}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false");
reset();
assert.equal(run('WORLD_W'),6900);
assert.equal(run('earthPlatforms.length'),25);
assert.equal(run('earthGoblins.length'),6);
assert.equal(run("worldDetails.earth[2]"),'Play Earth level');
assert.equal(run('GROUND_RUN_SPEED'),260);
assert.equal(run('GROUND_RUN_ACCEL'),1500);
assert.equal(run('earthGround.length'),7);
assert(run('earthGround.every((p,i)=>i===0||earthGround[i-1].x+earthGround[i-1].w===p.x&&p.y<earthGround[i-1].y)'));
assert(run('earthPlatforms.filter(p=>p.kind===\'branch\').every(p=>p.y<earthGroundAt(p.x+p.w/2))'));

// Running along the grassy floor ends at a cliff, while the tree route rises above it.
run('player.x=earthGround[1].x-120;player.y=earthGround[0].y-player.h;player.onGround=true');
for(let i=0;i<90;i++){run("keys.clear();keys.add('ArrowRight');update(1/60)");}
assert(run('player.x+player.w<=earthGround[1].x+1'));

// A cap is a smaller spring than the Air trampoline.
run("player.x=earthPlatforms[3].x+55;player.y=earthPlatforms[3].y-100;player.vy=170;player.onGround=false");
for(let i=0;i<80&&run('player.vy>=0');i++)step();
assert.equal(run('player.vy'),-730);
assert(run('earthPlatforms[3].spring>0'));

// The two explicit lethal surfaces end the run on contact.
reset();run("player.x=earthHazards[0].x+10;player.y=earthHazards[0].y+10;player.invincible=10");step();
assert.equal(run('state'),'lost');assert.equal(run('lives'),0);
reset();run("player.x=900;player.y=earthSwampYAt(921)-55;player.vy=200");step();
assert.equal(run('state'),'lost');

// Force both ends of the far-away weighted choice without relying on chance.
reset();
run("player.x=90;earthGoblins[5].modeAge=earthGoblins[5].modeDuration;Math.random=()=>.1;updateEarth(0)");
assert.equal(run('earthGoblins[5].mode'),'dance');
run("earthGoblins[5].modeAge=earthGoblins[5].modeDuration;Math.random=()=>.9;updateEarth(0)");
assert.equal(run('earthGoblins[5].mode'),'idle');

// A close bunny makes the goblin walk; two punches defeat it.
reset();run("player.x=earthGoblins[0].x-75;player.y=earthGoblins[0].y;updateEarth(.2)");
assert.equal(run('earthGoblins[0].mode'),'walk');
assert.equal(run('Math.abs(earthGoblins[0].vx)'),260);
run('hitEarthGoblin(earthGoblins[0])');assert.equal(run('earthGoblins[0].hp'),1);
run('earthGoblins[0].dizzy=0;hitEarthGoblin(earthGoblins[0])');assert.equal(run('earthGoblins[0].alive'),false);

// Follow each mandatory landing with the production integrator at three rates.
for(const fps of [30,60,120])for(let id=0;id<24;id++){
  reset();run('earthGoblins.forEach(g=>g.alive=false)');
  run(`{const p=earthPlatforms[${id}];player.x=p.x+p.w*.53-21;player.y=p.y-58;player.vx=0;player.vy=0;player.onGround=true;player.invincible=100;}`);
  if(run(`earthPlatforms[${id}].kind==='mushroom'`))run('player.vy=-730;player.onGround=false;player.jumpAge=0');
  else run('jump()');
  let reached=false;
  for(let f=0;f<fps*3;f++){
    if(f===Math.round(fps*.09)||f===Math.round(fps*.18))run('jump()');
    run(`{const p=earthPlatforms[${id+1}],aim=p.x+Math.min(p.w*.35,65),error=aim-player.x-21-player.vx*.12;keys.clear();if(error>3)keys.add('ArrowRight');else if(error<-3)keys.add('ArrowLeft');}`);
    run(`update(1/${fps})`);
    if(run(`{const p=earthPlatforms[${id+1}];(player.onGround||p.kind==='mushroom'&&p.spring>0)&&Math.abs(player.y+player.h-p.y)<2&&player.x+player.w>p.x}`)){reached=true;break;}
    if(run("state!=='playing'"))break;
  }
  assert(reached,`Wildwood landing ${id} → ${id+1} unreachable at ${fps} FPS`);
}
reset();
run("player.x=EARTH_GATE_X-15;player.y=earthPlatforms.at(-1).y-58;player.onGround=true;player.vy=0;update(1/60)");
assert.equal(run('state'),'map');
assert.equal(run('earthFinished'),true);
assert.equal(run("document.querySelector('#mapHeading').textContent"),'Earth complete!');
console.log('PASS Earth: 6,900px grass/cliff route, spring, hazards, matched goblin speed, and all 24 landings at 30/60/120 FPS.');
