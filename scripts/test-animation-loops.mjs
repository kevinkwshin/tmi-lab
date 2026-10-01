import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out = process.env.EVIDENCE_DIR || '.omo/evidence/animation-loops';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const results = [];
const errors = [];
let parts = '[data-scene-part]';
const count = page => page.locator(parts).evaluateAll(nodes => nodes.flatMap(node => node.getAnimations()).length);
const playing = page => page.waitForFunction(selector => [...document.querySelectorAll(selector)].some(node => node.getAnimations().length), parts);
const finishCycle = async page => {
  await page.locator(parts).evaluateAll(nodes => nodes.flatMap(node => node.getAnimations()).forEach(animation => animation.finish()));
  await page.waitForFunction(selector => [...document.querySelectorAll(selector)].every(node => !node.getAnimations().length), parts);
};
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
  page.on('pageerror', error => errors.push(String(error)));
  await page.context().tracing.start({screenshots:true,snapshots:true});
  await page.goto(`${base}?lang=ko`);
  for (const id of ['welcome','translation','mission','research-imaging','research-signals','research']) {
    parts = id === 'welcome' ? '.identity-opening [data-mascot-wave], .identity-opening [data-mascot-resting-hand], .identity-opening [data-mascot-goose], .identity-opening [data-mascot-blink]' : '[data-scene-part]';
    const assertPoster = async () => {
      if (id !== 'welcome') return;
      const mark = page.locator('.identity-opening [data-brand-mark]');
      assert.equal(await mark.getAttribute('data-mascot-active'),null,'Interrupted greeting removes the animated artwork');
      assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1','Interrupted greeting restores the original poster');
    };
    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await page.evaluate(() => navigateTo(document.getElementById('contact'),false));
    assert.equal(await count(page),0,`${id}: navigation cancels active playback`);
    await assertPoster();
    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await finishCycle(page);
    await page.evaluate(() => navigateTo(document.getElementById('contact'),false));
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: leaving during the rest cancels the pending repeat`);
    await assertPoster();

    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await finishCycle(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: reduced motion cancels the pending repeat`);
    await assertPoster();
    await page.emulateMedia({reducedMotion:'no-preference'});
    await playing(page);

    // Supply the browser visibility signal deterministically in a headless context.
    await page.evaluate(() => {
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await count(page),0,`${id}: hidden-page signal cancels active playback`);
    await assertPoster();
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: hidden-page signal prevents repeats`);
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await playing(page);

    await finishCycle(page);
    await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: printing cancels the pending repeat`);
    await assertPoster();
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    await playing(page);
    if (id === 'welcome') {
      // Exercise the native modal and the same open signal used by the image viewer.
      await page.evaluate(() => {
        document.dispatchEvent(new CustomEvent('image:open'));
        document.querySelector('.reading-dialog').showModal();
      });
      assert.equal(await count(page),0,'Open dialog cancels active greeting');
      await assertPoster();
      await page.waitForTimeout(3100);
      assert.equal(await count(page),0,'Open dialog prevents automatic greeting repeats');
      await page.screenshot({path:`${out}/welcome-dialog.png`});
      await page.locator('.reading-dialog button').click();
      await playing(page);
      await finishCycle(page);
      await page.evaluate(() => {
        document.dispatchEvent(new CustomEvent('image:open'));
        document.querySelector('.reading-dialog').showModal();
      });
      await page.waitForTimeout(3100);
      assert.equal(await count(page),0,'Open dialog cancels pending greeting repeats');
      await page.locator('.reading-dialog button').click();
      await playing(page);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForTimeout(100);
      assert.equal(await count(page),0,'Reduced motion cancels active greeting');
      await assertPoster();
      await page.screenshot({path:`${out}/welcome-reduced.png`});
      await page.emulateMedia({reducedMotion:'no-preference'});
      await playing(page);
      await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
      assert.equal(await count(page),0,'Printing cancels active greeting');
      await assertPoster();
      await page.evaluate(() => dispatchEvent(new Event('afterprint')));
      await playing(page);
      await page.setViewportSize({width:1280,height:800});
      await page.waitForTimeout(350);
      await playing(page);
      await page.waitForTimeout(1600);
      await page.screenshot({path:`${out}/welcome-resumed.png`});
    }
    results.push({id,activeNavigation:true,restCancellation:true,reducedMotion:true,visibilitySignal:true,printSignals:true,resume:true,...(id==='welcome'?{dialogActiveAndRest:true,activeReducedMotion:true,activePrint:true,resizeResume:true,originalPoster:true}:{}),artifacts:['actions.zip',...(id==='welcome'?['welcome-dialog.png','welcome-reduced.png','welcome-resumed.png']:[])]});
  }
  await page.locator('[data-reading]').click();
  const readingScene = page.locator('#detail-research [data-clinical-scene]');
  await readingScene.scrollIntoViewIfNeeded();
  await playing(page);
  await page.setViewportSize({width:1400,height:900});
  await page.waitForTimeout(350);
  assert(await readingScene.locator('[data-scene-part]').evaluateAll(nodes => nodes.some(node => node.getAnimations().length)),'Visible reading scene resumes after responsive layout settles');
  await page.screenshot({path:`${out}/reading-resize.png`});
  results.push({id:'reading-research',resizeResume:true});
  await page.context().tracing.stop({path:`${out}/actions.zip`});
  await page.close();
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} animation loops cancel pending repeats and resume after interruptions.`);
