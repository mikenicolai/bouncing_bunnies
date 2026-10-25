// Painted hazards for the drop after Tempest; all collision/timing stays in updateDescent.
const descentCloudSheet=new Image();descentCloudSheet.src='assets/air-descent-clouds-v1.png';
const DESCENT_CLOUD_CROPS=[[12,267,604,159],[639,268,603,158],[12,868,604,159]],DESCENT_BOLT_CROP=[839,672,265,550];
function drawDescentCloud(o){
  const x=o.x-cameraX,y=o.y;
  if(x>W+40||x+o.w<-40||y-cameraY>H+100||y+o.h+120-cameraY<-100)return;
  const frame=stormFrame(o),phase=stormPhase(o),pose=frame===0?0:frame<4?1:2;
  ctx.save();ctx.shadowColor='#b8eaff';ctx.shadowBlur=[0,3,5,9,12,22,26,8][frame];
  if(descentCloudSheet.complete&&descentCloudSheet.naturalWidth){
    ctx.drawImage(descentCloudSheet,...DESCENT_CLOUD_CROPS[pose],x,y,o.w,o.h);
    if(phase==='on'||phase==='fade'){
      const b=descentBolt(o);ctx.globalAlpha=phase==='fade'?.3:1;
      // The bright core follows the existing 24px strike lane; the halo is decorative.
      ctx.drawImage(descentCloudSheet,...DESCENT_BOLT_CROP,b.x-cameraX-7,b.y-3,b.w+14,b.h+3);
    }
  }else drawPaintedCloud({x:o.x,y:o.y,w:o.w,kind:'white'});
  ctx.restore();
}
function drawDescentWindGuide(){
  if(!descentStarted)return;
  ctx.save();ctx.beginPath();ctx.rect(DESCENT.left-45-cameraX,-1610,DESCENT.right-DESCENT.left+90,airPlatforms[DESCENT.finish].y+1610);ctx.clip();
  ctx.lineCap='round';ctx.lineJoin='round';
  const drift=airTime*16%160,first=Math.floor((cameraY+1610)/160)-1;
  // Soft rising wind curls replace the rigid dotted sides of the drop corridor.
  for(const [wx,dir] of [[DESCENT.left-18,1],[DESCENT.right+18,-1]]){
    for(let i=first;i*160-1610-drift<Math.min(cameraY+H+80,airPlatforms[DESCENT.finish].y);i++){
      const x=wx-cameraX,y=i*160-1610-drift;
      ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-dir*10,y+20,x+dir*13,y+43,x+dir*8,y+65);
      ctx.bezierCurveTo(x+dir*4,y+83,x-dir*8,y+85,x-dir*7,y+72);
      ctx.strokeStyle='rgba(89,153,179,.22)';ctx.lineWidth=7;ctx.stroke();
      ctx.strokeStyle='rgba(245,255,244,.6)';ctx.lineWidth=2.2;ctx.stroke();
    }
  }
  ctx.restore();
}
