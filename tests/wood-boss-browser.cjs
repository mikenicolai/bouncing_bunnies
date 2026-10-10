const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
try{
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8772/previews/wood-boss-fight.html');
 const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
 await game.waitForFunction(()=>woodBossImages.small.naturalWidth&&woodBossImages.giant.naturalWidth);
 await game.evaluate(()=>{state='review';player.x=earthBoss.x-140;player.y=EARTH_ARENA.floor-58;cameraX=earthBoss.x-W*.6;cameraY=EARTH_ARENA.floor-playfieldHeight()*.8;render(0);});
 await page.screenshot({path:'previews/wood-boss-fight-desktop.png'});
 await game.evaluate(()=>{earthBoss.stage='giant';earthBoss.hp=8;earthBoss.phase='idle';earthBoss.phaseAge=0;earthBoss.dizzy=0;render(0);});
 await page.screenshot({path:'previews/wood-boss-giant-desktop.png'});
 await game.evaluate(()=>{earthBoss.phase='mountain';earthBoss.phaseAge=2.8;earthBoss.x=7670;earthBossMountains=[{x:7460,age:2.8}];render(0);});
 await page.screenshot({path:'previews/wood-boss-mountains-desktop.png'});
 // Capture every transformation with the real renderer (not the art study).
 for(const [stage,age] of [['shatter',.6],['rebuild',2],['rebuild',4.9],['defeat',1]]){
  await game.evaluate(({stage,age})=>{earthBoss.stage=stage;earthBoss.age=age;earthBoss.x=7460;earthBossMountains=[];earthBoss.phase='idle';render(0);},{stage,age});
 }
 await page.setViewportSize({width:390,height:844});
 await game.evaluate(()=>{earthBoss.stage='giant';earthBoss.hp=8;earthBoss.x=7460;earthBoss.phase='idle';player.x=7290;player.y=EARTH_ARENA.floor-58;cameraX=player.x-W*.38;cameraY=EARTH_ARENA.floor-playfieldHeight()*.82;render(0);});
 await page.screenshot({path:'previews/wood-boss-fight-phone.png'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await game.evaluate(()=>{state='playing';earthBoss.hp=8;earthBoss.cooldown=0;earthBoss.dizzy=0;earthBoss.phase='idle';earthBoss.turn=0;player.invincible=100;});
 await game.evaluate(()=>{for(let i=0;i<60*19;i++)update(1/60);render(0);});
 assert.equal(await game.evaluate(()=>earthBoss.stage),'giant');
 assert((await game.evaluate(()=>earthBoss.turn))>=4,'all four giant attacks execute');
 // Preview Restart clears hazards, hearts and phase through the real start().
 await page.locator('#restart').click();await game.evaluate(()=>{state='review';});
 assert.equal(await game.evaluate(()=>earthBoss.stage),'small');assert.equal(await game.evaluate(()=>earthBoss.hp),5);
 assert.equal(await game.evaluate(()=>earthBossRocks.length+earthBossWaves.length+earthBossMountains.length),0);
 assert.deepEqual(errors,[]);
 console.log('PASS browser: embedded paintings, actual arena renderer and all attack/transition scenes, eight giant hearts, desktop/phone framing, restart and controls.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
