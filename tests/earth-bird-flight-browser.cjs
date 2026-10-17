const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');await page.waitForFunction(()=>skyBirdSheet.naturalWidth&&EARTH_ANIMAL_ART.bird.image.naturalWidth&&earthTreeSheet.naturalWidth&&characterSprites.length);
  const cdp=await page.context().newCDPSession(page);
  async function setup(side){
   await page.evaluate(side=>{
    beginDeveloperSession();level='earth';start();soundOn=false;fallbackFullscreen=true;syncFullscreen();
    player.x=side<0?260:610;player.y=earthGroundAt(460)-player.h;player.onGround=true;player.vx=player.vy=0;
    cameraX=0;cameraY=earthGroundAt(460)-playfieldHeight()*.8;fitTouchControls();
   },side);await page.waitForTimeout(150);await page.locator('#game').focus();assert(await page.evaluate(()=>earthBirds[0].mode==='perched'));
  }
  for(const [name,width,height,touch] of [['desktop',1100,800,false],['phone',390,844,true],['tablet',768,1024,true]]){
   await page.setViewportSize({width,height});
   for(const side of [-1,1]){
    await setup(side);const direction=-side,key=direction>0?'ArrowRight':'ArrowLeft';
    if(touch){
     const point=await page.evaluate(direction=>{const r=canvas.getBoundingClientRect();return {id:1,x:r.left+(JOY.x+direction*(JOY.radius-12))*r.width/W,y:r.top+JOY.y*r.height/H};},direction);
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    }else await page.keyboard.down(key);
    await page.waitForFunction(()=>earthBirds[0].mode!=='perched',{},{timeout:3000});
    assert(await page.evaluate(direction=>earthBirds[0].vx*direction>0&&earthBirds[0].y<earthGroundAt(460),direction),name+': real approach triggers upward flight away from Benny');
    if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.keyboard.up(key);
    await page.waitForFunction(()=>earthBirds[0].mode==='flying'&&earthBirds[0].age>.45);
    const before=await page.evaluate(()=>({x:earthBirds[0].x,y:earthBirds[0].y,age:earthBirds[0].age}));await page.waitForTimeout(200);
    assert(await page.evaluate(b=>earthBirds[0].age>b.age&&earthBirds[0].y<b.y,before),name+': live animation keeps flying');assert(await page.evaluate(()=>lives===3&&earthBirds[1].mode==='perched'),'flight is harmless and distant birds stay perched');
    if(side===-1){await page.evaluate(()=>{state='review';render(0);});await page.locator('#game').screenshot({path:`previews/earth-bird-flight-${name}-v1.png`});await page.evaluate(()=>{state='playing';});}
   }
  }
  await page.evaluate(()=>{state='review';});const frozen=await page.evaluate(()=>JSON.stringify(earthBirds));await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>JSON.stringify(earthBirds)),frozen,'pause freezes both position and flap time');
  const wings=await page.evaluate(()=>{
   const bird=earthBirds[0],oldAge=bird.age,old=ctx.drawImage,frames=[];
   ctx.drawImage=function(source,...args){if(source instanceof HTMLCanvasElement)frames.push(source.toDataURL());return old.call(this,source,...args);};
   try{bird.age=.25;drawEarthGroundBird(bird,0);bird.age=.38;drawEarthGroundBird(bird,0);}finally{ctx.drawImage=old;bird.age=oldAge;}
   return {count:frames.length,different:frames[0]!==frames[1]};
  });assert.equal(wings.count,2);assert(wings.different,'the painted wings change pose, rather than sliding a still bird');
  await page.setViewportSize({width:1100,height:800});await page.goto('http://127.0.0.1:8772/previews/wildwood-animals.html?scene=birds');await page.waitForFunction(()=>!document.querySelector('#birds').disabled);
  const game=page.frames().find(f=>f.parentFrame());await game.waitForFunction(()=>earthBirds[0].mode==='flying');assert(await game.evaluate(()=>developerRun));await page.locator('#birds').click();await game.waitForFunction(()=>earthBirds[0].mode==='flying'&&earthBirds[0].age<1);assert(await game.evaluate(()=>lives===3));
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>skyBirdSheet.naturalWidth&&EARTH_ANIMAL_ART.bird.image.naturalWidth);await local.evaluate(()=>{beginDeveloperSession();level='earth';start();soundOn=false;player.x=370;player.y=earthGroundAt(460)-player.h;updateEarthBirds(.3);state='review';render(0);});assert(await local.evaluate(()=>earthBirds[0].mode==='flying'));
  assert.deepEqual(errors,[]);console.log('PASS painted foreground bird takeoff and flapping with real keyboard/phone/tablet approaches from both sides, harmless independent wildlife, pause, replayable live demo and direct-file rendering.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
