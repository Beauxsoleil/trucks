# Selected Kenney CC0 models

Creator: Kenney (https://kenney.nl). Retrieved September 12, 2026.

- Car Kit 3.1: https://kenney.nl/assets/car-kit
- Source ZIP: https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip
- Nature Kit 1.0: https://kenney.nl/assets/nature-kit
- Source ZIP: https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip
- License: CC0 1.0. Original pack notices: LICENSE-car-kit.txt and LICENSE-nature-kit.txt.

`truck.glb` and `wheel-tractor-dark-back.glb` come from the Car Kit's `Models/GLB format` directory. Their palette textures were embedded into the GLB binary buffer. The truck is rotated, lifted, scaled, and fitted with oversized tires, suspension, trim, cargo, and a letter plate at runtime.

`tree_oak.glb`, `tree_pineRoundA.glb`, and `rock_largeA.glb` come from the Nature Kit's `Models/GLTF format` directory. Their geometry is unchanged; scale and position vary at runtime. The game batches repeated trees and rocks with instanced rendering.

Rebuild the packaged files from the downloaded original archives:

```sh
python scripts/prepare-models.py /path/to/car-kit.zip /path/to/nature-kit.zip
```

## Packaged file SHA-256

- `rock_largeA.glb`: `0c6ac729729acdf9d6e4245f0cc65648a90f4c1bc6b59753bd3271c69d587d21` (7552 bytes)
- `tree_oak.glb`: `31729107bfd61183e794a3f2d9d4dd69420a25cf76cf55fe4164a635587e07c5` (14644 bytes)
- `tree_pineRoundA.glb`: `6075e806bd1e590c3e23375e09a79afb1bfda1c51c25f2beb12b386071f338a6` (14488 bytes)
- `truck.glb`: `ab3a14621adaeac01e8d78877b241fb0a6c6a1a4d333c9cf311a33cff71366bc` (188744 bytes)
- `wheel-tractor-dark-back.glb`: `687d897c06072b05d0d094a020f455c19524c911c36ab7336b29d5bbdf055961` (49068 bytes)

The game recolors the pickup’s green palette entries to blue at runtime; windows, lights, metal, and tires retain their source colors. The GLB files and hashes above are unchanged.
# Four-world additions

Selected Kenney Space Kit models (archive license identifies version 2.0), CC0, downloaded 2026-09-13 from https://kenney.nl/assets/space-kit. See `LICENSE-space-kit.txt` and `scripts/prepare-space-models.py`. Only the Moon loads these three models (58,912 bytes combined); no external texture requests.

| File | SHA-256 |
| --- | --- |
| space-satelliteDish.glb | d741f8d078ffd44257278b3e227f30b8942032ab448f4f91b96bd9aa8c5607e4 |
| space-rock_largeA.glb | 13b2bf393fcd7ca8c73d8a2a731da0be6c2c2b4e67ef0ae826e816c0d8733f2f |
| space-rock_crystalsLargeA.glb | cfe8f339f6be4a321e5f3822237002b6a70f9c5d03596a7c347adabd5247fbd9 |

Dinosaurs, footprints, snowmen, snow-covered trees, craters and destination buildings are original procedural toys in `lib/level-scenery.ts`, not downloaded Quaternius models. Research and selection details: `docs/LEVEL_RESEARCH.md`.
