const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[];
  for(const [url,viewport] of [
   ['http://127.0.0.1:8772/index.html',{width:1100,height:900}],
   ['http://127.0.0.1:8772/index.html',{width:390,height:844}],
   ['file://'+process.cwd()+'/index.html',{width:844,height:390}]
  ]){
   const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   await page.waitForFunction(()=>neptunusSheet.naturalWidth&&waterRuinsSheet.naturalWidth&&waterTridentSheet.naturalWidth&&aquaSuitPaintReady());
   await page.evaluate(()=>{
    beginDeveloperSession();level='water';start();soundOn=false;waterSharks=[];waterPirates=[];waterGate.phase='open';waterGate.lift=1;waterTrident.owned=true;waterAquaSuit=true;player.inWater=true;player.x=WATER_ARENA.left+130;player.y=1200;updateNeptunus(0);
    // Mimic the old, already-started fight whose suit checkpoint was outside.
    checkpoint={x:12199,y:1351,water:true,suit:true};neptunus.hp=5;waterTrident.cyber=true;coinWallet=40;resetRunWallet();collectCoin(coins[0]);
    player.x=neptunus.x-150;player.y=neptunus.y+90;player.invincible=0;lives=1;
    neptunusShots=[{x:player.x+21,y:player.y+29,r:23,vx:0,vy:0,kind:'orb',life:3}];updateNeptunus(0);
   });assert.equal(await page.evaluate(()=>state),'lost');
   await page.locator('#reviveCoinButton').click();
   const paid=await page.evaluate(()=>{state='review';return {state,lives,coinWallet,hp:neptunus.hp,score,inside:player.x>WATER_ARENA.left+80,gear:waterTrident.cyber&&waterTrident.owned&&waterAquaSuit,shots:neptunusShots.length,x:player.x};});
   assert(paid.inside&&paid.gear);assert.equal(paid.coinWallet,21);assert.equal(paid.lives,1);assert.equal(paid.hp,5);assert.equal(paid.score,1);assert.equal(paid.shots,0);
   await page.evaluate(()=>{state='playing';});await page.keyboard.down('ArrowRight');await page.waitForTimeout(850);await page.keyboard.up('ArrowRight');
   assert(await page.evaluate(x=>player.x>x+90,paid.x),'the real movement controls work inside the arena after paying');
   await page.keyboard.press('x');assert(await page.evaluate(()=>!!waterTrident.shot),'the reusable trident still fires');
   await page.evaluate(()=>{state='review';stopWaterDash();waterTrident.shot=null;neptunus.guard=0;neptunus.dizzy=0;hitNeptunus();neptunus.dizzy=0;neptunus.mode='volleyWarn';neptunus.targetX=player.x+21;neptunus.targetY=player.y+29;player.invincible=0;player.x=neptunus.x-280;player.y=neptunus.y+90;cameraX=neptunus.x-waterViewSize().width*.65;cameraY=neptunus.y+100-waterViewSize().height*.45;render(0);});
   await page.locator('canvas').first().screenshot({path:`previews/neptunus-water-guard-${viewport.width}.png`});
   if(url.startsWith('http')){
    // Finish the retained encounter with genuine throws and real cooldown/guard
    // updates, then swim through the unlocked exit. No repeated direct hit calls.
    const victory=await page.evaluate(()=>{
     player.invincible=999;keys.clear();joystick.active=false;state='playing';
     for(let hp=neptunus.hp;hp>0;hp--){
      for(let f=0;f<120;f++){waterTime+=1/60;updateNeptunus(1/60);updateWaterTrident(1/60,[]);}
      player.x=neptunus.x-160;player.y=neptunus.y+neptunus.h/2-29;player.vx=player.vy=0;player.facing=1;waterTrident.mode='throw';
      if(!fireWaterTrident())return {stage:'fire',hp,shot:waterTrident.shot,cooldown:waterTrident.cooldown,inWater:player.inWater,mode:waterTrident.mode};
      for(let f=0;f<35;f++){waterTime+=1/60;updateWaterTrident(1/60,[]);updateNeptunus(1/60);}
      if(neptunus.hp!==hp-1)return {stage:'hit',expected:hp-1,boss:neptunus,shot:waterTrident.shot,player:{x:player.x,y:player.y}};
     }
     for(let f=0;f<120;f++)updateNeptunus(1/60);
     player.x=WATER_ARENA.exit-45;player.y=1260;player.vx=player.vy=0;keys.add('ArrowRight');
     for(let f=0;f<100&&state==='playing';f++)update(1/60);
     return (developerRun?state==='developer':waterFinished)&&neptunus.hp===0&&coinWallet>=21?true:{stage:'exit',state,x:player.x,y:player.y,waterFinished,hp:neptunus.hp,death:neptunus.deathAge,wallet:coinWallet};
    });assert.equal(victory,true,'the paid continuation can defeat Neptunus and complete Water: '+JSON.stringify(victory));
   }
   await page.close();
  }
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8772/previews/water-ruins-review.html');const game=page.frames().find(f=>f.parentFrame());await game.waitForFunction(()=>neptunusSheet.naturalWidth);await page.locator('[data-scene="guard"]').click();await game.evaluate(()=>{state='review';});assert(await game.evaluate(()=>neptunus.guard>0));
  assert.deepEqual(errors,[]);console.log('PASS Neptunus browser: actual death/revive purchase, fixed legacy arena checkpoint, one-heart retained progress, movement and trident controls, genuine projectile defeat and Water exit, shield art, desktop/phone/landscape and direct-file play.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
