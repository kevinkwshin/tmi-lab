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
const playing=page=>page.waitForFunction(selector=>{
 const mark=document.querySelector(selector),video=mark?.querySelector('video');
 return mark?.hasAttribute('data-brand-playing')&&!video.paused&&video.readyState>=2&&video.currentTime>0;
},greeting);
const paused=async mark=>{
 const video=mark.locator('video');
 assert(await video.evaluate(node=>node.paused),'Video is paused');
 assert.equal(await mark.getAttribute('data-brand-playing'),null,'Paused video reveals its poster');
 assert.equal(await video.evaluate(node=>getComputedStyle(node).opacity),'0');
 assert.equal(await mark.locator('.brand-poster').evaluate(node=>getComputedStyle(node).opacity),'1');
 const time=await video.evaluate(node=>node.currentTime);
 await new Promise(resolve=>setTimeout(resolve,300));
 assert(Math.abs(await video.evaluate(node=>node.currentTime)-time)<.05,'Paused playback time stays fixed');
};
try {
 for(const lang of ['ko','en']) {
  const url=`${base}${lang==='en'?'en/':''}?lang=${lang}`;
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference',recordVideo:{dir:out,size:{width:1440,height:900}}});
  page.on('pageerror',error=>errors.push(String(error)));
  await page.context().tracing.start({screenshots:true,snapshots:true});
  await page.goto(url);
  const mark=page.locator(greeting),video=mark.locator('[data-brand-video]'),toggle=mark.locator('[data-brand-toggle]');
  await mark.locator('.brand-poster').evaluate(image=>image.decode());
  assert.equal(await page.locator('.identity-flow').count(),0,'Removed hero line graphic stays absent');
  assert.equal(await mark.locator('svg.brand-motion,[data-mascot-wave],[data-mascot-smile],[data-mascot-goose],[data-mascot-blink],[data-mascot-resting-hand]').count(),0,'Video replaces all SVG mascot parts');
  assert.match(await mark.locator('.brand-poster').getAttribute('src'),/tmi-logo-video-poster\.jpg$/);
  assert.match(await video.getAttribute('data-src'),/tmi-logo-film\.mp4$/);
  const attributes=await video.evaluate(node=>({muted:node.muted,loop:node.loop,inline:node.playsInline,preload:node.preload,controls:node.controls,fit:getComputedStyle(node).objectFit}));
  assert.deepEqual(attributes,{muted:true,loop:true,inline:true,preload:'none',controls:false,fit:'contain'});
  await playing(page);
  const dimensions=await video.evaluate(node=>({width:node.videoWidth,height:node.videoHeight,duration:node.duration}));
  assert.deepEqual([dimensions.width,dimensions.height],[1280,720]);
  assert(Math.abs(dimensions.duration-10)<.2,'The supplied ten-second film plays at its natural duration');
  assert.match(await toggle.getAttribute('aria-label'),lang==='ko'?/일시.*정지/:/pause/i);
  await page.screenshot({path:`${out}/${lang}-entry-start.png`});
  const samplesPromise=video.evaluate(node=>new Promise((resolve,reject)=>{
   const start=performance.now(),samples=[];
   function sample(){
    samples.push({time:performance.now()-start,currentTime:node.currentTime,paused:node.paused,playing:node.closest('[data-brand-mark]').hasAttribute('data-brand-playing')});
    const loop=samples.findIndex((sample,index)=>index>0&&sample.currentTime<samples[index-1].currentTime-1);
    if(loop>0&&node.currentTime>1)return resolve(samples);
    if(performance.now()-start>14000)return reject(new Error('Video did not naturally enter its second loop'));
    requestAnimationFrame(sample);
   }
   sample();
  }));
  await page.waitForTimeout(2500);
  await page.screenshot({path:`${out}/${lang}-entry-mid.png`});
  const samples=await samplesPromise;
  await writeFile(`${out}/${lang}-video-samples.json`,JSON.stringify(samples,null,2));
  assert(samples.some(sample=>sample.currentTime>8),'Playback time advances through the first loop');
  assert(samples.every(sample=>!sample.paused&&sample.playing),'Natural looping does not insert a resting gap');
  await page.screenshot({path:`${out}/${lang}-second-loop.png`});
  await toggle.focus();
  await page.keyboard.press('Space');
  await paused(mark);
  assert.match(await toggle.getAttribute('aria-label'),lang==='ko'?/재생/:/play/i);
  await page.setViewportSize({width:1280,height:800});
  await page.waitForTimeout(450);
  await paused(mark);
  await page.evaluate(()=>navigateTo(document.getElementById('contact'),false));
  await page.evaluate(()=>navigateTo(document.getElementById('welcome'),false));
  await page.waitForTimeout(450);
  await paused(mark);
  await page.screenshot({path:`${out}/${lang}-user-paused.png`});
  await toggle.focus();
  await page.keyboard.press('Enter');
  await playing(page);
  results.push({lang,naturalSecondLoop:true,keyboardToggle:true,pausePersists:true,videoAttributes:attributes,dimensions,artifacts:[`${lang}-video-samples.json`,`${lang}-entry-start.png`,`${lang}-entry-mid.png`,`${lang}-second-loop.png`,`${lang}-user-paused.png`,`${lang}-actions.zip`]});
  assert.equal(await page.locator('[data-brand-replay], [data-scene-replay]').count(),0);
  assert.equal(await page.locator('.identity-initial').count(),6);
  for(const [width,height] of [[1440,900],[1280,640],[768,1024],[375,667],[320,640]]) {
   await page.setViewportSize({width,height});
   await page.waitForTimeout(450);
   await playing(page);
   assert.equal(await page.locator('.identity-flow').count(),0,'Hero line graphic remains absent at every viewport');
   assert.equal(await page.evaluate(()=>scrollY),0);
   await page.mouse.move(width/2,height/2);
   await page.mouse.wheel(0,24);
   await page.waitForFunction(()=>current>0);
   assert(await video.evaluate(node=>node.paused),'Wheel navigation pauses the hidden video');
   await page.evaluate(()=>navigateTo(document.getElementById('welcome'),false));
   await playing(page);
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-playing.png`});
   const fit=await page.locator('.identity-opening').evaluate(frame=>{
    const r=frame.getBoundingClientRect();
    return [...frame.querySelectorAll('h1,p,.brand-mark,.page-actions,.identity-directions,[data-brand-toggle]')].filter(node=>{
     const b=node.getBoundingClientRect();
     return b.width&&b.height&&(b.top<r.top-2||b.bottom>r.bottom+2||b.left<r.left-2||b.right>r.right+2);
    }).map(node=>node.className);
   });
   assert.deepEqual(fit,[],'Headline, video and controls fit the slide');
   const bounds=await video.boundingBox();
   assert(bounds.height>=80&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=height,'Video stays meaningfully sized and inside the viewport');
   if(width<359) {
    const button=await toggle.boundingBox();
    assert(bounds.x+bounds.width<button.x,'Compact playback button stays outside the video and tagline');
   }
   if(width>=1280)assert(await page.locator('.identity-opening .page-lead').evaluate(node=>node.getBoundingClientRect().height<=parseFloat(getComputedStyle(node).lineHeight)+2),'Desktop description remains one line');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(100);
   await paused(mark);
   await page.screenshot({path:`${out}/${lang}-${width}x${height}-static.png`});
   await page.emulateMedia({reducedMotion:'no-preference'});
   results.push({lang,width,height,wheel:true,reduced:true,bounded:true,artifacts:[`${lang}-${width}x${height}-playing.png`,`${lang}-${width}x${height}-static.png`,`${lang}-actions.zip`]});
  }
  for(const id of ['translation','mission','research-imaging','research-signals']) {
   await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
   assert.doesNotMatch(await page.locator('.is-current').innerText(),/AI 생성|AI-generated|환자별 근거 해석/);
  }
  await page.context().tracing.stop({path:`${out}/${lang}-actions.zip`});
  await page.close();
  for(const fallback of ['no-js','reduced-initial']) {
   const fallbackPage=await browser.newPage({javaScriptEnabled:fallback!=='no-js',reducedMotion:'reduce',viewport:{width:1440,height:900}});
   await fallbackPage.goto(url);
   const fallbackMark=fallbackPage.locator(fallback==='no-js'?'#detail-welcome [data-brand-mark]':greeting);
   assert(await fallbackMark.locator('.brand-poster').isVisible(),'Video first-frame poster remains visible');
   assert.equal(await fallbackPage.locator('.identity-flow,[data-brand-replay]').count(),0,'Removed graphic and replay controls stay absent in fallback');
   assert.equal(await fallbackPage.locator('[data-brand-video][src]').count(),0,'Ineligible video sources are not loaded');
   if(fallback==='no-js')assert.equal(await fallbackPage.locator('[data-brand-toggle]:visible').count(),0,'Without JavaScript playback controls stay hidden');
   else await paused(fallbackMark);
   await fallbackPage.screenshot({path:`${out}/${lang}-${fallback}.png`});
   results.push({lang,fallback,poster:true,lazySource:true,artifacts:[`${lang}-${fallback}.png`]});
   await fallbackPage.close();
  }
 }
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
console.log(`PASS: ${results.length} bilingual video, natural loop, fallback, layout and keyboard cases.`);
