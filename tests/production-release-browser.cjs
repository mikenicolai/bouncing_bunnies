const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  await page.goto('http://127.0.0.1:8772/index.html?dev=1&developer=true',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof player==='object');
  await page.waitForLoadState('networkidle',{timeout:90000});
  const audit=await page.evaluate(()=>{
   const nav=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin));
   return {version:BUILD_INFO.version,build:BUILD_INFO.build,documentBytes:nav.decodedBodySize,resourceCount:resources.length,
    resourceBytes:resources.reduce((n,r)=>n+r.decodedBodySize,0),developerToolsEnabled:DEVELOPER_TOOLS_ENABLED};
  });
  assert.equal(audit.version,'0.22.1');assert.equal(audit.developerToolsEnabled,false);
  assert.equal(await page.locator('#developerMenu,[data-dev-world],#developerCoins,#developerWalletForm').count(),0,'developer controls are removed from the production DOM');
  await page.getByRole('button',{name:'World map',exact:true}).click();
  for(const viewport of [{width:1100,height:950},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.keyboard.press('d');await page.keyboard.press('Shift+D');
   assert.equal(await page.evaluate(()=>state),'map','D has no developer shortcut');
   assert.equal(await page.locator('[data-world]:not(:disabled)').count(),1,'only Meadow is unlocked for a new journey');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  const disabled=await page.evaluate(()=>({begin:beginDeveloperSession(),open:openDeveloperMenu(),coins:setDeveloperCoins(1000),world:launchDeveloperWorld('final'),exit:exitDeveloperMode(),wallet:coinWallet,level,developerRun}));
  assert.deepEqual(disabled,{begin:false,open:false,coins:false,world:false,exit:false,wallet:0,level:'meadow',developerRun:false});
  await page.setViewportSize({width:1100,height:950});
  await page.locator('#mapAvailability').click();assert.equal(await page.evaluate(()=>state),'playing');
  await page.evaluate(()=>{for(let i=0;i<25;i++)collectCoin({taken:false});lives=1;player.invincible=0;hurt();});
  await page.locator('#reviveCoinButton').click();
  assert(await page.evaluate(()=>state==='playing'&&lives===1&&coinWallet===5),'paid checkpoint continuation still works');
  await page.evaluate(()=>{player.invincible=0;hurt();});await page.locator('#reviveAdButton').click();
  await page.waitForFunction(()=>state==='playing',{},{timeout:10000});
  assert(await page.evaluate(()=>lives===3&&coinWallet===5&&level==='meadow'),'five-second current-level restart works without the removed menu');
  await page.evaluate(()=>{completeWorld('meadow');completeWorld('air');openWorldMap();});
  assert.equal(await page.locator('[data-world]:not(:disabled)').count(),3);
  await page.locator('[data-world="meadow"]').click();assert.equal(await page.evaluate(()=>level),'meadow');
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof player==='object');
  assert(await page.evaluate(()=>level==='water'&&coinWallet===5&&!developerRun),'saved wallet and ordered progress survive reload');
  await page.getByRole('button',{name:'World map',exact:true}).click();await page.keyboard.press('d');
  assert.equal(await page.evaluate(()=>state),'map');assert.equal(await page.locator('#developerMenu').count(),0);assert(await page.locator('[data-world="final"]').isDisabled());
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[],'all requested release files load');
  fs.writeFileSync('previews/production-release-audit-v0.22.1.json',JSON.stringify(audit,null,2)+'\n');
  console.log('PASS production release: developer UI absent, D/query flags/helpers cannot grant coins or skip worlds, desktop/phone/landscape map, real paid revive and 5-second restart, ordered unlock/replay and saved progress, no runtime/missing-resource errors.');
  console.log(JSON.stringify(audit));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
