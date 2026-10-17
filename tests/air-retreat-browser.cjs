const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>characterSprites.length&&islandSprites.length===4);
  const cdp=await page.context().newCDPSession(page);
  async function setup(x){
   await page.evaluate(x=>{
    beginDeveloperSession();level='air';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();tempest.hp=0;player.invincible=999;
    Object.assign(player,{x,y:-1748,vx:0,vy:0,onGround:true,airCloud:airPlatforms[19]});update(0);fitTouchControls();
    window.airBaseUpdate??=update;window.airRetreatJumps=[];update=dt=>{const x=player.x;airBaseUpdate(dt);if(player.x>x+100)airRetreatJumps.push({from:x,to:player.x,y:player.y,lives});};
   },x);await page.waitForTimeout(150);await page.locator('#game').focus();
  }
  async function steer(direction,touch){
   if(!touch){await page.keyboard.down(direction<0?'ArrowLeft':'ArrowRight');return;}
   const point=await page.evaluate(direction=>{const r=canvas.getBoundingClientRect();return {id:1,x:r.left+(JOY.x+direction*(JOY.radius-12))*r.width/W,y:r.top+JOY.y*r.height/H};},direction);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await page.waitForFunction(()=>joystick.active);
  }
  async function release(direction,touch){if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.keyboard.up(direction<0?'ArrowLeft':'ArrowRight');}
  for(const [name,width,height,touch] of [['desktop',1100,800,false],['phone',390,844,true],['tablet',768,1024,true]]){
   await page.setViewportSize({width,height});await setup(4800);await steer(-1,touch);
   await page.waitForFunction(()=>player.onGround&&player.airCloud===airPlatforms[15],{},{timeout:10000});
   assert(await page.evaluate(()=>lives===3&&checkpoint.x===3725),name+': the tree island becomes the safe return checkpoint');
   if(name==='phone'){
    await page.evaluate(()=>{state='review';player.invincible=0;render(0);});await page.locator('#game').screenshot({path:'previews/air-tree-return-phone-v1.png'});
    await page.evaluate(()=>{player.invincible=999;state='playing';});
   }
   await page.waitForFunction(()=>player.x<3400,{},{timeout:8000});await release(-1,touch);
   assert(await page.evaluate(()=>lives===3&&state==='playing'&&airRetreatJumps.length===0),name+': continue left from the tree without a phantom death');
   await setup(5890);await steer(1,touch);await page.waitForFunction(()=>descentStarted,{},{timeout:3000});await release(1,touch);
   await page.evaluate(()=>{player.x=6100;player.y=1000;update(0);airRetreatJumps=[];});assert(await page.evaluate(()=>lives===2&&player.x===5890),'a genuine dropper miss still restores its entrance');
   await steer(-1,touch);await page.waitForFunction(()=>player.x<3550,{},{timeout:12000});await release(-1,touch);
   assert(await page.evaluate(()=>lives===2&&!descentStarted&&checkpoint.x<5000&&tempest.hp===0&&airRetreatJumps.length===0),name+': dropper death then real left retreat never teleports back into its shaft');
   // The same defeated-boss entrance still permits a fresh dropper attempt.
   await page.evaluate(()=>{clearInputs();player.x=5890;player.y=-1748;player.vx=player.vy=0;player.onGround=true;player.airCloud=airPlatforms[19];});
   await steer(1,touch);await page.waitForFunction(()=>descentStarted,{},{timeout:3000});await release(1,touch);assert(await page.evaluate(()=>checkpoint.x===5890&&!descentBlueReached));
  }
  assert.deepEqual(errors,[]);console.log('PASS real keyboard/phone/tablet joystick return from Tempest across the tree, updated safe checkpoints, dropper miss/left retreat without teleports, retained boss defeat and fresh retry; no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
