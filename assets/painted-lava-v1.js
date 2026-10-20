const paintedLavaSheet=new Image();paintedLavaSheet.src='assets/painted-lava-v1.png';
let paintedLavaTile=null;
function drawPaintedLava(left,right,surface,bottom,time,offsetY=0){
  if(left>cameraX+W||right<cameraX||bottom<cameraY||surface>cameraY+H)return;
  const start=Math.max(left,cameraX-12),end=Math.min(right,cameraX+W+12),top=surface-offsetY;
  // Waves settle against the walls; only the molten material moves inside the pool.
  const surfaceAt=x=>top+Math.sin(x*.035+time*2)*3*Math.min(1,(x-left)/32,(right-x)/32);
  function shoreline(){
    ctx.moveTo(start-cameraX,surfaceAt(start));
    for(let x=Math.ceil((start+1)/8)*8;x<end;x+=8)ctx.lineTo(x-cameraX,surfaceAt(x));
    ctx.lineTo(end-cameraX,surfaceAt(end));
  }
  ctx.save();ctx.beginPath();shoreline();
  ctx.lineTo(end-cameraX,bottom-offsetY);ctx.lineTo(start-cameraX,bottom-offsetY);ctx.closePath();ctx.clip();
  ctx.fillStyle='#da411c';ctx.fillRect(start-cameraX,top-4,end-start,bottom-surface+8);
  if(paintedLavaSheet.complete&&paintedLavaSheet.naturalWidth){
    const tile=280,flowX=time*6,flowY=Math.sin(time*.6)*2;
    // Resample once so fractional flow does not rescale the large source every frame.
    if(!paintedLavaTile){paintedLavaTile=document.createElement('canvas');paintedLavaTile.width=paintedLavaTile.height=tile;paintedLavaTile.getContext('2d').drawImage(paintedLavaSheet,0,0,tile,tile);}
    for(let row=Math.floor((Math.max(surface-4,cameraY)-flowY)/tile);row*tile+flowY<Math.min(bottom,cameraY+H);row++){
      for(let col=Math.floor((start-flowX)/tile);col*tile+flowX<end;col++){
        const flipX=Math.abs(col%2),flipY=Math.abs(row%2);
        ctx.save();ctx.translate(col*tile+flowX-cameraX+(flipX?tile:0),row*tile+flowY-offsetY+(flipY?tile:0));ctx.scale(flipX?-1:1,flipY?-1:1);
        ctx.drawImage(paintedLavaTile,0,0);ctx.restore();
      }
    }
  }
  // Bubbles and a warm contact edge keep the slow flow visibly molten.
  for(let x=Math.floor(start/85)*85;x<end;x+=85){
    const phase=(time*.7+x*.013)%1,y=top+18+Math.sin(x)*9;
    ctx.strokeStyle=`rgba(255,202,74,${.65*(1-phase)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x-cameraX,y,4+phase*10,2+phase*3,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.strokeStyle='rgba(255,184,71,.6)';ctx.lineWidth=3;
  for(const x of [left+1,right-1])if(x>=start&&x<=end){ctx.beginPath();ctx.moveTo(x-cameraX,top);ctx.lineTo(x-cameraX,top+26);ctx.stroke();}
  ctx.restore();ctx.save();ctx.strokeStyle='#ffb847';ctx.lineWidth=3;ctx.beginPath();shoreline();ctx.stroke();ctx.restore();
}
