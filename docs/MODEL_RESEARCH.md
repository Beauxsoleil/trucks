# 3D model research and implementation

Reviewed September 12, 2026 for Collins's Monster Truck Adventures.

## What improves this game

- **Use cohesive, authored silhouettes.** Kenney's pickup has recognizable cab, bed, windows, bumpers, and wheel arches. We adapted it with oversized treaded tractor tires, independent spinning wheel pivots, suspension, blue chassis trim, cargo, and a mission-letter plate.
- **Use glTF/GLB for web delivery.** Three.js provides GLTFLoader for this format. We embedded the pickup/tire palette images into their GLBs to remove missing-relative-texture and cross-origin dependencies. Only the five selected models ship, totaling 274,496 bytes; the full asset archives do not ship.
- **Batch repeated scenery.** Three.js InstancedMesh reduces draw calls for repeated geometry/materials. Oak trees, pines, and rocks use instanced batches; cloned tires share their source geometry/materials.
- **Ground the models with light and shadow.** A single directional sunlight shadow map at 1024×1024 covers the nearby playable area, with soft filtering and hemisphere fill. Pixel ratio stays capped at 1.5. This is a practical starting budget, not a measured guarantee for Collins's tablet.
- **Keep loading failure harmless.** Procedural models remain playable while GLBs load and if any model request fails. Loading is aborted on exit or after ten seconds; textures, image bitmaps, geometry, materials, shadow targets, and instances are disposed when the scene is closed.

Technical sources: [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), and [DirectionalLight](https://threejs.org/docs/pages/DirectionalLight.html).

## Asset selection

| Creator and pack | License stated by creator | Decision |
| --- | --- | --- |
| [Kenney Car Kit](https://kenney.nl/assets/car-kit) 3.1 | CC0 | Shipped pickup body and tractor tire; adapted in code for monster-truck proportions. |
| [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) 1.0 | CC0 | Shipped oak, rounded pine, and low rock models. |
| [Quaternius Ultimate Animated Animal Pack](https://quaternius.com/packs/ultimateanimatedanimals.html) | CC0 | Reviewed as a future animation option; not shipped. The existing custom barn/sheep celebration remains. |

These are openly reusable art assets, rather than a new dependency on a hosted model service. The creator's original license notices are included beside the models. [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) describes the public-domain dedication.

## Reproduction and credits

See [asset provenance](../public/assets/models/README.md) for download URLs, file hashes, and packaging instructions. The source archives include additional export formats; only GLBs needed by this game are bundled. No author endorsement is implied.
