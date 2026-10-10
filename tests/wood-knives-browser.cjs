const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1040}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/wood-knives.html');const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  await game.waitForFunction(()=>earthGroundSheet.naturalWidth&&earthTreeSheet.naturalWidth&&woodBossImages.giant.naturalWidth);
  await game.evaluate(()=>{state='review';player.x=6350;player.y=earthPlatforms[22].y-58;cameraX=6000;cameraY=-1830;render(0);});
  async function capture(file){const png=await game.evaluate(()=>{render(0);return canvas.toDataURL('image/png').split(',')[1];});fs.writeFileSync('previews/'+file,Buffer.from(png,'base64'));}
  await capture('wood-knives-nook-desktop.png');
  // Real collector, then keyboard THROW / STOW, without the animation loop
  // introducing timing variance into the fixed five-second assertions.
  await game.evaluate(()=>{state='playing';player.x=6475;player.y=earthKnifeLedge.y-58;collectEarthKnives();state='review';});assert.equal(await game.evaluate(()=>earthKnives.slots.filter(k=>k.state==='ready').length),1);
  await game.evaluate(()=>{state='playing';player.x=EARTH_ARENA.left+190;player.y=EARTH_ARENA.floor-58;player.facing=1;earthBoss.active=true;earthBoss.stage='giant';earthBoss.hp=8;earthBoss.cooldown=100;player.attackCooldown=0;});
  await game.locator('canvas').focus();await page.keyboard.press('x');await game.evaluate(()=>{state='review';});
  assert.equal(await game.evaluate(()=>earthKnives.slots[0].state),'flying');
  await game.evaluate(()=>{updateEarthKnives(.5);render(0);});assert.equal(await game.evaluate(()=>earthBoss.hp),7);assert(await game.evaluate(()=>earthKnives.slots[0].remaining>4));
  await game.evaluate(()=>{state='playing';});await page.keyboard.press('z');await game.evaluate(()=>{state='review';});assert.equal(await game.evaluate(()=>earthKnives.equipped),false);
  await page.locator('#giant').click();await game.evaluate(()=>{state='review';cameraX=7000;cameraY=-1870;render(0);});await capture('wood-knives-fight-desktop.png');
  // Phone touch targets dispatch through the game's real pointer listeners.
  await page.setViewportSize({width:390,height:844});await page.locator('#giant').click();await game.evaluate(()=>{state='review';cameraX=earthBoss.x-W*.7;cameraY=EARTH_ARENA.floor-playfieldHeight()*.82;render(0);});
  async function touch(name){await game.evaluate(()=>{state='playing';fitTouchControls();});const b=await game.evaluate(name=>{const r=canvas.getBoundingClientRect(),b=ACTIONS[name];return{x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};},name);await game.locator('canvas').dispatchEvent('pointerdown',{clientX:b.x,clientY:b.y,pointerId:8,pointerType:'touch',bubbles:true});await game.evaluate(()=>{state='review';});}
  await touch('ability2');assert.equal(await game.evaluate(()=>earthKnives.equipped),false);await touch('ability2');assert.equal(await game.evaluate(()=>earthKnives.equipped),true);
  await game.evaluate(()=>{player.attackCooldown=0;});await touch('hit');assert.equal(await game.evaluate(()=>earthKnives.slots.filter(k=>k.state==='flying').length),1);
  await game.evaluate(()=>{updateEarthKnives(.8);render(0);});await capture('wood-knives-fight-phone.png');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  console.log('PASS browser: knife nook and inventory, real pickup/projectile, keyboard throw/stow, phone touch throw/equip, artwork and countdown rendering without errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
