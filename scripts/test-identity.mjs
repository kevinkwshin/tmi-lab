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
const moving='[data-mascot-wave], [data-mascot-resting-hand], [data-mascot-goose], [data-mascot-blink]';
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
  const palm=mark.locator('[data-mascot-wave] > image');
  assert.equal(await mark.locator('[data-mascot-wave] > *').count(),1,'Only the separate palm rotates, without the sleeve or arm');
  assert.match(await palm.getAttribute('href'),/tmi-dragon-palm\.png$/,'The wave uses the upright front-palm artwork');
  assert.equal(await mark.locator('[data-mascot-wave]').evaluate(node=>getComputedStyle(node).transformOrigin),'392px 244px','The palm rotates at the wrist');
  const alpha=await palm.evaluate(async node=>{
   const image=new Image();
   image.src=node.href.baseVal;
   await image.decode();
   const canvas=document.createElement('canvas');
   canvas.width=image.naturalWidth;
   canvas.height=image.naturalHeight;
   const context=canvas.getContext('2d');
   context.drawImage(image,0,0);
   const data=context.getImageData(0,0,canvas.width,canvas.height).data;
   let transparent=0,opaque=0;
   for(let i=3;i<data.length;i+=4) { if(data[i]===0)transparent++; if(data[i]===255)opaque++; }
   return {transparent,opaque};
  });
  assert(alpha.transparent>0&&alpha.opaque>0,'The palm asset has both transparent background and visible artwork');
  const originalSrc=await mark.locator('.brand-poster').getAttribute('src');
  await page.waitForFunction(selector=>document.querySelector(selector)?.hasAttribute('data-mascot-active'),greeting);
  await page.screenshot({path:`${out}/${lang}-entry-start.png`});
  const timings=await mark.locator(moving).evaluateAll(nodes=>nodes.flatMap(node=>node.getAnimations().map(animation=>animation.effect.getTiming())));
  assert(timings.length>=5,'Palm, resting hand, bow, and both blinks have animation effects');
  assert(timings.every(timing=>timing.duration===4400&&timing.delay===800),'Greeting uses a 4400ms cycle with an 800ms entry lead');
  const samplesPromise=mark.evaluate(mark=>new Promise((resolve,reject)=>{
   const start=performance.now();
   const samples=[];
   function sample() {
    const wave=new DOMMatrix(getComputedStyle(mark.querySelector('[data-mascot-wave]')).transform);
    const goose=new DOMMatrix(getComputedStyle(mark.querySelector('[data-mascot-goose]')).transform);
    samples.push({time:performance.now()-start,wave:Math.atan2(wave.b,wave.a)*180/Math.PI,palmOpacity:Number(getComputedStyle(mark.querySelector('[data-mascot-wave]')).opacity),restingHandOpacity:Number(getComputedStyle(mark.querySelector('[data-mascot-resting-hand]')).opacity),goose:Math.atan2(goose.b,goose.a)*180/Math.PI,blink:Math.max(...[...mark.querySelectorAll('[data-mascot-blink]')].map(node=>Number(getComputedStyle(node).opacity)))});
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
  assert(Math.min(...samples.map(sample=>sample.wave))<=-17,'Palm reaches its counterclockwise wave');
  assert(Math.max(...samples.map(sample=>sample.wave))>=15,'Palm reaches its clockwise wave');
  const waveExtremes=samples.filter(sample=>sample.palmOpacity>.95&&(sample.wave<-16||sample.wave>14)).map(sample=>sample.wave>14?'out':'back');
  const waveTurns=waveExtremes.filter((pose,index)=>pose!==waveExtremes[index-1]);
  assert.deepEqual(waveTurns,['out','back','out','back','out'],'Visible upright palm waves in both directions three times');
  assert(samples[0].palmOpacity<.05&&samples[0].restingHandOpacity>.95,'Greeting begins with the original resting hand');
  assert(samples.some(sample=>sample.palmOpacity>.95&&sample.restingHandOpacity<.05),'Upright palm replaces the resting hand during the wave');
  assert(samples.at(-1).palmOpacity<.05&&samples.at(-1).restingHandOpacity>.95,'Crossfade restores the original resting hand');
  assert(Math.min(...samples.map(sample=>sample.goose))<=-5,'Goose visibly bows');
  assert(Math.min(...samples.map(sample=>sample.goose))>=-6.5,'Goose bow stays within its gentle six-degree range');
  assert(Math.max(...samples.map(sample=>sample.blink))>=.8,'Registered eyelids visibly blink');
  assert(Math.min(...samples.map(sample=>sample.blink))<=.05,'Eyelids reopen after blinking');
  assert(Math.abs(samples.at(-1).wave)<.1&&Math.abs(samples.at(-1).goose)<.1,'Characters return to their original pose');
  await page.screenshot({path:`${out}/${lang}-entry-end.png`});
  assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1','Original poster returns during rest');
  await page.waitForTimeout(1800);
  assert.equal(await mark.getAttribute('data-mascot-active'),null,'A quiet rest separates greetings');
  await page.waitForFunction(selector=>document.querySelector(selector)?.hasAttribute('data-mascot-active'),greeting);
  assert.equal(await mark.locator('.brand-poster').getAttribute('src'),originalSrc,'Greeting retains the original poster source');
  results.push({lang,naturalCycle:true,measuredWave:true,wristPivot:true,transparentPalm:alpha,restingHandCrossfade:true,heroGraphicAbsent:true,measuredBow:true,blink:true,rest:true,automaticRepeat:true,artifacts:[`${lang}-motion-samples.json`,`${lang}-entry-start.png`,`${lang}-entry-mid.png`,`${lang}-entry-end.png`]});
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
   const movingBounds=await mark.locator('[data-mascot-wave], [data-mascot-goose]').evaluateAll(nodes=>nodes.map(node=>{
    const bounds=node.getBoundingClientRect();
    return bounds.width>0&&bounds.height>0&&bounds.left>=0&&bounds.right<=innerWidth&&bounds.top>=0&&bounds.bottom<=innerHeight;
   }));
   assert(movingBounds.length===2&&movingBounds.every(Boolean),'Both moving characters remain inside the viewport');
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
