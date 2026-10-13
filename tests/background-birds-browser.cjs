const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[],page=await browser.newPage({viewport:{width:1200,height:1050}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/background-birds.html');await page.waitForFunction(()=>ready);const game=page.frames().find(f=>f.parentFrame());assert(game);
  await page.locator('#pause').click();
  const painting=await game.evaluate(()=>{
   const c=document.createElement('canvas');c.width=c.height=1254;const p=c.getContext('2d');p.drawImage(skyBirdSheet,0,0);
   return {corner:p.getImageData(0,0,1,1).data[3],centerAlpha:Array.from({length:36},(_,i)=>skyBirdPainting(Math.floor(i/6),i%6).getContext('2d').getImageData(48,64,1,1).data[3])};
  });assert.equal(painting.corner,0,'original sprite is transparent');assert(painting.centerAlpha.every(a=>a>230),'blending the wings must not fade the torso');
  await page.locator('.poses').screenshot({path:'previews/painted-sky-bird-poses-v1.png'});
  async function capture(world){fs.writeFileSync(`previews/painted-sky-birds-${world}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));}
  for(const world of ['air','earth','water','fire']){
   await page.locator(`[data-world="${world}"]`).click();assert(await game.evaluate(()=>developerRun));assert.equal(await game.evaluate(()=>level),world);
   assert.equal(await game.evaluate(()=>backgroundBirds.length),world==='air'?4:world==='fire'?0:2);
   if(world!=='fire')await capture(world);
  }
  await page.locator('[data-world="air"]').click();const frozen=await game.evaluate(()=>JSON.stringify(backgroundBirds));await page.waitForTimeout(200);assert.equal(await game.evaluate(()=>JSON.stringify(backgroundBirds)),frozen);
  await page.locator('#pause').click();await page.waitForTimeout(300);assert.notEqual(await game.evaluate(()=>JSON.stringify(backgroundBirds)),frozen);await page.locator('#pause').click();
  // Render both flight directions and every interpolated wing pose using real scenery rendering.
  await game.evaluate(()=>{level='air';backgroundBirds=[{x:W*.45,y:150,vx:74,scale:1,age:3,life:20,phase:0,level},{x:W*.6,y:150,vx:-74,scale:1,age:3,life:20,phase:2,level}];for(let i=0;i<36;i++){backgroundBirds.forEach(b=>b.age=3+i*.02);render(0);}});await capture('directions');
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('[data-world="air"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture(viewport.width===390?'phone':'landscape');
  }
  await game.evaluate(()=>{level='water';cameraY=WATER_SURFACE+100;backgroundBirds=[{x:100,y:88,vx:74,scale:1,age:3,life:20,phase:0,level}];let draws=0;const original=drawPaintedSkyBird;drawPaintedSkyBird=()=>draws++;drawBackgroundBirds();drawPaintedSkyBird=original;window.hiddenBirdDraws=draws;});assert.equal(await game.evaluate(()=>hiddenBirdDraws),0,'underwater caves hide birds');
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>skyBirdSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='air';start();state='review';nextBackgroundFlock=0;updateBackgroundBirds(6);render(0);});assert.equal(await local.evaluate(()=>backgroundBirds.length),4);
  assert.deepEqual(errors,[]);console.log('PASS painted sky birds browser: transparent four-pose art, steady opaque bodies through 36 wing blends, both flight directions, live/pause, Air/Earth/Water/Fire scenery, phone/landscape and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
