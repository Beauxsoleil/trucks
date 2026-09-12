# Sound and artwork credits

## Smash Mode sounds

All three source recordings are marked **Creative Commons 0 (CC0 1.0)** on their Freesound pages (verified September 12, 2026). [License](https://creativecommons.org/publicdomain/zero/1.0/).

| Local file | Source and author | Adaptation |
| --- | --- | --- |
| `public/assets/sounds/rev.mp3` | [motor de camion / truck engine — jusebago](https://freesound.org/people/jusebago/sounds/515040/) | 0.35-second excerpt starting at 1 second; fade in/out, mono, quieter normalization. |
| `public/assets/sounds/engine.mp3` | [Engine.wav — CogFireStudios](https://freesound.org/people/CogFireStudios/sounds/421001/) | First 0.95 seconds; fade in/out, mono, quieter normalization. |
| `public/assets/sounds/crash.mp3` | [Wood Jostling.wav — ErikH2000](https://freesound.org/people/ErikH2000/sounds/213066/) | 0.7-second excerpt starting at 2 seconds; fade in/out, mono, quieter normalization. |

The publicly available high-quality MP3 previews were downloaded and adapted. They are bundled locally; the game makes no requests to Freesound while playing.

Source preview URLs:

- https://cdn.freesound.org/previews/515/515040_7856386-hq.mp3
- https://cdn.freesound.org/previews/421/421001_7614679-hq.mp3
- https://cdn.freesound.org/previews/213/213066_1464685-hq.mp3

A quiet generated triangle-wave cue covers the first tap if audio decoding has not finished. It is original application code, not an additional downloaded recording. Speech uses the device/browser's speech synthesis implementation; voice availability, offline operation, and processing location depend on that implementation.

## Artwork

The truck, hills/track, and stacked blocks were generated for this project using OpenAI image generation. They are not Kenney downloads. See `docs/ARTWORK.md` for prompts and asset details. The separate animated block shapes in Smash Mode are CSS shapes matching the red, blue, and yellow concept palette.
