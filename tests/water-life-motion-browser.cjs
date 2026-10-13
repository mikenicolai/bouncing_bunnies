const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  for(const url of ['http://127.0.0.1:8772/index.html','file://'+process.cwd()+'/index.html']){
   const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.waitForFunction(()=>Object.values(WATER_REEF_ART).every(a=>a.image.naturalWidth));
   await page.evaluate(()=>{beginDeveloperSession();level='water';start();soundOn=false;});
   const before=await page.evaluate(()=>({time:waterTime,fish:waterFishPose(0,0).x,turtle:waterTurtlePose(0).x,stroke:waterTurtlePose(0).stroke}));
   await page.waitForTimeout(500);
   const after=await page.evaluate(()=>({time:waterTime,fish:waterFishPose(0,0).x,turtle:waterTurtlePose(0).x,stroke:waterTurtlePose(0).stroke,dry:!player.inWater}));
   assert(after.dry,'Benny is standing on the starting beach');assert(after.time>before.time+.1,'actual game loop animates Water on shore');
   for(const key of ['fish','turtle','stroke'])assert.notEqual(after[key],before[key],`${key} animates with Benny dry`);
   // Exercise the real drawing functions with both travel directions.
   const directions=await page.evaluate(()=>{
    state='review';const scale=ctx.scale,seen=[];ctx.scale=function(x,y){seen.push(Math.sign(x));return scale.call(this,x,y);};
    try{for(const t of [0,6]){drawWaterReefFish(waterFishPose(0,0,t),0,t);drawWaterTurtle(waterTurtlePose(0,t));}}finally{ctx.scale=scale;}
    return seen;
   });assert.deepEqual(directions,[-1,1,1,-1],'painted sprites flip at their swimming reversals');
   const frozen=await page.evaluate(()=>{state='map';return waterTime;});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>waterTime),frozen);
   await page.evaluate(()=>{state='playing';player.inWater=true;player.x=1800;player.y=WATER_SURFACE-WATER_FLOAT_HEAD;player.air=WATER_AIR;});
   await page.waitForTimeout(300);assert(await page.evaluate(frozen=>waterTime>frozen,frozen),'swimming resumes the same clock');
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS reef game-loop browser: fish movement and turtle strokes from shore, actual painted sprite mirroring, map pause/swimming resume, HTTP and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
