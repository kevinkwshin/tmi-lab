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
| `src/patents.mjs` | Patent families, document status, and public records |
| `src/render.mjs` | Shared HTML sections and metadata |
| `src/tokens.css` | Color, typography, spacing, and control tokens |
| `src/layout.css` | Responsive page layouts |
| `src/presentation.css` | Slide composition, reading dialogs, continuous reading |
| `public/site.js` | Language anchors, mobile navigation, publication filtering |
| `public/scroll.js` | One-gesture slide navigation, reading mode, collection dialogs, reduced-motion support |
| `public/assets/` | Reviewed, web-optimized images |
| `DESIGN.md` | Design contract |
| `docs/asset-sources.md` | Content and image provenance |
| `docs/domain-setup.md` | Custom-domain configuration |

Update both language versions together. Verify DOI metadata before adding papers. Prior research and technology transfers belong to the PI's professional record; they do not imply current institutional partnerships or deployment of every lab project.

The website uses static HTML, CSS, a small language selector in the document head, and deferred interaction scripts. On the root page, the first supported browser language selects Korean or English; English is the fallback. A manual KO/EN selection is remembered locally and preserves the section anchor. Direct `/en/` links stay English, and explicit language links work even when storage is blocked. Content, language navigation, links, and the default-open career disclosure remain available without JavaScript. There are no trackers, web fonts, or third-party scripts.

Original private documents and extracted source material are excluded from Git. Scientific images retain their original annotations and proportions; only web resizing/compression is applied.

## Navigation

Desktop viewports of at least 961 × 700 CSS pixels use one wheel gesture per slide. Trackpad momentum cannot skip multiple slides. Arrow and Page keys, Home/End, header links, and the section dock also navigate. Reduced motion makes transitions immediate. Mobile, short viewports, enlarged text that cannot fit a slide, and the **Read page / 연속 보기** option use continuous reading. Publication and patent collections open in labelled dialogs in slide mode and remain inline elsewhere. Escape closes a dialog and returns focus to its button. Education and career are expanded alongside the profile on the People slide. Research directions emphasize clinical workflow, surgical digital twins, and evidence-based precision medicine. Clinical-impact sources are recorded in `docs/clinical-impact-sources.md`.
