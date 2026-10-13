const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/coin-revive-review.html');
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  await game.waitForFunction(()=>state==='lost'&&coinWallet===25);
  const buy=game.locator('#reviveCoinButton'),ad=game.locator('#reviveAdButton'),restart=game.locator('#startButton');
  await game.waitForFunction(()=>getComputedStyle(document.querySelector('#startOverlay')).opacity==='1');await game.locator('#startOverlay').screenshot({path:'previews/coin-revive-desktop-review.png'});
  await buy.click();assert.equal(await game.evaluate(()=>coinWallet),5);assert.equal(await game.evaluate(()=>lives),1);assert.equal(await game.evaluate(()=>score),5);
  assert(await game.evaluate(()=>coins.slice(0,5).every(c=>c.taken)));assert.equal(await game.evaluate(()=>state),'playing');
  await page.locator('[data-wallet="19"]').click();assert(!(await buy.isEnabled()));assert(await ad.isEnabled());
  await ad.click();assert.equal(await game.evaluate(()=>state),'reviveAd');assert(!(await buy.isEnabled()));assert(!(await restart.isEnabled()));
  const frozen=await game.evaluate(()=>JSON.stringify({score,coins,player,enemies}));
  await page.keyboard.press('Space');await page.keyboard.press('r');await page.keyboard.press('m');
  await game.locator('#startOverlay').screenshot({path:'previews/coin-revive-test-ad-review.png'});
  assert.equal(await game.evaluate(()=>JSON.stringify({score,coins,player,enemies})),frozen);
  assert.equal(await game.evaluate(()=>lives),0);
  const deadline=await game.evaluate(()=>reviveAdEndsAt);
  await game.waitForFunction(()=>state==='playing'&&lives===3,{},{timeout:7000});
  assert(await game.evaluate(end=>performance.now()>=end,deadline));assert.equal(await game.evaluate(()=>coinWallet),19);assert.equal(await game.evaluate(()=>score),5);
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('[data-wallet="25"]').click();await page.locator('iframe').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await game.waitForFunction(()=>getComputedStyle(document.querySelector('#startOverlay')).opacity==='1');
   assert(await game.evaluate(()=>['#reviveCoinButton','#reviveAdButton','#startButton'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})), 'all revival choices fit on the phone');
   await game.locator('#startOverlay').screenshot({path:viewport.width===390?'previews/coin-revive-phone-review.png':'previews/coin-revive-landscape-review.png'});
   await buy.scrollIntoViewIfNeeded();await buy.click();assert.equal(await game.evaluate(()=>lives),1);assert.equal(await game.evaluate(()=>coinWallet),5);
   await page.locator('[data-wallet="25"]').click();await page.locator('iframe').scrollIntoViewIfNeeded();await game.waitForFunction(()=>getComputedStyle(document.querySelector('#startOverlay')).opacity==='1');await restart.scrollIntoViewIfNeeded();await restart.click();assert.equal(await game.evaluate(()=>score),0);assert.equal(await game.evaluate(()=>coinWallet),25);
  }
  const saved=await browser.newPage();saved.on('pageerror',e=>errors.push(e.message));await saved.goto('http://127.0.0.1:8772/index.html');
  await saved.evaluate(()=>{coinWallet=42;saveCoinWallet();});await saved.reload();await saved.waitForFunction(()=>coinWallet===42);
  assert.deepEqual(errors,[]);console.log('PASS wallet browser: actual 20-coin purchase, insufficient funds, real five-second frozen ad/reward, input protection, restart, reload persistence and desktop/portrait/landscape buttons without runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
