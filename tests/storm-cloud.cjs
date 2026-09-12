const assert=require('node:assert/strict'),fs=require('node:fs');
const {run,reset,place}=require('./air.cjs');
const source=fs.readFileSync('assets/storm-cloud-v1-source.png');
assert.equal(source.readUInt32BE(16),2172);assert.equal(source.readUInt32BE(20),724);assert.equal(source[25],6,'RGBA source');
const html=fs.readFileSync('index.html','utf8');
assert(source.equals(Buffer.from(html.match(/stormSheet.src='data:image\/png;base64,([^']+)'/)[1],'base64')));
assert(!html.includes('__STORM_SHEET_DATA_URL__'));
const phases=[[0,0,'off'],[2.7,1,'warn'],[2.95,2,'warn'],[3.15,3,'warn'],[3.45,4,'warn'],[3.5,5,'on'],[3.59,6,'on'],[3.68,7,'fade'],[3.8,0,'off']];
for(const [t,frame,phase] of phases){
 reset();run(`airTime=${t}+1e-8`);assert.equal(run('stormFrame(storms[0])'),frame);assert.equal(run('stormPhase(storms[0])'),phase);
 for(let j=0;j<3;j++){run(`airTime=${t}+4.8-storms[${j}].offset+1e-8`);assert.equal(run(`stormFrame(storms[${j}])`),frame);}
}
for(const fps of [30,60,120]){
 let active=0;
 for(let n=0;n<fps*4.8;n++){
  reset();place(1460,342);run(`airTime=${n/fps};updateAir(0)`);
  const on=run('stormFrame(storms[0])===5||stormFrame(storms[0])===6');
  assert.equal(run('lives'),on?2:3,'damage exactly matches full bolt frames');if(on)active++;
 }
 assert(Math.abs(active/fps-.18)<=1/fps);
 reset();place(1460,342);run('airTime=3.51;updateAir(0)');assert.equal(run('lives'),2);assert(run('particles.length>=10'));
 run('airTime=3.62;updateAir(0)');assert.equal(run('lives'),2,'full strike flicker cannot double hit');
 console.log(`PASS storm damage/180ms window/immunity ${fps} FPS`);
}
reset();place(1380,342);
run('const stormSounds=[];tone=(frequency)=>stormSounds.push(frequency);storms.forEach(s=>s.offset=0);airTime=2.71;updateAir(0);airTime=3.3;updateAir(0)');
assert.equal(run('stormSounds.filter(f=>f===610).length'),1);
run('airTime=3.51;updateAir(0)');const count=run('particles.length');assert.equal(count,10);
run('airTime=3.62;updateAir(0);airTime=3.72;updateAir(0)');assert.equal(run('particles.length'),count);assert.equal(run('stormSounds.filter(f=>f===90).length'),1);
console.log('PASS storm source alpha/embedding; eight phase boundaries; three hazard offsets; once-only synchronized audio and strike particles.');
