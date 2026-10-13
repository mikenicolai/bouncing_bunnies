const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:650}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/element-portals-review.html');await page.waitForFunction(()=>portalReady);
  const alpha=await page.evaluate(()=>Object.entries(ELEMENT_PORTALS).map(([name,p])=>{const c=document.createElement('canvas');c.width=p.width;c.height=p.height;const paint=c.getContext('2d');paint.drawImage(p.image,0,0);return {name,center:paint.getImageData(Math.round(p.cx),Math.round(p.cy),1,1).data[3],corner:paint.getImageData(0,p.height-1,1,1).data[3]};}));
  for(const p of alpha){assert.equal(p.center,0,p.name+' has an empty opening');assert(p.corner<8,p.name+' has real background transparency');}
  await page.locator('#pause').click();await page.locator('main').screenshot({path:'previews/element-portals-five-styles-review.png'});
  await page.locator('#locked').click();assert.equal(await page.evaluate(()=>active),false);await page.locator('#locked').click();assert.equal(await page.evaluate(()=>active),true);
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Render each real exit with its painted ring and the existing unlock conditions.
  const game=await browser.newPage({viewport:{width:1100,height:900}});game.on('pageerror',e=>errors.push(e.message));await game.goto('http://127.0.0.1:8772/index.html');
  await game.waitForFunction(()=>Object.values(ELEMENT_PORTALS).every(p=>p.image.naturalWidth));
  for(const world of ['meadow','air','water','fire','earth']){
   await game.evaluate(world=>{beginDeveloperSession();level=world;start();state='review';soundOn=false;
    if(world==='meadow'){meadowLesson.balloons.forEach(b=>b.popped=true);meadowLesson.swamThrough=true;player.x=MEADOW_SHRINE_X-60;player.y=412;cameraX=MEADOW_W-W;cameraY=120;}
    if(world==='air'){beginDescent();descentBlueReached=true;player.x=DESCENT.gateX-70;player.y=1712;player.onGround=true;player.airCloud=airPlatforms[DESCENT.finish];cameraX=DESCENT.gateX-W*.6;cameraY=airPlatforms[DESCENT.finish].y-H*.82;}
    if(world==='water'){neptunus.hp=0;neptunus.deathAge=2;player.inWater=true;waterAquaSuit=true;player.x=WATER_ARENA.exit-100;player.y=waterFloorY(WATER_ARENA.exit)-115;cameraX=WATER_W-waterViewSize().width;cameraY=WATER_BOTTOM-waterViewSize().height+90;}
    if(world==='fire'){fireMode='king';lavaKing.defeated=true;player.x=FIRE_EXIT_X-100;player.y=FIRE_KING_ARENA.y-58;player.onGround=true;cameraX=FIRE_EXIT_X-W*.65;cameraY=FIRE_KING_ARENA.y-H*.8;}
    if(world==='earth'){earthBoss.stage='done';player.x=EARTH_GATE_X-100;player.y=EARTH_ARENA.floor-58;player.onGround=true;cameraX=EARTH_GATE_X-W*.7;cameraY=EARTH_ARENA.floor-H*.8;}
    player.invincible=0;render(0);
   },world);
   fs.writeFileSync(`previews/portal-${world}-game-review.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  }
  // Reproduce the user's right-then-left boosted return without the old 100px+ clamp.
  await game.evaluate(()=>{level='air';start();soundOn=false;beginDescent();descentBlueReached=true;airFinished=false;player.x=6755;player.y=airSecretIsland.y-player.h;player.onGround=true;player.airCloud=airSecretIsland;player.vx=player.vy=0;state='playing';window.portalReturnTrail=[];const originalUpdate=update;update=dt=>{const oldX=player.x;originalUpdate(dt);portalReturnTrail.push({dx:player.x-oldX,lives,state});};});
  await game.locator('#game').focus();await game.keyboard.down('ArrowRight');await game.keyboard.press('Space');await game.waitForTimeout(70);await game.keyboard.press('Space');await game.waitForTimeout(70);await game.keyboard.press('Space');await game.keyboard.up('ArrowRight');await game.keyboard.down('ArrowLeft');await game.waitForTimeout(220);await game.keyboard.up('ArrowLeft');
  await game.waitForFunction(()=>state==='map'||player.onGround,{},{timeout:3000});
  const trail=await game.evaluate(()=>portalReturnTrail);assert(trail.length>15);assert(trail.every(p=>Math.abs(p.dx)<15),'no frame can teleport the bunny left');assert(trail.every(p=>p.lives===3),'the return does not respawn or cost a heart');
  // File-origin rendering never needs to read the new sprites' pixels.
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>Object.values(ELEMENT_PORTALS).every(p=>p.image.naturalWidth));await local.evaluate(()=>{beginDeveloperSession();level='air';start();beginDescent();descentBlueReached=true;player.x=6750;player.y=1712;player.airCloud=airPlatforms[DESCENT.finish];state='review';cameraX=6200;cameraY=1400;render(0);});
  assert.deepEqual(errors,[]);console.log('PASS elemental portal browser: all five transparent painted rings, animated/locked gallery, real world exits, mobile layout, right-then-left Air return without teleport or damage, and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
