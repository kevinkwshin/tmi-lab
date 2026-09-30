import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {researchEvidence} from '../src/research.mjs';
import {content} from '../src/content.mjs';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out=process.env.EVIDENCE_DIR || '.omo/evidence/research-stories';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args:['--no-proxy-server']});
const results=[];
const failures=[];
try {
 for(const lang of ['ko','en']) {
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  page.on('pageerror',e=>failures.push(String(e)));
  await page.goto(`${process.env.TEST_URL || 'http://127.0.0.1:4173/dist/'}${lang==='en'?'en/':''}?lang=${lang}`);
  for(const [width,height] of [[1280,800],[1280,640],[1440,900],[768,1024],[900,700],[1024,768],[375,667],[320,640],[320,568],[375,480]]) {
   await page.setViewportSize({width,height});
   await page.waitForTimeout(500);
   const ids=await page.locator('main > [data-slide]').evaluateAll(es=>es.map(e=>e.id));
   for(const id of ids) {
    await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
    const result=await page.evaluate(()=>{
     const frame=document.querySelector('.is-current .deck-page,.is-current .identity-opening');
     if(!frame)return null;
     const body=frame.querySelector('.deck-body') || frame;
     const b=body.getBoundingClientRect();
     const overflow=[...body.querySelectorAll('*')].filter(e=>{
      const r=e.getBoundingClientRect();
      return r.width&&r.height&&(r.top<b.top-2||r.bottom>b.bottom+2||r.left<b.left-2||r.right>b.right+2);
     }).map(e=>({class:e.className,text:e.textContent.slice(0,60),bounds:e.getBoundingClientRect().toJSON()}));
     const overlap=[];
     for(const stack of body.querySelectorAll('.story-mobile-opening,.story-mobile-context,.story-visual,.evidence-figure')) {
      const children=[...stack.children].map(e=>({class:e.className,rect:e.getBoundingClientRect()})).filter(e=>e.rect.width&&e.rect.height);
      for(let i=1;i<children.length;i++)if(children[i-1].rect.bottom>children[i].rect.top+2)overlap.push(`${stack.className}: ${children[i-1].class} / ${children[i].class}`);
     }
     return {id:frame.closest('[data-slide]').id,body:b.toJSON(),overflow,overlap,text:body.innerText,scenes:[...body.querySelectorAll('[data-clinical-scene]')].filter(e=>e.getBoundingClientRect().height).map(e=>e.dataset.clinicalScene),images:[...body.querySelectorAll('.evidence-media img')].map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,height:e.clientHeight})),identity:[...body.querySelectorAll('.identity-title>span>span')].map(e=>({size:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight}))};
    });
    if(!result)continue;
    assert.equal(result.id,id,'Capture must follow the completed responsive rebuild');
    results.push({lang,width,height,...result});
    if(id==='welcome') {
     assert.equal(result.identity.length,2,'Opening has two complete phrases');
     assert.deepEqual(result.identity[0],result.identity[1],'Opening phrases have the same type scale');
    }
    if(result.overflow.length)failures.push(`${lang} ${width}x${height} ${id}: ${result.overflow.map(e=>e.class).join(', ')}`);
    if(result.overlap.length)failures.push(`${lang} ${width}x${height} ${id}: overlapping ${result.overlap.join(', ')}`);
    if(['translation','transfers','research','research-imaging','research-signals'].includes(id)&&height>=640) {
     if(!result.images.length&&!result.scenes.includes('workflow'))failures.push(`${lang} ${width}x${height} ${id}: missing first-page evidence`);
     if(result.images.some(e=>!e.loaded))failures.push(`${lang} ${width}x${height} ${id}: image not loaded`);
    }
    await page.screenshot({path:`${out}/${lang}-${width}x${height}-${id}.png`});
   }
   if(height>=640) {
    const frames=results.filter(r=>r.lang===lang&&r.width===width&&r.height===height);
    const texts=frames.map(r=>r.text).join(' ').replace(/\s+/g,' ');
    const visibleImages=frames.flatMap(r=>r.images).filter(image=>image.loaded&&image.height>0).map(image=>image.src).join(' ');
    if(!frames.some(frame=>frame.scenes.includes('workflow')))failures.push(`${lang} ${width}x${height}: missing workflow comparison scene`);
    for(const name of ['research-twin-concept','research-precision-concept',...researchEvidence[lang].flatMap(e=>e.images.map(image=>image.name))]) {
     if(!visibleImages.includes(name))failures.push(`${lang} ${width}x${height}: missing illustrated concept or original figure: ${name}`);
    }
    const copy=[...content[lang].research.items.map(r=>r.body),...researchEvidence[lang].flatMap(e=>[e.method,e.value,e.note]),...content[lang].translation.items.filter(t=>t.name!=='AVIEW NeuroCAD').flatMap(t=>[t.impact,t.body])];
    for(const phrase of copy)if(!texts.includes(phrase.replace(/\s+/g,' ')))failures.push(`${lang} ${width}x${height}: missing visible copy: ${phrase}`);
   }
  }
  await page.close();
 }
}finally {await browser.close();}
await writeFile(`${out}/results.json`,JSON.stringify({results,failures},null,2));
console.log(failures.length?failures.join('\n'):`PASS: ${results.length} frames, actual nested bounds, visible research coverage, first-page images.`);
assert.deepEqual(failures,[]);
