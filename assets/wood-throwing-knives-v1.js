// Three individually discoverable knives on a lower bough beneath Wildwood's final tree route.
const EARTH_KNIFE_RETURN=5;
const earthKnifeLedge={x:6420,y:-1400,w:215,h:26,kind:'branch',id:25,oneWay:true,secret:true,spring:0};
const EARTH_KNIFE_SPOTS=[6475,6540,6605].map(x=>({x,y:earthKnifeLedge.y-28}));
let earthKnives={equipped:false,slots:[]};
function resetEarthKnives(){earthKnives={equipped:false,slots:EARTH_KNIFE_SPOTS.map(p=>({...p,state:'hidden',remaining:0,vx:0,age:0,spin:0}))};}
function earthKnivesOwned(){return earthKnives.slots.some(k=>k.state!=='hidden');}
function toggleEarthKnives(){if(level==='earth'&&earthKnivesOwned()&&state==='playing'){earthKnives.equipped=!earthKnives.equipped;tone(420,.07,'triangle',.025);}}
function collectEarthKnives(){
  for(const k of earthKnives.slots)if(k.state==='hidden'&&overlap(player,{x:k.x-18,y:k.y-20,w:36,h:40})){
    k.state='ready';earthKnives.equipped=true;burst(k.x,k.y,'#d6f7df',12);tone(780,.12,'sine',.03);
  }
}
function throwEarthKnife(){
  if(level!=='earth'||!earthKnives.equipped||player.attackCooldown>0||player.duck||state!=='playing')return false;
  const k=earthKnives.slots.find(k=>k.state==='ready');if(!k)return false;
  Object.assign(k,{state:'flying',remaining:EARTH_KNIFE_RETURN,x:player.x+player.w/2+player.facing*30,y:player.y+player.h*.48,vx:player.facing*680,age:0,spin:player.facing<0?Math.PI:0});
  player.attack=.25;player.attackCooldown=.45;tone(650,.1,'triangle',.025);return true;
}
function updateEarthKnives(dt){
  collectEarthKnives();
  for(const k of earthKnives.slots){
    if(k.state==='hidden'||k.state==='ready')continue;
    k.remaining=Math.max(0,k.remaining-dt);
    if(k.remaining<1e-8){k.state='ready';k.remaining=0;burst(player.x+player.w/2,player.y+player.h*.5,'#d6f7df',5);tone(760,.05,'sine',.018);continue;}
    if(k.state!=='flying')continue;
    const old={x:k.x,y:k.y};k.x+=k.vx*dt;k.age+=dt;k.spin+=dt*12*Math.sign(k.vx);
    // Resolve the first physical contact along the swept segment, so trees'
    // landing boughs and cliffs can block throws without tunnelling at 30 FPS.
    const contacts=[];
    const add=(box,hit)=>{const t=arrowSegmentEntry(old,k,box,6);if(t!==null)contacts.push({t,hit});};
    for(const p of platforms)add(p,()=>{});
    for(const g of earthGoblins)if(g.alive)add(g,()=>hitEarthGoblin(g));
    if(earthBoss.active&&['small','giant'].includes(earthBoss.stage))add(earthBossBox(),()=>hitEarthBoss('knife'));
    contacts.sort((a,b)=>a.t-b.t);
    if(contacts.length){const contact=contacts[0];k.x=old.x+(k.x-old.x)*contact.t;contact.hit();burst(k.x,k.y,'#d6e7d8',5);k.state='returning';}
    else if(k.age>=1.35||k.x<0||k.x>EARTH_W)k.state='returning';
  }
}
function drawEarthKnife(x,y,size=40,angle=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size/40,size/40);
  ctx.lineJoin='round';ctx.lineWidth=1.7;ctx.strokeStyle='#334c43';
  ctx.fillStyle='#825733';ctx.beginPath();ctx.moveTo(-20,-3);ctx.lineTo(-6,-3.5);ctx.lineTo(-6,3.5);ctx.lineTo(-20,3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#dcc68a';ctx.lineWidth=1;for(let x=-17;x<-7;x+=3){ctx.beginPath();ctx.moveTo(x,-2);ctx.lineTo(x+1,2);ctx.stroke();}
  ctx.strokeStyle='#334c43';ctx.fillStyle='#79ad83';ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(-3,-6);ctx.lineTo(-3,6);ctx.lineTo(-7,6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#d6e6dc';ctx.beginPath();ctx.moveTo(-3,-4);ctx.quadraticCurveTo(8,-7,20,0);ctx.quadraticCurveTo(8,7,-3,4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f8fff1';ctx.beginPath();ctx.moveTo(-1,-2);ctx.lineTo(15,0);ctx.stroke();ctx.restore();
}
function drawEarthKnifeWorld(){
  for(const [i,k] of earthKnives.slots.entries()){
    if(k.state==='hidden')drawEarthKnife(k.x-cameraX,k.y+Math.sin(earthTime*2+i)*2,40,-.5);
    else if(k.state==='flying')drawEarthKnife(k.x-cameraX,k.y,40,k.spin);
    else if(k.state==='returning'&&k.remaining<.55){
      const t=1-k.remaining/.55,x=player.x+player.w/2+player.facing*(65*(1-t)),y=player.y+player.h*.5-30*Math.sin(t*Math.PI);
      ctx.save();ctx.globalAlpha=t;drawEarthKnife(x-cameraX,y,30,t*Math.PI*2);ctx.restore();
    }
  }
}
function drawHeldEarthKnife(){
  if(earthKnives.equipped&&player.attack<=0&&earthKnives.slots.some(k=>k.state==='ready'))drawEarthKnife(player.x+player.w/2+player.facing*18-cameraX,player.y+player.h*.62,25,player.facing>0?-.4:Math.PI+.4);
}
function drawEarthKnifeInventory(){
  if(!earthKnivesOwned())return;
  const y=H>540?141:96;ctx.save();ctx.fillStyle='rgba(13,32,43,.82)';roundRect(18,y-24,132,75,12);
  earthKnives.slots.forEach((k,i)=>{ctx.save();ctx.globalAlpha=k.state==='ready'?1:k.state==='hidden'?.15:.4;drawEarthKnife(40+i*42,y,30,-.4);ctx.restore();
    if(k.remaining>0){ctx.fillStyle='#edf7e3';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(`${Math.ceil(k.remaining)}s`,40+i*42,y+22);}
  });
  ctx.fillStyle='#edf7e3';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(earthKnives.equipped?'THROW · Z STOW':'PUNCH · Z EQUIP',84,y+42);ctx.restore();
}
