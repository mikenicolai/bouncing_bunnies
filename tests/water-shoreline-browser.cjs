const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[];
  for(const url of ['http://127.0.0.1:8772/index.html','file://'+process.cwd()+'/index.html']){
   const page=await browser.newPage({viewport:{width:1100,height:750}});page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   await page.waitForFunction(()=>sandyPitSheet.naturalWidth&&swimSheet.naturalWidth);
   async function reset(){await page.evaluate(()=>{beginDeveloperSession();level='water';start();soundOn=false;player.invincible=999;player.inWater=true;player.x=1580;player.y=WATER_SURFACE-WATER_FLOAT_HEAD;player.facing=-1;player.vx=player.vy=0;cameraX=1150;cameraY=0;render(0);});}
   for(const jumpOut of [false,true]){
    await reset();await page.locator('#game').focus();await page.keyboard.down('ArrowLeft');if(jumpOut)await page.keyboard.press('Space');
    await page.waitForFunction(()=>!player.inWater&&player.onGround&&player.x<1380,{},{timeout:5000});await page.keyboard.up('ArrowLeft');
    assert(await page.evaluate(()=>lives===3&&!bunnySwimming()&&Math.abs(player.y+player.h-350)<.01),'keyboard returns to the dry beach and upright artwork');
    await page.keyboard.press('Space');assert(await page.evaluate(()=>player.vy<0&&!player.inWater),'jump button uses land physics after the exit');
   }
   for(const viewport of [{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await reset();
    // Resize handlers finish fitting the control dock on the next animation frame.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>{fitTouchControls();window.scrollTo(0,document.documentElement.scrollHeight);});
    const points=await page.evaluate(()=>{const r=canvas.getBoundingClientRect(),point=x=>({x:r.left+x*r.width/W,y:r.top+JOY.y*r.height/H});return{center:point(JOY.x),left:point(JOY.x-JOY.radius*.85)};});
    await page.mouse.move(points.center.x,points.center.y);await page.mouse.down();await page.mouse.move(points.left.x,points.left.y);
    try{await page.waitForFunction(()=>!player.inWater&&player.onGround&&player.x<1380,{},{timeout:5000});}catch(e){console.error(viewport,points,await page.evaluate(()=>({x:player.x,y:player.y,inWater:player.inWater,joystick,JOY,W,H,rect:canvas.getBoundingClientRect().toJSON()})));throw e;}finally{await page.mouse.up();}
    assert(await page.evaluate(()=>lives===3&&!bunnySwimming()&&!joystick.active),'touch stick exits water and releases normally');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS shoreline browser: keyboard swim/jump exits and land jumping, actual joystick in portrait/landscape, upright artwork, HTTP/direct-file play and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
