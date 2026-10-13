// Painted elemental rings with registered transparent openings. Embedded verbatim in index.html.
const ELEMENT_PORTALS={"meadow":{"label":"Meadow","asset":"assets/portal-meadow-v1.png","color":"#e9bc5b","deep":"#63532a","width":1254,"height":1254,"cx":626.0,"cy":540.0,"rx":331.0,"ry":328.0},"air":{"label":"Air","asset":"assets/portal-air-v1.png","color":"#77e4ed","deep":"#244e6b","width":1254,"height":1254,"cx":627.0,"cy":542.5,"rx":345.0,"ry":338.5},"water":{"label":"Sea","asset":"assets/portal-sea-v1.png","color":"#49c9d8","deep":"#174a68","width":1254,"height":1254,"cx":626.5,"cy":568.5,"rx":370.5,"ry":357.5},"fire":{"label":"Lava","asset":"assets/portal-lava-v1.png","color":"#ff9c43","deep":"#70233b","width":1254,"height":1254,"cx":625.0,"cy":583.5,"rx":383.0,"ry":367.5},"earth":{"label":"Plants / Trees","asset":"assets/portal-plants-v1.png","color":"#86d36a","deep":"#294c3b","width":1254,"height":1254,"cx":628.0,"cy":568.0,"rx":355.0,"ry":340.0}};
for(const portal of Object.values(ELEMENT_PORTALS)){portal.image=new Image();portal.image.src=portal.asset;}
function drawElementPortal(element,x,floor,size=184,time=0,active=true,fullBase=false){
  const p=ELEMENT_PORTALS[element];if(!p)return;
  const scale=size/p.width,cx=x-cameraX;
  const cy=fullBase?floor-(p.height-p.cy)*scale:floor-p.ry*scale-10;
  const rx=p.rx*scale*.985,ry=p.ry*scale*.985;
  if(cx+size<0||cx-size>W)return;
  ctx.save();
  if(!fullBase){ctx.beginPath();ctx.rect(cx-size,floor-size*1.4,size*2,size*1.4+18);ctx.clip();}
  ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
  const energy=ctx.createRadialGradient(cx-rx*.25,cy-ry*.2,1,cx,cy,Math.max(rx,ry));
  energy.addColorStop(0,active?'#edfff5':'#34464b');energy.addColorStop(.35,active?p.color:'#233236');energy.addColorStop(1,active?p.deep:'#111b23');
  ctx.globalAlpha=active?.88:.8;ctx.fillStyle=energy;ctx.fillRect(cx-rx,cy-ry,rx*2,ry*2);
  if(active){
    ctx.globalAlpha=.36;ctx.strokeStyle='#e6fffa';ctx.lineWidth=1.5;
    for(let i=0;i<5;i++){const r=.18+i*.18;ctx.beginPath();ctx.ellipse(cx+Math.sin(time*.7+i)*rx*.08,cy+Math.cos(time*.8+i)*ry*.07,rx*r,ry*r*.45,time*.3+i*.65,0,Math.PI*2);ctx.stroke();}
    for(let i=0;i<8;i++){const a=time*.6+i*Math.PI/4;ctx.globalAlpha=.25+.2*Math.sin(time*1.8+i);ctx.fillStyle='#f2fff2';ctx.beginPath();ctx.arc(cx+Math.cos(a)*rx*.7,cy+Math.sin(a)*ry*.65,1.5,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
  if(p.image.complete&&p.image.naturalWidth){
    ctx.filter=active?'none':'brightness(.58) saturate(.55)';ctx.shadowColor=p.color;ctx.shadowBlur=active?6+Math.sin(time*2)*2:0;
    ctx.drawImage(p.image,cx-p.cx*scale,cy-p.cy*scale,p.width*scale,p.height*scale);
  }else{
    ctx.strokeStyle=p.color;ctx.lineWidth=10;ctx.beginPath();ctx.ellipse(cx,cy,rx+8,ry+8,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
