const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('assets/game-music-v1.js','utf8'),html=fs.readFileSync('index.html','utf8');
assert.equal(html.split('// GAME_MUSIC_BEGIN\n')[1].split('// GAME_MUSIC_END')[0].trim(),source.trim(),'the shipped music matches its source');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BOSS_BROWSER||chromium.executablePath()});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:950},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8772/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof player==='object');
  assert(await page.evaluate(()=>!audioCtx&&!gameMusicRunning),'title does not autoplay or create audio');
  await page.locator('#startButton').click();
  await page.waitForFunction(()=>audioCtx?.state==='running'&&gameMusicRunning&&gameMusicStep>1);
  await page.evaluate(()=>player.invincible=999);
  assert(await page.evaluate(()=>gameMusicBus.gain.value<.5&&gameMusicVoices.size<12),'background volume and active voices are restrained');
  await page.locator('#soundButton').click();
  await page.waitForFunction(()=>!soundOn&&!gameMusicRunning&&gameMusicVoices.size===0&&gameAudioMuted);
  await page.locator('#soundButton').click();await page.waitForFunction(()=>soundOn&&gameMusicRunning);
  await page.evaluate(()=>openWorldMap());await page.waitForFunction(()=>!gameMusicRunning&&gameMusicVoices.size===0);
  await page.locator('#mapSound').click();assert(await page.evaluate(()=>!soundOn));
  await page.locator('#mapSound').click();assert(await page.evaluate(()=>soundOn&&!gameMusicRunning));
  await page.locator('#mapBack').click();await page.waitForFunction(()=>gameMusicRunning);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.waitForFunction(()=>!gameMusicRunning&&gameAudioMuted);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>gameMusicRunning);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>!gameMusicRunning&&gameAudioMuted);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>gameMusicRunning);
  await page.evaluate(()=>audioCtx.suspend());await page.waitForFunction(()=>!gameMusicRunning);
  await page.keyboard.press('Shift');await page.waitForFunction(()=>audioCtx.state==='running'&&gameMusicRunning);
  for(const screen of ['lost','reviveAd']){
   await page.evaluate(s=>{state=s;updateGameMusic();},screen);assert(await page.evaluate(()=>!gameMusicRunning&&gameMusicVoices.size===0));
   if(screen==='reviveAd')await page.waitForFunction(()=>gameAudioMuted);
  }
  await page.evaluate(()=>{state='playing';updateGameMusic();});await page.waitForFunction(()=>gameMusicRunning);
  // A real touch starts/resumes audio on a compact phone layout as well.
  await page.setViewportSize({width:390,height:844});await page.locator('#soundButton').tap();
  assert(await page.evaluate(()=>!soundOn&&!gameMusicRunning));await page.locator('#soundButton').tap();await page.waitForFunction(()=>gameMusicRunning);
  assert.deepEqual(errors,[]);
  // Render the entire original score through the browser's real audio engine.
  const render=await browser.newPage();await render.addScriptTag({content:'let audioCtx;let soundOn=true,state="title";\n'+source});
  const pcm=await render.evaluate(async()=>{
   const rate=22050,eighth=60/GAME_MUSIC.tempo/2,duration=eighth*128+.4;
   audioCtx=new OfflineAudioContext(1,Math.ceil(rate*duration),rate);
   gameAudioBus=audioCtx.createGain();gameAudioBus.connect(audioCtx.destination);
   gameMusicBus=audioCtx.createGain();gameMusicBus.gain.value=GAME_MUSIC.volume;gameMusicBus.connect(gameAudioBus);
   for(let step=0;step<128;step++)scheduleGameMusicStep(step,.02+step*eighth);
   const buffer=await audioCtx.startRendering(),data=buffer.getChannelData(0);let peak=0,power=0,finite=true;
   for(const sample of data){peak=Math.max(peak,Math.abs(sample));power+=sample*sample;finite&&=Number.isFinite(sample);}
   const sections=Array.from({length:16},(_,i)=>{let power=0;const a=Math.floor(i*8*eighth*rate),b=Math.floor((i+1)*8*eighth*rate);for(let j=a;j<b;j++)power+=data[j]*data[j];return Math.sqrt(power/(b-a));});
   return {duration,peak,rms:Math.sqrt(power/data.length),finite,sections,remainingVoices:gameMusicVoices.size};
  });
  assert(pcm.finite&&pcm.peak>.01&&pcm.peak<.15&&pcm.rms>.002&&pcm.rms<.035,'the score is audible, quiet and free of clipping');
  assert(pcm.sections.every(rms=>rms>.002),'all sixteen bars contain audio');assert.equal(pcm.remainingVoices,0,'ended voices disconnect');
  const mute=await render.evaluate(async()=>{
   audioCtx=new OfflineAudioContext(1,44100*1.2,44100);state='title';soundOn=true;gameAudioMuted=null;
   gameAudioBus=audioCtx.createGain();gameAudioBus.connect(audioCtx.destination);
   const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();gain.gain.value=.1;osc.connect(gain);gain.connect(gameAudioBus);osc.start();osc.stop(1.2);
   const off=audioCtx.suspend(.4),on=audioCtx.suspend(.8),rendered=audioCtx.startRendering();
   await off;soundOn=false;updateGameMusic();await audioCtx.resume();
   await on;soundOn=true;updateGameMusic();await audioCtx.resume();
   const data=(await rendered).getChannelData(0),rms=t=>{let power=0;for(let i=Math.floor(t*44100);i<(t+.1)*44100;i++)power+=data[i]*data[i];return Math.sqrt(power/4410);};
   return {before:rms(.1),muted:rms(.6),after:rms(1)};
  });
  assert(mute.before>.05&&mute.muted<.00001&&mute.after>.05,'the shared output actually mutes and restores a sustained sound');
  const unsupported=await browser.newPage();await unsupported.addScriptTag({content:'let audioCtx;let soundOn=true,state="playing";window.AudioContext=undefined;window.webkitAudioContext=undefined;\n'+source});
  assert(await unsupported.evaluate(()=>{unlockGameAudio();updateGameMusic();return !audioCtx&&!gameMusicRunning;}),'unsupported audio is harmless');
  console.log('PASS original music: no autoplay, desktop/touch unlock, Sound/map toggles, menu/death/ad pauses, background mute, interruption recovery, unsupported browser and full-score offline audio render.');
  console.log(JSON.stringify({pcm,mute}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
