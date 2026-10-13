// Painted exposed cliff silhouettes; embedded verbatim in index.html.
const EARTH_CLIFF_ART={"asset":"assets/wildwood-cliff-edge-v1.png","width":1024,"height":1536,"anchorX":400,"anchorY":110,"scaleX":0.22,"profile":[[110,128],[126,117],[142,109],[158,104],[174,119],[190,116],[206,112],[222,112],[238,212],[254,247],[270,264],[286,308],[302,335],[318,342],[334,327],[350,321],[366,327],[382,320],[398,391],[414,389],[430,393],[446,377],[462,357],[478,346],[494,401],[510,428],[526,432],[542,430],[558,424],[574,424],[590,433],[606,438],[622,435],[638,397],[654,386],[670,358],[686,346],[702,357],[718,349],[734,347],[750,371],[766,369],[782,430],[798,448],[814,448],[830,442],[846,489],[862,498],[878,499],[894,502],[910,498],[926,486],[942,474],[958,468],[974,459],[990,451],[1006,449],[1022,451],[1038,486],[1054,501],[1070,517],[1086,519],[1102,522],[1118,520],[1134,507],[1150,493],[1166,469],[1182,445],[1198,434],[1214,474],[1230,471],[1246,460],[1262,440],[1278,431],[1294,429],[1310,434],[1326,442],[1342,436],[1358,422],[1374,439],[1390,437],[1406,440],[1422,448],[1438,453],[1454,449],[1470,437],[1486,433],[1502,429],[1518,416],[1534,408],[1535,408]]};
const earthCliffSheet=new Image();earthCliffSheet.src=EARTH_CLIFF_ART.asset;
let earthSurfacePainting=null,earthCliffPainting=null;
function earthSurfaceArt(){
  if(earthSurfacePainting)return earthSurfacePainting;
  const image=earthGroundSheet,c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
  const paint=c.getContext('2d');paint.drawImage(image,0,0);
  // Fade the grass painting into the continuous world-aligned soil beneath it.
  paint.globalCompositeOperation='destination-in';
  const fade=paint.createLinearGradient(0,400,0,c.height);fade.addColorStop(0,'#fff');fade.addColorStop(1,'rgba(255,255,255,0)');
  paint.fillStyle=fade;paint.fillRect(0,0,c.width,c.height);
  earthSurfacePainting=c;return c;
}
function earthCliffArt(){
  if(earthCliffPainting)return earthCliffPainting;
  const a=EARTH_CLIFF_ART,c=document.createElement('canvas');c.width=a.width;c.height=a.height;
  const paint=c.getContext('2d');paint.drawImage(earthCliffSheet,0,0);
  // Blend the inward edge and foot into the existing soil; retain the original PNG.
  paint.globalCompositeOperation='destination-in';
  const side=paint.createLinearGradient(660,0,a.width,0);side.addColorStop(0,'#fff');side.addColorStop(1,'rgba(255,255,255,0)');
  paint.fillStyle=side;paint.fillRect(0,0,c.width,c.height);
  const foot=paint.createLinearGradient(0,a.height-160,0,a.height);foot.addColorStop(0,'#fff');foot.addColorStop(1,'rgba(255,255,255,0)');
  paint.fillStyle=foot;paint.fillRect(0,0,c.width,c.height);
  earthCliffPainting=c;return c;
}
function earthCliffLayout(p){
  const previous=earthGround[p.id-1];
  if(!previous||!earthCliffSheet.complete||!earthCliffSheet.naturalWidth)return null;
  const a=EARTH_CLIFF_ART,height=previous.y-p.y;
  return {height,bottom:previous.y,scaleY:height/(a.height-a.anchorY)};
}
function clipEarthGround(p,depth,cliff){
  const x=p.x-cameraX;
  ctx.beginPath();ctx.moveTo(x+(cliff?-85:0),p.y-45);ctx.lineTo(x+p.w,p.y-45);
  ctx.lineTo(x+p.w,p.y+depth);ctx.lineTo(x,p.y+depth);
  if(cliff){
    ctx.lineTo(x,cliff.bottom);
    // Registered solid-body samples keep soil behind the transparent painted edge.
    // The last few pixels merge into the lower plateau, rather than leaving a seam.
    const a=EARTH_CLIFF_ART;
    for(let i=a.profile.length-1;i>=0;i--){
      const [sy,sx]=a.profile[i],y=p.y+(sy-a.anchorY)*cliff.scaleY;
      const merge=Math.min(1,Math.max(0,(cliff.bottom-y)/40));
      ctx.lineTo(x+(sx-a.anchorX)*a.scaleX*merge,y);
    }
  }else ctx.lineTo(x,p.y);
  ctx.closePath();ctx.clip();
}
function drawEarthGround(p){
  const x=p.x-cameraX,depth=Math.max(p.h,cameraY+H-p.y),cliff=earthCliffLayout(p),margin=cliff?85:0;
  ctx.save();clipEarthGround(p,depth,cliff);
  ctx.fillStyle='#65452f';ctx.fillRect(x-margin,p.y,p.w+margin,depth);
  if(earthGroundSheet.complete&&earthGroundSheet.naturalWidth){
    const image=earthGroundSheet,scale=.45,soilY=345,soilH=400;
    const tileW=image.naturalWidth*scale,tileH=soilH*scale;
    const minX=Math.max(p.x-margin,cameraX),maxX=Math.min(p.x+p.w,cameraX+W);
    const minY=Math.max(p.y,cameraY),maxY=Math.min(p.y+depth,cameraY+H);
    ctx.save();ctx.beginPath();ctx.rect(x-margin,p.y,p.w+margin,depth);ctx.clip();
    // One world-space grid for every plateau: soil does not slide with the camera.
    for(let row=Math.floor(minY/tileH);row*tileH<maxY;row++){
      for(let col=Math.floor(minX/tileW);col*tileW<maxX;col++){
        const flipX=Math.abs(col%2)===1,flipY=Math.abs(row%2)===1;
        ctx.save();ctx.translate(col*tileW-cameraX+(flipX?tileW:0),row*tileH+(flipY?tileH:0));ctx.scale(flipX?-1:1,flipY?-1:1);
        ctx.drawImage(image,0,soilY,image.naturalWidth,soilH,0,0,tileW+.5,tileH+.5);ctx.restore();
      }
    }
    ctx.restore();
    const surface=earthSurfaceArt();
    for(let col=Math.floor(minX/tileW);col*tileW<maxX;col++){
      const flip=Math.abs(col%2)===1;
      ctx.save();ctx.translate(col*tileW-cameraX+(flip?tileW:0),p.y-235*scale);ctx.scale(flip?-1:1,1);
      ctx.drawImage(surface,0,0,image.naturalWidth,image.naturalHeight,0,0,tileW,image.naturalHeight*scale);ctx.restore();
    }
  }else{ctx.fillStyle='#a7c96e';ctx.fillRect(x,p.y-7,p.w,16);}
  ctx.restore();
  if(cliff&&x>-240&&x<W+100&&cliff.bottom>cameraY&&p.y-45<cameraY+H){
    const a=EARTH_CLIFF_ART;
    ctx.drawImage(earthCliffArt(),x-a.anchorX*a.scaleX,p.y-a.anchorY*cliff.scaleY,a.width*a.scaleX,a.height*cliff.scaleY);
  }
}
