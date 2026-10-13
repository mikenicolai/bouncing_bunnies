const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');
assert.equal(html.split('// COIN_REVIVE_BEGIN\n')[1].split('\n// COIN_REVIVE_END')[0],fs.readFileSync('assets/coin-revive-v1.js','utf8'));
run("const walletTestStore=new Map();window.localStorage={getItem:k=>walletTestStore.get(k)||null,setItem:(k,v)=>walletTestStore.set(k,v)};let walletTestNow=0;performance.now=()=>walletTestNow;let walletTestTimers=[];setTimeout=(fn,delay)=>{walletTestTimers.push({fn,delay});return walletTestTimers.length};clearTimeout=()=>{};soundOn=false");
const reset=world=>run(`level='${world}';meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;resetGame();coinWallet=0;player.invincible=999;keys.clear()`);
// Exercise every real collection path, not just the shared helper.
for(const world of ['meadow','air','earth','water','final','fire','fireMaze','fireJourney','meadowDive']){
 reset(world.startsWith('fire')?'fire':world==='meadowDive'?'meadow':world);
 if(world==='meadowDive')run('meadowLesson.bowTaken=true;meadowLesson.bowStored=true;player.x=6410;player.y=720;player.inWater=true');
 if(world==='water')run('player.x=2200;player.y=600;player.inWater=true;waterAquaSuit=true;waterSharks=[];waterPirates=[]');
 if(world==='fireMaze')run('beginFireMaze()');
 if(world==='fireJourney')run('beginSecondVolcano();player.x=7100;player.y=fireSlopeY(7121)-58;player.onGround=true');
 run('coins=[{x:player.x+21,y:player.y+29,taken:false}];update(0)');
 assert.equal(run('coinWallet'),1,world+' credits wallet');assert.equal(run('score'),1);
 run('update(0)');assert.equal(run('coinWallet'),1,'collected coin cannot be awarded twice');
 assert.equal(JSON.parse(run('walletTestStore.get(COIN_WALLET_KEY)')).coins,1);
}
// Every paid/ad offer restarts the selected world, rather than its checkpoint.
for(const fps of [30,60,120])for(const world of ['meadow','air','earth','water','fire','final']){
 reset(world);run("coinWallet=21;collectCoin(coins[0]);checkpoint.x=1500;player.x=1500;fireArrow.owned=true;waterAquaSuit=true;waterTrident.owned=true;earthBoss.hp=2;neptunus.hp=5;tempest.hp=4;lavaKing.hp=3;lives=1;player.invincible=0;hurt()");
 assert.equal(run('state'),'lost');assert(run('revivePending'));run('jump()');assert.equal(run('state'),'lost');
 assert(Object.values(JSON.parse(run('walletTestStore.get(WORLD_PROGRESS_KEY)')).completed).every(v=>v===false),'a reload after game over starts in Meadow');
 assert(run('buyReviveHeart()'));assert.equal(run('level'),world);assert.equal(run('coinWallet'),2);assert.equal(run('lives'),1);assert.equal(run('state'),'playing');
 assert.equal(run('player.x'),90);assert.equal(run('score'),0);assert(run('coins.every(c=>!c.taken)'));assert.equal(run('lavaKing.hp'),10);assert.equal(run('tempest.hp'),10);assert.equal(run('earthBoss.hp'),5);assert.equal(run('neptunus.hp'),10);
 assert(!run('waterAquaSuit||waterTrident.owned'));assert.equal(run('fireMode'),'surface');assert.equal(run('walletRunSummary()'),'Start 2 + 0 − 0 spent = 2');
 assert(Object.values(JSON.parse(run('walletTestStore.get(WORLD_PROGRESS_KEY)')).completed).every(Boolean),'payment retains earlier-world completion');
 assert(!run('buyReviveHeart()'));assert.equal(run('coinWallet'),2,'repeat purchase cannot spend twice');
 run('player.invincible=0;hurt()');assert(!run('buyReviveHeart()'));assert(run("document.querySelector('#reviveCoinButton').disabled"));assert(run('beginReviveAd()'));assert(!run('beginReviveAd()'));
 const token=run('reviveAdToken'),frozen=run('JSON.stringify({level,coins,score,player,lavaKing,fireArrow})');assert.equal(run('walletTestTimers.at(-1).delay'),5000);
 run("window.listeners.keydown[1]({code:'Space',repeat:false,preventDefault(){}});start();openWorldMap();jump()");
 for(let f=0;f<fps*4;f++)run(`walletTestNow+=1000/${fps};update(1/${fps})`);
 assert.equal(run('state'),'reviveAd');assert.equal(run('JSON.stringify({level,coins,score,player,lavaKing,fireArrow})'),frozen,'the five-second ad freezes the entire run');
 run('walletTestNow=reviveAdEndsAt-1;walletTestTimers.at(-1).fn()');assert.equal(run('lives'),0);
 run('walletTestNow=reviveAdEndsAt;walletTestTimers.at(-1).fn()');assert.equal(run('state'),'playing');assert.equal(run('level'),world);assert.equal(run('lives'),3);assert.equal(run('player.x'),90);assert.equal(run('score'),0);assert.equal(run('coinWallet'),2);
 assert(!run(`finishReviveAd(${token})`));assert(run('player.invincible===3&&coins.every(c=>!c.taken)'));
}
// Normal restart, map access and reload cannot give a free restart in a later world.
for(const action of ['start()','openWorldMap()']){
 reset('fire');run('coinWallet=43;saveCoinWallet();lives=1;player.invincible=0;hurt();'+action);
 assert.equal(run('level'),'meadow');assert.equal(run('coinWallet'),43);assert.equal(run('nextWorld()'),'meadow');assert(!run('finalUnlocked()'));assert(!run("canPlayWorld('fire')"));
 assert(Object.values(JSON.parse(run('walletTestStore.get(WORLD_PROGRESS_KEY)')).completed).every(v=>v===false));
 if(action==='openWorldMap()'){assert.equal(run('selectedWorld'),'meadow');run('start()');}
 assert.equal(run('state'),'playing');assert.equal(run('lives'),3);assert.equal(run('player.x'),90);
}
reset('fire');run('coinWallet=31;saveCoinWallet();showEnd(false);restoreWorldProgress()');assert.equal(run('nextWorld()'),'meadow');assert(!run('finalUnlocked()'));assert.equal(run('coinWallet'),31);
// Real fall, drowning, instant-kill and Fire deaths still expose both restart offers.
for(const [world,death] of [['air','player.y=800;update(1/60)'],['water','player.inWater=true;player.x=3200;player.y=700;player.air=.001;waterAquaSuit=false;update(1/60)'],['earth','endEarthHazard()'],['fire','respawnFire()'],['final','player.y=800;update(1/60)']]){
 reset(world);run('coinWallet=20;lives=1;player.invincible=0;'+death);assert.equal(run('state'),'lost');assert(run('buyReviveHeart()'));assert.equal(run('level'),world);assert.equal(run('player.x'),90);assert.equal(run('coinWallet'),0);run('update(1/60)');assert.equal(run('state'),'playing');
}
// Meadow puzzle progress also resets, while previously earned currency remains usable.
reset('meadow');run('coins.slice(0,30).forEach(collectCoin);meadowLesson.balloons.forEach(b=>b.popped=true);meadowLesson.lift=1;lives=1;player.invincible=0;hurt();buyReviveHeart()');
assert.equal(run('coinWallet'),10);assert.equal(run('score'),0);assert.equal(run('meadowBalloonsPopped()'),0);assert.equal(run('meadowLesson.lift'),0);assert.equal(run('walletRunSummary()'),'Start 10 + 0 − 0 spent = 10');
// Cancelled offers cannot grant late rewards; blocked storage and developer sessions remain isolated.
reset('meadow');run('coinWallet=23;saveCoinWallet();showEnd(false);beginReviveAd();var cancelledReward=walletTestTimers.at(-1).fn;resetGame();walletTestNow+=6000;cancelledReward()');assert.equal(run('coinWallet'),23);assert.equal(run('lives'),3);
run('coinWallet=0;restoreCoinWallet()');assert.equal(run('coinWallet'),23);
for(const bad of ['broken JSON','{"version":1,"coins":-1}','{"version":1,"coins":"40"}','{"version":1,"coins":1.5}']){run(`walletTestStore.set(COIN_WALLET_KEY,${JSON.stringify(bad)});coinWallet=0;restoreCoinWallet()`);assert.equal(run('coinWallet'),0);}
reset('fire');run('saveWorldProgress();var normalProgress=walletTestStore.get(WORLD_PROGRESS_KEY);beginDeveloperSession();showEnd(false);start()');assert.equal(run('walletTestStore.get(WORLD_PROGRESS_KEY)'),run('normalProgress'),'test game-over does not erase the normal journey');
run("developerRun=false;window.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};coinWallet=0;restoreCoinWallet();collectCoin({taken:false})");assert.equal(run('coinWallet'),1);
console.log('PASS wallet/game-over: all collection paths, 20-coin current-level restart with one heart, five-second frozen/exactly-once restart with three hearts, fresh bosses/coins/puzzles, Meadow fallback/map/reload, saved wallet/progress and developer isolation at 30/60/120 FPS.');
