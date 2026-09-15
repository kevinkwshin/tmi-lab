import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { renderPage } from '../src/render.mjs';

const siteUrl = new URL(process.env.SITE_URL || 'https://kevinkwshin.github.io/tmi-lab/');
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/en', { recursive: true });
await cp('public', 'dist', { recursive: true });
const styles = await Promise.all(['src/tokens.css', 'src/layout.css'].map(p => readFile(p, 'utf8')));
await writeFile('dist/styles.css', styles.join('\n'));
await writeFile('dist/index.html', renderPage('ko', siteUrl.href));
await writeFile('dist/en/index.html', renderPage('en', siteUrl.href));
await writeFile('dist/.nojekyll', '');
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url><url><loc>${siteUrl}en/</loc></url></urlset>`);
await writeFile('dist/404.html', `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>TMI-lab · Page not found</title><link rel="stylesheet" href="${siteUrl}styles.css"></head><body><main class="container section"><p class="eyebrow">TMI-lab / 404</p><h1>페이지를 찾을 수 없습니다</h1><p lang="en">This page could not be found.</p><a class="text-link" href="${siteUrl}">TMI-lab 홈 / Home →</a></main></body></html>`);
console.log('Built Korean and English pages in dist/');
