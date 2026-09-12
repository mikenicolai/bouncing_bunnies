const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,place}=require('./air.cjs');
const source=fs.readFileSync('assets/storm-cloud-v1-source.png');
assert.equal(source.readUInt32BE(16),2172);assert.equal(source.readUInt32BE(20),724);assert.equal(source[25],6,'RGBA source');
const html=fs.readFileSync('index.html','utf8');
assert(source.equals(Buffer.from(html.match(/stormSheet.src='data:image\/png;base64,([^']+)'/)[1],'base64')));
assert(!html.includes('__STORM_SHEET_DATA_URL__'));
const phases=[[0,0,'off'],[1.7,1,'warn'],[1.85,2,'warn'],[2.0,3,'warn'],[2.2,4,'warn'],[2.25,5,'on'],[2.31,6,'on'],[2.37,7,'fade'],[2.47,0,'off']];
for(const [t,frame,phase] of phases){
 reset();run(`airTime=${t}+1e-8`);assert.equal(run('stormFrame(storms[0])'),frame);assert.equal(run('stormPhase(storms[0])'),phase);
 for(let j=0;j<3;j++){run(`airTime=${t}+3-storms[${j}].offset+1e-8`);assert.equal(run(`stormFrame(storms[${j}])`),frame);}
}
for(const fps of [30,60,120]){
 let active=0;
 for(let n=0;n<fps*3;n++){
  reset();place(1460,342);run(`airTime=${n/fps};updateAir(0)`);
  const on=run('stormFrame(storms[0])===5||stormFrame(storms[0])===6');
  assert.equal(run('lives'),on?2:3,'damage exactly matches full bolt frames');if(on)active++;
 }
 assert(Math.abs(active/fps-.12)<=1/fps);
 reset();place(1460,342);run('airTime=2.26;updateAir(0)');assert.equal(run('lives'),2);assert(run('particles.length>=10'));
 run('airTime=2.34;updateAir(0)');assert.equal(run('lives'),2,'full strike flicker cannot double hit');
 console.log(`PASS storm damage/120ms window/immunity ${fps} FPS`);
}
// Contact with the cloud itself is harmful in every animation phase.
for(const [t] of phases){reset();place(1450,205,-300);run(`airTime=${t};updateAir(0)`);assert.equal(run('lives'),2);run('updateAir(0)');assert.equal(run('lives'),2);}
reset();place(1380,205);assert(!run('touchesStormCloud(storms[0])'));
assert(!html.slice(html.indexOf('function drawStorm'),html.indexOf('function drawAirWorld')).includes('strokeRect'));
reset();place(1380,342);
run('const stormSounds=[];tone=(frequency)=>stormSounds.push(frequency);storms.forEach(s=>s.offset=0);airTime=1.71;updateAir(0);airTime=2.1;updateAir(0)');
assert.equal(run('stormSounds.filter(f=>f===610).length'),1);
run('airTime=2.26;updateAir(0)');const count=run('particles.length');assert.equal(count,10);
run('airTime=2.34;updateAir(0);airTime=2.42;updateAir(0)');assert.equal(run('particles.length'),count);assert.equal(run('stormSounds.filter(f=>f===90).length'),1);
console.log('PASS storm source alpha/embedding; eight phase boundaries; three hazard offsets; once-only synchronized audio and strike particles.');
