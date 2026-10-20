const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/previews/castle-finale-review-v1.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.querySelector('#proportions').disabled,{},{timeout:90000});
  const game=page.frames().find(f=>/index.html/.test(f.url()));
  const cast=await game.evaluate(()=>{
   const old={width:canvas.width,height:canvas.height};canvas.width=1536;canvas.height=1024;
   function bounds(draw){
    ctx.clearRect(0,0,1536,1024);draw();const d=ctx.getImageData(0,0,1536,1024).data;
    let left=1536,right=0,top=1024,bottom=0;
    for(let y=0;y<1024;y++)for(let x=0;x<1536;x++)if(d[(y*1536+x)*4+3]>50){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    return{left,right,top,bottom,height:bottom-top+1};
   }
   const actors=FINAL_COURT_ACTORS.map(actor=>{
    const box=bounds(()=>drawFinalCourtActor({...actor,x:768,floor:900},7));
    return{kind:actor.kind,height:box.height,left:actor.x+box.left-768,right:actor.x+box.right-768,top:actor.floor+box.top-900,bottom:actor.floor+box.bottom-900};
   });
   const hero=bounds(drawFinalCourtHero);canvas.width=old.width;canvas.height=old.height;render(0);return{actors,hero};
  });
  assert.equal(cast.actors.length,10);
  const height=kind=>cast.actors.find(a=>a.kind===kind).height;
  assert(height('lavaKing')>cast.hero.height*2,'Lava King towers over Benny');
  assert(height('neptunus')>cast.hero.height*3,'Neptunus retains his imposing size and full trident');
  assert(height('giant')>height('knight')*2,'Earth giant keeps his gameplay proportions');
  assert(height('tempest')>height('goblin')*2,'Tempest is larger than the ordinary enemies');
  for(const actor of cast.actors){assert(actor.left>=0&&actor.right<1536,`${actor.kind} fits within the room`);assert(actor.top>=0&&actor.bottom<925,`${actor.kind} stands above Benny's foreground position`);}
  for(const [name,width,height] of [['desktop',1100,900],['phone',390,844],['tablet',820,1180]]){
   await page.setViewportSize({width,height});await game.evaluate(()=>{fallbackFullscreen=true;syncFullscreen();finalRevealTime=7;render(0);});
   fs.writeFileSync(`previews/castle-throne-proportions-${name}-v2.png`,Buffer.from(await game.evaluate(()=>canvas.toDataURL().split(',')[1]),'base64'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  const before=await game.evaluate(()=>finalRevealTime);await page.waitForTimeout(250);assert(await game.evaluate(()=>finalRevealTime)>before,'preview keeps animating');
  assert.equal(await game.evaluate(()=>state),'review','comparison stays visible without the ending card');
  assert.deepEqual(errors,[]);console.log('PASS throne-room proportions: all ten actors visible and unclipped, bosses larger than minions/Benny, desktop/phone/tablet rendering and persistent animated preview.');console.log(JSON.stringify(cast));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
