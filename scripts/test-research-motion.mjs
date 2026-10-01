import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const out = process.env.EVIDENCE_DIR || '.omo/evidence/research-motion';
await mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args:['--no-proxy-server']});
const results = [];
const errors = [];
const scenes = [['translation','triage'],['mission','mission'],['research-imaging','twin'],['research-signals','precision']];
const pose = (scene,part) => scene.locator(`[data-scene-part="${part}"]`).evaluate(node => {
  const style = getComputedStyle(node);
  const matrix = new DOMMatrix(style.transform);
  return {opacity:Number(style.opacity),x:matrix.e,y:matrix.f};
});
const frame = async (scene,progress) => {
  await scene.locator('[data-scene-part]').evaluateAll((nodes,progress) => {
    for(const node of nodes) for(const animation of node.getAnimations()) {
      animation.pause();
      const timing=animation.effect.getTiming();
      animation.currentTime=timing.delay+timing.duration*progress;
    }
  },progress);
};
try {
  for(const lang of ['ko','en']) {
    const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(`${base}${lang==='en'?'en/':''}?lang=${lang}`);
    for(const [width,height] of [[1440,900],[1280,640],[768,1024],[375,667]]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(350);
      for(const [id,kind] of scenes) {
        await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
        const scene = page.locator(`.is-current .deck-body [data-clinical-scene="${kind}"]`);
        assert.equal(await scene.count(),1);
        await scene.locator('img').evaluateAll(nodes=>Promise.all(nodes.map(node=>node.decode())));
        const fit = await scene.evaluate(node=>{
          const body=node.closest('.deck-body').getBoundingClientRect();
          const rect=node.getBoundingClientRect();
          return rect.left>=body.left-2 && rect.right<=body.right+2 && rect.top>=body.top-2 && rect.bottom<=body.bottom+2;
        });
        assert(fit,`${lang} ${width}x${height} ${kind} fits`);
        assert.equal(await scene.locator('[data-scene-part]').evaluateAll(nodes=>nodes.flatMap(n=>n.getAnimations()).length),0);
        await page.screenshot({path:`${out}/${lang}-${width}x${height}-${kind}-static.png`});
        results.push({lang,width,height,kind,static:true,bounded:true});
      }
    }
    for(const [width,height] of [[1440,900],[375,667]]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(350);
      await page.emulateMedia({reducedMotion:'no-preference'});
      for(const [id,kind] of scenes) {
        await page.evaluate(id=>navigateTo(document.getElementById(id),false),id);
        const scene=page.locator(`.is-current .deck-body [data-clinical-scene="${kind}"]`);
        await page.waitForFunction(()=>document.querySelector('.is-current [data-clinical-scene]')?.dataset.sceneState==='playing');
        for(const progress of [.12,.36,.64,.86]) {
          await frame(scene,progress);
          await page.screenshot({path:`${out}/${lang}-${width}x${height}-${kind}-${Math.round(progress*100)}.png`});
        }
        if(kind==='triage') {
          await frame(scene,.12);
          const back=await pose(scene,'triage-priority');
          await frame(scene,.86);
          const front=await pose(scene,'triage-priority');
          assert(back.x-front.x>250 && front.y-back.y>200,'The CT card itself advances from the back to the front');
        } else if(kind==='mission') {
          await frame(scene,.1); const first=await pose(scene,'mission-forward-a');
          await frame(scene,.25); const second=await pose(scene,'mission-forward-a');
          assert(second.x-first.x>80 && second.opacity>.9,'Arrow follows the forward clinical route');
          await frame(scene,.65); const feedbackStart=await pose(scene,'mission-return');
          await frame(scene,.95); const feedbackEnd=await pose(scene,'mission-return');
          assert(feedbackStart.x-feedbackEnd.x>500,'Feedback arrow returns toward the clinical question');
        } else if(kind==='twin') {
          await frame(scene,.36);
          assert((await pose(scene,'twin-option-a')).opacity>.9 && (await pose(scene,'twin-option-b')).opacity<.1,'First surgical option is highlighted alone');
          await frame(scene,.86);
          assert((await pose(scene,'twin-option-b')).opacity>.9 && (await pose(scene,'twin-option-a')).opacity<.1,'Second surgical option takes over');
        } else {
          await frame(scene,.4); const retina=await pose(scene,'precision-retina');
          await frame(scene,.43); const signal=await pose(scene,'precision-signal');
          await frame(scene,.48); const imaging=await pose(scene,'precision-imaging');
          assert.deepEqual([retina.x,retina.y],[signal.x,signal.y]);
          assert.deepEqual([signal.x,signal.y],[imaging.x,imaging.y],'All three modalities meet at the same interpretation point');
          await frame(scene,.82);
          assert((await pose(scene,'precision-care')).opacity>.9,'Shared interpretation flows toward consultation');
        }
        await scene.locator('a[data-zoom]').click();
        await page.waitForFunction(()=>document.querySelector('.image-dialog')?.open);
        assert.equal(await page.locator('[data-scene-part]').evaluateAll(nodes=>nodes.flatMap(n=>n.getAnimations()).length),0,'Zoom interrupts the scene');
        await page.keyboard.press('Escape');
        await page.waitForFunction(()=>document.querySelector('.is-current [data-clinical-scene]')?.dataset.sceneState==='playing');
        results.push({lang,width,height,kind,choreography:true,zoom:true,resume:true});
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
}
assert.deepEqual(errors,[]);
console.log(`PASS: ${results.length} illustrated-story layouts and choreography cases.`);
