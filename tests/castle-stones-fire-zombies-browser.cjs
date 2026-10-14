const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({hasTouch:true,viewport:{width:1100,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>finalHallSheet.naturalWidth&&earthGoblinSheet.naturalWidth&&waterTridentSheet.naturalWidth&&windStarSheet.naturalWidth&&fireZombieSprites.length);
  await page.evaluate(()=>{beginDeveloperSession();level='final';start();soundOn=false;state='review';cameraX=3380;cameraY=0;});
  const paint=await page.evaluate(()=>{
   const p=finalPlatforms.find(finalHallBlock),sample=()=>Array.from(ctx.getImageData(p.x-cameraX+10,p.y+9,p.w-20,p.h-15).data),calls=[],old=ctx.fillRect;
   ctx.fillRect=function(...args){calls.push({color:this.fillStyle,args});return old.apply(this,args);};ctx.clearRect(0,0,W,H);drawFinalPlatform({...p,kind:'castle'},true);const floor=sample();ctx.clearRect(0,0,W,H);drawFinalPlatform(p,true);const block=sample();ctx.fillRect=old;
   const order=[],original={drawBunny,drawFinalMonsters,drawFinalForegroundBlocks};drawBunny=()=>order.push('bunny');drawFinalMonsters=()=>order.push('monsters');drawFinalForegroundBlocks=()=>order.push('blocks');render(0);drawBunny=original.drawBunny;drawFinalMonsters=original.drawFinalMonsters;drawFinalForegroundBlocks=original.drawFinalForegroundBlocks;
   return{match:floor.every((v,i)=>v===block[i]),marker:calls.some(c=>c.color==='#898784'||c.args[3]===3),order};
  });assert(!paint.match,'raised foreground faces have distinct shading from the same stone source');assert(!paint.marker,'no flat gray ground marker');assert(paint.order.indexOf('blocks')>paint.order.indexOf('bunny')&&paint.order.indexOf('blocks')>paint.order.indexOf('monsters'));
  for(const [label,width,height] of [['desktop',1100,800],['phone',390,844]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>{level='final';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();finalGateLift=1;player.x=3438;player.y=412;player.onGround=true;player.vx=0;player.invincible=999;finalMonsters=[{...finalMonsters.find(m=>m.kind==='goblin'),x:3620,min:3580,max:3740,patrolDir:-1}];cameraX=3340;cameraY=touchDockHeight?phoneGroundCameraY():0;});
   await page.waitForTimeout(1300);assert(await page.evaluate(()=>!finalMonsters.some(m=>finalPlatforms.filter(finalHallBlock).some(p=>overlap(m,p)))));
   await page.locator('#game').focus();const x=await page.evaluate(()=>player.x);await page.keyboard.press('r');assert.equal(await page.evaluate(()=>player.x),x);assert.equal(await page.evaluate(()=>level),'final');
   await page.evaluate(()=>{state='review';player.invincible=0;render(0);});await page.locator('#game').screenshot({path:`previews/castle-foreground-stones-${label}-v1.png`});
  }
  await page.setViewportSize({width:1100,height:800});await page.evaluate(()=>{level='final';start();soundOn=false;finalMonsters=[];player.x=3600;player.y=412;player.onGround=true;player.vx=0;player.invincible=999;selectFinalWeapon('stars');});await page.keyboard.press('f');await page.waitForTimeout(470);await page.keyboard.press('f');assert.equal(await page.evaluate(()=>windStars.slots.length),2);await page.waitForFunction(()=>windStars.slots.every(s=>s.state==='ready'),{},{timeout:3500});
  await page.evaluate(()=>{level='fire';start();soundOn=false;fireMode='volcano';player.x=3250;player.y=fireSlopeY(3271)-58;player.onGround=true;player.invincible=999;fireStoneClock=999;const z=fireZombies.find(z=>z.surface&&z.platform===5);z.x=3100;z.facing=1;cameraX=player.x-W*.45;cameraY=fireCameraTargetY();});
  const before=await page.evaluate(()=>{const z=fireZombies.find(z=>z.surface&&z.platform===5);return{x:z.x,phase:z.phase};});await page.waitForTimeout(1200);assert(await page.evaluate(before=>{const z=fireZombies.find(z=>z.surface&&z.platform===5);return z.x>before.x&&z.phase>before.phase&&Math.abs(z.y+z.h-fireSlopeY(z.x+z.w/2))<.01;},before));
  await page.evaluate(()=>{state='review';player.invincible=0;render(0);});await page.locator('#game').screenshot({path:'previews/volcano-moving-zombie-v1.png'});
  await page.evaluate(()=>{state='playing';developerRun=false;openWorldMap();});await page.keyboard.press('r');assert.equal(await page.evaluate(()=>state),'map','R cannot select/restart from map');
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>finalHallSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='final';start();soundOn=false;player.x=3500;cameraX=3300;state='review';render(0);});
  assert.deepEqual(errors,[]);console.log('PASS Castle/Fire browser: distinct foreground relief with matching stone source, no ground marker, character occlusion order, real monster blocking, two returning stars, moving slope zombie, removed gameplay/map R shortcut, phone and direct-file renders.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
