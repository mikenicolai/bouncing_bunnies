// Native comic fireball flicker and two-layer spinning sword trails.
const lavaKingEffectsSheet=new Image();lavaKingEffectsSheet.src='assets/lava-king-effects-v1.png';
const LAVA_FIREBALL_HEADS=[[318,326],[318,328],[313,328],[318,326]];
function drawFireball(x,y,r,vx=1,vy=0,clock=fireTime){
  const frame=Math.floor(clock*12)%4,scale=r/48;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(vy,vx));
  if(lavaKingEffectsSheet.complete&&lavaKingEffectsSheet.naturalWidth){
    const [ax,ay]=LAVA_FIREBALL_HEADS[frame];
    ctx.drawImage(lavaKingEffectsSheet,frame*384,190,384,230,-ax*scale,(190-ay)*scale,384*scale,230*scale);
  }else{
    ctx.fillStyle='#f96a2e';ctx.strokeStyle='#4b241f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffe49a';ctx.beginPath();ctx.arc(-2,-2,r*.55,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function drawLavaKingSpin(front){
  const k=lavaKing,cx=k.x+k.w/2-cameraX,cy=k.y+k.h-70,frame=Math.floor(k.age*14)%4;
  ctx.save();ctx.beginPath();ctx.rect(cx-170,cy+(front?0:-70),340,70);ctx.clip();
  if(lavaKingEffectsSheet.complete&&lavaKingEffectsSheet.naturalWidth){
    ctx.drawImage(lavaKingEffectsSheet,frame*384,640,384,244,cx-150,cy-52,300,105);
  }else{
    ctx.strokeStyle='#ffd26c';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(cx,cy,140,42,k.age*.05,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
function drawLavaKingSpinWarning(){
  const k=lavaKing,cx=k.x+k.w/2-cameraX;
  ctx.save();ctx.globalAlpha=.4+.25*Math.sin(k.age*18)**2;ctx.strokeStyle='#ffe19b';ctx.lineWidth=3;ctx.setLineDash?.([9,7]);
  ctx.beginPath();ctx.ellipse(cx,FIRE_KING_ARENA.y-4,LAVA_KING_SPIN.reach,10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
