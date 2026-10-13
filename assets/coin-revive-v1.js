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
function restartWithHearts(hearts){
  if(!revivePending||reviveLevel!==level||!['lost','reviveAd'].includes(state))return false;
  // Restart this world from its beginning, keeping the wallet and earlier worlds.
  resetGame(true);lives=hearts;player.invincible=3;saveWorldProgress();
  document.querySelector('#worldMap').hidden=true;document.querySelector('#developerMenu').hidden=true;
  overlay.classList.add('hidden');overlay.inert=true;tone(650,.15,'sine',.035);return true;
}
function buyReviveHeart(){
  if(state!=='lost'||!revivePending||reviveLevel!==level||coinWallet<REVIVE_PRICE)return false;
  coinWallet-=REVIVE_PRICE;runCoinsSpent+=REVIVE_PRICE;saveCoinWallet();return restartWithHearts(1);
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
