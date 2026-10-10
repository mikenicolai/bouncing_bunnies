const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8772/previews/boss-refinements.html');
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);await game.waitForFunction(()=>woodBossImages.giant.naturalWidth&&tempestSheet.naturalWidth&&earthGroundSheet.naturalWidth);
  const measurements=await game.evaluate(()=>{
   state='review';
   const art=document.createElement('canvas');art.width=32;art.height=16;const paint=art.getContext('2d');paint.fillStyle='#ff0000';paint.fillRect(0,0,16,16);paint.fillStyle='#0000ff';paint.fillRect(16,0,16,16);
   const blend=new WoodBossAnimation.PaintedPoseBlend(art,[{x:0,y:0,w:16,h:16},{x:16,y:0,w:16,h:16}]);
   const out=document.createElement('canvas');out.width=100;out.height=100;const c=out.getContext('2d');blend.draw(c,0,1,.5,50,70,40);const opaque=Array.from(c.getImageData(50,50,1,1).data);
   const difference=(a,b)=>{let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);return sum/a.length;};
   const earth=t=>{ctx.clearRect(0,0,W,H);woodBossRenderer.walk(ctx,'giant',W/2,H*.85,336,t,-1);return ctx.getImageData(0,0,W,H).data;};
   const earthBoundary=difference(earth(.3124),earth(.3126)),earthStep=difference(earth(.2125),earth(.3125));
   level='air';resetGame();state='review';soundOn=false;player.x=5000;player.y=airPlatforms[19].y-58;bossAwake=true;cameraX=4950;cameraY=-2050;
   const air=t=>{bossTime=t;updateTempest(0);render(0);return ctx.getImageData(0,0,W,H).data;};
   const tempestBoundary=difference(air(.1999),air(.2001)),tempestStep=difference(air(.15),air(.25));
   return {opaque,earthBoundary,earthStep,tempestBoundary,tempestStep};
  });
  assert.deepEqual(measurements.opaque,[128,0,128,255],'blended torso stays opaque');
  assert(measurements.earthStep>.02&&measurements.tempestStep>.02,'both paintings must move');
  assert(measurements.earthBoundary<measurements.earthStep*.08,'earth gait has no hard pose boundary');
  assert(measurements.tempestBoundary<measurements.tempestStep*.08,'Tempest has no hard frame boundary');
  async function capture(file){const data=await game.evaluate(()=>{render(0);return canvas.toDataURL('image/png').split(',')[1];});fs.writeFileSync('previews/'+file,Buffer.from(data,'base64'));}
  await page.locator('[data-scene="vine"]').click();await game.evaluate(()=>{state='review';earthBoss.phaseAge=1.3;earthBossVine.age=1.3;earthBossVine.grabbed=true;render(0);});await capture('boss-vine-pull-review.png');
  await page.locator('[data-scene="spikes"]').click();await game.evaluate(()=>{state='review';earthBoss.phaseAge=.8;earthBossMountains[0].age=.8;render(0);});assert.equal(await game.evaluate(()=>earthBossMountains[0].x),await game.evaluate(()=>player.x+player.w/2));await capture('boss-targeted-spikes-review.png');
  await page.locator('[data-scene="tempest"]').click();await game.evaluate(()=>{state='review';bossTime=.36;updateTempest(0);render(0);});await capture('tempest-smooth-review.png');
  await page.setViewportSize({width:390,height:844});await page.locator('[data-scene="vine"]').click();await game.evaluate(()=>{state='review';earthBoss.phaseAge=1.3;earthBossVine.age=1.3;earthBossVine.grabbed=true;cameraX=earthBoss.x-W*.70;cameraY=EARTH_ARENA.floor-playfieldHeight()*.82;render(0);});await capture('boss-vine-phone-review.png');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  console.log('PASS painted boss smoothing: opaque pose blends, continuous earth gait/Tempest frames, vine and bunny-targeted warnings, desktop/phone artwork.');console.log(JSON.stringify(measurements));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
