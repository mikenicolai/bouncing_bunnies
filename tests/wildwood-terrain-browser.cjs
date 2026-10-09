const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||'/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
try{
const page=await browser.newPage({viewport:{width:1200,height:1040}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8772/previews/wildwood-terrain-review.html');
const game=page.frames().find(f=>/index.html/.test(f.url()));assert(game);
await game.waitForFunction(()=>earthGroundSheet.naturalWidth&&earthTreeSheet.naturalWidth&&earthMushroomSheet.naturalWidth);
async function capture(file){const png=await game.evaluate(()=>{render(0);return canvas.toDataURL('image/png').split(',')[1];});fs.writeFileSync('previews/'+file,Buffer.from(png,'base64'));}
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
await page.locator('[data-scene="mushroom"]').click();await capture('wildwood-mushroom-review.png');
const supports=await game.evaluate(()=>earthPlatforms.filter(p=>p.kind==='mushroom').map(p=>{const t=earthTreeLayout(p);return {bough:t.boughY,foot:p.y+116,width:t.treeW,cap:p.w,root:t.boughY+t.lowerH*(t.sh*.965-t.branchY)/(t.sh-t.branchY),ground:earthGroundAt(p.x+p.w/2)};}));
assert.equal(supports.length,5);
for(const support of supports){assert.equal(support.bough,support.foot,'mushroom stem must touch its tree bough');assert(support.root>=support.ground,'supporting tree roots must reach the terrain');assert(support.width<=support.cap+20);}
await page.locator('[data-scene="upper"]').click();await capture('wildwood-upper-review.png');
await page.setViewportSize({width:390,height:844});await page.locator('[data-scene="cliff"]').click();await capture('wildwood-cliff-phone-review.png');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual(errors,[]);
console.log('PASS Wildwood artwork: textured deep cliffs, camera-stable soil, all five mushrooms attached to rooted tree boughs, desktop and phone rendering.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
