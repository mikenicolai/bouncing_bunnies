const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8772/previews/elemental-boss-attacks.html');await page.waitForFunction(()=>ready);const game=page.frames().find(f=>f.parentFrame());
  const alpha=await game.evaluate(()=>Object.entries(BOSS_EFFECT_ART).map(([name,a])=>{const c=document.createElement('canvas');c.width=a.width;c.height=a.height;const p=c.getContext('2d');p.drawImage(a.image,0,0);const [x,y,w,h]=a.frames[name==='water'?'bubble':'coil'];return {name,corner:p.getImageData(0,0,1,1).data[3],center:p.getImageData(Math.round(x+w/2),Math.round(y+h/2),1,1).data[3]};}));for(const a of alpha){assert(a.corner<8);assert(a.center<8,a.name+' open center is genuinely transparent');}
  async function capture(name){await game.evaluate(()=>{state='review';render(0);});const data=await game.evaluate(()=>canvas.toDataURL().split(',')[1]);fs.writeFileSync('previews/elemental-'+name+'.png',Buffer.from(data,'base64'));}
  for(const scene of ['bubble','tide','orbs','rock','vine','stones','tree']){
   await page.locator(`[data-scene="${scene}"]`).click();await game.evaluate(()=>{state='review';});
   const result=await game.evaluate(scene=>{
    const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...args){if(Object.values(BOSS_EFFECT_ART).some(a=>a.image===args[0]))calls.push(args[0]===BOSS_EFFECT_ART.water.image?'water':'earth');return draw.apply(this,args);};
    try{
     state='playing';player.invincible=scene==='bubble'?0:99;
     const frames=scene==='bubble'?15:scene==='tide'?42:scene==='orbs'?42:scene==='rock'?60:scene==='vine'?92:scene==='stones'?63:1;
     for(let i=0;i<frames;i++)update(1/60);
     if(scene==='bubble')neptunus.guard=Math.max(.8,neptunus.guard);
     state='review';render(0);
     return {calls,lives,grabbed:!!earthBossVine?.grabbed,lift:EARTH_ARENA.floor-(player.y+player.h),stones:earthBossStones.length};
    }finally{ctx.drawImage=draw;}
   },scene);
   if(scene!=='tree')assert(result.calls.includes(['bubble','tide','orbs'].includes(scene)?'water':'earth'),scene+' uses its painted atlas');
   if(scene==='bubble')assert.equal(result.lives,3,'actual bubble update pushes without a heart loss');
   if(scene==='vine')await capture(scene);
   if(scene==='vine'){assert(result.grabbed);assert(result.lift>25);await game.evaluate(()=>{state='playing';jump();state='review';});assert(await game.evaluate(()=>earthBossVine.released),'the lifted bunny can jump free');}
   if(scene==='stones')assert(result.stones>0);
   if(scene!=='vine')await capture(scene);
  }
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.locator('[data-scene="vine"]').click();await game.evaluate(()=>{state='review';player.invincible=99;state='playing';for(let i=0;i<92;i++)update(1/60);state='review';render(0);});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture('vine-'+viewport.width);
  }
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>Object.values(BOSS_EFFECT_ART).every(a=>a.image.naturalWidth));await local.evaluate(()=>{beginDeveloperSession();level='earth';start();soundOn=false;earthBoss.active=true;earthBoss.stage='giant';earthBoss.treeGrowth=1;earthBoss.turn=4;earthBoss.cooldown=0;player.x=7200;player.y=EARTH_ARENA.floor-58;updateEarthBoss(0);state='review';render(0);});
  assert.deepEqual(errors,[]);console.log('PASS elemental boss browser: native transparent/open-center atlases, actual painted water/stone/vine draws, harmless bubble push, lifted grab and real jump escape, rock row/tree preview, phone portrait/landscape and direct-file assets.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
