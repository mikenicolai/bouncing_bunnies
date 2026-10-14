const fs=require('node:fs'),assert=require('node:assert/strict'),{run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// TURTLE_ANIMATION_BEGIN\n')[1].split('\n// TURTLE_ANIMATION_END')[0],fs.readFileSync('assets/turtle-animation-v1.js','utf8'));
for(const mode of ['walk','swim']){const b=fs.readFileSync(run(`TURTLE_ANIMATION.${mode}.asset`));assert.equal(b.readUInt32BE(16),1536);assert.equal(b.readUInt32BE(20),1024);assert.equal(b[25],6,'native transparent PNG');}
for(const fps of [30,60,120]){
 run("beginDeveloperSession();level='earth';resetGame();soundOn=false;player.invincible=99");for(let i=0;i<fps;i++)run(`update(1/${fps})`);
 assert(Math.abs(run('earthTurtle.cycle')-48/54)<1e-10,'walk cadence follows travel distance');assert(run('turtleAnimationLayers(earthTurtle.cycle).frame>0'));
 const frozen=run('earthTurtle.cycle');run('state="map";update(1)');assert.equal(run('earthTurtle.cycle'),frozen);
 run('state="playing";earthTurtle.speed=0;update(1)');assert.equal(run('earthTurtle.cycle'),frozen,'stationary land turtle does not skate its feet');run('earthTurtle.speed=48;resetGame()');assert.equal(run('earthTurtle.cycle'),0);
 run("level='water';resetGame();player.x=90;player.inWater=false;player.onGround=true;player.invincible=99");const before=run('waterTurtlePose(0).cycle');for(let i=0;i<fps;i++)run(`update(1/${fps})`);assert.notEqual(run('waterTurtlePose(0).cycle'),before,'swimming strokes animate while Benny is on shore');assert(!run('player.inWater'));
 const pose=run('JSON.stringify(waterTurtlePose(0))');run('state="map";update(1)');assert.equal(run('JSON.stringify(waterTurtlePose(0))'),pose);
}
for(let i=0;i<48;i++){const layer=run(`turtleAnimationLayers(${i}/48)`);assert(layer.frame>=0&&layer.frame<6&&layer.next>=0&&layer.next<6&&layer.mix>=0&&layer.mix<=1);}
assert.equal(run('turtleAnimationLayers(.999).next'),0,'last pose blends back to first');
console.log('PASS six-pose native turtle sheets, distance-based walking cadence, stopped/paused/reset animation, shore-visible swimming and smooth loop at 30/60/120 FPS.');
