/* Painted Wildwood boss animation library. No game state or combat rules. */
(function (root) {
  'use strict';
  const SMALL_HEIGHT = 112, GIANT_HEIGHT = SMALL_HEIGHT * 3;
  const scenes = {
    story: ['Full transformation + attacks', 28.8],
    compare: ['Size comparison · 1 : 3', 4],
    smallIdle: ['Small boss · idle', 2],
    smallWalk: ['Small boss · walk', 1.2],
    smallSwipe: ['Small boss · swipe', 1.4],
    smallHurt: ['Small boss · hurt', 1.2],
    shatter: ['Small boss · shatter into rubble', 3],
    rebuild: ['Rubble + ground → giant', 5.6],
    giantIdle: ['Giant · idle', 2],
    giantWalk: ['Giant · walk', 1.8],
    rock: ['Giant · throw rock', 3],
    quake: ['Giant · earthquake', 3.2],
    mountain: ['Giant · warning + rising mountains', 5.2],
    giantHurt: ['Giant · hurt', 1.4],
    defeat: ['Giant · collapse', 3.5]
  };
  const story = [
    ['smallIdle', 2], ['smallWalk', 1.8], ['smallSwipe', 1.4],
    ['smallHurt', 1.2], ['shatter', 2.4], ['rebuild', 5.6],
    ['giantIdle', 1.5], ['rock', 3], ['quake', 3.2],
    ['mountain', 5.2], ['defeat', 1.5]
  ];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const mix = (a, b, t) => a + (b - a) * t;
  function sample(scene, time) {
    if (!scenes[scene]) throw new Error('Unknown wood boss animation: ' + scene);
    time = clamp(time, 0, scenes[scene][1]);
    if (scene !== 'story') return { scene, time, duration: scenes[scene][1] };
    let start = 0;
    for (const [part, duration] of story) {
      if (time < start + duration || part === 'defeat') return { scene: part, time: time - start, duration, start };
      start += duration;
    }
  }
  function frameAt(state) {
    const t = state.time;
    switch (state.scene) {
      case 'smallIdle': case 'giantIdle': case 'compare': return Math.floor(t * 2) % 2;
      case 'smallWalk': case 'giantWalk': return [0, 2, 0, 3][Math.floor(t * 6) % 4];
      case 'smallSwipe': return t < .45 ? 4 : t < .7 ? 5 : 0;
      case 'smallHurt': return t < .7 ? 6 : 0;
      case 'shatter': return t < .28 ? 7 : t < .52 ? 8 : t < .82 ? 9 : t < 1.2 ? 10 : 11;
      case 'rock': return t < .65 ? 4 : t < 1.02 ? 5 : 0;
      case 'quake': return t < .85 ? 6 : t < 1.35 ? 7 : 0;
      case 'mountain': return t < .75 ? 8 : t < 1.45 ? 9 : 0;
      case 'giantHurt': return t < .85 ? 10 : 0;
      case 'defeat': return t < .3 ? 10 : 11;
      default: return 0;
    }
  }
  // Bounds are authored per pose after visual review, rather than inferred from
  // debris / spell effects. Frame zero is the shared scale reference.
  const atlas = {
    small: { file: 'wood-rookie-v2.png', columns: 4, rows: 3, bounds: [
      [34,96,316,278,190],[401,91,299,283,555],[749,100,308,279,916],[1123,99,303,281,1281],
      [35,447,297,245,184],[351,439,382,251,595],[762,433,312,268,914],[1140,501,275,201,1288],
      [38,740,327,290,190],[406,723,315,307,565],[747,770,316,268,904],[1097,900,319,134,1257]
    ].map(([x,y,w,h,anchorX])=>({x,y,w,h,anchorX})) },
    giant: { file: 'wood-giant-v2.png', columns: 4, rows: 3, bounds: [
      [68,42,245,311,211],[411,43,260,310,566],[771,44,261,308,926],[1125,45,257,307,1277],
      [62,414,312,285,194],[464,420,290,281,600],[795,395,240,312,940],[1103,457,300,253,1266],
      [64,740,280,295,213],[408,757,305,278,581],[785,748,269,288,919],[1141,808,246,217,1250]
    ].map(([x,y,w,h,anchorX])=>({x,y,w,h,anchorX})) }
  };
  class Renderer {
    constructor(images, bounds) {
      this.images = images;
      this.bounds = bounds;
      this.ready = !!(images.small?.naturalWidth && images.giant?.naturalWidth);
    }
    static async load(base = '../assets/') {
      const images = {}, bounds = {};
      await Promise.all(Object.entries(atlas).map(async ([kind, spec]) => {
        const img = new Image(); img.src = base + spec.file;
        await img.decode(); images[kind] = img;
        bounds[kind] = spec.bounds || Renderer.measure(img);
      }));
      return new Renderer(images, bounds);
    }
    static measure(img) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const result = [], cw = canvas.width / 4, ch = canvas.height / 3;
      for (let f = 0; f < 12; f++) {
        const sx = Math.round(f % 4 * cw), sy = Math.round(Math.floor(f / 4) * ch);
        const ex = Math.round((f % 4 + 1) * cw), ey = Math.round((Math.floor(f / 4) + 1) * ch);
        let left = ex, right = sx, top = ey, bottom = sy;
        for (let y = sy; y < ey; y++) for (let x = sx; x < ex; x++) {
          if (pixels[(y * canvas.width + x) * 4 + 3] < 48) continue;
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
        if (left > right) throw new Error('Empty sprite cell ' + f);
        result.push({ x: left, y: top, w: right - left + 1, h: bottom - top + 1 });
      }
      return result;
    }
    sprite(ctx, kind, frame, x, floor, height, facing = -1, alpha = 1) {
      const b = this.bounds[kind][frame], ref = this.bounds[kind][0];
      const scale = height / ref.h;
      ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, floor); ctx.scale(-facing, 1);
      const anchor = b.anchorX === undefined ? b.w / 2 : b.anchorX - b.x;
      ctx.drawImage(this.images[kind], b.x, b.y, b.w, b.h, -anchor * scale, -b.h * scale, b.w * scale, b.h * scale);
      ctx.restore();
    }
    walk(ctx, kind, x, floor, height, time, facing) {
      const b = this.bounds[kind][0], s = height / b.h, anchor = b.anchorX - b.x;
      const splitY = b.h * (kind === 'small' ? .85 : .64), stride = Math.sin(time * 9);
      ctx.save();ctx.translate(x,floor);ctx.scale(-facing,1);
      // Two painted legs travel in opposite phases; the torso covers the seams.
      for (let side=0;side<2;side++) {
        const sx=side?anchor:0, sw=side?b.w-anchor:anchor;
        const step=stride*(side?1:-1), pivot=(side?sw*.48:-sw*.27)*s;
        ctx.save();ctx.translate(pivot,-(b.h-splitY)*s);
        ctx.rotate(step*(kind==='small'?.11:.075));
        ctx.translate(step*(kind==='small'?4:6),-Math.max(0,step)*(kind==='small'?3:8));
        ctx.drawImage(this.images[kind],b.x+sx,b.y+splitY,sw,b.h-splitY,(sx-anchor)*s-pivot,0,sw*s,(b.h-splitY)*s);
        ctx.restore();
      }
      const bob=-Math.abs(stride)*(kind==='small'?1:2);
      ctx.drawImage(this.images[kind],b.x,b.y,b.w,splitY+3,-anchor*s,-height+bob,b.w*s,(splitY+3)*s);
      ctx.restore();
    }
    // Draw a polygon cut from the *original* painting. The same stone and moss
    // fragments continue through shatter, settlement, and giant assembly.
    fragment(ctx, kind, seed, x, y, size, rotation = 0, alpha = 1) {
      const b = this.bounds[kind][0];
      const sw = Math.min(b.w, b.h) * (kind === 'small' ? .09 : .19);
      // Stone feet and occasional moss-cap pieces exclude the eyes / mouth.
      const moss = kind === 'small' && seed % 5 === 0;
      const sx = kind === 'small' ? b.x + b.w * (moss ? .37 : random(seed) > .5 ? .64 : .2) : b.x + random(seed + 4) * (b.w - sw);
      const sy = kind === 'small' ? b.y + b.h * (moss ? .04 : .88) : b.y + b.h * (.35 + random(seed + 12) * .36);
      ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rotation);
      ctx.beginPath(); ctx.moveTo(-size * .54, -size * .17); ctx.lineTo(-size * .24, -size * .5);
      ctx.lineTo(size * .35, -size * .4); ctx.lineTo(size * .55, size * .16);
      ctx.lineTo(size * .15, size * .47); ctx.lineTo(-size * .44, size * .34); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#74897d'; ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.drawImage(this.images[kind], sx, sy, sw, sw, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    rubble(ctx, x, floor, time, assembling = false) {
      for (let i = 0; i < 22; i++) {
        const start = .1 + random(i) * .22, t = clamp((time - start) / .8);
        const landingX = x + (random(i + 7) - .5) * 260;
        let px = mix(x, landingX, t), py = floor - Math.sin(t * Math.PI) * (35 + random(i + 17) * 90);
        let alpha = smooth((time - .3) * 5), size = 8 + random(i + 11) * 17;
        if (assembling) {
          const p = smooth((time - .6 - random(i + 20) * .65) / 2.5);
          px = mix(landingX, x + (random(i + 5) - .5) * 94, p);
          py = mix(floor - 4, floor - 40 - random(i + 8) * 220, p);
          alpha = 1 - smooth((time - 2.3) / 1.1);
        }
        this.fragment(ctx, 'small', i + 1, px, py - size * .4, size, (1 - t) * i * .7, alpha);
      }
    }
    assembly(ctx, x, floor, time, facing) {
      this.rubble(ctx, x, floor, time, true);
      // Broken slabs rise from a wide patch of ground in staggered streams.
      for (let i = 0; i < 26; i++) {
        const delay = .25 + random(i + 100) * 1.2, p = smooth((time - delay) / 2.5);
        if (time < delay || p === 1) continue;
        const px = mix(x + (random(i + 40) - .5) * 420, x + (random(i + 9) - .5) * 85, p);
        const py = mix(floor + 18, floor - 30 - random(i + 70) * 275, p);
        this.fragment(ctx, 'giant', i + 100, px, py, 13 + random(i + 80) * 16, (1 - p) * (i % 7), Math.sin(p * Math.PI));
      }
      const b = this.bounds.giant[0], scale = GIANT_HEIGHT / b.h;
      // Reassemble original painted parts bottom-up: feet, shins, leaf core,
      // shoulders, crown, floating diamond. No stretched character bitmap.
      const columns = 5, rows = 8;
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        const seed = row * columns + col;
        const delay = .8 + (rows - 1 - row) * .3 + random(seed + 300) * .35;
        const p = smooth((time - delay) / 1.45);
        if (!p) continue;
        const sw = b.w / columns, sh = b.h / rows;
        const targetX = (col + .5) * sw * scale - (b.anchorX - b.x) * scale;
        const targetY = -(rows - row - .5) * sh * scale;
        const px = mix((random(seed + 250) - .5) * 420, targetX, p);
        const py = mix(10 + random(seed + 400) * 30, targetY, p);
        ctx.save(); ctx.translate(x, floor); ctx.scale(-facing, 1); ctx.translate(px, py);
        ctx.rotate((1 - p) * (random(seed + 80) - .5) * 3);
        ctx.globalAlpha *= clamp(p * 3);
        ctx.drawImage(this.images.giant, b.x + col * sw, b.y + row * sh, sw, sh, -sw * scale / 2 - .15, -sh * scale / 2 - .15, sw * scale + .3, sh * scale + .3);
        ctx.restore();
      }
      this.dust(ctx, x, floor, time, clamp(1 - time / 5));
    }
    dust(ctx, x, floor, time, strength = 1) {
      ctx.save(); ctx.fillStyle = '#d4c4a3';
      for (let i = 0; i < 20; i++) {
        const age = (time * .8 + random(i + 80)) % 1;
        ctx.globalAlpha = (1 - age) * .4 * strength;
        ctx.beginPath(); ctx.ellipse(x + (random(i + 90) - .5) * (50 + age * 250), floor - age * (20 + random(i) * 70), 7 + age * 16, 4 + age * 9, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    quake(ctx, x, floor, time) {
      if (time < .85) return;
      for (let i = 0; i < 3; i++) {
        const age = time - .85 - i * .18;
        if (age < 0 || age > 1.6) continue;
        ctx.save(); ctx.strokeStyle = '#e1c892'; ctx.lineWidth = 4 * (1 - age / 1.6); ctx.globalAlpha = 1 - age / 1.6;
        ctx.beginPath(); ctx.ellipse(x, floor + 3, 15 + age * 260, 4 + age * 18, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      for (let i = 0; i < 15; i++) {
        const age = clamp((time - .9 - random(i) * .3) / 1.15);
        this.fragment(ctx, 'small', i + 50, x + (random(i + 7) - .5) * 460, floor - Math.sin(age * Math.PI) * (12 + random(i) * 38), 6 + random(i + 5) * 9, age * i, Math.sin(age * Math.PI));
      }
    }
    mountain(ctx, x, floor, time) {
      // Warn at the boss's previous position, then grow and fully withdraw.
      if (time < .3 || time > 4.9) return;
      const warn = time < 1.65;
      const height = time < 1.65 ? 0 : time < 2.4 ? smooth((time - 1.65) / .75) : time < 3.55 ? 1 : 1 - smooth((time - 3.55) / 1.35);
      ctx.save();
      ctx.fillStyle = warn ? `rgba(244,57,58,${.25 + .22 * Math.sin(time * 15) ** 2})` : 'rgba(244,57,58,.18)';
      ctx.strokeStyle = '#e8414e'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, floor + 5, 128, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (height > 0) for (let i = 0; i < 3; i++) {
        const cx = x + (i - 1) * 74, w = i === 1 ? 106 : 89, h = (i === 1 ? 176 : 125) * height;
        ctx.save(); ctx.beginPath(); ctx.moveTo(cx - w / 2, floor + 5);
        ctx.lineTo(cx - w * .24, floor - h * .53); ctx.lineTo(cx - w * .12, floor - h * .48);
        ctx.lineTo(cx + w * .06, floor - h); ctx.lineTo(cx + w * .21, floor - h * .66);
        ctx.lineTo(cx + w * .3, floor - h * .59); ctx.lineTo(cx + w / 2, floor + 5); ctx.closePath();
        ctx.fillStyle = '#697d75'; ctx.fill(); ctx.strokeStyle = '#344a40'; ctx.lineWidth = 3; ctx.stroke(); ctx.clip();
        const b = this.bounds.small[0];
        ctx.globalAlpha = .75; ctx.drawImage(this.images.small, b.x + b.w * .2, b.y + b.h * .88, b.w * .08, b.h * .09, cx - w / 2, floor - h, w, h);
        ctx.restore();
        ctx.strokeStyle = '#40594a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx + w * .06, floor - h); ctx.lineTo(cx - 3, floor - h * .52); ctx.lineTo(cx + 12, floor - h * .35); ctx.lineTo(cx + 4, floor + 3); ctx.stroke();
      }
      ctx.restore();
      if (height > 0) this.dust(ctx, x, floor, time, height);
    }
    render(ctx, width, height, scene, time, options = {}) {
      const state = sample(scene, time), facing = options.facing || -1;
      const scale = Math.min(width / 1000, height / 560);
      const floor = 465, anchor = 650, frame = frameAt(state), t = state.time;
      ctx.save(); ctx.clearRect(0, 0, width, height); ctx.scale(scale, scale);
      ctx.translate((width / scale - 1000) / 2, (height / scale - 560) / 2);
      this.background(ctx);
      const shake = state.scene === 'quake' && t >= .85 && t < 2.5 && !options.reducedMotion ? Math.sin(t * 80) * 4 * (1 - (t - .85) / 1.65) : 0;
      ctx.save(); ctx.translate(0, shake);
      if (state.scene === 'compare') {
        this.sprite(ctx, 'small', frame, 290, floor, SMALL_HEIGHT, facing);
        this.sprite(ctx, 'giant', frame, 690, floor, GIANT_HEIGHT, facing);
        this.hearts(ctx, 290, floor - SMALL_HEIGHT - 27, 5);
        this.hearts(ctx, 690, floor - GIANT_HEIGHT - 27, 5);
        ctx.fillStyle = '#315648'; ctx.font = '600 16px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('SMALL · 5 HEARTS', 290, 508); ctx.fillText('GIANT · 3× TALLER', 690, 508);
        ctx.strokeStyle = '#477b63'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
        for (const [x, h] of [[400, SMALL_HEIGHT], [870, GIANT_HEIGHT]]) { ctx.beginPath(); ctx.moveTo(x, floor); ctx.lineTo(x, floor - h); ctx.stroke(); }
        ctx.setLineDash([]);
      } else if (state.scene.startsWith('small') || state.scene === 'shatter') {
        const walk = state.scene === 'smallWalk' ? Math.sin(t * 2.3) * 38 : 0;
        if(state.scene==='smallWalk')this.walk(ctx,'small',anchor+walk,floor,SMALL_HEIGHT,t,facing);
        else this.sprite(ctx, 'small', frame, anchor + walk, floor, SMALL_HEIGHT, facing);
        if (state.scene === 'shatter') { this.rubble(ctx, anchor, floor, t); this.dust(ctx, anchor, floor, t, clamp(1.5 - t)); }
        else this.hearts(ctx, anchor + walk, floor - SMALL_HEIGHT - 28, 5);
      } else if (state.scene === 'rebuild') {
        this.assembly(ctx, anchor, floor, t, facing);
      } else {
        let x = anchor;
        if (state.scene === 'giantWalk') x += Math.sin(t * 1.8) * 48;
        if (state.scene === 'mountain') x += 205 * smooth((t - .65) / .9);
        if (state.scene === 'mountain') this.mountain(ctx, anchor, floor, t);
        if(state.scene==='giantWalk')this.walk(ctx,'giant',x,floor,GIANT_HEIGHT,t,facing);
        else this.sprite(ctx, 'giant', frame, x, floor, GIANT_HEIGHT, facing);
        if(state.scene!=='defeat')this.hearts(ctx,x,floor-GIANT_HEIGHT-27,5);
        if (state.scene === 'rock' && t >= .7 && t < 2.5) {
          const p = (t - .7) / 1.8, rockX = anchor + facing * (65 + 490 * p), rockY = floor - 225 - Math.sin(p * Math.PI) * 110 + 205 * p * p;
          this.fragment(ctx, 'small', 901, rockX, rockY, 45, p * 8);
          if (p > .9) this.dust(ctx, rockX, floor, t, (p - .9) * 5);
        }
        if (state.scene === 'quake') this.quake(ctx, anchor, floor, t);
        if (state.scene === 'defeat' && t > .9) {
          this.dust(ctx, anchor, floor, t, clamp((t - .9) * .8));
        }
      }
      ctx.restore(); ctx.restore();
      return { ...state, frame, smallHeight: SMALL_HEIGHT * scale, giantHeight: GIANT_HEIGHT * scale };
    }
    hearts(ctx, x, y, count) {
      ctx.save(); ctx.fillStyle = '#d74659';
      for (let i = 0; i < count; i++) {
        ctx.beginPath(); const cx = x + (i - (count - 1) / 2) * 18;
        ctx.moveTo(cx, y + 5); ctx.bezierCurveTo(cx - 13, y - 3, cx - 5, y - 12, cx, y - 5);
        ctx.bezierCurveTo(cx + 5, y - 12, cx + 13, y - 3, cx, y + 5); ctx.fill();
      } ctx.restore();
    }
    background(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, 560); sky.addColorStop(0, '#8ac7ae'); sky.addColorStop(.65, '#c6ddb0'); sky.addColorStop(1, '#e6ddab');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 560);
      ctx.fillStyle = '#fff5ba66'; ctx.beginPath(); ctx.arc(180, 105, 57, 0, Math.PI * 2); ctx.fill();
      for (let layer = 0; layer < 2; layer++) {
        ctx.fillStyle = layer ? '#30704d16' : '#457e5b13';
        for (let i = -1; i < 9; i++) { const x = i * 150 + layer * 60, y = 285 - i % 3 * 26;
          ctx.fillRect(x - 9, y, 18, 220); ctx.beginPath(); ctx.arc(x, y, 65, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.fillStyle = '#8b7557'; ctx.fillRect(0, 469, 1000, 91);
      ctx.fillStyle = '#a28b68'; for (let i = 0; i < 110; i++) ctx.fillRect(random(i + 900) * 1000, 485 + random(i + 500) * 75, 1 + random(i) * 5, 2);
      ctx.fillStyle = '#548b56'; ctx.fillRect(0, 464, 1000, 9);
      ctx.strokeStyle = '#77a75e'; ctx.lineWidth = 2;
      for (let i = 0; i < 140; i++) { const x = random(i + 700) * 1000; ctx.beginPath(); ctx.moveTo(x, 470); ctx.lineTo(x + 3, 463 - random(i + 3) * 10); ctx.stroke(); }
    }
  }
  root.WoodBossAnimation = { Renderer, scenes, story, sample, frameAt, SMALL_HEIGHT, GIANT_HEIGHT, atlas };
  if (typeof module !== 'undefined') module.exports = root.WoodBossAnimation;
})(typeof globalThis !== 'undefined' ? globalThis : window);
