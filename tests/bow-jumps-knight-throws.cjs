const assert=require('node:assert/strict'),{run}=require('./air.cjs');
const reset=()=>run("beginDeveloperSession();level='final';start();soundOn=false;enterFinalKnightRoom();player.invincible=99;finalKnight.dizzy=99;");
for(const fps of [30,60,120]){
 reset();run("selectFinalWeapon('bow');jump();jump();jump();jump();");assert.equal(run('player.boosts'),2);assert(run('fireArrow.aiming'));assert(run('fireBunnyArrow()'));assert.equal(run('archeryBunnyFrame()'),3);
 for(let i=0;i<fps*1.5;i++)run(`update(1/${fps})`);assert(run('player.onGround'));assert(run('fireArrow.aiming'));assert.equal(run('player.boosts'),0);
 reset();run('finalKnight.dizzy=0;finalKnight.x=600;player.x=300;finalKnight.cooldown=0;player.invincible=0');run(`update(1/${fps})`);assert.equal(run('finalKnight.phase'),'throwWindup');
 for(let i=0;i<Math.floor(fps*.3);i++)run(`update(1/${fps})`);assert.equal(run('finalKnight.sword'),null);assert.equal(run('lives'),3);
 for(let i=0;i<Math.ceil(fps*.65);i++)run(`update(1/${fps})`);assert.equal(run('lives'),2,'the swept thrown sword reaches Benny');assert(run('finalKnight.sword'));
 let returning=false,caught=false;
 for(let i=0;i<fps*2;i++){run(`update(1/${fps})`);if(run('finalKnight.sword?.returning'))returning=true;if(returning&&!run('finalKnight.sword')){caught=true;break;}}
 assert(returning&&caught,'the same sword flies back and is caught');assert.equal(run('finalKnight.phase'),'recover');assert.equal(run('lives'),2,'return flight respects damage immunity');
 // Stun, defeat and paid checkpoint continuation clear enemy projectiles.
 reset();run('finalKnight.dizzy=0;throwFinalKnightSword();hitFinalKnight()');assert.equal(run('finalKnight.sword'),null);assert.equal(run('finalKnight.phase'),'hurt');
 run('finalKnight.dizzy=0;throwFinalKnightSword();coinWallet=30;showEnd(false);buyReviveHeart()');assert.equal(run('finalKnight.sword'),null);assert.equal(run('finalKnight.hp'),9);assert.equal(run('lives'),1);
 reset();run('finalKnight.dizzy=0;throwFinalKnightSword();state="map"');const paused=run('JSON.stringify(finalKnight.sword)');run('update(1)');assert.equal(run('JSON.stringify(finalKnight.sword)'),paused);
 // A jump dodges the aimed throw rather than taking unavoidable damage.
 reset();run('finalKnight.dizzy=0;finalKnight.x=600;player.x=350;player.invincible=0;throwFinalKnightSword();jump();jump();jump();');for(let i=0;i<Math.ceil(fps*.55);i++)run(`update(1/${fps})`);assert.equal(run('lives'),3);
}
console.log('PASS equipped bow jump/air shot/landing limits; knight ranged windup, swept damage, return/catch, jump dodge, stun, checkpoint and pause at 30/60/120 FPS.');
