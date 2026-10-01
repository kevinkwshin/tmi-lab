# Illustration motion · October 1, 2026

The five requested scenes use native SVG and Web Animations over existing artwork. Motion is explanatory and does not represent patient records, product inference, measured treatment outcomes or validated surgical predictions. Original scientific figures remain intact. All animations repeat with rests and stop on navigation, hidden tabs, dialogs, printing or reduced motion. No replay controls or changes to wheel handling.

Supplemental SVG images must decode before replacing a poster. Slow loads retain the original artwork; failed loads remain static. Navigation or preference changes invalidate pending playback, so a late download cannot start an off-screen animation.

## Choreography

- Welcome: the dragon opens its palm toward the visitor and waves at the wrist three times; the goose bows and both blink. Lettering stays fixed. The opening information-flow lines were removed at the user's request.
- Triage: the amber CT study starts late in the waiting queue, moves around the queue and arrives in front, then the blue route leads toward clinical review.
- Mission: chevrons follow the existing forward arrows, then travel along the return loop.
- Digital twin: upper and lower hypothetical outcomes alternate emphasis, synchronized with their incoming branches.
- Precision medicine: three modality signals converge at one interpretation point, followed by a signal toward consultation.

## Generated background plates

Both plates were produced with the built-in image generation tool on2026-10-01 from existing site assets. Original outputs are retained in the local generated-image directory. The site uses the original untouched posters at rest, without JavaScript and with reduced motion.

### neurocad-triage-clean.png

Input: public/assets/neurocad-triage-journey.png.
Output: exec-58ea0682-7924-4c0d-9510-f146d1ad1b0e.png.

Prompt:

> Use case: precise-object-edit. Edit target: the provided1536x1024 TMI-lab isometric medical illustration. Create a clean background plate for an animation. Change ONLY this object: remove the single orange/amber highlighted foreground CT scan card and its exclamation badge at roughly x720–845, y400–600, plus its amber halo. Reconstruct the pale floor and any ordinary gray queued CT cards behind that removed object. Preserve the entire rest of the input exactly: the many gray waiting scan cards diagonally behind, CT scanner room left, clock, hospital room top right, seated physician and monitors right, all existing gray/blue flow arrows including the blue expedited path beginning below the removed card. Keep exact scene geometry, perspective, positions, aspect ratio, camera, palette, lighting, and generous white background; no text, no new elements, no crop, no border. This will be used under an independently animated CT card, so the target card's old location must be completely empty and clean, while the blue path stays in place.

The foreground study is a clipped image of the original artwork, scaled and translated in its1536x1024 coordinate system.

### tmi-logo-motion-base.png

Input: public/assets/tmi-logo.webp, the user-supplied logo.
Output: exec-24eac986-6f46-48b2-98de-8296b51e70ba.png.

Prompt:

> Precise local object removal for animation, not a logo redesign. Preserve this exact1200x810 TMI logo including all lettering, blue T, dragon, goose, layout, white background and illustration texture. Remove ONLY the dragon's right raised arm and blue hand resting on the upper left edge of the blue T: the hand roughly x365-415 y214-252, and the white coat forearm from x337 y277 to x384 y248. Reconstruct the solid blue T underneath the hand (its top horizontal edge is at y229), white background above the T, and a smooth natural contour of the dragon's body/coat at the shoulder around x330 y279. The dragon should have no raised arm visible in this one small area. Do not remove its other arm holding a tablet. Do not change the dragon's head, body, eyes, feet, horns, goose, or any text. Keep exact registration and all other pixels visually identical; no crop or rescale. This is a clean background plate over which the original arm will be animated independently.

Only a small registered arm-area patch from this output is displayed. Original source pixels supply the rest of the logo, moving hand and goose. A native sleeve joins the moving hand to the shoulder, and a small solid-blue patch restores the T beneath the original hand. SVG coordinate data are artwork registration, not layout dimensions. The original poster remains the fallback and resting state.

### tmi-dragon-palm.png · front-facing greeting revision

Generated with the built-in image tool from `tmi-logo.webp` as the style reference. Output: `exec-97ddac46-4ba1-4de3-b247-02faee23acff.png`. Its transparent background is preserved. The original clipped hand is now used only for the transition into and out of the open-palm greeting; the replacement hand rotates at its wrist, with the sleeve stationary.

Prompt:

> Use case: precise-object-edit. Reference: supplied TMI-lab blue dragon logo, use ONLY as style and color reference. Generate one isolated sprite of this dragon's small light-blue cartoon hand in a friendly hello gesture, PALM clearly facing the viewer, fingers pointing UP. Show three upright rounded fingers and a shorter thumb opening to the LEFT. Visible soft palm and one minimal palm crease; no claws, fingernails, fur, paw pad, realistic human skin. Match the exact logo style: soft icy blue watercolor fill, subtle highlight, confident dark navy rounded outline, cute and simple. End in a short narrow blue wrist pointing down, no sleeve or arm. Hand should be naturally front facing, NOT knuckles or back of hand, NOT fingers curled downward, NOT a hand resting on a surface. One hand only, upright, centered, fills about85% of a square canvas with modest transparent margins. Genuinely transparent background, no white rectangle, shadow, text, logo lettering, or other objects. This is a small website animation part composited onto the existing dragon at its wrist.
