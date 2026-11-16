// Original sixteen-bar "Bunny Hop" theme: soft plucks, bass and offbeat chords.
// Synthesized locally; no recording, external music service or audio download.
const GAME_MUSIC={tempo:112,volume:.35,melody:[
  [76,79,81,79,76,null,74,72],[74,76,79,null,76,74,72,null],
  [72,76,81,79,76,null,74,76],[79,76,74,72,69,null,72,null],
  [77,81,84,81,79,77,76,null],[74,77,79,null,77,76,74,null],
  [79,83,86,83,81,79,77,74],[76,74,72,null,79,null,74,null],
  [76,79,84,83,81,79,76,null],[74,76,79,81,79,null,76,74],
  [72,76,81,84,83,81,79,76],[74,76,79,null,76,72,69,null],
  [77,81,84,null,81,79,77,76],[74,77,81,79,77,null,74,null],
  [79,83,86,84,83,81,79,74],[76,79,74,71,72,null,null,null]
],roots:[48,48,45,45,41,41,43,43,48,48,45,45,41,41,43,48]};
let gameAudioBus=null,gameMusicBus=null,gameAudioUnlocked=false,gameAudioForeground=true,gameAudioMuted=null;
let gameMusicStep=0,gameMusicNext=0,gameMusicRunning=false;
const gameMusicVoices=new Set();
function ensureGameAudio(){
  if(audioCtx?.state==='closed'){audioCtx=null;gameAudioBus=null;gameMusicBus=null;gameAudioMuted=null;}
  if(!audioCtx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;try{audioCtx=new Audio();}catch{return null;}}
  if(!gameAudioBus){
    gameAudioBus=audioCtx.createGain();gameAudioBus.gain.value=1;gameAudioBus.connect(audioCtx.destination);
    gameMusicBus=audioCtx.createGain();gameMusicBus.gain.value=GAME_MUSIC.volume;gameMusicBus.connect(gameAudioBus);
    audioCtx.addEventListener?.('statechange',()=>updateGameMusic());
  }
  return audioCtx;
}
function unlockGameAudio(){
  if(!soundOn)return;
  gameAudioUnlocked=true;const context=ensureGameAudio();if(!context)return;
  if(context.state==='suspended'||context.state==='interrupted'){
    try{const pending=context.resume();pending?.then(()=>updateGameMusic()).catch(()=>{});}catch{/* A later gesture can retry. */}
  }
  updateGameMusic();
}
function stopGameMusic(){
  if(!gameMusicRunning&&!gameMusicVoices.size)return;
  gameMusicRunning=false;gameMusicNext=0;
  const now=audioCtx?.currentTime||0;
  for(const voice of gameMusicVoices){
    voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(.0001,now,.006);
    try{voice.osc.stop(now+.025);}catch{/* The voice may already have ended. */}
  }
  gameMusicVoices.clear();
}
function gameMusicNote(midi,when,duration,volume,type='sine'){
  if(!audioCtx||!gameMusicBus)return;
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(midi-69)/12);
  gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(volume,when+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(gain);gain.connect(gameMusicBus);
  const voice={osc,gain};gameMusicVoices.add(voice);
  osc.onended=()=>{gameMusicVoices.delete(voice);osc.disconnect();gain.disconnect();};
  osc.start(when);osc.stop(when+duration+.01);
}
function scheduleGameMusicStep(step,when){
  const bar=Math.floor(step/8)%16,beat=step%8,note=GAME_MUSIC.melody[bar][beat],root=GAME_MUSIC.roots[bar];
  if(note!==null){gameMusicNote(note,when,.23,.065);gameMusicNote(note+12,when,.11,.008,'triangle');}
  if(beat%4===0)gameMusicNote(root+(beat===4?7:0),when,.24,.042,'triangle');
  if(beat%4===2){gameMusicNote(root+12,when,.12,.012,'triangle');gameMusicNote(root+(root===45?15:16),when,.14,.012,'triangle');gameMusicNote(root+19,when,.12,.008,'triangle');}
}
function updateGameMusic(){
  if(!audioCtx||!gameAudioBus)return;
  const muted=!soundOn||!gameAudioForeground||document.hidden||state==='reviveAd',now=audioCtx.currentTime;
  if(gameAudioMuted!==muted){gameAudioBus.gain.cancelScheduledValues(now);gameAudioBus.gain.setTargetAtTime(muted?0:1,now,.012);gameAudioMuted=muted;}
  if(muted||!gameAudioUnlocked||state!=='playing'||audioCtx.state!=='running'){stopGameMusic();return;}
  if(!gameMusicRunning||gameMusicNext<now-.15){gameMusicNext=now+.035;gameMusicRunning=true;}
  const eighth=60/GAME_MUSIC.tempo/2;
  while(gameMusicNext<now+.12){scheduleGameMusicStep(gameMusicStep,gameMusicNext);gameMusicStep=(gameMusicStep+1)%128;gameMusicNext+=eighth;}
}
document.addEventListener('pointerdown',()=>{if(soundOn)unlockGameAudio();},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(!e.repeat&&soundOn)unlockGameAudio();},{capture:true});
window.addEventListener('blur',()=>{gameAudioForeground=false;updateGameMusic();});
window.addEventListener('focus',()=>{gameAudioForeground=true;if(gameAudioUnlocked)unlockGameAudio();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)updateGameMusic();else if(gameAudioUnlocked)unlockGameAudio();});
window.addEventListener('pagehide',()=>{gameAudioForeground=false;updateGameMusic();});
window.addEventListener('pageshow',()=>{gameAudioForeground=true;if(gameAudioUnlocked)unlockGameAudio();});
