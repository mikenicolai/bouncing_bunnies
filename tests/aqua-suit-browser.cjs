const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.AQUA_PREVIEW_URL||'http://127.0.0.1:18379/previews/aqua-suit-animation.html');
  await page.waitForFunction(()=>window.aquaPreviewFrame!==undefined);
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  await game.waitForFunction(()=>aquaSuitPaintReady()&&aquaSuitPickupSheet.naturalWidth&&swimSprites.length===8);
  const atlas=await game.evaluate(()=>{
   const c=document.createElement('canvas');c.width=aquaSwimSheet.naturalWidth;c.height=aquaSwimSheet.naturalHeight;const p=c.getContext('2d');p.drawImage(aquaSwimSheet,0,0);const pixels=p.getImageData(0,0,c.width,c.height).data;
   let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;
   return {width:c.width,height:c.height,transparent,frames:AQUA_SWIM_FRAMES.map(([x,y,w,h,ax,ay],i)=>({valid:x>=0&&y>=0&&x+w<=c.width&&y+h<=c.height&&ax>0&&ax<w&&ay>0&&ay<h,cached:!!aquaSwimSprites[i]}))};
  });assert.equal(atlas.width,1774);assert.equal(atlas.height,887);assert(atlas.transparent>450000);assert(atlas.frames.every(f=>f.valid&&f.cached));
  await page.evaluate(()=>paused=true);
  for(const [mode,expected] of [['swim',[0,1,2,3]],['dive',[4,5]],['punch',[0,1,2,3,6,7]],['idle',[0]]]){
   await page.locator(`[data-mode="${mode}"]`).click();const seen=new Set();
   for(let i=0;i<24;i++)seen.add(await page.evaluate(time=>{window.drawAquaPreview(time);return window.aquaPreviewFrame;},i/20));
   for(const f of expected)assert(seen.has(f),`${mode} must show pose ${f}`);
  }
  await page.locator('[data-mode="swim"]').click();await page.locator('#direction').click();assert.equal(await game.evaluate(()=>player.facing),1);
  await page.evaluate(()=>window.drawAquaPreview(.1));assert.equal(await game.evaluate(()=>player.facing),-1);
  await page.locator('#direction').click();await page.evaluate(()=>window.drawAquaPreview(.1));
  // Capture the same painted renderer for the inline animation; no repainting of sprites.
  fs.mkdirSync('/private/tmp/aqua-suit-animation-frames',{recursive:true});
  for(let i=0;i<40;i++){
   const data=await page.evaluate(t=>{window.drawAquaPreview(t);return document.querySelector('#animation').toDataURL('image/png').split(',')[1];},i/20);
   fs.writeFileSync(`/private/tmp/aqua-suit-animation-frames/frame-${String(i).padStart(3,'0')}.png`,Buffer.from(data,'base64'));
  }
  // Worn gear is complete; the old helmet/body overlay is omitted only once art is ready.
  await game.evaluate(()=>{state='review';waterAquaSuit=true;player.vx=80;player.vy=0;player.attack=0;player.facing=1;player.invincible=0;player.swimClock=.25;render(0);});
  let data=await game.evaluate(()=>canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync('previews/aqua-suit-in-level-review.png',Buffer.from(data,'base64'));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(100);await game.evaluate(()=>{state='review';render(0);});
   assert(await game.evaluate(()=>aquaSuitPaintReady()));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('PASS Aqua suit browser: eight transparent painted poses and face registration, swim/dive/idle/punch selection, mirrored animation, real swimming-level rendering and responsive portrait/landscape layouts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
