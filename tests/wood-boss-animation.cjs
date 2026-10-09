// Animation library / browser review checks; no gameplay balance assumptions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const API = require('../assets/wood-boss-animation-v1.js');
assert.equal(API.GIANT_HEIGHT, API.SMALL_HEIGHT * 3);
assert(Math.abs(API.story.reduce((total, [, duration]) => total + duration, 0) - API.scenes.story[1]) < 1e-9);
assert.equal(API.sample('story', 6.5).scene, 'shatter');
assert.equal(API.sample('story', 9).scene, 'rebuild');
assert.equal(API.sample('story', 28.8).scene, 'defeat');
assert.equal(API.frameAt(API.sample('shatter', 3)), 11);
for (const fps of [30, 60, 120]) {
  const observed = new Set();
  for (let t = 0; t <= API.scenes.story[1]; t += 1 / fps) {
    const state = API.sample('story', t); observed.add(state.scene);
    const frame = API.frameAt(state);
    assert(frame >= 0 && frame < 12, `${state.scene}: invalid frame at ${fps} FPS`);
  }
  assert.equal(observed.size, API.story.length);
}
async function browserChecks() {
  const { chromium } = require('playwright');
  const executablePath = process.env.BOSS_BROWSER || '/Users/mike/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1050 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.BOSS_PREVIEW || 'http://127.0.0.1:8772/previews/wood-boss-animation.html');
    await page.waitForFunction(() => window.woodBossReview?.ready);
    const inspection = await page.evaluate(() => {
      const api = WoodBossAnimation, renderer = woodBossReview.renderer, result = {};
      for (const kind of ['small', 'giant']) {
        const image = renderer.images[kind];
        result[kind] = { width: image.naturalWidth, height: image.naturalHeight, bounds: renderer.bounds[kind] };
        if (renderer.bounds[kind].some(b => !b.w || !b.h)) throw Error('Empty pose: ' + kind);
      }
      for (const scene of Object.keys(api.scenes)) {
        for (let t = 0; t <= api.scenes[scene][1]; t += .1) {
          renderer.render(document.getElementById('stage').getContext('2d'), 1000, 560, scene, t);
          renderer.render(document.getElementById('stage').getContext('2d'), 1000, 560, scene, t, { facing: 1, reducedMotion: true });
        }
      }
      return result;
    });
    assert.equal(inspection.small.bounds.length, 12); assert.equal(inspection.giant.bounds.length, 12);
    // Review actions must pause and show the chosen time / phase exactly.
    await page.evaluate(() => woodBossReview.set('compare', 0));
    assert.match(await page.locator('#phase').textContent(), /1 : 3/);
    await page.locator('#mirror').check();
    await page.locator('#scene').selectOption('mountain');
    await page.locator('#scrub').fill('2.7');
    assert.match(await page.locator('#counter').textContent(), /2.7 \/ 5.2/);
    assert.equal(await page.locator('#play').textContent(), 'Play');
    await page.locator('#restart').click();
    assert.match(await page.locator('#counter').textContent(), /0.0/);
    await page.evaluate(() => woodBossReview.set('compare', 0));
    await page.screenshot({ path: path.resolve(__dirname, '../previews/wood-boss-review-desktop.png') });
    const views = [['compare', 0], ['shatter', .64], ['shatter', 2.4], ['rebuild', 1.8], ['rebuild', 3.3], ['rebuild', 5.1], ['rock', .95], ['quake', 1.1], ['mountain', .95], ['mountain', 2.8], ['mountain', 4.6], ['defeat', 1.4]];
    const sheet = await page.evaluate(views => {
      const out = document.createElement('canvas'); out.width = 1500; out.height = 1216;
      const paint = out.getContext('2d');
      const frame = document.createElement('canvas'); frame.width = 1000; frame.height = 560;
      for (let i = 0; i < views.length; i++) {
        const [scene, time] = views[i], x = i % 3 * 500, y = Math.floor(i / 3) * 304;
        woodBossReview.renderer.render(frame.getContext('2d'), 1000, 560, scene, time);
        paint.drawImage(frame, x, y, 500, 280); paint.fillStyle = '#20392e'; paint.fillRect(x, y + 280, 500, 24);
        paint.fillStyle = '#eaf1df'; paint.font = '13px system-ui'; paint.fillText(WoodBossAnimation.scenes[scene][0] + ' · ' + time.toFixed(1) + ' s', x + 12, y + 297);
      }
      return out.toDataURL('image/png').split(',')[1];
    }, views);
    fs.writeFileSync(path.resolve(__dirname, '../previews/wood-boss-animation-contact-sheet.png'), Buffer.from(sheet, 'base64'));
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile review must not scroll horizontally');
    await page.screenshot({ path: path.resolve(__dirname, '../previews/wood-boss-review-phone.png') });
    assert.deepEqual(errors, []);
    console.log('PASS: 24 painted poses, all 15 views in both directions, full timeline at 30/60/120 FPS, exact 3:1 scale, scrub/restart and phone layout.');
    console.log(JSON.stringify(inspection));
  } finally { await browser.close(); }
}
if (process.argv.includes('--browser')) browserChecks().catch(error => { console.error(error); process.exitCode = 1; });
else console.log('PASS: 3:1 size ratio, ordered transformation, valid animation frames at 30/60/120 FPS.');
