const assert=require('node:assert/strict'),{run}=require('./air.cjs');
function setup(world){
 run(`beginDeveloperSession();level='${world==='king'||world==='volcano'?'fire':world}';resetGame();soundOn=false;fireArrow.owned=true;player.invincible=999;player.onGround=true;player.y=platforms[0].y-58;`);
 if(['king','volcano'].includes(world))run("beginSecondVolcano();player.x=10340;player.y=FIRE_KING_ARENA.y-58;player.onGround=true;lavaKing.dizzy=999;"+(world==='king'?'beginLavaKing();':'toggleFireAim();'));
 else if(world==='final')run("selectFinalWeapon('bow')");else run('toggleFireAim()');
 run('fitTouchControls();joystick.active=true;joystick.pointerId=8;');assert(run('fireArcheryMode()'));
}
const pull=(x,y)=>run(`updateJoystick({x:JOY.x+${x}*(JOY.radius-12),y:JOY.y+${y}*(JOY.radius-12)})`);
const button=()=>run("canvas.listeners.pointerdown[0]({clientX:ACTIONS.jump.x,clientY:ACTIONS.jump.y,pointerId:99,preventDefault(){}})");
for(const fps of [30,60,120])for(const world of ['king','volcano','meadow','final']){
 const tick=seconds=>{for(let f=0;f<Math.round(fps*seconds);f++)run(`update(1/${fps})`);};
 setup(world);const y=run('player.y'),angle=run('fireArrow.angle');
 pull(0,-1.35);tick(.35);assert(run('player.onGround&&player.y=== '+y+'&&player.boosts===0&&!joystick.jumpGesture'),'strong upward bow aim cannot jump at '+world+'/'+fps);assert(run('fireArrow.angle')>angle);
 const high=run('fireArrow.angle');pull(0,1.35);tick(.35);assert(run('fireArrow.angle')<high);assert(run('player.onGround&&!player.duck&&player.h===58'),'down aims without ducking');
 const x=run('player.x');pull(1,-1.25);tick(.25);assert(run('player.x')>x+10);assert(run('player.onGround&&player.boosts===0'),'diagonal movement still aims without jumping');
 // Keep the stick held up while the real left Jump button is pressed.
 pull(0,-1.35);button();assert(run('player.vy<0&&!player.onGround'));tick(.25);assert.equal(run('player.boosts'),0,'held aim does not add automatic boosts to a button jump');
 button();button();assert.equal(run('player.boosts'),2,'separate Jump button retains limited boost taps');
 // Drawing the bow halfway through a held jump cancels pending extra taps.
 setup(world);run('fireArrow.aiming=false');pull(0,0);pull(0,-1.35);assert(run('joystick.jumpGesture'));run('fireArrow.aiming=true');tick(.3);assert.equal(run('player.boosts'),0);assert.equal(run('joystick.jumpGesture'),null);
 // Stowing does not turn the existing aim hold into a jump. A fresh gesture works.
 setup(world);pull(0,-1.35);run('fireArrow.aiming=false');pull(.1,-1.35);assert(run('player.onGround'));pull(0,0);pull(0,-1.35);assert(run('player.vy<0&&!player.onGround'));
}
console.log('PASS bow joystick: aim-only strong/held/diagonal pushes, horizontal movement, no down duck, independent left-button jumps/boosts, queued-jump cancellation and normal stowed jumps across Fire boss/volcano, Meadow and Castle at 30/60/120 FPS.');
