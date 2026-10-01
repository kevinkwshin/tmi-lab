import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out = process.env.EVIDENCE_DIR || '.omo/evidence/animation-loops';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const results = [];
const errors = [];
const parts = '[data-scene-part]';
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
  const mark=page.locator('.identity-opening [data-brand-mark]');
  const video=mark.locator('[data-brand-video]');
  const videoPlaying=async target=>{
    await target.evaluate(node=>new Promise((resolve,reject)=>{
      const start=performance.now();
      function check(){
        if(!node.paused&&node.currentTime>0&&node.closest('[data-brand-mark]').hasAttribute('data-brand-playing'))return resolve();
        if(performance.now()-start>10000)return reject(new Error('Video did not resume'));
        requestAnimationFrame(check);
      }
      check();
    }));
    const before=await target.evaluate(node=>node.currentTime);
    await page.waitForTimeout(250);
    const after=await target.evaluate(node=>node.currentTime);
    assert(after>before+.1||after<before-1,'Resumed video actually advances');
  };
  const videoPaused=async target=>{
    const state=await target.evaluate(node=>({paused:node.paused,playing:node.closest('[data-brand-mark]').hasAttribute('data-brand-playing'),opacity:getComputedStyle(node).opacity,time:node.currentTime}));
    assert(state.paused&&!state.playing&&state.opacity==='0','Interrupted video pauses and exposes its poster');
    await page.waitForTimeout(350);
    assert(Math.abs(await target.evaluate(node=>node.currentTime)-state.time)<.05,'Interrupted playback stays stopped');
  };
  await videoPlaying(video);
  await page.evaluate(()=>navigateTo(document.getElementById('contact'),false));
  await videoPaused(video);
  await page.evaluate(()=>navigateTo(document.getElementById('welcome'),false));
  await videoPlaying(video);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(100);
  await videoPaused(video);
  await page.screenshot({path:`${out}/welcome-reduced.png`});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await videoPlaying(video);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await videoPaused(video);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await videoPlaying(video);
  await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));
  await videoPaused(video);
  await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
  await videoPlaying(video);
  await page.evaluate(()=>{
    document.dispatchEvent(new CustomEvent('image:open'));
    document.querySelector('.reading-dialog').showModal();
  });
  await videoPaused(video);
  await page.screenshot({path:`${out}/welcome-dialog.png`});
  await page.locator('.reading-dialog button').click();
  await videoPlaying(video);
  await video.evaluate(node=>{window.__videoResizePauses=0;node.addEventListener('pause',()=>window.__videoResizePauses++);});
  await page.setViewportSize({width:1280,height:800});
  await page.waitForTimeout(450);
  await videoPlaying(video);
  assert(await page.evaluate(()=>window.__videoResizePauses)>0,'Responsive layout pauses video before resuming');
  await page.screenshot({path:`${out}/welcome-resumed.png`});
  results.push({id:'welcome',nativeVideo:true,activeNavigation:true,reducedMotion:true,visibilitySignal:true,printSignals:true,dialog:true,resizeResume:true,measuredProgress:true,artifacts:['actions.zip','welcome-dialog.png','welcome-reduced.png','welcome-resumed.png']});
  for (const id of ['translation','mission','research-imaging','research-signals','research']) {
    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await page.evaluate(() => navigateTo(document.getElementById('contact'),false));
    assert.equal(await count(page),0,`${id}: navigation cancels active playback`);
    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await finishCycle(page);
    await page.evaluate(() => navigateTo(document.getElementById('contact'),false));
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: leaving during the rest cancels the pending repeat`);

    await page.evaluate(id => navigateTo(document.getElementById(id),false), id);
    await playing(page);
    await finishCycle(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(3100);
    assert.equal(await count(page),0,`${id}: reduced motion cancels the pending repeat`);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await playing(page);

    // Supply the browser visibility signal deterministically in a headless context.
    await page.evaluate(() => {
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await count(page),0,`${id}: hidden-page signal cancels active playback`);
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
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    await playing(page);
    results.push({id,activeNavigation:true,restCancellation:true,reducedMotion:true,visibilitySignal:true,printSignals:true,resume:true,artifacts:['actions.zip']});
  }
  await page.locator('[data-reading]').click();
  const readingScene = page.locator('#detail-research [data-clinical-scene]');
  await readingScene.scrollIntoViewIfNeeded();
  await playing(page);
  await page.setViewportSize({width:1400,height:900});
  await page.waitForTimeout(350);
  assert(await readingScene.locator('[data-scene-part]').evaluateAll(nodes => nodes.some(node => node.getAnimations().length)),'Visible reading scene resumes after responsive layout settles');
  await page.screenshot({path:`${out}/reading-resize.png`});
  results.push({id:'reading-research',resizeResume:true,artifacts:['actions.zip','reading-resize.png']});
  const readingVideo=page.locator('#detail-welcome [data-brand-video]');
  await readingVideo.scrollIntoViewIfNeeded();
  await videoPlaying(readingVideo);
  await videoPaused(video);
  await page.screenshot({path:`${out}/reading-welcome-playing.png`});
  const readingPoster=page.locator('#detail-welcome .brand-poster');
  const playingBounds=await readingVideo.boundingBox();
  const posterBounds=await readingPoster.boundingBox();
  for(const key of ['x','y','width','height'])assert(Math.abs(playingBounds[key]-posterBounds[key])<1,'Reading video and poster occupy the same box');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(100);
  await videoPaused(readingVideo);
  const pausedBounds=await readingPoster.boundingBox();
  for(const key of ['x','y','width','height'])assert(Math.abs(playingBounds[key]-pausedBounds[key])<1,'Reading poster does not shift when playback pauses');
  await page.screenshot({path:`${out}/reading-welcome-poster.png`});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await videoPlaying(readingVideo);
  await readingScene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await videoPaused(readingVideo);
  await readingVideo.scrollIntoViewIfNeeded();
  await videoPlaying(readingVideo);
  results.push({id:'reading-welcome',visibleAutoplay:true,offscreenPause:true,resume:true,posterAlignment:true,playingBounds,pausedBounds,artifacts:['actions.zip','reading-welcome-playing.png','reading-welcome-poster.png']});
  await page.context().tracing.stop({path:`${out}/actions.zip`});
  await page.close();
} catch(error) {
 for(const [index,context] of browser.contexts().entries()) {
  const page=context.pages()[0];
  if(page) {
   await page.screenshot({path:`${out}/failure-${index}.png`});
   const state=await page.evaluate(()=>({hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,rootClass:document.documentElement.className,current:document.querySelector('.is-current')?.id,videos:[...document.querySelectorAll('[data-brand-video]')].map(video=>({src:video.currentSrc,paused:video.paused,time:video.currentTime,readyState:video.readyState,error:video.error?.message,mark:video.closest('[data-brand-mark]').outerHTML,bounds:video.getBoundingClientRect().toJSON()}))}));
   await writeFile(`${out}/failure-${index}.json`,JSON.stringify({error:String(error),state},null,2));
  }
  await context.tracing.stop({path:`${out}/failure-${index}-actions.zip`}).catch(()=>{});
 }
 throw error;
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} animation loops cancel pending repeats and resume after interruptions.`);
