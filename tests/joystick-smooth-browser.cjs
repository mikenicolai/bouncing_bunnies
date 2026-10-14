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
   if(type==='touchMove'||type==='touchStart'){const d=Math.max(1,Math.hypot(x,y));await page.waitForFunction(({x,y})=>Math.abs(joystick.dx-x)<.02&&Math.abs(joystick.dy-y)<.02,{x:x/d,y:y/d},{timeout:3000}).catch(async e=>{console.log(type,x,y,point,await page.evaluate(()=>({W,H,JOY,joystick,state,level})));throw e;});}
   else await page.waitForFunction(()=>!joystick.active);
  };
  for(const [name,width,height] of [['phone',390,844],['phone-landscape',844,390],['tablet',768,1024],['tablet-landscape',1024,768]]){
   await page.setViewportSize({width,height});await scene();
   assert(await page.evaluate(()=>{const r=canvas.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}),'canvas and stick stay inside viewport');
   await touch('touchStart');await touch('touchMove',.4,0);await page.waitForTimeout(450);
   assert(await page.evaluate(()=>player.vx>60&&player.vx<130&&!joystick.sprint),name+' gentle speed');
   await touch('touchMove',1,0);await page.waitForTimeout(250);assert(await page.evaluate(()=>player.vx===360&&joystick.sprint&&paintedBunnyPose().name==='uprightRun'),name+' outer stick runs');
   if(name==='phone'||name==='tablet')await page.locator('#game').screenshot({path:`previews/joystick-deliberate-${name}-v2.png`});
   await touch('touchMove',-1,0);assert(await page.evaluate(()=>player.vx>0),name+' reversal starts smoothly');await page.waitForTimeout(500);assert(await page.evaluate(()=>player.vx===-360&&player.facing===-1));
   await touch('touchEnd');await page.waitForTimeout(350);assert(await page.evaluate(()=>player.vx===0&&!joystick.active&&!joystick.sprint),name+' release stops');
   await scene();await touch('touchStart');await touch('touchMove',.95,-.7);assert(await page.evaluate(()=>player.onGround&&!player.duck&&joystick.sprint),name+' middle band moves and runs without jumping');
   await touch('touchMove',.95,.8);assert(await page.evaluate(()=>player.onGround&&!player.duck),name+' middle-down band does not crouch');await touch('touchMove',0,1);assert(await page.evaluate(()=>player.duck));await touch('touchMove',.95,.8);assert(await page.evaluate(()=>!player.duck),'returning to the middle steering band releases duck');await touch('touchEnd');
   await scene();await touch('touchStart');await touch('touchMove',0,-.9);assert(await page.evaluate(()=>player.vy<0&&player.boosts===0),name+' deliberate top hop');
   await touch('touchMove',0,-1.25);await page.waitForTimeout(220);assert(await page.evaluate(()=>player.vy<0&&player.boosts===2),name+' holding high produces two separate extra taps');
   await page.waitForTimeout(1400);assert(await page.evaluate(()=>player.onGround));await touch('touchMove',0,-1.25);assert(await page.evaluate(()=>player.onGround&&player.boosts===0),name+' one three-jump burst per hold');await touch('touchEnd');
   await scene();await touch('touchStart');await touch('touchMove',1,-1);assert(await page.evaluate(()=>joystick.sprint&&player.vy<0&&player.boosts===0),name+' deliberate diagonal starts run and jump');await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>player.boosts),2);
   await touch('touchCancel');assert(await page.evaluate(()=>!joystick.active&&!joystick.sprint&&!joystick.jumpGesture&&joystick.dx===0&&joystick.dy===0),name+' touch cancellation');
  }
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);await page.evaluate(()=>{beginDeveloperSession();level='final';start();soundOn=false;player.x=100;player.y=412;player.onGround=true;player.invincible=999;selectFinalWeapon('trident');waterTrident.mode='throw';});
  await touch('touchStart');await touch('touchMove',0,1.25);assert(await page.evaluate(()=>player.duck&&waterTrident.dash===0),'straight down still ducks with trident');await touch('touchMove',0,0);await touch('touchMove',1.25,0);assert(await page.evaluate(()=>waterTrident.dash>0&&waterTrident.dx>0&&waterTrident.mode==='throw'),'outer push dashes even when the attack button throws');const dashX=await page.evaluate(()=>player.x);await page.waitForTimeout(200);assert(await page.evaluate(x=>player.x>x+100,dashX));await page.evaluate(()=>{state='review';player.invincible=0;render(0);});await page.locator('#game').screenshot({path:'previews/trident-push-dash-phone-v2.png'});await page.evaluate(()=>{state='playing';player.invincible=999;});await page.waitForTimeout(1300);await touch('touchMove',1.25,0);assert.equal(await page.evaluate(()=>waterTrident.dash),0);await touch('touchMove',.4,0);await touch('touchMove',-1.25,0);assert(await page.evaluate(()=>waterTrident.dash>0&&waterTrident.dx<0));await touch('touchEnd');
  await page.evaluate(()=>{level='water';start();soundOn=false;player.x=2300;player.y=650;player.inWater=true;player.invincible=999;waterTrident.owned=true;waterTrident.mode='throw';});await touch('touchStart');await touch('touchMove',0,-1.25);assert(await page.evaluate(()=>waterTrident.dash>0&&waterTrident.dy<0));await touch('touchEnd');
  const local=await browser.newPage({hasTouch:true,viewport:{width:390,height:844}});local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.evaluate(()=>{level='meadow';start();soundOn=false;player.onGround=true;player.vy=0;updateJoystick({x:JOY.x,y:JOY.y-JOY.radius});});await local.waitForFunction(()=>player.boosts===2);assert(await local.evaluate(()=>player.vy<0));
  assert.deepEqual(errors,[]);console.log('PASS smooth joystick browser: real touch slow/run/reverse/release, wide movement band, deep duck, timed triple-jump hold, diagonal run+jump, finite burst/cancel, directional Castle/water trident push-dash, phone/tablet in both orientations and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
