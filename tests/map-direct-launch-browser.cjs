const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof player==='object');
  await page.evaluate(()=>{soundOn=false;const originalMapStart=start;window.mapStarts=0;start=function(){window.mapStarts++;return originalMapStart();};openWorldMap();});
  assert.equal(await page.locator('[data-world]:not(:disabled)').count(),1);
  await page.locator('[data-world="air"]').dispatchEvent('click');assert.equal(await page.evaluate(()=>state),'map');assert.equal(await page.evaluate(()=>mapStarts),0,'locked destinations cannot launch');
  await page.locator('[data-world="meadow"]').click();
  assert(await page.evaluate(()=>state==='playing'&&level==='meadow'&&mapStarts===1));assert(await page.locator('#worldMap').isHidden());
  // Opening the map still pauses a run; Continue resumes it rather than restarting.
  const paused=await page.evaluate(()=>{for(let i=0;i<3;i++)collectCoin({taken:false});player.x=400;player.vx=0;player.invincible=999;openWorldMap();return{x:player.x,score,mapStarts};});
  await page.locator('#mapBack').click();assert(await page.evaluate(b=>player.x===b.x&&score===b.score&&mapStarts===b.mapStarts&&state==='playing',paused));
  // One map click starts each newly unlocked destination. Earlier worlds remain replayable.
  const order=['meadow','air','water','earth','fire','final'];
  for(let i=0;i<order.length-1;i++){
   await page.evaluate(world=>{completeWorld(world);openWorldMap();},order[i]);
   assert.equal(await page.locator('[data-world]:not(:disabled)').count(),i+2);
   const before=await page.evaluate(()=>mapStarts);await page.locator(`[data-world="${order[i+1]}"]`).click();
   assert(await page.evaluate(({world,before})=>state==='playing'&&level===world&&mapStarts===before+1,{world:order[i+1],before}));
  }
  for(const world of order){
   await page.evaluate(()=>openWorldMap());const before=await page.evaluate(()=>mapStarts);
   await page.locator(`[data-world="${world}"]`).click();assert(await page.evaluate(({world,before})=>level===world&&state==='playing'&&mapStarts===before+1,{world,before}));
   assert(await page.evaluate(()=>coinWallet===3&&nextWorld()==='final'),'replays retain wallet and completed progression');
  }
  // Native keyboard activation and touch use the same direct action.
  for(const key of ['Enter','Space']){
   await page.evaluate(()=>openWorldMap());const before=await page.evaluate(()=>mapStarts);
   await page.locator('[data-world="air"]').focus();await page.keyboard.press(key);
   assert(await page.evaluate(before=>level==='air'&&state==='playing'&&mapStarts===before+1,before));
  }
  for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>openWorldMap());const before=await page.evaluate(()=>mapStarts);
   await page.locator('[data-world="earth"]').tap();assert(await page.evaluate(before=>level==='earth'&&state==='playing'&&mapStarts===before+1,before));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.evaluate(()=>openWorldMap());
  const twice=await page.evaluate(()=>{const before=mapStarts,button=document.querySelector('[data-world="meadow"]');button.click();button.click();return mapStarts-before;});
  assert.equal(twice,1,'a rapid second click cannot restart the newly launched run');
  await page.evaluate(()=>openWorldMap());await page.locator('#mapAvailability').click();assert(await page.evaluate(()=>level==='final'&&state==='playing'),'the old Play button remains an optional alternative');
  assert.equal(await page.locator('#developerMenu').count(),0);assert.deepEqual(errors,[]);
  console.log('PASS direct map launch: one-click next world, all completed-world replays, locked guards, preserved wallet/progress, Continue without reset, Enter/Space, phone/landscape/tablet taps and double-click safety.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
