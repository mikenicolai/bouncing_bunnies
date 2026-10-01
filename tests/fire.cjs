const assert=require('node:assert/strict');
const {run,reset}=require('./air.cjs');
const fireReset=()=>run("level='fire';resetGame()");
fireReset();
assert.equal(run('WORLD_W'),6900);
assert.equal(run('FIRE_MAZE.x'),4800,'maze is at the end of the journey');
assert.equal(run('FIRE_MAZE.rows.length'),15);
assert.equal(run('FIRE_MAZE.rows[0].length'),25);
assert.equal(run('FIRE_MAZE.tile'),80);
assert.equal(run('fireZombies.filter(z=>z.surface).length'),4);
assert.equal(run('fireZombies.filter(z=>!z.surface).length'),4);
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
for(let r=1;r<14;r++)for(let c=1;c<24;c++)if(rows[r][c]==='.'&&!(c===1&&r===1)&&!(c===23&&r===1))assert(canExit(`${c},${r}`),`alternate path around ${c},${r}`);
assert(run('fireZombies.filter(z=>!z.surface).every(z=>mazeOpen(z.c,z.r))'));
assert(run("fireZombieSheet.src.startsWith('data:image/png;base64,')"));
assert.deepEqual([0,1,2,3].map(phase=>run(`fireZombieFrame({phase:${phase},dizzy:0})`)),[4,5,6,7]);
assert.equal(run('fireZombieFrame({phase:2,dizzy:.5})'),3);
assert.equal(run('fireTreeSheet.src'),'assets/ember-trees-v2.png');
assert.equal(run('fireTreeSpots.length'),9);
// Trees are decorative: walking through trunks or jumping through crowns is safe.
for(let i=0;i<9;i++){
  fireReset();run('fireZombies.forEach(z=>z.alive=false)');
  for(const height of [58,180,260]){
    run(`player.x=fireTreeSpots[${i}].x-player.w/2;player.y=fireTreeSpots[${i}].ground-${height};player.vy=0;update(1/60)`);
    assert.equal(run('state'),'playing',`tree ${i} is harmless at height ${height}`);
    assert.equal(run('lives'),3);
  }
}
assert.equal(run('fireGroundSheet.src'),'assets/ember-ground-v1.png');
// Test the real movement integrator at phone/desktop widths and common frame rates.
for(const width of [480,960])for(const fps of [30,60,120]){
  fireReset();run(`W=${width};keys.add('ArrowRight')`);let hops=0;
  for(let frame=0;frame<fps*20&&run("fireMode==='surface'&&state==='playing'");frame++){
    if(run('player.onGround&&firePlatforms.slice(0,-1).some(p=>player.y+player.h===p.y&&player.x>=p.x+p.w-65&&player.x<p.x+p.w-30)')){run('jump()');hops++;}
    if(run('player.onGround&&fireZombies.some(z=>z.surface&&z.alive&&z.dizzy<=0&&z.x>player.x&&z.x-player.x<78&&Math.abs(z.y-player.y)<30)'))run('attack()');
    run(`update(1/${fps})`);
  }
  assert.equal(run('state'),'playing',`opening survived ${width}/${fps}`);
  assert.equal(hops,5);assert.equal(run('fireMode'),'volcano');
  const lives=run('lives');let startY=run('player.y');
  run('jump()');assert.equal(run('player.vy'),0,'volcano is walked');
  for(let frame=0;frame<fps*10&&run("fireMode==='volcano'");frame++)run(`update(1/${fps})`);
  assert.equal(run('fireMode'),'dropper');assert(run(`player.y<${startY}-1400`));
  assert(run('cameraY < -1000'));assert.equal(run('checkpoint.mode'),'volcano');
  run('keys.clear();jump()');assert(run('player.vy>=0'),'no jumps in crater');
  for(let frame=0;frame<fps*13&&run("fireMode!=='maze'&&state==='playing'");frame++){
    const target=run(`(()=>{const rock=fireDropRocks.find(r=>player.y<r.y+r.h+10);return rock?(rock.x===FIRE_DROPPER.left?(rock.x+rock.w+FIRE_DROPPER.right)/2:(FIRE_DROPPER.left+rock.x)/2):mazeCenter(1,1).x;})()`);
    const x=run('player.x+player.w/2');run('keys.clear()');
    if(Math.abs(target-x)>6)run(`keys.add('${target>x?'ArrowRight':'ArrowLeft'}')`);
    run(`update(1/${fps})`);
  }
  assert.equal(run('fireMode'),'maze',`crater route ${width}/${fps}`);
  assert.equal(run('lives'),lives,'alternating gaps allow a damage-free descent');
  assert.equal(run('checkpoint.mode'),'maze');assert.equal(run('player.mazeC'),1);assert.equal(run('player.mazeR'),1);
  assert(run('cameraY>1400'));assert.equal(run('fireFinished'),false);
}
// A crater collision costs one life and returns to its summit checkpoint.
fireReset();run("fireMode='dropper';checkpoint={x:4650,y:-1108,mode:'volcano',stage:6};player.x=4700;player.y=-430;player.vy=300;update(1/60)");
assert.equal(run('lives'),2);assert.equal(run('fireMode'),'volcano');assert.equal(run('player.y'),-1108);
// Surface zombies notice the bunny, reverse, stay on their platform, and stun.
fireReset();run('player.x=fireZombies[4].x-100;player.y=fireZombies[4].y;updateFireSurfaceZombies(1/60)');
assert(run('fireZombies[4].alert&&fireZombies[4].facing===-1&&Math.abs(fireZombies[4].vx)===52'));
run('player.x=fireZombies[4].x+80;updateFireSurfaceZombies(1/60)');assert.equal(run('fireZombies[4].facing'),1);
run('fireZombies[4].dizzy=1;const stoppedX=fireZombies[4].x;updateFireSurfaceZombies(.1)');assert.equal(run('fireZombies[4].x'),run('stoppedX'));
// Neither an uncollected nor collected coin obstructs surface or maze zombies.
for(const taken of [false,true])for(const fps of [30,60,120]){
  fireReset();
  run(`{const z=fireZombies[4],c=coins[2];c.taken=${taken};z.x=c.x-z.w-15;z.facing=1;player.x=2000;player.y=-1000;}`);
  for(let frame=0;frame<fps*4;frame++)run(`updateFireSurfaceZombies(1/${fps})`);
  assert(run('fireZombies[4].x>coins[2].x+15'),'surface zombie crosses the coin');
  assert.equal(run('coins[2].taken'),taken,'zombie does not collect the coin');
  fireReset();run(`beginFireMaze();{const z=fireZombies[0],c=coins.find(c=>c.x===mazeCenter(5,3).x&&c.y===mazeCenter(5,3).y),p=mazeCenter(4,3);c.taken=${taken};z.c=4;z.r=3;z.x=p.x-z.w/2;z.y=p.y-z.h/2;z.target={c:5,r:3};player.mazeC=7;player.mazeR=3;player.x=mazeCenter(7,3).x-21;player.y=mazeCenter(7,3).y-29;player.invincible=100;}`);
  for(let frame=0;frame<fps*4;frame++)run(`updateFireZombies(1/${fps})`);
  assert(run('fireZombies[0].c>=6'),'maze zombie crosses the coin cell');
  assert.equal(run('coins.find(c=>c.x===mazeCenter(5,3).x&&c.y===mazeCenter(5,3).y).taken'),taken);
}
// Four-way movement, loop routes, slow limited pursuit, and immediate maze win.
fireReset();run('W=960;beginFireMaze();jump()');assert.equal(run('player.vy'),0);
run("keys.add('ArrowDown');update(1/60);keys.clear()");
for(let i=0;i<35;i++)run('update(1/60)');assert.equal(run('player.mazeR'),2);
assert(run('fireZombies.filter(z=>z.alert&&!z.surface).length<=2'));
assert(run('fireZombies.filter(z=>!z.surface).every(z=>!z.target||mazeNeighbors(z.c,z.r).some(([c,r])=>c===z.target.c&&r===z.target.r))'));
let cell={c:1,r:2},down=false,up=false,steps=0;
while(cell.c!==23||cell.r!==1){
  const next=run(`mazeNext({c:${cell.c},r:${cell.r}},{c:23,r:1})`);assert(next);
  const dc=next.c-cell.c,dr=next.r-cell.r;down||=dr>0;up||=dr<0;
  const key=dc>0?'ArrowRight':dc<0?'ArrowLeft':dr>0?'ArrowDown':'ArrowUp';
  run(`keys.add('${key}');update(1/60);keys.clear()`);
  for(let i=0;i<35&&!(run('player.mazeC')===next.c&&run('player.mazeR')===next.r);i++)run('update(1/60)');
  assert.equal(run('player.mazeC'),next.c);assert.equal(run('player.mazeR'),next.r);
  cell=next;assert(++steps<150);
}
assert(down&&up&&steps>35);assert.equal(run('state'),'map');assert(run('fireFinished'));assert(run('lives')>=2);
// The same combat applies to maze and outdoor zombies.
for(const id of [0,4]){
  fireReset();run(`player.x=fireZombies[${id}].x-50;player.y=fireZombies[${id}].y+10;player.facing=1;fireZombies[${id}].hp=4.5;attack()`);
  assert.equal(run(`fireZombies[${id}].hp`),3.5);
  run('player.attackCooldown=0;attack()');assert.equal(run(`fireZombies[${id}].hp`),3.5);
  run(`fireZombies[${id}].dizzy=0;fireZombies[${id}].hp=1;player.attackCooldown=0;attack()`);assert.equal(run(`fireZombies[${id}].alive`),false);
}
reset();console.log('PASS Fire: long opening parkour, outdoor zombies crossing coins and harmless trees, walkable volcano, crater gaps/checkpoint, looping maze and completion.');
