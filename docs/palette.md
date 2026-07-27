# nebelung palette internals

## Repo layout

```
palette/
  variants.json       # name → { flavor, dir } (generated; the render manifest)
  nebelung.json       # whiskers --color-overrides file (generated)
  nebelung.hex.json   # flat name→hex map (generated; what the flake reads)
  nebelung-*.json     # …and the same pair per variant
scripts/
  generate-palette.mjs# regenerates every variant via OKLCH color math
templates/            # vendored upstream port .tera templates
dist/                 # rendered themes, ready to install (variants in subdirs)
preview/*.html        # visual swatch + mockup per variant, through whiskers
ports.conf            # port manifest: name | template | output | extra args
build.sh              # render every port, for every variant, into dist/
```

Adding or retuning a variant is one entry in `VARIANTS` in
`scripts/generate-palette.mjs`: it writes the palette pair, the `variants.json`
manifest `build.sh` renders from, and the flake's `palettes` output all follow.

## Two things that are load-bearing, not cosmetic

**Each variant renders as its own catppuccin flavor** (`whiskers -f latte`).
Templates branch on `flavor.dark` — Ghostty's ANSI 0/7/8/15, Kitty's tab colors,
Zen's `prefers-color-scheme` — and name their output after the flavor. A Latte
palette rendered as `-f mocha` would emit light colors wearing dark-mode
structure, under Mocha's filenames.

**The two contrast boosts differ, on purpose.** A boost pushes the ramp outward
from its midpoint, and Mocha has ~0.2 of OKLCH headroom below `base` where Latte
has only ~0.04 above its. Pushed as hard as Mocha, Latte's `base`/`mantle`/`crust`
clamp into one white and the ramp loses a step. The tests assert all twelve steps
stay distinct, so the numbers can't be "tidied" into agreement.

## Tuning

Edit the `CONFIG` block at the top of `scripts/generate-palette.mjs`:

| knob | meaning |
| --- | --- |
| `neutralHue` | hue (°) of the grey tint (only matters when chroma > 0) |
| `neutralChroma` | tint strength — the default `0` is pure neutral grey |
| `accentChromaScale` | accent calming — 0.9 = 10% less saturated |

Re-run `node scripts/generate-palette.mjs` (or `./build.sh`) and re-open
`preview/nebelung.html` to judge.
