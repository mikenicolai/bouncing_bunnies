const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/air-descent-painted-review.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('[data-scene="middle"]').disabled,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  const clock=await game.evaluate(()=>airTime);await game.waitForFunction(t=>airTime>t+.25,clock);
  const phases=await game.evaluate(()=>{
   state='review';canvas.width=W=960;canvas.height=H=540;cameraX=6000;cameraY=-1100;
   const original=ctx.drawImage,results=[];
   for(const time of [0,1.8,2.22,2.3,2.4]){
    airTime=time;const draws=[];ctx.drawImage=function(...args){draws.push(args.slice(1));return original.apply(this,args);};
    drawDescentCloud(descentObstacles[0]);results.push({time,phase:stormPhase(descentObstacles[0]),draws});
   }
   ctx.drawImage=original;return results;
  });
  assert.deepEqual(phases.map(p=>p.draws.length),[1,1,1,2,2],'painted bolt appears only in existing active/afterglow phases');
  assert.deepEqual(phases.map(p=>p.draws[0].slice(0,4)),[[12,267,604,159],[639,268,603,158],[12,868,604,159],[12,868,604,159],[12,868,604,159]],'idle, charging and charged paintings follow the real attack clock');
  assert.deepEqual(phases[3].draws[1].slice(4),[141,-923,38,113],'painted lightning follows the original strike lane');
  const windPixels=await game.evaluate(()=>{
   ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawDescentWindGuide();ctx.restore();
   const pixels=ctx.getImageData(DESCENT.right+18-cameraX-15,0,30,H).data;
   return Array.from(pixels).filter((v,i)=>i%4===3&&v>40).length;
  });assert(windPixels>100,'wind curls remain visible after camera translation');
  for(const [width,height,label] of [[1100,950,'desktop'],[390,844,'phone']]){
   await page.setViewportSize({width,height});
   for(const scene of ['entry','middle','lower']){
    await page.locator(`[data-scene="${scene}"]`).click();
    const png=await game.evaluate(()=>{airTime=1.5;render(0);return canvas.toDataURL().split(',')[1];});
    fs.writeFileSync(`previews/air-descent-painted-${scene}-${label}-v1.png`,Buffer.from(png,'base64'));
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'preview fits the viewport');
  }
  assert.deepEqual(errors,[]);
  console.log('PASS painted descent: real idle/charge/strike/afterglow sprites, bolt stays on original damage lane, animated review, entry/middle/lower desktop and phone renders, no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
