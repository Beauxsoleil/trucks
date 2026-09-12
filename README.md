# Collins's Monster Truck Adventures

A bright, forgiving monster-truck learning game for Collins, built with Next.js App Router, React, TypeScript, and Tailwind CSS. No accounts, ads, analytics, scores to lose, or database.

## Play

- **Drive & Jump 3D:** hold the big green Gas pedal to drive a 3D monster truck along an endless dirt track. Release to stop, and tap the yellow Jump button to hop. Gas and Jump work together with two fingers. Steering is automatic; there are no crashes to lose, timers, or game-over screens. Groups of three colorful blocks scatter when hit and repeat along the track.
- **Keyboard driving:** hold Up Arrow or W for gas and press Space to jump when focus is on the game. The Gas button also supports holding Space/Enter when focused; the Jump button supports normal keyboard activation. Switching away clears held inputs and pauses driving.
- **3D compatibility:** the playground uses WebGL 2 and loads Three.js only when that mode opens. If 3D cannot start or the graphics context is lost, a retry screen links directly to letter tracing.
- **Trace & Drive:** drag a finger, mouse, or stylus along the dashed letter road. The truck follows; completed road turns green. Going off the road never removes progress. Lifting and restarting is fine.
- **Letter order:** L, T, I, F, E, H, then C, O, U. Curves unlock only after the six straight-line letters are completed. Opened letters can be replayed.
- **Word roads:** IT, FIT, LET, HIT become available when their letters have been completed. Finish the tiles in order to see the truck drive across the word and hear it read aloud.

Speech uses the browser/device voice. **Hear** repeats a letter's name, approximate sound, and example word. Completing any letter (including a word tile) says “Good job, Collins!” before the letter teaching cue. The same praise appears on-screen. Installed voices vary; this is not a recorded phonics voice pack. Missing or blocked speech does not stop the game.

## Parent mode

On the home screen, **hold the truck logo for three seconds**. A settings-free panel shows saved letter/word completion and a short play tip. Choose **Back to game** to close it.

- A normal tap does not open it.
- Moving more than 15px, releasing early, losing pointer capture, or hiding the page cancels a pending hold.
- Keyboard: focus the truck logo and hold Space or Enter for three seconds. Escape closes the panel.
- The panel does not edit or erase progress. It closes when the page loses focus, is hidden, or you navigate away. Parent mode is not kept unlocked between visits.

## Tablet use

Landscape is the main layout. The two home choices remain at least 200px tall on shorter landscape screens. Trace & Drive keeps the letter road visible while longer lists of letter/word choices scroll independently. Portrait layouts remain available; the app does not force orientation or disable page zoom.

Audio starts after interaction. Keep the tablet volume comfortable. Reduced-motion preferences remove decorative movement while retaining the count, completed roads, and resets.

## Progress

Letter/word completion is stored under `collins-truck-trace-v1` in browser `localStorage`. Unlocks are derived from completed items. Progress stays on that browser and origin; clearing site data, switching browsers, or changing the deployed domain does not transfer it. No cross-device sync is configured.

If storage is blocked or full, the tracing screen keeps progress in memory while it remains open. The parent panel reports when saved progress cannot be read.

## Run locally

Use Node.js 22 LTS or newer (22.18+ to run the dependency-free TypeScript tests).

```sh
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```sh
npm run build
npm start
```

## Check changes

```sh
npm run lint
npm run build
node --test tests/*.test.mjs
```

`npm ci` installs the exact dependency versions in the committed lockfile. See [validation notes](docs/VALIDATION.md) for completed checks and device-testing limits.

## Deploy to Vercel

**Deployment:** Vercel reported a successful build for commit `a08119e`. The 3D driving update must also finish its own deployment before it appears live. Detailed Vercel logs require access to the `joel-0cb9` workspace.

Import this existing repository: [Beauxsoleil/trucks](https://github.com/Beauxsoleil/trucks).

1. In your Vercel dashboard, choose **Add New → Project** and import `Beauxsoleil/trucks` from the connected GitHub account.
2. Use the **Next.js** framework preset, repository root (`.`), and production branch `main`.
3. Keep the default install/build/output settings. No environment variables, Neon project, API keys, or other services are required.
4. Use your personal Hobby project and select **Deploy**. Wait for **Ready** before using the production URL Vercel provides.
5. Open that URL on the tablet. Check Smash sound/speech, tracing feel, the long-press parent panel, and progress after reloading.

With the Git integration configured, subsequent pushes to the production branch trigger deployments. Vercel's official instructions: [Git deployments](https://vercel.com/docs/git) and [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).

This repository uses native Next.js routing. GitHub Pages static hosting is not configured.

## Project structure

```text
app/                       Home, /smash, /trace, shared layout/styles
components/parent-mode.*    Long-press parent panel
components/smash-game.*     3D playground controls and loading/failure UI
lib/drive-world.ts          Three.js truck, scenery, rendering and cleanup
lib/drive-physics.ts        Acceleration, braking, jump and landing
components/trace-game.*    Letter/word selection, speech, progress
components/trace-board.tsx  SVG roads, pointer capture, truck, coverage
lib/parent-hold.ts          Cancelable three-second hold
lib/smash-audio.ts          Local sound loading and playback
lib/trace-geometry.ts       Length sampling and 35px coverage tolerance
lib/trace-letters.ts        Letter paths, unlock rules, saved data validation
public/assets/             Artwork and three short CC0 sound clips
tests/                     Hold timing, geometry, and unlock checks
```

Tracing samples independent SVG paths using `getTotalLength()` and `getPointAtLength()`. Coverage is length-weighted and completes at 85%. The tolerance is 35 actual screen pixels, even when the SVG is scaled. Repeated touches do not inflate coverage; large pointer jumps do not paint skipped sections.

Artwork details are in [docs/ARTWORK.md](docs/ARTWORK.md). The three Freesound CC0 recordings and adaptations are credited in [CREDITS.md](CREDITS.md). They are bundled locally rather than streamed during play.
