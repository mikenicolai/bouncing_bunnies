const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>lavaKingEffectsSheet.naturalWidth&&lavaKingSheet.naturalWidth&&finalKnightSheet.naturalWidth);
  const king=()=>page.evaluate(()=>{
   beginDeveloperSession();level='fire';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();fireArrow.owned=true;fireArrow.ammo.fill('normal');player.x=10600;player.y=-558;player.onGround=true;player.invincible=99;player.facing=1;beginLavaKing();fireArrow.angle=0;lavaKingPhase('spin');fitTouchControls();
  });
  const art=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=lavaKingEffectsSheet.naturalWidth;c.height=lavaKingEffectsSheet.naturalHeight;const p=c.getContext('2d');p.drawImage(lavaKingEffectsSheet,0,0);const a=p.getImageData(0,0,c.width,c.height).data;
   let transparent=0;for(let i=3;i<a.length;i+=4)if(a[i]===0)transparent++;
   return {width:c.width,height:c.height,transparent,heads:LAVA_FIREBALL_HEADS.map(([x,y],i)=>p.getImageData(i*384+x,y,1,1).data[3])};
  });assert.equal(art.width,1536);assert.equal(art.height,1024);assert(art.transparent>1000000);assert(art.heads.every(a=>a>230),'bright flame heads align with their collision circles');
  await king();await page.locator('#game').focus();await page.keyboard.press('x');await page.waitForFunction(()=>lavaKing.hp===9);assert(await page.evaluate(()=>lavaKing.phase==='recover'&&lavaKing.dizzy>0),'actual keyboard arrow interrupts the spinning king');
  await king();await page.evaluate(()=>{state='review';player.invincible=0;lavaKing.age=.34;cameraX=lavaKing.x-W*.58;cameraY=fireCameraTargetY();render(0);});await page.locator('#game').screenshot({path:'previews/lava-king-spin-v1.png'});
  await page.evaluate(()=>{lavaKingPhase('cast');lavaKingFireballs=[{x:lavaKing.x-150,y:-555,r:13,vx:-330,vy:150,age:.15,alive:true},{x:lavaKing.x+180,y:-600,r:13,vx:330,vy:-120,age:.25,alive:true}];render(0);});await page.locator('#game').screenshot({path:'previews/lava-king-comic-fireballs-v1.png'});
  const cdp=await page.context().newCDPSession(page);
  async function knight(direction){
   await page.evaluate(direction=>{
    beginDeveloperSession();level='final';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();enterFinalKnightRoom();finalKnight.defenseChance=0;finalKnight.x=600;finalKnight.phase='hurt';finalKnight.dizzy=99;finalKnight.cooldown=999;finalRoomFade=0;player.x=600+(direction>0?-player.w-10:finalKnight.w+10);player.invincible=99;fitTouchControls();
   },direction);await page.waitForTimeout(150);await page.locator('#game').focus();
  }
  async function point(id,control,direction=0){return page.evaluate(({id,control,direction})=>{
   const r=canvas.getBoundingClientRect(),x=control==='stick'?JOY.x+direction*(JOY.radius-12):ACTIONS[control].x,y=control==='stick'?JOY.y:ACTIONS[control].y;
   return {id,x:r.left+x*r.width/W,y:r.top+y*r.height/H};
  },{id,control,direction});}
  const contacts=async(type,points=[])=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  for(const [name,width,height] of [['desktop',1100,800],['phone',390,844],['phone landscape',844,390],['tablet',768,1024]]){
   await page.setViewportSize({width,height});
   for(const direction of [-1,1]){
    await knight(direction);const key=direction>0?'ArrowRight':'ArrowLeft';let held;
    if(name==='desktop')await page.keyboard.down(key);else{held=await point(1,'stick',direction);await contacts('touchStart',[held]);}
    await page.waitForFunction(d=>player.x===(d>0?finalKnight.x-player.w:finalKnight.x+finalKnight.w),direction,{timeout:2500});
    await page.waitForTimeout(250);assert(await page.evaluate(d=>player.x===(d>0?finalKnight.x-player.w:finalKnight.x+finalKnight.w)&&finalKnight.dizzy>0,direction),name+': hurt knight blocks walking');
    if(name==='phone'&&direction===1){await page.evaluate(()=>{player.invincible=0;render(0);});await page.locator('#game').screenshot({path:'previews/castle-knight-solid-hurt-phone-v1.png'});}
    for(let tap=0;tap<3;tap++){
     if(name==='desktop')await page.keyboard.press('Space');
     else{
      if(tap){await contacts('touchEnd');await contacts('touchStart',[held]);}
      await contacts('touchStart',[held,await point(2,'jump')]);
     }
     await page.waitForTimeout(65);
    }
    await page.waitForFunction(d=>d>0?player.x>finalKnight.x+finalKnight.w:player.x+player.w<finalKnight.x,direction,{timeout:3000});
    assert(await page.evaluate(()=>lives===3),name+': jumping over the hurt knight is harmless');
    if(name==='desktop')await page.keyboard.up(key);else await contacts('touchEnd');
   }
  }
  // A live two-finger trident button press hits, then stops at the solid recoil.
  await page.setViewportSize({width:390,height:844});await knight(1);await page.evaluate(()=>{player.x=430;finalKnight.dizzy=0;finalKnight.phase='guard';selectFinalWeapon('trident');});
  const held=await point(1,'stick',1);await contacts('touchStart',[held]);await contacts('touchStart',[held,await point(2,'hit')]);await page.waitForFunction(()=>finalKnight.hp===9&&waterTrident.dash===0);
  assert(await page.evaluate(()=>player.x+player.w<=finalKnight.x&&finalKnight.dizzy>0),'touch dash damages without crossing the stunned knight');await contacts('touchEnd');
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>lavaKingEffectsSheet.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='fire';start();soundOn=false;fireArrow.owned=true;beginLavaKing();lavaKingPhase('spin');lavaKing.age=.3;state='review';cameraX=10500;cameraY=fireCameraTargetY();render(0);});
  assert.deepEqual(errors,[]);console.log('PASS native comic effects/anchors, real keyboard spin interruption, painted spin/fireballs, keyboard and touch hurt-knight blocking/jumping both ways on desktop/phone/landscape/tablet, simultaneous trident-button dash stop, direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
