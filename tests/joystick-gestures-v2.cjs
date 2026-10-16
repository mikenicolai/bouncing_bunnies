const assert=require('node:assert/strict'),fs=require('node:fs'),{run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// JOYSTICK_GESTURES_BEGIN\n')[1].split('\n// JOYSTICK_GESTURES_END')[0],fs.readFileSync('assets/joystick-gestures-v2.js','utf8'));
const reset=()=>run("beginDeveloperSession();level='final';resetGame();soundOn=false;platforms=[{x:0,y:470,w:9000,h:400}];player.x=100;player.y=412;player.onGround=true;player.invincible=999;joystick.active=true;joystick.pointerId=8;");
const pull=(x,y)=>run(`updateJoystick({x:JOY.x+${x}*(JOY.radius-12),y:JOY.y+${y}*(JOY.radius-12)})`);
for(const fps of [30,60,120]){
 const tick=s=>{for(let i=0;i<Math.ceil(fps*s);i++)run(`update(1/${fps})`);};
 for(const y of [-.8,-.5,0,.5,.8]){reset();pull(.95,y);tick(.2);assert(run('player.onGround&&!player.duck&&joystick.sprint'),'broad middle band permits running without jump/duck');}
 reset();pull(.85,0);assert(!run('joystick.sprint'));pull(1,0);assert(run('joystick.sprint'));pull(.8,0);assert(run('joystick.sprint'));pull(.7,0);assert(!run('joystick.sprint'));
 reset();pull(0,.89);assert(!run('player.duck'));pull(0,1);assert(run('player.duck'));pull(0,.85);assert(run('player.duck'));pull(0,.8);assert(!run('player.duck'));
 reset();pull(0,-1);assert.equal(run('player.boosts'),0);const taps=[];let previous=0;
 for(let i=0;i<Math.ceil(fps*.35);i++){run(`update(1/${fps})`);const boosts=run('player.boosts');if(boosts>previous){taps.push((i+1)/fps);previous=boosts;}}
 assert.equal(taps.length,2);assert(taps[0]>=.09&&taps[1]-taps[0]>=.09,'distinct timed pulses rather than simultaneous boost');tick(1.5);assert(run('player.onGround'));assert.equal(run('player.boosts'),0);tick(.5);assert(run('player.onGround'),'one burst per upward hold');
 reset();pull(0,-1);run('releaseJoystick({pointerId:8})');tick(.3);assert.equal(run('player.boosts'),0,'releasing cancels remaining taps');
 reset();pull(0,-1);run('openWorldMap()');tick(.4);assert(!run('joystick.jumpGesture'));
 reset();run("selectFinalWeapon('trident')");pull(0,1.25);assert(run('player.duck&&waterTrident.dash===0'),'deep down still ducks with the trident on land');
 // Every stick reach only moves/aims: the selected attack button owns dashing.
 for(const mode of ['throw','dash']){
  for(const [x,y] of [[1.25,0],[-1.5,0],[0,-1.4],[1.3,-1.3],[0,1.4]]){
   reset();run(`selectFinalWeapon('trident');waterTrident.mode='${mode}'`);pull(x,y);tick(.15);
   assert(run('waterTrident.dash===0&&waterTrident.shot===null'),'Castle stick never fires or dashes in '+mode);
  }
  run(`level='water';resetGame();player.x=2300;player.y=650;player.inWater=true;player.breaching=false;waterTrident.owned=true;waterTrident.mode='${mode}';joystick.active=true`);
  for(const [x,y] of [[1.5,0],[-1.5,0],[0,-1.5],[0,1.5],[-1.3,-1.3]]){pull(x,y);tick(.1);assert(run('waterTrident.dash===0&&waterTrident.shot===null'),'Water stick never fires or dashes in '+mode);}
 }
 reset();run("selectFinalWeapon('trident');waterTrident.mode='dash'");pull(1.25,0);run('attack()');assert(run('waterTrident.dash>0&&waterTrident.shot.dash'));const x=run('player.x');tick(.2);assert(run('player.x')>x+100);
 tick(1.5);pull(1.25,0);assert.equal(run('waterTrident.dash'),0,'holding stick cannot auto-dash on cooldown');pull(-1.25,0);run('attack()');assert(run('waterTrident.dash>0&&waterTrident.dx<0'));
 reset();run("platforms=finalPlatforms;player.x=3438;selectFinalWeapon('trident');waterTrident.mode='dash';finalMonsters=[]");pull(1.25,0);run('attack()');tick(.5);assert(run('player.x+player.w<=3480'));
 reset();run("selectFinalWeapon('trident');waterTrident.mode='dash'");pull(0,-1.25);run('attack()');assert(run('waterTrident.dash>0&&waterTrident.dy<0'));tick(.5);run('waterTrident.cooldown=0;waterTrident.shot=null;attack()');assert.equal(run('waterTrident.dash'),0,'button cannot refill the Castle air dash');
 run("level='water';resetGame();player.x=2300;player.y=650;player.inWater=true;player.breaching=false;waterTrident.owned=true;waterTrident.mode='dash';joystick.active=true");pull(-1.25,0);run('attack()');assert(run('waterTrident.dash>0&&waterTrident.dx<0'),'Water button dashes in stick direction');
}
console.log('PASS deliberate joystick: neutral movement, duck/run thresholds, sequential triple jumps, no automatic trident dash or throw at any reach in either mode/world; button dashes, cooldown/air limits and wall collision at 30/60/120 FPS.');
