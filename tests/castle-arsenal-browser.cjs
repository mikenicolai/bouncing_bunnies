const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({hasTouch:true,viewport:{width:1100,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>finalHallSheet.naturalWidth&&waterTridentSheet.naturalWidth&&windStarSheet.naturalWidth);
  const scene=async()=>{await page.evaluate(()=>{beginDeveloperSession();level='final';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();finalGateLift=1;finalMonsters=[];Object.assign(player,{x:3600,y:412,vx:0,vy:0,onGround:true,invincible:99});cameraX=player.x-W*.4;cameraY=0;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
  await scene();await page.locator('#game').focus();
  for(const name of ['trident','knives','stars','bow']){await page.keyboard.press('o');assert.equal(await page.evaluate(()=>finalWeapon),name);}
  await page.keyboard.press('o');await page.keyboard.down('ArrowUp');await page.keyboard.press('f');await page.waitForTimeout(120);assert(await page.evaluate(()=>waterTrident.dash>0&&waterTrident.dy===-1&&player.y<350),'keyboard upward land dash');await page.keyboard.up('ArrowUp');await page.waitForTimeout(500);
  for(const [name,width,height] of [['desktop',1100,800],['phone',390,844],['landscape',844,390],['tablet',768,1024]]){
   await page.setViewportSize({width,height});await scene();
   for(const weapon of ['trident','knives','stars','bow']){
    const p=await page.evaluate(weapon=>{const b=finalWeaponButtons().find(b=>b.name===weapon),r=canvas.getBoundingClientRect();return{x:r.left+(b.x+b.w/2)*r.width/W,y:r.top+(b.y+b.h/2)*r.height/H};},weapon);
    assert(p.x>=0&&p.x<width&&p.y>=0&&p.y<height);await page.touchscreen.tap(p.x,p.y);assert.equal(await page.evaluate(()=>finalWeapon),weapon);
   }
   // Z changes trident mode, and the actual on-screen action performs a throw.
   await page.evaluate(()=>selectFinalWeapon('trident'));await page.keyboard.press('z');assert.equal(await page.evaluate(()=>waterTrident.mode),'throw');
   const hit=await page.evaluate(()=>{const r=canvas.getBoundingClientRect();return{x:r.left+ACTIONS.hit.x*r.width/W,y:r.top+ACTIONS.hit.y*r.height/H};});await page.touchscreen.tap(hit.x,hit.y);assert(await page.evaluate(()=>waterTrident.shot&&!waterTrident.shot.dash));
   await page.evaluate(()=>{state='review';player.invincible=0;render(0);});if(name!=='landscape')await page.locator('#game').screenshot({path:`previews/castle-arsenal-${name}-v1.png`});
  }
  await page.setViewportSize({width:1100,height:800});await scene();
  await page.evaluate(()=>{fireArrow.aiming=false;player.x=finalTowerPlatforms[1].x+40;player.y=finalTowerPlatforms[1].y-58;player.vy=0;player.onGround=true;enterFinalTower();cameraX=finalTowerCameraX();cameraY=player.y-playfieldHeight()*.6;});
  await page.waitForFunction(()=>finalTowerPlatforms[1].crackAge>.6);await page.evaluate(()=>{state='review';player.invincible=0;render(0);});await page.locator('#game').screenshot({path:'previews/castle-crumbling-stones-v1.png'});
  const age=await page.evaluate(()=>finalTowerPlatforms[1].crackAge);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>finalTowerPlatforms[1].crackAge),age,'paused crack art stays still');await page.evaluate(()=>state='playing');await page.waitForFunction(()=>finalTowerPlatforms[1].collapsed,{},{timeout:2000});await page.waitForFunction(()=>lives===2,{},{timeout:3000});assert(await page.evaluate(()=>player.x===FINAL_TOWER.entryX&&finalTowerPlatforms.every(p=>!p.collapsed&&p.crackAge===-1)));
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>waterTridentSheet.naturalWidth&&windStarSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='final';start();soundOn=false;selectFinalWeapon('trident');state='review';player.invincible=0;render(0);});assert(await local.evaluate(()=>finalWeaponButtons().length===4));
  assert.deepEqual(errors,[]);console.log('PASS Castle arsenal browser: real O/Z/F and touch weapon icons/action, upward land dash, desktop/phone/tablet layout, painted HUD, live stone cracks/collapse/lava reset, pause and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
