const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({hasTouch:true,viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>earthGroundSheet.naturalWidth);
  const session=await page.context().newCDPSession(page);
  const scene=async()=>{
   await page.evaluate(()=>{beginDeveloperSession();level='meadow';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();platforms=[{x:0,y:470,w:20000,h:400}];enemies=[];Object.assign(player,{x:200,y:412,vx:0,vy:0,onGround:true,invincible:999});fitTouchControls();});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  };
  const touch=async(type,x=0,y=0)=>{
   const point=await page.evaluate(({x,y})=>{const r=canvas.getBoundingClientRect();return{x:r.left+(JOY.x+x*(JOY.radius-12))*r.width/W,y:r.top+(JOY.y+y*(JOY.radius-12))*r.height/H};},{x,y});
   await session.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{id:1,...point,radiusX:7,radiusY:7,force:1}]});
   if(type==='touchMove'||type==='touchStart'){const d=Math.max(1,Math.hypot(x,y));await page.waitForFunction(({x,y})=>Math.abs(joystick.dx-x)<.02&&Math.abs(joystick.dy-y)<.02,{x:x/d,y:y/d});}
   else await page.waitForFunction(()=>!joystick.active);
  };
  for(const [name,width,height] of [['phone',390,844],['phone-landscape',844,390],['tablet',768,1024],['tablet-landscape',1024,768]]){
   await page.setViewportSize({width,height});await scene();
   assert(await page.evaluate(()=>{const r=canvas.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}),'canvas and stick stay inside viewport');
   await touch('touchStart');await touch('touchMove',.4,0);await page.waitForTimeout(450);
   assert(await page.evaluate(()=>player.vx>60&&player.vx<130&&!joystick.sprint),name+' gentle speed');
   await touch('touchMove',1,0);await page.waitForTimeout(250);assert(await page.evaluate(()=>player.vx===360&&joystick.sprint&&paintedBunnyPose().name==='uprightRun'),name+' outer stick runs');
   if(name==='phone'||name==='tablet')await page.locator('#game').screenshot({path:`previews/joystick-smooth-${name}-v1.png`});
   await touch('touchMove',-1,0);assert(await page.evaluate(()=>player.vx>0),name+' reversal starts smoothly');await page.waitForTimeout(500);assert(await page.evaluate(()=>player.vx===-360&&player.facing===-1));
   await touch('touchEnd');await page.waitForTimeout(350);assert(await page.evaluate(()=>player.vx===0&&!joystick.active&&!joystick.sprint),name+' release stops');
   await scene();await touch('touchStart');await touch('touchMove',0,-.61);assert(await page.evaluate(()=>player.vy<0&&player.boosts<=1),name+' normal hop');
   await touch('touchMove',0,-1);assert(await page.evaluate(()=>player.vy<=-620&&player.boosts===2),name+' stronger drag makes high jump');
   await page.waitForTimeout(1400);assert(await page.evaluate(()=>player.onGround));await touch('touchMove',0,-1);assert(await page.evaluate(()=>player.onGround&&player.boosts===0),name+' holding up does not autojump');await touch('touchEnd');
   await scene();await touch('touchStart');await touch('touchMove',.707,-.707);assert(await page.evaluate(()=>joystick.sprint&&player.vy<0&&player.boosts===2),name+' diagonal run and jump');
   await touch('touchCancel');assert(await page.evaluate(()=>!joystick.active&&!joystick.sprint&&!joystick.jumpGesture&&joystick.dx===0&&joystick.dy===0),name+' touch cancellation');
  }
  const local=await browser.newPage({hasTouch:true,viewport:{width:390,height:844}});local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.evaluate(()=>{level='meadow';start();soundOn=false;player.onGround=true;player.vy=0;updateJoystick({x:JOY.x,y:JOY.y-JOY.radius});});assert(await local.evaluate(()=>player.boosts===2&&player.vy<0));
  assert.deepEqual(errors,[]);console.log('PASS smooth joystick browser: real touch slow/run/reverse/release, gradual high jump, diagonal run+jump, no autojump, cancel, phone/tablet in both orientations and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
