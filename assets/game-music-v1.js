// Original score, synthesized locally. Meadow keeps the original "Bunny Hop" arrangement.
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

// Each row is eight eighth notes. Null is a rest. Roots and thirds define the harmony.
const GAME_SCORE={
  meadow:GAME_MUSIC,
  air:{tempo:118,roots:[55,52,48,50,55,52,48,50],thirds:[4,3,4,4,4,3,4,4],melody:[
    [79,null,83,86,88,null,86,83],[83,81,79,null,76,null,79,null],
    [76,79,84,88,86,null,84,79],[81,null,86,88,90,88,86,null],
    [83,86,91,null,88,86,83,null],[79,null,83,88,86,83,81,79],
    [84,null,88,91,88,null,84,79],[81,86,90,88,86,81,79,null]
  ]},
  water:{tempo:102,roots:[53,50,46,48,53,50,46,48],thirds:[4,3,4,4,4,3,4,4],melody:[
    [77,null,81,null,84,86,84,null],[81,null,77,76,74,null,77,null],
    [77,74,70,null,74,null,77,79],[76,null,79,84,82,79,76,null],
    [81,84,89,null,88,84,81,null],[77,null,81,86,84,81,77,null],
    [82,null,86,89,86,84,82,null],[79,76,74,null,72,null,76,null]
  ]},
  earth:{tempo:120,roots:[48,48,53,55,48,45,53,55],thirds:[4,4,4,4,4,3,4,4],melody:[
    [72,null,76,79,null,81,79,null],[76,79,null,84,81,null,79,76],
    [77,null,81,84,null,86,84,81],[79,81,83,null,86,null,79,null],
    [84,null,79,76,null,79,81,84],[81,84,null,88,84,null,79,76],
    [77,81,null,84,86,null,81,77],[79,null,83,86,83,81,79,null]
  ]},
  fire:{tempo:94,roots:[45,45,41,40,45,48,41,40],thirds:[3,3,4,4,3,4,4,4],melody:[
    [69,null,null,72,71,null,69,null],[64,null,69,null,70,69,null,null],
    [65,null,69,null,72,null,71,null],[68,71,null,68,65,null,64,null],
    [69,null,72,76,null,74,72,null],[67,null,72,null,75,74,72,null],
    [69,null,65,null,72,69,null,null],[71,68,null,65,64,null,68,null]
  ]},
  final:{tempo:88,roots:[45,41,50,40,45,48,41,40],thirds:[3,4,3,4,3,4,4,4],melody:[
    [69,null,null,76,72,null,null,null],[65,null,69,null,72,71,null,null],
    [74,null,null,77,76,null,74,null],[71,null,68,null,64,null,null,null],
    [69,null,72,null,76,81,null,76],[79,null,null,76,72,null,71,null],
    [72,null,69,null,65,69,null,null],[68,null,null,71,64,null,68,null]
  ]},
  boss:{roots:[45,45,41,43,45,41,38,40],thirds:[3,3,4,4,3,4,3,4],melody:[
    [69,null,72,71,69,null,76,74],[72,71,69,null,64,67,69,null],
    [65,null,69,72,77,76,72,null],[67,71,74,null,77,74,71,null],
    [76,null,81,79,76,74,72,71],[72,77,81,79,77,null,72,69],
    [74,null,77,81,84,81,77,74],[76,80,83,80,76,74,71,68]
  ]}
};
const BOSS_MUSIC={
  air:{shift:5,tempo:140},water:{shift:-2,tempo:128},earth:{shift:3,tempo:144},
  fire:{shift:0,tempo:126},final:{shift:-5,tempo:120}
};
const gameMusicTempo=(cue,world)=>cue==='boss'?BOSS_MUSIC[world].tempo:GAME_SCORE[cue].tempo;
let gameAudioBus=null,gameMusicBus=null,gameAudioUnlocked=false,gameAudioForeground=true,gameAudioMuted=null;
let gameMusicStep=0,gameMusicNext=0,gameMusicRunning=false;
let gameMusicWorld=null,gameMusicCue=null,gameMusicExplorationStep=0;
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
const musicFrequency=midi=>440*Math.pow(2,(midi-69)/12);
function gameMusicNote(midi,when,duration,volume,type='sine',shape={}){
  if(!audioCtx||!gameMusicBus)return;
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
  osc.type=type;
  osc.frequency.value=musicFrequency(midi);
  if(shape.slide!==undefined){
    osc.frequency.setValueAtTime(musicFrequency(midi),when);
    osc.frequency.exponentialRampToValueAtTime(musicFrequency(shape.slide),when+duration*.75);
  }
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.linearRampToValueAtTime(volume,when+(shape.attack??.008));
  let filter;
  if(shape.formant){
    filter=audioCtx.createBiquadFilter();
    filter.type='bandpass';filter.frequency.value=shape.formant;filter.Q.value=1.25;
    osc.connect(filter);filter.connect(gain);
  }else osc.connect(gain);
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  gain.connect(gameMusicBus);
  const voice={osc,gain};gameMusicVoices.add(voice);
  osc.onended=()=>{gameMusicVoices.delete(voice);osc.disconnect();filter?.disconnect();gain.disconnect();};
  osc.start(when);osc.stop(when+duration+.01);
}

