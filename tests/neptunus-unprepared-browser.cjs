const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof neptunus==='object');
  await page.evaluate(()=>Promise.all([neptunusSheet,waterRuinsSheet,waterTridentSheet,aquaSuitPickupSheet,aquaSwimSheet,swimSheet].map(i=>i.decode())));
  await page.evaluate(()=>{
   completeWorld('meadow');completeWorld('air');level='water';start();soundOn=false;
   waterSharks=[];waterPirates=[];waterGate.phase='open';waterGate.lift=1;player.inWater=true;player.x=WATER_ARENA.left+300;player.y=1100;player.invincible=999;
   checkpoint={x:11860,y:1150,water:true};
  });
  await page.waitForFunction(()=>neptunus.active&&neptunus.turn>0);
  assert(await page.evaluate(()=>!waterAquaSuit&&!waterTrident.owned&&!neptunus.sealed),'real boss activates without relics and permits retreat');
  assert(await page.locator('#waterRetryHint').isHidden(),'no first-attempt hint');
  await page.evaluate(()=>{for(let i=0;i<25;i++)collectCoin({taken:false});player.invincible=0;lives=1;hurt();});
  await page.locator('#waterRetryHint').waitFor({state:'visible'});
  assert((await page.locator('#waterRetryHint').textContent()).includes('Aqua Suit'));assert((await page.locator('#waterRetryHint').textContent()).includes('Trident'));
  for(const [width,height,name] of [[1100,950,'desktop'],[390,844,'phone'],[844,390,'landscape']]){
   await page.setViewportSize({width,height});await page.locator('#reviveCoinButton').scrollIntoViewIfNeeded();
   await page.locator('#startOverlay').screenshot({path:`previews/neptunus-retry-hint-${name}-v1.png`});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'retry hint does not overflow');
  }
  await page.locator('#reviveCoinButton').click();await page.evaluate(()=>state='review');
  assert(await page.evaluate(()=>lives===1&&coinWallet===5&&player.x<WATER_ARENA.left&&!waterAquaSuit&&!waterTrident.owned),'paid retry remains outside and does not invent gear');
  await page.setViewportSize({width:390,height:844});
  const capture=async name=>fs.writeFileSync(`previews/neptunus-relic-${name}-v1.png`,Buffer.from(await page.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));
  await page.evaluate(()=>{player.x=12100;player.y=1350;cameraX=player.x-waterViewSize().width*.3;cameraY=1050;render(0);});await capture('suit-phone');
  await page.evaluate(()=>{player.x=11000;player.y=1080;cameraX=player.x-waterViewSize().width*.3;cameraY=850;render(0);});await capture('trident-phone');
  // Both object locations use the same quiet cue, restricted to nearby players.
  const cue=await page.evaluate(()=>{
   let circles=0;const arc=ctx.arc;ctx.arc=function(...a){circles++;return arc.apply(this,a);};
   player.x=0;player.y=0;drawWaterRelicCue(WATER_SUIT_SPOT);const far=circles;
   player.x=WATER_SUIT_SPOT.x-100;player.y=WATER_SUIT_SPOT.y;drawWaterRelicCue(WATER_SUIT_SPOT);ctx.arc=arc;return {far,near:circles};
  });assert.equal(cue.far,0);assert.equal(cue.near,3);
  await page.evaluate(()=>{player.x=WATER_SUIT_SPOT.x-21;player.y=WATER_SUIT_SPOT.y-29;collectWaterAdventure();refreshWaterRetryHint();});
  assert((await page.locator('#waterRetryHint').textContent()).includes('Trident'));assert(!(await page.locator('#waterRetryHint').textContent()).includes('Aqua Suit'));
  await page.evaluate(()=>{player.x=WATER_TRIDENT_SPOT.x-21;player.y=WATER_TRIDENT_SPOT.y-29;collectWaterAdventure();refreshWaterRetryHint();});
  assert(await page.locator('#waterRetryHint').isHidden(),'hint clears after collecting both');
  await page.evaluate(()=>{player.x=WATER_ARENA.left+150;updateNeptunus(0);});assert(await page.evaluate(()=>neptunus.sealed&&checkpoint.arena),'fully equipped re-entry retains the normal sealed encounter');
  assert.deepEqual(errors,[]);console.log('PASS unprepared Neptunus browser: live unarmed activation, failure-only tailored hint, desktop/phone/landscape, fair paid retry, nearby pickup glints and equipped re-entry, production developer mode remains disabled.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
