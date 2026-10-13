const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>lavaKingFallenSheet.naturalWidth&&fireGroundSheet.naturalWidth);
  const scene=async direction=>page.evaluate(direction=>{
   beginDeveloperSession();level='fire';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();fireArrow.owned=true;player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();lavaKing.hp=1;lavaKing.phase='flight';lavaKing.y=-820;hitLavaKing(player,true,1);for(let i=0;i<120;i++)updateLavaKing(1/60);
   Object.assign(player,{x:lavaKingBody().x+(direction<0?LAVA_KING_BODY.w+10:-player.w-10),y:-558,h:58,vx:0,vy:0,onGround:true});cameraX=player.x-W*.4;cameraY=fireCameraTargetY();fireStoneClock=999;
  },direction);
  await scene(-1);
  const art=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=lavaKingFallenSheet.naturalWidth;c.height=lavaKingFallenSheet.naturalHeight;const p=c.getContext('2d');p.drawImage(lavaKingFallenSheet,0,0);const a=p.getImageData(0,0,c.width,c.height).data;
   let minX=c.width,minY=c.height,maxX=0,maxY=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>12){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
   return{width:c.width,height:c.height,corner:a[3],minX,minY,maxX,maxY,body:lavaKingBody(),crop:LAVA_KING_FALLEN_ART};
  });assert.equal(art.corner,0);assert.equal(art.width,1947);assert.equal(art.height,808);assert.equal(art.minX,art.crop.sx);assert.equal(art.minY,art.crop.sy);assert.equal(art.maxX-art.minX+1,art.crop.sw);assert.equal(art.maxY-art.minY+1,art.crop.sh);assert.equal(art.body.y+art.body.h,-500);
  await page.evaluate(()=>{state='review';render(0);});fs.writeFileSync('previews/lava-king-fallen-game-v1.png',Buffer.from(await page.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));await page.evaluate(()=>state='playing');
  await page.keyboard.down('ArrowLeft');await page.waitForTimeout(900);assert(await page.evaluate(()=>player.x===lavaKingBody().x+lavaKingBody().w),'keyboard walking is blocked by the corpse');
  await page.keyboard.press('Space');await page.waitForFunction(()=>player.x+player.w<lavaKingBody().x,{},{timeout:2500});await page.waitForFunction(()=>fireMode==='secondVolcano',{},{timeout:4000});await page.keyboard.up('ArrowLeft');assert(await page.evaluate(()=>lives===3&&lavaKing.defeated));
  // Real pointer stick + JUMP works from both sides in the phone layout.
  for(const direction of [-1,1]){
   await page.setViewportSize({width:390,height:844});await scene(direction);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.evaluate(()=>fitTouchControls());
   const point=await page.evaluate(direction=>{const r=canvas.getBoundingClientRect();return{x:r.left+(JOY.x+direction*(JOY.radius-12))*r.width/W,y:r.top+JOY.y*r.height/H,cx:r.left+JOY.x*r.width/W,jump:{x:r.left+ACTIONS.jump.x*r.width/W,y:r.top+ACTIONS.jump.y*r.height/H}};},direction);
   await page.mouse.move(point.cx,point.y);await page.mouse.down();await page.mouse.move(point.x,point.y);await page.waitForTimeout(900);
   assert(await page.evaluate(d=>player.x===(d<0?lavaKingBody().x+lavaKingBody().w:lavaKingBody().x-player.w),direction),'touch walking is blocked by the corpse');
   // A second finger presses the painted JUMP control while the stick is held.
   await page.touchscreen.tap(point.jump.x,point.jump.y);
   await page.waitForFunction(d=>d<0?player.x+player.w<lavaKingBody().x:player.x>lavaKingBody().x+lavaKingBody().w,direction,{timeout:3000});await page.mouse.up();assert(await page.evaluate(()=>lives===3&&state==='playing'));
  }
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>lavaKingFallenSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='fire';start();soundOn=false;fireArrow.owned=true;player.x=10340;player.y=-558;beginLavaKing();defeatLavaKing();for(let i=0;i<120;i++)updateLavaKing(1/60);state='review';cameraX=10500;cameraY=fireCameraTargetY();render(0);});
  assert.deepEqual(errors,[]);console.log('PASS fallen King browser: native transparent art/ground anchor, actual keyboard and pointer jump over solid corpse, open retreat, phone both directions, direct-file render and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
