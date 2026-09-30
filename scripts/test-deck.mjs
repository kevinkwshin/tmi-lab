import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {publications} from '../src/publications.mjs';
import {content} from '../src/content.mjs';
import {scholarProfile} from '../src/scholar.mjs';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
const evidence = process.env.EVIDENCE_DIR || '.omo/evidence/shared-slide-frame';
await mkdir(evidence, {recursive:true});
const frames = [];
try {
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({viewport:{width:1280,height:800}, reducedMotion:'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`${base}${language === 'en' ? 'en/' : ''}?lang=${language}`);
    await page.waitForFunction(() => document.querySelector('.deck-page'));
    const coverage = await page.evaluate(() => {
      const text = [...document.querySelectorAll('.slide-overview')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).join(' ');
      const fields = '.research-body,.research-brief dd,.study-intro p,.transfer > p,.patent h3';
      return [...document.querySelectorAll(`.slide-detail :is(${fields})`)].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(value => !text.includes(value));
    });
    assert.deepEqual(coverage, [], 'The deck must retain the reading content');
    assert.equal(await page.locator('[data-deck-continuation="people"],main > #activity').count(), 0);
    assert.deepEqual(await page.locator('#people .slide-detail .career-columns li').allTextContents(), [...content[language].people.education,...content[language].people.career]);
    assert.equal(await page.locator('#people .profile-study').count(), 0);
    assert.deepEqual(await page.locator('.related-studies .profile-study h3').allTextContents(), scholarProfile.studies.map(s => s[language].title));
    assert.equal(await page.locator('#people .slide-detail .citation-bars li').count(), 7);
    const assertFrame = async () => {
      const geometry = await page.evaluate(() => {
        const frame = document.querySelector('.is-current .deck-page');
        if (!frame) return null;
        const bounds = frame.getBoundingClientRect();
        const heading = frame.querySelector('.deck-heading').getBoundingClientRect();
        const actions = frame.querySelector('.deck-actions').getBoundingClientRect();
        const body = frame.querySelector('.deck-body');
        const bodyBounds = body.getBoundingClientRect();
        const content = [...body.children].map(element => element.getBoundingClientRect());
        const top = Math.min(...content.map(rect => rect.top));
        const bottom = Math.max(...content.map(rect => rect.bottom));
        return {id:frame.closest('[data-slide]').id, width:innerWidth, height:innerHeight,
          headingOffset:heading.top - bounds.top, actionOffset:bounds.bottom - actions.bottom,
          headingSize:getComputedStyle(frame.querySelector('h2')).fontSize,
          headingColor:getComputedStyle(frame.querySelector('h2')).color,
          bodyCenterOffset:Math.abs((top + bottom) / 2 - (bodyBounds.top + bodyBounds.bottom) / 2),
          bodyOverflow:top < bodyBounds.top - 2 || bottom > bodyBounds.bottom + 2 || body.scrollWidth > body.clientWidth + 2,
          frameOverflow:actions.bottom > bounds.bottom + 2 || heading.bottom > bodyBounds.top + 2,
          background:getComputedStyle(frame.closest('[data-slide]')).backgroundColor};
      });
      if (geometry) {
        frames.push({language,...geometry});
        await writeFile(path.join(evidence,'frames.json'), JSON.stringify(frames,null,2));
        await page.screenshot({path:path.join(evidence,`${language}-${geometry.width}x${geometry.height}-${geometry.id}.png`)});
        const label = `${language} ${geometry.width}x${geometry.height} ${geometry.id}`;
        assert(Math.abs(geometry.headingOffset) < 2, `${label}: heading must start at the common top anchor`);
        assert(Math.abs(geometry.actionOffset) < 2, `${label}: actions must end at the common bottom anchor`);
        assert(geometry.bodyCenterOffset < 2, `${label}: body must be centered between heading and actions`);
        assert.equal(geometry.bodyOverflow, false, `${label}: body must fit the available height and width`);
        assert.equal(geometry.frameOverflow, false, `${label}: frame zones must not overlap`);
        assert.equal(geometry.background, geometry.id === 'contact' ? 'rgb(12, 56, 107)' : 'rgb(255, 255, 255)', `${label}: white canvas with the requested blue contact closing`);
        assert.equal(geometry.headingColor, geometry.id === 'contact' ? 'rgb(255, 255, 255)' : 'rgb(16, 45, 80)', `${label}: heading contrast follows its canvas`);
      }
    };
    const desktopIds = await page.locator('main > [data-slide]').evaluateAll(es => es.map(e => e.id));
    for (const id of desktopIds) {
      await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
      await assertFrame();
    }
    assert.deepEqual(await page.locator('.slide-detail .citation-bars li').evaluateAll(es => es.map(e => e.getAttribute('aria-label').match(/\d+/g).map(Number))), scholarProfile.trend.map(({year,count}) => [year,count]));
    assert.equal(await page.locator('[data-deck-continuation="publications"]').count(), 0);
    assert.deepEqual(await page.locator('#publications .scholar-year').evaluateAll(es => es.map(e => e.getAttribute('aria-label').match(/\d+/g).slice(0,2).map(Number))), scholarProfile.trend.map(({year,count}) => [year,count]));
    assert.equal(await page.locator('#publications .scholar-year-partial').count(), Number(scholarProfile.trend.some(point => point.year === Number(scholarProfile.checked.slice(0,4)))));
    assert.equal(await page.locator('#publications .deck-actions a[href*="scholar.google"]').getAttribute('target'), '_blank');
    assert.deepEqual(await page.locator('[data-paper] h3').allTextContents(), publications.map(p => p.title));
    const product = page.locator('#translation .deck-actions a.action');
    assert.equal(await product.getAttribute('href'), 'https://corelinesoft.com/en-gb/aview/brain/neurocad/');
    assert.equal(await product.getAttribute('target'), '_blank');
    await page.evaluate(() => navigateTo(document.getElementById('translation'), false));
    assert.equal(await page.locator('.is-current .slide-overview').innerText().then(t => /연구실 제공|lab-provided/i.test(t)), false);
    assert.equal(await page.locator('.is-current .slide-overview a[href*="corelinesoft"][href*="neurocad"]').count(), 1);
    await page.locator('.is-current [data-read="translation-sources"]').click();
    assert.match(await page.locator('.reading-dialog').innerText(), /2026/);
    await page.keyboard.press('Escape');
    await page.evaluate(() => navigateTo(document.getElementById('people'), false));
    await page.locator('.is-current [data-read="detail-people"]').click();
    assert.equal(await page.locator('.reading-dialog .career-columns li').count(), content[language].people.education.length + content[language].people.career.length);
    await page.keyboard.press('Escape');
    await page.evaluate(() => navigateTo(document.getElementById('publications'), false));
    await page.locator('[data-reading]').click();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('presentation')), false);
    assert.equal(await page.locator('[data-deck-continuation]:visible').count(), 0);
    await page.locator('[data-reading]').click();
    assert.equal(await page.evaluate(() => document.querySelector('.is-current').dataset.deckSource), 'publications');
    await page.locator('.is-current .slide-overview [data-read]').click();
    assert.equal(await page.locator('.reading-dialog').evaluate(e => e.open), true);
    assert.equal(await page.locator('.reading-dialog [data-paper]').count(), publications.length);
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:375,height:667});
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.querySelector('.is-current').dataset.deckSource), 'publications');
    const ids = await page.locator('main > [data-slide]').evaluateAll(es => es.map(e => e.id));
    assert.equal(ids.filter(id => id.startsWith('publications')).length, 1);
    assert.equal(ids.filter(id => id.startsWith('people')).length, 1);
    assert.equal(ids.filter(id => id.startsWith('activity')).length, 0);
    for (const id of ids) {
      await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
      assert.equal(await page.evaluate(() => scrollY), 0);
      assert.equal(await page.locator('main > [data-slide]:visible').count(), 1);
      await assertFrame();
    }
    for (const viewport of [{width:1440,height:900},{width:768,height:1024},{width:1280,height:640},{width:320,height:568},{width:375,height:480}]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(250);
      const resizedIds = await page.locator('main > [data-slide]').evaluateAll(es => es.map(e => e.id));
      for (const id of resizedIds) {
        await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
        await assertFrame();
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Deck content, continuation, modes, modal, resize and navigation: PASS');
} finally {
  await browser.close();
}
