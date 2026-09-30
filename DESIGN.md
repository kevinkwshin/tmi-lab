# TMI-lab design system

## September 30: illustrate the mission

Add an original white-and-blue isometric illustration to the fourth desktop page, Our mission. It connects a patient's clinical question, collaboration between researchers and clinicians, and evaluation in care, with a restrained return path for clinical feedback. Pair the illustration with the existing premise and full introductory text, beside the three numbered research stages. Preserve all stage descriptions. Portrait tablets pair the image with its explanatory text above the stages; narrow screens keep the illustrated opening and the complete stages on the existing two pages. Reuse the image-reveal, enlargement and reduced-motion behavior. Include the same image in the reading/detail view and label it as an AI-generated concept in both languages. Use existing paper, sky, navy and blue tokens; no new input logic, fonts or dependencies.

## September 30: complete opening phrases

The current identity statement reads “From Too Much Information” above “to Translational Medical Intelligence.” Keep each phrase on one line on desktop, using a wider text column and a smaller original logo rather than compressed typography. Both phrases use the same size and weight; only the six T/M/I initials are clinical blue, and the remaining letters stay navy. Separate the phrases by 8px. Portrait tablets place the full-width title above the centered logo. Mobile wraps naturally at word boundaries without forced internal breaks. Preserve the two phrase-reveal wrappers, reduced-motion behavior, complete content and wheel navigation.

## September 30: balanced identity and illustrated research goals

Give both halves of the opening statement the same type size and weight: “From too much information” and “to Translational Medical Intelligence.” Use navy for the starting point and blue for the destination, with deliberate phrase-level line breaks and an 800ms reveal. The original logo remains the visual anchor. Replace the product-name headline with “연구에서 임상으로, 생명을 위한 기술”; keep AVIEW NeuroCAD and the 2024 Coreline Soft transfer visible in the narrative.

Extend the accepted isometric white-and-blue clinical illustration style to three research directions: longitudinal report review, patient-specific outcome planning, and multimodal evidence for individual care. These are explicitly labelled AI-generated concepts, never scientific results. On roomy screens place the purpose illustration above a compact strip of linked original study figures; on shorter screens the original figures and full study context occupy the existing evidence continuation. Mobile gives the illustration, clinical method and original evidence their own readable pages. Preserve all descriptions, methods, significance and study notes, not just summaries. Keep real figures unmodified and expandable. The shared page heading, vertically centered body, action zone and wheel input stay stable.

## September 30: editorial identity and clinical journey

The latest page-specific brief governs this revision. Keep the shared frame, complete research copy, real figures and responsive page navigation. The closing Contact page is now intentionally blue, superseding the earlier all-white requirement. Preserve the accepted transfer portfolio.

Palette: paper #ffffff, ink #102d50, clinical blue #1269b5, sky #edf7ff, contact blue #0c386b, muted #52657a. Existing system sans stays: the opening uses large stacked Translational / Medical / Intelligence typography; body text stays 14–18px. Headings and actions retain common anchors; narrative bodies remain vertically centered.

Composition: opening [large acronym expansion | original mascot logo]; NeuroCAD [clinical purpose + adoption | generated CT → queue → priority-review concept]; mission [purpose | three numbered process rows]; research [numbered goal heading / narrative | original evidence]; publications [Scholar metrics / annual chart]; people [portrait | identity, education, service, project]; contact [collaboration purpose | large email] on blue. These encode the lab's actual translational work rather than adding decorative panels. The mission numbers belong beside their stage titles, with the purpose in its own column. Research goal numbers are an explicit user-requested sequence.

The generated triage illustration explains a workflow, not measured treatment benefit, a patient scan or a product screenshot. Label it as a concept and retain the actual NeuroCAD product screen in the evidence dialog. Its source and generation brief live in docs/triage-illustration.md. The Scholar chart uses verified dated counts, marks the current year partial and links directly to the profile. People pairs the real portrait with education, academic service and the current project; short screens retain explicit full-record access.

Motion is a single bounded typography reveal on entering the opening, including first load. Three word lines settle in order within 800ms; the supplied logo has a restrained scale settle. Existing page pushes, evidence reveals and image zoom remain interruptible. No continuous animation or input delay. Native Web Animations and existing tokens suffice. Reduced motion shows final content immediately. Verify all revised first pages, nested bounds, complete content, KO/EN, image zoom, wheel/touch, and reduced motion before deployment.

