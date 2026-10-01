import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out=process.env.EVIDENCE_DIR || '.omo/evidence/identity';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args:['--no-proxy-server']});
const results=[];
const errors=[];
const greeting='.identity-opening [data-brand-mark]';
const moving='[data-mascot-smile], [data-mascot-goose], [data-mascot-blink]';
try {
 for(const lang of ['ko','en']) {
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference',recordVideo:{dir:out,size:{width:1440,height:900}}});
  page.on('pageerror',error=>errors.push(String(error)));
  await page.context().tracing.start({screenshots:true,snapshots:true});
  await page.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
  await page.waitForFunction(()=>document.querySelector('.identity-opening [data-brand-mark]'));
  await page.locator('.identity-opening .brand-poster').evaluate(image=>image.decode());
  const mark=page.locator(greeting);
  assert.equal(await page.locator('.identity-flow').count(),0,'The removed hero line graphic is absent');
  assert.equal(await mark.locator('[data-mascot-wave], [data-mascot-resting-hand], .mascot-sleeve, .mascot-letter-repair').count(),0,'Dragon hand, sleeve and arm patches are absent');
  assert.equal(await mark.locator('[data-mascot-blink="dragon"]').count(),0,'The smiling face replaces the independent dragon blink');
  const smile=mark.locator('[data-mascot-smile]');
  assert.equal(await smile.locator(':scope > *').count(),1,'Smile contains only the registered face image');
  const smileImage=smile.locator('image');
  assert.match(await smileImage.getAttribute('href'),/tmi-logo-smile\.png$/,'Smile uses the cheerful logo artwork');
  const registration=await smileImage.evaluate(node=>{
   const maskId=node.getAttribute('mask')?.match(/#([^)]*)/)?.[1];
   const mask=document.getElementById(maskId);
   const bounds=mask?{x:mask.x.baseVal.value,y:mask.y.baseVal.value,width:mask.width.baseVal.value,height:mask.height.baseVal.value}:null;
   return {x:node.x.baseVal.value,y:node.y.baseVal.value,width:node.width.baseVal.value,height:node.height.baseVal.value,maskUnits:mask?.getAttribute('maskUnits'),mask:bounds};
  });
  assert.deepEqual([registration.x,registration.y,registration.width,registration.height],[0,0,1200,810],'Smile artwork stays registered to the full original logo');
  assert.equal(registration.maskUnits,'userSpaceOnUse','Face mask is registered in logo coordinates');
  assert(registration.mask&&registration.mask.x>=190&&registration.mask.y>=170&&registration.mask.x+registration.mask.width<=345&&registration.mask.y+registration.mask.height<=275,'Smile mask is confined to the dragon face, above its body and hands');
  const originalSrc=await mark.locator('.brand-poster').getAttribute('src');
  assert.equal(await mark.locator('.brand-motion > image').getAttribute('href'),originalSrc,'Original logo preserves the dragon body and both hands during the greeting');
  await page.waitForFunction(selector=>document.querySelector(selector)?.hasAttribute('data-mascot-active'),greeting);
  await page.screenshot({path:`${out}/${lang}-entry-start.png`});
  const timings=await mark.locator(moving).evaluateAll(nodes=>nodes.flatMap(node=>node.getAnimations().map(animation=>animation.effect.getTiming())));
  assert.equal(timings.length,3,'Smile, goose bow and goose blink each have one animation effect');
  const smileFrames=await smile.evaluate(node=>node.getAnimations().flatMap(animation=>animation.effect.getKeyframes()));
  assert(smileFrames.length>0&&smileFrames.every(frame=>Object.keys(frame).every(key=>['offset','computedOffset','easing','composite','opacity'].includes(key))),'Smile animates opacity only');
  assert.equal(await mark.evaluate(node=>getComputedStyle(node).getPropertyValue('--mascot-rest').trim()),'2800ms','Greeting retains the 2800ms rest');
  assert(timings.every(timing=>timing.duration===4400&&timing.delay===800),'Greeting uses a 4400ms cycle with an 800ms entry lead');
  const samplesPromise=mark.evaluate(mark=>new Promise((resolve,reject)=>{
   const start=performance.now();
   const samples=[];
   function sample() {
    const smile=getComputedStyle(mark.querySelector('[data-mascot-smile]'));
    const goose=new DOMMatrix(getComputedStyle(mark.querySelector('[data-mascot-goose]')).transform);
    samples.push({time:performance.now()-start,smileOpacity:Number(smile.opacity),smileTransform:smile.transform,goose:Math.atan2(goose.b,goose.a)*180/Math.PI,blink:Math.max(...[...mark.querySelectorAll('[data-mascot-blink]')].map(node=>Number(getComputedStyle(node).opacity)))});
    if(!mark.hasAttribute('data-mascot-active')) return resolve(samples);
    if(performance.now()-start>6500) return reject(new Error('Greeting did not settle naturally'));
    requestAnimationFrame(sample);
   }
   sample();
  }));
  await page.waitForTimeout(1800);
  await page.screenshot({path:`${out}/${lang}-entry-mid.png`});
  const samples=await samplesPromise;
  await writeFile(`${out}/${lang}-motion-samples.json`,JSON.stringify(samples,null,2));
  assert(samples[0].smileOpacity<.05,'Greeting begins with the original face');
  const visibleSmile=samples.filter(sample=>sample.smileOpacity>.95);
  assert(visibleSmile.length>0,'Cheerful face becomes fully visible');
  assert(visibleSmile.at(-1).time-visibleSmile[0].time>=1000,'Cheerful face stays clearly visible for at least one second');
  assert(samples.at(-1).smileOpacity<.05,'Face crossfade restores the original logo');
  assert(samples.every(sample=>sample.smileTransform==='none'||sample.smileTransform==='matrix(1, 0, 0, 1, 0, 0)'),'Smile does not transform the dragon');
  assert(Math.min(...samples.map(sample=>sample.goose))<=-5,'Goose visibly bows');
  assert(Math.min(...samples.map(sample=>sample.goose))>=-6.5,'Goose bow stays within its gentle six-degree range');
  assert(Math.max(...samples.map(sample=>sample.blink))>=.8,'Registered eyelids visibly blink');
  assert(Math.min(...samples.map(sample=>sample.blink))<=.05,'Eyelids reopen after blinking');
  assert(Math.abs(samples.at(-1).goose)<.1,'Goose returns to its original pose');
  await page.screenshot({path:`${out}/${lang}-entry-end.png`});
  assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1','Original poster returns during rest');
  await page.waitForTimeout(1800);
  assert.equal(await mark.getAttribute('data-mascot-active'),null,'A quiet rest separates greetings');
  await page.waitForFunction(selector=>document.querySelector(selector)?.hasAttribute('data-mascot-active'),greeting);
  assert.equal(await mark.locator('.brand-poster').getAttribute('src'),originalSrc,'Greeting retains the original poster source');
  results.push({lang,naturalCycle:true,measuredSmile:true,opacityOnly:true,faceRegistration:registration,originalHandsPreserved:true,heroGraphicAbsent:true,measuredBow:true,blink:true,rest:true,automaticRepeat:true,artifacts:[`${lang}-motion-samples.json`,`${lang}-entry-start.png`,`${lang}-entry-mid.png`,`${lang}-entry-end.png`]});
  assert.equal(await page.locator('[data-brand-replay], [data-scene-replay]').count(),0,'All replay controls are removed');
  assert.equal(await page.locator('.identity-initial').count(),6);
  for(const [width,height] of [[1440,900],[1280,640],[768,1024],[375,667],[320,640]]) {
   await page.setViewportSize({width,height});
   await page.waitForTimeout(350);
   assert.equal(await page.locator('.identity-flow').count(),0,'Hero line graphic remains absent at every viewport');
   assert.equal(await page.evaluate(()=>scrollY),0);
   await page.mouse.move(width/2,height/2);
   await page.mouse.wheel(0,24);
   await page.waitForFunction(()=>current>0);
   await page.evaluate(()=>navigateTo(document.getElementById('welcome'),false));
   await page.waitForFunction(selector=>document.querySelector(selector)?.hasAttribute('data-mascot-active'),greeting);
   await page.waitForTimeout(1700);
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-greeting.png`});
   const movingBounds=await mark.locator('[data-mascot-smile], [data-mascot-goose]').evaluateAll(nodes=>nodes.map(node=>{
    const bounds=node.getBoundingClientRect();
    return bounds.width>0&&bounds.height>0&&bounds.left>=0&&bounds.right<=innerWidth&&bounds.top>=0&&bounds.bottom<=innerHeight;
   }));
   assert(movingBounds.length===2&&movingBounds.every(Boolean),'Smile artwork and bowing goose remain inside the viewport');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(100);
   assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1');
   assert.equal(await mark.locator(moving).evaluateAll(nodes=>nodes.flatMap(node=>node.getAnimations()).length),0,'Reduced motion cancels every mascot animation');
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-static.png`});
   const fit=await page.locator('.identity-opening').evaluate(frame=>{
    const r=frame.getBoundingClientRect();
    return [...frame.querySelectorAll('h1,p,.brand-mark,.page-actions,.identity-directions')].filter(node=>{
     const b=node.getBoundingClientRect();
     return b.width&&b.height&&(b.top<r.top-2||b.bottom>r.bottom+2||b.left<r.left-2||b.right>r.right+2);
    }).map(node=>node.className);
   });
   assert.deepEqual(fit,[],'Headline, logo and actions fit the slide');
   const logo=await mark.locator('.brand-poster').boundingBox();
   assert(logo.height>=80,'The logo keeps meaningful visual size on narrow screens');
   await page.emulateMedia({reducedMotion:'no-preference'});
   results.push({lang,width,height,staticOriginal:true,wheel:true,reduced:true,bounded:true,movingBounds:true,artifacts:[`${lang}-${width}x${height}-greeting.png`,`${lang}-${width}x${height}-static.png`]});
  }
  for(const id of ['translation','mission','research-imaging','research-signals']) {
   await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
   assert.doesNotMatch(await page.locator('.is-current').innerText(),/AI 생성|AI-generated|환자별 근거 해석/,'Concept production captions are absent');
  }
  await page.context().tracing.stop({path:`${out}/${lang}-actions.zip`});
  await page.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:900}});
  await nojs.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
  assert(await nojs.locator('#detail-welcome .logo-figure img').isVisible(),'Original logo remains without JavaScript');
  assert.equal(await nojs.locator('[data-brand-replay]').count(),0);
  assert.equal(await nojs.locator('.identity-flow').count(),0,'Hero line graphic is absent without JavaScript');
  await nojs.screenshot({path:`${out}/${lang}-no-js.png`});
  results.push({lang,noJavaScript:true,originalPoster:true,artifacts:[`${lang}-no-js.png`]});
  await nojs.close();
 }
} finally {
 await browser.close();
 await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} bilingual greeting, fallback, layout, wheel and reduced-motion cases.`);
