const assert=require('node:assert/strict');
const {run,reset,place}=require('./air.cjs');

// The world map launches an independent, playable Fire route.
run("level='meadow';resetGame();openWorldMap();selectWorld('fire');document.querySelector('#mapAvailability').listeners.click[0]()");
assert.equal(run('level'),'fire');
assert.equal(run('state'),'playing');
assert.equal(run('WORLD_W'),2200);
assert.equal(run('firePlatforms.length'),6);
assert.equal(run('coins.length'),12);
assert.equal(run('enemies.length'),0);

// Every stone-to-stone jump can be made with the ordinary first jump.
for(const fps of [30,60,120])for(let i=0;i<firePlatformsLength();i++){
  run(`level='fire';resetGame();player.x=firePlatforms[${i}].x+firePlatforms[${i}].w*.92-21;player.y=firePlatforms[${i}].y-58;player.onGround=true;jump()`);
  let landed=false;
  for(let f=0;f<fps*3;f++){
    run(`{const p=firePlatforms[${i+1}],error=p.x+65-player.x-21-player.vx*.16;keys.clear();if(error>5)keys.add('ArrowRight');else if(error<-5)keys.add('ArrowLeft');update(1/${fps});}`);
    if(run(`player.onGround&&Math.abs(player.y+58-firePlatforms[${i+1}].y)<1`)){landed=true;break;}
    if(run('lives<3'))break;
  }
  assert(landed,`Fire platform ${i} → ${i+1} at ${fps} FPS`);
  assert.equal(run('lives'),3);
}
function firePlatformsLength(){return run('firePlatforms.length-1');}

// Lava removes one life and returns the bunny to the latest cooled stone.
run("level='fire';resetGame();player.x=430;player.y=firePlatforms[1].y-58;player.vy=20;update(1/60)");
assert.equal(run('checkpoint.x'),425);
place(760,470);run('update(1/60)');
assert.equal(run('lives'),2);assert.equal(run('player.x'),425);
assert.equal(run('player.y'),352);

// The final portal returns to the map and records Fire completion.
run("level='fire';resetGame();player.x=2070;player.y=firePlatforms[5].y-58;player.onGround=true;update(1/60)");
assert.equal(run('state'),'map');assert(run('fireFinished'));
assert.equal(run("document.querySelector('#mapHeading').textContent"),'Fire complete!');
run("level='meadow';resetGame()");assert.equal(run('platforms.length'),19);
reset();assert.equal(run('level'),'air');
console.log('PASS Fire map launch, six-platform route at 30/60/120 FPS, lava recovery, portal completion, and other-world isolation.');
