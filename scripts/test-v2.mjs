import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { renderPage } from '../src/v2-render.mjs';
import { publications } from '../src/publications.mjs';
import { patents } from '../src/patents.mjs';
import { researchEvidence } from '../src/research.mjs';
import { content } from '../src/content.mjs';

for (const lang of ['ko','en']) {
  const html = renderPage(lang,'https://example.org/tmi-lab/','','styles.css');
  test(`V2 ${lang}: every publication, patent family and original scientific figure remains available`, async () => {
    for (const paper of publications) assert.ok(html.includes(`https://doi.org/${paper.doi}`), paper.doi);
    for (const patent of patents) {
      assert.ok(html.includes(`https://patents.google.com/patent/${patent.number}/${lang}`),patent.number);
      for (const related of patent.related) assert.ok(html.includes(related.number),related.number);
    }
    for (const study of researchEvidence[lang]) {
      for (const figure of study.images) assert.ok(html.includes(`${figure.name}.webp`),figure.name);
    }
    for (const record of [...content[lang].people.education,...content[lang].people.career]) {
      assert.ok(html.includes(record.replaceAll('&','&amp;')),record);
    }
    const assets = [...html.matchAll(/(?:src|data-src)="(?:\.\/|\.\.\/)assets\/([^"]+)"/g)];
    for (const [,asset] of assets) await access(new URL(`../public/assets/${asset}`,import.meta.url));
  });
  test(`V2 ${lang}: navigation targets are unique and resolve on a GitHub Pages subpath`, () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
    for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id),`missing #${id}`);
    assert.ok(html.includes(lang==='ko'?'./en/?lang=en':'../?lang=ko'));
    assert.ok(html.includes(`<link rel="canonical" href="https://example.org/tmi-lab/${lang==='en'?'en/':''}">`));
    assert.equal([...html.matchAll(/<h1\b/g)].length,1);
    assert.ok(!html.includes('scroll.js'),'V2 must retain normal page scrolling');
  });
}
