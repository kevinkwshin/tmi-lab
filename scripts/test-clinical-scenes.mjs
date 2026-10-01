import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.EVIDENCE_DIR || '.omo/evidence/clinical-scenes';
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const results = [];
const errors = [];
const animationCount = page => page.locator('[data-scene-part]').evaluateAll(nodes => nodes.flatMap(node => node.getAnimations()).length);
const waitPlaying = page => page.waitForFunction(() => [...document.querySelectorAll('[data-scene-part]')].some(node => node.getAnimations().length));
try {
  for (const lang of ['ko','en']) {
    const page = await browser.newPage({viewport:{width:1440,height:900}, reducedMotion:'reduce'});
    page.on('pageerror', error => errors.push(String(error)));
    await page.context().tracing.start({screenshots:true,snapshots:true});
    await page.goto(`${base}${lang === 'en' ? 'en/' : ''}?lang=${lang}#translation`);
    await page.waitForFunction(() => document.querySelector('.is-current .deck-page'));
    assert.equal(await page.locator('[data-scene-replay], [data-brand-replay]').count(),0,'Replay controls are removed from the document');
    for (const [width,height] of [[1440,900],[1280,800],[1280,640],[768,1024],[900,700],[375,667],[320,640]]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(350);
      for (const [id,kind] of [['translation','triage'],['research','workflow']]) {
        await page.evaluate(id => navigateTo(document.getElementById(id),false),id);
        const scene = page.locator(`.is-current .deck-body [data-clinical-scene="${kind}"]`);
        assert.equal(await scene.count(),1,`${lang} ${width}x${height} ${kind} visible scene`);
        await scene.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        if (kind === 'workflow') {
          const scans = await scene.locator('.report-scan-frame').evaluateAll(frames => frames.map(frame => {
            const image = frame.querySelector('img');
            const bounds = frame.getBoundingClientRect();
            return {loaded:image.complete && image.naturalWidth === 1774, square:Math.abs(bounds.width-bounds.height)<1, position:getComputedStyle(image).objectPosition};
          }));
          assert.deepEqual(scans,[{loaded:true,square:true,position:'0% 50%'},{loaded:true,square:true,position:'100% 50%'}],'Both exams show their own complete square CT view');
          assert.match(await scene.innerText(),/10 mm/);
          assert.match(await scene.innerText(),/16 mm/);
          assert.match(await scene.locator('[role="group"]').getAttribute('aria-label'),/LLM/,'Explanation identifies report-text analysis');
        }
        const bounds = await page.locator('.is-current .deck-body').evaluate(body => {
          const box = body.getBoundingClientRect();
          return {scrollX,scrollY,overflow:[...body.querySelectorAll('*')].filter(node => {
            const r=node.getBoundingClientRect();
            return r.width&&r.height&&(r.left<box.left-2||r.top<box.top-2||r.right>box.right+2||r.bottom>box.bottom+2);
          }).map(node => ({class:node.getAttribute('class'),text:node.textContent.slice(0,80)}))};
        });
        await page.screenshot({path:`${out}/${lang}-${width}x${height}-${kind}-static.png`});
        assert.deepEqual(bounds,{scrollX:0,scrollY:0,overflow:[]},`${lang} ${width}x${height} ${kind} bounded content`);
        assert.equal(await animationCount(page),0,'Reduced motion is a complete static scene');
        results.push({lang,width,height,kind,...bounds});
      }
    }
    for (const [width,height] of [[1440,900],[375,667]]) {
      await page.setViewportSize({width,height});
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForTimeout(350);
      for (const [id,kind] of [['translation','triage'],['research','workflow']]) {
        await page.evaluate(() => navigateTo(document.getElementById('welcome'),false));
        await page.evaluate(id => navigateTo(document.getElementById(id),true),id);
        const scene = page.locator(`.is-current .deck-body [data-clinical-scene="${kind}"]`);
        const prefix = `${out}/${lang}-${width}x${height}-${kind}`;
        await page.waitForTimeout(700);
        assert(await animationCount(page)>0,'Clinical scene actually animates on entry');
        await page.screenshot({path:`${prefix}-start.png`});
        await page.waitForTimeout(1200);
        await page.screenshot({path:`${prefix}-mid.png`});
        await page.waitForFunction(() => document.querySelector('.is-current .deck-body [data-clinical-scene]')?.dataset.sceneState === 'settled');
        assert.equal(await animationCount(page),0,'The complete static figure rests between cycles');
        await page.screenshot({path:`${prefix}-end.png`});
        await waitPlaying(page);
        await page.screenshot({path:`${prefix}-repeat.png`});
        assert(await animationCount(page)>0,'A second cycle starts without user input');
        await page.mouse.move(width/2,height/2);
        const old=await page.evaluate(() => current);
        await page.mouse.wheel(0,24);
        assert.equal(await page.evaluate(() => current),old+1,'Small wheel notch responds during scene motion');
        const noncurrentAnimations = await page.locator('[data-scene-part]').evaluateAll(nodes => nodes
          .filter(node => !node.closest('.is-current'))
          .flatMap(node => node.getAnimations().map(() => ({scene:node.closest('[data-clinical-scene]').dataset.clinicalScene,part:node.dataset.scenePart}))));
        assert.deepEqual(noncurrentAnimations,[],'Leaving scene cancels all outgoing and noncurrent scene animations');
        await page.evaluate(id => navigateTo(document.getElementById(id),false),id);
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.waitForTimeout(80);
        assert.equal(await animationCount(page),0,'Changing preference cancels an in-flight scene');
        await page.emulateMedia({reducedMotion:'no-preference'});
        await waitPlaying(page);
        {
          await scene.locator('a[data-zoom]').first().click();
          assert.equal(await animationCount(page),0,'Image dialog cancels scene');
          await page.locator('.image-dialog img').evaluate(image => image.decode());
          if (kind === 'workflow') assert.match(await page.locator('.image-dialog img').getAttribute('alt'),lang === 'ko' ? /합성/ : /Synthetic/,'Enlargement identifies illustrative scans');
          await page.keyboard.press('Escape');
          await page.waitForFunction(() => !document.querySelector('.image-dialog').open);
          assert(await scene.locator('a[data-zoom]').first().evaluate(node => node === document.activeElement),'Zoom returns focus');
          await waitPlaying(page);
        }
        if (kind === 'workflow') {
          await page.locator('.is-current [data-read]').first().click();
          assert.equal(await animationCount(page),0,'Details cancel scene');
          await page.keyboard.press('Escape');
          await waitPlaying(page);
        }
        await page.locator('[data-reading]').click();
        const readingScene=page.locator(`#detail-${id} [data-clinical-scene="${kind}"]`);
        assert(await readingScene.isVisible(),'Complete static scene is visible in reading mode');
        await readingScene.scrollIntoViewIfNeeded();
        await waitPlaying(page);
        assert(await readingScene.locator('[data-scene-part]').evaluateAll(nodes => nodes.some(node => node.getAnimations().length)),'Visible reading scene starts automatically');
        await page.evaluate(() => scrollTo(0,0));
        await page.waitForTimeout(80);
        assert.equal(await animationCount(page),0,'Off-screen reading scenes stop');
        await page.locator('[data-reading]').click();
        await page.waitForTimeout(150);
        results.push({lang,width,height,kind,motion:true,automaticRepeat:true,interruption:true,noncurrentScenesCancelled:true,reduced:true,dialog:true,reading:true});
      }
    }
    await page.context().tracing.stop({path:`${out}/${lang}-actions.zip`});
    await page.close();
    const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:900}});
    await nojs.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
    for(const id of ['translation','research']) {
      const scene=nojs.locator(`#detail-${id} [data-clinical-scene]`);
      assert(await scene.isVisible(),'No-JS retains the complete scene');
      assert.equal(await scene.locator('[data-scene-replay]').count(),0,'No-JS has no replay button');
    }
    await nojs.emulateMedia({media:'print'});
    assert(await nojs.locator('#detail-research [data-clinical-scene]').isVisible(),'Print retains report comparison');
    await nojs.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} scene layouts and interaction cases; KO/EN, automatic repeat, wheel, dialogs, reading and reduced motion.`);
