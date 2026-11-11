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
| `src/publications-auto.json` | Automatically verified ORCID-linked journal articles from 2026 onward |
| `src/scholar-metrics.json` | Last successfully verified Google Scholar citation snapshot |
| `src/patents.mjs` | Patent families, document status, and public records |
| `src/render.mjs` | Shared HTML sections and metadata |
| `src/tokens.css` | Color, typography, spacing, and control tokens |
| `src/layout.css` | Responsive page layouts |
| `src/presentation.css` | Slide composition, reading dialogs, continuous reading |
| `src/slide-overviews.mjs` | Eight bilingual presentation slides and links to their full source material |
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

The existing **Publish TMI-lab** workflow refreshes the public Scholar profile every day around 09:17 Korea time, and when run manually from GitHub Actions. It updates total citations, h-index, i10-index, yearly counts and the verified date, then saves the snapshot and deploys both languages. The chart displays the latest seven available years. Monday's run also discovers publications through Crossref's official API (see below); research summaries remain manually edited.

No API key, package or paid service is required. `npm run update:scholar` makes one ordinary request to the user-first public profile URL allowed by [Scholar's robots.txt](https://scholar.google.com/robots.txt). It does not paginate, retry blocked requests within a run or bypass verification. This is public-page parsing, not a guaranteed Google API. If access fails or the HTML changes, the previous snapshot and verified date are preserved and site checks, tests and deployment continue. The collection error is recorded in a public Actions annotation; the job summary includes the last verified date and metrics. After a successful deployment, a separate Scholar health job marks the overall workflow as failed when collection failed, so a successful website deployment cannot conceal stale citation data. The next daily run makes a fresh attempt. Only a successful refresh can save a new snapshot. Site check, test and deployment failures still fail the workflow. Citation counts may legitimately decrease, so successful updates are not forced upward.

GitHub may delay scheduled runs; public repositories' schedules can be disabled after 60 days without repository activity. Successful weekly snapshot commits normally provide activity. If repeated collection failures leave the repository inactive, re-enable the workflow in Actions after addressing the failure. [GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

Ordinary code pushes build from the saved snapshots without contacting Scholar or Crossref. For an immediate refresh, use **Actions → Publish TMI-lab → Run workflow**. The workflow's snapshot commit does not trigger another build; the same run deploys it. Failed Scholar refreshes never change the on-page verified date.

## Automatic publication updates

On Monday's schedule and manual workflow runs, `npm run update:publications` queries [Crossref's official API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) for journal articles published from 2026 onward whose author metadata contains Keewon Shin's ORCID `0000-0002-5028-5716`. It does not depend on Scholar access. DOI, title, journal, authors and publication date are validated before saving `src/publications-auto.json`; a future print issue does not delay an already published online article. The list merges by DOI with the curated selections, preserving their categories and wording. New articles appear in the publication search, with unreviewed categories shown as “Other research.” Existing verified articles are retained if a later index response omits them. Publication checks and Scholar checks fail independently; either source being unavailable retains its previous snapshot while normal site checks and deployment continue.

Automatic discovery covers articles linked to this ORCID in Crossref. Publisher indexing delays and missing ORCID metadata can prevent discovery; those papers can still be added after manual DOI verification in `src/publications.mjs`. Older selections remain curated, and conference abstracts, patents, corrections and research narratives are not automatically added. The Scholar chart's checked date describes citation metrics only, not the publication-list refresh.

## Navigation

Desktop and mobile follow the same eight slides: introduction, technology transfer, clinical workflow, digital twins, precision medicine, research output, people and contact. Use the dock, header links, wheel, vertical swipe, Arrow or Page keys, or Home/End to navigate. **Read page / 연속 보기** opens the complete scrolling document.

Each research slide presents its clinical question and a representative visual. Its detail button opens the methods, clinical significance and original figures. Close the panel to return to the same slide. The technology transfer slide features AVIEW NeuroCAD and links to the other cases.

The research output slide shows the dated Scholar chart and opens separate publication search and patent lists. The people slide opens education, career and current project details. Clinical-impact sources are recorded in `docs/clinical-impact-sources.md`.

## Verification

`npm test` checks the eight-slide structure, detail links, wheel input and research data synchronization. After building and serving the preview at `http://127.0.0.1:4173/dist/`, run the browser suites to exercise the deck and its research detail panels at different viewport sizes:

```sh
npm run test:deck
npm run test:stories
npm run test:visuals
node scripts/test-motion.mjs
```

Browser suites need Playwright, available either as `playwright` or through the `PLAYWRIGHT_MODULE` environment variable. Set `BROWSER_PATH` to use a specific browser executable. `TEST_URL` overrides the preview URL; evidence is written under ignored `.omo/evidence/`. Automated wheel and touch events supplement testing with physical devices.
