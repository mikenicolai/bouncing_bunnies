const assert=require('node:assert/strict'),{run}=require('./air.cjs');
const reset=world=>run(`beginDeveloperSession();level='${world}';resetGame();soundOn=false;coinWallet=0;resetRunWallet();`);
function paid(expected){
 assert.equal(run('monsterCoins.length'),expected,'one dropped coin per starting heart');
 const score=run('score');run('bankMonsterRewards()');assert.equal(run('coinWallet'),expected);assert.equal(run('runMonsterCoins'),expected);assert.equal(run('score'),score,'reward coins do not change collectible progress');
 run('bankMonsterRewards()');assert.equal(run('coinWallet'),expected,'pending rewards pay only once');
}
reset('meadow');run('hitMeadowZombie(enemies[0]);hitMeadowZombie(enemies[0])');paid(1);
reset('air');run('var guardian=airMonsters[0];while(guardian.hp>0){guardian.dizzy=0;hitAirMonster(guardian)}');paid(3);
reset('fire');const fireHearts=run('fireZombies.reduce((n,z)=>n+z.hp,0)');run('for(const z of fireZombies)while(z.alive){z.dizzy=0;hitFireZombie(z)}');paid(fireHearts);
reset('water');const seaHearts=run('[...waterSharks,...waterPirates].reduce((n,z)=>n+z.hp,0)');run('for(const e of [...waterSharks,...waterPirates])while(e.hp>0){e.dizzy=0;hitWaterEnemy(e)}');paid(seaHearts);
reset('earth');const earthHearts=run('earthGoblins.reduce((n,z)=>n+z.hp,0)');run('for(const e of earthGoblins)while(e.alive){e.dizzy=0;hitEarthGoblin(e)}');paid(earthHearts);
reset('final');const castleHearts=run('finalMonsters.reduce((n,z)=>n+z.hp,0)');run('for(const e of finalMonsters)while(e.alive){e.dizzy=0;hitFinalMonster(e)}');paid(castleHearts);
reset('air');run("bossAwake=true;tempest.regenerated=true;while(tempest.hp>0){tempest.dizzy=0;hitTempest('star')}");paid(10);
reset('water');run('neptunus.active=true;while(neptunus.hp>0){neptunus.guard=neptunus.dizzy=0;hitNeptunus()}');paid(10);
reset('fire');run("lavaKing.active=true;fireArrow.owned=true;lavaKing.phase='patrol';while(!lavaKing.defeated){lavaKing.dizzy=0;lavaKing.phase='patrol';hitLavaKing(player,true)}");paid(10);
reset('earth');run("earthBoss.active=true;while(earthBoss.hp>0){earthBoss.dizzy=0;hitEarthBoss('punch')}earthBoss.stage='giant';earthBoss.hp=EARTH_GIANT_HP;while(earthBoss.hp>0){earthBoss.dizzy=0;hitEarthBoss('knife')}");paid(13);
// Drops animate and home into Benny, with exact wallet bookkeeping and pause.
for(const fps of [30,60,120]){
 reset('meadow');run('hitMeadowZombie(enemies[0]);state="paused";var beforeRewards=JSON.stringify(monsterCoins);update(2)');assert.equal(run('JSON.stringify(monsterCoins)'),run('beforeRewards'));
 run('state="playing"');for(let i=0;i<fps*3;i++)run(`updateMonsterRewards(1/${fps})`);assert.equal(run('coinWallet'),1);assert.equal(run('score'),0);assert(run("walletRunSummary().includes('1 rewards')"));
}
for(const roll of [0,.399999,.4,.999999]){
 reset('final');run(`enterFinalKnightRoom();var realRandom=Math.random;Math.random=()=>${roll};var hit=hitFinalKnight();Math.random=realRandom;`);
 assert.equal(run('finalKnight.defenseChance'),.4);assert.equal(run('hit'),roll>=.4);assert.equal(run('finalKnight.hp'),roll<.4?10:9);assert.equal(run('monsterCoins.length'),0);
 if(roll<.4){assert(run('finalKnight.defending>0'));run('hitFinalKnight()');assert.equal(run('finalKnight.hp'),10,'one blocked hit cannot reroll during its parry');run('state="paused";var parryTime=finalKnight.defending;update(1)');assert.equal(run('finalKnight.defending'),run('parryTime'));}
}
reset('final');run('enterFinalKnightRoom();finalKnight.defenseChance=0;while(!finalKnight.defeated){finalKnight.dizzy=0;hitFinalKnight()}hitFinalKnight()');paid(10);
for(const weapon of ['bow','trident','knives','stars']){
 reset('final');run(`enterFinalKnightRoom();player.x=finalKnight.x-155;player.y=412;player.onGround=true;player.invincible=999;player.facing=1;selectFinalWeapon('${weapon}');fireArrow.angle=0;var realRandom=Math.random;Math.random=()=>0;attack()`);
 for(let i=0;i<27;i++)run('update(1/60)');run('Math.random=realRandom');assert.equal(run('finalKnight.hp'),10,`${weapon} can be parried`);assert.equal(run('monsterCoins.length'),0);assert(run('finalKnight.defending>0'),`${weapon} reaches the Knight and triggers a parry`);
}
console.log('PASS rewards: all regular enemy types and bosses, original-heart payouts, Earth forms, one-time drops, separate collectible totals, homing/pause/accounting at 30/60/120 FPS; Knight 40% boundary, parry lockout, pause and defeat reward.');
