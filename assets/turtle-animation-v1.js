// Registered painted poses share a smooth six-frame cycle without pixel reads.
const TURTLE_ANIMATION_STEPS=48;
const TURTLE_ANIMATION={
  walk:{asset:'assets/turtle-walk-v1.png',width:190,height:100,x:95,y:80,scaleX:144/512,
    anchors:[[156,430],[156,430],[156,432],[125,395],[125,395],[125,394]],paintings:[]},
  swim:{asset:'assets/turtle-swim-v1.png',width:130,height:100,x:65,y:50,scaleX:.17,
    anchors:[[305],[305],[305],[255],[255],[255]],paintings:[]}
};
for(const a of Object.values(TURTLE_ANIMATION)){a.image=new Image();a.image.src=a.asset;}
function turtleAnimationLayers(cycle){
  const phase=((cycle%1)+1)%1*6,frame=Math.floor(phase),raw=phase-frame;
  return{frame,next:(frame+1)%6,mix:raw*raw*(3-2*raw)};
}
function turtleCyclePainting(mode,cycle){
  const a=TURTLE_ANIMATION[mode];
  if(!a.image.complete||!a.image.naturalWidth)return null;
  const step=Math.floor((((cycle%1)+1)%1)*TURTLE_ANIMATION_STEPS);
  if(a.paintings[step])return a.paintings[step];
  const c=document.createElement('canvas');c.width=a.width;c.height=a.height;
  const paint=c.getContext('2d'),pose=turtleAnimationLayers(step/TURTLE_ANIMATION_STEPS);
  // Add premultiplied colors so the overlapping shell remains fully opaque.
  paint.globalCompositeOperation='lighter';
  for(const [frame,weight] of [[pose.frame,1-pose.mix],[pose.next,pose.mix]]){
    if(!weight)continue;
    const sw=a.image.naturalWidth/3,sh=a.image.naturalHeight/2,anchor=a.anchors[frame];
    const ax=mode==='walk'?230:256,ay=mode==='walk'?anchor[1]:anchor[0];
    const sy=mode==='walk'?63/(anchor[1]-anchor[0]):a.scaleX;
    paint.globalAlpha=weight;
    paint.drawImage(a.image,frame%3*sw,Math.floor(frame/3)*sh,sw,sh,a.x-ax*a.scaleX,a.y-ay*sy,sw*a.scaleX,sh*sy);
  }
  a.paintings[step]=c;return c;
}
function drawWalkingEarthTurtle(x,floor,width,facing){
  const painting=turtleCyclePainting('walk',earthTurtle.cycle);
  if(!painting){drawEarthAnimal('turtle',x,floor,width,facing);return;}
  ctx.save();ctx.translate(x-cameraX,floor);ctx.scale(facing,1);ctx.drawImage(painting,-95,-80);ctx.restore();
}
