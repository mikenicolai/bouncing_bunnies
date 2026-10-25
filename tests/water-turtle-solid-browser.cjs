const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/water-reef-life.html#turtle-obstacle',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>ready,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  for(const [width,height,label] of [[1100,950,'desktop'],[390,844,'phone'],[844,390,'landscape']]){
   await page.setViewportSize({width,height});await page.locator('[data-scene="turtle-obstacle"]').click();
   await page.keyboard.down('ArrowRight');
   await game.waitForFunction(()=>{const b=waterTurtleBody(waterReefSwimmers[105]);return player.x+player.w>b.x-5&&player.x<b.x;},{},{timeout:12000});
   const contact=await game.evaluate(()=>({lives,gap:waterTurtleBody(waterReefSwimmers[105]).x-player.x-player.w,overlap:overlap(player,waterTurtleBody(waterReefSwimmers[105]))}));
   assert.equal(contact.lives,3);assert(!contact.overlap);assert(contact.gap>=0&&contact.gap<8,'Benny reaches the visible shell instead of passing through it');
   fs.writeFileSync(`previews/water-turtle-solid-${label}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));
   await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowUp');
   await game.waitForFunction(()=>player.y+player.h<waterTurtleBody(waterReefSwimmers[105]).y-12,{},{timeout:12000});
   await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowRight');
   await game.waitForFunction(()=>player.x>waterTurtleBody(waterReefSwimmers[105]).x+100+10,{},{timeout:12000});
   await page.keyboard.up('ArrowRight');assert.equal(await game.evaluate(()=>lives),3,'swimming around the turtle loses no hearts');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('PASS turtle obstacle browser: real key-driven swim contact, no overlap/damage, swim above and continue, desktop/phone/landscape, no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
