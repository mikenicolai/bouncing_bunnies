const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
assert.equal(fs.readFileSync('index.html','utf8').split('// CASTLE_ARSENAL_BEGIN\n')[1].split('\n// CASTLE_ARSENAL_END')[0],fs.readFileSync('assets/castle-arsenal-v1.js','utf8'));
const reset=()=>run("meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();soundOn=false;finalGateLift=1;finalMonsters=[];player.x=3600;player.y=412;player.onGround=true;player.vx=player.vy=0;");
for(const fps of [30,60,120]){
 reset();assert(run('fireArrow.owned&&waterTrident.owned&&earthKnivesOwned()&&windStars.owned'));assert.equal(run('finalWeapon'),'bow');
 for(const name of ['trident','knives','stars','bow']){run("window.listeners.keydown[1]({code:'KeyO',repeat:false,preventDefault(){}})");assert.equal(run('finalWeapon'),name);}
 run("window.listeners.keydown[1]({code:'KeyO',repeat:true,preventDefault(){}})");assert.equal(run('finalWeapon'),'bow','holding O does not cycle repeatedly');
 run("state='map';cycleFinalWeapon()");assert.equal(run('finalWeapon'),'bow');run("state='playing'");
 // All four attack paths hit real Castle enemies, with terrain first-contact checks.
 for(const weapon of ['bow','trident','knives','stars'])for(const kind of ['zombie','goblin','pirate','air','lava']){
  reset();run(`finalMonsters=[{...freshMeadowZombie([3800,398,3800,3800],0),kind:'${kind}',x:3800,y:398,w:54,h:72,hp:3,maxHP:3,alive:true,dizzy:0,phase:0,swing:0,swingCooldown:99,min:3800,max:3800,patrolDir:1}];selectFinalWeapon('${weapon}');fireArrow.ammo=Array(5).fill('normal');fireArrow.angle=0;waterTrident.mode='throw';attack()`);
  for(let i=0;i<fps*.5;i++)run(`updateFireArchery(1/${fps});updateFinalWeapons(1/${fps})`);
  assert.equal(run('finalMonsters[0].hp'),2,weapon+' hits '+kind);
 }
 for(const weapon of ['knives','stars']){
  reset();run(`selectFinalWeapon('${weapon}');toggleFinalWeapon();finalMonsters=[{x:3650,y:398,w:54,h:72,hp:2,alive:true,dizzy:0,phase:0}];attack()`);assert.equal(run('finalMonsters[0].hp'),1,'stowing '+weapon+' restores punches');
 }
 // Land dashes are normalized, shorter, collide through a sweep, and cannot chain in air.
 for(const [dx,dy] of [[1,0],[-1,0],[0,-1],[.707,-.707],[0,1]]){
  reset();run(`player.x=5100;selectFinalWeapon('trident');keys.clear();joystick.active=true;joystick.dx=${dx};joystick.dy=${dy};`);const x=run('player.x'),y=run('player.y');assert(run('fireWaterTrident()'));
  for(let i=0;i<Math.ceil(fps*.34);i++)run(`moveFinalDash(1/${fps});updateFinalWeapons(1/${fps})`);
  const distance=run(`Math.hypot(player.x-${x},player.y-${y})`);if(dy<=0)assert(Math.abs(distance-244.8)<1,JSON.stringify({dx,dy,fps,distance}));else assert(distance<8,'downward dash stops on the floor');
  if(dy<0){run('waterTrident.cooldown=0;waterTrident.shot=null');assert(!run('fireWaterTrident()'),'only one air dash per landing');assert.equal(run('player.boosts'),2);}
 }
 reset();run("selectFinalWeapon('trident');finalMonsters=[{x:3710,y:398,w:54,h:72,hp:2,alive:true,dizzy:0,phase:0}];keys.add('ArrowRight');fireWaterTrident()");for(let i=0;i<fps*.34;i++)run(`moveFinalDash(1/${fps});updateFinalWeapons(1/${fps})`);assert.equal(run('finalMonsters[0].hp'),1,'swept dash body deals damage once');
 reset();run("player.x=2950;finalGateLift=0;selectFinalWeapon('trident');keys.add('ArrowRight');fireWaterTrident()");for(let i=0;i<fps*.34;i++)run(`moveFinalDash(1/${fps});updateFinalWeapons(1/${fps})`);assert(run('player.x+player.w<=FINAL_GATE.x'),'dash never tunnels through a closed gate');
 reset();run("selectFinalWeapon('knives');attack();var spentKnife=earthKnives.slots[0];selectFinalWeapon('stars')");assert.equal(run('spentKnife.state'),'flying');for(let i=0;i<fps*2;i++)run(`updateFinalWeapons(1/${fps})`);assert.equal(run('spentKnife.state'),'ready','in-flight weapon keeps updating after switching');
 reset();run("selectFinalWeapon('trident');keys.add('ArrowUp');fireWaterTrident();state='map';var frozenDash=waterTrident.dash;update(.2)");assert.equal(run('waterTrident.dash'),run('frozenDash'));
}
assert.equal(run('WATER_TRIDENT_DASH_TIME'),.68);
console.log('PASS Castle arsenal: O/select/pause/repeat guards, four typed weapons against all five monster kinds, returning off-selection projectiles, directional land dash range/damage/gate sweep and one air dash per landing at 30/60/120 FPS.');
