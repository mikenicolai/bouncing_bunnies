// Raw reach keeps deliberate outer pushes distinct from the clamped aim direction.
const STICK_GESTURE={jump:.88,second:.95,third:.99,release:.6,duck:.9,duckRelease:.82,run:.9,runRelease:.75,dash:1.12,dashRelease:.8};
function joystickTridentEquipped(){
  return waterTrident.owned&&(level==='final'&&finalWeapon==='trident'||level==='water'&&player.inWater&&!player.breaching);
}
function dashFromJoystick(){
  const reach=Math.hypot(joystick.rawX,joystick.rawY);
  if(reach<STICK_GESTURE.dashRelease)joystick.dashArmed=true;
  if(!joystick.active||!joystickTridentEquipped()||reach<STICK_GESTURE.dash)return false;
  // A grounded downward pull is a duck, rather than a dash into the floor.
  if(player.onGround&&joystick.rawY>=STICK_GESTURE.duck&&joystick.rawY>Math.abs(joystick.rawX))return false;
  joystick.jumpArmed=false;joystick.jumpGesture=null;joystick.duck=false;updateDuck();
  if(joystick.dashArmed){
    joystick.dashArmed=false;
    // The stick always dashes; the separate attack button keeps its selected mode.
    const mode=waterTrident.mode;waterTrident.mode='dash';if(!player.duck)fireWaterTrident();waterTrident.mode=mode;
  }
  return true;
}
function jumpFromJoystick(){
  const up=-joystick.rawY;
  if(up<=STICK_GESTURE.release){joystick.jumpArmed=true;joystick.jumpGesture=null;}
  if(up>=STICK_GESTURE.jump&&joystick.jumpArmed){
    joystick.jumpArmed=false;const before=player.vy;jump();
    joystick.jumpGesture=player.vy<before&&player.jumpAge<.52?
      {age:0,sinceTap:0,base:player.boosts,extra:0}:null;
  }
}
function updateJoystickJump(dt){
  const g=joystick.jumpGesture;if(!g)return;
  const up=-joystick.rawY;
  if(player.duck||bunnySwimming()||waterTrident.dash>0||up<STICK_GESTURE.jump||player.jumpAge>=.52||player.vy>=180||player.boosts!==g.base+g.extra){joystick.jumpGesture=null;return;}
  g.age+=dt;
  const requested=up>=STICK_GESTURE.third?2:up>=STICK_GESTURE.second?1:0;
  const extra=Math.min(2-g.base,requested),interval=up>=1.2?.07:.1;
  g.sinceTap+=dt;
  if(g.extra<extra&&g.sinceTap+1e-8>=interval){
    const before=player.boosts;jump();
    if(player.boosts===before){joystick.jumpGesture=null;return;}
    g.extra++;g.sinceTap=Math.max(0,g.sinceTap-interval);
  }else g.sinceTap=Math.min(interval,g.sinceTap);

}
function updateJoystick(p){
  if(state!=='playing'){clearInputs();return;}
  const dx=p.x-JOY.x,dy=p.y-JOY.y,d=Math.hypot(dx,dy)||1,limit=Math.min(JOY.radius-12,d);
  joystick.rawX=dx/(JOY.radius-12);joystick.rawY=dy/(JOY.radius-12);
  joystick.dx=dx/d*limit/(JOY.radius-12);joystick.dy=dy/d*limit/(JOY.radius-12);joystick.motion=true;
  if(Math.abs(joystick.rawX)>=STICK_GESTURE.run)joystick.sprint=true;
  else if(Math.abs(joystick.rawX)<=STICK_GESTURE.runRelease)joystick.sprint=false;
  if(dashFromJoystick())return;
  if((level==='final'||level==='meadow')&&fireArcheryMode()){joystick.duck=false;jumpFromJoystick();return;}
  if(level==='fire'&&fireMode!=='surface'&&!(fireMode==='king'&&lavaKing.defeated)){
    joystick.duck=false;if(fireJumpingMode())jumpFromJoystick();return;
  }
  if(bunnySwimming()){joystick.duck=false;return;}
  if(joystick.rawY>=STICK_GESTURE.duck)joystick.duck=true;
  else if(joystick.rawY<=STICK_GESTURE.duckRelease)joystick.duck=false;
  updateDuck();jumpFromJoystick();
}
