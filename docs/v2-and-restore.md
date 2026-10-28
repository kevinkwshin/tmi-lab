# V2 preview and V1 recovery

V2 is developed on `codex/v2`. The public site remains on `main`; pushing this branch does not trigger the production Pages workflow, whose push trigger and checkout target are both `main`.

## Preserved version

- V1 tag: `v1-before-v2-20261028`
- V1 commit: `84a8a18e0d05e5a1735f89f9b0857158d51840f7`
- Both the tag and the V2 branch are stored on GitHub.
- Original renderers, styles, assets and slide behavior remain in this branch.

## Preview either design

Run `npm run build` to build V2, or `SITE_DESIGN=v1 npm run build` to reproduce the V1 design from this branch's current research data. The build outputs to ignored `dist/`. Serve `dist/` with an ordinary local static server. The Korean root and `/en/` share all source data.

The original, historical site can be reproduced exactly by checking out the V1 tag in a separate checkout and running its documented build.

## Restore after a future V2 release

If V2 is later merged, revert the V2 merge commit on `main` through a normal pull request. This preserves Git history and research updates added after the snapshot. For an urgent design-only fallback on the V2 codebase, set `SITE_DESIGN: v1` on the Pages workflow's build step; no source deletion is required. Check and build the fallback before merging it.

Use the tag to compare or recover exact historical files when needed. Do not force-push or reset `main`, since that could discard newer publication and Scholar snapshots. These recovery actions are documented options, not actions already executed.

## V2 design direction

An editorial, naturally scrolling research site: large navy and clinical-blue type, a compact masthead, original medical concept illustrations, an emphasized NeuroCAD translation chapter, original research figures behind native disclosures, selected papers before citation metrics, complete searchable publications, patent records, PI history and contact. The original character video remains on the opening. All scientific data and source links are reused rather than invented.

No production deployment, audience change, external fonts, analytics, new service dependency, or Sites registration is part of this preview.

V2 uses WebP copies (quality 90, with a lossless copy for digital twins; same pixel dimensions and framing) of the five existing concept illustrations. Their original PNGs and provenance remain untouched; scientific evidence images are unchanged.
