const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("meadowFinished=airFinished=waterFinished=earthFinished=fireFinished=true;level='final';start();soundOn=false;finalMonsters=[];player.x=FINAL_TOWER.entryX;player.y=412;player.onGround=true;enterFinalTower()");
assert(run('finalTowerPlatforms[1].x>finalTowerPlatforms[0].x+finalTowerPlatforms[0].w+42'),'first jump crosses open lava');
assert(run('finalTowerPlatforms[2].x+finalTowerPlatforms[2].w<finalTowerPlatforms[1].x'),'next jump must go back left');
assert(run('finalTowerPlatforms.filter(p=>p.crumble).every(p=>p.w<230)'));
for(const fps of [30,60,120]){
 reset();run("var ledge=finalTowerPlatforms[1];player.x=ledge.x+40;player.y=ledge.y-68;player.vy=150;player.onGround=false");
 for(let i=0;i<fps*.2&&!run('player.onGround');i++)run(`update(1/${fps})`);
 assert(run('player.onGround'));assert.equal(run('ledge.crackAge'),0);assert(!run('ledge.collapsed'));
 for(let i=0;i<fps*.6;i++)run(`update(1/${fps})`);assert(run('ledge.crackAge>=.59&&ledge.crackAge<FINAL_STONE_LIFE'));assert(run('player.onGround'),'stone gives a brief reaction window');
 run("state='map';var age=ledge.crackAge;update(.5)");assert.equal(run('ledge.crackAge'),run('age'),'pause freezes crumble');run("state='playing';jump()");
 for(let i=0;i<fps*.5;i++)run(`update(1/${fps})`);assert(run('ledge.collapsed'),'leaving does not reset the cracking timer');
 // A collapsed stone no longer catches a descending bunny.
 run('player.x=ledge.x+40;player.y=ledge.y-58;player.vy=0;player.onGround=true');run(`update(1/${fps})`);assert(!run('player.onGround'));
 run('coinWallet=20;collectCoin(coins.at(-1));var ammo=JSON.stringify(fireArrow.ammo)');
 for(let i=0;i<fps*3&&run('lives===3');i++)run(`update(1/${fps})`);
 assert.equal(run('lives'),2);assert.equal(run('player.x'),run('FINAL_TOWER.entryX'));assert(run('finalTowerPlatforms.every(p=>!p.collapsed&&p.crackAge===-1)'),'lava starts a fresh stone attempt');assert(run('coins.at(-1).taken'));assert.equal(run('JSON.stringify(fireArrow.ammo)'),run('ammo'));
 run('finalTowerPlatforms[1].collapsed=true;coinWallet=20;lives=1;player.x=9200;player.y=FINAL_TOWER.lavaY;player.onGround=false;update(0)');assert.equal(run('state'),'lost');assert(run('buyReviveHeart()'));assert.equal(run('lives'),1);assert(run('finalTowerPlatforms.every(p=>!p.collapsed&&p.crackAge===-1)'));assert.equal(run('player.x'),run('FINAL_TOWER.entryX'));
 reset();run('player.x=finalTowerPlatforms.at(-1).x+40;player.y=FINAL_TOWER.top-58;player.onGround=true');assert(!run('finalTowerPlatforms.at(-1).crumble'),'summit exit is stable');
}
console.log('PASS crumbling tower: mandatory early right/left over lava, narrow stones, real land-to-crack-to-collapse, departure/pause, lost collision, lava and paid retry preserving wallet/ammo, stable summit at 30/60/120 FPS.');
