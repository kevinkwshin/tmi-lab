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

## Presentation-like navigation

The user requested a light presentation-slide effect on September 16. Desktop scrolling uses native proximity snapping at section and mission-chapter boundaries. Tall publication and research sections retain ordinary internal scrolling. A bilingual, keyboard-accessible section dock shows the current title and position, with previous/next controls. Entry transitions use the shared 48px distance and a subtle scale from .985 to 1. Reduced-motion mode removes snapping and animation; without JavaScript, navigation and all content remain available and the dock is hidden.
