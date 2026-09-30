import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const evidence = resolve(process.env.EVIDENCE_DIR || '.omo/evidence/connected-motion');
await mkdir(evidence, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const results = [];
const errors = [];
try {
  for (const viewport of [{width:1280,height:800}, {width:375,height:667}]) {
    const page = await browser.newPage({viewport});
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/dist/?lang=ko');
    await page.waitForFunction(() => document.querySelector('.deck-page'));
    const prefix = `${viewport.width}`;
    const capture = name => page.screenshot({path:`${evidence}/${prefix}-${name}.png`});
    const state = () => page.evaluate(() => ({
      current:document.querySelector('main > .is-current').id,
      leaving:[...document.querySelectorAll('main > .is-leaving')].map(slide => ({id:slide.id, inert:slide.inert, display:getComputedStyle(slide).display, opacity:Number(getComputedStyle(slide).opacity), y:new DOMMatrix(getComputedStyle(slide).transform).m42})),
      incoming:(() => {const slide = document.querySelector('main > .is-current'); const style = getComputedStyle(slide); return {opacity:Number(style.opacity), y:new DOMMatrix(style.transform).m42, inert:slide.inert};})(),
      visible:[...document.querySelectorAll('main > [data-slide]')].filter(slide => getComputedStyle(slide).display !== 'none').length,
      animations:document.getAnimations().length,
      pageAnimations:document.getAnimations().filter(animation => animation.effect?.target.matches('main > [data-slide]')).length,
      scrollY,
      ids:[...document.querySelectorAll('[id]')].map(element => element.id)
    }));
    const clean = async () => {
      const result = await state();
      assert.equal(result.leaving.length, 0);
      assert.equal(result.animations, 0);
      assert.equal(result.visible, 1);
      assert.equal(result.incoming.opacity, 1);
      assert.equal(result.incoming.y, 0);
      assert.equal(result.scrollY, 0);
      return result;
    };
    const pauseAt = time => page.evaluate(time => {
      for (const animation of document.getAnimations()) { animation.pause(); animation.currentTime = time; }
    }, time);
    const openingMotion = await page.evaluate(() => document.getAnimations().filter(animation => animation.effect?.target.closest('.identity-opening')).length);
    assert(openingMotion >= 3, 'Opening typography has a bounded, coordinated entrance');
    await page.waitForTimeout(850);
    const before = await clean();
    const chrome = await page.locator('.site-header,.slide-controls').evaluateAll(elements => elements.map(element => ({rect:element.getBoundingClientRect().toJSON(), transform:getComputedStyle(element).transform})));
    await capture('forward-start');
    await page.keyboard.press('PageDown');
    await pauseAt(110);
    const forward = await state();
    assert.equal(forward.leaving.length, 1);
    assert.equal(forward.leaving[0].id, before.current);
    assert.equal(forward.leaving[0].inert, true);
    assert.equal(forward.leaving[0].display, 'block');
    assert.equal(forward.leaving[0].opacity, 1, 'Opaque panels avoid overlapping faded text');
    assert(forward.leaving[0].y < 0);
    assert.equal(forward.incoming.opacity, 1);
    assert(forward.incoming.y > viewport.height * .2, 'Page travel must remain clearly visible at 110ms');
    assert.equal(forward.incoming.inert, false);
    assert.equal(forward.visible, 2);
    assert.equal(forward.pageAnimations, 2);
    assert(forward.animations > 2, 'Research image choreography accompanies the two page panels');
    assert.deepEqual(forward.ids, before.ids, 'Transition must not clone DOM or IDs');
    assert.deepEqual(await page.locator('.site-header,.slide-controls').evaluateAll(elements => elements.map(element => ({rect:element.getBoundingClientRect().toJSON(), transform:getComputedStyle(element).transform}))), chrome);
    await capture('forward-mid');
    const continuity = await page.evaluate(() => {
      const read = slide => ({id:slide.id, opacity:Number(getComputedStyle(slide).opacity), transform:getComputedStyle(slide).transform});
      const incoming = document.querySelector('main > .is-current');
      const outgoing = document.querySelector('main > .is-leaving');
      const before = [read(incoming), read(outgoing)];
      document.querySelector('[data-slide-prev]').click();
      const after = [read(incoming), read(outgoing)];
      return {before, after, current:document.querySelector('main > .is-current').id};
    });
    assert.deepEqual(continuity.after, continuity.before, 'Reversal must begin at the currently rendered geometry');
    assert.equal(continuity.current, before.current, 'Previous input must interrupt immediately');
    await pauseAt(110);
    await capture('reversal-mid');
    await page.evaluate(() => document.getAnimations().forEach(animation => animation.play()));
    await page.waitForTimeout(850);
    await clean();
    await capture('reversal-settled');
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(850);
    await clean();
    await capture('forward-settled');
    await page.keyboard.press('PageUp');
    await pauseAt(110);
    const reverse = await state();
    assert(reverse.leaving[0].y > 0 && reverse.incoming.y < 0, 'Reverse navigation must reverse both directions');
    await capture('reverse-mid');
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageDown');
    const interrupted = await state();
    assert.equal(interrupted.leaving.length, 1, 'Rapid navigation retains only the latest outgoing slide');
    assert.equal(interrupted.visible, 2);
    assert.equal(interrupted.pageAnimations, 2);
    await page.waitForTimeout(850);
    await clean();
    const wheel = await page.evaluate(() => {
      const previous = current;
      dispatchEvent(new WheelEvent('wheel', {deltaY:120, cancelable:true}));
      const forward = current;
      dispatchEvent(new WheelEvent('wheel', {deltaY:-120, cancelable:true}));
      return {previous, forward, reversed:current};
    });
    assert.equal(wheel.forward, wheel.previous + 1);
    assert.equal(wheel.reversed, wheel.previous, 'Wheel reversal remains immediate during motion');
    await page.evaluate(() => dispatchEvent(new Event('resize')));
    await clean();
    await page.waitForTimeout(200);
    await clean();
    await page.evaluate(() => navigateTo(document.getElementById('publications')));
    await page.evaluate(() => document.querySelector('.is-current .slide-overview [data-read]').click());
    assert.equal(await page.locator('.reading-dialog').evaluate(element => element.open), true);
    await clean();
    await page.keyboard.press('Escape');
    await page.keyboard.press('PageDown');
    await page.locator('[data-reading]').click();
    assert.equal(await page.locator('.is-leaving').count(), 0);
    assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('presentation')), false);
    await page.locator('[data-reading]').click();
    await clean();
    await page.keyboard.press('PageDown');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await clean();
    await page.keyboard.press('PageUp');
    await clean();
    await capture('reduced-motion');
    results.push({viewport, status:'PASS', scenarios:['overlapping outgoing/incoming slides','inert outgoing / current focusable','unchanged DOM IDs','fixed header and dock','forward and reverse motion','continuity on reversal','rapid interruption with two visible slides','wheel reversal without lock','natural completion cleanup','immediate resize cleanup','dialog cleanup','reading-mode cleanup','reduced-motion change and navigation'], before, forward, reverse, continuity, interrupted, wheel});
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${evidence}/results.json`, JSON.stringify({status:'PASS', invocation:'node scripts/test-motion.mjs', results, errors}, null, 2));
  console.log(`Connected transitions, interruption and cleanup: PASS. Evidence: ${evidence}/results.json`);
} catch (error) {
  await writeFile(`${evidence}/results.json`, JSON.stringify({status:'FAIL', error:String(error), results, errors}, null, 2));
  throw error;
} finally {
  await browser.close();
}
