const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/water-reef-life.html');await page.waitForFunction(()=>ready);const game=page.frames().find(f=>f.parentFrame());assert(game);
  await page.locator('#pause').click();
  const alpha=await game.evaluate(()=>Object.entries(WATER_REEF_ART).map(([name,a])=>{const c=document.createElement('canvas');c.width=a.width;c.height=a.height;const p=c.getContext('2d');p.drawImage(a.image,0,0);return {name,corner:p.getImageData(0,0,1,1).data[3]};}));for(const a of alpha)assert(a.corner<8,a.name+' genuine transparency');
  async function capture(scene){fs.writeFileSync(`previews/painted-reef-${scene}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));}
  for(const scene of ['shallows','reef','cave']){await page.locator(`[data-scene="${scene}"]`).click();assert(await game.evaluate(()=>developerRun));await capture(scene);}
  // Actual plant drawing removes exposed root pixels below the local sloping ground.
  const roots=await game.evaluate(()=>{
   const p=waterReefPlantPose(14);cameraX=p.x-100;cameraY=p.base-160;
   const draw=()=>{ctx.fillStyle='#12abef';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawWaterReefPlant(p);ctx.restore();};
   const buriedPixels=()=>{let count=0;for(let dx=-20;dx<=20;dx+=2)for(let dy=4;dy<=16;dy++){const pixel=ctx.getImageData(Math.round(p.x+dx-cameraX),Math.round(waterFloorY(p.x+dx)+dy-cameraY),1,1).data;if(Math.abs(pixel[0]-18)+Math.abs(pixel[1]-171)+Math.abs(pixel[2]-239)>28)count++;}return count;};
   draw();const clipped=buriedPixels();const original=ctx.clip;ctx.clip=()=>{};draw();ctx.clip=original;const raw=buriedPixels();
   return{clipped,raw,coralBase:waterReefPlantPose(0,'coral').base,grassBase:waterReefPlantPose(0).base};
  });assert.equal(roots.clipped,0,'root tips are buried along the slope');assert(roots.raw>5,'the native sprite contains root tips that need burial');assert(roots.coralBase>roots.grassBase+10);
  // Mirroring and all colour variants draw from the original fish silhouettes.
  await game.evaluate(()=>{level='water';state='review';waterTime=2;cameraX=1650;cameraY=330;render(0);for(let i=0;i<4;i++){drawWaterReefFish({x:1830+i*65,y:440,direction:1},i);drawWaterReefFish({x:1830+i*65,y:490,direction:-1},i);}});
  fs.writeFileSync('previews/painted-reef-fish-directions-v1.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  await page.locator('[data-scene="shallows"]').click();const frozen=await game.evaluate(()=>waterTime);await page.waitForTimeout(200);assert.equal(await game.evaluate(()=>waterTime),frozen);await page.locator('#pause').click();await page.waitForTimeout(200);assert(await game.evaluate(frozen=>waterTime>frozen,frozen));await page.locator('#pause').click();
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.locator('[data-scene="shallows"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture(viewport.width===390?'phone':'landscape');}
  await page.setViewportSize({width:1200,height:1050});await page.locator('.artwork').screenshot({path:'previews/painted-reef-artwork-v1.png'});
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>Object.values(WATER_REEF_ART).every(a=>a.image.naturalWidth));await local.evaluate(()=>{beginDeveloperSession();level='water';start();state='review';player.inWater=true;player.x=1500;player.y=348;cameraX=1340;cameraY=170;render(0);});
  assert.deepEqual(errors,[]);console.log('PASS painted reef browser: transparent fish/coral/sea-grass atlases, rooted sloping ground, both fish directions, shallows/reef/cave, pause/animation, portrait/landscape and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
