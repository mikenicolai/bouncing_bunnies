const assert=require('node:assert/strict'),{run}=require('./air.cjs');
for(const fps of [30,60,120])for(const world of ['air','final'])for(const facing of [-1,1]){
 run(`level='${world}';resetGame();state='playing';soundOn=false;windStars.owned=true;windStars.equipped=true;player.x=${world==='air'?4950:3600};player.y=${world==='air'?-1748:412};player.onGround=true;player.facing=${facing};player.invincible=999;bossAwake=false;finalMonsters=[];`);
 const tick=()=>run(`${world==='air'?'updateWindStars':'updateFinalWeapons'}(1/${fps})`);
 assert.equal(run('windStars.slots.length'),2);assert(run('throwWindStar()'));
 for(let i=0;i<fps;i++)tick();
 run('player.attackCooldown=0');assert(run('throwWindStar()'));
 run('player.attackCooldown=0');assert(!run('throwWindStar()'),'a third throw waits for a returning star');
 // Each star has its own timer and follows a moving owner, even after stowing.
 run('windStars.equipped=false');
 for(let i=0;i<fps*4-1;i++){run('player.x+=1;player.y-=.2');tick();}
 assert.notEqual(run('windStars.slots[0].state'),'ready','not ready before five seconds');
 tick();assert.equal(run('windStars.slots[0].state'),'ready');
 assert.notEqual(run('windStars.slots[1].state'),'ready','the later throw keeps its own deadline');
 assert(Math.abs(run('windStars.slots[0].x-(player.x+player.w/2+player.facing*18)'))<1e-8);
 for(let i=0;i<fps;i++)tick();assert(run("windStars.slots.every(s=>s.state==='ready')"));
 run("windStars.equipped=true;player.attackCooldown=0;throwWindStar();state='paused';var starBeforePause=JSON.stringify(windStars);update(1)");
 assert.equal(run('JSON.stringify(windStars)'),run('starBeforePause'),'pause freezes the flight timer');
}
console.log('PASS returning stars: exactly two in Air/Castle, independent five-second deadlines, moving owner, both directions, stowing, no third throw, pause and reuse at 30/60/120 FPS.');
