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
