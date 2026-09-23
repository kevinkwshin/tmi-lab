# Content and image sources

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
| `ecg-dcam-architecture.webp` | Slide 30, image37.jpeg | DCAM denoising and contrast-attention architecture for ECG analysis, linked as a technical detail. |

These assets preserve the original composition and annotations with lossless WebP encoding. The extracted files were checked against original PPTX media bytes and decoded pixels. Images containing patient faces or case metadata remain private. Surgical outcome prediction remains a research direction, distinct from the illustrated growth-prediction results. Captions name each source slide; original-size figures are accessible from the research section.
