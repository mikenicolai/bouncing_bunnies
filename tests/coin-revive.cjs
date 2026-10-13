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
for(const fps of [30,60,120])for(const world of ['meadow','air','earth','water','fire','final']){
 reset(world);run("coinWallet=21;coins[0].taken=true;score=1;fireArrow.owned=true;fireArrow.ammo=['normal',null,'fire','rainbow',null];fireArrow.recharge=1.2;waterAquaSuit=true;waterTrident.owned=true;waterTrident.cyber=true;earthBoss.hp=2;neptunus.hp=5;tempest.hp=4;lavaKing.hp=3;lives=1;player.invincible=0;hurt()");
 assert.equal(run('state'),'lost');run('jump()');assert.equal(run('state'),'lost','jump cannot accidentally discard a paused run');assert(!run("document.querySelector('#reviveCoinButton').disabled"));
 const coins=run('JSON.stringify(coins)'),ammo=run('JSON.stringify(fireArrow.ammo)'),flags=run('JSON.stringify([airFinished,waterFinished,earthFinished,fireFinished])');
 for(let i=0;i<fps;i++)run(`update(1/${fps})`);assert.equal(run('score'),1);
 assert(run('buyReviveHeart()'));assert.equal(run('coinWallet'),1);assert.equal(run('lives'),1);assert.equal(run('state'),'playing');
 assert.equal(run('JSON.stringify(coins)'),coins);assert.equal(run('JSON.stringify(fireArrow.ammo)'),ammo);assert.equal(run('JSON.stringify([airFinished,waterFinished,earthFinished,fireFinished])'),flags);
 assert.equal(run('JSON.stringify([earthBoss.hp,neptunus.hp,tempest.hp,lavaKing.hp])'),'[2,5,4,3]');assert(run('waterAquaSuit&&waterTrident.cyber'));
 assert(!run('buyReviveHeart()'),'repeat click cannot charge twice');assert.equal(run('coinWallet'),1);
 run('player.invincible=0;hurt()');assert(run("document.querySelector('#reviveCoinButton').disabled"));assert(!run('buyReviveHeart()'));
 assert(run('beginReviveAd()'));assert(!run('beginReviveAd()'),'only one pending ad');
 const frozen=run('JSON.stringify({coins,score,player,earthBoss,neptunus,tempest,lavaKing,ammo:fireArrow.ammo})');
 const token=run('reviveAdToken');assert.equal(run('walletTestTimers.at(-1).delay'),5000);
 run("window.listeners.keydown[1]({code:'Space',repeat:false,preventDefault(){}});start();openWorldMap();jump()");
 for(let i=0;i<fps*4;i++)run(`walletTestNow+=1000/${fps};update(1/${fps})`);
 assert.equal(run('state'),'reviveAd');assert.equal(run('JSON.stringify({coins,score,player,earthBoss,neptunus,tempest,lavaKing,ammo:fireArrow.ammo})'),frozen,'simulation freezes gameplay and ammunition');
 run('walletTestNow=reviveAdEndsAt-1;walletTestTimers.at(-1).fn()');assert.equal(run('lives'),0,'no reward before five full seconds');
 run('walletTestNow=reviveAdEndsAt;walletTestTimers.at(-1).fn()');assert.equal(run('lives'),3);assert.equal(run('state'),'playing');assert.equal(run('coinWallet'),1);
 assert(!run(`finishReviveAd(${token})`),'late callback cannot grant another reward');assert.equal(run('JSON.stringify(coins)'),coins);
 run('start()');assert.equal(run('score'),0);assert.equal(run('coinWallet'),1,'restart retains wallet');
}
// Real fall, drowning, instant-kill and Fire respawn entry points all offer revival.
for(const [world,death] of [['air','player.y=800;update(1/60)'],['water','player.inWater=true;player.x=3200;player.y=700;player.air=.001;waterAquaSuit=false;update(1/60)'],['earth','endEarthHazard()'],['fire','respawnFire()'],['final','player.y=800;update(1/60)']]){
 reset(world);run('coinWallet=20;lives=1;player.invincible=0;'+death);assert.equal(run('state'),'lost',world+' death');assert(run('buyReviveHeart()'));assert.equal(run('player.x'),run('checkpoint.x'));
 run('update(1/60)');assert.equal(run('state'),'playing',world+' resumes safely');
}
// Meadow's added dive uses the wallet/revival without losing opened-door progress.
for(const fps of [30,60,120]){
 reset('meadow');run('coinWallet=20;lives=1;meadowLesson.bowTaken=true;meadowLesson.bowStored=true;meadowLesson.balloons.forEach(b=>b.popped=true);meadowLesson.lift=1;meadowLesson.diveStarted=true;checkpoint={x:5880,y:412,meadow:true};player.x=6410;player.y=720;player.inWater=true;player.air=.001;fireArrow.owned=false');
 run(`update(1/${fps})`);assert.equal(run('state'),'lost');assert(run('buyReviveHeart()'));
 assert.equal(run('player.x'),5880);assert.equal(run('player.y'),412);assert(!run('player.inWater'));assert.equal(run('player.air'),15);
 assert(run('meadowBalloonsPopped()===3&&meadowLesson.lift===1&&meadowLesson.bowStored&&meadowLesson.diveStarted&&!fireArrow.owned'));
 run(`update(1/${fps})`);assert.equal(run('state'),'playing');assert.equal(run('player.x'),5880);assert(!run('player.inWater'),'revival must not teleport the bunny back into the pond');
 run('player.x=6410;player.y=720;player.inWater=true;player.air=.001;lives=1');run(`update(1/${fps})`);assert(run('beginReviveAd()'));run('walletTestNow=reviveAdEndsAt;walletTestTimers.at(-1).fn()');assert.equal(run('lives'),3);assert(!run('player.inWater'));assert.equal(run('player.air'),15);
}
// Cancelled/restarted offers reject stale rewards; saves are independent of world completion.
reset('meadow');run('coinWallet=23;saveCoinWallet();showEnd(false);beginReviveAd();const cancelledReward=walletTestTimers.at(-1).fn;resetGame();walletTestNow+=6000;cancelledReward()');assert.equal(run('lives'),3);assert.equal(run('coinWallet'),23);
run('coinWallet=0;restoreCoinWallet()');assert.equal(run('coinWallet'),23,'wallet reload');
for(const bad of ['broken JSON','{"version":1,"coins":-1}','{"version":1,"coins":"40"}','{"version":1,"coins":1.5}']){run(`walletTestStore.set(COIN_WALLET_KEY,${JSON.stringify(bad)});coinWallet=0;restoreCoinWallet()`);assert.equal(run('coinWallet'),0);}
run("window.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};coinWallet=0;restoreCoinWallet();collectCoin({taken:false})");assert.equal(run('coinWallet'),1,'blocked storage still allows earning/spending in session');
console.log('PASS coin wallet/revive: every collection path, persistence/invalid storage, 20-coin purchase, five-second exactly-once reward, frozen simulation/input, retained run/boss/gear/ammo, all death entry points and restart at 30/60/120 FPS.');
