// Defeated enemies drop one wallet coin per starting heart, separate from level coins.
let monsterCoins=[];
function rememberMonsterHearts(enemy){
  if(!Number.isFinite(enemy.rewardHearts))enemy.rewardHearts=Math.max(1,Math.ceil(enemy.maxHP??enemy.hp??1));
}
function dropMonsterReward(enemy,options={}){
  const key=options.key||'defeat';enemy.rewardedStages ||= {};
  if(enemy.rewardedStages[key])return false;
  enemy.rewardedStages[key]=true;
  const count=Math.max(1,Math.ceil(options.hearts??enemy.rewardHearts??enemy.maxHP??1));
  const x=options.x??enemy.x+(enemy.w||0)/2,y=options.y??enemy.y+(enemy.h||0)/2;
  for(let i=0;i<count;i++)monsterCoins.push({x:Number.isFinite(x)?x:player.x+21,y:Number.isFinite(y)?y:player.y+29,
    vx:(i-(count-1)/2)*22,vy:-100-i%3*18,age:0,phase:i*.7});
  return true;
}
function collectMonsterCoin(coin){
  if(coin.taken)return;
  coin.taken=true;runMonsterCoins++;coinWallet=Math.min(Number.MAX_SAFE_INTEGER,coinWallet+1);saveCoinWallet();
}
function bankMonsterRewards(){for(const coin of monsterCoins)collectMonsterCoin(coin);monsterCoins=[];}
function updateMonsterRewards(dt){
  const target={x:player.x+player.w/2,y:player.y+player.h*.55};
  for(const coin of monsterCoins){
    coin.age+=dt;
    if(coin.age<.35){coin.x+=coin.vx*dt;coin.y+=coin.vy*dt;coin.vy+=300*dt;continue;}
    const dx=target.x-coin.x,dy=target.y-coin.y,d=Math.hypot(dx,dy),travel=(500+coin.age*260)*dt;
    if(d<=travel+16){collectMonsterCoin(coin);continue;}
    coin.x+=dx/d*travel;coin.y+=dy/d*travel;
  }
  monsterCoins=monsterCoins.filter(coin=>!coin.taken);
}
function drawMonsterRewards(){
  for(const coin of monsterCoins)drawPaintedCoin(coin.x-cameraX,coin.y,9,.6+.4*Math.abs(Math.sin(coin.age*7+coin.phase)));
}
