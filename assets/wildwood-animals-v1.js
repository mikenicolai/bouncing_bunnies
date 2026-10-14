// Painted friendly wildlife and a rideable turtle. Embedded verbatim in index.html.
const earthGroundBirds=[460,810,1750,2630,4740];
const earthTurtle={x:650,w:144,min:500,max:970,speed:48,facing:1,shellHeight:63,cycle:0};
const EARTH_ANIMAL_ART={
  turtle:{asset:'assets/wildwood-turtle-v1.png',sx:86,sy:201,sw:1402,sh:636},
  bird:{asset:'assets/wildwood-bird-v1.png',sx:201,sy:72,sw:1045,sh:895}
};
for(const art of Object.values(EARTH_ANIMAL_ART)){art.image=new Image();art.image.src=art.asset;}
function resetEarthTurtle(){earthTurtle.x=650;earthTurtle.facing=1;earthTurtle.cycle=0;}
function earthTurtlePlatform(){
  const t=earthTurtle;
  return {x:t.x+43,y:earthGroundAt(t.x+t.w/2)-t.shellHeight,w:58,h:8,kind:'turtle',oneWay:true};
}
function updateEarthTurtle(dt){
  const t=earthTurtle,oldShell=earthTurtlePlatform(),oldX=t.x;
  // Reflect at the clearing edges, retaining overshoot so speed is frame-independent.
  t.cycle=(t.cycle+Math.abs(t.speed)*dt/54)%1;
  t.x+=t.facing*t.speed*dt;
  while(t.x>t.max||t.x<t.min){
    if(t.x>t.max){t.x=2*t.max-t.x;t.facing=-1;}
    if(t.x<t.min){t.x=2*t.min-t.x;t.facing=1;}
  }
  if(player.ridingTurtle){
    const center=player.x+player.w/2;
    if(!player.onGround||player.vy!==0||Math.abs(player.y+player.h-oldShell.y)>2||center<oldShell.x||center>oldShell.x+oldShell.w){player.ridingTurtle=false;return;}
    player.x+=t.x-oldX;player.y=earthTurtlePlatform().y-player.h;
  }
}
function leaveEarthTurtle(){
  // Release at the current shell position: jumping must never teleport to a side.
  player.ridingTurtle=false;
}
function toggleEarthTurtle(){
  if(level!=='earth'||state!=='playing')return;
  if(player.ridingTurtle){
    leaveEarthTurtle();player.vy=-280;player.onGround=false;player.jumpAge=0;player.boosts=0;return;
  }
  const t=earthTurtle,ground=earthGroundAt(t.x+t.w/2);
  if(Math.abs(player.x+player.w/2-(t.x+t.w/2))>115||Math.abs(player.y+player.h-ground)>45)return;
  player.duck=false;player.duckVisual=0;player.h=58;
  const shell=earthTurtlePlatform();player.x=shell.x+shell.w/2-player.w/2;
  player.y=shell.y-player.h;player.vx=0;player.vy=0;player.onGround=true;
  player.ridingTurtle=true;player.jumpAge=9;player.boosts=0;
}
function drawEarthAnimal(name,x,floor,width,facing=1,stretch=1){
  const a=EARTH_ANIMAL_ART[name];if(!a.image.complete||!a.image.naturalWidth)return;
  const height=width*a.sh/a.sw;
  ctx.save();ctx.translate(x-cameraX,floor);ctx.scale(facing,stretch);
  ctx.drawImage(a.image,a.sx,a.sy,a.sw,a.sh,-width/2,-height,width,height);ctx.restore();
}
function drawEarthAnimals(){
  for(const [i,x] of earthGroundBirds.entries()){
    if(x<cameraX-50||x>cameraX+W+50)continue;
    drawEarthAnimal('bird',x,earthGroundAt(x)+1,40,i%2?-1:1,1+Math.sin(earthTime*2.4+i*2)*.015);
  }
  const t=earthTurtle,x=t.x-cameraX,y=earthGroundAt(t.x+t.w/2);
  if(x<W+180&&x+t.w>-180){
    drawWalkingEarthTurtle(t.x+t.w/2,y,t.w,t.facing);
    if(Math.abs(player.x+player.w/2-(t.x+t.w/2))<155&&Math.abs(player.y+player.h-y)<100){
      ctx.save();ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff6d4';
      ctx.shadowColor='#284332';ctx.shadowBlur=4;
      ctx.fillText(player.ridingTurtle?'Jump to hop off':'Jump onto the shell',x+t.w/2,y-132);ctx.restore();
    }
  }
}
