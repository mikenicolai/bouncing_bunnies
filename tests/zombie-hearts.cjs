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
assert(run('enemies.every((e,i)=>e.h===54&&Math.abs(e.w-39.6)<1e-9&&e.paintHeight===54&&e.y+e.h===enemySpots[i][1]+44)'), 'smaller Meadow bodies keep their original ground anchors');
run('player.x=enemies[0].x;player.y=enemies[0].y-player.h+2;player.previousFeet=enemies[0].y-1;player.vy=100;updateMeadowZombies(0)');
assert(!run('enemies[0].alive'), 'the shorter head still accepts a stomp');
assert.equal(run('player.vy'),-470);
run("level='meadow';resetGame();soundOn=false");
run('player.x=enemies[0].x-45;player.y=enemies[0].y;player.facing=1;attack()');
assert(!run('enemies[0].alive'),'one hit defeats a First Meadow zombie');
console.log('PASS zombie hearts: weighted whole hearts in Fire; 10% smaller, grounded, stompable one-hit zombies in First Meadow.');
