# Smoother tracing and truck physics

## Tracing

- Read coalesced hardware pointer samples, with normal pointer events as a fallback. Process samples in order and stop at every stroke boundary; never invent shortcut points across curves.
- Keep progress in refs and redraw at most once per animation frame. Cancel scheduled drawing on unmount. Draw continuous painted subpaths with round joins.
- Process the final pointer-up position, but not canceled input. Retain stroke order, lift requirements, endpoint checks, off-road rejection and saved progress behavior.
- Fix a phone-layout bug: the start/follow instruction could change from one line to two and move the SVG mid-stroke. Reserve two lines plus padding at phone widths so the road stays still under the finger.

## Physics

- Integrate motion in substeps no larger than 1/120 second, with a 50 ms elapsed-time cap and invalid-time guard.
- Gas accelerates; release gives a short, bounded coast rather than an abrupt stop. Gravity along slopes changes grounded speed. No reverse rolling or fail states.
- Jump height is computed in world space against the next road height, including bridge elevation. The truck no longer follows terrain vertically while airborne. Uphill takeoffs retain upward velocity; landings report impact speed. Moon gravity remains distinct.
- Damped springs produce landing compression/recovery, acceleration/braking pitch, and mild cornering lean. Spring travel is bounded. Reduced-motion mode suppresses cosmetic suspension/lean, while blur still clears gas and pauses play.
- This is deliberately constrained toy-vehicle physics, not a free-steering collision/rollover simulator. Delivery and tracing goals remain unchanged.

## Verification — 2026-09-13

- Production build, TypeScript and ESLint passed. All 41 Node tests passed, including coalesced sample boundaries, no endpoint shortcuts, frame-rate agreement, slope effects, ballistic motion, suspension settling, and all four traversable terrains.
- Local production Chromium: all A–Z completed with batched/coalesced pointer samples at 844×390, preserving lifts and incomplete intermediate strokes. Screenshots inspected.
- The extra 375×667 test initially reproduced incomplete I caused by hint wrapping. After reserving hint height, I, T, Y, C, O and S all passed without scrolling.
- Browser checks passed for coasting to a stop, jumping, landing suspension compression and blur clearing gas. All four full deliveries passed through gas/jump, three pickups, guided word tracing, celebration and next-level navigation. Portrait level menus and Moon graphics retry passed. No browser page errors.
- These are software-rendered local browser tests, not measurements of physical iPhone touch latency, frame rate or speaker output. Vercel deployment status is checked separately.
