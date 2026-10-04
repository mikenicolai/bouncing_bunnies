const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {run}=require('./air.cjs');
// Exercise the preview controls and loops against the real game physics, with rendering stubbed.
run('render=()=>{}');let loaded,tick=0;
const frame={addEventListener(event,callback){loaded=callback;},contentWindow:{eval:run,focus(){}},contentDocument:{querySelector(){return {};}}};
const nodes={iframe:frame,'#closeup':{getContext(){return {clearRect(){},drawImage(){}};}},'#animationLabel':{},'#live':{}};
const sandbox={document:{querySelector:selector=>nodes[selector],querySelectorAll:()=>[]},requestAnimationFrame(){},Math};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('previews/labyrinth-arrow-review.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1],sandbox);loaded();
for(const fps of [30,60,120])for(const scene of ['run','carry']){
 vm.runInContext(`show('${scene}')`,sandbox);let airborne=0,landed=0;
 for(let f=0;f<fps*14;f++){tick+=1000/fps;vm.runInContext(`animate(${tick})`,sandbox);if(run('player.onGround'))landed++;else airborne++;}
 assert(airborne>fps&&landed>fps);assert.equal(run('state'),'review');assert.equal(run('lives'),3,'artwork loops must not hurt the bunny');
 assert(!run('fireArrow.aiming'));assert(run('fireArrow.owned'));assert.equal(run('fireMode'),scene==='run'?'king':'secondVolcano');
}
sandbox.document.querySelector('#live').onclick();assert.equal(run('state'),'playing');assert(run('lavaKing.active'),'live fight restores actual hazards');
console.log('PASS animated preview: real four-paw run/jump loops on flat ground and hills at 30/60/120 FPS, safe repetitions, stowed arrow and live encounter.');
