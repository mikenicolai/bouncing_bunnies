/* Runtime portion is embedded in index.html, alongside the animation library. */
const EARTH_ARENA={left:7000,right:7880,floor:-1480,spawn:7460};
let earthBoss,earthBossRocks=[],earthBossWaves=[],earthBossMountains=[];
function resetEarthBoss(){
  earthBoss={stage:'small',hp:5,active:false,x:EARTH_ARENA.spawn,facing:-1,age:0,phase:'idle',phaseAge:0,cooldown:1.8,dizzy:0,turn:0,shot:false};
  clearEarthBossHazards();
}
function clearEarthBossHazards(){earthBossRocks=[];earthBossWaves=[];earthBossMountains=[];}
function earthBossBox(){
  const giant=earthBoss.stage==='giant',w=giant?112:86,h=giant?285:100;
  return{x:earthBoss.x-w/2,y:EARTH_ARENA.floor-h,w,h};
}
function hitEarthBoss(source='punch'){
  const b=earthBoss;
  if(!b.active||!['small','giant'].includes(b.stage)||b.dizzy>0)return false;
  if(b.stage==='giant'&&source!=='knife'){burst(b.x,EARTH_ARENA.floor-70,'#c5df9b',5);tone(140,.06,'triangle',.02);return false;}
  b.hp=Math.max(0,b.hp-1);b.dizzy=b.stage==='small'?.9:.65;
  if(b.stage==='small'){b.phase='idle';b.phaseAge=0;b.cooldown=1.1;}
  burst(b.x,EARTH_ARENA.floor-70,b.stage==='small'?'#b2c967':'#78e1b1',14);
  tone(b.hp?210:125,.15,'triangle',.035);
  if(!b.hp){b.stage=b.stage==='small'?'shatter':'defeat';b.age=0;b.phase='idle';clearEarthBossHazards();}
  return true;
}
function launchEarthBossRock(){
  const b=earthBoss,from={x:b.x+b.facing*70,y:EARTH_ARENA.floor-235};
  const target=Math.max(EARTH_ARENA.left+40,Math.min(EARTH_ARENA.right-40,player.x+player.w/2));
  const dx=target-from.x,flight=Math.max(.9,Math.min(1.45,Math.abs(dx)/310));
  earthBossRocks.push({...from,vx:dx/flight,vy:(205-325*flight*flight)/flight,r:20,age:0,spin:0});
  tone(165,.13,'triangle',.03);
}
function earthMountainHeight(age){
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  return age<1.65?0:age<2.4?smooth((age-1.65)/.75):age<3.55?1:1-smooth((age-3.55)/1.35);
}
function earthMountainBoxes(m){
  const rise=earthMountainHeight(m.age);if(rise<=0)return[];
  const boxes=[];
  // Narrow slices match the visible peaks; red ground is warning only.
  for(let i=0;i<3;i++){
    const x=m.x+(i-1)*74,w=i===1?106:89,h=(i===1?176:125)*rise;
    for(let j=0;j<6;j++){
      const left=x-w/2+j*w/6,mid=left+w/12;
      const localH=h*Math.max(0,1-Math.abs(mid-x)/(.5*w));
      boxes.push({x:left,y:EARTH_ARENA.floor-localH,w:w/6,h:localH});
    }
  }return boxes;
}
function updateEarthBossHazards(dt){
  for(const rock of earthBossRocks){
    const old={x:rock.x,y:rock.y};rock.age+=dt;rock.spin+=dt*5;rock.vy+=650*dt;rock.x+=rock.vx*dt;rock.y+=rock.vy*dt;
    if(arrowSegmentEntry(old,rock,player,rock.r)!==null){hurt(Math.sign(rock.vx)||1);rock.age=9;}
    if(rock.y+rock.r>=EARTH_ARENA.floor){burst(rock.x,EARTH_ARENA.floor,'#a4b397',9);rock.age=9;}
  }
  earthBossRocks=earthBossRocks.filter(r=>r.age<5&&r.x>EARTH_ARENA.left-70&&r.x<EARTH_GATE_X);
  for(const wave of earthBossWaves){
    const old=wave.x;wave.age+=dt;wave.x+=wave.vx*dt;
    if(overlap(player,{x:Math.min(old,wave.x)-18,y:EARTH_ARENA.floor-14,w:Math.abs(old-wave.x)+36,h:14}))hurt(Math.sign(wave.vx));
  }
  earthBossWaves=earthBossWaves.filter(w=>w.age<2.8&&w.x>EARTH_ARENA.left&&w.x<EARTH_ARENA.right);
  for(const m of earthBossMountains){m.age+=dt;if(earthMountainBoxes(m).some(box=>overlap(player,box)))hurt(player.x<m.x?-1:1);}
  earthBossMountains=earthBossMountains.filter(m=>m.age<5.2);
}
function updateEarthBoss(dt){
  const b=earthBoss;
  if(!b.active&&player.x>=EARTH_ARENA.left&&player.y+player.h<=EARTH_ARENA.floor+15){
    b.active=true;checkpoint={x:EARTH_ARENA.left+30,y:EARTH_ARENA.floor-58};
  }
  if(!b.active)return;
  b.age+=dt;b.dizzy=Math.max(0,b.dizzy-dt);
  if(b.stage==='shatter'){if(b.age>=2.4){b.stage='rebuild';b.age-=2.4;}return;}
  if(b.stage==='rebuild'){if(b.age>=5.6){b.stage='giant';b.hp=5;b.age=0;b.phaseAge=0;b.cooldown=1.5;b.dizzy=0;}return;}
  if(b.stage==='defeat'){if(b.age>=1.5){b.stage='done';clearEarthBossHazards();}return;}
  if(b.stage==='done')return;
  updateEarthBossHazards(dt);
  if(state!=='playing')return;
  b.phaseAge+=dt;b.cooldown=Math.max(0,b.cooldown-dt);
  if(b.phase==='idle'){
    b.facing=player.x+player.w/2<b.x?-1:1;
    const distance=Math.abs(player.x+player.w/2-b.x);
    if(b.dizzy<=0&&distance>155)b.x=Math.max(EARTH_ARENA.left+130,Math.min(EARTH_ARENA.right-130,b.x+b.facing*(b.stage==='small'?36:52)*dt));
    if(!b.cooldown&&b.dizzy<=0&&distance<900){
      b.phase=b.stage==='small'?'swipe':['rock','quake','mountain'][b.turn++%3];b.phaseAge=0;b.shot=false;
      if(b.phase==='mountain'){
        const target=b.x-b.facing*210;
        b.retreatFrom=b.x;b.retreatTo=Math.max(EARTH_ARENA.left+155,Math.min(EARTH_ARENA.right-155,target));
        earthBossMountains.push({x:b.x,age:0});
      }
    }
  }else if(b.phase==='swipe'){
    if(b.phaseAge>=.45&&b.phaseAge<.7&&b.dizzy<=0){
      const box=earthBossBox();if(overlap(player,{x:b.facing<0?box.x-58:box.x+box.w,y:EARTH_ARENA.floor-75,w:58,h:75}))hurt(b.facing);
    }
    if(b.phaseAge>=1.4){b.phase='idle';b.phaseAge=0;b.cooldown=1.8;}
  }else{
    if(b.phase==='rock'&&!b.shot&&b.phaseAge>=.7){b.shot=true;launchEarthBossRock();}
    if(b.phase==='quake'&&!b.shot&&b.phaseAge>=.85){
      b.shot=true;for(const direction of [-1,1])earthBossWaves.push({x:b.x,vx:direction*310,age:0});tone(85,.25,'sawtooth',.035);
    }
    if(b.phase==='mountain'){
      const t=Math.max(0,Math.min(1,(b.phaseAge-.65)/.9)),p=t*t*(3-2*t);b.x=b.retreatFrom+(b.retreatTo-b.retreatFrom)*p;
    }
    const duration={rock:3,quake:3.2,mountain:5.2}[b.phase];
    if(b.phaseAge>=duration){b.phase='idle';b.phaseAge=0;b.cooldown=.95;}
  }
  if(b.dizzy<=0&&overlap(player,earthBossBox())){
    const box=earthBossBox();
    if(player.vy>120&&player.previousFeet<=box.y+20&&hitEarthBoss()){player.vy=-460;player.onGround=false;}
    else hurt(player.x<b.x?-1:1);
  }
}
function drawEarthBoss(){
  const b=earthBoss;if(!b||b.stage==='done'||!woodBossImages.small.complete||!woodBossImages.small.naturalWidth||!woodBossImages.giant.complete||!woodBossImages.giant.naturalWidth)return;
  const r=woodBossRenderer,x=b.x-cameraX,floor=EARTH_ARENA.floor;
  for(const m of earthBossMountains)r.mountain(ctx,m.x-cameraX,floor,m.age);
  if(b.stage==='shatter'){r.sprite(ctx,'small',WoodBossAnimation.frameAt({scene:'shatter',time:b.age}),x,floor,112,b.facing);r.rubble(ctx,x,floor,b.age);r.dust(ctx,x,floor,b.age,Math.max(0,1.5-b.age));}
  else if(b.stage==='rebuild')r.assembly(ctx,x,floor,b.age,b.facing);
  else{
    const giant=b.stage==='giant'||b.stage==='defeat',kind=giant?'giant':'small',height=giant?336:112;
    let scene=b.stage==='defeat'?'defeat':b.dizzy>0?(giant?'giantHurt':'smallHurt'):b.phase==='idle'?(giant?'giantIdle':'smallIdle'):b.phase==='swipe'?'smallSwipe':b.phase;
    const time=b.stage==='defeat'?b.age:b.dizzy>0?0:b.phase==='idle'?b.age:b.phaseAge;
    const walking=b.phase==='idle'&&b.dizzy<=0&&b.active&&Math.abs(player.x+player.w/2-b.x)>155;
    if(walking)r.walk(ctx,kind,x,floor,height,b.age,b.facing);
    else r.sprite(ctx,kind,WoodBossAnimation.frameAt({scene,time}),x,floor,height,b.facing);
    if(b.phase==='quake')r.quake(ctx,x,floor,b.phaseAge);
    if(b.stage==='defeat')r.dust(ctx,x,floor,b.age,Math.min(1,b.age));
  }
  for(const rock of earthBossRocks)r.fragment(ctx,'small',901,rock.x-cameraX,rock.y,rock.r*2,rock.spin);
  for(const wave of earthBossWaves){
    ctx.save();ctx.strokeStyle='#e5d7a4';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(wave.x-cameraX,floor-5,19,9,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();
  }
}
function drawEarthBossHearts(){
  const b=earthBoss;if(level!=='earth'||!b||!['small','giant'].includes(b.stage)||b.hp<=0)return;
  const height=b.stage==='giant'?336:112;
  let x=b.x-cameraX,y=Math.max(15,EARTH_ARENA.floor-height-24-cameraY);
  if(x<-100||x>W+100)return;
  x=Math.max(52,Math.min(W-52,x));
  const hudScale=H>540?1:Math.min(1.6,Math.max(1,650/canvas.getBoundingClientRect().width));
  const left=W/2-105*hudScale,right=W/2+105*hudScale,bottom=18+54*hudScale;
  if(y<bottom+10&&x+45>left&&x-45<right)x=x>=W/2?Math.min(W-52,right+60):Math.max(52,left-60);
  // Overlay after the hero HUD so the five boss hearts stay fully visible.
  woodBossRenderer.hearts(ctx,x,y,b.hp);
}
