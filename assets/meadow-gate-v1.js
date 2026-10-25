// Separate painted frame and lifting leaf; gameplay collision remains MEADOW_GATE.
const meadowGateSheet=new Image();meadowGateSheet.src='assets/meadow-gate-v1.png';
function drawMeadowGateForeground(){
  const m=meadowLesson,g=MEADOW_GATE,gx=g.x-cameraX;
  if(gx<-160||gx>W+160)return;
  ctx.save();
  // The moving leaf stays behind its fixed jambs and header, even halfway open.
  ctx.save();ctx.beginPath();ctx.rect(gx,g.y,g.w,g.h);ctx.clip();
  const leafY=g.y-g.h*m.lift;
  ctx.fillStyle='#80522b';ctx.fillRect(gx,leafY,g.w,g.h);
  if(meadowGateSheet.complete&&meadowGateSheet.naturalWidth)ctx.drawImage(meadowGateSheet,640,234,372,1210,gx,leafY,g.w,g.h);
  ctx.restore();
  // Opaque cores preserve the walk-behind effect around the painted timber edges.
  ctx.fillStyle='#95612f';
  ctx.fillRect(gx-20,30,20,440);ctx.fillRect(gx+90,30,20,440);ctx.fillRect(gx-32,20,154,28);
  if(meadowGateSheet.complete&&meadowGateSheet.naturalWidth)ctx.drawImage(meadowGateSheet,11,10,613,1455,gx-32,20,154,450);
  // The progress plaque belongs to the lintel rather than floating in the passage.
  ctx.fillStyle='#304d45';roundRect(gx-5,28,100,40,7);
  ctx.strokeStyle='#bd995c';ctx.lineWidth=1.5;ctx.strokeRect(gx-2,31,94,34);
  ctx.font='800 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff1be';
  ctx.fillText(m.lift>=1?'OPEN':`${meadowBalloonsPopped()} / 3`,gx+45,43);
  for(let i=0;i<3;i++){ctx.fillStyle=m.balloons[i].popped?'#a6e5a0':'#c3a36b';ctx.beginPath();ctx.arc(gx+22+i*23,56,4.5,0,7);ctx.fill();}
  ctx.restore();
}
