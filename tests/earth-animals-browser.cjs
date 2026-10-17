const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const errors=[],page=await browser.newPage({viewport:{width:1100,height:750}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html');
  await page.waitForFunction(()=>Object.values(EARTH_ANIMAL_ART).every(a=>a.image.naturalWidth)&&earthTreeSheet.naturalWidth&&earthGroundSheet.naturalWidth&&PAINTED_BUNNY.uprightWalk.quiver.naturalWidth);
  const alpha=await page.evaluate(()=>Object.entries(EARTH_ANIMAL_ART).map(([name,a])=>{const c=document.createElement('canvas');c.width=a.image.naturalWidth;c.height=a.image.naturalHeight;const p=c.getContext('2d');p.drawImage(a.image,0,0);return{name,corner:p.getImageData(0,0,1,1).data[3]};}));for(const a of alpha)assert(a.corner<8,a.name+' transparent background');
  async function reset(){await page.evaluate(()=>{beginDeveloperSession();level='earth';start();soundOn=false;player.x=earthTurtle.x+82;player.y=earthGroundAt(earthTurtle.x)-player.h;player.onGround=true;player.vx=player.vy=0;cameraX=0;cameraY=150;});}
  async function capture(path){fs.writeFileSync(path,Buffer.from(await page.evaluate(()=>{const old=state;state='review';render(0);const png=canvas.toDataURL().split(',')[1];state=old;return png;}),'base64'));}
  await reset();await page.evaluate(()=>state='review');await capture('previews/wildwood-animals-painted-v1.png');
  // Keyboard jump from the floor lands on the moving shell without O.
  await reset();await page.locator('#game').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>player.ridingTurtle,{},{timeout:2500});
  await page.evaluate(()=>{for(let i=0;i<60*12;i++)update(1/60);state='review';});
  assert(await page.evaluate(()=>player.ridingTurtle&&lives===3&&earthTurtle.facing===-1&&Math.abs(player.y+player.h-earthTurtlePlatform().y)<1));
  await capture('previews/wildwood-turtle-ride-v1.png');
  await page.evaluate(()=>state='playing');await page.keyboard.press('Space');assert(await page.evaluate(()=>!player.ridingTurtle&&player.vy<0));
  // Portrait and landscape use the ordinary on-canvas touch Jump action.
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(150);await page.waitForFunction(()=>canvas.getBoundingClientRect().width<=innerWidth);await reset();await page.evaluate(async()=>{render(0);window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));fitTouchControls();});
   const point=await page.evaluate(()=>{const r=canvas.getBoundingClientRect(),b=ACTIONS.jump;return{x:r.left+b.x*r.width/W,y:r.top+b.y*r.height/H};});
   await page.mouse.click(point.x,point.y);try{await page.waitForFunction(()=>player.ridingTurtle,{},{timeout:2500});}catch(e){console.error(viewport,point,await page.evaluate(()=>({W,H,touchDockHeight,jump:ACTIONS.jump,state,x:player.x,y:player.y,vy:player.vy,t:earthTurtle})));throw e;}
   const start=await page.evaluate(()=>({x:player.x,t:earthTurtle.x}));await page.waitForTimeout(700);const end=await page.evaluate(()=>({x:player.x,t:earthTurtle.x}));assert(Math.abs((end.x-start.x)-(end.t-start.t))<1,'touch rider travels with shell');
   await page.evaluate(()=>state='review');await capture(`previews/wildwood-turtle-${viewport.width===390?'phone':'landscape'}-v1.png`);
   await page.evaluate(()=>state='playing');await page.mouse.click(point.x,point.y);assert(await page.evaluate(()=>!player.ridingTurtle&&player.vy<0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  // Practice fixture keeps normal wallet and achievements isolated.
  await page.setViewportSize({width:1100,height:750});await page.goto('http://127.0.0.1:8772/previews/wildwood-animals.html');
  await page.waitForFunction(()=>!document.querySelector('#ride').disabled);
  const frame=page.frames().find(f=>f.parentFrame());await frame.waitForFunction(()=>Object.values(EARTH_ANIMAL_ART).every(a=>a.image.naturalWidth));
  assert(await frame.evaluate(()=>developerRun));await page.locator('#ride').click();assert(await frame.evaluate(()=>player.ridingTurtle));await page.locator('#clearing').click();assert(await frame.evaluate(()=>!player.ridingTurtle));
  // Direct-file play renders sprites without reading their pixels.
  const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');await local.waitForFunction(()=>Object.values(EARTH_ANIMAL_ART).every(a=>a.image.naturalWidth));await local.evaluate(()=>{beginDeveloperSession();level='earth';start();player.x=earthTurtle.x;player.y=earthGroundAt(earthTurtle.x)-player.h;toggleEarthTurtle();update(1/60);render(0);});assert(await local.evaluate(()=>player.ridingTurtle&&lives===3));
  assert.deepEqual(errors,[]);console.log('PASS painted wildlife browser: transparent sprites, keyboard/touch shell landings and jump-offs, left/right ride, desktop/portrait/landscape, isolated practice page, direct-file rendering and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
