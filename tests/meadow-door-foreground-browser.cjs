const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/meadow-lessons.html#door');
  await page.waitForFunction(()=>!document.querySelector('[data-scene="door"]').disabled);
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  for(const lift of [0,.5,1])for(const side of [-1,1])for(const facing of [-1,1]){
   const pixels=await game.evaluate(({lift,side,facing})=>{
    state='review';meadowLesson.lift=lift;fireArrow.aiming=false;player.invincible=0;player.facing=facing;
    const worldX=side<0?MEADOW_GATE.x-10:MEADOW_GATE.x+100;
    player.x=worldX-player.w/2;player.y=412;cameraX=5420;cameraY=0;
    const x=Math.round(worldX-cameraX),original=drawBunny;
    drawBunny=()=>{};render(0);const background=ctx.getImageData(x-8,420,16,45).data;
    drawBunny=original;render(0);const foreground=ctx.getImageData(x-8,420,16,45).data;
    let different=0;for(let i=0;i<background.length;i++)if(background[i]!==foreground[i])different++;
    return different;
   },{lift,side,facing});
   assert.equal(pixels,0,`the ${side<0?'left':'right'} post covers Benny at lift ${lift}, facing ${facing}`);
  }
  await page.locator('[data-scene="door"]').click();
  await game.locator('#game').screenshot({path:'previews/meadow-door-foreground-v1.png'});
  // The open doorway remains passable in both directions.
  for(const direction of [-1,1]){
   const crossed=await game.evaluate(direction=>{
    state='playing';clearInputs();player.x=direction===1?5600:5800;player.y=412;player.vx=0;player.vy=0;player.onGround=true;
    keys.add(direction===1?'ArrowRight':'ArrowLeft');for(let i=0;i<120;i++)update(1/60);clearInputs();state='review';return direction===1?player.x>5770:player.x+player.w<5640;
   },direction);assert(crossed,'open doorway can be crossed in either direction');
  }
  assert.deepEqual(errors,[]);console.log('PASS Meadow doorway: both timber posts cover Benny in both facings with closed, half-raised and open doors; open doorway remains passable both ways.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
