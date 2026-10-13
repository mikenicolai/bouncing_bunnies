// Painted fish, turtles, coral and sea grass; embedded verbatim in index.html.
const WATER_REEF_ART={"fish":{"asset":"assets/reef-fish-v1.png","width":1254,"height":1254,"frames":[{"sx":38,"sy":214,"sw":576,"sh":349},{"sx":665,"sy":213,"sw":575,"sh":350},{"sx":39,"sy":736,"sw":574,"sh":349},{"sx":665,"sy":736,"sw":575,"sh":349}]},"coral":{"asset":"assets/reef-coral-v1.png","width":1254,"height":1254,"frames":[{"sx":41,"sy":61,"sw":570,"sh":538},{"sx":663,"sy":69,"sw":552,"sh":530},{"sx":40,"sy":661,"sw":578,"sh":535},{"sx":661,"sy":660,"sw":564,"sh":537}]},"seagrass":{"asset":"assets/reef-seagrass-v1.png","width":1402,"height":1122,"frames":[{"sx":177,"sy":33,"sw":445,"sh":1062,"baseY":1000},{"sx":838,"sy":15,"sw":448,"sh":1082,"baseY":1000}]},"turtle":{"asset":"assets/reef-turtle-v1.png","width":2172,"height":724,"frames":[{"sx":40,"sy":117,"sw":1020,"sh":478,"ax":550,"ay":390},{"sx":1149,"sy":118,"sw":996,"sh":496,"ax":1636,"ay":390}]}};
for(const a of Object.values(WATER_REEF_ART)){a.image=new Image();a.image.src=a.asset;}
// Bend decorative swimming paths around physical rocks, with room for tails.
function waterCreatureY(x,preferred,halfWidth=20,halfHeight=8){
  const ceiling=Math.max(...[x-halfWidth,x,x+halfWidth].map(wx=>wx<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,wx)));
  const floor=Math.min(waterFloorY(x-halfWidth),waterFloorY(x+halfWidth));
  const top=ceiling+halfHeight+12,bottom=floor-halfHeight-12;
  let y=Math.max(top,Math.min(bottom,preferred));
  for(const rock of [...waterReefs,...waterShipSolids(),...waterAirPockets.filter(p=>p.ship).map(p=>({x:p.x,y:p.y-22,w:p.w,h:210}))]){
    const distance=Math.max(rock.x-x,x-rock.x-rock.w,0);
    const above=rock.y-halfHeight-12,below=rock.y+rock.h+halfHeight+12;
    if(distance>=halfWidth+110||y<=above||y>=below)continue;
    const pass=above>=top?above:below;
    if(pass>bottom)continue;
    const t=Math.max(0,Math.min(1,(halfWidth+110-distance)/110));
    const blend=t*t*(3-2*t);
    y+=(pass-y)*blend;
  }
  return y;
}
function waterFishPose(school,i,time=waterTime){
  const direction=school%2?1:-1;
  const x=1740+school*445+i*26+Math.sin(time*.55+school)*44*direction;
  const ceiling=x<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,x);
  const preferred=ceiling+130+(school%3)*95+i%3*13+Math.sin(time*2+i+school)*5;
  return {x,y:waterCreatureY(x,Math.min(waterFloorY(x)-90,preferred)),direction};
}
function waterReefPlantPose(i,kind='seagrass'){
  const x=1640+i*108+(i%4)*19+(kind==='coral'?29:0),base=waterFloorY(x);
  const ceiling=x<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,x);
  const height=Math.min(kind==='coral'?52+i%3*5:62+i%5*11,Math.max(8,base-ceiling-10));
  return {x,base,height,kind,variant:kind==='coral'?Math.floor(i/2)%4:i%2,facing:i%3===1?-1:1,sway:kind==='seagrass'?Math.sin(waterTime*1.8+i)*8:0};
}
function drawWaterReefPlant(p){
  const a=WATER_REEF_ART[p.kind];if(!a.image.complete||!a.image.naturalWidth)return;
  const f=a.frames[p.variant],baseY=f.baseY??f.sy+f.sh,scale=p.height/(baseY-f.sy);
  const width=f.sw*scale,x=p.x-cameraX;
  ctx.save();
  // Root tips sink into the local sloping floor instead of hanging above it.
  ctx.beginPath();ctx.moveTo(x-100,p.base-p.height-40);ctx.lineTo(x+100,p.base-p.height-40);
  for(let wx=p.x+100;wx>=p.x-100;wx-=8)ctx.lineTo(wx-cameraX,waterFloorY(wx)+2);
  ctx.closePath();ctx.clip();
  ctx.translate(x,p.base+2);ctx.transform(1,0,-p.sway/p.height,1,0,0);ctx.scale(p.facing,1);
  ctx.drawImage(a.image,f.sx,f.sy,f.sw,f.sh,-width/2,(f.sy-baseY)*scale,width,f.sh*scale);ctx.restore();
}
function drawWaterReefFish(pose,variant,time=waterTime){
  const a=WATER_REEF_ART.fish;if(!a.image.complete||!a.image.naturalWidth)return;
  const f=a.frames[variant],scale=Math.min(32/f.sw,15/f.sh),pulse=1+Math.sin(time*4+variant)*.018;
  ctx.save();ctx.translate(pose.x-cameraX,pose.y);ctx.scale(pose.direction*pulse,1);
  ctx.drawImage(a.image,f.sx,f.sy,f.sw,f.sh,-f.sw*scale/2,-f.sh*scale/2,f.sw*scale,f.sh*scale);ctx.restore();
}
const waterTurtlePaintings=[];
function waterTurtlePose(i,time=waterTime){
  const x=2300+i*1750+Math.sin(time*.33+i)*58;
  return {x,y:waterCreatureY(x,waterFloorY(x)-190+Math.sin(time*1.1+i)*12,50,28),direction:i%2?1:-1,stroke:(Math.sin(time*3+i)+1)/2};
}
function waterTurtleArtScale(){
  let halfWidth=0,halfHeight=0;
  for(const f of WATER_REEF_ART.turtle.frames){
    halfWidth=Math.max(halfWidth,Math.abs(f.sx-f.ax),Math.abs(f.sx+f.sw-f.ax));
    halfHeight=Math.max(halfHeight,Math.abs(f.sy-f.ay),Math.abs(f.sy+f.sh-f.ay));
  }
  // Painted flippers fit inside the existing rock-avoidance envelope.
  return Math.min(44/halfWidth,27/halfHeight);
}
function waterTurtlePainting(step){
  if(waterTurtlePaintings[step])return waterTurtlePaintings[step];
  const a=WATER_REEF_ART.turtle,c=document.createElement('canvas');c.width=130;c.height=100;
  const paint=c.getContext('2d'),scale=waterTurtleArtScale(),mix=step/12;
  paint.globalCompositeOperation='lighter';
  for(const [i,weight] of [[0,1-mix],[1,mix]]){
    if(!weight)continue;const f=a.frames[i];paint.globalAlpha=weight;
    paint.drawImage(a.image,f.sx,f.sy,f.sw,f.sh,65+(f.sx-f.ax)*scale,50+(f.sy-f.ay)*scale,f.sw*scale,f.sh*scale);
  }
  waterTurtlePaintings[step]=c;return c;
}
function drawWaterTurtle(pose){
  const a=WATER_REEF_ART.turtle;if(!a.image.complete||!a.image.naturalWidth)return;
  ctx.save();ctx.translate(pose.x-cameraX,pose.y);ctx.scale(pose.direction,1);
  ctx.drawImage(waterTurtlePainting(Math.max(0,Math.min(12,Math.round(pose.stroke*12)))),-65,-50);ctx.restore();
}
function drawReefLife(){
  for(let i=0;i<92;i++){
    const plant=waterReefPlantPose(i),x=plant.x-cameraX;
    if(x<-100||x>W+100)continue;
    drawWaterReefPlant(plant);
    if(i%2===0)drawWaterReefPlant(waterReefPlantPose(i,'coral'));
    if(i%5===1){ctx.fillStyle='#e6c6a4';ctx.beginPath();ctx.ellipse(x-20,waterFloorY(plant.x-20)-1,15,5,0,0,7);ctx.fill();}
  }
  for(let school=0;school<21;school++)for(let i=0;i<5;i++){
    const pose=waterFishPose(school,i),x=pose.x-cameraX;
    if(x<-45||x>W+45)continue;
    drawWaterReefFish(pose,(school+i)%4);
  }
  for(let i=0;i<5;i++){
    const pose=waterTurtlePose(i),x=pose.x-cameraX;
    if(x<-100||x>W+100)continue;
    drawWaterTurtle(pose);
  }
}
