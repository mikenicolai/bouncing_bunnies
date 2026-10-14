// The tower opens onto a sword fight, then an untouchable story reveal.
const FINAL_KNIGHT_ROOM={width:1400,floor:470,door:1280};
const finalKnightPlatforms=[{x:0,y:470,w:1400,h:1800,kind:'castle'},
  {x:-30,y:-800,w:30,h:1270,kind:'castle'},{x:1400,y:-800,w:30,h:1270,kind:'castle'}];
const finalKnightSheet=new Image();finalKnightSheet.src='assets/castle-knight-v1.png';
const finalKnightThrowSheet=new Image();finalKnightThrowSheet.src='assets/castle-knight-throw-v1.png';
const crownedBunnySheet=new Image();crownedBunnySheet.src='assets/crowned-bunny-v1.png';
const throneRoomSheet=new Image();throneRoomSheet.src='assets/castle-throne-room-v1.png';
let finalChapter='castle',finalKnight,finalRevealTime=0,finalRoomFade=0;
function resetFinalChapter(){
  finalChapter='castle';finalRevealTime=0;finalRoomFade=0;
  finalKnight={x:850,y:354,w:72,h:116,hp:10,maxHP:10,facing:-1,phase:'guard',age:0,dizzy:0,cooldown:1.3,turn:0,sword:null,defeated:false,deathAge:0};
}
function enterFinalKnightRoom(){
  if(finalChapter!=='castle')return;
  clearInputs();clearFinalWeaponHazards();bunnyArrows=[];
  finalChapter='knight';finalTowerEntered=false;WORLD_W=FINAL_KNIGHT_ROOM.width;platforms=finalKnightPlatforms;
  checkpoint={x:90,y:412,castleRoom:'knight'};
  Object.assign(player,{x:90,y:412,vx:0,vy:0,onGround:true,h:58,duck:false,duckVisual:0,jumpAge:9,boosts:0,invincible:2});
  cameraX=0;cameraY=touchDockHeight?phoneGroundCameraY():0;finalRoomFade=.7;
  fireArrow.aiming=false;tone(220,.3,'triangle',.04);
}
function calmFinalKnight(){
  if(finalChapter!=='knight'||finalKnight.defeated)return;
  Object.assign(finalKnight,{phase:'guard',age:0,dizzy:1.2,cooldown:1.8,sword:null});
}
function hitFinalKnight(){
  const b=finalKnight;if(finalChapter!=='knight'||b.defeated||b.dizzy>0)return false;
  b.hp=Math.max(0,b.hp-1);b.dizzy=.8;b.phase='hurt';b.age=0;b.cooldown=1.1;b.sword=null;
  burst(b.x+b.w/2,b.y+55,'#e2d2ae',14);tone(180,.12,'triangle',.035);
  if(b.hp===0){b.defeated=true;b.phase='defeated';b.deathAge=0;clearFinalWeaponHazards();bunnyArrows=[];tone(440,.35,'triangle',.04);}
  return true;
}
function finalKnightSwordBox(){
  const b=finalKnight;
  return{x:b.facing>0?b.x+b.w-8:b.x-100,y:FINAL_FLOOR-92,w:108,h:36};
}
function throwFinalKnightSword(){
  const b=finalKnight,x=b.x+b.w/2+b.facing*50,y=FINAL_FLOOR-75;
  const dx=player.x+21-x,dy=player.y+player.h/2-y,d=Math.hypot(dx,dy)||1;
  b.sword={x,y,ox:x,oy:y,vx:dx/d*660,vy:dy/d*660,age:0,returning:false,spin:0};
  b.phase='throw';b.age=0;tone(570,.12,'triangle',.025);
}
function updateFinalKnightSword(dt){
  const b=finalKnight,s=b.sword;if(!s)return;
  const old={x:s.x,y:s.y};s.age+=dt;s.spin+=dt*15;
  if(s.returning){
    const dx=b.x+b.w/2-s.x,dy=FINAL_FLOOR-75-s.y,d=Math.hypot(dx,dy);
    if(d<=800*dt+18){b.sword=null;b.phase='recover';b.age=0;return;}
    s.x+=dx/d*800*dt;s.y+=dy/d*800*dt;
  }else{s.x+=s.vx*dt;s.y+=s.vy*dt;}
  if(arrowSegmentEntry(old,s,player,12)!==null)hurt(player.x<b.x?-1:1);
  if(!s.returning&&(s.age>=.7||finalKnightPlatforms.some(p=>arrowSegmentEntry(old,s,p,12)!==null)))s.returning=true;
}
function updateFinalKnightRoom(dt){
  finalTime+=dt;finalRoomFade=Math.max(0,finalRoomFade-dt);
  updateFireArchery(dt);updateFinalWeapons(dt);
  const b=finalKnight;
  if(b.defeated){
    b.deathAge+=dt;
    if(player.onGround&&player.x+player.w/2>FINAL_KNIGHT_ROOM.door+20)enterFinalThroneRoom();
    return;
  }
  // The inner doorway stays shut until the knight is defeated, even while dashing.
  if(player.x+player.w>FINAL_KNIGHT_ROOM.door){player.x=FINAL_KNIGHT_ROOM.door-player.w;player.vx=0;}
  updateFinalKnightSword(dt);
  if(b.dizzy>0){b.dizzy=Math.max(0,b.dizzy-dt);return;}
  const distance=player.x+21-(b.x+b.w/2);b.age+=dt;b.cooldown=Math.max(0,b.cooldown-dt);
  if(b.phase==='hurt'){b.phase='guard';b.age=0;}
  if(b.phase==='guard'){
    b.facing=Math.sign(distance)||b.facing;
    if(Math.abs(distance)>138&&(b.cooldown>0||Math.abs(distance)>=640))b.x=Math.max(170,Math.min(1150,b.x+b.facing*80*dt));
    if(Math.abs(distance)<640&&b.cooldown===0){b.phase=Math.abs(distance)>230||b.turn%2?'throwWindup':'windup';b.turn++;b.age=0;tone(260,.14,'triangle',.015);}
  }else if(b.phase==='windup'&&b.age>=.5){b.phase='slash';b.age=0;}
  else if(b.phase==='throwWindup'&&b.age>=.45)throwFinalKnightSword();
  else if(b.phase==='slash'){
    const old=b.x;b.x=Math.max(170,Math.min(1150,b.x+b.facing*340*dt));
    const sword=finalKnightSwordBox();sword.x=Math.min(sword.x,sword.x-(b.x-old));sword.w+=Math.abs(b.x-old);
    if(overlap(player,sword))hurt(player.x<b.x?-1:1);
    if(b.age>=.24){b.phase='recover';b.age=0;}
  }else if(b.phase==='recover'&&b.age>=.85){b.phase='guard';b.age=0;b.cooldown=.45;}
  if(overlap(player,b))hurt(player.x<b.x?-1:1);
}
function enterFinalThroneRoom(){
  if(finalChapter!=='knight'||!finalKnight.defeated)return false;
  clearInputs();clearFinalWeaponHazards();bunnyArrows=[];particles=[];
  finalChapter='throne';finalRevealTime=0;state='finalReveal';cameraX=0;cameraY=0;
  tone(165,.4,'triangle',.04);return true;
}
function updateFinalReveal(dt){
  finalRevealTime+=dt;
  if(finalRevealTime>=12&&state==='finalReveal'){
    state='finalEnding';overlay.inert=false;
    overlay.querySelector('.kicker').textContent='THE BUNNY ON THE THRONE';
    overlay.querySelector('h2').textContent='To be continued';
    overlay.querySelector('.card > p:not(.kicker):not(.controls-copy)').textContent='The crown. The familiar face. Every enemy at his side. Your journey has only just begun.';
    overlay.querySelector('.controls-copy').hidden=true;startButton.textContent='Play the castle again';overlay.classList.remove('hidden');
  }
}
// Anchors register each painted foot rather than snapping the cape or sword to its bounding box.
const KNIGHT_ANCHORS=[[207,495],[239,495],[147,495],[207,483],[241,483],[242,475]];
function drawKnightPose(frame,x,floor,facing=1,height=154){
  if(!finalKnightSheet.complete||!finalKnightSheet.naturalWidth)return;
  const sw=finalKnightSheet.naturalWidth/3,sh=finalKnightSheet.naturalHeight/2,scale=height/440;
  const [ax,ay]=KNIGHT_ANCHORS[frame];ctx.save();ctx.translate(x,floor);ctx.scale(facing,1);
  ctx.drawImage(finalKnightSheet,frame%3*sw,Math.floor(frame/3)*sh,sw,sh,-ax*scale,-ay*scale,sw*scale,sh*scale);ctx.restore();
}
function drawKnightThrowPose(frame,x,floor,facing){
  if(!finalKnightThrowSheet.complete||!finalKnightThrowSheet.naturalWidth)return;
  const sw=finalKnightThrowSheet.naturalWidth/3,sh=finalKnightThrowSheet.naturalHeight,scale=154/614,ax=[355,360,420][frame];
  ctx.save();ctx.translate(x,floor);ctx.scale(facing,1);ctx.drawImage(finalKnightThrowSheet,frame*sw,0,sw,sh,-ax*scale,-666*scale,sw*scale,sh*scale);ctx.restore();
}
function drawFinalKnightSword(){
  const s=finalKnight.sword;if(!s||!finalKnightSheet.naturalWidth)return;
  ctx.save();ctx.translate(s.x-cameraX,s.y);ctx.rotate(s.spin);ctx.drawImage(finalKnightSheet,1300,234,236,84,-43,-15,86,30);ctx.restore();
}
function drawFinalKnight(){
  const b=finalKnight,frame=b.defeated?5:b.dizzy>0?4:['windup','throwWindup'].includes(b.phase)?1:b.phase==='slash'?2:b.phase==='recover'?3:0;
  ctx.save();ctx.translate(b.x+b.w/2-cameraX,FINAL_FLOOR);
  if(!b.defeated)ctx.scale(1,1+Math.sin(finalTime*2)*.007);
  if(b.sword)drawKnightThrowPose(b.age<.22?1:0,0,0,b.facing);else drawKnightPose(frame,0,0,b.facing);ctx.restore();
  drawFinalKnightSword();
  if(['windup','throwWindup'].includes(b.phase)&&!b.defeated&&b.dizzy===0){
    const r=finalKnightSwordBox();ctx.save();ctx.fillStyle=`rgba(255,185,87,${.13+.15*Math.sin(finalTime*18)**2})`;roundRect(r.x-cameraX,FINAL_FLOOR-8,r.w,8,4);
    ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffd695';ctx.fillText('!',b.x+b.w/2-cameraX,b.y-55);ctx.restore();
  }
}
function drawFinalKnightHUD(){
  const b=finalKnight,w=Math.min(280,W-24),x=(W-w)/2,y=H>540?90:75;
  ctx.save();ctx.fillStyle='rgba(28,20,35,.88)';roundRect(x,y,w,54,13);ctx.textAlign='center';ctx.fillStyle='#f7dcac';ctx.font='bold 12px system-ui';ctx.fillText(b.defeated?'KNIGHT DEFEATED · DOOR OPEN':'THE CROWN’S SWORD',W/2,y+18);
  ctx.font='bold 17px system-ui';for(let i=0;i<10;i++){ctx.fillStyle=i<b.hp?'#f6a08c':'#655360';ctx.fillText('♥',W/2+(i-4.5)*20,y+40);}ctx.restore();
}
function renderFinalKnightRoom(){
  const field=playfieldHeight();ctx.save();ctx.beginPath();ctx.rect(0,0,W,field);ctx.clip();ctx.fillStyle='#222332';ctx.fillRect(0,0,W,field);ctx.translate(0,-cameraY);
  if(finalHallSheet.complete&&finalHallSheet.naturalWidth)ctx.drawImage(finalHallSheet,-cameraX,-207,1400,933);
  finalKnightPlatforms.forEach(p=>drawFinalPlatform(p));
  for(const [x,y] of [[266,173],[551,270],[822,273],[1144,173]])drawFinalTorch(x-cameraX,y);
  // A dark closed door receives the same upward-opening motion as the main castle.
  if(!finalKnight.defeated){ctx.fillStyle='rgba(15,17,28,.68)';roundRect(1280-cameraX,75,120,395,6);}
  else{ctx.fillStyle='rgba(240,197,114,.1)';ctx.fillRect(1280-cameraX,75,120,395);}
  drawFinalKnight();drawFireAimPath();drawBunnyArrows();drawBunny();drawFinalWeapons();
  particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*1.8);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cameraX,p.y,p.r,0,7);ctx.fill();});ctx.globalAlpha=1;
  if(finalRoomFade>0){ctx.fillStyle=`rgba(12,14,26,${finalRoomFade/.7})`;ctx.fillRect(0,cameraY,W,field);}
  ctx.restore();drawHUD();drawFinalKnightHUD();drawFinalWeaponInventory();drawTouchControls();
}
function drawCourtCell(sheet,cols,rows,frame,x,floor,height,facing=1){
  if(!sheet?.complete||!sheet.naturalWidth)return;
  const sw=sheet.naturalWidth/cols,sh=sheet.naturalHeight/rows;
  ctx.save();ctx.translate(x,floor);ctx.scale(facing,1);ctx.drawImage(sheet,frame%cols*sw,Math.floor(frame/cols)*sh,sw,sh,-height*sw/sh/2,-height,height*sw/sh,height);ctx.restore();
}
function drawFinalCourt(t){
  const idle=Math.floor(t*.8)%2,floor=800;
  // Every familiar enemy stands at floor level, five on either side of the throne.
  if(meadowZombieSheet.complete&&meadowZombieSheet.naturalWidth){meadowZombiePaint ||=new WoodBossAnimation.PaintedPoseBlend(meadowZombieSheet,measureMeadowZombieAtlas(meadowZombieSheet),false);meadowZombiePaint.draw(ctx,4,4,0,90,floor,130,-1,1);}
  drawCourtCell(earthGoblinSheet,4,3,idle,215,floor,140,1);
  drawCourtCell(pirateSheet,4,2,idle,335,floor,150,1);
  if(neptunusSheet.complete&&neptunusSheet.naturalWidth){neptunusPaint ||=makeNeptunusPainter();neptunusPaint.draw(ctx,0,0,0,470,floor,190,1,1);}
  drawCourtCell(tempestSheet,4,2,0,585,floor+5+Math.sin(t)*2,135,1);
  if(airMonsterSprites.length)ctx.drawImage(airMonsterSprites[idle],910,660+Math.sin(t*2)*1.5,112,140);
  woodBossRenderer.pose(ctx,'giant','giantIdle',t,1085,floor,180,-1);
  if(lavaKingSheet.complete&&lavaKingSheet.naturalWidth){const [ax,ay]=LAVA_KING_ART.anchors[0],s=.40;ctx.save();ctx.translate(1220,floor+Math.sin(t*1.4)*1.5);ctx.scale(-1,1);ctx.drawImage(lavaKingSheet,0,0,lavaKingSheet.naturalWidth/4,lavaKingSheet.naturalHeight/2,-ax*s,-ay*s,lavaKingSheet.naturalWidth/4*s,lavaKingSheet.naturalHeight/2*s);ctx.restore();}
  if(fireZombieSprites.length)ctx.drawImage(fireZombieSprites[idle],1285,660+Math.sin(t*2+1)*1.5,105,140);
  drawKnightPose(0,1435,floor,-1,140);
}
function renderFinalReveal(){
  const field=playfieldHeight(),t=finalRevealTime,scale=Math.min(W/1536,field/1024),x=(W-1536*scale)/2,y=(field-1024*scale)/2;
  ctx.save();ctx.fillStyle='#10131f';ctx.fillRect(0,0,W,H);ctx.translate(x,y);ctx.scale(scale,scale);
  if(throneRoomSheet.complete&&throneRoomSheet.naturalWidth)ctx.drawImage(throneRoomSheet,0,0,1536,1024);
  for(const [tx,ty] of [[153,441],[397,461],[642,502],[890,502],[1137,461],[1384,441]]){ctx.save();ctx.globalAlpha=.55;drawFinalTorch(tx,ty,t);ctx.restore();}
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,(t-1.5)/2));drawFinalCourt(t);ctx.restore();
  if(crownedBunnySheet.complete&&crownedBunnySheet.naturalWidth){
    const sw=crownedBunnySheet.naturalWidth/2,sh=crownedBunnySheet.naturalHeight/2,cycle=t%8;
    // Brief cross-fades register the feet while breathing, blinking and commanding.
    const frame=cycle>6.6?3:cycle>4.4?2:cycle>3.1&&cycle<3.32?1:0;
    const changes=[[3.1,0,1],[3.32,1,0],[4.4,0,2],[6.6,2,3],[0,3,0]];
    const change=changes.find(([at])=>cycle>=at&&cycle<at+.16);
    const layers=change?[[change[1],1-(cycle-change[0])/.16],[change[2],(cycle-change[0])/.16]]:[[frame,1]];
    const s=.44;ctx.save();ctx.translate(768,716);ctx.scale(1,1+Math.sin(t*1.5)*.007);
    for(const [f,alpha] of layers){const ay=f<2?612:602;ctx.globalAlpha=alpha;ctx.drawImage(crownedBunnySheet,f%2*sw,Math.floor(f/2)*sh,sw,sh,-370*s,-ay*s,sw*s,sh*s);}ctx.restore();
  }
  // Benny stops at the foot of the throne: recognizable small hero versus rounder ruler.
  if(characterSprites.length){const s=characterSprites[0],a=CHARACTER_ANCHORS[0],k=.28;ctx.drawImage(s,-a[0]*k+690,-a[1]*k+915,s.width*k,s.height*k);}
  ctx.fillStyle=`rgba(9,11,20,${Math.max(0,1-t/.9)})`;ctx.fillRect(0,0,1536,1024);ctx.restore();
  ctx.save();ctx.textAlign='center';
  if(t>5){ctx.globalAlpha=Math.min(1,(t-5)/2);ctx.fillStyle='#ffe4ad';ctx.shadowColor='#080912';ctx.shadowBlur=10;ctx.font=`bold ${Math.min(36,W*.064)}px Georgia`;ctx.fillText('To be continued',W/2,field-25);}
  else{ctx.fillStyle='#ead8bb';ctx.font=`bold ${Math.min(18,W*.04)}px system-ui`;ctx.fillText('Beyond the tower…',W/2,Math.max(25,y-10));}ctx.restore();
}
