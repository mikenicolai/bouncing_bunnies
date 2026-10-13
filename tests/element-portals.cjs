const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./air.cjs');
const html=fs.readFileSync('index.html','utf8');assert.equal(html.split('// ELEMENT_PORTALS_BEGIN\n')[1].split('\n// ELEMENT_PORTALS_END')[0],fs.readFileSync('assets/element-portals-v1.js','utf8'));
assert.equal(run('Object.keys(ELEMENT_PORTALS).sort().join(",")'),'air,earth,fire,meadow,water');
for(const key of ['meadow','air','water','fire','earth']){
 const p=run(`ELEMENT_PORTALS.${key}`),b=fs.readFileSync(p.asset);assert.equal(b[25],6,'original RGBA portal');assert.equal(b.readUInt32BE(16),p.width);assert.equal(b.readUInt32BE(20),p.height);assert(p.cx>p.rx&&p.cy>p.ry&&p.cy+p.ry<p.height,'registered opening stays inside the sprite');
}
console.log('PASS five elemental portals: original transparent RGBA assets, registered openings and shared embedded renderer for Meadow/Air/Sea/Lava/Plants.');
