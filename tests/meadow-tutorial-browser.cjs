const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.MEADOW_PREVIEW_URL||'http://127.0.0.1:8772/previews/meadow-lessons.html');
  await page.locator('[data-scene="range"]').waitFor();await page.waitForFunction(()=>!document.querySelector('[data-scene="range"]').disabled,{},{timeout:60000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  async function capture(scene,file){await page.locator(`[data-scene="${scene}"]`).click();await game.evaluate(()=>{state='review';render(0);});fs.writeFileSync(`previews/${file}`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));}
  await capture('range','meadow-shooting-range-review.png');
  // Keyboard equip, aim and a real arrow; no fixture pops are used for this shot.
  await game.evaluate(()=>{state='playing';});await game.locator('#game').focus();await page.keyboard.press('z');assert(!await game.evaluate(()=>fireArrow.aiming));await page.keyboard.press('z');assert(await game.evaluate(()=>fireArrow.aiming));
  const angle=await game.evaluate(()=>fireArrow.angle);await page.keyboard.down('ArrowUp');await page.waitForTimeout(150);await page.keyboard.up('ArrowUp');assert(await game.evaluate(()=>fireArrow.angle)>angle);
  await game.evaluate(()=>{state='review';fireArrow.angle=.3;});await game.evaluate(()=>{state='playing';});await page.keyboard.press('x');assert(await game.evaluate(()=>fireArrow.ammo.filter(Boolean).length)<5);
  // Backtrack with the practice bow and shoot an actual Meadow monster.
  await page.locator('[data-scene="range"]').click();
  await game.evaluate(()=>{const monster=enemies[8];Object.assign(monster,{x:4800,y:410,min:4800,max:4800,vx:0});enemies=[monster];player.facing=-1;fireArrow.angle=.1;cameraX=4690;state='review';render(0);});
  fs.writeFileSync('previews/meadow-monster-arrow-before.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  await game.evaluate(()=>{state='playing';});await game.locator('#game').focus();await page.keyboard.press('x');
  await game.waitForFunction(()=>!enemies[0].alive,{},{timeout:3000});
  assert.equal(await game.evaluate(()=>enemies[0].hp),0);assert.equal(await game.evaluate(()=>meadowBalloonsPopped()),0);
  await game.evaluate(()=>{state='review';render(0);});fs.writeFileSync('previews/meadow-monster-arrow-after.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  await capture('open','meadow-balloon-door-open-review.png');await capture('shore','meadow-dive-entrance-review.png');await capture('dive','meadow-diving-review.png');await capture('finish','meadow-shrine-review.png');
  // Real clicks on the touch action buttons in both phone orientations.
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('iframe').scrollIntoViewIfNeeded();await page.locator('[data-scene="range"]').click();
   await game.evaluate(()=>{state='playing';});
   async function point(name){await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));const iframe=await page.locator('iframe').boundingBox(),p=await game.evaluate(name=>{const r=canvas.getBoundingClientRect(),b=ACTIONS[name];return {x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};},name);return {x:iframe.x+p.x,y:iframe.y+p.y};}
   let p=await point('ability2');await page.mouse.click(p.x,p.y);assert(!await game.evaluate(()=>fireArrow.aiming));p=await point('ability2');await page.mouse.click(p.x,p.y);assert(await game.evaluate(()=>fireArrow.aiming));
   await page.locator('[data-scene="shore"]').click();await game.evaluate(()=>{player.x=6080;player.y=500;player.inWater=true;state='playing';});
   const y=await game.evaluate(()=>player.y);p=await point('duck');await page.mouse.move(p.x,p.y);await page.mouse.down();await page.waitForTimeout(250);await page.mouse.up();assert(await game.evaluate(()=>player.y)>y+8);assert(await game.evaluate(()=>player.h===58&&!fireArrow.owned));
   await capture('dive',viewport.width===390?'meadow-diving-phone-review.png':'meadow-diving-landscape-review.png');assert(await game.evaluate(()=>touchDockHeight>0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('PASS Meadow browser: rendered range, gate, pond and shrine; real keyboard equip/aim/fire, arrow damage to Meadow monsters and touch equip/Dive controls in portrait/landscape; no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
