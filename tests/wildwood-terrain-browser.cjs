const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
try{
const page=await browser.newPage({viewport:{width:1200,height:1040}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8772/previews/wildwood-terrain-review.html');
const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
await game.waitForFunction(()=>earthGroundSheet.naturalWidth&&earthTreeSheet.naturalWidth&&earthMushroomSheet.naturalWidth&&earthCliffSheet.naturalWidth);
async function capture(file){const png=await game.evaluate(()=>{render(0);return canvas.toDataURL('image/png').split(',')[1];});if(/cliff|upper/.test(file))fs.writeFileSync('previews/'+file.replace('.png','-natural-v1.png'),Buffer.from(png,'base64'));}
await capture('wildwood-cliff-review.png');
const detail=await game.evaluate(()=>{
cameraX=800;cameraY=100;render(0);
const pixels=ctx.getImageData(480,505,16,16).data,colors=new Set();
for(let i=0;i<pixels.length;i+=4)colors.add(pixels.slice(i,i+3).join(','));
const before=Array.from(ctx.getImageData(480,505,1,1).data);
cameraX=837;render(0);const after=Array.from(ctx.getImageData(443,505,1,1).data);
cameraX=800;ctx.fillStyle='#12abef';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawEarthGround(earthGround[0]);ctx.restore();
const above=Array.from(ctx.getImageData(200,380,1,1).data);
return {colors:colors.size,before,after,above};
});
assert.deepEqual(detail.above,[18,171,239,255],'soil must not leak above the grassy floor');
assert(detail.colors>30,'deep exposed cliffs must contain painted detail, not plain brown');
assert(detail.before.every((value,i)=>Math.abs(value-detail.after[i])<=1),'soil must stay aligned to world coordinates as the camera moves');
// Inspect the rendered silhouette of all six cliff faces, rather than their path constants.
const silhouettes=await game.evaluate(()=>earthGround.slice(1).map(p=>{
 cameraX=p.x-150;cameraY=p.y-60;
 const paint=()=>{ctx.fillStyle='#12abef';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(0,-cameraY);drawEarthGround(p);ctx.restore();};
 paint();const height=earthGround[p.id-1].y-p.y,edges=[];
 for(let dy=35;dy<height-25;dy+=13){
  const pixels=ctx.getImageData(40,Math.round(60+dy),170,1).data;
  for(let i=0;i<170;i++){if(Math.abs(pixels[i*4]-18)+Math.abs(pixels[i*4+1]-171)+Math.abs(pixels[i*4+2]-239)>28){edges.push(40+i);break;}}
 }
 const before=Array.from(ctx.getImageData(185,Math.round(60+height*.55),1,1).data);
 cameraX+=37;paint();const after=Array.from(ctx.getImageData(148,Math.round(60+height*.55),1,1).data);
 return {id:p.id,min:Math.min(...edges),max:Math.max(...edges),before,after};
}));
assert.equal(silhouettes.length,6);
for(const edge of silhouettes){
 assert(edge.max-edge.min>20,`cliff ${edge.id} needs an uneven painted silhouette`);
 assert(edge.min<140,`cliff ${edge.id} roots must protrude beyond the old rectangular edge`);
 assert(edge.before.every((v,i)=>Math.abs(v-edge.after[i])<=1),`cliff ${edge.id} must stay still while the camera pans`);
}
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// EARTH_CLIFFS_BEGIN\n')[1].split('\n// EARTH_CLIFFS_END')[0],fs.readFileSync('assets/wildwood-cliffs-v1.js','utf8'));
await page.locator('[data-scene="cliff"]').click();await capture('wildwood-cliff-review.png');
await page.locator('[data-scene="mushroom"]').click();await capture('wildwood-mushroom-review.png');
const supports=await game.evaluate(()=>earthPlatforms.filter(p=>p.kind==='mushroom').map(p=>{const t=earthTreeLayout(p);return {bough:t.boughY,foot:p.y+116*EARTH_MUSHROOM_SCALE,width:t.treeW,cap:p.w/EARTH_MUSHROOM_SCALE,root:t.boughY+t.lowerH*(t.sh*.965-t.branchY)/(t.sh-t.branchY),ground:earthGroundAt(p.x+p.w/2)};}));
assert.equal(supports.length,5);
for(const support of supports){assert.equal(support.bough,support.foot,'mushroom stem must touch its tree bough');assert(support.root>=support.ground,'supporting tree roots must reach the terrain');assert(support.width<=support.cap+20);}
await page.locator('[data-scene="upper"]').click();await capture('wildwood-upper-review.png');
await page.setViewportSize({width:390,height:844});await page.locator('[data-scene="cliff"]').click();await capture('wildwood-cliff-phone-review.png');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(const viewport of [{width:1200,height:1040},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(let i=0;i<5;i++){
    const landing=await game.evaluate(i=>{
      level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false);keys.clear();
      const b=earthMushroomBoughs[i];player.x=b.x+12;player.y=b.y-player.h-8;player.vx=0;player.vy=30;player.invincible=100;
      for(let f=0;f<60;f++)update(1/60);
      const standing=player.onGround&&Math.abs(player.y+player.h-b.y)<.01;
      keys.add('ArrowRight');for(let f=0;f<12;f++)update(1/60);keys.clear();
      const walking=player.onGround&&Math.abs(player.y+player.h-b.y)<.01;
      state='review';cameraX=b.x-W*.3;cameraY=b.y-playfieldHeight()*.7;render(0);
      return{standing,walking};
    },i);
    assert(landing.standing&&landing.walking,`bough ${i} at ${viewport.width}px`);
    if(i===0)await capture(`wildwood-mushroom-support-${viewport.width}.png`);
  }
}
const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto('file://'+process.cwd()+'/index.html');
await local.waitForFunction(()=>earthCliffSheet.naturalWidth&&earthGroundSheet.naturalWidth);
await local.evaluate(()=>{beginDeveloperSession();level='earth';start();state='review';player.x=1080;player.y=462;cameraX=800;cameraY=100;render(0);});
assert.deepEqual(errors,[]);
console.log('PASS Wildwood artwork: all six irregular cliffs with protruding roots, camera-stable painted edges/soil, all five rooted mushroom supports, desktop/phone and direct-file rendering.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