Review: rejected generic particle networks and artificial medical heatmaps because neither explains the lab's work. The distinctive visual moment is the clinical queue illustration and typographic acronym expansion; the research portfolio remains grounded in original images.

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

Content is composed into twelve slides: introduction, NeuroCAD, other transfers, GreyNet, mission, three research directions, publications, patents, people with expanded education/career, and contact. Long publication/patent collections have concise slide previews and explicit buttons that open native, labelled dialogs with their complete searchable content. Escape closes the dialog and focus returns to its trigger. In reading mode, mobile, print, and without JavaScript the complete collections are inline. No scientific content is discarded or replaced by a screenshot.

Slide height uses the dynamic viewport minus the measured header. Vertical padding is 32px above and 96px below, reserving dock space. Slide headings use the existing heading token; compact layouts use 32px headings below 820px height. Research figures use contain sizing and retain original annotation. Career uses a two-column list and remains expanded by default. If enlarged text causes content to exceed a slide, fall back to reading mode instead of clipping it.

Brand spelling is TMI-lab in visible text and metadata. Header, hero title, and the supplied logo establish identity; eyebrows and the dock name the location instead of repeating the brand. Section labels use sentence case without decorative numbering; numbers remain only for the actual research process and slide position. The existing white/sky/navy palette and authentic images define the site. The requested Anthropic frontend-design skill reinforces subject-specific composition, restrained copy, and a single memorable, user-triggered motion pattern.

Additional tokens: `--slide-duration:620ms`, `--dialog-backdrop:rgb(16 45 80 / .35)`. The reading dialog uses the existing max width, spacing, radius, and color tokens. No new runtime dependencies.

## Clinical significance — September 22 content revision

The people slide combines portrait, research bio, education, and career. Education and all seven career/service entries stay expanded by default in the same section. Three research directions now lead with their clinical purpose: clinical workflow, surgical digital twins (preoperative data to postoperative prediction), and precision medicine (evidence for patient-specific treatment). Digital twins are a research direction, not a claimed deployed product. Scientific figures in precision medicine are explicitly labelled foundational research. Transfer cases lead with clinical value and then the technical method. NeuroCAD adoption is attributed to the lab’s September 2026 update; regulatory designation and FlatNet comparison link to primary sources.

The People composition also includes the PI-provided Core Research A project alongside the education/career block. It states the project title and PI role without inventing dates, funding amount, or sponsor. The Scholar full-publication link opens a new tab with noopener/noreferrer.

## Research portfolio and mobile slides — September 23 revision

Audience: clinical collaborators looking for a concrete clinical question, AI method and evidence; prospective researchers exploring technical work; mobile visitors reading between tasks. Preserve bright white/sky/navy and the original logo. Shift research pages from generic process boxes to an editorial portfolio: a short clinical question, specific method, intended clinical contribution, and large authentic figure with a precise study caption. Reuse a research-plate figure (contained original image, fine rule, caption, original-image link) and a two-part research-brief definition list (Method / Clinical relevance). Figures are evidence, never background decoration. Keep full scientific annotations and patient privacy; do not publish identifiable patient photos or present conceptual composites as experimental results. Distinguish published foundations from future surgical digital-twin goals. Reuse existing type/color/spacing tokens and no new font or runtime dependency.

Mobile/tablet presentation is now a default, not a desktop-only effect: >=320px width and >=480px height. Every section occupies the viewport below the measured header. Longer content scrolls inside its section, with overscroll containment and top alignment; it must remain accessible without shrinking text. A 48px single-touch vertical swipe (vertical travel >1.25 times horizontal travel) advances exactly one section only when it starts at the corresponding inner-scroll boundary. A contact is consumed through animation. Inner content keeps native scrolling, pinch zoom and interactive/menu/dialog gestures remain native. Short landscape falls back to continuous reading. The Read page toggle remains visible at every size; reduced motion changes sections immediately. Existing 620ms transition remains the project interaction contract. Dock controls reserve >=44px and safe-area space. The mechanism adapts boundary/gesture concepts rather than introducing a carousel dependency.

Verification: KO/EN at375/768/1280, actual touch events and fresh captures for all12sections; inner scrolling to final career/project row, subsequent swipe, pinch/multitouch exclusion, dialog and menu operation, language navigation, reading mode, desktop wheel regression, reduced motion and no-JS. Clinical image captions and claims are checked against slide source context.

