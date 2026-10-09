const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const reset=()=>run("level='earth';resetGame();soundOn=false;earthGoblins.forEach(g=>g.alive=false)");
const tick=(fps,n,fn='update')=>{for(let i=0;i<n;i++)run(`${fn}(1/${fps})`);};
for(const width of [480,960])for(const fps of [30,60,120]){
 run(`W=${width};H=${width===480?960:540}`);reset();
 assert.equal(run('earthKnives.slots.length'),3);assert(!run('earthKnivesOwned()'));assert(run('platforms.includes(earthKnifeLedge)'));
 // Descend left from the final approach, land on the previous branch, then
 // step right off that branch to discover the three knives on the lower bough.
 run("player.x=6450;player.y=earthPlatforms[23].y-58;player.onGround=true;keys.add('ArrowLeft')");
 let lowerBranch=false;
 for(let i=0;i<fps*3;i++){
  if(run('player.x<6300'))run('keys.clear()');run(`update(1/${fps})`);
  if(run('player.onGround&&Math.abs(player.y+player.h-earthPlatforms[22].y)<1')){lowerBranch=true;break;}
 }
 assert(lowerBranch,`first drop ${width}/${fps}`);
 run("keys.clear();keys.add('ArrowRight')");
 for(let i=0;i<fps*3&&run("earthKnives.slots.some(k=>k.state==='hidden')");i++)run(`update(1/${fps})`);
 assert.equal(run("earthKnives.slots.filter(k=>k.state==='ready').length"),3,`discover all three ${width}/${fps}`);
 assert.equal(run('player.y+player.h'),run('earthKnifeLedge.y'));assert.equal(run('lives'),3);
 // Return using the normal boosted jump, with the knives still equipped.
 run('keys.clear();player.vx=0;jump()');let returned=false;
 for(let i=0;i<fps*2;i++){
  if(i===Math.round(fps/12)||i===Math.round(fps/6))run('jump()');run(`update(1/${fps})`);
  if(run('player.onGround&&Math.abs(player.y+player.h-earthPlatforms[23].y)<1')){returned=true;break;}
 }
 assert(returned,`safe return ${width}/${fps}`);assert.equal(run('lives'),3);
 // Three throws exhaust the actual inventory. A hit or miss does not reset
 // the five-second timer; each slot becomes available independently.
 run('player.facing=-1');
 for(let i=0;i<3;i++){assert(run('throwEarthKnife()'));tick(fps,Math.ceil(.5*fps));}
 assert(!run('throwEarthKnife()'));assert.equal(run("earthKnives.slots.filter(k=>k.state==='ready').length"),0);
 tick(fps,Math.round(3.4*fps),'updateEarthKnives');assert.equal(run("earthKnives.slots.filter(k=>k.state==='ready').length"),0,'no early return');
 tick(fps,Math.round(.2*fps),'updateEarthKnives');assert.equal(run("earthKnives.slots.filter(k=>k.state==='ready').length"),1,'first knife returns at five seconds');
 tick(fps,fps,'updateEarthKnives');assert.equal(run("earthKnives.slots.filter(k=>k.state==='ready').length"),3);
 assert(run('earthKnives.slots.every(k=>k.remaining===0)'));
 run('toggleEarthKnives();player.onGround=true;jump()');assert(!run('earthKnives.equipped'));assert(run('player.vy<0'));run('toggleEarthKnives()');
 // A shielded giant cannot be defeated by punches or a stomp.
 reset();run("earthBoss.active=true;earthBoss.stage='giant';earthBoss.cooldown=100;player.invincible=100;player.x=earthBoss.x-130;player.y=EARTH_ARENA.floor-58;player.facing=1;attack()");
 assert.equal(run('earthBoss.hp'),5);assert(!run('hitEarthBoss()'));
 run("{const box=earthBossBox();player.x=box.x+10;player.y=box.y-player.h+3;player.previousFeet=box.y;player.vy=200;updateEarthBoss(0);}");assert.equal(run('earthBoss.hp'),5);
 // Real flight hits both directions and cannot tunnel through the boss.
 for(const direction of [-1,1]){
  reset();run(`earthBoss.active=true;earthBoss.stage='giant';earthKnives.slots[0].state='ready';earthKnives.equipped=true;player.x=earthBoss.x-(${direction})*230-player.w/2;player.y=EARTH_ARENA.floor-58;player.facing=${direction};attack()`);
  tick(fps,Math.ceil(.4*fps),'updateEarthKnives');assert.equal(run('earthBoss.hp'),4);assert.equal(run('earthKnives.slots[0].state'),'returning');
  tick(fps,Math.ceil(4.5*fps),'updateEarthKnives');assert.notEqual(run('earthKnives.slots[0].state'),'ready');tick(fps,Math.ceil(.15*fps),'updateEarthKnives');assert.equal(run('earthKnives.slots[0].state'),'ready');
 }
 // A cliff blocks a projectile before the monster behind it.
 reset();run("earthKnives.slots[0].state='ready';earthKnives.equipped=true;earthBoss.active=true;earthBoss.stage='giant';earthBoss.x=6800;player.x=6500;player.y=-1420;player.facing=1;attack()");tick(fps,fps,'updateEarthKnives');assert.equal(run('earthBoss.hp'),5);
 // Knives can strike a tree goblin, once per projectile.
 reset();run("earthKnives.slots[0].state='ready';earthKnives.equipped=true;earthGoblins[0].alive=true;earthGoblins[0].x=earthPlatforms[2].x+120;player.x=earthPlatforms[2].x+20;player.y=earthPlatforms[2].y-58;player.facing=1;attack()");tick(fps,fps,'updateEarthKnives');assert.equal(run('earthGoblins[0].hp'),1);
 // Ordinary play time advances each return; pausing freezes it.
 reset();run("earthKnives.slots[0].state='ready';earthKnives.equipped=true;attack();state='map'");tick(fps,fps);assert.equal(run('earthKnives.slots[0].remaining'),5);
 run("state='playing'");tick(fps,fps*5);assert.equal(run('earthKnives.slots[0].state'),'ready');
 reset();assert(!run('earthKnivesOwned()'));assert(!run('earthKnives.equipped'));assert.equal(run('earthKnives.slots.length'),3);
}
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// WILDWOOD_KNIVES_BEGIN\n')[1].split('\n// WILDWOOD_KNIVES_END')[0],fs.readFileSync('assets/wood-throwing-knives-v1.js','utf8').trimEnd());
console.log('PASS woodland knives: hidden detour and boosted return, max three, independent five-second returns after hits/misses, both directions, blocked cliffs, goblins, giant knife requirement, pause/stow/jump/reset at 30/60/120 FPS on phone and desktop.');
