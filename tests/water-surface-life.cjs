const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const reset=()=>run("level='water';resetGame();soundOn=false");
// Hold Up and swim strokes in every breathing chamber. The head reaches air,
// while the swimming body remains in water, even after a drowning respawn.
for(const fps of [30,60,120])for(let index=0;index<run('waterAirPockets.length');index++){
 reset();run(`var pocket=waterAirPockets[${index}];player.inWater=true;player.invincible=99;player.x=pocket.ship?WATER_SHIP_HATCHES.find(h=>h.pocket===pocket).x+45-player.w/2:pocket.x+pocket.w/2-player.w/2;player.y=pocket.ship?1120:pocket.surface+60;player.air=5;keys.add('ArrowUp')`);
 for(let frame=0;frame<fps*3;frame++){
  if(frame%fps===0)run('jump()');
  run(`update(1/${fps})`);
  assert(run('player.y>=pocket.surface-WATER_FLOAT_HEAD'),'swimming cannot lift the body into dry air');
  assert(!run('player.breaching'),'strokes cannot become air jumps inside recesses');
 }
 assert(run('waterBreathing() && player.air===WATER_AIR'),'surface contact replenishes breath');
 run('keys.clear();player.y=pocket.surface+80;player.vy=0;player.air=.001');run(`update(1/${fps})`);
 assert.equal(run('lives'),2);
 assert(run('waterBreathing()&&player.y===pocket.surface-WATER_FLOAT_HEAD'),'respawn floats at the saved waterline');
}
// The old floating position leaves the painted face submerged: no air there.
reset();run('var pocket=waterAirPockets[0];player.inWater=true;player.x=pocket.x+pocket.w/2-player.w/2;player.y=pocket.surface-30;player.air=2;update(1/60)');
assert(run('player.air<2'),'breath only refills once the head is out of the water');
// A two-minute sweep covers every school through its full oscillation.
reset();const collision=run(`(()=>{
 for(let frame=0;frame<7200;frame++)for(let school=0;school<21;school++)for(let i=0;i<5;i++){
  const p=waterFishPose(school,i,frame/60),box={x:p.x-20,y:p.y-8,w:40,h:16};
  if([...waterReefs,...waterShipSolids()].some(r=>overlap(box,r)))return {frame,school,i,p};
  for(const x of [box.x,p.x,box.x+box.w]){
   const roof=x<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,x);
   if(box.y<roof||box.y+box.h>waterFloorY(x))return {frame,school,i,p,boundary:true};
  }
 }
 return null;
})()`);
assert.equal(collision,null,JSON.stringify(collision));
assert(run('waterPlatforms[0].x<-100&&waterPlatforms[0].x+waterPlatforms[0].w===WATER_FLOOR[0][0]'),'the starting sand extends beyond the screen and still joins the shore');
// Paintings stay inside the safe swimming envelope and flora uses its own slope point.
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// WATER_REEF_LIFE_BEGIN\n')[1].split('\n// WATER_REEF_LIFE_END')[0],fs.readFileSync('assets/water-reef-life-v1.js','utf8'));
for(const [name,art] of Object.entries(run('WATER_REEF_ART'))){
 const png=fs.readFileSync(art.asset);assert.equal(png[25],6);assert.equal(png.readUInt32BE(16),art.width);assert.equal(png.readUInt32BE(20),art.height);
 for(const f of art.frames){assert(f.sx+f.sw<=art.width&&f.sy+f.sh<=art.height);if(name==='fish'){const scale=Math.min(32/f.sw,15/f.sh);assert(f.sw*scale*1.018<40&&f.sh*scale<=16,'painted fish fit the existing safe swimming box');}}
}
for(let i=0;i<92;i++)for(const kind of ['seagrass','coral']){
 const p=run(`waterReefPlantPose(${i},'${kind}')`);assert.equal(p.base,run(`waterFloorY(${p.x})`),'root base follows its own position on the slope');
 const roof=run(`${p.x}<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,${p.x})`);assert(p.base-p.height>roof,'decorations stay under the waterline and roof');
}
assert(run("waterReefPlantPose(0,'coral').base>waterReefPlantPose(0).base+10"),'the first coral sits lower on the slope instead of floating');
console.log('PASS: surface-only breathing and respawns in all cave/ship chambers at 30/60/120 FPS; fish stay clear of stone, roof and floor for two minutes; filled beach start; painted asset registration, safe fish sizes and independently rooted coral/sea grass.');
