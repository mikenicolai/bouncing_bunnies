const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/meadow-lessons.html');
  await page.waitForFunction(()=>!document.querySelector('[data-scene="finish"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
  async function capture(scene){
   await page.locator(`[data-scene="${scene}"]`).click();
   await game.evaluate(scene=>{state='review';if(scene!=='dive')cameraY=250;render(0);},scene);
   fs.writeFileSync(`previews/meadow-ground-${scene}-review.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  }
  for(const scene of ['shore','dive','finish'])await capture(scene);
  // The areas that formerly exposed plain brown rectangles have opaque texture at depth.
  const samples=await game.evaluate(()=>{
   const terrain=meadowGroundTexture(),paint=terrain.image.getContext('2d');
   return [6050,7050,7350].flatMap(x=>[800,1200,1900].map(y=>{
    const pixels=paint.getImageData(x-terrain.left,y-terrain.top,80,80).data,colors=new Set();let transparent=0,flat=0;
    for(let i=0;i<pixels.length;i+=4){colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);if(pixels[i+3]!==255)transparent++;if(pixels[i]===114&&pixels[i+1]===80&&pixels[i+2]===56)flat++;}
    return {x,y,colors:colors.size,transparent,flat};
   }));
  });
  for(const s of samples){assert.equal(s.transparent,0,`texture gap at ${s.x},${s.y}`);assert(s.colors>500,`flat ground at ${s.x},${s.y}`);assert(s.flat<64,`fallback brown at ${s.x},${s.y}`);}
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await capture('finish');
   fs.writeFileSync(`previews/meadow-ground-${viewport.width===390?'phone':'landscape'}-review.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1200,height:950});await capture('finish');
  const text=await game.evaluate(()=>{
   coinWallet=0;start();coins.slice(0,30).forEach(collectCoin);lives=1;player.invincible=0;hurt();buyReviveHeart();state='review';
   const labels=[],original=ctx.fillText;ctx.fillText=function(text,...args){labels.push(text);return original.call(this,text,...args);};render(0);ctx.fillText=original;return labels;
  });
  assert(text.includes('10 available'));assert(text.includes('Level: 0 / 34 collected'));assert(text.includes('Start 10 + 0 − 0 spent = 10'));
  fs.writeFileSync('previews/coin-wallet-accounting-review.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  // The user's direct file view must render too; avoid pixel readback on file-origin artwork.
  const local=await browser.newPage({viewport:{width:844,height:390}});local.on('pageerror',e=>errors.push(e.message));
  await local.goto('file://'+process.cwd()+'/index.html');await local.evaluate(()=>{beginDeveloperSession();level='meadow';start();state='review';});
  await local.waitForFunction(()=>earthGroundSheet.naturalWidth&&sandyPitSheet.naturalWidth&&meadowZombieSheet.naturalWidth);
  await local.evaluate(()=>{state='playing';cameraX=0;meadowZombiePaint=null;render(0);});
  await local.waitForFunction(()=>meadowZombiePaint&&meadowLesson.time>.1);
  await local.evaluate(()=>{state='review';});
  await local.evaluate(()=>{player.x=7250;player.y=412;cameraX=6540;cameraY=250;render(0);});
  await local.locator('#game').screenshot({path:'previews/meadow-ground-file-review.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS Meadow ground/browser accounting: full-depth opaque texture at both banks, desktop/portrait/landscape renders, paid restart with zero level coins and 10 available, and direct-file rendering without errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
