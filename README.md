# TMI-lab

Bilingual website for the **Translational Medical Intelligence Lab**, Inha University College of Medicine, led by **Keewon Shin, PhD**.

- Website: https://kevinkwshin.github.io/tmi-lab/
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
| `public/site.js` | Language anchors, mobile navigation, publication filtering |
| `public/scroll.js` | Reading progress, active sections, translation chapters, reduced-motion support |
| `public/assets/` | Reviewed, web-optimized images |
| `DESIGN.md` | Design contract |
| `docs/asset-sources.md` | Content and image provenance |
| `docs/domain-setup.md` | Custom-domain configuration |

Update both language versions together. Verify DOI metadata before adding papers. Prior research and technology transfers belong to the PI's professional record; they do not imply current institutional partnerships or deployment of every lab project.

The website uses static HTML, CSS, a small language selector in the document head, and deferred interaction scripts. On the root page, the first supported browser language selects Korean or English; English is the fallback. A manual KO/EN selection is remembered locally and preserves the section anchor. Direct `/en/` links stay English, and explicit language links work even when storage is blocked. Content, language navigation, links, and the default-open career disclosure remain available without JavaScript. There are no trackers, web fonts, or third-party scripts.

Original private documents and extracted source material are excluded from Git. Scientific images retain their original annotations and proportions; only web resizing/compression is applied.
