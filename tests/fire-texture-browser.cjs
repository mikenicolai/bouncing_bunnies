const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:750}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return original.call(this,type,type==='2d'?{...options,willReadFrequently:true}:options);};});
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>fireGroundSheet.naturalWidth&&fireCliffSheet.naturalWidth&&shaftCrystalSheet.naturalWidth);
  await page.evaluate(()=>{beginDeveloperSession();level='fire';start();beginFireMaze();soundOn=false;state='review';});
  const result=await page.evaluate(()=>{
   W=canvas.width=960;H=canvas.height=540;touchDockHeight=0;
   const probes=[[4600,1970],[4600,2070],[4600,2170]],cameras=[[4200,1740],[4237,1769],[4397,1780],[4475,1740],[4500,1769],[4537,1780],[4200,1740]];
   const images=cameras.map(([x,y])=>{
    cameraX=x;cameraY=y;ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawFireVolcano();ctx.restore();
    return probes.map(([wx,wy])=>Array.from(ctx.getImageData(wx-cameraX,wy-cameraY,64,64).data));
   });
   let changed=0,maxDifference=0;
   const details=images.slice(1).map(frame=>probes.map((_,p)=>{
    let count=0,max=0;
    // Fractionally scaled, translucent paint can vary a few channel values
    // from raster rounding; a shifting source texture changes them much more.
    for(let i=0;i<frame[p].length;i++){const difference=Math.abs(frame[p][i]-images[0][p][i]);if(difference>4){changed++;count++;}maxDifference=Math.max(maxDifference,difference);max=Math.max(max,difference);}
    return{count,max};
   }));
   const colors=new Set();for(let i=0;i<images[0][0].length;i+=4)colors.add(images[0][0].slice(i,i+3).join(','));
   return{changed,maxDifference,colors:colors.size,details};
  });
  assert(result.colors>300,'the comparison samples actual painted rocks and roots');
  assert.equal(result.changed,0,`the same world texture must survive camera movement: ${JSON.stringify(result)}`);
  // Exercise real maze steering and rendering in both phone orientations.
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>{fitGameViewport();beginFireMaze();state='playing';fireZombies=[];keys.clear();keys.add('ArrowRight');});
   await page.waitForTimeout(350);await page.evaluate(()=>{keys.clear();render(0);state='review';});
   assert(await page.evaluate(()=>fireMode==='maze'&&lives===3&&document.documentElement.scrollWidth<=innerWidth));
  }
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>fireGroundSheet.naturalWidth);
  await local.evaluate(()=>{beginDeveloperSession();level='fire';start();beginFireMaze();state='review';cameraX=4300;cameraY=1780;render(0);cameraX+=37;render(0);});
  assert.deepEqual(errors,[]);console.log('PASS Fire texture browser: painted rock/root pixels stay anchored through horizontal/vertical camera movement, both sides of the old origin threshold, return movement, phone orientations and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
