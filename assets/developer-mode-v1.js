// Set false in a production build to remove the hidden map shortcut and test entry points.
const DEVELOPER_TOOLS_ENABLED=true;
let developerRun=false,developerWalletBefore=null,developerStartedLevel=false;
function beginDeveloperSession(){
  if(!DEVELOPER_TOOLS_ENABLED)return false;
  if(!developerRun){bankMonsterRewards();developerWalletBefore=coinWallet;developerStartedLevel=false;developerRun=true;}
  return true;
}
function openDeveloperMenu(){
  if(!DEVELOPER_TOOLS_ENABLED||state!=='map')return false;
  state='developer';clearInputs();
  document.querySelector('#worldMap').hidden=true;document.querySelector('#developerMenu').hidden=false;
  document.querySelector('#developerBuild').textContent=`v${BUILD_INFO.version} · Build ${BUILD_INFO.build} · Built ${BUILD_INFO.builtLabel} · ${BUILD_INFO.deployment}`;
  document.querySelector('#developerCoins').value=String(Math.min(1000,coinWallet));
  document.querySelector('#developerStatus').textContent=developerRun?`Test wallet: ${coinWallet} coins`:'Normal saves stay unchanged.';
  document.querySelector('#developerHeading').focus();return true;
}
function setDeveloperCoins(value){
  if(state!=='developer'||!DEVELOPER_TOOLS_ENABLED)return false;
  const amount=Number(value);
  if(String(value).trim()===''||!Number.isInteger(amount)||amount<0||amount>1000){
    document.querySelector('#developerStatus').textContent='Enter a whole number from 0 to 1,000.';return false;
  }
  beginDeveloperSession();coinWallet=amount;refreshWallet();
  document.querySelector('#developerCoins').value=String(amount);
  document.querySelector('#developerStatus').textContent=`Test wallet: ${amount} coins. Normal wallet unchanged.`;return true;
}
function launchDeveloperWorld(world){
  if(state!=='developer'||!DEVELOPER_TOOLS_ENABLED||!PROGRESSION_ORDER.includes(world))return false;
  beginDeveloperSession();developerStartedLevel=true;level=world;
  document.querySelector('#developerMenu').hidden=true;start();
  if(world==='final')finalGateLift=1;
  return true;
}
function exitDeveloperMode(){
  if(state!=='developer')return false;
  const restartNormal=developerStartedLevel;
  if(developerRun){coinWallet=developerWalletBefore;refreshWallet();}
  developerRun=false;developerWalletBefore=null;developerStartedLevel=false;
  document.querySelector('#developerMenu').hidden=true;
  if(restartNormal){level=nextWorld();resetGame(false);openWorldMap();}
  else{state='map';document.querySelector('#worldMap').hidden=false;}
  document.querySelector('#mapHeading').focus();return true;
}
document.querySelectorAll('[data-dev-world]').forEach(button=>button.addEventListener('click',()=>launchDeveloperWorld(button.dataset.devWorld)));
document.querySelector('#developerWalletForm').addEventListener('submit',event=>{event.preventDefault();setDeveloperCoins(document.querySelector('#developerCoins').value);});
document.querySelector('#developerCoins100').addEventListener('click',()=>setDeveloperCoins(100));
document.querySelector('#developerCoins1000').addEventListener('click',()=>setDeveloperCoins(1000));
document.querySelector('#developerExit').addEventListener('click',exitDeveloperMode);
