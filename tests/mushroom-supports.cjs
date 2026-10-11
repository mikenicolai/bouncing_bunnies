const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false);keys.clear()");
reset();
assert.equal(run('EARTH_MUSHROOM_SCALE'),.88);
assert.equal(run('earthMushroomBoughs.length'),5);
const snapshot=run('JSON.stringify([earthPlatforms,earthMushroomBoughs,earthHazards])');
for(const fps of [30,60,120])for(let i=0;i<5;i++){
  reset();
  run(`globalThis.b=earthMushroomBoughs[${i}];globalThis.m=earthPlatforms[b.mushroomId]`);
  assert(run('platforms.includes(b)&&b.oneWay&&b.kind!=="mushroom"'));
  assert(run('Math.abs(m.w-160*.88)<1e-8&&Math.abs(m.h-26*.88)<1e-8'));
  assert(run('Math.abs(b.y-earthTreeLayout(m).boughY)<1e-8'));
  assert(run('Math.abs(b.x-(earthTreeLayout(m).left+earthTreeLayout(m).treeW*.08))<1e-8'));
  // Land below the cap on the painted wood; the stem is scenery, not a hazard.
  run('player.x=b.x+10;player.y=b.y-player.h-8;player.vy=30;player.vx=0;player.invincible=100');
  for(let f=0;f<fps;f++)run(`update(1/${fps})`);
  assert(run('player.onGround&&Math.abs(player.y+player.h-b.y)<1e-7'),'stand on supporting wood');
  for(const direction of [1,-1]){
    run(`player.x=${direction===1?'b.x+4':'b.x+b.w-player.w-4'};player.vx=0;keys.clear();keys.add('${direction===1?'ArrowRight':'ArrowLeft'}')`);
    for(let f=0;f<Math.round(fps*.28);f++){
      run(`update(1/${fps})`);
      assert(run('player.onGround&&Math.abs(player.y+player.h-b.y)<1e-7'),'walk without falling/snags');
    }
  }
  for(const side of [-1,1]){
    run(`keys.clear();player.x=${side<0?'b.x-player.w-2':'b.x+b.w+2'};player.y=b.y-player.h;player.vx=0;player.vy=0`);
    run(`update(1/${fps})`);
    assert(run('!player.onGround&&player.y+player.h>b.y'),'no invisible overhang beyond wood');
  }
  run('player.x=b.x+10;player.y=b.y+4;player.vy=-200;player.vx=0');
  run(`update(1/${fps})`);assert(run('player.vy<0'),'one-way bough has no underside snag');
  run('player.x=m.x+20;player.y=m.y-player.h-2;player.vy=100;player.vx=0');
  for(let f=0;f<8&&!run('m.spring>0');f++)run(`update(1/${fps})`);
  assert(run('m.spring>0&&player.vy<0'),'golden cap still bounces');
  assert.equal(run('lives'),3,'golden mushroom and bough remain harmless');
}
for(let i=0;i<5;i++){
  reset();
  assert(run(`{const h=earthHazards[${i}],p=earthPlatforms[earthHazardPlatforms[${i}]];Math.abs(h.y+h.h-p.y)<1e-8&&h.w===65*.88&&h.h===70*.88}`));
  run(`{const h=earthHazards[${i}];player.x=h.x+3;player.y=h.y;player.vy=0;update(1/60)}`);
  assert.equal(run('state'),'lost','red mushroom stays lethal');
  run('start();soundOn=false');
  assert.equal(run('JSON.stringify([earthPlatforms,earthMushroomBoughs,earthHazards])'),snapshot,'restart preserves anchored mushrooms and boughs');
}
for(const level of ['meadow','air','fire','water','final']){
  run(`level='${level}';resetGame()`);
  assert(run('!earthMushroomBoughs.some(b=>platforms.includes(b))'),'Wildwood-only change');
}
console.log('PASS: all five mushroom boughs, edges, walking, one-way underside, 12% scale, bounce/contact, lethal red mushrooms, restart anchoring and other-level isolation at 30/60/120 FPS.');
