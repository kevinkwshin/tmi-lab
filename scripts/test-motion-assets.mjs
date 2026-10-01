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
  ['welcome','tmi-logo-motion-base.png','.identity-opening [data-brand-mark]'],
  ['welcome','tmi-dragon-palm.png','.identity-opening [data-brand-mark]'],
  ['translation','neurocad-triage-clean.png','#translation .deck-body [data-clinical-scene]']
 ]) {
  for(const scenario of ['failed','delayed','left-while-loading','reduced-while-loading']) {
   const page=await browser.newPage({viewport:{width:1440,height:900}});
   const prefix=`${id}-${asset.replace(/\.png$/,'')}-${scenario}`;
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
   assert.equal(await scene.evaluate(node=>node.getAnimations({subtree:true}).length),0,'No incomplete animation starts');
   await page.screenshot({path:`${out}/${prefix}-fallback.png`});
   if(scenario==='left-while-loading') await page.evaluate(()=>navigateTo(document.getElementById('contact'),false));
   if(scenario==='reduced-while-loading') await page.emulateMedia({reducedMotion:'reduce'});
   release();
   if(scenario==='delayed') {
    await page.waitForFunction(selector=>document.querySelector(selector).getAnimations({subtree:true}).length>0,selector);
    await page.waitForTimeout(1900);
    await page.screenshot({path:`${out}/${prefix}-ready.png`});
    artifacts.push(`${prefix}-ready.png`);
   } else {
    await page.waitForTimeout(1000);
    assert.equal(await scene.evaluate(node=>node.getAnimations({subtree:true}).length),0,'Failure or interruption cannot launch a stale animation');
    assert.equal(await poster.evaluate(node=>getComputedStyle(node).opacity),'1');
   }
   results.push({id,asset,scenario,originalPoster:true,stalePlaybackPrevented:scenario!=='delayed',resumedWhenReady:scenario==='delayed',artifacts});
   await page.context().tracing.stop({path:`${out}/${prefix}-actions.zip`});
   await page.close();
  }
 }
} finally {
 await browser.close();
 await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} delayed, failed and interrupted artwork loads.`);
