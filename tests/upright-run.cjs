const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
run("level='fire';resetGame();fireArrow.owned=true;uprightRunSheet.complete=true;uprightRunSheet.naturalWidth=1774;uprightRunSheet.naturalHeight=887;var draws=[],translations=[],rotations=0;ctx.save=ctx.restore=ctx.scale=()=>{};ctx.translate=(...v)=>translations.push(v);ctx.rotate=()=>rotations++;ctx.drawImage=(...v)=>draws.push(v);var savedIcon=drawArrowIcon;drawArrowIcon=()=>{};");
// All eight cells are used with the same aspect ratio and body scale in either direction.
for(const facing of [-1,1]){
 const seen=new Set();
 for(let f=0;f<8;f++){
  run(`fireMode='king';Object.assign(player,{x:10380,y:-558,vx:${facing*260},facing:${facing},onGround:true,attack:0,duck:false,run:${(f+.1)/1.6}});draws=[];translations=[];rotations=0;drawBunny()`);
  assert.equal(run('draws.length'),1);assert(run('draws[0][0]===uprightRunSheet'));seen.add(run("draws[0].slice(1,3).join(',')"));
  assert.equal(run('rotations'),0,'upright torso stays upright');
  assert(Math.abs(run('draws[0][7]/draws[0][3]-UPRIGHT_RUN_SCALE'))<1e-10);assert(Math.abs(run('draws[0][8]/draws[0][4]-UPRIGHT_RUN_SCALE'))<1e-10);
  assert.equal(run('JSON.stringify(translations[0])'),run('JSON.stringify(translations[1])'),'arrow and body share their anchor');
 }
 assert.equal(seen.size,8);
}
// The support foot follows uphill/downhill terrain without rotating the entire upright body.
for(const facing of [-1,1])for(let f=0;f<8;f++){
 run(`fireMode='secondVolcano';player.x=8260;player.y=fireSlopeY(8281)-58;player.facing=${facing};player.vx=${facing*260};player.run=${(f+.1)/1.6};draws=[];translations=[];rotations=0;drawBunny()`);
 assert.equal(run('rotations'),0);
 assert.equal(run('translations[0][1]'),run('fireSlopeY(8281+(UPRIGHT_RUN_POSES[uprightRunFrame()].foot-UPRIGHT_RUN_POSES[uprightRunFrame()].anchor[0])*UPRIGHT_RUN_SCALE*player.facing)'));
 assert.equal(run('JSON.stringify(translations[0])'),run('JSON.stringify(translations[1])'));
}
// Running never replaces jump, crouch, punch or equipped aiming poses.
for(const setup of ['player.onGround=false','player.duck=true','player.attack=.18','fireArrow.aiming=true']){
 run('player.onGround=true;player.duck=false;player.attack=0;fireArrow.aiming=false;'+setup);assert(!run('uprightRunMode()'));
}
run("fireArrow.aiming=false;player.onGround=false;player.jumpAge=.2;player.vx=260;player.vy=fireSlopeGrade(8281)*260;player.duck=false;player.duckVisual=0;player.attack=0");assert.equal(run('motionFrame()'),2,'jump apex uses velocity relative to the hill');
run('drawArrowIcon=savedIcon');
console.log('PASS upright run: eight distinct atlas cells, uniform size, facing, feet and arrow anchors on flat ground/slopes, upright torso, preserved jump/crouch/punch/aiming and slope-relative apex.');
