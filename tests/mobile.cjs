const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,place,step}=require('./air.cjs');
const pull=(x,y)=>run(`updateJoystick({x:JOY.x+${x}*(JOY.radius-12),y:JOY.y+${y}*(JOY.radius-12)})`);
reset();place(100,382);step(2);pull(.7,-.7);assert.equal(run('player.vy'),-570);assert(run('joystick.dx>.6'));
pull(.7,-.7);assert.equal(run('player.boosts'),0);pull(0,-.4);pull(0,-1);assert.equal(run('player.boosts'),0);
pull(0,0);pull(0,-1);assert.equal(run('player.boosts'),1);pull(0,0);pull(0,-1);assert.equal(run('player.boosts'),2);pull(0,0);pull(0,-1);assert.equal(run('player.boosts'),2);
reset();place(100,382);step(2);pull(.7,.7);assert.equal(run('player.h'),18);assert(run('joystick.dx>.6'));assert.equal(run('player.y+player.h'),440);
pull(.5,.35);assert(run('joystick.duck'));pull(.5,.2);assert(!run('joystick.duck'));assert.equal(run('player.h'),58);
run('duckPointer=9');pull(0,1);pull(0,0);assert.equal(run('player.h'),18,'separate duck remains held');run('releaseJoystick({pointerId:9})');assert.equal(run('player.h'),58);
for(const event of ['pointercancel','lostpointercapture','pointerup']){
 run('joystick.active=true;joystick.pointerId=8');pull(0,1);run(`canvas.listeners['${event}'][0]({pointerId:8})`);assert(run('!joystick.duck && !joystick.active && joystick.jumpArmed && player.h===58'));
}
for(const action of ["window.listeners.blur[0]()","document.querySelector('document').listeners.visibilitychange[0]()","clearInputs()","resetGame()","openWorldMap()","showEnd(false)"]){reset();pull(0,1);run(action);assert(run('!joystick.duck && !joystick.active && joystick.dy===0 && duckPointer===null'));}
reset();pull(0,1);place(1000,700);step();assert(run('!joystick.duck && joystick.jumpArmed'));
const html=fs.readFileSync('index.html','utf8');assert(html.includes('viewport-fit=cover'));assert(html.includes('apple-mobile-web-app-capable'));
assert(run("document.querySelector('#buildInfo').textContent.includes('GitHub Pages release — 12 September 2026, 10:43 Europe/Brussels')"));assert.equal(run('BUILD_INFO.build'),2026091203);assert.equal(run('BUILD_INFO.version'),'0.4.0');assert.equal(run('BUILD_INFO.builtAt'),'2026-09-12T10:43:16+02:00');
// Model CSS fallback geometry, visual viewport changes and scroll restoration.
run(`
const styles=new Map(),classes=new Set();
gameFrame.style.setProperty=(k,v)=>styles.set(k,v);
gameFrame.classList.contains=k=>classes.has(k);gameFrame.classList.toggle=(k,on)=>on?classes.add(k):classes.delete(k);
getComputedStyle=()=>({paddingLeft:'10',paddingRight:'10',paddingTop:'20',paddingBottom:'20'});
window.innerWidth=390;window.innerHeight=844;window.scrollY=125;
window.visualViewport={width:390,height:700,offsetLeft:0,offsetTop:3};
Object.defineProperty(gameFrame,'clientWidth',{get:()=>Number.parseFloat(styles.get('--viewport-width'))});
Object.defineProperty(gameFrame,'clientHeight',{get:()=>Number.parseFloat(styles.get('--viewport-height'))});
window.scrollTo=(x,y)=>window.restoredY=y;
fallbackFullscreen=true;syncFullscreen();
`);
assert.equal(run("styles.get('--viewport-height')"),'700px');assert.equal(run("styles.get('--expanded-canvas-width')"),'370px');
run('window.visualViewport.width=844;window.visualViewport.height=390;fitExpandedCanvas()');assert(Math.abs(parseFloat(run("styles.get('--expanded-canvas-width')"))-350*16/9)<.001);
run('fallbackFullscreen=false;syncFullscreen()');assert.equal(run('window.restoredY'),125);assert(!run("classes.has('expanded')"));
run("window.navigator={standalone:true,userAgent:'iPhone'}");assert(run('standaloneMode()'));run('fallbackFullscreen=standaloneMode();syncFullscreen()');assert(run("classes.has('expanded')"));assert(run("document.querySelector('#iphoneHint').hidden"));
run('fallbackFullscreen=false;document.fullscreenElement=gameFrame;syncFullscreen()');assert(run("classes.has('expanded')"));run('document.fullscreenElement=null;syncFullscreen()');assert(!run("classes.has('expanded')"));
run('window.visualViewport.width=390;window.visualViewport.height=844;fitGameViewport()');assert.equal(run('W'),480);assert(run('H>900'));assert(run('JOY.y>700 && ACTIONS.jump.y>700'));
run('window.visualViewport.width=844;window.visualViewport.height=390;fitGameViewport()');assert.equal(run('W'),960);assert.equal(run('H'),540);assert.equal(run('JOY.y'),446);
console.log('PASS mobile controls, portrait canvas/camera/control layout, orientation, fullscreen state and build metadata.');
