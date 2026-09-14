const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,place}=require('./air.cjs');
const ids=run("airPlatforms.map((p,i)=>p.kind==='green'?i:-1).filter(i=>i>=0)");
assert.equal(ids.length,4);
for(const fps of [30,60,120])for(const id of ids){
 for(const fraction of [.1,.5,.9]){
  reset();run('player.invincible=100');
  place(run(`airPlatforms[${id}].x+airPlatforms[${id}].w*${fraction}-21`),run(`airPlatforms[${id}].y-player.h-.5`),150);
  run(`update(1/${fps})`);
  if(fraction===.5){assert(run('player.vy<-700'));assert(run(`airPlatforms[${id}].spring>0`));assert.equal(run(`trampolineFrame(airPlatforms[${id}])`),1);}
  else {assert.equal(run('player.vy'),0);assert(run('player.onGround'));assert.equal(run(`airPlatforms[${id}].spring`),0);}
 }
 // Walking from either grass ledge activates the pad when the bunny reaches it.
 for(const direction of [-1,1]){
  reset();run(`player.invincible=100;player.x=airPlatforms[${id}].x+airPlatforms[${id}].w*${direction===1?.12:.88}-21;player.y=airPlatforms[${id}].y-player.h;player.onGround=true;keys.add('${direction===1?'ArrowRight':'ArrowLeft'}');`);
  let bounced=false;
  for(let i=0;i<fps*2;i++){run(`update(1/${fps})`);if(run('player.vy<-700')){bounced=true;break;}}
  assert(bounced,'walking onto center pad launches the bunny');
 }
}
reset();
for(const [spring,frame] of [[.4,1],[.3,1],[.25,2],[.17,2],[.1,3],[0,0]])assert.equal(run(`trampolineFrame({spring:${spring}})`),frame);
assert(run("airPlatforms.every(p=>p.spring===0)"));
const html=fs.readFileSync('index.html','utf8');assert(fs.readFileSync('assets/trampoline-island-v1.png').equals(Buffer.from(html.match(/trampolineSheet.src='data:image\/png;base64,([^']+)'/)[1],'base64')));
console.log('PASS: four spring islands; firm grass and center-only launches; walking onto pad from both sides at 30/60/120 FPS; compression/rebound/settling; reset and embedded artwork.');
