const {chromium}=require('playwright'),assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Keep repeated pixel reads on one raster backend; Chromium otherwise
  // switches from GPU to software mid-comparison and resamples the texture.
  await page.addInitScript(()=>{
   const getContext=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,options){return getContext.call(this,type,type==='2d'?{...options,willReadFrequently:true}:options);};
  });
  await page.goto('http://127.0.0.1:8772/index.html');
  await page.evaluate(()=>{state='review';soundOn=false;});
  await page.waitForFunction(()=>waterCaveSheet.naturalWidth);
  await page.evaluate(()=>waterCaveSheet.decode());
  const results=await page.evaluate(()=>{
   beginDeveloperSession();level='water';start();state='review';soundOn=false;waterTime=0;
   return waterAirPockets.filter(p=>!p.ship).map(p=>{
    const origin=p.x-355,top=p.y-50,width=p.w+40;
    const height=Math.ceil(Math.max(waterProfileY(WATER_ROOF,p.x),waterProfileY(WATER_ROOF,p.x+p.w))-p.y+70);
    function capture(dx,dy=0){
     cameraX=origin+dx;cameraY=top+dy;
     ctx.clearRect(0,0,W,H);ctx.fillStyle='#123456';ctx.fillRect(0,0,W,H);
     ctx.save();ctx.translate(0,-cameraY);drawWaterCaveRoof();drawWaterAirPockets();ctx.restore();
     return ctx.getImageData(p.x-20-cameraX,p.y-10-cameraY,width,height).data;
    }
    const baseline=capture(0);let changed=0;
    function changes(pixels){
     let count=0;
     // Allow small gradient dithering and antialias rounding differences.
     // Displaced rock edges change colors well beyond this four-value tolerance.
     for(let i=0;i<pixels.length;i+=4)if(Math.max(...[0,1,2,3].map(c=>Math.abs(pixels[i+c]-baseline[i+c])))>4)count++;
     return count;
    }
    // Compare the same world pixels, cancelling ordinary camera translation.
    for(let dx=1;dx<=24;dx++){
     const pixels=capture(dx);
     changed+=changes(pixels);
    }
    // Test vertical translation separately; the fallback shading is outside
    // this opaque texture, so rock and air should remain identical here too.
    const verticalChanged=changes(capture(0,12));
    const left=p.x+12,right=p.x+p.w-12;
    const joins=[left,right].map(x=>Math.abs(waterCeilingY(x)-waterCeilingY(x+(x===left?.000001:-.000001))));
    return {x:p.x,changed,verticalChanged,joins};
   });
  });
  for(const result of results){
   assert.equal(result.changed,0,`camera scrolling reshapes air pocket at ${result.x}`);
   assert.equal(result.verticalChanged,0,`vertical scrolling changes air pocket at ${result.x}`);
   assert(result.joins.every(gap=>gap<.00001),`air pocket ${result.x} must join the surrounding ceiling continuously`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all five cave air pockets retain stable world pixels during horizontal/vertical camera movement, with continuous rock shoulders and no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
