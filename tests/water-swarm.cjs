const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
function reset(){run("level='water';resetGame();soundOn=false;player.x=0;player.y=0;player.vx=player.vy=0;");}
// Both species react to a stationary bunny from either side, rather than merely
// swimming along their authored oscillation. Compare with the same undisturbed run.
for(const index of [2,105])for(const side of [-1,1]){
 const positions=[];
 for(const near of [false,true]){
  reset();run(`var swimmer=waterReefSwimmers[${index}];if(${near}){player.x=swimmer.x+${side}*35-player.w/2;player.y=swimmer.y-player.h/2;}`);
  positions.push(run(`(()=>{for(let f=0;f<45;f++){waterTime+=1/60;updateWaterReefLife(1/60);}return {x:swimmer.x,y:swimmer.y};})()`));
 }
 assert((positions[1].x-positions[0].x)*side<-12,`species ${index} swims away from Benny on side ${side}`);
}
// Check fish/fish, fish/turtle, turtle/fish and turtle/turtle separation against
// the same run with that neighbour out of range (home paths remain identical).
for(const [index,other] of [[0,1],[0,105],[105,0],[105,106]]){
 const x=[];
 for(const near of [false,true]){
  reset();x.push(run(`(()=>{const c=waterReefSwimmers[${index}],other=waterReefSwimmers[${other}];other.x=c.x+${near?35:400};other.y=c.y;
   for(let f=0;f<25;f++){waterTime+=1/60;updateWaterReefLife(1/60);}return c.x;})()`));
 }
 assert(x[1]<x[0]-6,`${index} gives neighbour ${other} room`);
}
// Crowding within a school causes separation on both axes, then cohesion brings
// displaced fish home after the disturbance leaves.
reset();assert(run(`(()=>{
 const a=waterReefSwimmers[0],b=waterReefSwimmers[1];b.x=a.x;b.y=a.y;
 for(let f=0;f<90;f++){waterTime+=1/60;updateWaterReefLife(1/60);}
 return Math.hypot(a.x-b.x,a.y-b.y)>30;
})()`),'overlapping schoolmates separate');
reset();assert(run(`(()=>{
 const c=waterReefSwimmers[2];c.x+=180;c.y+=50;
 const error=()=>{const home=waterFishPath(c.school,c.index);return Math.hypot(c.x-home.x,c.y-home.y);};
 const before=error();for(let f=0;f<600;f++){waterTime+=1/60;updateWaterReefLife(1/60);}return error()<before*.35;
})()`),'fish rejoin the school instead of fleeing forever');
// A rock directly ahead requires a turn on the left or right; no straight-through route.
reset();for(const direction of [-1,1])assert(run(`(()=>{
 const c={x:2500,y:600,hw:20,hh:8,index:1,school:0,turtle:false};
 const rock={x:c.x+${direction===1?27:-57},y:570,w:30,h:60};
 const v=waterSwimmerRoute(c,${direction}*60,0,[rock]);return Math.abs(v.vy)>10||v.vx*${direction}<0;
})()`),'obstacle ahead steers around or turns back');
// Drive Benny through every school and every turtle at three frame rates. Check
// the actual live bodies, not only the nominal paths used in artwork previews.
for(const fps of [30,60,120]){
 reset();const error=run(`(()=>{
  let maxStep=0;
  for(let frame=0;frame<${fps}*12;frame++){
   const target=waterReefSwimmers[Math.floor(frame/${fps}/.11)%110];
   player.x=target.x-player.w/2+Math.sin(frame/${fps}*5)*55;player.y=target.y-player.h/2;
   const before=waterReefSwimmers.map(c=>({x:c.x,y:c.y}));waterTime+=1/${fps};updateWaterReefLife(1/${fps});
   const rocks=waterReefObstacles();
   for(let i=0;i<110;i++){
    const c=waterReefSwimmers[i],b=before[i],dx=c.x-b.x;
    if(!Number.isFinite(c.x+c.y)||!waterSwimmerClear(c,c.x,c.y,rocks))return {frame,i,c,problem:'solid collision'};
    if(Math.abs(dx)>.025&&Math.sign(dx)!==c.direction)return {frame,i,problem:'wrong facing'};
    if(Math.hypot(dx,c.y-b.y)>(c.turtle?70:125)/${fps}+.001)return {frame,i,problem:'teleport'};
   }
  }return null;
 })()`);assert.equal(error,null,JSON.stringify(error));
}
// Simulation and poses freeze while paused/dead/ad; reset clears displaced fish.
for(const state of ['map','lost','reviveAd']){
 reset();const before=run('JSON.stringify(waterReefSwimmers)');run(`state='${state}';updateWaterReefLife(.5)`);assert.equal(run('JSON.stringify(waterReefSwimmers)'),before);
}
reset();run('waterReefSwimmers[0].x+=100;resetGame()');assert(run('waterFishPose(0,0).x===waterFishPath(0,0).x'));
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// WATER_REEF_LIFE_BEGIN\n')[1].split('\n// WATER_REEF_LIFE_END')[0],fs.readFileSync('assets/water-reef-life-v1.js','utf8'));
assert.equal(html.split('// PAINTED_COIN_BEGIN\n')[1].split('\n// PAINTED_COIN_END')[0],fs.readFileSync('assets/painted-coin-v1.js','utf8'));
const coin=run('PAINTED_COIN'),png=fs.readFileSync(coin.asset);assert.equal(png[25],6);assert.equal(png.readUInt32BE(16),coin.width);assert.equal(png.readUInt32BE(20),coin.height);
assert(coin.sx+coin.sw<=coin.width&&coin.sy+coin.sh<=coin.height);
console.log('PASS live reef swarm: fish/turtles flee Benny on both sides, school separation/rejoining, obstacle turns, all live bodies/facing/speed at 30/60/120 FPS, pause/death/ad and reset.');
