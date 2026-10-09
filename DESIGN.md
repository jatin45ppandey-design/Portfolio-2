# V2 Design Constitution — Jatin Pandey Portfolio

## Identity
- **Professional site title:** Jatin Pandey | Portfolio
- **Do not label sections** Seasons, Episodes, Prologue, Originals or Dossier.
- **Section headings:** Home, About Me, Projects, Skills, Education, Leadership, Certifications, Achievements, Contact.
- **Visual language:** premium cinematic, Obsidian `#0B0D11` + Champagne Gold `#D6B57A`, Ivory `#F5F1EA`, Slate `#777B86`.
- **Typography:** Bebas Neue (display), Manrope (body/UI), JetBrains Mono (labels/metadata).
- **Hero:** dark cinematic, studio spotlight, real portrait, strong editorial text left.
- **Motion:** premium, purposeful; blur/opacity/translation, subtle card depth, no excessive glow or constant motion.

## Interaction
- Intro skippable, title + portrait reveal; three perspectives Explore/Recruiter/Developer, same content, order changes.
- Desktop projects: sticky section and scroll-driven horizontal gallery; mobile swipe.
- Project posters: cinematic stills from genuine application screenshots, full details on click.
- Certificates/achievements: genuine proof images.
- Natural scrolling everywhere else, reduced motion support, keyboard Escape close.

## Content invariant
Do not hide or remove source content fields; use `PortfolioDocument` directly. All content editing, draft preview and published data should render from the same component.

## Studio invariant
Owner-only GitHub OAuth, authenticated editing, strict Zod schema, drafts, publishes, version history and Cloudinary uploads. No changes to existing original `My-Portfolio` repository or its database.

## External assets
Two original >1 MB images could not be downloaded via the connector. This repo ships an authentic public portrait and uses the real Khao-Piio checkout screenshot until the complete asset can be copied. Do not invent personal certifications or project statistics.

## Codex acceptance checks
`npm ci`; `npx prisma generate`; `npm run lint`; `npx tsc --noEmit --incremental false`; `npm run build`; test authentication and permissions on the new environment. Validate a studio draft, publish, revision history, keyboard navigation, mobile project rail, and image loading.
