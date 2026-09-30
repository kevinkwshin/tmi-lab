import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out=process.env.EVIDENCE_DIR || '.omo/evidence/identity';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args:['--no-proxy-server']});
const results=[];
const errors=[];
try {
 for(const lang of ['ko','en']) {
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference',recordVideo:{dir:out,size:{width:1440,height:900}}});
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
  await page.waitForFunction(()=>document.querySelector('[data-brand-mark][data-mascot-active]'));
  await page.locator('.identity-opening .brand-poster').evaluate(image=>image.decode());
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/${lang}-entry-start.png`});
  await page.waitForTimeout(1700);
  await page.screenshot({path:`${out}/${lang}-entry-mid.png`});
  await page.waitForFunction(()=>!document.querySelector('[data-mascot-active]'));
  await page.screenshot({path:`${out}/${lang}-entry-end.png`});
  assert.equal(await page.locator('.identity-initial').count(),6);
  for(const [width,height] of [[1440,900],[1280,640],[768,1024],[375,667],[320,640]]) {
   await page.setViewportSize({width,height});
   await page.waitForTimeout(350);
   const mark=page.locator('.identity-opening [data-brand-mark]');
   const replay=mark.locator('[data-brand-replay]');
   await replay.focus();
   await page.keyboard.press('Enter');
   assert(await mark.getAttribute('data-mascot-active')!==null,'Keyboard replay starts a greeting');
   assert(await replay.evaluate(node=>node===document.activeElement),'Replay retains focus');
   await mark.evaluate(node=>node.getAnimations({subtree:true}).forEach(animation=>{animation.pause();animation.currentTime=1040;}));
   const blink=await mark.locator('[data-mascot-blink="dragon"]').evaluate(node=>Number(getComputedStyle(node).opacity));
   assert(blink>.9,'Dragon eyelids visibly close during the greeting');
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-blink.png`});
   await mark.screenshot({path:`${out}/${lang}-${width}x${height}-logo-blink.png`});
   await mark.evaluate(node=>node.getAnimations({subtree:true}).forEach(animation=>{animation.currentTime=1450;}));
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-bow.png`});
   const pose=await mark.locator('[data-mascot-goose]').evaluate(node=>getComputedStyle(node).transform);
   assert.notEqual(pose,'none','Goose genuinely changes pose');
   assert.equal(await page.evaluate(()=>scrollY),0);
   await page.mouse.move(width/2,height/2);
   await page.mouse.wheel(0,24);
   await page.waitForFunction(()=>current>0);
   assert.equal(await page.locator('[data-mascot-active]').count(),0,'Wheel navigation cancels mascot immediately');
   await page.evaluate(()=>navigateTo(document.getElementById('welcome'),false));
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(100);
   assert.equal(await page.locator('[data-mascot-active]').count(),0,'Reduced motion restores original logo');
   assert.equal(await replay.isVisible(),false,'Reduced motion hides unavailable replay');
   assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1');
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-static.png`});
   const fit=await page.locator('.identity-opening').evaluate(frame=>{
    const r=frame.getBoundingClientRect();
    return [...frame.querySelectorAll('h1,p,.brand-mark,.identity-flow,.page-actions,.identity-directions')].filter(node=>{
     const b=node.getBoundingClientRect();
     return b.width&&b.height&&(b.top<r.top-2||b.bottom>r.bottom+2||b.left<r.left-2||b.right>r.right+2);
    }).map(node=>node.className);
   });
   assert.deepEqual(fit,[],'Headline, graphic, logo and actions fit the slide');
   const logo=await mark.locator('.brand-poster').boundingBox();
   assert(logo.height>=80,'The logo keeps meaningful visual size on narrow screens');
   await page.emulateMedia({reducedMotion:'no-preference'});
   results.push({lang,width,height,replay:true,blink:true,bow:true,wheel:true,reduced:true,bounded:true});
  }
  for(const id of ['translation','mission','research-imaging','research-signals']) {
   await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
   assert.doesNotMatch(await page.locator('.is-current').innerText(),/AI 생성|AI-generated|환자별 근거 해석/,'Concept production captions are absent');
  }
  await page.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:900}});
  await nojs.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
  assert(await nojs.locator('#detail-welcome .logo-figure img').isVisible(),'Original logo remains without JavaScript');
  assert.equal(await nojs.locator('[data-brand-replay]').isVisible(),false);
  await nojs.close();
 }
} finally {
 await browser.close();
 await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} bilingual identity layouts and motion/replay/keyboard/wheel/reduced-motion cases.`);
