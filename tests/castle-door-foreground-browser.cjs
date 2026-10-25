const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/castle-tower-review.html#door',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('[data-scene="door"]').disabled,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  for(const lift of [0,.5,1])for(const center of [8145,8435])for(const facing of [-1,1]){
   const changed=await game.evaluate(({lift,center,facing})=>{
    state='review';finalTowerDoorLift=lift;fireArrow.aiming=false;player.invincible=0;player.facing=facing;
    player.x=center-player.w/2;player.y=FINAL_FLOOR-player.h;cameraX=8020;cameraY=0;
    const original=drawBunny;drawBunny=()=>{};render(0);const a=ctx.getImageData(center-cameraX-6,420,12,45).data;
    drawBunny=original;render(0);const b=ctx.getImageData(center-cameraX-6,420,12,45).data;
    return a.some((value,i)=>value!==b[i]);
   },{lift,center,facing});
   assert.equal(changed,center<8290,`${center<8290?'Benny covers the left jamb':'right jamb covers Benny'} at lift ${lift}, facing ${facing}`);
  }
  const visible=await game.evaluate(()=>{finalTowerDoorLift=1;player.x=FINAL_END_X-player.w/2;player.facing=1;const draw=drawBunny;drawBunny=()=>{};render(0);const a=ctx.getImageData(FINAL_END_X-cameraX-6,420,12,45).data;drawBunny=draw;render(0);const b=ctx.getImageData(FINAL_END_X-cameraX-6,420,12,45).data;return a.some((v,i)=>v!==b[i]);});
  assert(visible,'Benny remains visible inside the open passage');
  await page.locator('[data-scene="door"]').click();
  const colors=await game.evaluate(()=>{
   const original=drawBunny;drawBunny=()=>{};render(0);drawBunny=original;
   const p=ctx.getImageData(FINAL_END_X-cameraX-60,280,120,110).data,colors=new Set();
   for(let i=0;i<p.length;i+=4)colors.add(`${p[i]},${p[i+1]},${p[i+2]}`);return colors.size;
  });assert(colors>500,'open arch contains painted tower masonry rather than flat black');
  for(const [width,height,label] of [[1100,850,'desktop'],[390,844,'phone']]){
   await page.setViewportSize({width,height});await page.locator('[data-scene="door"]').click();
   await game.evaluate(()=>render(0));
   fs.writeFileSync(`previews/castle-door-tower-${label}-v2.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  for(const direction of [-1,1]){
   const crossed=await game.evaluate(direction=>{
    state='playing';clearInputs();finalTowerDoorLift=1;player.x=direction>0?8100:8560;player.y=FINAL_FLOOR-player.h;player.vx=player.vy=0;player.onGround=true;
    keys.add(direction>0?'ArrowRight':'ArrowLeft');for(let i=0;i<120;i++)update(1/60);clearInputs();state='review';
    return lives===3&&(direction>0?player.x>8510:player.x+player.w<8173);
   },direction);assert(crossed,'doorway remains passable in both directions');
  }
  assert.deepEqual(errors,[]);console.log('PASS Castle doorway: Benny appears in front of the left jamb and behind the right jamb in both facings at closed/half/open positions; visible open passage, textured tower view, desktop and phone renders without errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
