const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 try{
  const errors=[];
  for(const url of ['http://127.0.0.1:8772/index.html','file://'+process.cwd()+'/index.html']){
   const page=await browser.newPage({viewport:{width:1100,height:750}});page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
   await page.evaluate(()=>{beginDeveloperSession();level='fire';start();soundOn=false;fireZombies=[];fireArrow.owned=true;beginFireMaze();player.mazeC=24;player.mazeR=1;player.x=mazeCenter(24,1).x-21;player.y=mazeCenter(24,1).y-29;});
   await page.locator('#game').focus();await page.keyboard.press('Space');assert(await page.evaluate(()=>fireMode==='maze'&&player.vy===0));
   await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>fireMode==='secondVolcano'&&player.x>6860,{},{timeout:2500});await page.keyboard.up('ArrowRight');
   await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>fireMode==='maze'&&player.mazeC<=23,{},{timeout:2500});await page.keyboard.up('ArrowLeft');assert(await page.evaluate(()=>fireUnderground&&fireArrow.owned&&lives===3));
   for(const viewport of [{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>{clearInputs();fireMode='secondVolcano';fireUnderground=false;player.x=6880;beginSecondVolcano();cameraX=6500;cameraY=fireCameraTargetY();});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>{fitTouchControls();window.scrollTo(0,document.documentElement.scrollHeight);});
    const points=await page.evaluate(()=>{const r=canvas.getBoundingClientRect(),point=x=>({x:r.left+x*r.width/W,y:r.top+JOY.y*r.height/H});return{center:point(JOY.x),left:point(JOY.x-JOY.radius*.85)};});
    await page.mouse.move(points.center.x,points.center.y);await page.mouse.down();await page.mouse.move(points.left.x,points.left.y);
    try{await page.waitForFunction(()=>fireMode==='maze'&&player.mazeC<=23,{},{timeout:3000});}finally{await page.mouse.up();}
    assert(await page.evaluate(()=>fireUnderground&&fireArrow.owned&&!joystick.active&&document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>{clearInputs();player.x=6850;beginSecondVolcano();player.onGround=false;player.y=1920;player.vy=-300;keys.add('ArrowLeft');for(let i=0;i<18;i++)update(1/60);keys.clear();render(0);});
    assert(await page.evaluate(()=>fireMode==='secondVolcano'&&player.x>=6800&&lives===3),'an airborne bunny stays outside the closed stone roof');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);console.log('PASS maze return browser: actual keyboard exit/backtracking, no indoor jump, touch re-entry in both phone orientations, blocked airborne stone entry, HTTP/direct-file play and no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
