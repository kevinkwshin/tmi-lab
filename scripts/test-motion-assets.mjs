import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out=process.env.EVIDENCE_DIR || '.omo/evidence/motion-assets';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args:['--no-proxy-server']});
const results=[];
const errors=[];
try {
 for(const [id,asset,selector] of [
  ['welcome','tmi-logo-film.mp4','.identity-opening [data-brand-mark]'],
  ['translation','neurocad-triage-clean.png','#translation .deck-body [data-clinical-scene]']
 ]) {
  for(const scenario of ['failed','delayed','left-while-loading','reduced-while-loading']) {
   const page=await browser.newPage({viewport:{width:1440,height:900}});
   const prefix=`${id}-${asset.replace(/\.(png|mp4)$/,'')}-${scenario}`;
   const artifacts=[`${prefix}-fallback.png`,`${prefix}-actions.zip`];
   await page.context().tracing.start({screenshots:true,snapshots:true});
   page.on('pageerror',error=>errors.push(String(error)));
   let release,requested;
   const hold=new Promise(resolve=>{release=resolve;});
   const requestStarted=new Promise(resolve=>{requested=resolve;});
   await page.route(`**/${asset}`,async route=>{
    requested();
    if(scenario==='failed') return route.abort();
    await hold;
    await route.continue();
   });
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await requestStarted;
   await page.waitForFunction(()=>typeof navigateTo==='function');
   await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
   const scene=page.locator(selector);
   const poster=scene.locator('img').first();
   await poster.evaluate(image=>image.decode());
   await page.waitForTimeout(1000);
   assert.equal(await poster.evaluate(node=>getComputedStyle(node).opacity),'1','Original image stays visible while extra artwork is unavailable');
   if(id==='welcome') {
    assert.equal(await scene.getAttribute('data-brand-playing'),null,'Unavailable video never covers its poster');
    assert.equal(await scene.locator('video').evaluate(node=>node.currentTime),0,'Unavailable video has no playback progress');
    assert.equal(await scene.locator('video').evaluate(node=>getComputedStyle(node).opacity),'0');
   } else assert.equal(await scene.evaluate(node=>node.getAnimations({subtree:true}).length),0,'No incomplete animation starts');
   await page.screenshot({path:`${out}/${prefix}-fallback.png`});
   if(scenario==='left-while-loading') await page.evaluate(()=>navigateTo(document.getElementById('contact'),false));
   if(scenario==='reduced-while-loading') await page.emulateMedia({reducedMotion:'reduce'});
   release();
   if(scenario==='delayed') {
    await page.waitForFunction(({selector,id})=>{
     const node=document.querySelector(selector),video=node.querySelector('video');
     return id==='welcome'?node.hasAttribute('data-brand-playing')&&!video.paused&&video.currentTime>.1:node.getAnimations({subtree:true}).length>0;
    },{selector,id});
    await page.waitForTimeout(1900);
    await page.screenshot({path:`${out}/${prefix}-ready.png`});
    artifacts.push(`${prefix}-ready.png`);
   } else {
    await page.waitForTimeout(1000);
    if(id==='welcome') {
     assert.equal(await scene.getAttribute('data-brand-playing'),null,'Failed or interrupted video cannot become visible');
     assert(await scene.locator('video').evaluate(node=>node.paused),'Failed or interrupted video remains paused');
     if(scenario==='failed')assert(await scene.locator('[data-brand-toggle]').evaluate(node=>node.hidden||node.disabled),'A failed video cannot offer a broken play control');
    } else assert.equal(await scene.evaluate(node=>node.getAnimations({subtree:true}).length),0,'Failure or interruption cannot launch a stale animation');
    assert.equal(await poster.evaluate(node=>getComputedStyle(node).opacity),'1');
   }
   results.push({id,asset,scenario,originalPoster:true,stalePlaybackPrevented:scenario!=='delayed',resumedWhenReady:scenario==='delayed',artifacts});
   await page.context().tracing.stop({path:`${out}/${prefix}-actions.zip`});
   await page.close();
  }
 }
 const blocked=await browser.newPage({viewport:{width:1440,height:900}});
 blocked.on('pageerror',error=>errors.push(String(error)));
 await blocked.context().tracing.start({screenshots:true,snapshots:true});
 await blocked.addInitScript(()=>{
  const play=HTMLMediaElement.prototype.play;
  window.__blockAutoplay=true;
  HTMLMediaElement.prototype.play=function(){
   if(window.__blockAutoplay)return Promise.reject(new DOMException('Autoplay blocked for QA','NotAllowedError'));
   return play.call(this);
  };
 });
 await blocked.goto(base);
 const blockedMark=blocked.locator('.identity-opening [data-brand-mark]');
 await blocked.waitForFunction(()=>document.querySelector('.identity-opening video')?.getAttribute('src'));
 await blocked.waitForTimeout(500);
 assert.equal(await blockedMark.getAttribute('data-brand-playing'),null);
 assert.equal(await blockedMark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1');
 const playButton=blockedMark.locator('[data-brand-toggle]');
 assert(await playButton.isVisible()&&await playButton.isEnabled(),'Blocked autoplay leaves an actionable play button');
 await blocked.screenshot({path:`${out}/autoplay-blocked.png`});
 await blocked.evaluate(()=>{window.__blockAutoplay=false;});
 await playButton.click();
 await blocked.waitForFunction(()=>{
  const node=document.querySelector('.identity-opening video');
  return !node.paused&&node.currentTime>.2&&node.closest('[data-brand-mark]').hasAttribute('data-brand-playing');
 });
 await blocked.screenshot({path:`${out}/autoplay-user-recovered.png`});
 await blocked.context().tracing.stop({path:`${out}/autoplay-actions.zip`});
 results.push({id:'welcome',scenario:'autoplay-blocked',usablePlay:true,recovered:true,artifacts:['autoplay-blocked.png','autoplay-user-recovered.png','autoplay-actions.zip']});
 await blocked.close();

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
console.log(`PASS: ${results.length} delayed, failed and interrupted artwork loads.`);