## Pure page transitions — September 24 revision

The user explicitly rejects scrolling inside presentation slides. This supersedes the September 23 boundary-scroll design: presentation is a fixed stack of twelve pages, with only the current page visible and focusable. Wheel, touch and paging keys change pages; they never pan the document or a slide. Short-screen and mobile presentations use the same summary-first composition. A deliberate Read page choice, print and no-JS retain the complete original document. Complete research, publication search, patents, education plus career and the adjacent current project remain available in a labelled detail dialog, where long-form reading is explicit.

Each presentation page has one clinical message, one authentic visual or concise evidence list, and an explicit detail action. Overview type is 32–56px desktop, 24–32px narrow, body16px with1.5line height. Viewport height below the header reserves80px for navigation,16–32px top spacing. Figures use contain sizing in remaining space; scientific labels are never cropped. Main pages cannot have vertical scrollbars. On very short/enlarged-text viewports a compact title+detail-action overview preserves access rather than automatically switching back to scrolling or clipping content. Details retain full original text and original image links.

Entry animation uses350ms (new --page-duration token) transform/opacity on the active overview, matching direction; reduced motion is instant. Wheel bursts consume momentum once; distinct deliberate steps and reverse direction remain responsive. No wheel event may revive inner scrolling. Active-page selection and inert inactive content replace window.scrollTo animation. Dialog/menu gestures and browser zoom remain native. Main section links, language anchors and browser history retain their existing destinations. Source mechanism: project-native active-page selection with beui tabs selection and dialog focus containment; no runtime dependency.

Review criteria: every main page fits at320×568,375×667,768×1024,1280×640,1440×900 in KO/EN; wheel regardless of pointer location; decaying momentum, repeated notches, reversal, diagonal/pinch; touch, keyboard, reduced motion, menu, dialog focus+search, reading mode and no-JS. All complete content remains reachable. Physical wheel feel remains a hardware-dependent follow-up beyond synthetic input tests.

## Directional motion polish — September 24 follow-up

The user confirms one-page navigation and requests a little more visible transition. Preserve the fixed-page layout and every gesture threshold. A single orchestrated entrance now uses a 560ms ease-out translation (56px desktop, 36px narrow) with opacity and a restrained .985-to-1 scale. Authentic figures follow 80ms later, with 18px directional travel and .97-to-1 scale, finishing with the overview. Previous-page navigation reverses travel. The header and navigation dock stay still. No blur, bounce, page rotation, continuous ambience or new dependency.

Tokens: --page-duration:560ms; --page-ease:cubic-bezier(.16,1,.3,1); --page-shift:56px (36px at <=760px); --page-scale:.985; --page-layer-delay:80ms; --page-layer-shift:18px; --page-layer-scale:.97. These adapt direction-aware content entrance and reduced-motion handling from beui expandable-tabs source (consulted September24). Use native Web Animations for transform/opacity only. All pending animations cancel together on new navigation, viewport change, detail opening or reduced-motion changes. New input never waits for animation completion. Reduced motion and reading mode remain immediate/native. Initial page load does not animate.

Verification: forward/reverse mid-transition frames on desktop/mobile, short and image-free pages, rapid interruption, menu/dialog/read-mode, reduced-motion toggled during motion, settled zero document/slide overflow, existing wheel/touch regression suite. Motion-only scope reuses prior complete 144-screen layout audit; fresh captures cover the affected transition states. No accepted motion/accessibility debt.

## Transfer portfolio consolidation — September 25

The user identifies repetition between page3 (transfer portfolio) and page4 (GreyNet). Present the three non-NeuroCAD transfers once in the portfolio overview, then proceed directly to the research mission. The deck now has eleven pages. Move the complete GreyNet case study, authentic radiograph and study link into the portfolio detail after its three transfer summaries, separated with existing spacing and rule tokens. Preserve #clinical and #detail-clinical as detail anchors under #transfers. Reading/no-JS remain complete. No changes to page navigation or motion. Review progression in KO/EN, retained source content and both prior anchor routes, modal focus, and mobile detail layout.

## Self-contained overview pages — September 28

