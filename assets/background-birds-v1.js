// Small distant flocks are scenery only, with quiet gaps between flybys.
const BACKGROUND_BIRD_SETTINGS={
  air:{delay:4,interval:22,count:4},
  earth:{delay:12,interval:46,count:2},
  water:{delay:8,interval:58,count:2}
};
const BIRD_PARALLAX=.12;
let backgroundBirds=[],backgroundBirdClock=0,nextBackgroundFlock=Infinity,backgroundFlockNumber=0;
function resetBackgroundBirds(){
  backgroundBirds=[];backgroundBirdClock=0;backgroundFlockNumber=0;
  nextBackgroundFlock=BACKGROUND_BIRD_SETTINGS[level]?.delay??Infinity;
}
function updateBackgroundBirds(dt){
  const settings=BACKGROUND_BIRD_SETTINGS[level];
  if(!settings){backgroundBirds=[];return;}
  backgroundBirdClock+=dt;
  if(backgroundBirdClock>=nextBackgroundFlock){
    nextBackgroundFlock+=settings.interval;
    const flock=backgroundFlockNumber++,direction=flock%2?-1:1;
    // Water birds belong to the open sky, never underwater or in air caves.
    if(level!=='water'||WATER_SURFACE-cameraY>45){
      const count=settings.count+(flock%3===1?1:0),speed=74+(flock%3)*9;
      const band=Math.min(190,playfieldHeight()*.33),altitude=46+(flock%3)*band*.23;
      for(let i=0;i<count;i++){
        backgroundBirds.push({
          x:cameraX*BIRD_PARALLAX+(direction>0?-65:W+65)-direction*i*37,
          y:level==='water'?88+(flock%3)*24+i*13:cameraY*.07+altitude+i*14,
          vx:direction*speed,age:0,life:(W+260)/speed,
          scale:.78+(i%3)*.14,phase:i*1.7+flock,level
        });
      }
    }
  }
  for(const bird of backgroundBirds){bird.x+=bird.vx*dt;bird.age+=dt;}
  backgroundBirds=backgroundBirds.filter(bird=>bird.age<bird.life&&bird.level===level);
}
function backgroundBirdPose(bird){
  return {x:bird.x-cameraX*BIRD_PARALLAX,
    y:bird.y-cameraY*(level==='water'?1:.07)+Math.sin(bird.age*1.6+bird.phase)*5,
    flap:Math.sin(bird.age*8+bird.phase)*9};
}
const SKY_BIRD_ART={"asset":"assets/sky-birds-flight-v1.png","width":1254,"height":1254,"bodyWidth":573,"frames":[{"sx":49,"sy":35,"sw":585,"sh":565,"ax":450,"ay":480},{"sx":650,"sy":178,"sw":576,"sh":422,"ax":1042,"ay":482},{"sx":36,"sy":744,"sw":598,"sh":444,"ax":450,"ay":944},{"sx":648,"sy":747,"sw":580,"sh":323,"ax":1044,"ay":948}]};
const skyBirdSheet=new Image();skyBirdSheet.src=SKY_BIRD_ART.asset;
const SKY_BIRD_FLAP=[0,1,3,2,3,1];
const skyBirdPaintings=[];
function skyBirdPainting(slot,mixStep){
  const key=slot*6+mixStep;if(skyBirdPaintings[key])return skyBirdPaintings[key];
  const c=document.createElement('canvas');c.width=c.height=96;
  const paint=c.getContext('2d'),mix=mixStep/6;
  // Registered bodies keep the beak and torso steady through each wing stroke.
  // Add on transparency to blend feather poses without fading the shared body.
  paint.globalCompositeOperation='lighter';
  for(const [frame,weight] of [[SKY_BIRD_FLAP[slot],1-mix],[SKY_BIRD_FLAP[(slot+1)%6],mix]]){
    if(!weight)continue;const f=SKY_BIRD_ART.frames[frame],scale=.09;
    paint.globalAlpha=weight;
    paint.drawImage(skyBirdSheet,f.sx,f.sy,f.sw,f.sh,48+(f.sx-f.ax)*scale,64+(f.sy-f.ay)*scale,f.sw*scale,f.sh*scale);
  }
  skyBirdPaintings[key]=c;return c;
}
function drawPaintedSkyBird(bird){
  if(!skyBirdSheet.complete||!skyBirdSheet.naturalWidth)return;
  const p=backgroundBirdPose(bird),phase=((bird.age*8+bird.phase)/(Math.PI*2)*6%6+6)%6;
  const slot=Math.floor(phase),mixStep=Math.floor((phase-slot)*6),scale=33/SKY_BIRD_ART.bodyWidth/.09;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(bird.vx>0?bird.scale:-bird.scale,bird.scale);
  ctx.globalAlpha=.84*Math.max(0,Math.min(1,bird.age/.5,(bird.life-bird.age)/.7));
  ctx.drawImage(skyBirdPainting(slot,mixStep),-48*scale,-64*scale,96*scale,96*scale);ctx.restore();
}
function drawBackgroundBirds(){
  if(!BACKGROUND_BIRD_SETTINGS[level])return;
  ctx.save();
  if(level==='water'){
    const skyHeight=Math.max(0,Math.min(H,WATER_SURFACE-cameraY-12));
    if(skyHeight<1){ctx.restore();return;}
    ctx.beginPath();ctx.rect(0,0,W,skyHeight);ctx.clip();
  }
  for(const bird of backgroundBirds){
    const p=backgroundBirdPose(bird);
    if(p.x<-90||p.x>W+90||p.y<-30||p.y>H+30)continue;
    drawPaintedSkyBird(bird);
  }
  ctx.restore();
}
