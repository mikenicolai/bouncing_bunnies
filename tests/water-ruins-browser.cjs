const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/water-ruins-review.html');
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  await game.waitForFunction(()=>neptunusSheet.naturalWidth&&waterRuinsSheet.naturalWidth&&swimSprites.length===8&&waterGateSheet.naturalWidth);
  async function capture(scene,file){
   await page.locator(`[data-scene="${scene}"]`).click();
   await game.evaluate(()=>{state='review';render(0);});
   const data=await game.evaluate(()=>canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync('previews/'+file,Buffer.from(data,'base64'));
  }
  await capture('trident','water-trident-review.png');await capture('suit','water-aqua-suit-review.png');await capture('boss','water-neptunus-review.png');
  await capture('tide','water-tide-warning-review.png');await capture('thrust','water-thrust-warning-review.png');
  const art=await game.evaluate(()=>{
   const source=document.createElement('canvas');source.width=neptunusSheet.naturalWidth;source.height=neptunusSheet.naturalHeight;const c=source.getContext('2d');c.drawImage(neptunusSheet,0,0);
   const pixels=c.getImageData(0,0,source.width,source.height).data;let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;
   return {transparent,poses:NEPTUNUS_FRAMES.map((b,i)=>({valid:b.x>=0&&b.y>=0&&b.x+b.w<=source.width&&b.y+b.h<=source.height,cached:!!neptunusPaint.frame(i)}))};
  });assert(art.transparent>200000);assert(art.poses.every(p=>p.valid&&p.cached),'all painted poses are within the alpha atlas');
  await page.locator('[data-scene="boss"]').click();await game.evaluate(()=>{state='review';player.invincible=99;});
  await game.evaluate(()=>{state='playing';});await page.keyboard.press('z');
  assert.equal(await game.evaluate(()=>waterTrident.mode),'dash');await page.keyboard.press('z');assert.equal(await game.evaluate(()=>waterTrident.mode),'throw');
  // Real touch-style mode clicks in both mobile orientations.
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('iframe').scrollIntoViewIfNeeded();await page.locator('[data-scene="boss"]').click();
   await game.evaluate(()=>{state='review';player.invincible=0;cameraX=player.x-waterViewSize().width*.25;cameraY=neptunus.y+neptunus.h-waterViewSize().height*.78;render(0);});
   const file=viewport.width===390?'water-neptunus-phone-review.png':'water-neptunus-landscape-review.png';
   const data=await game.evaluate(()=>canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync('previews/'+file,Buffer.from(data,'base64'));
   assert(await game.evaluate(()=>touchDockHeight>0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('iframe').scrollIntoViewIfNeeded();
   const point=await game.evaluate(()=>{const r=canvas.getBoundingClientRect();return {x:r.left+ACTIONS.ability2.x*r.width/W,y:r.top+ACTIONS.ability2.y*r.height/H};});
   const iframe=await page.locator('iframe').boundingBox();await game.evaluate(()=>{state='playing';});await page.mouse.click(iframe.x+point.x,iframe.y+point.y);
   assert.equal(await game.evaluate(()=>waterTrident.mode),'dash','MODE button switches water equipment on phones');
  }
  assert.deepEqual(errors,[]);console.log('PASS water browser: transparent eight-pose Neptunus, painted ruins, both pickups, attack warnings, real keyboard/touch mode controls, desktop and both phone orientations without runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
