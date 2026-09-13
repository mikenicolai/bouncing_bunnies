const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,place}=require('./air.cjs');
assert(run("airPlatforms.filter(p=>p.island!==undefined).length===8&&airPlatforms.filter(p=>p.island!==undefined).every(p=>p.kind==='white')"));
assert(run('descentObstacles[0].y-airPlatforms[19].y>=700'));
assert.equal(run('smallDescentClouds.length'),3);
const html=fs.readFileSync('index.html','utf8');assert(fs.readFileSync('assets/floating-islands-v1.png').equals(Buffer.from(html.match(/islandSheet.src='data:image\/png;base64,([^']+)'/)[1],'base64')));
for(const fps of [30,60,120]){
 reset();
 // Punch from outside the contact box. A press counts once, only while recovered.
 for(let hit=1;hit<=3;hit++){
  run('player.x=airMonsters[0].x-70;player.y=342;player.facing=1;player.attackCooldown=0;attack()');
  assert.equal(run('airMonsters[0].hp'),3-hit);
  if(hit<3){
   assert.equal(run('airMonsters[0].dizzy'),1.5);assert.equal(run('airMonsterFrame(airMonsters[0])'),3);
   run('player.attackCooldown=0;attack()');assert.equal(run('airMonsters[0].hp'),3-hit,'dizzy target ignores repeated hits');
   const x=run('airMonsters[0].x');
   run('player.x=airMonsters[0].x;player.airCloud=airPlatforms[6];player.vy=0');
   for(let i=0;i<fps;i++)run(`updateAirMonsters(1/${fps})`);
   assert.equal(run('airMonsters[0].x'),x);assert.equal(run('lives'),3,'dizzy monster harmless');
   run('player.x=1350');for(let i=0;i<Math.ceil(fps*.6);i++)run(`updateAirMonsters(1/${fps})`);
   assert.equal(run('airMonsters[0].dizzy'),0);
  }
 }
 run('player.x=airMonsters[0].x;player.y=342;updateAirMonsters(1)');assert.equal(run('lives'),3,'defeated monster has no contact damage');
 // Actual physics stomp, not direct calls to the damage helper.
 reset();run('player.x=airMonsters[0].x;player.y=airMonsters[0].y-player.h-5;player.vy=180');
 run(`update(1/${fps})`);for(let n=0;n<8&&!run('airMonsters[0].dizzy');n++)run(`update(1/${fps})`);
 assert.equal(run('airMonsters[0].hp'),2);assert.equal(run('lives'),3);assert(run('player.vy<0'),'stomp rebounds');
 // A second landing during dizziness must bounce without costing another heart.
 run('player.x=airMonsters[0].x;player.y=airMonsters[0].y-player.h-1;player.vy=180');run(`update(1/${fps})`);
 assert.equal(run('airMonsters[0].hp'),2);assert(run('player.vy<0'));
}
// Every cloud's bolt matches the animation's damage interval; body remains dangerous.
for(let j=0;j<7;j++)for(const [time,damaging] of [[0,false],[2.1,false],[2.28,true],[2.42,false]]){
 reset();run(`{beginDescent();const cloud=allDescentClouds[${j}],bolt=descentBolt(cloud);player.x=bolt.x;player.y=bolt.y+15;player.vy=0;airTime=${time}+3-cloud.offset;updateDescent()}`);
 assert.equal(run('lives'),damaging?2:3,`cloud ${j} bolt phase ${time}`);
}
reset();run('beginDescent();player.x=smallDescentClouds[0].x+15;player.y=smallDescentClouds[0].y+10;airTime=0;updateDescent()');assert.equal(run('lives'),2);
reset();assert(run('airMonsters.every(m=>m.hp===3&&m.dizzy===0)'));
console.log('PASS: both island variants; original solid landing geometry; lower/easier descent entry; small clouds; three-hit combat; stun immunity/recovery; real stomps and rebound at 30/60/120 FPS; all seven lightning damage phases; reset.');
