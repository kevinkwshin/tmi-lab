import assert from 'node:assert/strict';
import test from 'node:test';
import { renderPage } from '../src/render.mjs';

const expectedSlides = [
  'welcome', 'translation', 'research', 'research-imaging',
  'research-signals', 'publications', 'people', 'contact',
];
const detailTargets = {
  welcome: ['detail-mission'],
  translation: ['detail-translation', 'detail-transfers'],
  research: ['detail-research'],
  'research-imaging': ['detail-research-imaging'],
  'research-signals': ['detail-research-signals'],
  publications: ['publication-content', 'patent-content'],
  people: ['detail-people'],
};

for (const lang of ['ko', 'en']) {
  const html = renderPage(lang, 'https://tmi-lab.org/', '');
  const main = html.split('<main id="main">')[1].split('</main>')[0];
  const sections = [...main.matchAll(/<section\b[^>]*\bdata-slide="[^"]+"[^>]*>/g)];
  const ids = sections.map(match => match[0].match(/\bid="([^"]+)"/)[1]);

  test(`${lang}: the presentation renders eight slides in reading order`, () => {
    assert.deepEqual(ids, expectedSlides);
    assert.match(html, /class="slide-position"[^>]*>01 \/ 08</);
  });

  test(`${lang}: each slide opens its own source material`, () => {
    for (const [id, targets] of Object.entries(detailTargets)) {
      const index = ids.indexOf(id);
      assert.notEqual(index, -1);
      const slide = main.slice(sections[index].index, sections[index + 1]?.index ?? main.length);
      const overview = slide.split('class="slide-detail')[0];
      for (const target of targets) {
        assert(overview.includes(`data-read="${target}"`), `${id} must link to ${target}`);
        assert(slide.includes(`id="${target}"`), `${target} must belong to ${id}`);
      }
    }
    const uniqueIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(uniqueIds).size, uniqueIds.length, 'IDs must be unique');
    for (const [, target] of html.matchAll(/\sdata-read="([^"]+)"/g)) {
      assert(uniqueIds.includes(target), `Missing detail panel ${target}`);
    }
  });
}
