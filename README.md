# Jatin Pandey — Developer Portfolio

A professional, cinematic developer portfolio for **Jatin Pandey** built on the existing **My-Portfolio** technical foundation. Uses real portfolio content, subtle editorial animations and a low-key Obsidian × Champagne Gold aesthetic.

## The experience (V3)
- **One view**: automatic, skippable **Signature Reveal** intro directly transitions to the homepage. No Recruiter/Developer profile gate or navbar View selector.
- Familiar, professional sections in **the same order as My-Portfolio**: Home, About Me, Projects, Skills, Education, Leadership, Certifications, Achievements, Contact.
- Real portfolio screenshots first; interactive project panels include actual descriptions, tech stack, screenshots and available links.
- Restrained portrait spotlight, section reveals, a slim scroll indicator, gentle project hover and desktop pinned horizontal project navigation (native swipe on mobile).
- All original editable content remains governed by the existing **PortfolioDocument** model.

## Stack and Studio
**Next.js 16 · React 19 · TypeScript · Tailwind 4 · Motion · Prisma 7 · Neon PostgreSQL · Auth.js/GitHub OAuth · Cloudinary.**

Studio code migrated from My-Portfolio and preserved for owner-only editing, draft preview, publishing, revision history, conflict validation and media management. Both Studio preview and public site use \`src/components/portfolio/PortfolioView.tsx\` (and the same document schema). The *old My-Portfolio repository and deployed website remain untouched*.

## Run locally
Use Node.js 22+ and an independent environment for the new site.

\`\`\`bash
git clone -b dev/professional-refinement https://github.com/jatin45ppandey-design/Portfolio-2.git
cd Portfolio-2
npm ci
npx prisma generate
npm run dev
\`\`\`

Open \`http://localhost:3000\`. To rerun the intro, use the discreet **Replay Intro** action; subsequent visits in the same browser session go directly to the homepage.

## Check code
\`\`\`bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
\`\`\`

## Deploy and connect Studio
Use \`.env.example\` to supply the **new site's** environment in \`.env.local\` / Vercel.
- \`DATABASE_URL\` + \`DIRECT_URL\`: **a separate Neon database**, never the old production DB.
- \`AUTH_SECRET\`, \`AUTH_GITHUB_ID\`, \`AUTH_GITHUB_SECRET\`, \`GITHUB_OWNER_ID\`: owner-only Studio authorization; register the correct OAuth callback for the new site.
- \`CLOUDINARY_*\`: configure the new deployment's media.
- \`NEXT_PUBLIC_SITE_URL\`: deployment origin.

Review database seed and migrations before writing to any database. Do not deploy the Studio in a publicly writable state.

## Outstanding assets and checks
The original >1 MB \`My-Portfolio\` private portrait and Khao-Piio home screenshot could not be fetched through the current connector. An authentic public profile portrait is used, and the real Khao-Piio checkout image is displayed instead of inventing mockups. Swap in the actual optimized assets when available.

Production data, Studio OAuth/media publishing, actual browser rendering and mobile ergonomics should be checked with your own deployment credentials. Treat passing CI as a baseline, not a substitute for Studio end-to-end tests.

Design intent and Codex constraints are recorded in \`DESIGN.md\`.
