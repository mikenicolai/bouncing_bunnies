// Original painted attack atlases. Native PNG alpha is preserved, including the
// open bubble/coil centers. Source rectangles isolate each irregular painting.
const BOSS_EFFECT_ART={
 water:{asset:'assets/water-boss-effects-v1.png',width:1536,height:1024,frames:{bubble:[45,54,453,425],orb:[601,92,404,373],tide:[1136,16,312,487],wave:[15,601,548,330],splash:[593,554,394,402],bubble2:[1084,545,419,411]},image:new Image()},
 earth:{asset:'assets/earth-boss-effects-v1.png',width:1536,height:1024,frames:{rock:[181,80,411,424],stones:[760,157,739,328],vine:[33,690,921,175],coil:[1007,520,461,449]},image:new Image()}
};
for(const art of Object.values(BOSS_EFFECT_ART))art.image.src=art.asset;
function drawBossEffect(element,name,x,y,width,height,angle=0,alpha=1){
 const a=BOSS_EFFECT_ART[element];if(!a?.image.complete||!a.image.naturalWidth)return false;
 const [sx,sy,sw,sh]=a.frames[name];ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=alpha;
 ctx.drawImage(a.image,sx,sy,sw,sh,-width/2,-height/2,width,height);ctx.restore();return true;
}
function drawPaintedEarthVine(fromX,fromY,x,y,sag,grabbed){
 if(!BOSS_EFFECT_ART.earth.image.naturalWidth)return false;
 const point=t=>({x:fromX+(x-fromX)*t,y:fromY+(y-fromY)*t+Math.sin(t*Math.PI)*sag});
 const count=Math.max(1,Math.ceil(Math.hypot(x-fromX,y-fromY)/65));
 for(let i=0;i<count;i++){
  const a=point(i/count),b=point((i+1)/count);
  drawBossEffect('earth','vine',(a.x+b.x)/2,(a.y+b.y)/2,Math.hypot(b.x-a.x,b.y-a.y)+12,34,Math.atan2(b.y-a.y,b.x-a.x));
 }
 if(!grabbed)drawBossEffect('earth','coil',x,y,30,34);
 return true;
}
function drawEarthVineGrip(){
 if(earthBossVine?.grabbed)drawBossEffect('earth','coil',player.x+player.w/2-cameraX,player.y+player.h*.7,player.w+12,player.h*.62,Math.sin(earthTime*6)*.035);
}
function drawEarthGroundStones(){
 for(const stone of earthBossStones){
  const height=earthStoneHeight(stone.age),x=stone.x-cameraX;
  if(stone.age>=0&&stone.age<.72){
   ctx.save();ctx.globalAlpha=.35+.25*Math.sin(stone.age*18)**2;ctx.strokeStyle='#efc16b';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(x-49,EARTH_ARENA.floor+1);ctx.lineTo(x-22,EARTH_ARENA.floor-3);ctx.lineTo(x-8,EARTH_ARENA.floor+2);ctx.lineTo(x+15,EARTH_ARENA.floor-4);ctx.lineTo(x+50,EARTH_ARENA.floor+1);ctx.stroke();ctx.restore();
  }
  if(height>0){
   ctx.save();ctx.beginPath();ctx.rect(x-64,EARTH_ARENA.floor-height,128,height);ctx.clip();
   if(!drawBossEffect('earth','stones',x,EARTH_ARENA.floor+27-height,124,54)){
    ctx.fillStyle='#6f7860';ctx.fillRect(x-30,EARTH_ARENA.floor-height,60,height);
   }
   ctx.restore();
  }
 }
}
