// Water's continuation: reusable two-mode trident, aqua suit and Neptunus.
// This source is embedded verbatim in index.html for the standalone game.
const WATER_TRIDENT_SPOT={x:11130,y:1110},WATER_SUIT_SPOT={x:12220,y:1380};
const WATER_RUINS_START=11850,WATER_ARENA={left:12600,right:14560,exit:14670};
const NEPTUNUS_HP=8;
let waterTrident,waterAquaSuit,neptunus,neptunusShots;
const neptunusSheet=new Image();neptunusSheet.src='assets/neptunus-v1.png';
const waterRuinsSheet=new Image();waterRuinsSheet.src='assets/ancient-water-ruins-v1.png';

function waterClamp(value,min,max){return Math.max(min,Math.min(max,value));}
function resetWaterAdventure(){
  neptunusPaintFrame=0;neptunusPreviousFrame=0;neptunusBlendAge=1;drawNeptunus.lastTime=0;
  waterTrident={owned:false,mode:'throw',cooldown:0,shot:null,dash:0,dx:1,dy:0};
  waterAquaSuit=false;neptunusShots=[];
  neptunus={x:13800,y:1130,w:120,h:220,hp:NEPTUNUS_HP,active:false,mode:'idle',age:0,
    cooldown:1.8,turn:0,facing:-1,flash:0,dizzy:0,deathAge:0,targetX:0,targetY:0};
}
function waterViewSize(){
  const scale=touchDockHeight&&W<600&&waterAquaSuit&&player.x>WATER_ARENA.left-250?.68:1;
  return {width:W/scale,height:playfieldHeight()/scale,scale};
}
function waterAdventureSolids(){
  const walls=[];
  if(neptunus.active&&neptunus.hp>0)walls.push({x:WATER_ARENA.left-65,y:680,w:55,h:820});
  if(neptunus.hp>0||neptunus.deathAge<1.6)walls.push({x:WATER_ARENA.right,y:680,w:64,h:820});
  return walls;
}
function waterAimVector(){
  let x=(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0);
  let y=(keys.has('ArrowDown')||keys.has('KeyS')?1:0)-(keys.has('ArrowUp')||keys.has('KeyW')?1:0);
  if(joystick.active&&Math.hypot(joystick.dx,joystick.dy)>.22){x=joystick.dx;y=joystick.dy;}
  if(!x&&!y)x=player.facing;
  const length=Math.hypot(x,y);return {x:x/length,y:y/length};
}
function toggleWaterTrident(){
  if(state!=='playing'||level!=='water'||!waterTrident.owned)return;
  waterTrident.mode=waterTrident.mode==='throw'?'dash':'throw';tone(560,.07,'sine',.025);
}
function fireWaterTrident(){
  const t=waterTrident;
  if(!t.owned||!player.inWater||player.breaching||t.cooldown>0||t.shot)return false;
  const direction=waterAimVector();t.dx=direction.x;t.dy=direction.y;
  t.cooldown=1.25;player.attack=.25;
  t.shot={x:player.x+player.w/2+t.dx*35,y:player.y+player.h/2+t.dy*35,
    vx:t.dx*650,vy:t.dy*650,age:0,returning:false,dash:t.mode==='dash',hit:false};
  if(t.mode==='dash'){t.dash=.65;player.vx=t.dx*720;player.vy=t.dy*720;}
  tone(t.mode==='dash'?700:480,.12,'triangle',.03);return true;
}
function stopWaterDash(){
  if(!waterTrident)return;
  if(waterTrident.dash>0){player.vx=waterTrident.dx*130;player.vy=waterTrident.dy*130;}
  waterTrident.dash=0;
  if(waterTrident.shot?.dash)waterTrident.shot.returning=true;
}
function waterPositionClear(box,solids){
  const center=box.x+box.w/2;
  return box.x>=WATER_START&&box.x+box.w<=WATER_W&&box.y>=waterSwimTopY(center,box.y)-.1
    &&box.y+box.h<=waterFloorY(center)+.1&&!solids.some(s=>overlap(box,s));
}
function moveWaterDash(dt,solids){
  const t=waterTrident,travel=Math.min(dt,t.dash),steps=Math.max(1,Math.ceil(travel*720/7));
  for(let i=0;i<steps;i++){
    const candidate={...player,x:player.x+t.dx*720*travel/steps,y:player.y+t.dy*720*travel/steps};
    if(!waterPositionClear(candidate,solids)){stopWaterDash();break;}
    player.x=candidate.x;player.y=candidate.y;
    if(i%3===0)burst(player.x+21-t.dx*25,player.y+29-t.dy*25,'#a8fff0',1);
  }
  if(t.dash>0){t.dash=Math.max(0,t.dash-travel);if(t.dash===0){player.vx=t.dx*130;player.vy=t.dy*130;t.shot.returning=true;}}
}
function hitWaterEnemy(enemy){
  if(enemy.hp<=0||enemy.dizzy>0)return false;
  enemy.hp--;enemy.dizzy=.9;if('swing'in enemy)enemy.swing=0;
  burst(enemy.x+enemy.w/2,enemy.y+enemy.h/2,'#d2fff1',12);tone(310,.1,'triangle',.025);return true;
}
function hitNeptunus(){
  const b=neptunus;if(!b.active||b.hp<=0||b.dizzy>0)return false;
  b.hp--;b.dizzy=.7;b.flash=.3;b.mode=b.hp>0?'hurt':'defeated';b.age=0;b.cooldown=1.1;
  burst(b.x+b.w/2,b.y+90,b.hp?'#ffde87':'#a5fff1',b.hp?18:48);tone(b.hp?260:145,.18,'triangle',.04);
  if(b.hp===0){neptunusShots=[];stopWaterDash();}
  return true;
}
function updateWaterTrident(dt,solids){
  const t=waterTrident;t.cooldown=Math.max(0,t.cooldown-dt);
  const shot=t.shot;if(!shot)return;
  shot.age+=dt;
  if(shot.returning){
    const dx=player.x+21-shot.x,dy=player.y+29-shot.y,d=Math.hypot(dx,dy);
    if(d<=940*dt+20){t.shot=null;return;}
    shot.x+=dx/d*940*dt;shot.y+=dy/d*940*dt;return;
  }
  const steps=Math.max(1,Math.ceil(650*dt/8));
  for(let i=0;i<steps&&!shot.returning;i++){
    if(shot.dash){shot.x=player.x+21+t.dx*40;shot.y=player.y+29+t.dy*40;}
    else{shot.x+=shot.vx*dt/steps;shot.y+=shot.vy*dt/steps;}
    const box={x:shot.x-9,y:shot.y-9,w:18,h:18};
    const center=shot.x;
    if(shot.x<WATER_START||shot.x>WATER_W||shot.y<waterCeilingY(center,shot.y)
      ||shot.y>waterFloorY(center)||solids.some(s=>overlap(box,s))){shot.returning=true;stopWaterDash();break;}
    if(!shot.hit){
      for(const enemy of [...waterSharks,...waterPirates])if(overlap(box,enemy)&&hitWaterEnemy(enemy)){shot.hit=true;break;}
      if(overlap(box,neptunus)&&hitNeptunus())shot.hit=true;
      if(shot.hit){shot.returning=true;stopWaterDash();}
    }
  }
  if(shot.age>=.9&&!shot.dash)shot.returning=true;
}
function collectWaterAdventure(){
  const close=spot=>Math.hypot(player.x+21-spot.x,player.y+29-spot.y)<57;
  if(waterGate.phase==='open'&&!waterTrident.owned&&close(WATER_TRIDENT_SPOT)){
    waterTrident.owned=true;tone(820,.2,'triangle',.04);burst(WATER_TRIDENT_SPOT.x,WATER_TRIDENT_SPOT.y,'#ffe3a3',25);
    // A one-time breath reward makes trying the new weapon possible immediately.
    player.air=WATER_AIR;
    checkpoint={x:WATER_TRIDENT_SPOT.x-21,y:WATER_TRIDENT_SPOT.y-29,water:true,trident:true};
  }
  if(!waterAquaSuit&&close(WATER_SUIT_SPOT)){
    waterAquaSuit=true;player.air=WATER_AIR;tone(940,.25,'sine',.04);burst(WATER_SUIT_SPOT.x,WATER_SUIT_SPOT.y,'#b9fff0',32);
    checkpoint={x:WATER_SUIT_SPOT.x-21,y:WATER_SUIT_SPOT.y-29,water:true,suit:true};
  }
}
function beginNeptunusAttack(){
  const b=neptunus;b.age=0;b.facing=player.x+21<b.x+b.w/2?-1:1;
  b.targetX=player.x+21;b.targetY=player.y+29;
  b.mode=['tideWarn','thrustWarn','volleyWarn'][b.turn++%3];
}
function updateNeptunus(dt){
  const b=neptunus;
  if(!b.active&&player.x>WATER_ARENA.left+80&&waterTrident.owned&&waterAquaSuit){b.active=true;tone(120,.35,'triangle',.04);}
  if(!b.active)return;
  if(b.hp<=0){b.deathAge+=dt;return;}
  b.age+=dt;b.flash=Math.max(0,b.flash-dt);b.dizzy=Math.max(0,b.dizzy-dt);
  if(b.mode==='hurt'&&b.dizzy===0){b.mode='idle';b.age=0;}
  if(b.mode==='idle'){
    b.facing=player.x+21<b.x+b.w/2?-1:1;
    if(Math.abs(player.x+21-(b.x+b.w/2))>320)b.x+=b.facing*55*dt;
    const target=waterClamp(player.y+29-b.h/2,800,1270);b.y+=(target-b.y)*Math.min(1,dt*.7);
    b.cooldown=Math.max(0,b.cooldown-dt);if(b.cooldown===0)beginNeptunusAttack();
  }else if(b.mode==='tideWarn'&&b.age>=.95){
    for(let i=0;i<3;i++)neptunusShots.push({x:b.targetX+(i-1)*60,y:waterFloorY(b.targetX)+25+i*80,vx:0,vy:-340,r:23,kind:'tide',life:3});
    b.mode='recover';b.age=0;tone(200,.16,'sine',.025);
  }else if(b.mode==='thrustWarn'&&b.age>=.9){b.mode='thrust';b.age=0;tone(430,.1,'triangle',.025);
  }else if(b.mode==='thrust'){
    b.x+=b.facing*510*dt;if(b.age>=.45){b.mode='recover';b.age=0;}
  }else if(b.mode==='volleyWarn'&&b.age>=1){
    const angle=Math.atan2(b.targetY-(b.y+b.h/2),b.targetX-(b.x+b.w/2));
    for(const offset of [-.25,0,.25])neptunusShots.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:Math.cos(angle+offset)*260,vy:Math.sin(angle+offset)*260,r:16,kind:'orb',life:4.5});
    b.mode='recover';b.age=0;tone(600,.15,'sine',.025);
  }else if(b.mode==='recover'&&b.age>=1.15){b.mode='idle';b.age=0;b.cooldown=1.15;}
  b.x=waterClamp(b.x,WATER_ARENA.left+140,WATER_ARENA.right-220);
  b.y=waterClamp(b.y,waterProfileY(WATER_ROOF,b.x)+90,waterFloorY(b.x)-b.h-35);
  const dashing=waterTrident.dash>0;
  if(!dashing&&b.dizzy===0){
    if(overlap(player,b))hurt(player.x<b.x?-1:1);
    if(b.mode==='thrust'&&overlap(player,neptunusThrustBox()))hurt(b.facing);
  }
  for(const p of neptunusShots){
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(p.life>0&&!dashing&&overlap(player,{x:p.x-p.r,y:p.y-p.r,w:p.r*2,h:p.r*2})){hurt(p.vx<0?-1:1);p.life=0;}
    if(p.y<waterProfileY(WATER_ROOF,p.x)+p.r||p.x<WATER_ARENA.left||p.x>WATER_ARENA.right||p.y>waterFloorY(p.x)+240)p.life=0;
  }
  neptunusShots=neptunusShots.filter(p=>p.life>0);
}
function neptunusThrustBox(){const b=neptunus;return{x:b.facing<0?b.x-195:b.x+b.w-10,y:b.y+92,w:205,h:36};}

