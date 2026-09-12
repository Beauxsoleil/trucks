# Collins's Monster Truck Adventures

A colorful educational monster-truck game for Collins, built in stages in the existing `Beauxsoleil/trucks` repository.

## Stage 1: project scaffold

- Next.js App Router, TypeScript, Tailwind CSS, and ESLint.
- Home screen with two large choices, each at least 240px tall.
- `/smash` and `/trace` route scaffolds with a large return-home link.
- System fonts; no accounts, ads, analytics, database, or personal-data collection code.

Smash Mode is playable. Trace & Drive is playable; parent controls and deployment are planned for stage 5. This app has not yet been deployed to Vercel.

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
  smash/page.tsx  Smash Mode game entry
  trace/page.tsx  Trace & Drive game entry
components/
  mode-shell.tsx  Shared temporary mode screen
public/assets/    Truck, track, and wooden-block PNG assets
```

## Stage 2: concept art

The home screen now uses a friendly orange-and-blue truck, rolling-hill dirt track, and three stacked red/blue/yellow blocks. Assets live in `public/assets/`. Next.js Image provides responsive image delivery and reserves image dimensions. The two mode links remain at least 260px tall. Gameplay remains unchanged.

See `docs/ARTWORK.md` for generation prompts and provenance.

## Stage 3: Smash Mode

Tap anywhere in the play screen (or press Enter/Space on the large play button). The truck revs for 0.35 seconds, drives for 0.95 seconds, then smashes exactly three blocks. Blocks scatter, confetti appears, and the screen displays 3 while speech says “Three blocks!” After two seconds of celebration the scene resets automatically.

- No scores, penalties, countdown pressure, or losing state.
- Repeated taps during one cycle do not queue overlapping turns.
- Home stays available during play; timers/audio are cleaned up on navigation. Hiding the page resets the cycle.
- Three short CC0 clips are bundled locally. See `CREDITS.md`.
- Audio unlocks on interaction; unsupported or blocked sound/speech does not stop the visual game.
- Reduced-motion preferences remove hopping, travel, scattering, and confetti while retaining the count and reset.

Real tablet validation is still needed for touch feel and the device's available speech voice.

## Stage 4: Trace & Drive

Trace each dashed SVG road with a finger, mouse, or stylus. The truck follows the pointer; covered road turns green. Drifting off the road has no penalty. Finger lifts keep the coverage already earned.

- Letters open in order **L, T, I, F, E, H**, followed by **C, O, U** only after the first six are completed. Previously opened letters can be replayed.
- Independent SVG strokes use `getTotalLength()` / `getPointAtLength()` and length-weighted coverage bins. Completion triggers once at 85% coverage.
- The 35px tolerance is measured in screen pixels using the SVG screen transform. Repeated touches do not accumulate extra credit, and large pointer jumps do not fill skipped road.
- Completion fills the letter, hops the truck, shows confetti/stars, and requests the letter name, approximate sound, and an example word through browser speech synthesis. **Hear** repeats the audio on demand. Actual phonetic pronunciation varies by installed voice; this is not a recorded phonics voice pack.
- Word roads **IT, FIT, LET, HIT** appear only when their letters are learned (at least three letters completed). Trace each tile in sequence. The finished word gets a truck drive and letter-by-letter/whole-word read-aloud.
- Versioned progress uses `localStorage` key `collins-truck-trace-v1`. Unlocks are derived from completed letters/words. It stays on this browser/device; clearing site data clears progress. If storage is blocked or full, play and unlocks continue in memory for the current visit.
- No database, accounts, analytics, or remote progress service.

Geometry and unlock regression checks (Node.js 22.18+ or Node.js 24):

```sh
node --test tests/trace.test.mjs
```

Trace implementation: `components/trace-game.tsx`, `components/trace-board.tsx`, `lib/trace-letters.ts`, and `lib/trace-geometry.ts`. Browser validation details are in `docs/VALIDATION.md`.