function scheduleMeadowMusic(step,when){
  const bar=Math.floor(step/8)%16,beat=step%8,note=GAME_MUSIC.melody[bar][beat],root=GAME_MUSIC.roots[bar];
  if(note!==null){gameMusicNote(note,when,.23,.065);gameMusicNote(note+12,when,.11,.008,'triangle');}
  if(beat%4===0)gameMusicNote(root+(beat===4?7:0),when,.24,.042,'triangle');
  if(beat%4===2){gameMusicNote(root+12,when,.12,.012,'triangle');gameMusicNote(root+(root===45?15:16),when,.14,.012,'triangle');gameMusicNote(root+19,when,.12,.008,'triangle');}
}

// A short call and a higher reply, placed in gaps in the jungle melody.
function scheduleJungleCall(when,reply){
  const start=reply?67:61;
  gameMusicNote(start,when,.16,.075,'sawtooth',{slide:start+5,formant:680,attack:.023});
  gameMusicNote(start+3,when+.16,.14,.09,'sawtooth',{slide:start-1,formant:980,attack:.016});
  if(!reply)gameMusicNote(start+7,when+.32,.21,.08,'sawtooth',{slide:start+1,formant:1350,attack:.016});
}

function scheduleGameMusicStep(step,when,cue='meadow',world=cue){
  if(cue==='meadow'){scheduleMeadowMusic(step,when);return;}
  const score=GAME_SCORE[cue],bar=Math.floor(step/8),beat=step%8;
  const boss=cue==='boss',dark=cue==='fire'||cue==='final';
  const shift=boss?BOSS_MUSIC[world].shift:0;
  const root=score.roots[bar]+shift,third=score.thirds[bar],note=score.melody[bar][beat];
  const shortPluck=boss||cue==='earth';
  if(note!==null){
    const bell=cue==='air'||cue==='water';
    const noteLength=shortPluck ? .16 : dark ? .32 : .29;
    gameMusicNote(note+shift,when,noteLength,.061,boss||dark?'triangle':'sine');
    if(bell)gameMusicNote(note+shift+(cue==='air'?12:19),when,.13,.009,'sine');
    if(cue==='water')gameMusicNote(note-12,when+.135,.26,.012,'sine');
  }
  if(boss){
    gameMusicNote(root-12+(beat===3||beat===7?7:0),when,.16,beat%4===0?.058:.026,'triangle');
    if(beat%2===0)gameMusicNote(41,when,.13,.05,'sine',{slide:29});
    if(beat===2||beat===6)gameMusicNote(71,when,.085,.028,'triangle',{slide:45});
  }else if(dark){
    if(beat===0||beat===4){
      const bass=root-12+(beat===4?7:0);
      gameMusicNote(bass,when,.49,.062,'triangle',{attack:.034});
      gameMusicNote(bass+12,when,.38,.024,'sine',{attack:.03});
    }
    if(cue==='fire'&&(beat===3||beat===6))gameMusicNote(43,when,.17,.04,'sine',{slide:30});
    if(cue==='final'&&beat===0)gameMusicNote(root+19,when,.75,.016,'sine',{attack:.06});
  }else{
    if(beat%4===0)gameMusicNote(beat===0?root:root-5,when,.22,.043,'triangle');
    if(cue==='earth'){
      if([0,3,4,7].includes(beat))gameMusicNote(55,when,.12,.05,'sine',{slide:37});
      if(beat===2||beat===6)gameMusicNote(82,when,.075,.028,'triangle',{slide:58});
      if(beat===5&&(bar===1||bar===5))scheduleJungleCall(when,bar===5);
    }
  }
  const chordBeat=dark ? 0 : boss ? 4 : 2;
  if(beat===chordBeat){
    const length=dark ? .65 : boss ? .16 : .23;
    gameMusicNote(root+12+third,when,length,.020,'triangle');
    gameMusicNote(root+19,when,length,.016,'sine');
  }
}

