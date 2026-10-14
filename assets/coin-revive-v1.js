// Shared earned-coin wallet and local-only five-second reward simulation.
// Embedded verbatim in index.html; no advertising SDK is loaded.
const COIN_WALLET_KEY='bouncing-bunnies-coin-wallet-v1',REVIVE_PRICE=20,REVIVE_AD_SECONDS=5;
let walletRunStart=0,runCoinsSpent=0;
function resetRunWallet(){walletRunStart=coinWallet;runCoinsSpent=0;}
function walletRunSummary(){return `Start ${walletRunStart} + ${score} − ${runCoinsSpent} spent = ${coinWallet}`;}
let coinWallet=0,revivePending=false,reviveLevel=null,reviveAdEndsAt=0,reviveAdToken=0,reviveAdTimer=null;
function refreshWallet(){document.querySelector('#walletBalance').textContent=`Wallet: ${coinWallet} coins`;}
function restoreCoinWallet(){
  try{
    const raw=window.localStorage?.getItem(COIN_WALLET_KEY),saved=raw?JSON.parse(raw):null;
    if(saved?.version===1&&Number.isSafeInteger(saved.coins)&&saved.coins>=0)coinWallet=saved.coins;
  }catch { /* Keep the session wallet when storage is blocked or invalid. */ }
  refreshWallet();
}
function saveCoinWallet(){
  if(developerRun){refreshWallet();return;}
  try{window.localStorage?.setItem(COIN_WALLET_KEY,JSON.stringify({version:1,coins:coinWallet}));}catch { /* Session play still works. */ }
  refreshWallet();
}
function collectCoin(coin){
  if(coin.taken)return false;
  coin.taken=true;score++;coinWallet=Math.min(Number.MAX_SAFE_INTEGER,coinWallet+1);saveCoinWallet();return true;
}
function cancelRevive(){
  revivePending=false;reviveLevel=null;reviveAdEndsAt=0;reviveAdToken++;
  if(reviveAdTimer!==null&&typeof clearTimeout==='function')clearTimeout(reviveAdTimer);
  reviveAdTimer=null;overlay.classList.remove('revive-mode');
  document.querySelector('#reviveOptions').hidden=true;overlay.querySelector('.controls-copy').hidden=false;
  startButton.disabled=false;document.querySelector('#mapOpen').disabled=false;
}
function refreshReviveOffer(){
  const waiting=state==='reviveAd';
  document.querySelector('#reviveWallet').textContent=`Your wallet: ${coinWallet} coins`;
  document.querySelector('#reviveCoinButton').disabled=waiting||coinWallet<REVIVE_PRICE;
  document.querySelector('#reviveAdButton').disabled=waiting;
  startButton.disabled=waiting;document.querySelector('#mapOpen').disabled=waiting;
  const status=document.querySelector('#reviveAdStatus'),message=waiting?
    `Test ad · ${Math.max(0,Math.ceil((reviveAdEndsAt-performance.now())/1000))} seconds remaining`:
    coinWallet<REVIVE_PRICE?`Need ${REVIVE_PRICE-coinWallet} more coins to buy a heart. Test ad only—no real advertisement.`:
    'Test ad only—no real advertisement.';
  if(status.textContent!==message)status.textContent=message;
}
function resumeWithHearts(hearts){
  if(!revivePending||reviveLevel!==level||!['lost','reviveAd'].includes(state))return false;
  clearInputs();
  Object.assign(player,{x:checkpoint.x,y:checkpoint.y,h:58,vx:0,vy:0,duck:false,duckVisual:0,
    ridingTurtle:false,blueContact:null,airCloud:null,breaching:false,attack:0,attackCooldown:0,jumpAge:9,boosts:0,landingPaint:0,mazeTarget:null});
  player.onGround=platforms.some(p=>p.kind!=='blue'&&Math.abs(p.y-player.y-player.h)<2&&player.x>=p.x&&player.x+player.w<=p.x+p.w);
  bunnyArrows=[];fireArrow.cooldown=0;fireArrow.release=0;
  if(level==='fire')restoreFireCheckpoint();
  else if(level==='water'){
    stopWaterDash();waterTrident.shot=null;waterTrident.cooldown=0;
    player.inWater=!!checkpoint.water;player.air=WATER_AIR;neptunusShots=[];
    if(neptunus.hp>0){neptunus.mode='idle';neptunus.age=0;neptunus.dizzy=1.2;neptunus.cooldown=1.5;}
  }else if(level==='meadow'){
    player.inWater=false;player.air=WATER_AIR;player.stroke=0;
  }else if(level==='final'){
    clearFinalWeaponHazards();if(checkpoint.tower)resetFinalTowerStones();
  }else if(level==='air'){
    tempestWinds=[];tempest.dizzy=1.5;tempest.shotCooldown=Math.max(1.2,tempest.shotCooldown);
    player.airCloud=airPlatforms.find(p=>!p.removed&&p.kind==='white'&&Math.abs(p.y-player.y-player.h)<2&&player.x>=p.x&&player.x<p.x+p.w)||null;
    if(descentStarted)descentBlueReached=false;
  }else if(level==='earth'){
    clearEarthBossHazards();
    if(['small','giant'].includes(earthBoss.stage)){earthBoss.phase='idle';earthBoss.phaseAge=0;earthBoss.cooldown=1.5;earthBoss.dizzy=1;earthBoss.shot=false;}
  }
  player.invincible=3;lives=hearts;
  if(level!=='fire'){
    const view=level==='water'?waterViewSize():{width:W,height:playfieldHeight()};
    cameraX=Math.max(0,Math.min(WORLD_W-view.width,player.x-view.width*.38));
    cameraY=level==='water'&&player.inWater?Math.max(0,player.y-view.height*.5):
      level==='air'||level==='earth'?Math.min(level==='air'?0:72,player.y-view.height*.5):touchDockHeight?phoneGroundCameraY():0;
  }
  cancelRevive();saveWorldProgress();overlay.classList.add('hidden');overlay.inert=true;state='playing';tone(650,.15,'sine',.035);return true;
}
function restartWithHearts(hearts){
  if(!revivePending||reviveLevel!==level||!['lost','reviveAd'].includes(state))return false;
  // Restart this world from its beginning, keeping the wallet and earlier worlds.
  resetGame(true);lives=hearts;player.invincible=3;saveWorldProgress();
  document.querySelector('#worldMap').hidden=true;document.querySelector('#developerMenu').hidden=true;
  overlay.classList.add('hidden');overlay.inert=true;tone(650,.15,'sine',.035);return true;
}
function buyReviveHeart(){
  if(state!=='lost'||!revivePending||reviveLevel!==level||coinWallet<REVIVE_PRICE)return false;
  coinWallet-=REVIVE_PRICE;runCoinsSpent+=REVIVE_PRICE;saveCoinWallet();return resumeWithHearts(1);
}
function finishReviveAd(token){
  if(state!=='reviveAd'||token!==reviveAdToken||performance.now()<reviveAdEndsAt)return false;
  return restartWithHearts(3);
}
function beginReviveAd(){
  if(state!=='lost'||!revivePending||reviveLevel!==level)return false;
  state='reviveAd';clearInputs();reviveAdEndsAt=performance.now()+REVIVE_AD_SECONDS*1000;
  const token=++reviveAdToken;refreshReviveOffer();
  reviveAdTimer=setTimeout(()=>finishReviveAd(token),REVIVE_AD_SECONDS*1000);return true;
}
function updateReviveAd(){if(state==='reviveAd'){refreshReviveOffer();finishReviveAd(reviveAdToken);}}
document.querySelector('#reviveCoinButton').addEventListener('click',buyReviveHeart);
document.querySelector('#reviveAdButton').addEventListener('click',beginReviveAd);
