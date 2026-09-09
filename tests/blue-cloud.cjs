const assert=require('node:assert/strict');
const {run,reset,place}=require('./air.cjs');
for(const fps of [30,60,120]){
 const tick=()=>run(`update(1/${fps})`);
 const land=(x=300,y=275)=>{reset();place(x,y,100);for(let i=0;i<fps&&!run('!!player.blueContact');i++)tick();assert(run('!!player.blueContact'));};
 reset();place(300,370,-570);for(let i=0;i<fps*.3;i++)tick();assert(run('player.y+player.h<335 && player.vy<0 && !player.blueContact'));
 land();let feet=run('player.y+player.h');
 for(let i=0;i<fps*1.7;i++){tick();const next=run('player.y+player.h');assert(next>=feet-1e-7,'sink must be monotonic');assert(!run('player.onGround'),'no repeated grounding');feet=next;}
 assert(run('!player.blueContact && player.y+player.h>395'));
 for(let i=0;i<fps;i++)tick();assert.equal(run('player.y+player.h'),480);assert.equal(run('lives'),3);
 land();for(let i=0;i<fps*.7;i++)tick();run('jump()');assert(run('player.vy===-570 && !player.blueContact'));for(let i=0;i<fps/5;i++)tick();assert(run('player.y+player.h<335'));
 land();run("keys.add('ArrowDown');keys.add('ArrowRight')");for(let i=0;i<fps;i++)tick();assert(run('player.h===18 && player.y+player.h>365'),'duck and movement cannot hold cloud');
 land(1960,150);for(let i=0;i<fps*4;i++)tick();assert.equal(run('lives'),2,'later blue drops into void');assert(run('!player.blueContact'));
 console.log(`PASS blue sinking/pass-through/escape/no-jitter/recovery/death/input ${fps} FPS`);
}
