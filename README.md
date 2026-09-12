# Collins's Monster Truck Adventures

A bright, forgiving monster-truck learning game for Collins, built with Next.js App Router, React, TypeScript, and Tailwind CSS. No accounts, ads, analytics, scores to lose, or database.

## Play

- **Letter Delivery 3D:** each mission chooses a random uppercase letter A–Z. Choose **Let's deliver!**, hold Gas to drive, and tap Jump to hop. Collect three matching letter blocks, cross the wooden bridge, and drive to the red barn. The truck stops there so Collins can trace the chosen letter. Finishing opens the barn, brings out a sheep, and says “Good job, Collins! You delivered the chosen letter!” **Deliver again** picks a different letter.
- **A clear, forgiving goal:** three outlined letter blocks fill as they are collected. Steering is automatic, pickups work while jumping, and there is no timer or losing. A continuous drive to the barn takes about 30 seconds, plus tracing time.
- **3D models:** locally bundled Kenney CC0 pickup body, oversized tractor tires, oak/pine trees, and rocks, with soft shadows, rotating wheels, suspension, and dust. Repeated scenery shares geometry. Original procedural models provide the barn, sheep, bridge, fences, blocks, and a fallback truck while assets load or if loading fails. See [model research](docs/MODEL_RESEARCH.md) and [asset provenance](public/assets/models/README.md).
- **Keyboard driving:** hold Up Arrow or W for gas and press Space to jump when focus is on the game. The Gas button also supports holding Space/Enter when focused; the Jump button supports normal keyboard activation. Switching away clears held inputs and pauses driving.
- **3D compatibility:** the playground uses WebGL 2 and loads Three.js only when that mode opens. If 3D cannot start or the graphics context is lost, a retry screen links directly to letter tracing. Retrying after graphics-context loss restores collected blocks and the position in this mission.
- **Trace & Drive:** drag a finger, mouse, or stylus along the dashed letter road. The truck follows; completed road turns green. Going off the road never removes progress. Lifting and restarting is fine.
- **Full alphabet:** all 26 uppercase letters A–Z are available immediately and can be replayed. Each independent stroke must be traced before a letter completes.
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

Letter/word completion is stored under `collins-truck-trace-v1` in browser `localStorage`. Word unlocks are derived from completed letters. Existing saved progress remains compatible. Progress stays on that browser and origin; clearing site data, switching browsers, or changing the deployed domain does not transfer it. No cross-device sync is configured.

Completing the barn mission saves its chosen letter to the same letter progress. An unfinished delivery is kept during graphics recovery but starts over after leaving the mode or reloading the page.

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

**Deployment:** the Git integration builds pushes to `main`. Check the Vercel status on each commit before assuming an update is live. Detailed Vercel logs require access to the `joel-0cb9` workspace.

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
lib/delivery.ts             Pickup distances and mission stages
lib/toy-models.ts           Procedural truck, barn, sheep and materials
components/trace-game.*    Letter/word selection, speech, progress
components/trace-board.tsx  SVG roads, pointer capture, truck, coverage
lib/parent-hold.ts          Cancelable three-second hold
lib/smash-audio.ts          Local sound loading and playback
lib/trace-geometry.ts       Length sampling and 35px coverage tolerance
lib/trace-letters.ts        A–Z paths, word unlock rules, saved data validation
public/assets/             Artwork and three short CC0 sound clips
tests/                     Hold timing, geometry, and unlock checks
```

Tracing samples independent SVG paths using `getTotalLength()` and `getPointAtLength()`. Completion requires at least 95% of **every independent stroke**, with both ends of each stroke visited. A wide 35-screen-pixel sideways tolerance remains, but a touch only paints the nearest stroke and at most five pixels of extra length along it. A 12-screen-pixel allowance around each stroke endpoint lets a finger finish the visible road cap without pixel-perfect placement. This prevents I/T stems from filling their horizontal bars. Repeated touches do not inflate coverage; large pointer jumps do not paint skipped sections.

Artwork details are in [docs/ARTWORK.md](docs/ARTWORK.md). The three Freesound CC0 recordings and adaptations are credited in [CREDITS.md](CREDITS.md). They are bundled locally rather than streamed during play.
