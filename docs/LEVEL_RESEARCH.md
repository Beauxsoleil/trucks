# Four delivery worlds — research and decisions

Research checked 2026-09-13 against the creators' pages and Three.js documentation.

## Open assets

- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit): 330 models, CC0. Reuse the already bundled trees and rocks with the blue Car Kit truck.
- [Kenney Space Kit](https://kenney.nl/assets/space-kit): 150 models, CC0. Selected only satelliteDish, rock_largeA and rock_crystalsLargeA; embedded textures in local GLBs. No weapon assets included. The Moon alone requests these replacements for the nature scenery.
- [Quaternius Animated Dinosaurs](https://quaternius.com/packs/animateddinosaurs.html): six animated CC0 dinosaurs, supplied as FBX/OBJ/Blend. Evaluated, not shipped: this version uses original friendly long-neck toy dinosaurs to avoid a new conversion/skinning pipeline. This is open-licensed art research, not a claim that all downloadable art is open-source software.

## Practices applied

- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) recommends instancing shared geometry/materials to reduce draw calls. Retain instanced GLB scenery, shared toy materials and a bounded number of decorations.
- Explicitly dispose scene geometry/materials/textures/instances and close image bitmaps when switching worlds. Abort outstanding model loads; keep procedural fallback truck and scenery when downloads fail.
- Keep the Three.js world behind the existing dynamic client import; do not put frame-by-frame physics in React state. Retain pixel-ratio cap, one shadow-casting sun, bounded frame time, blur pause and reduced-motion handling.
- Keep collision/mission logic independent of art: road and pickups share the same elevation function, so a visual model cannot prevent a delivery. Moon gravity is deliberately playful, not a scientific lunar simulation.
- All four levels are immediately available through large Back/Next controls. Same three-letter goal, no loss states, timers or required jumps. Completed deliveries offer replay or next level.

## Worlds

Sunny Farm has its barn and plank bridge. Dinosaur Valley adds smooth rolling hills, toy dinosaurs, footprints and an egg camp. Snowy Mountain adds gentle hills, snow-covered pines, snowmen, an ice bridge and cabin. Moon Mission adds craters, Earth, CC0 dishes/crystals, a dome base and longer/higher jumps.

## Asset provenance

Archive: https://kenney.nl/media/pages/assets/space-kit/20874c75ac-1677698978/kenney_space-kit.zip

Reproduce using `python scripts/prepare-space-models.py /path/to/kenney_space-kit.zip`. Original license is included at `public/assets/models/LICENSE-space-kit.txt`. Existing car/nature provenance remains in that directory's README.

## Verification

- Production build, TypeScript and ESLint passed; all 37 Node tests passed, including all eight embedded GLBs, terrain continuity, flat arrival zones and Moon jump duration/height.
- Local production browser: completed all four deliveries at 844×390 using gas, jump, all three pickups, guided tracing of every letter and Next level. All visible controls were inside the viewport, with no document scrolling.
- All four menus checked at 375×667 portrait; screenshots visually inspected for all landscape themes and the Moon portrait. Simulated WebGL context loss and retry preserved Moon selection. No browser page errors in the menu/recovery run.
- Software-rendered Chromium, accelerated frame timestamps and scripted pointer input were used for automation. Physical-device frame rate, audio playback and finger feel are not measured by these checks. Production deployment status is separate from local browser verification.
