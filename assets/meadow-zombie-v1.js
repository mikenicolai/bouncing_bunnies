// First Meadow's painted zombies each have one heart.
// Embedded verbatim in index.html; other worlds retain their own enemies.
const meadowZombieSheet=new Image();meadowZombieSheet.src='assets/meadow-zombie-sprites-v1.png';
let meadowZombiePaint=null;
function freshMeadowZombie([x,oldY,min,max],i){
  const hp=1,vx=i%2?-55:55;
  return{x,y:oldY+44-60,w:44,h:60,min,max,vx,facing:Math.sign(vx),alive:true,
    hp,maxHP:hp,dizzy:0,deathAge:0,phase:i*.7,hurtFrom:4};
}
function hitMeadowZombie(e){
  if(!e.alive||e.dizzy>0)return false;
  e.hurtFrom=Math.floor(e.phase)%4;e.hp=Math.max(0,e.hp-1);
  e.alive=e.hp>0;e.dizzy=e.alive?1:0;e.deathAge=0;
  burst(e.x+e.w/2,e.y+e.h/2,e.alive?'#d9e8ae':'#a1b87b',e.alive?12:22);
  tone(e.alive?220:150,.12,'triangle',.035);return true;
}
function updateMeadowZombies(dt){
  for(const e of enemies){
    if(!e.alive){e.deathAge+=dt;continue;}
    const wasDizzy=e.dizzy>0;e.dizzy=Math.max(0,e.dizzy-dt);
    e.phase+=dt*(wasDizzy?2:4.8);
    if(!wasDizzy){
      e.x+=e.vx*dt;
      if(e.x<e.min||e.x>e.max){e.vx*=-1;e.x=Math.max(e.min,Math.min(e.max,e.x));}
      e.facing=Math.sign(e.vx)||e.facing;
    }
    if(!overlap(player,e))continue;
    const stomp=player.vy>0&&(player.previousFeet??player.y+player.h)<=e.y+8;
    if(stomp){
      hitMeadowZombie(e);player.y=e.y-player.h;player.vy=-470;player.onGround=false;
      player.jumpAge=0;player.boosts=0;
    }else if(!wasDizzy&&e.dizzy<=0){
      const direction=player.x+player.w/2<e.x+e.w/2?-1:1;
      if(hurt(direction)){player.vy=-420;player.vx=direction*300;}
    }
  }
}
function measureMeadowZombieAtlas(image){
  const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
  const paint=c.getContext('2d',{willReadFrequently:true});paint.drawImage(image,0,0);
  const data=paint.getImageData(0,0,c.width,c.height).data,frames=[];
  for(let i=0;i<8;i++){
    const sx=Math.round((i%4)*c.width/4),ex=Math.round((i%4+1)*c.width/4);
    const sy=Math.round(Math.floor(i/4)*c.height/2),ey=Math.round((Math.floor(i/4)+1)*c.height/2);
    let left=ex,right=sx,top=ey,bottom=sy;
    for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++)if(data[(y*c.width+x)*4+3]>48){
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(left>right)throw new Error('Empty meadow zombie pose '+i);
    // Anchor the body between its boots, avoiding an offset from its reaching hands.
    let sum=0,count=0;
    for(let y=bottom-Math.round((bottom-top)*.08);y<=bottom;y++)for(let x=left;x<=right;x++)if(data[(y*c.width+x)*4+3]>100){sum+=x;count++;}
    frames.push({x:left,y:top,w:right-left+1,h:bottom-top+1,anchorX:count?sum/count:(left+right)/2});
  }
  return frames;
}
function meadowZombiePose(e){
  if(!e.alive)return{from:6,next:7,t:Math.min(1,e.deathAge/.3)};
  if(e.dizzy>0)return{from:e.hurtFrom,next:5,t:Math.min(1,(1-e.dizzy)/.12)};
  if(Math.abs(e.vx)<2)return{from:4,next:4,t:0};
  const p=e.phase%4,from=Math.floor(p);return{from,next:(from+1)%4,t:p-from};
}
function drawMeadowZombie(e){
  if(!e.alive&&e.deathAge>=.75)return;
  const cx=e.x+e.w/2-cameraX,floor=e.y+e.h;
  if(cx<-100||cx>W+100)return;
  const alpha=e.alive?1:Math.max(0,1-e.deathAge/.75);
  if(meadowZombieSheet.complete&&meadowZombieSheet.naturalWidth){
    if(!meadowZombiePaint)meadowZombiePaint=new window.WoodBossAnimation.PaintedPoseBlend(meadowZombieSheet,measureMeadowZombieAtlas(meadowZombieSheet),false);
    const pose=meadowZombiePose(e),t=pose.t*pose.t*(3-2*pose.t);
    ctx.save();if(e.dizzy>0){ctx.translate(cx,floor);ctx.rotate(Math.sin(e.phase*6)*.045);ctx.translate(-cx,-floor);}
    meadowZombiePaint.draw(ctx,pose.from,pose.next,t,cx,floor,60,-e.facing,alpha);ctx.restore();
  }else{
    // Small readable fallback while the painted sheet is loading.
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(cx,floor);ctx.scale(e.facing,1);
    ctx.fillStyle='#394d32';ctx.strokeStyle='#263b2d';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-14,-31,28,26,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#748b51';ctx.beginPath();ctx.ellipse(0,-42,20,17,0,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#f6e8b8';ctx.beginPath();ctx.ellipse(10,-44,7,9,0,0,7);ctx.fill();ctx.fillStyle='#283827';ctx.beginPath();ctx.arc(13,-44,3,0,7);ctx.fill();
    ctx.fillStyle='#614c38';ctx.fillRect(-17,-9,13,9);ctx.fillRect(5,-9,13,9);ctx.restore();
  }
  if(!e.alive)return;
  drawMeadowZombieHearts(e,cx);
  if(e.dizzy>0){
    ctx.save();ctx.fillStyle='#ffdc75';ctx.strokeStyle='#425036';ctx.lineWidth=2;ctx.font='bold 12px system-ui';ctx.textAlign='center';
    for(let i=0;i<3;i++){const angle=e.phase*3+i*Math.PI*2/3,x=cx+Math.cos(angle)*29,y=e.y+9+Math.sin(angle)*7;ctx.strokeText('✦',x,y);ctx.fillText('✦',x,y);}ctx.restore();
  }
}
function drawMeadowZombieHearts(e,cx){
  ctx.save();const rows=Math.ceil(e.maxHP/5),top=e.y-13-(rows-1)*12;
  if(e.maxHP===10){ctx.fillStyle='rgba(91,73,34,.75)';roundRect(cx-36,top-7,72,26,6);}
  for(let i=0;i<e.maxHP;i++){
    const columns=Math.min(5,e.maxHP-Math.floor(i/5)*5),x=cx+(i%5-(columns-1)/2)*13,y=top+Math.floor(i/5)*12;
    ctx.fillStyle=i<e.hp?(e.maxHP===10?'#ffd67c':'#ec8090'):'#708472';ctx.strokeStyle='#354939';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,y+5);ctx.bezierCurveTo(x-10,y-1,x-5,y-9,x,y-4);ctx.bezierCurveTo(x+5,y-9,x+10,y-1,x,y+5);ctx.fill();ctx.stroke();
  }
  ctx.restore();
}
