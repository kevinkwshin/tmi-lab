# TMI-lab

Bilingual website for the **Translational Medical Intelligence Lab**, Inha University College of Medicine, led by **Keewon Shin, PhD**.

- Website: https://tmi-lab.org/
- Korean: `/` · English: `/en/`
- Brand: the lab's original dragon-and-goose logo, white, sky blue, and navy.
- Featured translation: Coreline Soft **AVIEW NeuroCAD**, followed by GreyNet, FlatNet, and ProRetina.

## Build

Requires Node.js 22 or newer. No package installation is needed.

```sh
npm run check
npm run build
```

The generated website is in `dist/`. Serve that directory with a static HTTP server for preview. `main` deploys automatically through GitHub Actions to GitHub Pages.

## Edit content

| File | Purpose |
|---|---|
| `src/content.mjs` | Korean and English copy, research areas, career, transfers |
| `src/publications.mjs` | Selected publications and DOI links |
| `src/scholar-metrics.json` | Last successfully verified Google Scholar citation snapshot |
| `src/patents.mjs` | Patent families, document status, and public records |
| `src/render.mjs` | Shared HTML sections and metadata |
| `src/tokens.css` | Color, typography, spacing, and control tokens |
| `src/layout.css` | Responsive page layouts |
| `src/presentation.css` | Slide composition, reading dialogs, continuous reading |
| `src/stories.mjs` · `src/stories.css` | Research narratives, authentic evidence figures, responsive story pages |
| `public/deck.js` | Shared frames and responsive continuation pages |
| `public/visuals.js` · `src/visuals.css` | Image reveals, clinical-pathway emphasis, accessible original-image viewer |
| `public/site.js` | Language anchors, mobile navigation, publication filtering |
| `public/scroll.js` | One-gesture slide navigation, reading mode, collection dialogs, reduced-motion support |
| `public/assets/` | Reviewed, web-optimized images |
| `DESIGN.md` | Design contract |
| `docs/asset-sources.md` | Content and image provenance |
| `docs/domain-setup.md` | Custom-domain configuration |

Update both language versions together. Verify DOI metadata before adding papers. Prior research and technology transfers belong to the PI's professional record; they do not imply current institutional partnerships or deployment of every lab project.

The website uses static HTML, CSS, a small language selector in the document head, and deferred interaction scripts. On the root page, the first supported browser language selects Korean or English; English is the fallback. A manual KO/EN selection is remembered locally and preserves the section anchor. Direct `/en/` links stay English, and explicit language links work even when storage is blocked. Content, language navigation, links, and the default-open career disclosure remain available without JavaScript. There are no trackers, web fonts, or third-party scripts.

Original private documents and extracted source material are excluded from Git. Scientific images retain their original annotations and proportions; only web resizing/compression is applied.

## Automatic Scholar updates

The existing **Publish TMI-lab** workflow refreshes the public Scholar profile every Monday around 09:17 Korea time, and when run manually from GitHub Actions. It updates total citations, h-index, i10-index, yearly counts and the verified date, then saves the snapshot and deploys both languages. The chart displays the latest seven available years. Curated publication entries and research summaries are edited separately.

No API key, package or paid service is required. `npm run update:scholar` makes one ordinary request to the user-first public profile URL allowed by [Scholar's robots.txt](https://scholar.google.com/robots.txt). It does not paginate, retry blocked requests or bypass verification. This is public-page parsing, not a guaranteed Google API. If access fails or the HTML changes, validation stops the scheduled deployment; the previous live site, snapshot and verified date stay intact. Check the failed Actions run before rerunning. Citation counts may legitimately decrease, so successful updates are not forced upward.

GitHub may delay scheduled runs; public repositories' schedules can be disabled after 60 days without repository activity. Successful weekly snapshot commits normally provide activity. If repeated collection failures leave the repository inactive, re-enable the workflow in Actions after addressing the failure. [GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

Ordinary code pushes build from the saved snapshot without contacting Scholar. For an immediate refresh, use **Actions → Publish TMI-lab → Run workflow**. The workflow's snapshot commit does not trigger another build; the same run deploys it. Failed refreshes never change the on-page verified date.

## Navigation

Slides use a fixed viewport on desktop and mobile. Wheel gestures, vertical touch swipes, Arrow and Page keys, Home/End, header links, and the section dock navigate between pages. No presentation page owns a scrolling area. Short and narrow screens use semantic continuation pages; exceptionally short viewports retain compact overviews with explicit access to details. **Read page / 연속 보기** enables the complete scrolling document.

Research pages connect the goal, method and clinical significance to original figures. Image curtains and staged pathway emphasis accompany page transitions. Click or tap a figure to expand the original; swiping from an image still changes pages. Escape, Close, or the viewer backdrop closes it and returns focus. Reduced motion makes these effects immediate.

Publications and People each retain one overview page. Full publication search, patents, education, career, the current project and the dated Scholar chart remain in labelled detail dialogs and in continuous reading. Research directions emphasize clinical workflow, surgical digital twins, and evidence-based precision medicine. Clinical-impact sources are recorded in `docs/clinical-impact-sources.md`.

## Verification

`npm test` verifies wheel classification. After building and serving the preview at `http://127.0.0.1:4173/dist/`, the browser suites cover frame geometry, complete visible research copy, image interactions and page motion:

```sh
npm run test:deck
npm run test:stories
npm run test:visuals
node scripts/test-motion.mjs
```

Browser suites need Playwright, available either as `playwright` or through the `PLAYWRIGHT_MODULE` environment variable. Set `BROWSER_PATH` to use a specific browser executable. `TEST_URL` overrides the preview URL; evidence is written under ignored `.omo/evidence/`. Automated wheel and touch events supplement testing with physical devices.
