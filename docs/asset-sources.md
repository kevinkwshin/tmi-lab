# Content and image sources

## Supplied logo video (2026-10-01)

The user supplied `gemini_generated_video_93afe2e7.mp4` to replace the welcome logo animation. `public/assets/tmi-logo-film.mp4` preserves its original 1280×720, 24fps H.264 video stream and 10 second duration; its audio stream was removed and MP4 metadata moved to the front for web loading. `public/assets/tmi-logo-video-poster.jpg` is the first frame, extracted as a static fallback. No image generation, visual retouching or video re-encoding was applied. The supplied video's original framing and lettering are preserved.

The video replaces the custom SVG mascot gestures in slide and continuous-reading views. It plays muted, inline and on a loop while visible, with a localized pause/play control. Static poster behavior covers reduced motion, no JavaScript and playback failure. The older generated mascot assets below are retained as source history and are no longer rendered by the website.

## Explanatory animation plates (2026-10-01)

`tmi-logo-smile.png` formerly supplied the dragon's smiling eyes and mouth through a registered face mask. It is retired from the live page following the supplied-video replacement. Generated with the built-in image tool from the supplied logo. Full prompt and prior usage are in [the motion source record](scene-motion.md#tmi-logo-smilepng--cheerful-facial-expression).

`neurocad-triage-clean.png` removes the stationary amber study from the prior concept illustration so the original study can move from the queue to the front. The former hand-wave assets `tmi-logo-motion-base.png` and `tmi-dragon-palm.png` are retained as source history but no longer used by the page. See [motion design, source assets and generation prompts](scene-motion.md).

## Longitudinal CT comparison (2026-10-01)

`workflow-ct-comparison.png` is a synthetic explanatory CT pair generated for the workflow research page, not patient data or measured results. The fictional report excerpts illustrate a discrepancy requiring clinician review. The original report-text study figure remains unchanged. See [generation prompt and usage boundaries](workflow-ct-illustration.md).

Reviewed on 2026-09-15. Assets remain the property of their respective owners; no blanket asset license is granted by this repository.

## Images

| Website asset | Source | Use |
|---|---|---|
| `tmi-logo.webp` | Original TMI-lab logo supplied by the PI | Hero brand image; unchanged composition |
| `keewon-shin.webp` | PI-supplied CV, page 1 | Professional portrait |
| `neurocad.webp` | [Coreline Soft official AVIEW NeuroCAD page](https://corelinesoft.com/en/aview/brain/neurocad/), product viewer image `image-solution-neurologic-1.jpg` | Credited product screenshot in the technology-transfer feature |
| `shoulder-landmarks.webp` | PI-supplied research presentation, slide 7, image11 | Original shoulder radiograph landmark figure |
| `foot-landmarks.webp` | PI-supplied research presentation, slide 7, image6 | Original flatfoot assessment figure |
| `ecg-attention.webp` | PI-supplied research presentation, slide 30, image38 | Original ECG attention-map figure |

All website images were inspected for identifying patient information. Original clinical screenshots containing identifiers and conceptual composites were excluded. Scientific figures were resized and compressed without altering annotations, findings, colors, or composition. Full presentation and CV files are not distributed.

## Professional information and publications

- Current lab name and Department of Digital Medicine affiliation: PI's explicit instructions.
- Appointment, public office/email, education, and career: [Inha University official faculty directory](https://medicine.inha.ac.kr/medicine/9606/subview.do), cross-checked with the PI's CV.
- Four transfer names, recipients, and years: PI's CV. Coreline Soft's official page independently connects the related brain CT research to AVIEW NeuroCAD.
- Selected papers: [Google Scholar profile](https://scholar.google.com/citations?user=prJCNYoAAAAJ&hl=en), then DOI/Crossref/publisher metadata. Individual DOI links are in `src/publications.mjs`.
- Technical descriptions summarize research areas and intended uses. Prior work is attributed to the PI and collaborators. No claims of universal deployment, clinical superiority, or regulatory certification are made.

The initial research memo is a dated planning record. Current published copy is maintained in `src/content.mjs` and `src/render.mjs`; `DESIGN.md` records the final TMI-first direction.

## Patents (verified 2026-09-16)

Public patent documents were cross-checked against CV inventors and research affiliations. Website entries use the year of the displayed grant/publication record, rather than substituting the CV's filing/priority year.

- [CT classification/segmentation · KR102854968B1](https://patents.google.com/patent/KR102854968B1/ko), grant publication2025.
- [Vessel analysis · KR102787021B1](https://patents.google.com/patent/KR102787021B1/ko), grant publication2025; same-family [US12591966B2](https://patents.google.com/patent/US12591966B2/en),2026.
- [ECG analysis · KR20240174814A](https://patents.google.com/patent/KR20240174814A/ko), application publication2024; same-family [WO2024253395A1](https://patents.google.com/patent/WO2024253395A1/en).
- Earlier Hyundai research: [KR102289952B1](https://patents.google.com/patent/KR102289952B1/ko),2021; [KR101814977B1](https://patents.google.com/patent/KR101814977B1/ko),2018. Inventor identity is supported by Hyundai affiliation/co-inventors; correspondence to the CV's paraphrased titles is an editorial inference. The website uses the public record's exact titles.

Grant/application labels describe the linked document type; they do not certify current enforceability. Same-family documents are grouped rather than counted as separate inventions.

## Additional research figures (2026-09-23)

| Website asset | Original presentation source | Context |
|---|---|---|
| `radiology-error-study.webp` | Slide 13, image17.png | Constructed longitudinal radiology-report error-detection evaluation. A research design, not a deployed safety system. |
| `retinal-vessels.webp` | Slide 7, image12.png | Retinal-vessel segmentation comparison with and without Bayesian modeling. Original per-example scores remain part of the figure, not a general clinical-performance claim. |
| `growth-prediction-errors.webp` | Slide 16, image22.png | Cephalometric growth-prediction errors by treatment duration, appliance and age. Related anatomy-prediction research; not validation of surgical outcomes. |
| `ceph-growth-comparison.webp` | Slide 16, image23.png | Paired baseline/follow-up cephalograms with original baseline (blue), observed follow-up (green) and predicted (red) landmarks. Growth/orthodontic treatment, not surgery. Public extraction begins at source y=90, below both metadata rows; all 2048×1024 remaining pixels and the color legend are preserved exactly with lossless WebP. No case identifier, age, appliance metadata or embedded metadata is published. |
| `ecg-dcam-architecture.webp` | Slide 30, image37.jpeg | DCAM denoising and contrast-attention architecture for ECG analysis, linked as a technical detail. |

These assets preserve the original composition and annotations with lossless WebP encoding. The extracted files were checked against original PPTX media bytes and decoded pixels. Images containing patient faces or case metadata remain private. Surgical outcome prediction remains a research direction, distinct from the illustrated growth-prediction results. Public captions describe the research and figure content; presentation slide references are retained in this source ledger. Original-size figures are accessible from the research section.

## Mission concept illustration (2026-09-30)

`mission-clinical-research.png` was generated with the built-in image generation tool for the fourth-page illustration request. It depicts clinical questions, research collaboration and evaluation in care, and is labelled as an AI-generated concept in both languages. See [the full generation prompt and usage record](mission-illustration.md). It is separate from the original scientific figures and contains no patient data or measured performance claims.
