const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({hasTouch:true,viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');const session=await page.context().newCDPSession(page);
  async function setup(world){
   await page.evaluate(world=>{
    beginDeveloperSession();level=world;start();soundOn=false;fallbackFullscreen=true;syncFullscreen();fireArrow.owned=true;player.invincible=999;player.onGround=true;player.y=platforms[0].y-58;
    if(world==='fire'){beginSecondVolcano();player.x=10340;player.y=FIRE_KING_ARENA.y-58;player.onGround=true;beginLavaKing();lavaKing.dizzy=999;}
    else if(world==='final')selectFinalWeapon('bow');else toggleFireAim();fitTouchControls();
    window.bowTestOriginalJump??=jump;window.bowTestJumpCalls=0;jump=function(){window.bowTestJumpCalls++;return window.bowTestOriginalJump();};
   },world);
   await page.waitForTimeout(150);await page.locator('#game').focus();assert(await page.evaluate(()=>fireArcheryMode()));
  }
  async function stickPoint(x,y){return page.evaluate(({x,y})=>{const r=canvas.getBoundingClientRect();return {id:1,x:r.left+(JOY.x+x*(JOY.radius-12))*r.width/W,y:r.top+(JOY.y+y*(JOY.radius-12))*r.height/H};},{x,y});}
  async function stick(type,x=0,y=0){
   const point=await stickPoint(x,y);await session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[point]});
   if(type==='touchEnd')await page.waitForFunction(()=>!joystick.active);else await page.waitForFunction(()=>joystick.active);
   return point;
  }
  for(const [name,width,height,world] of [
   ['phone portrait',390,844,'fire'],['phone landscape',844,390,'fire'],
   ['tablet portrait',768,1024,'fire'],['tablet landscape',1024,768,'fire'],
   ['Meadow phone',390,844,'meadow'],['Castle phone',390,844,'final']
  ]){
   await page.setViewportSize({width,height});await setup(world);const start=await page.evaluate(()=>({y:player.y,angle:fireArrow.angle}));
   await stick('touchStart');await stick('touchMove',0,-1.35);await page.waitForTimeout(400);
   assert(await page.evaluate(start=>player.onGround&&player.y===start.y&&player.boosts===0&&!joystick.jumpGesture&&fireArrow.angle>start.angle,start),name+': full upward hold aims without jumping');
   const high=await page.evaluate(()=>fireArrow.angle);await stick('touchMove',0,1.35);await page.waitForTimeout(350);
   assert(await page.evaluate(high=>player.onGround&&!player.duck&&fireArrow.angle<high,high),name+': downward aim does not duck or jump');
   const x=await page.evaluate(()=>player.x);await stick('touchMove',1,-1.25);await page.waitForFunction(x=>player.x>x+20,x,{timeout:3000});
   const diagonal=await page.evaluate(()=>({x:player.x,y:player.y,onGround:player.onGround,boosts:player.boosts,state,archery:fireArcheryMode(),joystick:{...joystick}}));assert(diagonal.x>x+20&&diagonal.onGround&&diagonal.boosts===0,name+': diagonal stick still moves right and aims '+JSON.stringify({start:x,...diagonal}));
   await stick('touchMove',-1,-1.25);await page.waitForFunction(()=>player.vx<0,{},{timeout:3000});assert(await page.evaluate(()=>player.vx<0&&player.onGround),name+': left movement works while aiming');
   // A second finger presses the actual left Jump button while finger one keeps
   // the right stick fully raised. Both contacts stay down through the jump.
   assert.equal(await page.evaluate(()=>window.bowTestJumpCalls),0,name+': stick input never calls jump');
   const held=await stick('touchMove',0,-1.35);
   const jump=await page.evaluate(()=>{const r=canvas.getBoundingClientRect();return {id:2,x:r.left+ACTIONS.jump.x*r.width/W,y:r.top+ACTIONS.jump.y*r.height/H};});
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held,jump]});
   await page.waitForTimeout(200);
   const jumped=await page.evaluate(()=>({ground:player.onGround,vy:player.vy,boosts:player.boosts,active:joystick.active,gesture:joystick.jumpGesture,calls:window.bowTestJumpCalls,state,x:player.x,y:player.y,joy:JOY,jump:ACTIONS.jump}));assert(!jumped.ground&&jumped.vy<0&&jumped.boosts===0&&jumped.active&&!jumped.gesture,name+': only the separate Jump button jumps, with no queued aim boosts '+JSON.stringify({jumped,held,jump}));
   await page.waitForFunction(()=>player.onGround,{},{timeout:3000});await page.waitForTimeout(150);assert(await page.evaluate(()=>player.onGround&&player.boosts===0),name+': held aim never auto-jumps after landing');assert.equal(await page.evaluate(()=>window.bowTestJumpCalls),1,name+': only the Jump-button touch called jump');
   const labels=await page.evaluate(()=>{const labels=[],original=ctx.fillText;ctx.fillText=function(text,...args){labels.push(text);return original.call(this,text,...args);};try{drawTouchControls();}finally{ctx.fillText=original;}return labels;});
   assert(labels.includes('↑ AIM')&&!labels.includes('↑ AIM / JUMP'),'the stick correctly advertises aim-only bow controls');
   await stick('touchEnd');
  }
  assert.deepEqual(errors,[]);console.log('PASS bow joystick browser: real sustained/diagonal touch aim without jumps, left/right movement, simultaneous right-stick aim and left-button jump without auto boosts, no landing auto-jump, aim label, Lava King on phone/tablet both orientations plus Meadow and Castle.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
