const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/game-upgrades-review.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('[data-scene="lava"]').disabled,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  assert.equal(await game.locator('#fullscreenButton,#mapFullscreen').count(),0,'no fullscreen controls remain');
  async function capture(name){await game.evaluate(()=>render(0));fs.writeFileSync(`previews/game-upgrades-${name}-v1.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));}
  await capture('lava');
  const lava=await game.evaluate(()=>{
   state='review';cameraY=0;cameraX=100;drawPaintedLava(0,2700,100,540,0);
   const a=Array.from(ctx.getImageData(400,150,60,60).data),colors=new Set();for(let i=0;i<a.length;i+=4)colors.add(`${a[i]},${a[i+1]},${a[i+2]}`);
   cameraX=120;drawPaintedLava(0,2700,100,540,0);const b=Array.from(ctx.getImageData(380,150,60,60).data);
   return{colors:colors.size,anchored:a.every((v,i)=>v===b[i])};
  });assert(lava.colors>500,'lava has painted detail');assert(lava.anchored,'lava texture remains fixed in world space');
  await page.locator('[data-scene="bow"]').click();assert(await game.evaluate(()=>fireWeaponSheet.src.endsWith('woodland-bow-v2.png')));await capture('bow');
  await page.locator('[data-scene="rewards"]').click();await game.waitForFunction(()=>coinWallet===3);
  assert.equal(await game.evaluate(()=>score),0);assert.equal(await game.evaluate(()=>runMonsterCoins),3);assert(await game.evaluate(()=>walletRunSummary().includes('3 rewards')));await capture('rewards');
  await page.locator('[data-scene="knight"]').click();assert.equal(await game.evaluate(()=>finalKnight.hp),10);assert(await game.evaluate(()=>finalKnight.defending>0));await capture('parry');
  await page.setViewportSize({width:390,height:844});await page.locator('[data-scene="lava"]').click();await capture('lava-phone');await page.locator('[data-scene="bow"]').click();await capture('bow-phone');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // A separate normal run tests the real map, without preview/developer overrides.
  const normal=await browser.newPage({viewport:{width:1100,height:950}});normal.on('pageerror',e=>errors.push(e.message));
  await normal.goto('http://127.0.0.1:8772/index.html',{waitUntil:'domcontentloaded'});await normal.waitForFunction(()=>typeof player==='object');
  await normal.evaluate(()=>openWorldMap());assert.equal(await normal.locator('[data-world]:not(:disabled)').count(),1);assert(await normal.locator('[data-world="fire"]').isDisabled());
  await normal.evaluate(()=>{completeWorld('meadow');completeWorld('air');openWorldMap();});
  assert.equal(await normal.locator('[data-world]:not(:disabled)').count(),3);
  await normal.locator('[data-world="meadow"]').click();assert.equal(await normal.evaluate(()=>selectedWorld),'meadow');assert((await normal.locator('#mapAvailability').textContent()).startsWith('Replay'));
  await normal.locator('#mapAvailability').click();assert.equal(await normal.evaluate(()=>level),'meadow');assert.equal(await normal.evaluate(()=>nextWorld()),'water');
  await normal.evaluate(()=>openWorldMap());await normal.locator('[data-world="air"]').click();await normal.locator('#mapAvailability').click();assert.equal(await normal.evaluate(()=>level),'air');assert.equal(await normal.evaluate(()=>nextWorld()),'water');
  await normal.evaluate(()=>openWorldMap());await normal.locator('[data-world="water"]').click();await normal.locator('#mapAvailability').click();assert.equal(await normal.evaluate(()=>level),'water');
  await normal.evaluate(()=>openWorldMap());await normal.locator('#worldMap').screenshot({path:'previews/game-upgrades-replay-map-v1.png'});
  assert(await normal.evaluate(()=>meadowFinished&&airFinished&&!waterFinished));assert(await normal.locator('[data-world="earth"]').isDisabled());
  assert.deepEqual(errors,[]);console.log('PASS upgrades browser: painted world-anchored lava, new bow in-game, real 3-heart reward and wallet accounting, Knight parry, phone scenes, no fullscreen controls, ordered unlocks and replay of completed worlds without losing progress.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