// The small weapons and suit are continuous Canvas art, matching the game's item style.
function drawWaterTrident(x,y,size=74,angle=0,alpha=1){
  ctx.save();ctx.translate(x-cameraX,y);ctx.rotate(angle);ctx.scale(size/74,size/74);ctx.globalAlpha*=alpha;
  ctx.strokeStyle='#25465d';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(25,0);ctx.moveTo(17,-14);ctx.quadraticCurveTo(7,-14,11,0);ctx.quadraticCurveTo(7,14,17,14);ctx.moveTo(17,-14);ctx.lineTo(35,-14);ctx.moveTo(25,0);ctx.lineTo(39,0);ctx.moveTo(17,14);ctx.lineTo(35,14);ctx.stroke();
  ctx.strokeStyle='#efd38a';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#aaffee';
  for(const [px,py]of[[39,0],[35,-14],[35,14]]){ctx.beginPath();ctx.moveTo(px+5,py);ctx.lineTo(px-5,py-4);ctx.lineTo(px-5,py+4);ctx.closePath();ctx.fill();}
  ctx.strokeStyle='#64dccc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-22,-3);ctx.lineTo(-22,3);ctx.moveTo(-16,-3);ctx.lineTo(-16,3);ctx.stroke();ctx.restore();
}
function drawAquaSuit(x,y,size=70){
  ctx.save();ctx.translate(x-cameraX,y);ctx.scale(size/70,size/70);ctx.lineWidth=3;ctx.strokeStyle='#26495b';
  const suit=ctx.createLinearGradient(-18,-8,19,32);suit.addColorStop(0,'#89f3d9');suit.addColorStop(1,'#268fab');ctx.fillStyle=suit;
  ctx.beginPath();ctx.roundRect(-18,-5,36,32,10);ctx.fill();ctx.stroke();
  for(const side of[-1,1]){ctx.beginPath();ctx.roundRect(side<0?-24:13,21,12,18,5);ctx.fill();ctx.stroke();}
  ctx.fillStyle='rgba(176,246,255,.25)';ctx.beginPath();ctx.arc(0,-21,20,0,7);ctx.fill();ctx.strokeStyle='#f0d194';ctx.lineWidth=4;ctx.stroke();
  ctx.strokeStyle='#e9fff5';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-2,-24,12,3.5,4.9);ctx.stroke();
  ctx.fillStyle='#ffe3a0';ctx.beginPath();ctx.ellipse(0,10,6,7,0,0,7);ctx.fill();ctx.restore();
}
function waterItemPedestal(spot,label){
  const x=spot.x-cameraX,y=spot.y+52;ctx.fillStyle='#648d93';ctx.strokeStyle='#305267';ctx.lineWidth=3;
  ctx.fillStyle='#466d7b';ctx.fillRect(x-27,y+8,54,Math.max(26,waterFloorY(spot.x)-y));ctx.fillStyle='#648d93';
  ctx.beginPath();ctx.roundRect(x-42,y,84,26,6);ctx.fill();ctx.stroke();
  ctx.fillStyle='#b1cfc0';ctx.fillRect(x-36,y-3,72,6);ctx.fillStyle='#edfbe0';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText(label,x,spot.y-57);
}
function drawWaterRuins(){
  if(cameraX+W<WATER_RUINS_START-200)return;
  if(waterRuinsSheet.complete&&waterRuinsSheet.naturalWidth){
    for(const [x,width,height,alpha]of[[11830,1500,610,.72],[13370,1450,730,.65]]){
      ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(waterRuinsSheet,x-cameraX,waterFloorY(x+width/2)-height+height*33/887,width,height);ctx.restore();
    }
  }
  // An aura distinguishes each pickup from the decorative temple stones.
  if(!waterTrident.owned){waterItemPedestal(WATER_TRIDENT_SPOT,'TRIDENT');drawWaterTrident(WATER_TRIDENT_SPOT.x,WATER_TRIDENT_SPOT.y+Math.sin(waterTime*2)*4,92,-.65);}
  if(!waterAquaSuit){waterItemPedestal(WATER_SUIT_SPOT,'AQUA SUIT · BREATHE UNDERWATER');drawAquaSuit(WATER_SUIT_SPOT.x,WATER_SUIT_SPOT.y+Math.sin(waterTime*2)*4,78);}
}
function drawWaterAdventure(){
  // The trident sits just after the gate, before the first temple arch.
  if(cameraX+W>=WATER_GATE.exitX-100&&cameraX+W<WATER_RUINS_START-200&&!waterTrident.owned){waterItemPedestal(WATER_TRIDENT_SPOT,'TRIDENT');drawWaterTrident(WATER_TRIDENT_SPOT.x,WATER_TRIDENT_SPOT.y+Math.sin(waterTime*2)*4,92,-.65);}
  drawWaterRuins();drawNeptunus();
  for(const p of neptunusShots){
    const x=p.x-cameraX;ctx.fillStyle=p.kind==='tide'?'#80f7df':'#b3fff1';ctx.strokeStyle='#268fb1';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(x,p.y,p.r,0,7);ctx.fill();ctx.stroke();ctx.strokeStyle='#f0fff5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x-3,p.y-3,p.r*.6,3.3,5);ctx.stroke();
  }
  if(neptunus.active&&neptunus.hp>0){
    ctx.fillStyle='rgba(114,246,226,.25)';ctx.fillRect(WATER_ARENA.left-65-cameraX,680,55,820);
  }
  const exit=WATER_ARENA.right-cameraX;
  ctx.strokeStyle=neptunus.hp<=0&&neptunus.deathAge>=1.6?'#c2ffdc':'#dfa65b';ctx.lineWidth=6;
  ctx.beginPath();ctx.ellipse(exit+40,1270,50,135,0,0,7);ctx.stroke();
  if(neptunus.hp>0||neptunus.deathAge<1.6){ctx.fillStyle='rgba(66,106,121,.7)';ctx.fillRect(exit,680,64,820);}
  ctx.fillStyle='#e0fff1';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText(neptunus.hp>0?'DEFEAT NEPTUNUS':'WATER EXIT',exit+32,1100);
  const t=waterTrident;if(t.shot){drawWaterTrident(t.shot.x,t.shot.y,65,Math.atan2(t.shot.vy,t.shot.vx),t.shot.returning?.65:1);}
}
function drawHeldWaterEquipment(){
  if(!player.inWater||player.invincible>0&&Math.floor(player.invincible*12)%2===0)return;
  const x=player.x+21,y=player.y+29;
  if(waterAquaSuit){
    // Keep the bunny's face and pink ears readable through a transparent dive helmet.
    ctx.save();ctx.translate(x-cameraX,y);ctx.scale(player.facing,1);
    ctx.fillStyle='#319fa6';ctx.strokeStyle='#24566a';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-19,-9,24,22,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#efd899';ctx.fillRect(-8,-7,3,18);
    ctx.fillStyle='rgba(185,255,242,.10)';ctx.beginPath();ctx.ellipse(10,-14,21,21,0,0,7);ctx.fill();ctx.strokeStyle='#aadfd9';ctx.stroke();
    ctx.strokeStyle='rgba(241,255,255,.85)';ctx.beginPath();ctx.arc(10,-14,16,3.5,4.7);ctx.stroke();ctx.restore();
  }
  if(waterTrident.owned&&!waterTrident.shot)drawWaterTrident(x+player.facing*18,y+17,42,player.facing<0?Math.PI+.35:-.35);
}
function drawWaterAdventureHUD(){
  if(level!=='water')return;
  const t=waterTrident;
  if(t.owned){
    const x=20,y=H>540?194:171;ctx.fillStyle='rgba(13,42,65,.84)';roundRect(x,y,230,45,10);
    ctx.fillStyle='#b3fff1';ctx.font='bold 12px system-ui';ctx.textAlign='left';ctx.fillText(`TRIDENT · ${t.mode.toUpperCase()}${t.shot?(t.shot.returning?' · RETURNING':' · IN FLIGHT'):''}`,x+12,y+18);
    ctx.fillStyle='#d8e9e7';ctx.font='11px system-ui';ctx.fillText('Z: switch · X/F: use · arrows: aim',x+12,y+34);
  }
  const b=neptunus;if(!b.active||b.hp<=0)return;
  const zoom=waterViewSize().scale;
  const x=waterClamp((b.x+b.w/2-cameraX)*zoom,100,W-100),y=waterClamp((b.y-cameraY-32)*zoom,110,playfieldHeight()-38);
  ctx.fillStyle='rgba(13,42,65,.8)';roundRect(x-90,y-23,180,47,12);ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillStyle='#ffe3a0';ctx.fillText('NEPTUNUS',x,y-6);
  for(let i=0;i<NEPTUNUS_HP;i++){
    const hx=x-66+i*19,hy=y+7;ctx.fillStyle=i<b.hp?'#ff8e91':'#456477';ctx.beginPath();ctx.moveTo(hx,hy+7);ctx.bezierCurveTo(hx-15,hy-2,hx-8,hy-12,hx,hy-5);ctx.bezierCurveTo(hx+8,hy-12,hx+15,hy-2,hx,hy+7);ctx.fill();
  }
}
// Atlas registration is populated from the final transparent painted sheet.
const NEPTUNUS_FRAMES=[
  [0,18,443,460,215], [414,56,478,422,667], [857,107,513,371,1125], [1318,0,456,480,1537],
  [0,523,374,320,236], [371,521,634,323,758], [927,464,404,380,1180], [1327,545,447,330,1539]
].map(([x,y,w,h,anchorX])=>({x,y,w,h,anchorX}));
// Source silhouettes are isolated before blending so neighbouring cloak tips do not leak into a pose.
const NEPTUNUS_CLIPS=[
  [[0,18],[405,18],[405,255],[443,285],[443,478],[0,478]],
  [[414,56],[848,56],[848,242],[892,242],[892,478],[540,478],[540,270],[414,205]],
  [[857,107],[1318,107],[1318,230],[1370,270],[1370,478],[996,478],[996,235],[857,208]],
  [[1318,0],[1774,0],[1774,480],[1420,480],[1390,270],[1335,145],[1318,90]],
  null,
  [[371,558],[590,521],[900,521],[900,612],[1005,650],[1005,844],[600,844],[530,689],[371,690]],
  [[927,464],[1331,464],[1331,844],[1040,844],[1040,640],[1010,610],[927,590]],
  null
];
function makeNeptunusPainter(){
  const painter=new window.WoodBossAnimation.PaintedPoseBlend(neptunusSheet,NEPTUNUS_FRAMES,false);
  const original=painter.frame.bind(painter);
  painter.frame=function(index){
    if(this.frames[index])return this.frames[index];
    const clip=NEPTUNUS_CLIPS[index];if(!clip)return original(index);
    const b=this.bounds[index],c=document.createElement('canvas');c.width=this.surface.width;c.height=this.surface.height;
    const paint=c.getContext('2d');paint.imageSmoothingEnabled=true;paint.imageSmoothingQuality='high';paint.beginPath();
    clip.forEach(([x,y],i)=>{const px=this.left+x-b.anchorX,py=this.baseline+y-b.y-b.h;i?paint.lineTo(px,py):paint.moveTo(px,py);});paint.closePath();paint.clip();
    paint.drawImage(this.image,b.x,b.y,b.w,b.h,this.left-(b.anchorX-b.x),this.baseline-b.h,b.w,b.h);
    return this.frames[index]=c;
  };
  return painter;
}
let neptunusPaint=null,neptunusPaintFrame=0,neptunusPreviousFrame=0,neptunusBlendAge=1;
function drawNeptunus(){
  const b=neptunus;if(b.x-cameraX>W+300||b.x-cameraX<-400)return;
  if(b.mode.endsWith('Warn')){
    ctx.save();ctx.strokeStyle='#ffdf94';ctx.lineWidth=3;ctx.setLineDash?.([10,9]);
    if(b.mode==='tideWarn'){ctx.fillStyle='rgba(255,175,97,.22)';ctx.fillRect(b.targetX-100-cameraX,waterProfileY(WATER_ROOF,b.targetX),200,820);ctx.beginPath();ctx.moveTo(b.targetX-cameraX,waterFloorY(b.targetX));ctx.lineTo(b.targetX-cameraX,waterProfileY(WATER_ROOF,b.targetX));}
    else{ctx.beginPath();ctx.moveTo(b.x+b.w/2-cameraX,b.y+b.h/2);ctx.lineTo(b.mode==='thrustWarn'?b.x+b.w/2+b.facing*450-cameraX:b.targetX-cameraX,b.mode==='thrustWarn'?b.y+b.h/2:b.targetY);}
    ctx.stroke();ctx.restore();
  }
  if(!neptunusSheet.complete||!neptunusSheet.naturalWidth||!NEPTUNUS_FRAMES.length)return;
  if(!neptunusPaint)neptunusPaint=makeNeptunusPainter();
  let frame=b.hp<=0?7:b.mode==='hurt'?6:b.mode==='thrust'?5:b.mode==='thrustWarn'?4:b.mode.endsWith('Warn')?3:b.mode==='idle'&&b.active?[0,1,2,1][Math.floor(waterTime*4)%4]:0;
  if(frame!==neptunusPaintFrame){neptunusPreviousFrame=neptunusPaintFrame;neptunusPaintFrame=frame;neptunusBlendAge=0;}
  // Blend time follows active play, including previews and paused stills.
  neptunusBlendAge=Math.min(1,neptunusBlendAge+Math.max(0,waterTime-(drawNeptunus.lastTime||waterTime))/.12);drawNeptunus.lastTime=waterTime;
  const blend=neptunusBlendAge*neptunusBlendAge*(3-2*neptunusBlendAge);
  const opacity=b.hp<=0?Math.max(0,1-b.deathAge/2.4):b.flash>0?.7:1;
  neptunusPaint.draw(ctx,neptunusPreviousFrame,frame,blend,b.x+b.w/2-cameraX,b.y+b.h+12,300,b.facing,opacity);
}
