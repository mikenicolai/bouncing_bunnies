// One painted sand bed joins the dry beach to the sea; embedded verbatim in index.html.
let waterSandPainting=null;
function waterSandFloorY(x){return x<=WATER_FLOOR[0][0]?waterPlatforms[0].y:waterFloorY(x);}
function waterSandTexture(){
  if(waterSandPainting)return waterSandPainting;
  if(!sandyPitSheet.complete||!sandyPitSheet.naturalWidth)return null;
  const image=sandyPitSheet,patchW=96,patchH=167,stepX=68,stepY=116;
  const tile=document.createElement('canvas');tile.width=stepX*6;tile.height=stepY*6;
  const paint=tile.getContext('2d');paint.fillStyle='#bd9c75';paint.fillRect(0,0,tile.width,tile.height);
  function feather(c,side=true,foot=true){
    const p=c.getContext('2d');p.globalCompositeOperation='destination-in';
    if(side){const g=p.createLinearGradient(0,0,c.width,0);g.addColorStop(0,'transparent');g.addColorStop(.15,'#fff');g.addColorStop(.85,'#fff');g.addColorStop(1,'transparent');p.fillStyle=g;p.fillRect(0,0,c.width,c.height);}
    if(foot){const g=p.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'transparent');g.addColorStop(.15,'#fff');g.addColorStop(.85,'#fff');g.addColorStop(1,'transparent');p.fillStyle=g;p.fillRect(0,0,c.width,c.height);}
  }
  const patches=[],caps=[];
  for(let i=0;i<4;i++){
    const patch=document.createElement('canvas');patch.width=patchW;patch.height=patchH;
    // These interior crops contain opaque soil all the way to their bottom.
    patch.getContext('2d').drawImage(image,i*6,540+i*145,300,520,0,0,patchW,patchH);feather(patch);patches.push(patch);
    const cap=document.createElement('canvas');cap.width=patchW;cap.height=patchH;
    const cp=cap.getContext('2d');cp.drawImage(image,i%2*10,230,300,520,0,0,patchW,patchH);feather(cap,true,false);
    const fade=cp.createLinearGradient(0,100,0,patchH);fade.addColorStop(0,'#fff');fade.addColorStop(1,'transparent');cp.fillStyle=fade;cp.fillRect(0,0,patchW,patchH);caps.push(cap);
  }
  // Wrap the staggered patches to make a repeating tile without sharp seams.
  for(let row=-2;row<8;row++)for(let col=-2;col<8;col++){
    const r=(row%6+6)%6,k=(col%6+6)%6,variant=(k*7+r*11)%4;
    const x=col*stepX-(r%3)*stepX/3,y=row*stepY;
    paint.save();paint.translate(x+(k%2?patchW:0),y+(r%2?patchH:0));paint.scale(k%2?-1:1,r%2?-1:1);paint.drawImage(patches[variant],0,0);paint.restore();
  }
  waterSandPainting={tile,caps,patchW,patchH,stepX};return waterSandPainting;
}
function traceWaterSand(left,right,bottom){
  ctx.beginPath();ctx.moveTo(left,waterSandFloorY(left));
  for(const [x,y] of WATER_FLOOR)if(x>left&&x<right)ctx.lineTo(x,y);
  ctx.lineTo(right,waterSandFloorY(right));ctx.lineTo(right,bottom);ctx.lineTo(left,bottom);ctx.closePath();
}
function drawWaterWetSand(left,right,bottom){
  const top=WATER_SURFACE+Math.max(0,Math.floor((cameraY-WATER_SURFACE)/4))*4,end=Math.min(bottom,cameraY+H+4);
  if(right<1220||end<=top)return;
  ctx.save();
  for(let y=top;y<end;y+=4){
    const depth=Math.max(0,y-WATER_SURFACE),t=Math.min(1,depth/180);
    ctx.globalAlpha=.29*t*t*(3-2*t);
    const edge=1460-Math.min(depth,1000)*.12+Math.sin(y*.013)*12+Math.sin(y*.037)*5;
    if(right<=edge-100)continue;
    if(left>=edge+120)ctx.fillStyle='#15697e';
    else{const wet=ctx.createLinearGradient(edge-100,0,edge+120,0);wet.addColorStop(0,'transparent');wet.addColorStop(1,'#15697e');ctx.fillStyle=wet;}
    ctx.fillRect(left,y,right-left,4);
  }
  ctx.restore();
}
function drawWaterSeabed(){
  const left=Math.max(waterPlatforms[0].x,cameraX-160),right=Math.min(WATER_W,cameraX+W+160);
  if(left>=right)return;
  const bottom=Math.max(waterPlatforms[0].y+waterPlatforms[0].h,cameraY+H+500,waterSandFloorY(right)+500);
  const terrain=waterSandTexture();
  ctx.save();ctx.translate(-cameraX,0);
  ctx.save();traceWaterSand(left,right,bottom);ctx.clip();
  ctx.fillStyle=terrain?ctx.createPattern(terrain.tile,'repeat'):'#bd9c75';ctx.fillRect(left,Math.min(cameraY,waterSandFloorY(left)),right-left,bottom-Math.min(cameraY,waterSandFloorY(left)));ctx.restore();
  if(terrain){
    ctx.save();ctx.beginPath();ctx.rect(left,Math.min(cameraY,waterSandFloorY(left))-100,right-left,bottom+100-Math.min(cameraY,waterSandFloorY(left)));ctx.clip();
    for(let col=Math.floor(left/terrain.stepX)-2;col*terrain.stepX<right;col++){
      const x=col*terrain.stepX,floor=waterSandFloorY(x),rise=waterSandFloorY(x+terrain.patchW)-floor,flip=(col%2+2)%2===1;
      ctx.save();ctx.translate(x,floor);ctx.transform(1,rise/terrain.patchW,0,1,0,0);if(flip){ctx.translate(terrain.patchW,0);ctx.scale(-1,1);}
      ctx.drawImage(terrain.caps[(col%4+4)%4],0,-200/520*terrain.patchH);ctx.restore();
    }
    ctx.restore();
  }
  ctx.save();traceWaterSand(left,right,bottom);ctx.clip();drawWaterWetSand(left,right,bottom);ctx.restore();
  // Keep the existing animated wash where the sea meets the sloping shore.
  ctx.strokeStyle='rgba(250,255,234,.75)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(1525+Math.sin(waterTime)*12,392,35,6,-.1,0,Math.PI*2);ctx.stroke();ctx.restore();
}