function isGameBossFight(world){
  switch(world){
    case 'air': return bossAwake&&!descentStarted&&tempest.hp>0&&player.x>4690&&player.y<AIR_SUMMIT_OFFSET+490;
    case 'water': return neptunus.active&&neptunus.hp>0&&player.x>=WATER_ARENA.left-180;
    case 'earth': return earthBoss.active&&earthBoss.stage!=='defeat'&&earthBoss.stage!=='done';
    case 'fire': return fireMode==='king'&&lavaKing.active&&!lavaKing.defeated;
    case 'final': return finalChapter==='knight'&&!finalKnight.defeated;
    default: return false;
  }
}

function selectGameMusic(){
  const world=Object.hasOwn(GAME_SCORE,level)&&level!=='boss'?level:'meadow';
  const cue=isGameBossFight(world)?'boss':world;
  if(gameMusicWorld===world&&gameMusicCue===cue)return;
  stopGameMusic();
  if(gameMusicWorld!==world)gameMusicExplorationStep=0;
  else if(cue==='boss')gameMusicExplorationStep=gameMusicStep;
  gameMusicWorld=world;
  gameMusicCue=cue;
  gameMusicStep=cue==='boss'?0:gameMusicExplorationStep;
}

function updateGameMusic(){
  if(!audioCtx||!gameAudioBus)return;
  const muted=!soundOn||!gameAudioForeground||document.hidden||state==='reviveAd',now=audioCtx.currentTime;
  if(gameAudioMuted!==muted){gameAudioBus.gain.cancelScheduledValues(now);gameAudioBus.gain.setTargetAtTime(muted?0:1,now,.012);gameAudioMuted=muted;}
  if(muted||!gameAudioUnlocked||state!=='playing'||audioCtx.state!=='running'){stopGameMusic();return;}
  selectGameMusic();
  if(!gameMusicRunning||gameMusicNext<now-.15){gameMusicNext=now+.035;gameMusicRunning=true;}
  const score=GAME_SCORE[gameMusicCue],eighth=30/gameMusicTempo(gameMusicCue,gameMusicWorld);
  while(gameMusicNext<now+.12){
    scheduleGameMusicStep(gameMusicStep,gameMusicNext,gameMusicCue,gameMusicWorld);
    gameMusicStep=(gameMusicStep+1)%(score.melody.length*8);
    gameMusicNext+=eighth;
  }
}
document.addEventListener('pointerdown',()=>{if(soundOn)unlockGameAudio();},{capture:true,passive:true});
document.addEventListener('click',()=>{if(soundOn&&audioCtx?.state!=='running')unlockGameAudio();},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(!e.repeat&&soundOn)unlockGameAudio();},{capture:true});
window.addEventListener('blur',()=>{gameAudioForeground=false;updateGameMusic();});
window.addEventListener('focus',()=>{gameAudioForeground=true;if(gameAudioUnlocked)unlockGameAudio();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)updateGameMusic();else if(gameAudioUnlocked)unlockGameAudio();});
window.addEventListener('pagehide',()=>{gameAudioForeground=false;updateGameMusic();});
window.addEventListener('pageshow',()=>{gameAudioForeground=true;if(gameAudioUnlocked)unlockGameAudio();});
