const assert=require('node:assert/strict');
const {run,reset}=require('./air.cjs');

run("level='fire';resetGame()");
assert.equal(run('FIRE_MAZE.rows.length'),15);
assert.equal(run('FIRE_MAZE.rows[0].length'),25);
assert.equal(run('FIRE_MAZE.tile'),80);
assert.equal(run('fireZombies.length'),4);
const rows=Array.from(run('FIRE_MAZE.rows'));
function canExit(blocked){
  const queue=[[1,1]],seen=new Set(['1,1']);
  while(queue.length){
    const [c,r]=queue.shift();if(c===23&&r===1)return true;
    for(const [nc,nr] of [[c+1,r],[c-1,r],[c,r+1],[c,r-1]]){
      const id=`${nc},${nr}`;
      if(rows[nr]?.[nc]==='.'&&id!==blocked&&!seen.has(id)){seen.add(id);queue.push([nc,nr]);}
    }
  }
  return false;
}
assert(canExit(null));
for(let r=1;r<14;r++)for(let c=1;c<24;c++){
  if(rows[r][c]==='.'&&!(c===1&&r===1)&&!(c===23&&r===1))
    assert(canExit(`${c},${r}`),`alternate path around cell ${c},${r}`);
}
assert(run('fireZombies.every(z=>mazeOpen(z.c,z.r))'));
assert(run("fireZombieSheet.src.startsWith('data:image/png;base64,')"));
assert.deepEqual([0,1,2,3].map(phase=>run(`fireZombieFrame({phase:${phase},dizzy:0})`)),[4,5,6,7]);
assert.equal(run('fireZombieFrame({phase:2,dizzy:.5})'),3);

// Walk into the entrance and descend automatically to the first maze cell.
run("player.x=675;keys.add('ArrowRight')");
for(let i=0;i<30&&run('fireMode')==='surface';i++)run('update(1/60)');run('keys.clear()');
assert.equal(run('fireMode'),'entering');
for(let i=0;i<100;i++)run('update(1/60)');
assert.equal(run('fireMode'),'maze');
assert.equal(run('player.mazeC'),1);
assert.equal(run('player.mazeR'),1);
assert(run('cameraY>200'));
const y=run('player.y');run('jump()');assert.equal(run('player.y'),y);assert.equal(run('player.vy'),0);
run("keys.add('ArrowDown');update(1/60);keys.clear()");
assert(run('player.mazeTarget.r===2'));
for(let i=0;i<35;i++)run('update(1/60)');
assert.equal(run('player.mazeR'),2);
assert(run('fireZombies.some(z=>z.alert&&z.walking)'));
assert(run('fireZombies.filter(z=>z.alert).length<=2'));
assert(run('fireZombies.some(z=>!z.alert&&z.walking)'));
assert(run('fireZombies.every(z=>!z.target||mazeNeighbors(z.c,z.r).some(([c,r])=>c===z.target.c&&r===z.target.r))'));

// The route has meaningful downward and upward turns, all made by walking.
let cell={c:1,r:2},down=false,up=false,steps=0;
while(cell.c!==23||cell.r!==1){
  const next=run(`mazeNext({c:${cell.c},r:${cell.r}},{c:23,r:1})`);
  assert(next,`route from ${cell.c},${cell.r}`);
  const dc=next.c-cell.c,dr=next.r-cell.r;
  down||=dr>0;up||=dr<0;
  const key=dc>0?'ArrowRight':dc<0?'ArrowLeft':dr>0?'ArrowDown':'ArrowUp';
  run(`keys.add('${key}');update(1/60);keys.clear()`);
  for(let i=0;i<35&&!(run('player.mazeC')===next.c&&run('player.mazeR')===next.r);i++)run('update(1/60)');
  assert.equal(run('player.mazeC'),next.c);assert.equal(run('player.mazeR'),next.r);
  cell=next;assert(++steps<150);
}
assert(down&&up&&steps>35);
assert.equal(run('fireMode'),'exiting');
for(let i=0;i<100;i++)run('update(1/60)');
assert.equal(run('fireMode'),'exit');assert.equal(run('checkpoint.stage'),1);
assert(run('lives')>=2,'following the route without attacking remains survivable');

// The two outside gaps are ordinary jumps, followed by the portal.
for(let stage=1;stage<3;stage++){
  run(`player.x=firePlatforms[${stage}].x+firePlatforms[${stage}].w-55;player.y=firePlatforms[${stage}].y-58;player.vx=0;player.vy=0;player.onGround=true;keys.clear();jump();keys.add('ArrowRight')`);
  let landed=false;
  for(let i=0;i<180;i++){
    run('update(1/60)');
    if(run(`player.onGround&&player.y+58===firePlatforms[${stage+1}].y`)){landed=true;break;}
  }
  assert(landed,`jump ${stage}`);
  run('keys.clear()');
}
run("player.x=FIRE_EXIT_X-40;player.y=firePlatforms[3].y-58;player.vx=0;player.onGround=true;keys.add('ArrowRight')");
for(let i=0;i<40&&run('state')==='playing';i++)run('update(1/60)');
assert.equal(run('state'),'map');assert(run('fireFinished'));

// A strike still damages and briefly stuns a maze zombie.
run("level='fire';resetGame();fireMode='maze';player.mazeC=1;player.mazeR=1;player.x=fireZombies[0].x-50;player.y=fireZombies[0].y+10;player.facing=1;fireZombies[0].hp=4.5;attack()");
assert.equal(run('fireZombies[0].hp'),3.5);
run('player.attackCooldown=0;attack()');assert.equal(run('fireZombies[0].hp'),3.5);
run('fireZombies[0].dizzy=0;fireZombies[0].hp=1;player.attackCooldown=0;attack()');
assert.equal(run('fireZombies[0].alive'),false);
reset();assert.equal(run('level'),'air');
console.log('PASS expanded Fire maze, alternate routes, limited zombie pursuit, combat, surface jumps, and portal.');
