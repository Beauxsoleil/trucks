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
