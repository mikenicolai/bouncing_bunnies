const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// DEVELOPER_MODE_BEGIN\n')[1].split('\n// DEVELOPER_MODE_END')[0],fs.readFileSync('assets/developer-mode-v1.js','utf8'));
run("const devTestStore=new Map();window.localStorage={getItem:k=>devTestStore.get(k)||null,setItem:(k,v)=>devTestStore.set(k,v)};meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=false;developerRun=false;level='meadow';resetGame();coinWallet=37;saveCoinWallet();saveWorldProgress()");
const wallet=run('devTestStore.get(COIN_WALLET_KEY)'),progress=run('devTestStore.get(WORLD_PROGRESS_KEY)');
const press=(code,repeat=false)=>run(`window.listeners.keydown[1]({code:'${code}',repeat:${repeat},preventDefault(){}})`);
assert.equal(run('nextWorld()'),'meadow');assert(run("canPlayWorld('meadow')"));
for(const w of ['air','water','earth','fire','final'])assert(!run(`canPlayWorld('${w}')`));
press('KeyD');assert.equal(run('state'),'playing','D retains movement outside the map');assert(!run('developerRun'));
run('openWorldMap();selectWorld("fire")');assert.equal(run('selectedWorld'),'meadow');
press('KeyD',true);assert.equal(run('state'),'map','repeat does not open tools');press('KeyD');assert.equal(run('state'),'developer');assert(!run('developerRun'),'opening the screen alone does not change the wallet or run');
assert(run("document.querySelector('#developerBuild').textContent.includes(String(BUILD_INFO.build))"));
for(const bad of [-1,1001,1.5,''])assert(!run(`setDeveloperCoins(${JSON.stringify(bad)})`));assert.equal(run('coinWallet'),37);
assert(run('setDeveloperCoins(1000)'));assert.equal(run('coinWallet'),1000);assert(run('developerRun'));
assert.equal(run('devTestStore.get(COIN_WALLET_KEY)'),wallet);assert.equal(run('devTestStore.get(WORLD_PROGRESS_KEY)'),progress);
// Test every world, including the castle bow/gate, without inventing achievements.
for(const w of ['meadow','air','water','earth','fire','final']){
 if(run('state')!=='developer')run('openWorldMap()');assert.equal(run('state'),'developer');assert(run(`launchDeveloperWorld('${w}')`));assert.equal(run('level'),w);assert.equal(run('state'),'playing');
 if(w==='meadow'){run('lives=1;player.invincible=0;hurt()');assert(run('buyReviveHeart()'));assert.equal(run('devTestStore.get(COIN_WALLET_KEY)'),wallet);}
 if(w==='final'){assert.equal(run('finalGateLift'),1);assert(run('fireArrow.owned'));assert(!run('finalUnlocked()'));}
 run(`completeWorld('${w}');collectCoin({taken:false})`);assert.equal(run('devTestStore.get(COIN_WALLET_KEY)'),wallet);assert.equal(run('devTestStore.get(WORLD_PROGRESS_KEY)'),progress);
}
run('showEnd(true)');assert.equal(run('state'),'developer','test victories return to the developer screen');assert(!run('meadowFinished||airFinished||waterFinished||earthFinished||fireFinished'));
press('Escape');assert.equal(run('state'),'map');assert(!run('developerRun'));assert.equal(run('coinWallet'),37);assert.equal(run('level'),'meadow');assert.equal(run('selectedWorld'),'meadow');assert.equal(run('devTestStore.get(COIN_WALLET_KEY)'),wallet);
// Without launching a test, opening/closing tools preserves the paused normal run.
run('start();player.x=400;score=3;openWorldMap()');press('KeyD');assert(run('setDeveloperCoins(100)'));run('exitDeveloperMode()');assert.equal(run('player.x'),400);assert.equal(run('score'),3);assert.equal(run('coinWallet'),37);
// Ordered progress survives reload. Legacy out-of-order flags cannot skip Meadow.
run('meadowFinished=false;airFinished=waterFinished=earthFinished=fireFinished=true;saveWorldProgress();restoreWorldProgress()');assert.equal(run('nextWorld()'),'meadow');assert(!run('finalUnlocked()'));
run('meadowFinished=true;airFinished=waterFinished=earthFinished=fireFinished=false');
for(const [world,next] of [['air','water'],['water','earth'],['earth','fire'],['fire','final']]){assert.equal(run('nextWorld()'),world);assert(run(`canPlayWorld('${world}')`));assert(!run(`canPlayWorld('${next}')`));run(`completeWorld('${world}')`);assert.equal(run('nextWorld()'),next);}
console.log('PASS ordered progression and developer tools: Meadow prerequisite, hidden map-only D, all six test worlds, castle equipment/gate, 0–1000 wallet validation, isolated saves, escape/normal return and preserved paused runs.');
