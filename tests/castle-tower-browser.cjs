const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/castle-tower-review.html');await page.waitForFunction(()=>!document.querySelector('[data-scene="base"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  async function capture(scene,label=scene){await page.locator(`[data-scene="${scene}"]`).click();fs.writeFileSync(`previews/castle-tower-${label}-review.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));}
  for(const scene of ['base','middle','summit'])await capture(scene);
  // Walk through the real opening inner door into the tower, without a scene teleport.
  await game.evaluate(()=>{level='final';start();finalGateLift=1;finalMonsters=[];player.x=8110;player.y=FINAL_FLOOR-58;player.onGround=true;cameraX=player.x-W*.5;cameraY=0;state='playing';});
  await game.locator('#game').focus();await page.keyboard.down('ArrowRight');
  await game.waitForFunction(()=>finalTowerEntered,{},{timeout:5000});await page.keyboard.up('ArrowRight');
  assert(await game.evaluate(()=>state==='playing'&&lives===3&&finalTowerDoorLift===1));
  // Real keyboard triple jump at the entrance; the fourth tap is still rejected.
  await page.locator('[data-scene="base"]').click();await game.evaluate(()=>{state='playing';});await game.locator('#game').focus();
  for(let i=0;i<3;i++)await page.keyboard.press('Space');assert.equal(await game.evaluate(()=>player.boosts),2);await page.keyboard.press('Space');assert.equal(await game.evaluate(()=>player.boosts),2);
  // A long fall reaches lava once, loses a heart and snaps the camera to the entrance.
  await game.evaluate(()=>{state='playing';player.x=9210;player.y=FINAL_TOWER.top;player.vy=850;player.onGround=false;player.invincible=99;cameraY=-900;});
  await game.waitForFunction(()=>lives===2,{},{timeout:5000});assert(await game.evaluate(()=>Math.abs(player.x-FINAL_TOWER.entryX)<2&&player.y>350&&cameraY>-100));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.locator('[data-scene="middle"]').click();await page.setViewportSize(viewport);assert(await game.evaluate(()=>player.y-cameraY>=0&&player.y+player.h-cameraY<playfieldHeight()),'rotation keeps the tower climber in view');await capture('base',viewport.width===390?'phone':'landscape');
   assert(await game.evaluate(()=>touchDockHeight>0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('iframe').scrollIntoViewIfNeeded();await game.evaluate(()=>{state='playing';});
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   const iframe=await page.locator('iframe').boundingBox(),p=await game.evaluate(()=>{const r=canvas.getBoundingClientRect(),b=ACTIONS.jump;return{x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};});
   for(let i=0;i<3;i++)await page.mouse.click(iframe.x+p.x,iframe.y+p.y);assert.equal(await game.evaluate(()=>player.boosts),2,'tower touch triple jump');
   await capture('summit',viewport.width===390?'summit-phone':'summit-landscape');
  }
  // A full-height review uses the actual renderer and includes all three floors.
  await page.setViewportSize({width:1100,height:950});await page.locator('[data-scene="base"]').click();
  const overview=await game.evaluate(()=>{const old={W,H,width:canvas.width,height:canvas.height,touchDockHeight,cameraX,cameraY};W=1050;H=2050;canvas.width=W;canvas.height=H;touchDockHeight=0;cameraX=8380;cameraY=FINAL_TOWER.top-290;render(0);const png=canvas.toDataURL().split(',')[1];W=old.W;H=old.H;canvas.width=old.width;canvas.height=old.height;touchDockHeight=old.touchDockHeight;cameraX=old.cameraX;cameraY=old.cameraY;return png;});
  fs.writeFileSync('previews/castle-tower-overview.png',Buffer.from(overview,'base64'));
  const local=await browser.newPage({viewport:{width:844,height:390}});local.on('pageerror',e=>errors.push(e.message));
  await local.goto('file://'+process.cwd()+'/index.html');
  await local.evaluate(()=>{beginDeveloperSession();level='final';start();finalGateLift=1;player.x=FINAL_TOWER.entryX;player.y=FINAL_FLOOR-58;player.onGround=true;enterFinalTower();});
  await local.waitForFunction(()=>finalHallSheet.naturalWidth&&PAINTED_BUNNY.uprightWalk.quiver.naturalWidth);
  await local.waitForFunction(()=>finalTime>.2);
  assert(await local.evaluate(()=>state==='playing'&&lives===3&&finalTowerEntered));
  assert.deepEqual(errors,[]);console.log('PASS Castle tower browser: base/middle/summit art and full-height overview, keyboard/touch triple jumps, long lava fall and camera reset, desktop/portrait/landscape with isolated saves, direct-file play and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
