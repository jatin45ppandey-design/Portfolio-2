# Jatin Pandey | Cinematic Portfolio (V2)

This repository is the **independent, cinematic edition** of the developer portfolio for Jatin Pandey.

The visible public site has premium cinematic opening, studio spotlight portrait, three viewing perspectives, scroll-driven project gallery, project case studies, skill/education/leadership/certification/achievement sections. **Headings are professional** and the factual content comes from the existing `My-Portfolio` schema.

## Stack and Portfolio Studio
This version is built on the same technical specification as My-Portfolio: **Next.js 16, React 19, TypeScript, Tailwind 4, Motion, Prisma 7, Neon PostgreSQL, Auth.js/GitHub owner authentication, Cloudinary**.

The existing owner-only Studio source is preserved (content editing, draft preview, publish, revision history, asset management, optimistic-conflict controls). The published site and preview call the same `PortfolioView` component. Preview mode uses draft content; live mode uses published content.

**No connections to the old website's production database should be reused.** Configure separate Neon, Cloudinary storage folder, GitHub OAuth callback / site URL, and secrets for the new deployment.

## Quick start
```bash
npm ci
# Create .env.local from .env.example, fill in YOUR OWN NEW deployment values
npx prisma generate
npm run dev
```

## Checks
```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Run migrations in the new database only. Follow the migration and initialization instructions in the original My-Portfolio README, with a new private environment; **never** point Prisma migrations to the old production database.

## Known media follow-up
- The original private repo's 1.5 MB portrait could not be copied via the current GitHub connector. The new repository uses Jatin's existing public GitHub profile photograph as an authentic fallback.
- The 1.3 MB Khao-Piio home image also exceeded the connector response size; the interface temporarily displays the project's real checkout image. Replace the local `public/images/projects/khao-piio/home.jpg` with the original asset when available.
- Studio-managed Cloudinary images require independent media migration if the published database references them.

## Editing with Codex
See `DESIGN.md`. Keep `src/lib/content/schema.ts` and server-side Studio authorization unchanged unless explicitly necessary. Work on the `dev/cinematic-v2` branch and run quality checks before merging to main.

## Source safety
`My-Portfolio` and the old deployed portfolio were **not edited** by this migration. Only the designated new repo was written.