The overview must explain the work before a visitor opens Details. Research pages show a clinical question, method and clinical relevance alongside the original scientific figure. Transfer rows explain each technology's mechanism and clinical use. Mission stages include their substance, publications show three selected research topics with journal/year and direct DOI links, and patents distinguish granted patents from published applications. People includes academic background, service and the current project. Details retains full bibliographic records, larger figures and extended history.

Reuse the split composition, fine-rule lists and existing tokens. Add a research brief (label plus sentence) and supplementary paragraph within the heading column; align the expanded copy as a cohesive block rather than leaving a sparse title above a distant button. Research figures keep intrinsic proportions and explanatory captions. No new motion, font, dependency or slide. Fixed main pages own no scroll; explicit detail dialogs and reading mode own long-form reading.

At normal mobile sizes, retain concise method and clinical significance, three portfolio summaries and three publication topics. Longer desktop context is supplementary, never the only explanation. Very short landscape/enlarged-text layouts retain the existing compact overview and explicit detail access. Core copy must not be clipped or reduced below existing body tokens. Verify all eleven pages in both languages at 375/768/1280 and short-screen layouts. Accepted limitation: full CV, full paper titles and source tables require Details in presentation mode; reading/no-JS/print remain complete.

## September 30: research stories with cinematic evidence

Desktop research stories pair goal, method and clinical significance with original evidence. At short desktop heights, the next page carries the foundational study and its limits. Transfer cases use three aligned illustrations on taller desktops, or one image-and-narrative composition per case on short desktops and phones. Narrow stories remove repeated copy between their opening and context pages. The pre-existing compact text fallback remains below 560px height, and below 640px height on screens narrower than 360px; detailed reading stays accessible there. Image anchors accept a tap to enlarge and a vertical swipe to navigate.

The visual centerpiece is authentic research evidence. Keep the white canvas, navy text, blue identity, shared title/action anchors and current wheel input contract. Each research first page must pair its clinical goal and significance with a large original figure. Full method, study context and limitations remain in the deck; on narrow screens, supplementary material continues as a coherent evidence page instead of splitting the initial question from its picture. Transfers show actual imagery with each technology's purpose and result. Papers and People stay single pages; restore visible paper titles and PI research bio at ordinary desktop heights.

Use a reusable research-story composition: a readable narrative column (goal, method, clinical relevance) beside a dominant evidence frame; a clinical-route list under the media maps data to interpretation to the next action. Routes are explanatory diagrams, not simulated inference or new clinical performance claims. A quiet sky-toned image surface and fine brand line provide depth within the consistently white slide. --evidence-shadow:0 16px 40px rgb(16 45 80 / .08) gives original research images a single shared elevation; no shadows on ordinary text panels. Do not retouch scientific image labels or fabricate output. No new dependencies or downloaded fonts.

New primitives: evidence-media (linked original with zoom affordance, hover/focus/pressed), research-story (copy + media), clinical-route (three connected stages), illustrated-transfer (real image + goal + transfer year/recipient), image-dialog (native modal original-image viewer, caption and close). Only the dialog or reading document owns vertical scrolling; the presentation stage never does. Keep body at 14–16px, retain keyboard focus and avoid hiding core explanations to fit.

Motion tokens: --image-reveal-duration:760ms; --image-zoom-duration:420ms; --image-entry-scale:1.04; --image-motion-ease:cubic-bezier(.22,1,.36,1). The image's paper/sky curtain moves away while its slightly enlarged image settles. The route has a one-shot 420ms staged emphasis ending within760ms. No continuous animation or fabricated scanning. A native image-dialog expands from the clicked image to the fitted original and returns to its source; Escape/backdrop/Close and focus restoration are required. Reduced motion is immediate, and all slide effects cancel on navigation, resize and details without gating wheel input. References: Motion animate/sequences and beUI expandable-tabs identity-preserving, interruptible mechanics; adapt to native Web Animations.

Review against 1280×640 as the constrained desktop, 1280×800 and1440×900, tablet768×1024, phone375×667, and compact320×568/landscape. Assert clinical goal + figure + significance on first research pages, retained full source text, title visibility, matching heading/action anchors, and no slide overflow. Visually inspect representative actual frames and triggered motion, not only numerical bounds. Large scientific figures and all source detail remain accessible at constrained sizes via their full-image and detail views.

## September 30: shared frame and directional page motion

