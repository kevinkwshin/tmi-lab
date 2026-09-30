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
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>failures.push(String(e)));
  await page.goto(`${process.env.TEST_URL || 'http://127.0.0.1:4173/dist/'}${lang==='en'?'en/':''}?lang=${lang}`);
  for(const [width,height] of [[1280,800],[1280,640],[1440,900],[768,1024],[900,700],[1024,768],[375,667],[320,568],[375,480]]) {
   await page.setViewportSize({width,height});
   await page.waitForTimeout(250);
   const ids=await page.locator('main > [data-slide]').evaluateAll(es=>es.map(e=>e.id));
   for(const id of ids) {
    await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
    const result=await page.evaluate(()=>{
     const frame=document.querySelector('.is-current .deck-page');
     if(!frame)return null;
     const body=frame.querySelector('.deck-body');
     const b=body.getBoundingClientRect();
     const overflow=[...body.querySelectorAll('*')].filter(e=>{
      const r=e.getBoundingClientRect();
      return r.width&&r.height&&(r.top<b.top-2||r.bottom>b.bottom+2||r.left<b.left-2||r.right>b.right+2);
     }).map(e=>({class:e.className,text:e.textContent.slice(0,60),bounds:e.getBoundingClientRect().toJSON()}));
     return {id:frame.closest('[data-slide]').id,body:b.toJSON(),overflow,text:body.innerText,images:[...body.querySelectorAll('.evidence-media img')].map(e=>({loaded:e.complete&&e.naturalWidth>0,height:e.clientHeight}))};
    });
    if(!result)continue;
    results.push({lang,width,height,...result});
    if(result.overflow.length)failures.push(`${lang} ${width}x${height} ${id}: ${result.overflow.map(e=>e.class).join(', ')}`);
    if(['translation','transfers','research','research-imaging','research-signals'].includes(id)&&height>=640) {
     if(!result.images.length)failures.push(`${lang} ${width}x${height} ${id}: missing first-page evidence`);
     if(result.images.some(e=>!e.loaded))failures.push(`${lang} ${width}x${height} ${id}: image not loaded`);
    }
    if(!id.includes('--')||result.overflow.length)await page.screenshot({path:`${out}/${lang}-${width}x${height}-${id}.png`});
   }
   if(height>=640) {
    const texts=results.filter(r=>r.lang===lang&&r.width===width&&r.height===height).map(r=>r.text).join(' ').replace(/\s+/g,' ');
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
