const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/pirate-reach-review.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>ready,{},{timeout:90000});const game=page.frames().find(f=>/index.html/.test(f.url()));
  for(const [width,height,label] of [[1100,950,'desktop'],[390,844,'phone']]){
   await page.setViewportSize({width,height});
   for(const side of [-1,1]){
    await page.locator(`[data-side="${side}"]`).click();
    assert(await game.evaluate(()=>{reviewPirate.swing=.05;return !overlap(player,reviewPirate)&&!overlap(player,pirateWeaponBox(reviewPirate));}),'Benny is outside body and weapon contact before punching');
    fs.writeFileSync(`previews/pirate-reach-${label}-${side<0?'left':'right'}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));
    await page.locator('#play').click();await page.keyboard.press('x');
    await game.waitForFunction(()=>reviewPirate.hp===1,{},{timeout:5000});
    assert.equal(await game.evaluate(()=>lives),3,'actual keyboard punch lands without trading a heart');
    assert(await game.evaluate(()=>reviewPirate.swing===0&&reviewPirate.dizzy>0),'landed punch interrupts the attack');
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('PASS pirate reach browser: actual punches land safely from both sides on desktop/phone, attack interruption, painted combat review and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
