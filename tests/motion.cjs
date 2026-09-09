const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,step}=require('./air.cjs');
reset();
for(const [age,vy,frame] of [[.02,-570,0],[.2,-400,1],[.6,0,2],[.9,300,3]]){
  run(`player.onGround=false;player.jumpAge=${age};player.vy=${vy}`);assert.equal(run('motionFrame()'),frame);
}
run("player.x=100;player.y=382;player.vy=0;player.onGround=true;keys.add('KeyS')");
step(1);assert.equal(run('motionFrame()'),4);assert.equal(run('player.h'),18);assert.equal(run('player.y+player.h'),440);
step(8);assert.equal(run('motionFrame()'),5);step(15);assert.equal(run('motionFrame()'),6);
run('keys.clear()');step(1);assert.equal(run('motionFrame()'),7);assert.equal(run('player.h'),58);assert.equal(run('player.y+player.h'),440);
step(25);assert.equal(run('motionFrame()'),-1);
// Visual frame and physics do not depend on direction; drawing mirrors at feet.
run('player.facing=-1;player.onGround=false;player.vy=0;player.jumpAge=.5');assert.equal(run('motionFrame()'),2);
const html=fs.readFileSync('index.html','utf8');
assert(!html.includes('__MOTION_SHEET_DATA_URL__'));
for(const m of html.matchAll(/<(?:img|script)[^>]+src="([^"]+)"/g))assert(m[1].startsWith('data:'),'External runtime source: '+m[1].slice(0,80));
const source=fs.readFileSync('assets/pink-ear-bunny-jump-duck-v3-source.png');
const embedded=Buffer.from(html.match(/motionSheet.src='data:image\/png;base64,([^']+)'/)[1],'base64');assert(source.equals(embedded));
console.log('PASS: four jump phases; duck press/hold/release; fixed feet and 18px hurtbox; direction-independent selection; embedded source identity; self-contained HTML.');
// Guard against reintroducing asymmetric crouch artwork scaling.
run("ctx.save=()=>{};ctx.restore=()=>{};ctx.globalAlpha=1;ctx.drawImage=(image,x,y,w,h)=>{ctx.lastDraw={x,y,w,h,sourceWidth:image.width,sourceHeight:image.height};};motionSprites.push(...MOTION_FRAMES.map(([x,y,w,h,ax,ay])=>({image:{width:w,height:h},ax,ay})));");
for(const frame of [4,5,6,7]){
  run(`drawNaturalPose(${frame})`);
  const d=run('ctx.lastDraw');assert(Math.abs(d.w/d.sourceWidth-d.h/d.sourceHeight)<1e-10,'Crouch must have a uniform scale');
}
run('player.duck=true;player.duckVisual=.18');assert.deepEqual(JSON.parse(run('JSON.stringify(duckPoseLayers())')),[[5,0],[6,1]]);
for(const duck of [true,false])for(const amount of [0,.03,.06,.09,.12,.15,.18]){
  run(`player.duck=${duck};player.duckVisual=${amount}`);assert(Math.abs(run('duckPoseLayers().reduce((n,p)=>n+p[1],0)')-1)<1e-10);
}
console.log('PASS: all crouch source aspect ratios retained; transition blend weights continuous; fully held pose is uncompressed frame 6.');
