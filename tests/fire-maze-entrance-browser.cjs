const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[];
  for(const url of ['http://127.0.0.1:8772/index.html','file://'+process.cwd()+'/index.html']){
   const page=await browser.newPage({viewport:{width:1100,height:750}});page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   async function reset(){await page.evaluate(()=>{beginDeveloperSession();level='fire';start();soundOn=false;fireZombies=[];beginFireMaze();player.mazeR=0;player.y=mazeCenter(1,0).y-player.h/2;cameraX=4600;cameraY=1700;render(0);});}
   await reset();await page.locator('#game').focus();await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>fireMode==='landing',{},{timeout:2500});await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');
   assert(await page.evaluate(()=>fireMode==='landing'&&player.y+player.h===1900&&lives===3),'Up climbs out and stays on the crater floor');
   await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>fireMode==='maze',{},{timeout:2500});await page.keyboard.up('ArrowDown');assert(await page.evaluate(()=>player.mazeC===1&&player.mazeR===1));
   for(const viewport of [{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await reset();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>{fitTouchControls();window.scrollTo(0,document.documentElement.scrollHeight);});
    async function pull(down){
     const points=await page.evaluate(down=>{const r=canvas.getBoundingClientRect(),p=y=>({x:r.left+JOY.x*r.width/W,y:r.top+y*r.height/H});return{center:p(JOY.y),end:p(JOY.y+(down?1:-1)*JOY.radius*.85)};},down);
     await page.mouse.move(points.center.x,points.center.y);await page.mouse.down();await page.mouse.move(points.end.x,points.end.y);
     try{await page.waitForFunction(down=>fireMode===(down?'maze':'landing'),down,{timeout:3000});}finally{await page.mouse.up();}
    }
    await pull(false);await page.waitForTimeout(200);assert(await page.evaluate(()=>fireMode==='landing'&&!joystick.active));await pull(true);
    assert(await page.evaluate(()=>fireMode==='maze'&&player.mazeC===1&&lives===3&&!joystick.active&&document.documentElement.scrollWidth<=innerWidth));
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS entrance browser: screenshot-position ladder ascent, deliberate keyboard descent, touch Up/Down in both phone orientations, no automatic re-entry, HTTP/direct-file rendering and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
