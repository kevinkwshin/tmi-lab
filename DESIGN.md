# TMI-lab design system

## 0. Research Log

- Initial composition research: Notion, IBM, and Wired shortlist; minimalist + Notion references informed readable typography, fine rules, compact controls, and generous section spacing.
- Lazyweb: medical-research query, two screens inspected (Merck immunology and Orca Bio publications); adopted real research imagery and publication rows rather than copied screens.
- Generated A/B composition drafts informed the split hero. The user subsequently replaced the muted direction with the supplied character logo and requested a brighter palette; that later instruction is the visual authority.
- Interaction sources: beui.dev `tabs/raw` for clear selection states, `scroll-animation/raw` for native reading progress, passive listeners, and reduced-motion behavior. No source components or new animation libraries are bundled.
- Final September 16 direction: lead with TMI-lab identity, feature NeuroCAD and technology transfer, include patents, and connect the page through scroll feedback. The supplied logo is a brand asset, not a pixel-level page mockup.

## 1. Atmosphere & Identity

Bright white, sky blue, navy, and the original dragon-and-goose logo. Short brand spelling is **TMI-lab**, consistently in Korean and English; the full name is **Translational Medical Intelligence Lab**. Original lettering inside the supplied image is preserved.

The hero establishes the lab's identity and its focus on clinical judgment and workflow. Technology-transfer cases provide concrete research outcomes. The scroll narrative explains the path from information to medical intelligence. Clinical collaborators and prospective researchers can explore papers, patents, and the people behind the work.

## 2. Color

| Token | Value | Role |
|---|---|---|
| `--paper`, `--white` | `#ffffff` | Canvas and surfaces |
| `--ink` | `#102d50` | Main text |
| `--muted` | `#52657a` | Secondary text |
| `--blue` | `#1269b5` | Brand, active controls, progress |
| `--blue-hover` | `#0b4b87` | Action hover |
| `--sky` | `#edf7ff` | Section and selection background |
| `--line` | `#d9e7f2` | Rules and inactive stage numbers |
| `--dark` | `#0c386b` | Contact section |
| `--on-dark` | `#ffffff` | Contact heading |
| `--muted-dark` | `#cee4fa` | Contact secondary text |
| `--focus` | `#bd5915` | Keyboard outline |
| `--scan` | `#101211` | Scientific-image background |

All CSS colors use these tokens. Metadata and SVG favicon may embed matching brand colors. No shadows or dark theme.

## 3. Typography

System sans in English and Korean: `-apple-system`, BlinkMacSystemFont, Segoe UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif. No font downloads. Korean uses `word-break:keep-all` and `overflow-wrap:anywhere`.

| Token | Value |
|---|---|
| `--text-xs` | `.75rem` |
| `--text-sm` | `.875rem` |
| `--text-base` | `1rem` |
| `--text-lg` | `1.125rem` |
| `--text-xl` | `1.5rem` |
| `--brand-mobile` | `1.75rem` |
| `--text-2xl` | `2rem` |
| `--heading` | `clamp(2rem,4vw,3.5rem)` |
| `--display` | `clamp(4rem,7vw,6.5rem)` |
| `--brand-weight` | `750` |

Body line-height 1.75. Brand line-height 1.05; section headings 1.1 (Korean 1.3). Other weights 400/500/600. Display tracking -.055em, section -.035em, overline .09em. The legacy `--serif` alias resolves to the same sans family.

## 4. Spacing & Layout

4px base, token steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px. Maximum content width1240px; responsive gutter `clamp(24px,5vw,80px)`; section padding `clamp(64px,7vw,112px)`. Header minimum96px desktop,80px narrow. Rounded controls8px, minimum touch target44px.

Hero: two columns1fr/1.15fr, logo at original aspect ratio. At960px hero/navigation stack; at640px all major content uses one column. Technology feature uses a white surface within sky blue. Publication and patent rows use fine rules. Main navigation preserves natural page scrolling.

The bilingual hero description reserves at least two line heights (three below640px) and balances wrapping. This keeps the action row steady when language-specific copy uses fewer lines, while allowing longer text or enlarged fonts to grow naturally.

Mission: sticky introduction beside three scroll chapters on desktop. Each chapter has minimum `clamp(300px,55svh,560px)` height, stage number, label, title, and description. Below960px the introduction returns to normal flow and chapter minimum heights are removed. Sticky offsets and anchor scroll margins account for the header.

## 5. Components

