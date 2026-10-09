# Jatin Pandey — Standalone Signature Intro

**Only the cinematic opening.** A self-contained React/Vite introduction extracted from Portfolio-2 V3.

This branch contains **no portfolio sections, navbar, projects, Studio, authentication, database or backend**. The older Portfolio-2 branches remain safe and available separately.

## Run

Requires Node.js 20.19+ or 22+.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite (usually **http://localhost:5173**).

## How it behaves

- Cinematic sequence: dark background → portrait spotlight → name typography → role → interactive action.
- The standalone preview holds on the completed frame. **Replay Intro** restarts the animation.
- **Skip Intro** immediately advances to the final frame.
- Reduced-motion preference skips animated transitions.
- Original actual Jatin photo: `public/images/profile/jatin-working.jpg`.
- Obsidian × Champagne Gold palette. Bebas Neue / JetBrains Mono.

## Reuse in another site

The reusable source is `src/components/SignatureIntro.tsx` plus `SignatureIntro.css`.

```tsx
import SignatureIntro from "./components/SignatureIntro";

<SignatureIntro
  firstName="Jatin"
  lastName="Pandey"
  focus="Java · Spring Boot · Backend"
  portraitSrc="/images/profile/jatin-working.jpg"
  onComplete={() => setShowPortfolio(true)}
/>
```

When `onComplete` is supplied, the CTA becomes **View Portfolio** and the intro automatically calls the parent callback after 4.5 seconds. Without it, the demo is standalone and replayable—there is **no broken link to deleted content**.

## Quality checks

```bash
npm run check
npm run build
```

## Backup / source protection

This is an isolated `dev/intro-only` branch with a clean file tree. Prior complete portfolio revisions remain in `main`, `dev/v3-final-polish` and the earlier cinematic branches. Original `My-Portfolio` was not modified.
