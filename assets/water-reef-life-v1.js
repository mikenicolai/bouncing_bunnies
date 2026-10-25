// Painted fish, turtles, coral and sea grass; embedded verbatim in index.html.
const WATER_REEF_ART={"fish":{"asset":"assets/reef-fish-v1.png","width":1254,"height":1254,"frames":[{"sx":38,"sy":214,"sw":576,"sh":349},{"sx":665,"sy":213,"sw":575,"sh":350},{"sx":39,"sy":736,"sw":574,"sh":349},{"sx":665,"sy":736,"sw":575,"sh":349}]},"coral":{"asset":"assets/reef-coral-v1.png","width":1254,"height":1254,"frames":[{"sx":41,"sy":61,"sw":570,"sh":538},{"sx":663,"sy":69,"sw":552,"sh":530},{"sx":40,"sy":661,"sw":578,"sh":535},{"sx":661,"sy":660,"sw":564,"sh":537}]},"seagrass":{"asset":"assets/reef-seagrass-v1.png","width":1402,"height":1122,"frames":[{"sx":177,"sy":33,"sw":445,"sh":1062,"baseY":1000},{"sx":838,"sy":15,"sw":448,"sh":1082,"baseY":1000}]},"turtle":{"asset":"assets/turtle-swim-v1.png","width":1536,"height":1024,"frames":[{"sx":0,"sy":0,"sw":512,"sh":512,"ax":256,"ay":305},{"sx":512,"sy":0,"sw":512,"sh":512,"ax":768,"ay":305},{"sx":1024,"sy":0,"sw":512,"sh":512,"ax":1280,"ay":305},{"sx":0,"sy":512,"sw":512,"sh":512,"ax":256,"ay":767},{"sx":512,"sy":512,"sw":512,"sh":512,"ax":768,"ay":767},{"sx":1024,"sy":512,"sw":512,"sh":512,"ax":1280,"ay":767}]}};
for(const [name,a] of Object.entries(WATER_REEF_ART)){a.image=name==='turtle'?TURTLE_ANIMATION.swim.image:new Image();a.image.src=a.asset;}
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
function waterFishPath(school,i,time=waterTime){
  const travelSign=school%2?1:-1,phase=time*.55+school;
  const x=1740+school*445+i*26+Math.sin(phase)*44*travelSign;
  // The paintings face right; turn with the horizontal swimming velocity.
  const direction=Math.cos(phase)*travelSign>=0?1:-1;
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
function waterTurtlePath(i,time=waterTime){
  const phase=time*.33+i,x=2300+i*1750+Math.sin(phase)*58;
  return {x,y:waterCreatureY(x,waterFloorY(x)-190+Math.sin(time*1.1+i)*12,50,28),direction:Math.cos(phase)>=0?1:-1,stroke:(Math.sin(time*3+i)+1)/2,cycle:(time*.75+i*.23)%1};
}
// Live swimmers keep their own velocity; explicit-time poses remain useful for
// previews of the undisturbed paths. Rendering never advances the simulation.
let waterReefSwimmers=[];
function resetWaterReefLife(){
  waterReefSwimmers=[];
  for(let school=0;school<21;school++)for(let i=0;i<5;i++){
    const p=waterFishPath(school,i);
    waterReefSwimmers.push({...p,school,index:i,turtle:false,hw:20,hh:8,vx:p.direction*20,vy:0});
  }
  for(let i=0;i<5;i++){
    const p=waterTurtlePath(i);
    waterReefSwimmers.push({...p,school:-1,index:i,turtle:true,hw:50,hh:28,vx:p.direction*15,vy:0});
  }
}
function waterFishPose(school,i,time){
  const live=time===undefined?waterReefSwimmers[school*5+i]:null;
  return live?{x:live.x,y:live.y,direction:live.direction}:waterFishPath(school,i,time??waterTime);
}
function waterTurtlePose(i,time){
  const live=time===undefined?waterReefSwimmers[105+i]:null;
  return live?{x:live.x,y:live.y,direction:live.direction,stroke:(Math.sin(waterTime*3+i)+1)/2,cycle:(waterTime*.75+i*.23)%1}:waterTurtlePath(i,time??waterTime);
}
function waterTurtleBody(c,x=c.x,y=c.y){return {x:x-c.hw,y:y-c.hh,w:c.hw*2,h:c.hh*2,turtle:c};}
function waterTurtleSolids(){return waterReefSwimmers.filter(c=>c.turtle).map(c=>waterTurtleBody(c));}
function resolveWaterTurtleContact(solids){
  // A checkpoint can place Benny inside a passing shell. Separate harmlessly
  // toward the nearest free face rather than trapping both movement axes.
  for(const body of solids.filter(s=>s.turtle)){
    if(!overlap(player,body))continue;
    const choices=[{x:body.x-player.w-.01,y:player.y},{x:body.x+body.w+.01,y:player.y},
      {x:player.x,y:body.y-player.h-.01},{x:player.x,y:body.y+body.h+.01}];
    choices.sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
    for(const p of choices)if(waterPositionClear({...player,...p},solids)){
      if(p.x!==player.x)player.vx=0;if(p.y!==player.y)player.vy=0;
      player.x=p.x;player.y=p.y;break;
    }
  }
}
function waterReefObstacles(){
  return [...waterReefs,...waterShipSolids(),...waterAirPockets.filter(p=>p.ship).map(p=>({x:p.x,y:p.y-22,w:p.w,h:210}))];
}
function waterSwimmerClear(c,x,y,rocks){
  for(const wx of [x-c.hw,x,x+c.hw]){
    const roof=wx<WATER_CAVE_START?WATER_SURFACE:waterProfileY(WATER_ROOF,wx);
    if(y-c.hh<roof+5||y+c.hh>waterFloorY(wx)-5)return false;
  }
  return !rocks.some(r=>x+c.hw+4>r.x&&x-c.hw-4<r.x+r.w&&y+c.hh+4>r.y&&y-c.hh-4<r.y+r.h);
}
function waterSwimmerRoute(c,vx,vy,rocks){
  const speed=Math.hypot(vx,vy);if(speed<1)return {vx,vy};
  const angle=Math.atan2(vy,vx),look=c.turtle?48:30;
  const clear=a=>[.33,.67,1].every(t=>waterSwimmerClear(c,c.x+Math.cos(a)*look*t,c.y+Math.sin(a)*look*t,rocks));
  if(clear(angle))return {vx,vy};
  // Search both sides, then turn back if a passage is too narrow for the shell.
  const side=(c.index+c.school)%2?1:-1;
  for(const offset of [.55,1.1,1.65,2.2,Math.PI])for(const sign of [side,-side]){
    const a=angle+offset*sign;if(clear(a))return {vx:Math.cos(a)*speed,vy:Math.sin(a)*speed};
  }
  return {vx:0,vy:0};
}
function updateWaterReefLife(dt){
  if(state!=='playing'||level!=='water'||dt<=0)return;
  if(waterReefSwimmers.length!==110)resetWaterReefLife();
  const rocks=waterReefObstacles(),steps=Math.ceil(dt/(1/60)),step=dt/steps;
  const frameX=waterReefSwimmers.map(c=>c.x),frameFacing=waterReefSwimmers.map(c=>c.direction);
  for(let sub=0;sub<steps;sub++){
    const time=waterTime-dt+(sub+1)*step,bins=new Map();
    // A spatial grid keeps the full reef inexpensive on phones and tablets.
    for(const c of waterReefSwimmers){const key=Math.floor(c.x/200)+','+Math.floor(c.y/200);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}
    const next=waterReefSwimmers.map((c,id)=>{
      const path=t=>c.turtle?waterTurtlePath(c.index,t):waterFishPath(c.school,c.index,t);
      const home=path(time),ahead=path(time+.1);
      let vx=(ahead.x-home.x)*10+(home.x-c.x)*.8,vy=(ahead.y-home.y)*10+(home.y-c.y)*.8;
      let alignX=0,alignY=0,neighbours=0;
      const gx=Math.floor(c.x/200),gy=Math.floor(c.y/200);
      for(let bx=gx-1;bx<=gx+1;bx++)for(let by=gy-1;by<=gy+1;by++)for(const other of bins.get(bx+','+by)||[]){
        if(other===c)continue;
        let dx=c.x-other.x,dy=c.y-other.y;
        const rx=c.hw+other.hw+16,ry=c.hh+other.hh+14;
        let distance=Math.hypot(dx/rx,dy/ry);
        if(distance<1.7){
          // Stable tie breaking also separates two creatures starting together.
          if(distance<.001){const angle=id*2.399;dx=Math.cos(angle);dy=Math.sin(angle);distance=.001;}
          const length=Math.hypot(dx,dy),force=(c.turtle?90:140)*Math.pow(1-distance/1.7,2);
          vx+=dx/length*force;vy+=dy/length*force;
        }
        if(!c.turtle&&other.school===c.school&&Math.hypot(dx,dy)<180){alignX+=other.vx;alignY+=other.vy;neighbours++;}
      }
      if(neighbours){vx=vx*.86+alignX/neighbours*.14;vy=vy*.86+alignY/neighbours*.14;}
      // React to Benny's body, with a little anticipation while he swims past.
      let dx=c.x-(player.x+player.w/2+player.vx*.12),dy=c.y-(player.y+player.h/2+player.vy*.1);
      const distance=Math.hypot(dx/(c.hw+player.w/2+65),dy/(c.hh+player.h/2+55));
      if(distance<1.5){
        if(Math.hypot(dx,dy)<.01){dx=id%2?1:-1;dy=id%3-1;}
        const force=(c.turtle?130:210)*Math.pow(1-distance/1.5,2),length=Math.hypot(dx,dy);
        vx+=dx/length*force;vy+=dy/length*force;
      }
      const limit=c.turtle?70:125,speed=Math.hypot(vx,vy);
      if(speed>limit){vx*=limit/speed;vy*=limit/speed;}
      const route=waterSwimmerRoute(c,vx,vy,rocks),blend=1-Math.exp(-step*(c.turtle?4:6));
      vx=c.vx+(route.vx-c.vx)*blend;vy=c.vy+(route.vy-c.vy)*blend;
      let x=c.x+vx*step,y=c.y+vy*step;
      // Swept small steps plus axis sliding prevent fleeing through solid stone.
      if(!waterSwimmerClear(c,x,y,rocks)){
        if(waterSwimmerClear(c,x,c.y,rocks)){y=c.y;vy=0;}
        else if(waterSwimmerClear(c,c.x,y,rocks)){x=c.x;vx=0;}
        else{x=c.x;y=c.y;vx=-c.vx*.35;vy=-c.vy*.35;}
      }
      // A turtle gives way but never swims its solid shell through Benny.
      if(c.turtle&&player.inWater&&!player.breaching&&!overlap(player,waterTurtleBody(c))&&overlap(player,waterTurtleBody(c,x,y))){
        if(!overlap(player,waterTurtleBody(c,x,c.y))&&waterSwimmerClear(c,x,c.y,rocks)){y=c.y;vy=0;}
        else if(!overlap(player,waterTurtleBody(c,c.x,y))&&waterSwimmerClear(c,c.x,y,rocks)){x=c.x;vx=0;}
        else{x=c.x;y=c.y;vx=vy=0;}
      }
      const actualX=(x-c.x)/step;
      return {x,y,vx,vy,direction:Math.abs(actualX)>.5?Math.sign(actualX):c.direction};
    });
    next.forEach((pose,i)=>Object.assign(waterReefSwimmers[i],pose));
  }
  waterReefSwimmers.forEach((c,i)=>{const dx=c.x-frameX[i];c.direction=Math.abs(dx)>dt*.5?Math.sign(dx):frameFacing[i];});
}
function waterTurtleArtScale(){return TURTLE_ANIMATION.swim.scaleX;}
function waterTurtlePainting(step){return turtleCyclePainting('swim',step/TURTLE_ANIMATION_STEPS);}
function drawWaterTurtle(pose){
  const a=WATER_REEF_ART.turtle;if(!a.image.complete||!a.image.naturalWidth)return;
  ctx.save();ctx.translate(pose.x-cameraX,pose.y);ctx.scale(pose.direction,1);
  const painting=turtleCyclePainting('swim',pose.cycle??pose.stroke??0);if(painting)ctx.drawImage(painting,-65,-50);ctx.restore();
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
