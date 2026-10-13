const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/final-castle-review.html');await page.waitForFunction(()=>!document.querySelector('[data-scene="ending"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);await page.locator('[data-scene="ending"]').click();
  // Read the actual painted background beneath each light, without its animated glow.
  const checks=await game.evaluate(()=>{
   state='review';soundOn=false;cameraY=0;
   return [3300,4600,5800,7090,7700].map(camera=>{
    cameraX=camera;drawFinalBackground();
    const mounts=finalTorches.filter(t=>!t.arch&&t.x-cameraX>10&&t.x-cameraX<W-10&&t.y>0&&t.y<H).map(t=>({x:t.x,color:Array.from(ctx.getImageData(Math.round(t.x-cameraX),Math.round(t.y),1,1).data)}));
    const calls=[],original=ctx.drawImage;ctx.drawImage=function(...args){if(args[0]===finalHallSheet&&args[2]===0&&args[4]===1024)calls.push(args.slice(1));return original.apply(this,args);};drawFinalBackground();ctx.drawImage=original;
    return {camera,mounts,calls,doorVisible:FINAL_INNER_DOOR_X-camera<W&&FINAL_INNER_DOOR_X+FINAL_INNER_DOOR_HALF_W*2>camera,doorX:FINAL_HALL.doorX};
   });
  });
  assert(checks.reduce((n,c)=>n+c.mounts.length,0)>=15,'fixtures cover torches throughout the hall');
  for(const check of checks){
   assert(check.mounts.length>=1,'fixture includes mounted lighting');
   for(const m of check.mounts)assert(m.color[0]>m.color[1]&&m.color[1]>m.color[2],`torch ${m.x} must be anchored over the painting's warm flame, not a blue window or opening`);
   assert.equal(check.calls.filter(c=>c[0]===check.doorX).length,2*Number(check.doorVisible),'only the two leaves of the single end door are drawn');
   assert(check.calls.filter(c=>c[0]!==check.doorX).every(c=>c[0]>=200&&c[0]+c[2]<=1310),'repeating hall excludes exterior openings and wooden doors');
  }
  for(const [width,height,label] of [[1100,900,'desktop'],[390,844,'phone'],[844,390,'landscape']]){
   await page.setViewportSize({width,height});await game.evaluate(()=>{state='review';player.x=7310;player.y=FINAL_FLOOR-58;cameraX=7090;cameraY=touchDockHeight?phoneGroundCameraY():0;finalMonsters=[];render(0);});
   fs.writeFileSync(`previews/castle-door-${label}-review.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1100,height:900});await game.evaluate(()=>{state='review';player.x=8250;cameraX=Math.min(FINAL_W-W,7710);cameraY=0;render(0);});
  fs.writeFileSync('previews/castle-inner-door-review.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  assert.deepEqual(errors,[]);console.log('PASS Castle artwork: hall tiles exclude doorway/opening seams, one inner door at the end, animated torch centers sit over painted mounted flames, desktop and both phone orientations without runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