Remove the standalone Research activity slide. Preserve the dated Scholar metrics and annual citation chart in People details, including the legacy #activity anchor. All non-welcome slides use one white frame, a common heading position/type scale and bottom action zone. Center the body within the remaining space; retain rich source content and responsive pagination. Welcome remains the identity composition.

Replace the small fading offset with an opaque full-height directional page push lasting 620ms. Forward and backward navigation travel in opposite directions. Keep header and dock fixed, clip motion to the stage, preserve in-flight geometry on reversal, and cancel on navigation, resize, dialogs or reduced-motion changes. No animation input lock, new dependency, blur or decorative looping effects. Verify mobile/desktop bounds, interruption, reduced motion and existing wheel behavior.

## Full-content presentation — September 29

### September 30 refinement

### Review implementation: purposeful pages and connected transitions

People is one curated overview with identity, education, academic service and current project; the complete CV remains in its explicitly labelled detail dialog. A separate Research activity page contains the dated Scholar metrics and annual chart together, never mixed with an arbitrary paper card. Clinical examples belong to the corresponding research detail, not member continuation pages. Both overview pages have stable semantic identities at every viewport; they do not participate in automatic pagination. At constrained heights, concise summaries link to full source content without inner scrolling.

NeuroCAD leads with clinical purpose, product evidence and a single official product CTA. Source/date attribution lives in an explicitly opened evidence panel, keeping the 100+ adoption claim traceable without an internal-note paragraph in the main composition. Related research remains a secondary link. Maintain white/navy/blue, existing system type and vertically centered content.

Page navigation keeps the header and controls still while outgoing and incoming content overlap in one directional transition. Outgoing content is inert and noninteractive; cancellation removes it immediately on a new input, resize, dialog, reading mode or reduced-motion change. Animate only transforms and opacity, for roughly half a second, without delaying input. Verify source completeness, semantic page counts, mobile fit, focus and interruption on the actual browser.

Motion uses 500ms, cubic-bezier(.22,1,.36,1), 56px desktop / 36px mobile travel. The outgoing fade completes in 45% of the incoming duration to avoid two readable text layers lingering together. Reversals start from computed in-flight geometry. Existing header, dock, palette and typography remain stable anchors.

Publications becomes one curated page with three research topics, journal/year and DOI links; its searchable complete bibliography remains in the detail dialog and continuous document. NeuroCAD's primary action opens Coreline Soft's official product page directly, replacing a redundant detail action. Preserve the white, navy and blue palette, system typography and vertically centered compositions. Motion follows navigation intent: a short coordinated heading/content/action entrance and a restrained image settle, with cancellation on every navigation and no input lock. Reduced-motion users receive immediate changes. No new animation dependency or ornamental effects.

The user prefers the amount of information in continuous reading. Presentation now takes its content directly from that same document: full research description, methods, significance, study notes and all scientific figures; full transfer descriptions; full publication records and medical patents; education, career and current project. Intro and contact retain their established compositions. The duplicate GreyNet case remains an optional enlarged case study rather than repeating its explanation in the deck.

Use a reusable deck page with heading, a grid of semantic content blocks, and source/detail links. Pack those blocks into the available viewport; overflowing collections continue on subsequent pages. Section navigation and reading-mode switching preserve the parent section, while the dock counts actual pages. Desktop research uses two columns for clinical context and study evidence; transfers and people use three columns; bibliographic records use two columns. Below 761px use one column. Keep body at existing 14–16px tokens, preserve image proportions, and never create an inner scrollbar or scale the entire page down. Very short screens keep the existing compact fallback. No new dependency or typeface. Rebuild pagination on viewport change and preserve the current content block where possible.

Accessibility: generated presentation copies have unique page IDs and no duplicate source IDs. Inactive pages and the hidden continuous document remain inaccessible; full source links still open the original labelled detail dialog. Details actions delegate to current DOM so generated buttons work. No-JS and print retain the original document. Verify text coverage against the source, continuation ordering, resize/language/mode navigation, focus restoration and full-page bounds.

The member profile includes a dated Google Scholar snapshot, the two publicly listed research interests, and three linked clinical research examples. Render annual citation counts as accessible HTML bars with exact labels; mark 2026 as a partial year. Keep metrics and chart source/date visible, and do not imply live synchronization. Scholar data is maintained in `src/scholar.mjs` (verified against the public profile on September 29, 2026).
