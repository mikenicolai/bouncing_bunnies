const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/game-upgrades-review.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('[data-scene="lava"]').disabled,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  const clock=await game.evaluate(()=>finalTime);
  await game.waitForFunction(t=>finalTime>t+.25,clock);
  const result=await game.evaluate(()=>{
   state='review';canvas.width=W=960;canvas.height=H=540;cameraX=100;cameraY=0;
   const sample=()=>Array.from(ctx.getImageData(400,180,80,80).data);
   drawPaintedLava(0,2700,100,540,0);const before=sample();
   ctx.clearRect(0,0,W,H);drawPaintedLava(0,2700,100,540,2.5);const after=sample();
   ctx.clearRect(0,0,W,H);cameraX=120;drawPaintedLava(0,2700,100,540,2.5);
   const shifted=Array.from(ctx.getImageData(380,180,80,80).data);
   const edges=[];
   for(const [width,height] of [[960,540],[480,960]])for(const side of ['left','right']){
    canvas.width=W=width;canvas.height=H=height;cameraY=150;
    cameraX=side==='left'?FINAL_TOWER.left-100:FINAL_TOWER.right-width+100;
    ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawFinalTower();ctx.restore();
    const edge=(side==='left'?FINAL_TOWER.left:FINAL_TOWER.right)-cameraX;
    const inside=side==='left'?edge:edge-1,outside=side==='left'?edge-1:edge;
    for(const y of [FINAL_TOWER.lavaY-cameraY+12,H-1]){
     edges.push({width,side,y,inside:ctx.getImageData(inside,y,1,1).data[3],outside:ctx.getImageData(outside,y,1,1).data[3]});
    }
   }
   return{changed:before.filter((v,i)=>Math.abs(v-after[i])>8).length,anchorMeanError:after.reduce((sum,v,i)=>sum+Math.abs(v-shifted[i]),0)/after.length,anchorMaxError:Math.max(...after.map((v,i)=>Math.abs(v-shifted[i]))),anchorChanged:after.filter((v,i)=>v!==shifted[i]).length,edges};
  });
  assert(result.changed>1000,'painted lava itself flows over time');
  assert(result.anchorMaxError<=1,`camera movement preserves the flow position, allowing one color step of canvas interpolation: ${JSON.stringify(result)}`);
  for(const edge of result.edges){assert.equal(edge.inside,255,`lava reaches the wall and viewport bottom: ${JSON.stringify(edge)}`);assert.equal(edge.outside,0,'lava stays inside tower walls');}
  for(const [name,width,height] of [['desktop',1100,950],['phone',390,844]]){
   await page.setViewportSize({width,height});await page.locator('[data-scene="lava"]').click();
   await game.evaluate(()=>render(0));
   fs.writeFileSync(`previews/lava-flow-${name}-v1.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS lava flow: animated texture and preview, fixed world registration, both tower walls meet the pool without gaps or spill, pool fills the bottom on desktop and portrait phone.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
