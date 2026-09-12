# Stage 2–3 validation

- Production build and ESLint passed.
- Headless Chromium checked home buttons at 1024×768, 844×390, and 390×844: exactly two links, each at least 200px tall, no horizontal overflow.
- Smash touch cycle: rev → drive → impact; exactly three blocks; visible `3`; one `Three blocks!` speech request; reset approximately two seconds after impact.
- Eight rapid extra taps did not queue extra speech/turns.
- Keyboard activation worked; navigating Home during a running turn canceled its timers and prevented a later speech request.
- Reduced-motion preference hid confetti and retained completion/reset.
- Smash had no horizontal overflow at 844×390, 390×844, and 1920×1080.
- All three PNG assets and three MP3 assets returned HTTP 200; no browser page exceptions.
- Home and impact screenshots were visually inspected.

The speech method was intercepted to verify the text and call count. Actual voice output, audio volume, and physical touch feel still need checking on Collins's tablet. Browser emulation does not replace device testing.

## Stage 4

- Five pure regression tests cover the 35px boundary, SVG scale, repeated touches, skipped segments, length-weighted independent strokes, ordered letter/word unlocks, and malformed saved data.
- Headless Chromium traced all six straight-line letters followed by C, O, U. Mouse and actual touch events exercised SVG pointer capture and path geometry.
- Partial strokes survived lifting; off-path and repeated same-position touches did not falsely complete a letter.
- IT unlocked after its prerequisites, required both tiles, saved completion, and requested letter-by-letter plus whole-word speech. Reload restored progress and resumed the next uncompleted letter.
- Reduced motion removed animations. Layout checks found no horizontal overflow at 844×390, 390×844, and 1920×1080. Screenshots of tracing and the completed word were inspected.
- Disabled localStorage still allowed completing a letter and unlocking the next letter in memory. No browser exceptions occurred.

Speech requests were intercepted during browser tests. Tablet voice pronunciation and physical touch feel still require a real-device check.

## Stage 5

- Production build and ESLint passed after adding the parent panel and landscape styles.
- Four additional hold-controller regression tests check the exact three-second threshold, normal taps, movement cancellation, repeated key presses, and cancellation before delayed opening. The five tracing/unlock tests remain in the suite.
- Landscape CSS preserves at least 200px home choices and gives the tracing road a fixed visible area with independently scrollable controls. The original cloud-browser check was blocked; the local Chromium verification below completes this layout check.
- Vercel deployment and production-URL verification are pending the Vercel account connection. No live deployment is claimed.

Before handing the tablet to Collins, verify long-press opening and early-release cancellation, Escape/Back to game, comfortable audio, tracing feel, and saved progress on the final production origin.

## Continuation check — September 12, 2026

- Re-ran the production build, ESLint, and all nine regression tests successfully.
- Local Chromium loaded home and tracing at 1024×768, 844×390, and 390×844 without horizontal page overflow or JavaScript exceptions. Home choices measured 260px high on the larger/portrait views and 200px high on short landscape. The tracing board remained within the landscape viewport. Inspected the short-landscape screenshot.
- A normal logo tap stayed closed after three seconds; holding Space opened the parent panel, and Escape closed it.
- Visual inspection found the parent progress cards clipping on a narrow portrait screen. Changed them to stack below 481px and allowed desktop grid columns to shrink. Rebuilt production and checked the panel at 320×568, 390×844, and 844×390: no horizontal panel overflow; Back to game closed it at every size. Inspected the corrected portrait screenshot.
- Vercel returned no accessible teams and failed to list projects. A deployed production URL remains unverified. Browser checks used a local production server; physical tablet touch and actual audio remain device checks.

## 3D driving and personalized praise — September 12, 2026

- Replaced the timed 2D Smash sequence with a Three.js playground, automatic steering, held gas, braking on release, jumping, and repeating groups of three smashable blocks. Letter tracing remains a finger-controlled SVG road.
- Production build and ESLint pass. All 11 pure regression tests pass, including new acceleration, braking, long-frame clamping, jump-in-motion, double-jump prevention, and landing checks.
- Local Chromium verified keyboard gas/jump/release, real two-finger touch gas+jump, clearing held controls on blur, block collisions, and no horizontal overflow at 1024×768, 844×390, and 390×844. Inspected screenshots and corrected the portrait camera so the entire truck stays visible.
- Traced L through browser pointer events: exactly one speech request began “Good job, Collins!”; completion remained saved after reload. No page exceptions occurred in the normal play flow.
- Simulated graphics-context loss: Try again recreated exactly one canvas and enabled play. With WebGL disabled, the fallback linked successfully to letter tracing.
- Speech requests were intercepted for automated checks. Real tablet frame rate, pronunciation, volume, and touch feel still require checking on the device. No recorded voice pack or cross-device storage was added.

## Barn delivery and complete strokes — September 12, 2026

- Added one complete, replayable L delivery mission: spoken start, three labeled pickups and filled HUD slots, bridge, automatic barn stop, embedded L tracing, opening doors, a sheep celebration, and personalized speech. Picking up blocks while airborne is intentionally forgiving. No failure state or countdown.
- Replaced simple truck boxes with original rounded toy models, driver, lights, exhausts, wheel hubs/treads, and suspension. Added original barn, sheep, bridge, fences, trees, and dust. Textures are generated locally; no external art services or downloads are used during play.
- Fixed early tracing completion: require 95% of each stroke and both endpoints. The 35px sideways hit area remains, but touch coverage follows only the nearest stroke with 5px longitudinal tolerance. T/I intersections cannot fill neighboring bars.
- All 19 pure tests pass. New tests cover incomplete T and I bars at scales 0.35, 1, and 1.6, missing endpoints, pickup thresholds, and arrival only after all three blocks.
- Local production Chromium verified T and I remain incomplete with missing/partial bars and complete after all strokes. Verified real simultaneous touch Gas+Jump, release to stop, portrait/landscape layouts, the entire delivery from start to barn/tracing/sheep, exactly one mission-completion speech request, and replay reset. No page exceptions in that flow.
- Graphics recovery during the mission retained the first block and driving position. Screenshots of intro, portrait and landscape driving, tracing, and delivery celebration were inspected.
- Browser speech was intercepted to check requests. Physical tablet performance, pronunciation, and touch feel remain real-device checks. Existing saved letter progress is not erased; unfinished missions restart when leaving/reloading the page.

## Full alphabet and imported models — September 12, 2026

- Production build, ESLint, and all 23 regression tests pass. Coverage includes all 26 definitions, random selection across A–Z with no immediate replay repeat, compatible saved progress, self-contained GLB buffers/textures, and the existing incomplete I/T stroke checks.
- Local production Chromium traced every letter A–Z through actual SVG geometry and pointer events; all 26 completions survived reload. Fixed closed-loop endpoint ties found while checking O, without reducing independent-stroke requirements.
- Verified one complete randomly selected delivery, partial tracing remaining incomplete, full tracing completing the mission, matching personalized speech, and a different letter on replay. Portrait and landscape had no horizontal overflow or page exceptions.
- Verified the Kenney truck and all three scenery batches load, and inspected the rendered truck/scenery. Blocking model requests retained a working procedural truck and driving controls without page exceptions.
- Browser speech was intercepted to check requested text. Physical tablet frame rate, voice output, and touch feel remain device checks.
