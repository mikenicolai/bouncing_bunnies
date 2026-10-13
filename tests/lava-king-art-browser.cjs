const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/lava-king-review.html');const game=page.frames().find(f=>f.parentFrame());assert(game);
  await game.waitForFunction(()=>lavaKingSheet.naturalWidth&&fireGroundSheet.naturalWidth);
  const art=await game.evaluate(()=>{
   const sw=lavaKingSheet.naturalWidth/4,sh=lavaKingSheet.naturalHeight/2;
   return{width:lavaKingSheet.naturalWidth,height:lavaKingSheet.naturalHeight,src:lavaKingSheet.src,poses:Array.from({length:8},(_,i)=>{
    const c=document.createElement('canvas');c.width=Math.ceil(sw);c.height=Math.ceil(sh);const p=c.getContext('2d');p.drawImage(lavaKingSheet,i%4*sw,Math.floor(i/4)*sh,sw,sh,0,0,sw,sh);
    const data=p.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=0,maxY=0;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    const [ax,ay]=LAVA_KING_ART.anchors[i];
    return{minX,minY,maxX,maxY,corner:data[3],helmet:p.getImageData(Math.round(ax),Math.round(ay-196),1,1).data[3]};
   })};
  });assert.equal(art.width,1774);assert.equal(art.height,887);assert(art.src.endsWith('/lava-king-v2.png'));
  for(const [i,p] of art.poses.entries()){assert.equal(p.corner,0);assert(p.minX>8&&p.minY>8&&p.maxX<443&&p.maxY<440,`pose ${i} keeps its full equipment inside its own cell`);assert(p.helmet>230,`pose ${i} registers the helmet inside the solid body`);}
  for(const scene of ['shield','windup','slash','cast','defeated']){
   await page.locator(`[data-scene="${scene}"]`).click();assert(await game.evaluate(()=>developerRun&&lives===3));
   await game.evaluate(()=>render(0));
  }
  await page.locator('[data-scene="shield"]').click();
  fs.writeFileSync('previews/lava-king-painted-v2.png',Buffer.from(await game.evaluate(()=>{cameraY=fireCameraTargetY();render(0);return canvas.toDataURL().split(',')[1];}),'base64'));
  await page.locator('#live').click();await page.waitForTimeout(450);assert(await game.evaluate(()=>lavaKing.age>0&&state==='playing'&&lavaKing.hp===10));
  await game.evaluate(()=>{state='review';lavaKingPhase('flight');updateLavaKing(1);render(0);});assert(await game.evaluate(()=>lavaKing.phase==='flight'&&lavaKing.y+lavaKing.h<FIRE_KING_ARENA.y-100));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.locator('[data-scene="shield"]').click();await game.evaluate(()=>render(0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>lavaKingSheet.naturalWidth);
  await local.evaluate(()=>{beginDeveloperSession();level='fire';start();fireArrow.owned=true;player.x=10340;player.y=-558;beginLavaKing();state='review';cameraX=10300;cameraY=fireCameraTargetY();for(const phase of ['patrol','shield','windup','slash','cast','flight','recover']){lavaKingPhase(phase);render(0);}});
  assert.deepEqual(errors,[]);console.log('PASS painted Lava King: native transparent eight-pose atlas, complete equipment, registered helmets, shield/sword/cast/hurt/flight rendering, live battle, portrait/landscape and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
