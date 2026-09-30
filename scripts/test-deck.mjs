import assert from 'node:assert/strict';
import {publications} from '../src/publications.mjs';
import {content} from '../src/content.mjs';
import {scholarProfile} from '../src/scholar.mjs';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH, args:['--no-proxy-server']});
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/dist/';
try {
  for (const language of ['ko', 'en']) {
    const page = await browser.newPage({viewport:{width:1280,height:800}, reducedMotion:'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`${base}${language === 'en' ? 'en/' : ''}?lang=${language}`);
    await page.waitForFunction(() => document.querySelector('.deck-page'));
    const coverage = await page.evaluate(() => {
      const text = [...document.querySelectorAll('.slide-overview')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).join(' ');
      const fields = '.research-body,.research-brief dd,.study-intro p,.transfer > p,.patent h3,.profile-scholar p,.scholar-trend figcaption';
      return [...document.querySelectorAll(`.slide-detail :is(${fields})`)].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(value => !text.includes(value));
    });
    assert.deepEqual(coverage, [], 'The deck must retain the reading content');
    assert.equal(await page.locator('[data-deck-continuation="people"],[data-deck-continuation="activity"]').count(), 0);
    assert.deepEqual(await page.locator('#people .slide-detail .career-columns li').allTextContents(), [...content[language].people.education,...content[language].people.career]);
    assert.equal(await page.locator('#people .profile-study').count(), 0);
    assert.deepEqual(await page.locator('.related-studies .profile-study h3').allTextContents(), scholarProfile.studies.map(s => s[language].title));
    assert.equal(await page.locator('#activity .slide-overview .citation-bars li').count(), 7);
    const assertCentered = async () => {
      const geometry = await page.evaluate(() => {
        const frame = document.querySelector('.is-current .deck-page');
        if (!frame) return null;
        const bounds = frame.getBoundingClientRect();
        const top = frame.firstElementChild.getBoundingClientRect().top;
        const bottom = frame.lastElementChild.getBoundingClientRect().bottom;
        return {offset:Math.abs((top + bottom) / 2 - (bounds.top + bounds.bottom) / 2), overflow:top < bounds.top - 2 || bottom > bounds.bottom + 2};
      });
      if (geometry) {
        assert(geometry.offset < 2, 'Slide content must be vertically centered');
        assert.equal(geometry.overflow, false, 'Centered content must fit the available height');
      }
    };
    const desktopIds = await page.locator('main > [data-slide]').evaluateAll(es => es.map(e => e.id));
    for (const id of desktopIds) {
      await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
      await assertCentered();
    }
    assert.deepEqual(await page.locator('.slide-detail .citation-bars li').evaluateAll(es => es.map(e => e.getAttribute('aria-label').match(/\d+/g).map(Number))), [[2020,34],[2021,86],[2022,128],[2023,171],[2024,201],[2025,274],[2026,175]]);
    assert.equal(await page.locator('[data-deck-continuation="publications"]').count(), 0);
    assert.equal(await page.locator('#publications .page-papers article').count(), 3);
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
    assert.equal(ids.filter(id => id.startsWith('activity')).length, 1);
    for (const id of ids) {
      await page.evaluate(id => navigateTo(document.getElementById(id), false), id);
      assert.equal(await page.evaluate(() => scrollY), 0);
      assert.equal(await page.locator('main > [data-slide]:visible').count(), 1);
      await assertCentered();
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Deck content, continuation, modes, modal, resize and navigation: PASS');
} finally {
  await browser.close();
}
