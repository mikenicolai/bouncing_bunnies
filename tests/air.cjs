const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{width:960,height:540,hidden:false,style:{setProperty(){},removeProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false;}},listeners:{},addEventListener(n,f){(this.listeners[n]??=[]).push(f);},setAttribute(){},focus(){},blur(){},getContext(){return {};},getBoundingClientRect(){return {x:0,y:0,left:0,top:0,width:960,height:540};},querySelector(s){return node(id+s);},setPointerCapture(){}});return nodes.get(id);}
const window=node('window');window.scrollTo=()=>{};
const sandbox={document:{querySelector:node,querySelectorAll:()=>[],addEventListener(n,f){node('document').addEventListener(n,f);},documentElement:node('root')},window,Image:class{},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},location:{search:''},URLSearchParams,Math,console};
vm.createContext(sandbox);vm.runInContext(script,sandbox);
const run=s=>vm.runInContext(s,sandbox);
run("soundOn=false;level='air';resetGame();");
const reset=()=>run("level='air';resetGame();");
function place(x,y,vy=0){run(`player.blueContact=null;player.x=${x};player.y=${y};player.vx=0;player.vy=${vy};player.onGround=false;`);}
function step(n=1){for(let i=0;i<n;i++)run('update(1/120)');}
// Blue: upward pass, then descending landing on its exact top.
place(300,370,-570);step(15);assert(run('player.y<335 && player.vy<0'));
place(300,250,200);step(20);assert(run('player.blueContact'));assert(run('player.y+player.h>=335'));
// The removed recovery platform no longer catches misses beside the tutorial blue.
assert(run('!platforms.includes(airPlatforms[2])'));
place(480,330,150);step(50);assert(run('player.y+player.h>480'));
// Spring bounce and feedback; duck hitbox preserves feet and blocks jumping.
place(650,350,100);step(12);assert(run('player.vy<-700'));assert(run('airPlatforms[3].spring>0'));
reset();place(100,382);step(2);run("keys.add('ArrowDown');updateDuck()");assert.equal(run('player.h'),18);assert.equal(run('player.y+player.h'),440);run('jump()');assert.equal(run('player.vy'),0);
run("keys.clear();updateDuck()");assert.equal(run('player.h'),58);assert.equal(run('player.y+player.h'),440);
// Touch hold and cancellation feed the real installed pointer listeners.
const canvas=node('#game');const event={clientX:150,clientY:380,pointerId:44,preventDefault(){}};
canvas.listeners.pointerdown[0](event);assert.equal(run('player.h'),18);assert.equal(run('duckPointer'),44);
canvas.listeners.pointercancel[0](event);assert.equal(run('player.h'),58);assert.equal(run('duckPointer'),null);
// Lightning is telegraphed, costs exactly one life during immunity.
reset();run('airTime=1.9');assert.equal(run('stormPhase(storms[0])'),'warn');
place(1460,342);run('airTime=2.28');step();assert.equal(run('lives'),2);run('player.x=1460;player.y=342;player.vy=0');step();assert.equal(run('lives'),2);
// Tempest has no arena-wide rectangles. Contact still hurts, and the wind
// column prevents jumping over it before or after the survival opening.
assert(!html.includes('function bossPhase()'));
reset();place(5000,-1748);run('bossAwake=true;bossTime=5');step();assert.equal(run('lives'),3);
reset();run('bossAwake=true;bossTime=0;updateTempest(0)');place(run('tempest.x+20'),-1880);run('updateTempest(0)');assert.equal(run('lives'),2,'jumping above Tempest enters the wind column');
reset();run('bossAwake=true;bossTime=29.9;updateTempest(0)');place(run('tempest.x+20'),-1748);run("keys.add('KeyS');updateDuck();updateTempest(0)");assert.equal(run('lives'),2,'crouching under Tempest is unsafe before 30 seconds');
reset();run('bossAwake=true;bossTime=31;updateTempest(0)');place(run('tempest.x+20'),-1748);run("keys.add('KeyS');updateDuck();updateTempest(0)");assert.equal(run('lives'),3,'after 30 seconds the tail stays high enough to crawl under');
run('keys.clear();updateDuck();updateTempest(0)');assert.equal(run('lives'),2,'standing under the lifted tail is unsafe');
for(const fps of [30,60,120]){
  reset();run("bossAwake=true;bossTime=31;updateTempest(0);player.x=tempest.x-player.w-5;player.y=airPlatforms[19].y-player.h;player.onGround=true;player.airCloud=airPlatforms[19];keys.add('ArrowDown');keys.add('ArrowRight')");
  for(let frame=0;frame<fps*8;frame++)run(`update(1/${fps})`);
  assert.equal(run('lives'),3,`crawling beneath Tempest stays safe at ${fps} FPS`);
  assert(run('player.x>tempest.x+tempest.w+100'),`the bunny can pass Tempest at ${fps} FPS`);
}
// A landed punch stuns the boss before contact can trigger retaliation.
reset();run('bossAwake=true;bossTime=0;updateTempest(0)');
run("player.x=tempest.x-72;player.y=tempest.y+45;player.facing=1;attack();player.x=tempest.x+10;updateTempest(0)");
assert.equal(run('tempest.hp'),4);assert.equal(run('lives'),3);
run('updateTempest(1)');assert.equal(run('lives'),3,'stun gives time to move away');
run('updateTempest(.6)');assert.equal(run('lives'),2,'body contact becomes dangerous when stun ends');
// One punch per recovery window removes one of the five displayed hearts.
reset();run('bossAwake=true;bossTime=0;updateTempest(0)');
for(let hit=1;hit<=5;hit++){
  run("player.x=tempest.x-72;player.y=tempest.y+45;player.facing=1;player.attackCooldown=0;tempest.dizzy=0;attack()");
  assert.equal(run('tempest.hp'),5-hit);
  if(hit<5){run('player.attackCooldown=0;attack()');assert.equal(run('tempest.hp'),5-hit,'repeated punches during stun do not count');}
}
assert.equal(run('tempest.hp'),0);
// Death uses a known solid checkpoint, game over stops, restart resets.
reset();place(850,177);step(3);assert.equal(run('checkpoint.x'),845);place(1000,700);step();assert.equal(run('lives'),2);assert.equal(run('player.x'),845);
run('lives=1');place(1000,700);step();assert.equal(run('state'),'lost');run('start()');assert.equal(run('lives'),3);assert.equal(run('level'),'air');
reset();place(4800,-1748);run('tempest.hp=0');
for(let i=0;i<4000&&run("state==='playing'&&!descentStarted");i++){
  run("keys.clear();keys.add('ArrowRight')");
  step();
}
assert.equal(run('state'),'playing');assert.equal(run('lives'),3);assert(run('descentStarted'));
place(6300,660,100);step(20);assert(run('descentBlueReached'));place(6760,1710,100);step(5);
assert.equal(run('state'),'map');assert(run('airFinished'));assert.equal(node('#mapHeading').textContent,'Air complete!');
// Existing meadow remains selectable and resets to original geometry.
run("level='meadow';start()");assert.equal(run('platforms.length'),19);assert.equal(run('coins.length'),26);assert.equal(run('WORLD_W'),4800);
// M opens the map immediately and pauses the current level for testing.
run("window.listeners.keydown[1]({code:'KeyM',repeat:false,preventDefault(){}})");
assert.equal(run('state'),'map');assert.equal(node('#worldMap').hidden,false);
assert.equal(run('mapReturnState'),'playing');
assert(!html.includes('const airSigns='),'Air tutorial panels should be absent');
console.log('PASS: syntax; blue cloud; spring; duck; lightning; Tempest contact, 30-second crouch opening and safe first hit; descent/win; meadow regression.');
module.exports={run,reset,place,step};
