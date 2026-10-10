const assert=require('node:assert/strict');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false);player.x=7200;player.y=EARTH_ARENA.floor-player.h;player.onGround=true;earthBoss.active=true;earthBoss.stage='giant';earthBoss.hp=EARTH_GIANT_HP;earthBoss.cooldown=0;earthBoss.turn=2");
const tick=(fps,seconds,fn)=>{for(let i=0;i<Math.ceil(seconds*fps);i++)run(`${fn}(1/${fps})`);};
for(const fps of [30,60,120]){
 reset();run('updateEarthBoss(0)');assert.equal(run('earthBoss.phase'),'mountain');assert.equal(run('earthBossMountains[0].x'),run('player.x+player.w/2'));
 assert.notEqual(run('earthBossMountains[0].x'),run('earthBoss.x'));
 const target=run('earthBossMountains[0].x');run('player.x-=180');tick(fps,2.7,'updateEarthBoss');
 assert.equal(run('earthBossMountains[0].x'),target,'the warning stays where the attack targeted the bunny');assert.equal(run('lives'),3,'leaving the warning avoids the rising peaks');
 reset();run('updateEarthBoss(0)');tick(fps,2.7,'updateEarthBoss');assert.equal(run('lives'),2,'remaining on the warned ground costs one heart');
 reset();run('earthBoss.turn=3;updateEarthBoss(0)');assert.equal(run('earthBoss.phase'),'vine');assert(run('earthBossVine'));
 const start=run('player.x');tick(fps,.6,'updateEarthVine');assert.equal(run('player.x'),start,'windup leaves time to react');assert(!run('earthBossVine.grabbed'));
 tick(fps,.7,'updateEarthVine');assert(run('earthBossVine.grabbed'));assert(run(`player.x>${start+10}`),'vine pulls toward the boss');assert.equal(run('lives'),3,'the vine grab alone does not take health');
 run('jump()');assert(!run('earthBossVine.grabbed'));assert(run('earthBossVine.released'));assert(run('player.vy<0'),'normal jump escapes the grab');
 // A successful knife throw cuts a grab, spends one ready slot and retains its
 // usual return timer. An empty inventory must not fabricate a fourth knife.
 reset();run('earthBoss.turn=3;updateEarthBoss(0)');tick(fps,1.25,'updateEarthVine');assert(run('earthBossVine.grabbed'));
 run("earthKnives.slots[0].state='ready';earthKnives.equipped=true;player.attackCooldown=0;attack()");assert(run('earthBossVine.released'));assert.equal(run('earthKnives.slots[0].state'),'flying');assert.equal(run('earthKnives.slots[0].remaining'),5);
 reset();run('earthBoss.turn=3;updateEarthBoss(0)');run('player.y-=120;player.onGround=false');tick(fps,1.4,'updateEarthVine');assert(!run('earthBossVine.grabbed'),'airborne bunny avoids the aimed vine');
 reset();run('earthBoss.turn=3;updateEarthBoss(0)');tick(fps,2.9,'updateEarthVine');assert.equal(run('earthBossVine'),null,'vine fully retracts');
 reset();run('earthBoss.turn=3;updateEarthBoss(0);resetGame()');assert.equal(run('earthBossVine'),null,'restart clears the vine');assert.equal(run('earthBoss.hp'),5);
}
console.log('PASS eight-heart giant: bunny-targeted spike warnings, escape/damage, vine windup/grab/pull, jump and knife release, air dodge, retraction and restart at 30/60/120 FPS.');