- **Brand/home:** text TMI-lab and full-name expansion; original character logo in hero.
- **Section heading:** numbered overline and translated title; optional descriptive paragraph. Publications and transfers omit personal/founding preambles per user instruction.
- **Action link:** blue primary or underlined text link, decorative arrow, hover/pressed/focus states.
- **Language links:** KO/EN with visible label included in accessible name; current language via `aria-current=page`. Both languages are pre-rendered. The root entry uses the first supported browser language (Korean or English, English fallback); a manually selected language takes priority and is remembered in local storage. Explicit `/en/` links remain English. Language links preserve the section anchor and carry an explicit language query so switching still works when storage is unavailable. Detection runs in the document head before the page is painted.
- **Menu disclosure:**44px button, translated open/close label, expanded state, Escape/focus restoration. Navigation is fully available without JS; inactive menu button is hidden.
- **Technology case:** original product image, clear product/research links, short technical description. Other transfers show year, recipient, and use case.
- **Mission chapters/index:** real anchor links with current stage `aria-current=step`; matching chapter number highlights on scroll. Each chapter remains independently readable.
- **Research row/gallery:** numbered title, description, topic labels; linked original scientific figures. No fake hover actions on static rows.
- **Publication list:** English paper titles, year, authors, journal, DOI. Native search/category buttons, selected states, live result count, empty state, reset/focus restoration.
- **Patent list:** verified publication numbers and bilingual official titles, grant/publication labels, inventor names. Same-family US/PCT documents attach to the invention; earlier industrial work uses a native disclosure. No lifetime patent totals.
- **People:** confirmed PI portrait, research bio, professional role, links, education/career expanded by default with a native collapse control. Academic service appears first in the career list. Heading `구성원 소개` / `People`; no invented members.
- **Contact:** `연구 협력 및 문의` / `Research collaboration & inquiries`, public work email and office.

## 6. Motion & Interaction

Native smooth anchor navigation; no scroll hijacking. A thin top line tracks reading progress, main navigation marks the current section, and the mission index follows its three stages. Scroll updates are passive and coalesced with requestAnimationFrame; layout is read before writes. ResizeObserver keeps progress correct after filtering/disclosure changes.

`--micro:150ms ease-out` for control feedback; interactive arrows move3px. Narrative entry uses `--reveal-distance:16px`, `--reveal-duration:600ms`, and `--reveal-ease:cubic-bezier(.16,1,.3,1)`. Each block reveals once to signal a new chapter. Only offscreen blocks are armed after the observer is registered. Focus reveals immediately.

Reduced motion disables transforms/transitions and smooth scrolling; all content is immediately visible. No-JS also retains all content. Print removes sticky positioning and hidden entry states. There is no parallax, cursor tracking, looped decoration, or external animation dependency.

## 7. Depth & Surface

White canvas, sky-blue transfer/patent sections, navy contact band,1px rules. No shadows. Logo and genuine scientific/product images provide character. Image proportions, annotations, and colors are preserved. Assets are resized/compressed for the web; research content is not generated or retouched.

## 8. Accessibility & Verification

WCAG2.2 AA target: contrast, keyboard focus, skip link, semantic landmarks, translated labels, proper document language,44px controls, responsive reflow, reduced motion, no-JS access. Current-page/current-location/current-step states have distinct meanings. Prior research is not relabeled as current institutional partnerships. No accepted product accessibility debt.

QA covers both languages at375/768/1280px, all published sections, menu/keyboard, publication filters/search/reset, patent/career disclosure, language anchors, scroll stages, content entry, and reduced motion. Browser evidence is kept privately; source provenance is in `docs/asset-sources.md`.

## Presentation navigation — September 22 revision

The latest request supersedes the earlier proximity-snap and per-block reveal rules. On wide, tall screens (at least 961 × 700 CSS pixels), a wheel gesture advances exactly one viewport-sized slide. Small trackpad deltas accumulate to 32px; a gesture ends after 220ms without a wheel event. A 620ms ease-in-out transition ignores continuing momentum. Arrow/Page keys and the navigation dock provide equivalent movement. Reduced motion keeps the one-slide behavior with an immediate transition. Touch/narrow/short screens use native reading flow; zoom remains native. A visible reading-mode toggle lets everyone choose continuous scrolling.

Content is composed into thirteen slides: introduction, NeuroCAD, other transfers, GreyNet, mission, three research directions, publications, patents, people, expanded education/career, and contact. Long publication/patent collections have concise slide previews and explicit buttons that open native, labelled dialogs with their complete searchable content. Escape closes the dialog and focus returns to its trigger. In reading mode, mobile, print, and without JavaScript the complete collections are inline. No scientific content is discarded or replaced by a screenshot.

Slide height uses the dynamic viewport minus the measured header. Vertical padding is 32px above and 96px below, reserving dock space. Slide headings use the existing heading token; compact layouts use 32px headings below 820px height. Research figures use contain sizing and retain original annotation. Career uses a two-column list and remains expanded by default. If enlarged text causes content to exceed a slide, fall back to reading mode instead of clipping it.

Brand spelling is TMI-lab in visible text and metadata. Header, hero title, and the supplied logo establish identity; eyebrows and the dock name the location instead of repeating the brand. Section labels use sentence case without decorative numbering; numbers remain only for the actual research process and slide position. The existing white/sky/navy palette and authentic images define the site. The requested Anthropic frontend-design skill reinforces subject-specific composition, restrained copy, and a single memorable, user-triggered motion pattern.

Additional tokens: `--slide-duration:620ms`, `--dialog-backdrop:rgb(16 45 80 / .35)`. The reading dialog uses the existing max width, spacing, radius, and color tokens. No new runtime dependencies.
