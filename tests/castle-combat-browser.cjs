const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/final-castle-review.html');
  await page.locator('[data-scene="bow"]').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('[data-scene="bow"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  await game.waitForFunction(()=>fireArcherySheet.naturalWidth&&fireWeaponSheet.naturalWidth&&fireArrowTypeSheet.naturalWidth);
  await page.locator('[data-scene="bow"]').click();await game.evaluate(()=>{state='review';render(0);});
  assert(await game.evaluate(()=>fireArrow.owned&&fireArcheryMode()));
  async function capture(file){const data=await game.evaluate(()=>canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync('previews/'+file,Buffer.from(data,'base64'));}
  await capture('castle-bow-equipped-review.png');
  await game.evaluate(()=>{state='playing';});await page.keyboard.press('z');await game.evaluate(()=>{state='review';render(0);});
  assert(await game.evaluate(()=>fireArrow.owned&&!fireArrow.aiming));await capture('castle-bow-carried-review.png');
  // Real keyboard shot/recharge state with an equipped bow and safe floor position.
  await game.evaluate(()=>{state='playing';player.x=4990;player.onGround=true;player.y=FINAL_FLOOR-58;player.invincible=99;});
  await page.keyboard.press('z');await page.keyboard.press('x');
  assert.equal(await game.evaluate(()=>fireArrow.ammo.filter(Boolean).length),4);
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('[data-scene="bow"]').click();
   await game.evaluate(()=>{state='review';player.invincible=0;render(0);});
   assert(await game.evaluate(()=>touchDockHeight>0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await capture(viewport.width===390?'castle-bow-phone-review.png':'castle-bow-landscape-review.png');
   await page.locator('iframe').scrollIntoViewIfNeeded();
   const box=await page.locator('iframe').boundingBox();
   async function touch(name){
    const p=await game.evaluate(n=>{const r=canvas.getBoundingClientRect(),b=ACTIONS[n];return{x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};},name);
    await page.mouse.click(box.x+p.x,box.y+p.y);
   }
   await game.evaluate(()=>{state='playing';});await touch('ability2');assert.equal(await game.evaluate(()=>fireArrow.aiming),false,JSON.stringify(viewport));
   await touch('ability2');assert.equal(await game.evaluate(()=>fireArrow.aiming),true);
   await touch('hit');assert.equal(await game.evaluate(()=>fireArrow.ammo.filter(Boolean).length),4);
  }
  assert.deepEqual(errors,[]);console.log('PASS castle browser: bow/quiver and aimed artwork, inventory, real keyboard firing, portrait/landscape touch equip/stow/fire and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
