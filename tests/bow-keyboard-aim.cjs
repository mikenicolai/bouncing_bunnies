const assert=require('node:assert/strict'),{run}=require('./air.cjs');
const press=(code,repeat=false)=>run(`window.listeners.keydown[1]({code:'${code}',repeat:${repeat},preventDefault(){}})`);
const release=code=>run(`window.listeners.keyup[0]({code:'${code}'})`);
for(const fps of [30,60,120])for(const world of ['meadow','fire','final']){
 run(`beginDeveloperSession();level='${world}';resetGame();soundOn=false;fireArrow.owned=true;player.invincible=99;player.onGround=true;player.y=platforms[0].y-58;`);
 if(world==='fire')run('beginSecondVolcano();player.x=10340;player.y=-558;player.onGround=true;beginLavaKing();lavaKing.dizzy=99;');
 else if(world==='final')run("selectFinalWeapon('bow')");else run('toggleFireAim()');
 assert(run('fireArcheryMode()'));const y=run('player.y'),angle=run('fireArrow.angle');
 press('ArrowUp');for(let i=0;i<fps*.4;i++)run(`update(1/${fps})`);release('ArrowUp');assert(run('fireArrow.angle')>angle);assert.equal(run('player.y'),y);assert(run('player.onGround'));assert.equal(run('player.boosts'),0);
 const high=run('fireArrow.angle');press('ArrowDown');for(let i=0;i<fps*.4;i++)run(`update(1/${fps})`);assert(run('fireArrow.angle')<high);assert.equal(run('player.y'),y);assert(!run('player.duck'));
 // Space must still work with Down held for aiming, including both extra boosts.
 press('Space');release('Space');assert(run('player.vy<0&&!player.onGround'));press('Space',true);assert.equal(run('player.boosts'),0);press('Space');release('Space');press('Space');release('Space');assert.equal(run('player.boosts'),2);
 const vy=run('player.vy');press('ArrowUp');press('KeyW');assert.equal(run('player.vy'),vy);assert.equal(run('player.boosts'),2);release('ArrowUp');release('ArrowDown');release('KeyW');assert(run('fireBunnyArrow()'));
}
for(const world of ['meadow','air','earth','water','fire','final']){
 run(`level='${world}';resetGame();soundOn=false;player.onGround=true;player.inWater=false;player.vy=0;`);press('ArrowUp');press('KeyW');assert.equal(run('player.vy'),0,world+' uses Space as the keyboard jump key');release('ArrowUp');release('KeyW');press('Space');release('Space');assert(run('player.vy<0'));
}
console.log('PASS real keyboard bindings: Up/Down aim without jumping, Space jumps while aiming down, finite extra boosts, air shooting and Space-only jump in every world at 30/60/120 FPS.');
