const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
run(`level='fire';resetGame();var draws=[],translations=[],rotations=[];
ctx.save=ctx.restore=ctx.scale=()=>{};ctx.translate=(...v)=>translations.push(v);ctx.rotate=v=>rotations.push(v);ctx.drawImage=(...v)=>draws.push(v);
for(const [name,s] of Object.entries(PAINTED_BUNNY))for(const gear of ['plain','quiver']){s[gear].complete=true;s[gear].naturalWidth=name.startsWith('four')?1774:1536;s[gear].naturalHeight=name.startsWith('four')?887:1024;}
var icons=0;drawArrowIcon=()=>icons++;
`);
// Every run frame draws a complete painting, mirrored uniformly, with gear chosen by inventory.
for(const mode of ['king','maze','secondVolcano','volcano'])for(const owned of [false,true])for(const facing of [-1,1]){
 const cells=new Set(),four=['secondVolcano','volcano'].includes(mode);
 for(let f=0;f<8;f++){
  run(`fireMode='${mode}';fireArrow.owned=${owned};fireArrow.aiming=false;Object.assign(player,{x:${mode==='volcano'?3300:8260},y:0,onGround:true,vx:${facing*260},facing:${facing},run:${f+.1},attack:0,duck:false,duckVisual:0,invincible:0,landingPaint:0});draws=[];translations=[];rotations=[];icons=0;drawBunny()`);
  assert.equal(run('draws.length'),1);assert.equal(run('icons'),0,'quiver is painted into the body, not a loose icon');
  assert(run(`draws[0][0]===PAINTED_BUNNY.${four?'fourRun':'uprightRun'}.${owned?'quiver':'plain'}`));
  cells.add(run("draws[0].slice(1,3).join(',')"));
  const scale=four?.225:76/390;
  assert(Math.abs(run('draws[0][7]/draws[0][3]')-scale)<1e-10);assert(Math.abs(run('draws[0][8]/draws[0][4]')-scale)<1e-10);
  assert.equal(run('rotations.length'),four?1:0);
  if(four)assert.equal(run('rotations[0]'),run('Math.atan(fireSlopeGrade(player.x+21))*player.facing'));
 }
 assert.equal(cells.size,8,'all eight poses receive equal time');
}
// Idle, crouch and punch carry the same painted equipment in every state.
for(const owned of [false,true])for(const [setup,name,frame] of [
 ['player.vx=0','actions',0],['player.duck=true;player.duckVisual=.18','actions',3],
 ['player.attack=.18','actions',5],['player.attack=.09','actions',6],['player.attack=.02','actions',7]
]){
 run(`fireMode='king';fireArrow.owned=${owned};Object.assign(player,{onGround:true,vx:260,attack:0,duck:false,duckVisual:0,invincible:0,landingPaint:0});${setup};draws=[];drawBunny()`);
 assert.equal(run('draws.length'),1);assert(run(`draws[0][0]===PAINTED_BUNNY.${name}.${owned?'quiver':'plain'}`));
 assert.equal(run('paintedBunnyPose().frame'),frame);
}
// A real jump traverses all eight paintings without delaying takeoff or changing its arc.
for(const fps of [30,60,120])for(const slope of [false,true]){
 run(`level='fire';resetGame();fireMode='${slope?'secondVolcano':'king'}';fireArrow.owned=true;fireArrow.aiming=false;fireStoneClock=999;player.x=${slope?8110:10360};player.y=fireSlopeY(player.x+21)-58;player.onGround=true;player.vx=260;keys.add('ArrowRight');jump();`);
 assert(!run('player.onGround'));assert(run('player.vy<0'));
 const frames=new Set([run('paintedJumpFrame()')]);let landed=false;
 for(let i=0;i<fps*1.3;i++){
  run(`update(1/${fps})`);
  if(!run('player.onGround')||run('player.landingPaint>0'))frames.add(run('paintedJumpFrame()'));
  if(run('player.onGround'))landed=true;
 }
 assert(landed);assert.deepEqual([...frames].sort(),[0,1,2,3,4,5,6,7],`${fps} FPS ${slope?'slope':'flat'} jump`);
}
// The apex remains relative to the slope, while the entire airborne painting is upright.
run("fireMode='secondVolcano';player.x=8260;player.vx=260;player.vy=fireSlopeGrade(8281)*260;player.onGround=false;player.jumpAge=.3;player.landingPaint=0;player.attack=0;player.duck=false;player.duckVisual=0;player.invincible=0;fireArrow.owned=true");assert.equal(run('paintedJumpFrame()'),3);
run('draws=[];rotations=[];drawBunny()');assert(run('draws[0][0]===PAINTED_BUNNY.uprightJump.quiver'));assert.equal(run('rotations.length'),0);
// Equipping switches to the quivered archer; Z stows it and restores the painted jumping bunny.
run("fireMode='king';player.x=10360;player.y=-558;player.onGround=true;fireArrow.aiming=false;fireArcherySheet.complete=true;fireArcherySheet.naturalWidth=1774;fireArcherySheet.naturalHeight=887;var armed=0,originalArmed=drawArmedBunny;drawArmedBunny=()=>armed++;toggleFireAim();drawBunny()");assert.equal(run('armed'),1);run('jump()');assert(run('player.onGround'));
run("window.listeners.keydown[1]({code:'KeyZ',repeat:false,preventDefault(){}});drawArmedBunny=originalArmed;draws=[];jump();drawBunny()");assert.equal(run('draws.length'),1);assert(run('draws[0][0]===PAINTED_BUNNY.uprightJump.quiver'));
run('player.invincible=1;draws=[];drawBunny()');assert.equal(run('draws.length'),0,'damage blink includes the quiver');
run("player.invincible=0;level='meadow';draws=[];drawBunny()");assert(run('draws[0][0]===PAINTED_BUNNY.uprightJump.plain'),'other elements never gain a quiver');
// Assets have matching dimensions and real alpha channels, and the practice page uses production code.
for(const stance of ['upright','four'])for(const move of ['run','jump']){
 const dims=[];for(const gear of ['plain','quiver']){const p=`assets/bunny-painted-${stance}-${move}-${gear}-v1.png`,b=fs.readFileSync(p);assert.equal(b[25],6,'RGBA PNG');dims.push([b.readUInt32BE(16),b.readUInt32BE(20)]);}assert.deepEqual(dims[0],dims[1]);
}
const review=fs.readFileSync('previews/painted-game-test.html','utf8');assert(review.includes('../index.html?v=2026100508'));assert(review.includes('i.decode()'));assert(!review.includes('update('),'test page does not replace or double-drive physics');
// One common transform makes every complete pose and its bow/quiver 70% size, with the feet planted.
run('var artScales=[];ctx.scale=(...v)=>artScales.push(v)');
for(const mode of ['king','volcano','dropper','maze'])for(const owned of [false,true]){
 run(`level='fire';fireMode='${mode}';fireArrow.owned=${owned};fireArrow.aiming=false;Object.assign(player,{x:3300,y:100,facing:1,onGround:${mode!=='dropper'},vx:260,attack:0,duck:false,duckVisual:0,landingPaint:0});translations=[];artScales=[];drawBunny()`);
 assert.equal(run('artScales[0][0]'),.7);assert.equal(run('artScales[0][1]'),.7);
 assert.equal(run('translations[0][0]'),run('player.x+player.w/2-cameraX'));assert.equal(run('translations[0][1]'),run('player.y+player.h'));
 assert.equal(run('translations[1][0]'),-run('translations[0][0]'));assert.equal(run('translations[1][1]'),-run('translations[0][1]'));
}
run("ctx.beginPath=ctx.moveTo=ctx.lineTo=ctx.stroke=()=>{};fireMode='king';fireArrow.owned=true;fireArrow.aiming=true;fireArrow.angle=0;artScales=[];drawBunny()");assert.equal(run('artScales[0][0]'),.7);
assert.equal(run('arrowOrigin().x'),run('player.x+player.w/2+48*.7'));assert.equal(run('arrowOrigin().y'),run('player.y+player.h-35*.7'));
console.log('PASS complete painted runtime: both inventory variants, eight equal run frames, full jump/landing cycle at 30/60/120 FPS, slope/facing/cropping, idle/crouch/punch, Z equip/stow, damage blink, paired PNGs and live practice page.');
