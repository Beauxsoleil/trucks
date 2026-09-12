# Guided handwriting, word delivery, and Fuel Lab

Researched September 12, 2026. Implemented with original code and original SVG controls; no game source, publisher worksheets, or protected artwork was copied.

## Handwriting

Learning Without Tears explains that capitals share a top starting region and simple lines/curves, and emphasizes consistent top-to-bottom and left-to-right formation habits. Its formation resources explicitly provide stroke sequence, and its videos describe lifting and returning to a starting point for several capitals. These informed the guided approach, not a claim that this app implements an officially licensed curriculum.

Schools use different manuscript programs. Collins’ school and its actual formation chart have not been identified. The app uses a consistent manuscript sequence, with corrected top starts and lifts for A, M, N, Y, and a common center junction for K. An actual school chart is needed to promise an exact match.

- [Learning Without Tears: why capitals first](https://www.lwtears.com/support/product-information/why-are-capitals-taught-first)
- [Formation charts](https://www.lwtears.com/letter-number-formation-charts)
- [Teacher video lessons](https://www.lwtears.com/resources/Handwriting-Without-Tears-Video-Lessons)
- [Teach Handwriting: letter-form differences](https://teachhandwriting.co.uk/letters-faq.html)

The game highlights one stroke, displays a numbered start/resume dot and an arrow, accepts only forward movement along that stroke, and requires a lift before the next stroke. Going off track or lifting preserves the completed prefix; resuming starts at the frontier. Large jumps, stationary taps, reverse strokes, and later strokes do not complete the current stroke. Finger tolerance remains generous (24 screen pixels around the active path, 12 at its end). This replaces the older unordered 95% coverage rule in all playable tracing boards.

## Word delivery

24 familiar three-letter words keep the existing three-pickup driving loop short. Examples include CAT, DOG, SUN, BUS, MOM, and DAD. Each pickup carries the corresponding letter in order, including repeated letters. At the barn, the child traces all three letters, receives praise for each, and hears the letters followed by the spoken word. The completed word joins the existing saved word progress. Replay excludes the previous word. The regular tracing mode retains all 39 word choices.

## Falling-particle research

DAN-BALL’s Powder Game—the game at its `dust` URL—is a relevant reference for interacting dots with distinct material rules. Sandspiel’s creator describes a compact cell grid, per-cell state, local neighbor rules, and a tick marker to prevent a moved particle updating repeatedly in one step. We use those general ideas in a new, small TypeScript engine: typed arrays, bounded grid, visited flags, alternating scan direction, and a fixed 30 Hz simulation. Canvas rendering and input are separate from the engine.

- [DAN-BALL Powder Game](https://dan-ball.jp/en/javagame/dust/)
- [Max Bittker: Making Sandspiel](https://maxbittker.com/making-sandspiel/)

## Science versus pretend fuel

NASA explains water’s solid, liquid, and gaseous states, and warming-driven melting and evaporation. The lab models these qualitatively. It does not simulate real temperatures, molecular chemistry, pressure, combustion, or conservation of thermodynamic energy.

- [NASA Climate Kids: water cycle](https://climatekids.nasa.gov/water-cycle/)
- [USGS Water Science School: ice is less dense than water](https://www.usgs.gov/water-science-school/science/water-density)

| Material or action | Implemented behavior | Learning / play role |
| --- | --- | --- |
| Sand | Falls, piles up; touching water becomes mud | Gravity and mixing; mud is a mixture |
| Water | Falls, flows sideways and pools | Liquid flow |
| Ice | Floats through water; warming at bottom pad melts it | State change |
| Warm pad | Water near the bottom becomes rising vapor | Qualitative evaporation |
| Cool pad | Water near the bottom freezes; vapor condenses | Qualitative cooling |
| Fuel crystals + water | Creates purple rising power bubbles | Explicitly fictional reaction |
| Bubble collector | Captures pretend energy at the top | A visible experiment goal |
| Test truck | Consumes 30 power; accelerates and jumps a ramp under gravity | Cause and effect, motion |
| Walls / eraser | Build barriers or reopen channels | Experiment with flow |

The purple crystal reaction, bubble-to-truck energy conversion, and displayed vapor particles are playful representations, not real fuel recipes. Real water vapor is invisible; visible dots make the simulation understandable. No real fuels, explosives, or chemical quantities are included.

The lab provides five experiment prompts, free pouring/drawing, keyboard pouring, pause/resume, and an empty-tank reset. It pauses on focus/visibility loss and cleans up its animation/listeners on navigation. Lab contents reset when leaving the mode; saved handwriting progress is separate. No extra service, database, or paid dependency is required.
