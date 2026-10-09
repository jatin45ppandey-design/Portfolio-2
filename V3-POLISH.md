# V3 Polish — implementation review

This is the scoped implementation of the 31 user-selected improvements. It is a **visual/content presentation** change; original published content, Studio editing, and source My-Portfolio were not modified.

## Navigation & typography
- [x] Keep **Replay Intro** once in the navbar; remove the duplicate in Hero.
- [x] Hide decorative 01, 02, 03 numbering from section, project, certification and school UI. Real ranking, dates and semester numbers remain.
- [x] Use a clear type hierarchy: restrained Bebas Neue headers; Manrope text and project names; JetBrains Mono for limited technical metadata.
- [x] Raise nav text legibility and preserve the one-view, original My-Portfolio section order.
- [x] Remove empty decorative labels and repeated counts.
- [x] Align spacing/padding using section styles.

## Home & About
- [x] Use independently selected Studio hero and About image fields (instead of forcing both to the same fallback).
- [x] Blend authentic portrait into dark hero/intro using CSS masks; no invented images.
- [x] Scale down name/heading sizes, make role/summary easier to scan.
- [x] Separate bottom scroll hint from status area.
- [x] Omit precisely the unwanted default **A little outside the editor** caption while still allowing Studio to show a different user-written image note.
- [x] Improve About paragraph widths, rhythm and photo framing.

## Projects & Skills
- [x] Prioritize real app screenshots over poster decoration.
- [x] Keep project description, real technology stack and detail CTA visible in each project card.
- [x] Keep desktop pinned horizontal scroll with height tied to measured travel; native sideways swipe on mobile.
- [x] Remove decorative "Selected Projects" footer.
- [x] Keep fullscreen actual screenshot and feature details; clearer hierarchy and improved image fitting; keyboard close.
- [x] Make skill categories compact and interactive; preserve all 28 skills.

## Education, leadership & credentials
- [x] Present education in balanced, timeline-inspired cards.
- [x] Keep each real semester grade legible without oversized tiles.
- [x] Preserve CSI photo, adjust crop/copy hierarchy and normalize contributions.
- [x] Avoid fallback "Beyond the code" label in default leadership heading; Studio-custom headings remain visible.
- [x] Display actual certificate scans in proportional non-cropped frames and lightbox.
- [x] Remove repeated credential numbers, preserve real issuing details and dates.
- [x] Contain full volleyball certificate images and balance award information.

## Contact, motion, usability
- [x] Make Contact statement proportionate to other headings.
- [x] Normalize real email/social CTAs and minimal useful icons.
- [x] Keep cinematic entrance, natural scrolling, hover transitions and reduced motion support.
- [x] Align mobile layout and keep accessible labels, Escape close and modal-close keyboard focus.
- [x] Leave owner-only Studio, schema, auth, drafts, history, media and publishing code unchanged.

## Known limitations / visual review needed
- Original private high-resolution portrait and Khao-Piio homepage image were too large to fetch with the connector; the existing authentic image substitutes are retained. To ensure different-looking Home & About, put two distinct real photos into the Studio or the corresponding local assets.
- Interactive browser/mobile QA and live Studio publish checks must be performed in the owner's environment before merging. CI success covers build/type/lint, not subjective visual perfection or external credentials.
- No modifications were made to the original My-Portfolio repository.
