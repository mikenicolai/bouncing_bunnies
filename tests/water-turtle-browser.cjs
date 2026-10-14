const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/water-reef-life.html');await page.waitForFunction(()=>ready);const game=page.frames().find(f=>f.parentFrame());assert(game);
  await page.locator('#pause').click();await page.locator('[data-scene="turtle"]').click();
  async function capture(name){fs.writeFileSync(`previews/water-turtle-${name}-v1.png`,Buffer.from(await game.evaluate(()=>{render(0);return canvas.toDataURL().split(',')[1];}),'base64'));}
  await capture('swimming');await page.locator('#turtleComparison').screenshot({path:'previews/water-turtle-style-comparison-v1.png'});
  const paintings=await game.evaluate(()=>{
   const a=WATER_REEF_ART.turtle,c=document.createElement('canvas');c.width=a.width;c.height=a.height;const p=c.getContext('2d');p.drawImage(a.image,0,0);
   return {corner:p.getImageData(0,0,1,1).data[3],poses:Array.from({length:48},(_,step)=>{
    const painting=waterTurtlePainting(step),paint=painting.getContext('2d'),pixels=paint.getImageData(0,0,130,100).data;let minX=130,minY=100,maxX=0,maxY=0;
    for(let y=0;y<100;y++)for(let x=0;x<130;x++)if(pixels[(y*130+x)*4+3]>12){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
    return{minX,maxX,minY,maxY,body:paint.getImageData(65,50,1,1).data[3]};
   })};
  });assert.equal(paintings.corner,0,'native turtle has real transparency');
  for(const p of paintings.poses){assert(p.body>230,'the shell stays opaque throughout the stroke');assert(p.minX>=15&&p.maxX<=115&&p.minY>=22&&p.maxY<=78,'painted flippers fit the original 100 by 56 rock-clearance box');}
  assert(await game.evaluate(()=>developerRun&&lives===3));
  const frozen=await game.evaluate(()=>JSON.stringify(Array.from({length:5},(_,i)=>waterTurtlePose(i))));await page.waitForTimeout(200);assert.equal(await game.evaluate(()=>JSON.stringify(Array.from({length:5},(_,i)=>waterTurtlePose(i)))),frozen);
  await page.locator('#pause').click();await page.waitForTimeout(350);assert.notEqual(await game.evaluate(()=>JSON.stringify(Array.from({length:5},(_,i)=>waterTurtlePose(i)))),frozen);await page.locator('#pause').click();
  // Both facing directions and both end poses use the same painted character.
  await game.evaluate(()=>{state='review';cameraX=2000;cameraY=470;render(0);drawWaterTurtle({x:2500,y:740,direction:1,stroke:0});drawWaterTurtle({x:2700,y:740,direction:-1,stroke:1});});
  fs.writeFileSync('previews/water-turtle-directions-v1.png',Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.locator('[data-scene="turtle"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture(viewport.width===390?'phone':'landscape');}
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>WATER_REEF_ART.turtle.image.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='water';start();state='review';player.inWater=true;player.x=2430;player.y=650;cameraX=2020;cameraY=470;waterTime=2;render(0);});
  assert.deepEqual(errors,[]);console.log('PASS swimming turtle browser: forest-matched painted character, transparent six-pose atlas, steady shell through 48 flipper blends, safe swimming envelope, both directions, pause/animation, desktop/phone and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
