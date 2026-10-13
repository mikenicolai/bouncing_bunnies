const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return original.call(this,type,type==='2d'?{...options,willReadFrequently:true}:options);};});
  await page.goto('http://127.0.0.1:8772/previews/water-sand-review.html');await page.waitForFunction(()=>ready);const game=page.frames().find(f=>f.parentFrame());assert(game);
  async function capture(scene){fs.writeFileSync(`previews/water-sand-${scene}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));}
  for(const scene of ['join','dry','wet']){await page.locator(`[data-scene="${scene}"]`).click();assert(await game.evaluate(()=>developerRun));await capture(scene);}
  const metrics=await game.evaluate(()=>{
   const paint=()=>{ctx.fillStyle='#12abef';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawWaterSeabed();ctx.restore();};
   const samples=[[1000,750],[1000,1150],[1000,1900],[1410,800],[1590,900],[3000,1450]].map(([x,y])=>{
    cameraX=x-100;cameraY=y-100;paint();const pixels=ctx.getImageData(65,65,70,70).data,colors=new Set();let transparent=0,flat=0;
    for(let i=0;i<pixels.length;i+=4){colors.add(pixels.slice(i,i+3).join(','));if(pixels[i+3]!==255)transparent++;if(pixels[i]===189&&pixels[i+1]===156&&pixels[i+2]===117)flat++;}
    return {x,y,colors:colors.size,transparent,flat};
   });
   cameraX=1100;cameraY=400;paint();const before=Array.from(ctx.getImageData(300,250,1,1).data);cameraX+=37;cameraY+=29;paint();const after=Array.from(ctx.getImageData(263,221,1,1).data);
   cameraX=1150;cameraY=500;paint();let jump=0,count=0;for(let y=650;y<950;y+=4){const a=ctx.getImageData(259,y-cameraY,2,1).data;for(let c=0;c<3;c++){jump+=Math.abs(a[c]-a[c+4]);count++;}}
   cameraX=1000;cameraY=100;paint();const sky=Array.from(ctx.getImageData(200,160,1,1).data);
   return {samples,before,after,seamJump:jump/count,sky};
  });
  for(const s of metrics.samples){assert.equal(s.transparent,0,`ground hole at ${s.x},${s.y}`);assert(s.colors>600,`missing texture at ${s.x},${s.y}`);assert(s.flat<30,`plain fallback sand at ${s.x},${s.y}`);}
  assert(metrics.before.every((v,i)=>Math.abs(v-metrics.after[i])<=1),'sand and wetness stay fixed during horizontal/vertical camera movement');assert(metrics.seamJump<30,'the old join must not impose a vertical colour jump');assert.deepEqual(metrics.sky,[18,171,239,255],'no texture leaks high above the beach');
  const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// WATER_SAND_BEGIN\n')[1].split('\n// WATER_SAND_END')[0],fs.readFileSync('assets/water-sand-v1.js','utf8'));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.locator('[data-scene="join"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture(viewport.width===390?'phone':'landscape');}
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>sandyPitSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='water';start();state='review';player.inWater=true;player.x=1510;player.y=348;cameraX=1150;cameraY=180;render(0);});assert(await local.evaluate(()=>waterSandPainting&&lives===3));
  assert.deepEqual(errors,[]);console.log('PASS Water sand browser: continuous opaque texture through deep beach and seabed, soft join, camera-stable texture/wetness, clean sky, desktop/portrait/landscape and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
