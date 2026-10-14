// Castle loadout: four earned weapons, shared selection and safe land dashes.
const FINAL_WEAPONS=['bow','trident','knives','stars'],FINAL_LAND_DASH_TIME=.34;
let finalWeapon='bow',finalDashAirUsed=false;
function resetFinalWeapons(){
  finalWeapon='bow';finalDashAirUsed=false;
  waterTrident.owned=true;waterTrident.cyber=true;waterTrident.mode='dash';
  earthKnives.slots.forEach(k=>Object.assign(k,{state:'ready',remaining:0}));
  windStars.owned=true;windStars.slots=windStars.slots.slice(0,2);
}
function selectFinalWeapon(name){
  if(level!=='final'||state!=='playing'||!FINAL_WEAPONS.includes(name))return false;
  stopWaterDash();finalWeapon=name;
  fireArrow.aiming=name==='bow'&&fireArrow.owned&&!player.duck;
  earthKnives.equipped=name==='knives';windStars.equipped=name==='stars';
  joystick.jumpGesture=null;player.attack=0;tone(480,.08,'triangle',.02);return true;
}
function cycleFinalWeapon(){return selectFinalWeapon(FINAL_WEAPONS[(FINAL_WEAPONS.indexOf(finalWeapon)+1)%4]);}
function toggleFinalWeapon(){
  if(level!=='final'||state!=='playing')return;
  if(finalWeapon==='bow')toggleFireAim();
  else if(finalWeapon==='trident'){waterTrident.mode=waterTrident.mode==='dash'?'throw':'dash';tone(560,.07,'triangle',.025);}
  else if(finalWeapon==='knives')earthKnives.equipped=!earthKnives.equipped;
  else windStars.equipped=!windStars.equipped;
}
function clearFinalWeaponHazards(){
  stopWaterDash();waterTrident.shot=null;finalDashAirUsed=false;
  for(const k of [...earthKnives.slots,...windStars.slots])if(k.state==='flying')k.state='returning';
}
function finalSolids(){return finalChapter==='knight'?[...finalKnightPlatforms,...(finalKnight.defeated?[]:[{x:FINAL_KNIGHT_ROOM.door,y:-800,w:120,h:1270}])]:[...finalPlatforms.filter(p=>!p.collapsed),{...FINAL_GATE,y:FINAL_GATE.y-FINAL_GATE.h*finalGateLift}];}
function moveFinalDash(dt){
  const t=waterTrident,travel=Math.min(dt,t.dash),steps=Math.max(1,Math.ceil(travel*WATER_TRIDENT_DASH_SPEED/7));
  const solids=finalSolids();player.onGround=false;player.jumpAge=9;player.boosts=2;
  for(let i=0;i<steps;i++){
    const feet=player.y+player.h;
    const next={...player,x:player.x+t.dx*WATER_TRIDENT_DASH_SPEED*travel/steps,y:player.y+t.dy*WATER_TRIDENT_DASH_SPEED*travel/steps};
    const landing=solids.find(p=>p.oneWay&&t.dy>0&&feet<=p.y+1&&next.y+next.h>=p.y&&next.x+next.w>p.x&&next.x<p.x+p.w);
    if(landing){next.y=landing.y-next.h;player.x=next.x;player.y=next.y;player.onGround=true;if(landing.crumble&&landing.crackAge<0)landing.crackAge=0;stopWaterDash();break;}
    if(next.x<0||next.x+next.w>WORLD_W||solids.some(p=>!p.oneWay&&overlap(next,p))){stopWaterDash();break;}
    player.previousFeet=feet;player.x=next.x;player.y=next.y;
    if(finalChapter==='knight'){if(overlap(player,finalKnight))hitFinalKnight();}else for(const m of finalMonsters)if(m.alive&&overlap(player,m))hitFinalMonster(m);
    if(i%3===0)burst(player.x+21-t.dx*25,player.y+29-t.dy*25,'#a8fff0',1);
  }
  if(t.dash>0){t.dash=Math.max(0,t.dash-travel);if(t.dash===0){player.vx=t.dx*130;player.vy=t.dy*130;if(t.shot)t.shot.returning=true;}}
  if(Math.abs(t.dy)<.01&&solids.some(p=>Math.abs(player.y+player.h-p.y)<1&&player.x+player.w>p.x&&player.x<p.x+p.w))player.onGround=true;
  if(player.onGround)player.vy=0;
}
function finalProjectileHit(old,shot){
  const hit=arrowFirstCollision(old,shot);
  if(hit){shot.x=old.x+(shot.x-old.x)*hit.t;shot.y=old.y+(shot.y-old.y)*hit.t;if(hit.kind==='castleMonster')hitFinalMonster(hit.target);else if(hit.kind==='finalKnight')hitFinalKnight();burst(shot.x,shot.y,'#acede2',5);}
  return !!hit;
}
function returnFinalProjectile(shot,dt,speed=1000){
  const dx=player.x+21-shot.x,dy=player.y+29-shot.y,d=Math.hypot(dx,dy);
  if(d<=speed*dt+18)return true;
  shot.x+=dx/d*speed*dt;shot.y+=dy/d*speed*dt;return false;
}
function updateFinalWeapons(dt){
  const t=waterTrident;t.cooldown=Math.max(0,t.cooldown-dt);
  if(player.onGround&&t.dash===0)finalDashAirUsed=false;
  if(t.shot){
    const shot=t.shot;shot.age+=dt;
    if(shot.returning){if(returnFinalProjectile(shot,dt,WATER_TRIDENT_RETURN_SPEED))t.shot=null;}
    else if(shot.dash){shot.x=player.x+21+t.dx*40;shot.y=player.y+29+t.dy*40;}
    else{const old={x:shot.x,y:shot.y};shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(finalProjectileHit(old,shot)||shot.age>=.7)shot.returning=true;}
  }
  for(const k of [...earthKnives.slots,...windStars.slots]){
    if(k.state==='ready'||k.state==='hidden')continue;
    k.spin+=dt*12;k.age+=dt;
    if(k.state==='returning'){if(returnFinalProjectile(k,dt)){k.state='ready';k.remaining=0;}continue;}
    const old={x:k.x,y:k.y};k.x+=k.vx*dt;
    if(finalProjectileHit(old,k)||k.age>=.8)k.state='returning';
  }
}
function finalWeaponButtons(){const x=W<650?12:75,y=W<650?152:94;return FINAL_WEAPONS.map((name,i)=>({name,x:x+i*62,y,w:60,h:60}));}
function drawFinalWeaponInventory(){
  if(level!=='final')return;
  const buttons=finalWeaponButtons(),first=buttons[0];ctx.save();ctx.fillStyle='rgba(20,26,37,.9)';roundRect(first.x-4,first.y-4,252,84,10);
  for(const b of buttons){
    const selected=finalWeapon===b.name;ctx.fillStyle=selected?'#4a665b':'#293444';roundRect(b.x,b.y,b.w,b.h,8);
    if(selected){ctx.strokeStyle='#ffe3a0';ctx.lineWidth=2;ctx.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);}
    const x=b.x+30,y=b.y+23;
    if(b.name==='bow')drawArrowIcon(x,y,45,0,'normal');else if(b.name==='trident')drawWaterTrident(x+cameraX,y,50,-.4);else if(b.name==='knives')drawEarthKnife(x,y,34,-.4);else drawWindStar(x,y,30,.2);
    ctx.fillStyle='#fff2ce';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(b.name.toUpperCase(),x,b.y+52);
  }
  const status=finalWeapon==='bow'?`ARROWS ${fireArrow.ammo.filter(Boolean).length}/5 · Z ${fireArrow.aiming?'STOW':'EQUIP'}`:finalWeapon==='trident'?`Z ${waterTrident.mode==='dash'?'THROW':'DASH'} · X ${waterTrident.mode.toUpperCase()}`:finalWeapon==='knives'?`${earthKnives.slots.filter(k=>k.state==='ready').length}/3 · X ${earthKnives.equipped?'THROW':'HIT'} · Z ${earthKnives.equipped?'STOW':'EQUIP'}`:`${windStars.slots.filter(k=>k.state==='ready').length}/${windStars.slots.length} · X ${windStars.equipped?'THROW':'HIT'} · Z ${windStars.equipped?'STOW':'EQUIP'}`;
  ctx.font='bold 9px system-ui';ctx.fillText(`O CHOOSE · ${status}`,first.x+122,first.y+74);ctx.restore();
}
function drawFinalWeapons(){
  for(const k of earthKnives.slots)if(k.state==='flying'||k.state==='returning')drawEarthKnife(k.x-cameraX,k.y,40,k.spin);
  for(const k of windStars.slots)if(k.state==='flying'||k.state==='returning')drawWindStar(k.x-cameraX,k.y,40,k.spin);
  if(waterTrident.shot){const s=waterTrident.shot;drawWaterTrident(s.x,s.y,72,Math.atan2(s.vy,s.vx));}
  if(finalWeapon==='trident'&&!waterTrident.shot)drawWaterTrident(player.x+21+player.facing*18,player.y+35,58,player.facing<0?Math.PI+.35:-.35);
  if(finalWeapon==='knives')drawHeldEarthKnife();if(finalWeapon==='stars')drawHeldWindStar();
}
