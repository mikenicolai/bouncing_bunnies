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
  assert((await ad.innerText()).includes('Restart level with 3 hearts'));assert((await restart.innerText()).includes('Meadow'));
  await buy.click();assert.equal(await game.evaluate(()=>coinWallet),5);assert.equal(await game.evaluate(()=>lives),1);assert.equal(await game.evaluate(()=>score),0);
  assert(await game.evaluate(()=>level==='fire'&&fireMode==='surface'&&player.x===90&&coins.every(c=>!c.taken)&&lavaKing.hp===10));assert.equal(await game.evaluate(()=>state),'playing');
  await page.locator('[data-wallet="19"]').click();assert(!(await buy.isEnabled()));assert(await ad.isEnabled());
  await ad.click();assert.equal(await game.evaluate(()=>state),'reviveAd');assert(!(await buy.isEnabled()));assert(!(await restart.isEnabled()));
  const frozen=await game.evaluate(()=>JSON.stringify({score,coins,player,enemies}));
  await page.keyboard.press('Space');await page.keyboard.press('r');await page.keyboard.press('m');
  await game.locator('#startOverlay').screenshot({path:'previews/coin-revive-test-ad-review.png'});
  assert.equal(await game.evaluate(()=>JSON.stringify({score,coins,player,enemies})),frozen);
  assert.equal(await game.evaluate(()=>lives),0);
  const deadline=await game.evaluate(()=>reviveAdEndsAt);
  await game.waitForFunction(()=>state==='playing'&&lives===3,{},{timeout:7000});
  assert(await game.evaluate(end=>performance.now()>=end,deadline));assert.equal(await game.evaluate(()=>coinWallet),19);assert.equal(await game.evaluate(()=>score),0);assert(await game.evaluate(()=>level==='fire'&&fireMode==='surface'&&player.x===90&&lavaKing.hp===10));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('[data-wallet="25"]').click();await page.locator('iframe').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await game.waitForFunction(()=>getComputedStyle(document.querySelector('#startOverlay')).opacity==='1');
   assert(await game.evaluate(()=>['#reviveCoinButton','#reviveAdButton','#startButton'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})), 'all revival choices fit on the phone');
   await game.locator('#startOverlay').screenshot({path:viewport.width===390?'previews/coin-revive-phone-review.png':'previews/coin-revive-landscape-review.png'});
   await buy.scrollIntoViewIfNeeded();await buy.click();assert.equal(await game.evaluate(()=>lives),1);assert.equal(await game.evaluate(()=>coinWallet),5);
   await page.locator('[data-wallet="25"]').click();await page.locator('iframe').scrollIntoViewIfNeeded();await game.waitForFunction(()=>getComputedStyle(document.querySelector('#startOverlay')).opacity==='1');await restart.scrollIntoViewIfNeeded();await restart.click();assert.equal(await game.evaluate(()=>score),0);assert.equal(await game.evaluate(()=>coinWallet),25);assert.equal(await game.evaluate(()=>level),'meadow');
  }
  const saved=await browser.newPage();saved.on('pageerror',e=>errors.push(e.message));await saved.goto('http://127.0.0.1:8772/index.html');
  await saved.evaluate(()=>{coinWallet=42;saveCoinWallet();});await saved.reload();await saved.waitForFunction(()=>coinWallet===42);
  await saved.evaluate(()=>{meadowFinished=airFinished=waterFinished=earthFinished=true;fireFinished=false;saveWorldProgress();level='fire';start();soundOn=false;lives=1;player.invincible=0;hurt();});
  await saved.locator('#reviveCoinButton').click();assert(await saved.evaluate(()=>level==='fire'&&lives===1&&coinWallet===22&&meadowFinished&&canPlayWorld('fire')));
  await saved.evaluate(()=>{lives=1;player.invincible=0;hurt();});await saved.locator('#startButton').click();assert(await saved.evaluate(()=>level==='meadow'&&lives===3&&coinWallet===22&&!canPlayWorld('air')));
  await saved.reload();assert(await saved.evaluate(()=>level==='meadow'&&coinWallet===22&&!finalUnlocked()));
  await saved.evaluate(()=>{meadowFinished=airFinished=waterFinished=earthFinished=true;level='fire';saveWorldProgress();start();soundOn=false;lives=1;player.invincible=0;hurt();});await saved.reload();assert(await saved.evaluate(()=>level==='meadow'&&coinWallet===22&&!canPlayWorld('fire')),'reloading game-over cannot bypass Meadow');
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.evaluate(()=>{meadowFinished=airFinished=waterFinished=earthFinished=true;level='fire';start();soundOn=false;coinWallet=20;showEnd(false);buyReviveHeart();});assert(await local.evaluate(()=>level==='fire'&&player.x===90&&lives===1));
  assert.deepEqual(errors,[]);console.log('PASS game-over browser: actual coin/ad level restarts, real five-second frozen reward, fresh Fire opening/boss, Meadow fallback and reload, wallet/progress persistence, phone buttons, direct-file play and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
