const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
function reset(){run("keys.clear();level='fire';resetGame();soundOn=false;fireArrow.owned=true;player.x=10340;player.y=-558;player.invincible=999;beginLavaKing()");}
for(const fps of [30,60,120]){
 reset();const start=run('lavaKing.x');for(let f=0;f<fps;f++)run(`updateLavaKing(1/${fps})`);
 assert(Math.abs(start-run('lavaKing.x')-67.5)<1e-8,'patrol moves 10% slower than the previous 75 units per second');
 reset();run('lavaKingFireballs=[{x:10800,y:-570,vx:-330,vy:0,age:0,r:13,alive:true,airborne:false}]');
 for(let f=0;f<fps;f++)run(`updateLavaKing(1/${fps})`);
 assert.equal(run('lavaKingFireballs.length'),1);assert(Math.abs(10800-run('lavaKingFireballs[0].x')-297)<1e-8,'fireball travels 10% slower than before');
 reset();run("lavaKingPhase('flight')");for(let f=0;f<fps*4.3;f++)run(`updateLavaKing(1/${fps})`);
 assert.equal(run('lavaKing.phase'),'flight','the four-second flight now lasts a little longer');assert.equal(run('lavaKing.flightShot'),3);
 for(let f=0;f<fps*.3;f++)run(`updateLavaKing(1/${fps})`);
 assert.equal(run('lavaKing.phase'),'recover');assert.equal(run('lavaKing.y+lavaKing.h'),-500,'flight still returns to the arena floor');
 assert.equal(run('lives'),3);
}
reset();run("lavaKingPhase('windup');updateLavaKing(.7)");assert.equal(run('lavaKing.phase'),'windup');run('updateLavaKing(.04)');assert.equal(run('lavaKing.phase'),'slash');run('updateLavaKing(.27)');assert.equal(run('lavaKing.phase'),'recover');
reset();run("lavaKingPhase('cast');updateLavaKing(.6)");assert.equal(run('lavaKingFireballs.length'),0);run('updateLavaKing(.04)');assert.equal(run('lavaKingFireballs.length'),1);
run("state='map';var pausedBoss=JSON.stringify([lavaKing,lavaKingFireballs]);update(.5)");assert(run('JSON.stringify([lavaKing,lavaKingFireballs])===pausedBoss'),'map still freezes the entire encounter');
assert.equal(run('lavaKing.hp'),10);assert.equal(run('FIRE_ARROW_SPEED'),900,'the bunny keeps its ordinary arrow speed');
console.log('PASS Lava King pace: 10% slower patrol/fireballs at 30/60/120 FPS, slightly longer flight and attack warnings, three shots/landing, pause, ten hearts and unchanged player arrow speed.');
