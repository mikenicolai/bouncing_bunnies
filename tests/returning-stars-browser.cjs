const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/tempest-wind-stars.html');
  await page.waitForFunction(()=>!document.querySelector('[data-scene="overview"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  await page.locator('[data-scene="overview"]').click();
  await game.evaluate(()=>{
   player.invincible=Infinity;tempest.shotCooldown=Infinity;player.facing=1;state='playing';
   window.starReturns=[];const original=returnWindStar;
   returnWindStar=function(star,dt){const age=star.age;original(star,dt);if(star.state==='ready')window.starReturns.push({slot:windStars.slots.indexOf(star),age});};
  });
  await game.locator('#game').focus();await page.keyboard.press('x');
  await game.waitForFunction(()=>windStars.slots[0].state==='returning');
  assert(await game.evaluate(()=>tempest.hp===7),'a real star damages Tempest and immediately turns back');
  const x=await game.evaluate(()=>windStars.slots[0].x);await page.waitForTimeout(200);
  assert(await game.evaluate(()=>windStars.slots[0].x)<x,'a hit star moves back rather than remaining in Tempest');
  await game.waitForFunction(()=>player.attackCooldown<=0);await page.keyboard.press('x');
  assert.equal(await game.evaluate(()=>windStars.slots.filter(s=>s.state!=='ready').length),2);
  await page.waitForTimeout(500);await page.keyboard.press('x');
  assert.equal(await game.evaluate(()=>windStars.slots.length),2,'no third star is created');
  await game.evaluate(()=>render(0));
  fs.writeFileSync('previews/ninja-stars-returning-v1.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  await game.waitForFunction(()=>windStars.slots.every(s=>s.state==='ready'),{},{timeout:15000});
  const returns=await game.evaluate(()=>window.starReturns);assert.equal(returns.length,2);
  for(const event of returns)assert(event.age>=5-1e-8&&event.age<5.04,'each real-time throw returns at five simulated seconds');
  await page.keyboard.press('x');assert.equal(await game.evaluate(()=>windStars.slots[0].state),'flying','returned stars can be thrown again');
  // Real pointer THROW controls on phone and tablet, with the same two-slot weapon.
  for(const [width,height,label] of [[390,844,'phone'],[768,1024,'tablet']]){
   await page.setViewportSize({width,height});await page.locator('[data-scene="overview"]').click();
   await page.locator('iframe').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
   await game.evaluate(()=>{player.invincible=Infinity;tempest.shotCooldown=Infinity;state='playing';fitTouchControls();});
   const iframe=await page.locator('iframe').boundingBox(),p=await game.evaluate(()=>{const r=canvas.getBoundingClientRect(),b=ACTIONS.hit;return{x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};});
   await page.mouse.click(iframe.x+p.x,iframe.y+p.y);
   assert.equal(await game.evaluate(()=>windStars.slots.filter(s=>s.state!=='ready').length),1,'touch button throws one star');
   await game.evaluate(()=>render(0));
   fs.writeFileSync(`previews/ninja-stars-${label}-v1.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.locator('[data-scene="return-demo"]').click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Star 1:'));
  assert.deepEqual(errors,[]);console.log('PASS returning-stars browser: keyboard throws, real Tempest hit turns back, two independent five-second returns and reuse, phone/tablet touch throws and animated preview without errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
