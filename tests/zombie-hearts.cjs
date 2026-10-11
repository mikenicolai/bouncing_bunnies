const assert=require('node:assert/strict');
const {run}=require('./air.cjs');

for(const [roll,hearts] of [[0,1],[.1999,1],[.2,2],[.5499,2],[.55,3],[.7999,3],[.8,4],[.9499,4],[.95,5],[.9999,5]]){
  assert.equal(run(`rollFireZombieHearts(${roll})`),hearts);
}
run("level='fire';resetGame();soundOn=false");
assert(run('fireZombies.every(z=>Number.isInteger(z.hp)&&z.hp>=1&&z.hp<=5)'));
assert.equal(run('fireZombies.length'),8);

run("level='meadow';resetGame();soundOn=false");
assert.equal(run('enemies.length'),9);
assert(run('enemies.every(e=>(e.hp??1)===1)'));
run('player.x=enemies[0].x-45;player.y=enemies[0].y;player.facing=1;attack()');
assert(!run('enemies[0].alive'),'one hit defeats a First Meadow zombie');
console.log('PASS zombie hearts: weighted whole hearts in Fire, one-hit zombies in First Meadow.');
