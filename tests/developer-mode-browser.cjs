const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');
  await page.getByRole('button',{name:'World map',exact:true}).click();
  assert.equal(await page.evaluate(()=>selectedWorld),'meadow');assert.equal(await page.locator('[data-world]:disabled').count(),6);
  assert(!(await page.locator('#developerMenu').isVisible()));assert(!(await page.locator('footer').innerText()).includes('Developer'));
  await page.keyboard.press('d');assert.equal(await page.evaluate(()=>state),'developer');
  assert(await page.locator('#developerBuild').innerText().then(s=>s.includes('2026101504')));
  const input=page.getByLabel('Test wallet · 0–1,000 coins');
  await input.fill('1000');await page.getByRole('button',{name:'Set coins',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),1000);
  await input.fill('1001');await page.getByRole('button',{name:'Set coins',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),1000,'native bounds reject extra coins');
  await page.getByRole('button',{name:'100 coins',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),100);
  await page.getByRole('button',{name:'1,000 coins',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),1000);
  await page.locator('#developerMenu').screenshot({path:'previews/developer-mode-desktop-review.png'});
  await page.getByRole('button',{name:'Air · Cloud Paths',exact:true}).click();assert.equal(await page.evaluate(()=>level),'air');assert(await page.evaluate(()=>developerRun));
  await page.keyboard.press('m');assert.equal(await page.evaluate(()=>state),'developer');
  await page.getByRole('button',{name:'Castle opening',exact:true}).click();assert.equal(await page.evaluate(()=>level),'final');assert(await page.evaluate(()=>fireArrow.owned&&finalGateLift===1&&!finalUnlocked()));
  await page.keyboard.press('m');await page.getByRole('button',{name:'Return to normal map',exact:true}).click();
  assert.equal(await page.evaluate(()=>coinWallet),0);assert.equal(await page.evaluate(()=>level),'meadow');assert(!(await page.evaluate(()=>developerRun)));
  assert.equal(await page.evaluate(()=>localStorage.getItem(COIN_WALLET_KEY)),null);assert.equal(await page.evaluate(()=>localStorage.getItem(WORLD_PROGRESS_KEY)),null);
  // Real map action advances one world at a time; map painting cannot select worlds.
  for(const [world,next] of [['meadow','air'],['air','water'],['water','earth'],['earth','fire'],['fire','final']]){
   assert.equal(await page.evaluate(()=>selectedWorld),world);await page.locator('#mapAvailability').click();assert.equal(await page.evaluate(()=>level),world);
   await page.evaluate(()=>showEnd(true));assert.equal(await page.evaluate(()=>selectedWorld),next);assert.equal(await page.locator('[data-world]:disabled').count(),6);
  }
  await page.reload();assert.equal(await page.evaluate(()=>level),'final');assert(!(await page.evaluate(()=>developerRun)));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.getByRole('button',{name:'World map',exact:true}).click();await page.keyboard.press('d');
   assert(await page.locator('#developerMenu').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('#developerMenu').screenshot({path:viewport.width===390?'previews/developer-mode-phone-review.png':'previews/developer-mode-landscape-review.png'});
   await page.getByRole('button',{name:'100 coins',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),100);
   await page.getByRole('button',{name:'Return to normal map',exact:true}).click();assert.equal(await page.evaluate(()=>coinWallet),0);
  }
  // Exercise the production-off flag in a real browser with the actual game source.
  const disabled=await browser.newPage();disabled.on('pageerror',e=>errors.push(e.message));
  const html=fs.readFileSync('index.html','utf8').replace('const DEVELOPER_TOOLS_ENABLED=true','const DEVELOPER_TOOLS_ENABLED=false');
  await disabled.route('**/index.html',r=>r.fulfill({contentType:'text/html',body:html}));await disabled.goto('http://127.0.0.1:8772/index.html');
  await disabled.getByRole('button',{name:'World map',exact:true}).click();await disabled.keyboard.press('d');assert.equal(await disabled.evaluate(()=>state),'map');assert(!(await disabled.locator('#developerMenu').isVisible()));assert(!(await disabled.evaluate(()=>beginDeveloperSession())));
  assert.deepEqual(errors,[]);console.log('PASS browser progression/developer tools: map-only D, build metadata, text level buttons, coin input/presets/bounds, isolated saves, ordered map actions, reload, portrait/landscape and production-off flag.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
