// Original painted gold bunny coin, shared by every world and the wallet HUD.
const PAINTED_COIN={asset:'assets/painted-coin-v1.png',width:1283,height:1226,sx:190,sy:154,sw:910,sh:910,image:new Image()};
PAINTED_COIN.image.src=PAINTED_COIN.asset;
function drawPaintedCoin(x,y,r=14,turn=1){
  ctx.save();ctx.translate(x,y);ctx.scale(turn,1);
  const a=PAINTED_COIN;
  if(a.image.complete&&a.image.naturalWidth)ctx.drawImage(a.image,a.sx,a.sy,a.sw,a.sh,-r,-r,r*2,r*2);
  else{ctx.fillStyle=THEME.goldDark;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.fillStyle=THEME.gold;ctx.beginPath();ctx.arc(-r*.12,-r*.12,r*.72,0,7);ctx.fill();}
  ctx.restore();
}
