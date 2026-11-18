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
  const encounters=await page.evaluate(()=>{
   const snapshots=[];
   const hear=label=>{updateGameMusic();snapshots.push([label,gameMusicCue,gameMusicTempo(gameMusicCue,gameMusicWorld)]);};
   for(const world of ['air','water','earth','fire','final']){
    level=world;resetGame();player.invincible=999;hear(world);
    switch(world){
     case 'air': player.x=5100;player.y=AIR_SUMMIT_OFFSET+300;updateAir(0);break;
     case 'water': player.x=WATER_ARENA.left+300;player.y=1100;updateNeptunus(0);break;
     case 'earth': player.x=EARTH_ARENA.left+30;player.y=EARTH_ARENA.floor-player.h;updateEarthBoss(0);break;
     case 'fire': beginLavaKing();break;
     case 'final': enterFinalKnightRoom();break;
    }
    hear(world+' fight');
    if(world==='earth'){
     earthBoss.stage='rebuild';earthBoss.hp=0;hear('earth rebuild');
     openWorldMap();updateGameMusic();snapshots.push(['boss paused',gameMusicRunning,gameMusicVoices.size]);
     document.querySelector('#mapBack').click();hear('earth resumed');
    }
    if(world==='air'||world==='water'){
     player.x=world==='air'?4100:WATER_ARENA.left-200;hear(world+' retreat');
     player.x=world==='air'?5100:WATER_ARENA.left+300;hear(world+' return');
    }
    switch(world){
     case 'air': tempest.hp=0;break;
     case 'water': neptunus.hp=0;break;
     case 'earth': earthBoss.stage='defeat';break;
     case 'fire': defeatLavaKing();break;
     case 'final': finalKnight.defeated=true;break;
    }
    hear(world+' clear');
   }
   gameMusicStep=GAME_SCORE.final.melody.length*8-1;gameMusicNext=audioCtx.currentTime+.045;
   updateGameMusic();snapshots.push(['loop wraps',gameMusicStep]);
   return snapshots;
  });
  assert.deepEqual(encounters,[
   ['air','air',118],['air fight','boss',140],['air retreat','air',118],['air return','boss',140],['air clear','air',118],
   ['water','water',102],['water fight','boss',128],['water retreat','water',102],['water return','boss',128],['water clear','water',102],
   ['earth','earth',120],['earth fight','boss',144],['earth rebuild','boss',144],['boss paused',false,0],['earth resumed','boss',144],['earth clear','earth',120],
   ['fire','fire',94],['fire fight','boss',126],['fire clear','fire',94],
   ['final','final',88],['final fight','boss',120],['final clear','final',88],['loop wraps',0]
  ]);
  assert.deepEqual(errors,[]);
  // Render every arrangement through the browser's audio engine.
  const render=await browser.newPage();await render.addScriptTag({content:'let audioCtx;let soundOn=true,state="title";\n'+source});
  const mixes=await render.evaluate(async()=>{
   const results=[];
   const themes=Object.keys(GAME_SCORE).filter(cue=>cue!=='boss').map(cue=>[cue,cue]);
   const battles=Object.keys(BOSS_MUSIC).map(world=>['boss',world]);
   async function record(cue,world,jungleCall=false){
    const score=GAME_SCORE[cue],steps=score.melody.length*8;
    const rate=22050,eighth=30/gameMusicTempo(cue,world),duration=jungleCall?1:eighth*steps+.4;
    audioCtx=new OfflineAudioContext(1,Math.ceil(rate*duration),rate);
    gameAudioBus=audioCtx.createGain();gameAudioBus.connect(audioCtx.destination);
    gameMusicBus=audioCtx.createGain();gameMusicBus.gain.value=GAME_MUSIC.volume;gameMusicBus.connect(gameAudioBus);
    if(jungleCall)scheduleJungleCall(.02,false);
    else for(let step=0;step<steps;step++)scheduleGameMusicStep(step,.02+step*eighth,cue,world);
    const buffer=await audioCtx.startRendering(),data=buffer.getChannelData(0);let peak=0,power=0,finite=true;
    for(const sample of data){peak=Math.max(peak,Math.abs(sample));power+=sample*sample;finite&&=Number.isFinite(sample);}
    return {name:jungleCall?'monkey call':cue===world?cue:world+' boss',peak,rms:Math.sqrt(power/data.length),finite,remainingVoices:gameMusicVoices.size};
   }
   for(const [cue,world] of [...themes,...battles])results.push(await record(cue,world));
   results.push(await record('earth','earth',true));
   return results;
  });
  for(const mix of mixes){
   assert(mix.finite&&mix.peak>.005&&mix.peak<.15&&mix.rms>.001&&mix.rms<.035,JSON.stringify(mix));
   assert.equal(mix.remainingVoices,0,`${mix.name} disconnects ended voices`);
  }
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
  console.log('PASS music: desktop/touch playback, pause and mute, all five boss transitions, retreat, loop wrap, and rendered themes, fights and jungle call.');
  console.log(JSON.stringify({mixes,mute}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
