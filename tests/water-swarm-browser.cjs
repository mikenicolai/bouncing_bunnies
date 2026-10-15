const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[];
  for(const url of ['http://127.0.0.1:8772/index.html','file://'+process.cwd()+'/index.html']){
   const page=await browser.newPage({viewport:{width:1100,height:900}});page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.waitForFunction(()=>PAINTED_COIN.image.naturalWidth&&Object.values(WATER_REEF_ART).every(a=>a.image.naturalWidth));
   await page.evaluate(()=>{beginDeveloperSession();level='water';start();soundOn=false;state='review';});
   const live=await page.evaluate(()=>{
    const result=[];
    for(const index of [2,105]){
     waterTime=0;resetWaterReefLife();const c=waterReefSwimmers[index];
     player.x=c.x+35-player.w/2;player.y=c.y-player.h/2;player.vx=player.vy=0;const x=c.x;
     state='playing';for(let f=0;f<60;f++){waterTime+=1/60;updateWaterReefLife(1/60);}state='review';
     const pose=c.turtle?waterTurtlePose(c.index):waterFishPose(c.school,c.index);
     result.push({fled:c.x<x-15,live:pose.x===c.x&&pose.y===c.y,facing:pose.direction===c.direction});
    }return result;
   });assert(live.every(c=>c.fled&&c.live&&c.facing),'the actual render poses follow reactive fish and turtles');
   // Check that every world's collectible and the HUD draw the same native asset.
   const art=await page.evaluate(readPixels=>{
    const calls=[],original=ctx.drawImage;ctx.drawImage=function(...args){if(args[0]===PAINTED_COIN.image)calls.push(args.slice(1));return original.apply(this,args);};
    try{cameraX=0;for(const name of ['meadow','air','water','earth','fire','final']){level=name;drawCoin({x:400,y:300,bob:0,taken:false},Math.PI/6);}drawHUD();}finally{ctx.drawImage=original;}
    let corner=null,center=null;
    if(readPixels){const c=document.createElement('canvas');c.width=1283;c.height=1226;const p=c.getContext('2d');p.drawImage(PAINTED_COIN.image,0,0);corner=p.getImageData(0,0,1,1).data[3];center=Array.from(p.getImageData(640,600,1,1).data);}
    return {count:calls.length,crops:calls.every(a=>a[0]===190&&a[1]===154&&a[2]===910&&a[3]===910),corner,center};
   },url.startsWith('http'));assert.equal(art.count,7);assert(art.crops);if(url.startsWith('http'))assert(art.corner<8&&art.center[3]>240&&art.center[0]>art.center[2]+60,'painted gold with genuine transparency');
   // Use the real game loop from shore: all reef swimmers continue moving.
   await page.evaluate(()=>{level='water';start();soundOn=false;});const before=await page.evaluate(()=>({time:waterTime,x:waterFishPose(0,0).x}));await page.waitForTimeout(350);
   assert(await page.evaluate(b=>!player.inWater&&waterTime>b.time&&waterFishPose(0,0).x!==b.x,before));
   const frozen=await page.evaluate(()=>{state='map';return JSON.stringify(waterReefSwimmers);});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>JSON.stringify(waterReefSwimmers)),frozen);
   if(url.startsWith('http')){
    for(const viewport of [{width:1100,height:900},{width:390,height:844},{width:844,height:390}]){
     await page.setViewportSize(viewport);await page.waitForTimeout(100);
     await page.evaluate(()=>{level='water';start();soundOn=false;state='review';waterTime=2;resetWaterReefLife();player.inWater=true;player.x=1740;player.y=390;player.vx=player.vy=0;cameraX=1470;cameraY=250;render(0);});
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     await page.locator('canvas').first().screenshot({path:`previews/water-swarm-${viewport.width}.png`});
    }
    // Large and actual-size comparison, using the production drawing helper.
    const image=await page.evaluate(()=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#254b50';ctx.fillRect(0,0,500,240);drawPaintedCoin(120,110,88);drawPaintedCoin(280,110,14);drawPaintedCoin(340,110,13);drawPaintedCoin(400,110,14,.35);ctx.restore();return canvas.toDataURL().split(',')[1];});fs.writeFileSync('previews/painted-coin-v1.png',Buffer.from(image,'base64'));
   }
   if(url.startsWith('http')){
    await page.setViewportSize({width:1100,height:900});await page.goto('http://127.0.0.1:8772/previews/water-reef-life.html');await page.waitForFunction(()=>ready);await page.locator('[data-scene="school"]').click();
    const game=page.frames().find(f=>f.parentFrame()),before=await game.evaluate(()=>({x:player.x,fish:waterFishPose(0,0).x}));await page.waitForTimeout(600);
    assert(await game.evaluate(b=>player.x!==b.x&&waterFishPose(0,0).x!==b.fish,before),'swim-through preview animates Benny and the school');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS reef swarm browser: live fleeing fish/turtle render poses, actual game-loop shore animation/pause, shared painted coin in all six worlds and HUD, native transparency, desktop/portrait/landscape and HTTP/direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
