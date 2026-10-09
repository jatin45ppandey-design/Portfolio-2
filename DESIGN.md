# Design guidelines — Jatin Pandey Portfolio (V3)

## Design invariant
Professional developer portfolio, **cinematic motion — not movie branding**. Keep all existing My-Portfolio factual content, ownership model and section priority.

1. **Professional labels:** Home, About Me, Projects, Skills, Education, Leadership, Certifications, Achievements, Contact. No “THE SERIES”, “Prologue”, “Episode”, “Originals”, “Dossier”, “Enter the Series” or “film credits” content.
2. **One view:** No Explore / Recruiter / Developer profile selector. Intro → Hero → sections in the My-Portfolio order; never conditionally hide or reorder data.
3. **Intro:** Signature Reveal with near-black seamless background, authentic portrait at right, editorial name left, warm restrained spotlight. Animated automatically, skippable and replayable. Portrait must remain visible; no giant text over the face or bright photo rectangle.
4. **Fonts:** Bebas Neue (restrained statement display), Manrope (readable body and project names), JetBrains Mono (small tech/navigation labels). Reduce massive title sizes.
5. **Colors:** Obsidian \`#0B0D11\`, Champagne Gold \`#D6B57A\`, Ivory \`#F5F1EA\`, Muted Slate \`#777B86\`.
6. **Sections:** Use real photos/screenshots/certificate evidence; do not add invented badges, fake metrics, big placeholder logos or excessive visual flourishes.
7. **Projects:** Full factual content, technology stack and real screenshots. Horizontal scroll on desktop; native swipe on mobile; accessible fullscreen detail modals.
8. **Scrolling:** Selective sticky effects and blur-to-sharp reveals are good; avoid scroll jacking, forced delays beyond the skippable intro, and heavy animations on mobile.
9. **Accessibility:** No inaccessible controls, keyboard Escape closes modals, support prefers-reduced-motion, readable contrast and alt text. Maintain headings and deep linking.
10. **Portfolio Studio:** Keep owner-only Auth.js/GitHub OAuth, strictly validated document schema, Prisma/Neon, Cloudinary uploads, draft, preview, publish and revision history. Do not alter old My-Portfolio or its production database.

## Order and information density
Home → About → Projects → Skills → Education → Leadership → Certifications → Achievements → Contact. Preserve all field values/visible records published by the Studio. Prefer a short scannable primary card plus detail view over hiding data.

## Media note
The default fallback portrait is an authentic image copied from Jatin's public profile repository and is not necessarily the preferred new high-resolution studio asset. Studio-selected custom hero imagery is respected. Khao-Piio uses its real checkout image as a temporary fallback. Replace both without changing the document schema.

## Test before merging
\`npm ci\`, \`npx prisma generate\`, \`npm run lint\`, \`npx tsc --noEmit --incremental false\`, \`npm run build\`, followed by real desktop/mobile review. Test Studio owner login, drafts/preview/publish, revisions and asset uploads separately on a fresh environment. Do not merge failing CI or deploy with old production credentials.
