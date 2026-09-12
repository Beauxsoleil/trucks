# Collins's Monster Truck Adventures

A colorful educational monster-truck game for Collins, built in stages in the existing `Beauxsoleil/trucks` repository.

## Stage 1: project scaffold

- Next.js App Router, TypeScript, Tailwind CSS, and ESLint.
- Home screen with two large choices, each at least 240px tall.
- `/smash` and `/trace` route scaffolds with a large return-home link.
- System fonts; no accounts, ads, analytics, database, or personal-data collection code.

The game routes currently show “Adventure coming soon!” They are intentionally scaffolds: art comes in stage 2, Smash gameplay in stage 3, tracing in stage 4, and parent controls/deployment in stage 5. This stage does not deploy to Vercel.

## Run locally

Use Node.js 20.9 or later (Node.js 22 LTS recommended).

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Verify

```sh
npm run lint
npm run build
npm start
```

`npm ci` installs the exact versions in the committed lockfile.

## Structure

```text
app/
  layout.tsx       App metadata and shared layout
  globals.css     Tailwind and shared visual styles
  page.tsx        Two-choice home screen
  smash/page.tsx  Smash Mode scaffold
  trace/page.tsx  Trace & Drive scaffold
components/
  mode-shell.tsx  Shared temporary mode screen
public/assets/    Reserved for stage 2 art
```
