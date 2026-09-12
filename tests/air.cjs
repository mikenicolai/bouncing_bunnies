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
// Recovery cloud catches a miss beside the tutorial blue.
place(480,330,150);step(50);assert.equal(run('player.y+player.h'),480);
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
// Boss sweep hurts standing, misses duck, ignores Hit entirely.
reset();place(5000,362);run('bossAwake=true;bossTime=1.4');step();assert.equal(run('lives'),2);
reset();place(5000,362);run("keys.add('KeyS');updateDuck();bossAwake=true;bossTime=1.4");step();assert.equal(run('lives'),3);assert.equal(run('player.y+player.h'),420);
run("keys.clear();updateDuck();attack()");assert(run('bossAwake'));assert.equal(run('enemies.length'),0);
reset();place(5150,362);run('bossAwake=true;bossTime=4.8');step();assert.equal(run('lives'),2);
reset();place(5350,362);run('bossAwake=true;bossTime=4.8');step();assert.equal(run('lives'),3);
// Death uses a known solid checkpoint, game over stops, restart resets.
reset();place(850,177);step(3);assert.equal(run('checkpoint.x'),845);place(1000,700);step();assert.equal(run('lives'),2);assert.equal(run('player.x'),845);
run('lives=1');place(1000,700);step();assert.equal(run('state'),'lost');run('start()');assert.equal(run('lives'),3);assert.equal(run('level'),'air');
reset();place(4800,362);
for(let i=0;i<4000&&run("state==='playing'");i++){
  run("{const b=bossPhase();keys.clear();if(b.kind==='sweep')keys.add('ArrowDown');if(!(b.kind==='slam'&&player.x+42>b.x-95&&player.x<b.x+60))keys.add('ArrowRight');}");
  step();
}
assert.equal(run('state'),'map');assert.equal(run('lives'),3);assert(run('airFinished'));assert.equal(node('#mapHeading').textContent,'Air complete!');
// Existing meadow remains selectable and resets to original geometry.
run("level='meadow';start()");assert.equal(run('platforms.length'),19);assert.equal(run('coins.length'),26);assert.equal(run('WORLD_W'),4800);
console.log('PASS: syntax; blue through/landing/recovery; spring; keyboard/touch duck; lightning; boss sweep/slam/safe lane/no combat; death/restart/win; meadow regression.');
module.exports={run,reset,place,step};
