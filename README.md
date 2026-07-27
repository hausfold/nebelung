<div align="center">

<!-- palette-first hero: animated accent ramp, sorted by hue (assets/swatch-cascade.webp) — static fallback: assets/palette.png -->
<img src="./assets/swatch-cascade.webp" alt="the nebelung accent palette, sorted by hue" width="720">

A custom [Catppuccin](https://catppuccin.com) flavor — **Mocha with the blue stripped out**.

![part of nebelhaus](https://img.shields.io/badge/part_of-nebelhaus-f2c4e5?labelColor=202020)
![license](https://img.shields.io/badge/license-MIT-d7d7d7?labelColor=202020)

</div>

---

The entire Catppuccin neutral ramp (`base` → `text`) carries a single ~240° blue
hue. Nebelung rewrites that ramp to **pure neutral grey** (chroma 0 — every
neutral is exactly R = G = B), keeping each color's perceptual lightness
identical, then **calms the 14 accents** (chroma ×0.9) so they sit comfortably
against true grey instead of a slightly-blue base.

Built with [whiskers](https://whiskers.catppuccin.com): the palette is a
`--color-overrides` file applied to the upstream flavor slot of each port's
template, so ports stay in sync with Catppuccin upstream and only the colors change.

## Variants

Those two rules never mention "dark", so they work in either polarity. Point them
at **Latte** instead of Mocha and you get the same theme as a light one — light
mode here is a different *source* palette, not an inverted dark palette. Crossed
with a contrast axis, that's four variants:

| variant | source | `dist/` subdir | text on base |
| --- | --- | --- | --- |
| `nebelung` | Mocha | *(the root)* | 11.3:1 |
| `nebelung-high-contrast` | Mocha | `high-contrast/` | 19.9:1 |
| `nebelung-latte` | Latte | `latte/` | 7.0:1 |
| `nebelung-latte-high-contrast` | Latte | `latte-high-contrast/` | 9.9:1 |

The default variant keeps the tree root, so every path that existed before
variants did still resolves. The rest nest inside it.

Two things are load-bearing rather than cosmetic:

- **Each variant renders as its own catppuccin flavor** (`whiskers -f latte`).
  Templates branch on `flavor.dark` — Ghostty's ANSI 0/7/8/15, Kitty's tab
  colors, Zen's `prefers-color-scheme` — and name their output after the flavor.
  A Latte palette rendered as `-f mocha` would emit light colors wearing
  dark-mode structure, under Mocha's filenames.
- **The two contrast boosts differ, on purpose.** A boost pushes the ramp
  outward from its midpoint, and Mocha has ~0.2 of OKLCH headroom below `base`
  where Latte has only ~0.04 above its. Pushed as hard as Mocha, Latte's
  `base`/`mantle`/`crust` clamp into one white and the ramp loses a step. The
  tests assert all twelve steps stay distinct, so the numbers can't be "tidied"
  into agreement.

## Preview

▶ **[open the interactive preview](https://htmlpreview.github.io/?https://github.com/nebelhaus/nebelung/blob/main/preview/nebelung.html)** — the live swatch board + editor/terminal mockups, rendered straight from [`preview/nebelung.html`](preview/nebelung.html). One per variant: [`nebelung-latte.html`](preview/nebelung-latte.html) is light mode.

## Layout

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

## Usage

```bash
./build.sh             # regenerate palette + render all ports → dist/
./build.sh --no-gen    # render only (palette unchanged)
```

## Ports

Paths below are the default (Mocha) variant. A variant's files sit under its
`dist/` subdir and are named after ITS flavor — Ghostty's light-mode theme is
`dist/latte/ghostty/themes/catppuccin-latte.conf`.

| Port | Output in `dist/` | Install |
| --- | --- | --- |
| Ghostty | `ghostty/themes/catppuccin-mocha.conf` | copy into `~/.config/ghostty/themes/`, then `theme = catppuccin-mocha` |
| Kitty | `kitty/themes/mocha.conf` | copy into `~/.config/kitty/`, then `include mocha.conf` |
| Alacritty | `alacritty/catppuccin-mocha.toml` | import under `[general] import` in `alacritty.toml` |
| Starship | `starship/themes/mocha.toml` | merge into `~/.config/starship.toml` (or `palette = "mocha"`) |
| Zellij | `zellij/themes/nebelung.kdl` | copy into `~/.config/zellij/themes/`, set `theme "nebelung"` |
| btop | `btop/themes/catppuccin_mocha.theme` | copy into `~/.config/btop/themes/`, set `color_theme` |
| tmux | `tmux/themes/catppuccin_mocha_tmux.conf` | `source` it from `.tmux.conf` |
| bat | `bat/themes/Catppuccin Mocha.tmTheme` | copy into `$(bat --config-dir)/themes/`, `bat cache --build`, set `--theme` |
| delta | `delta/catppuccin.gitconfig` | `include` it from `~/.gitconfig`, set `features = catppuccin-mocha` |
| fzf | `fzf/themes/catppuccin-fzf-mocha.sh` (+ fish/nu/ps1/rc) | source it from your shell rc |
| lsd | `lsd/themes/catppuccin-mocha/colors.yaml` | copy as `~/.config/lsd/colors.yaml`, set `color.theme: custom` |
| yazi | `yazi/themes/mocha/catppuccin-mocha-<accent>.toml` | copy the accent you want as the flavor in `theme.toml` |
| lazygit | `lazygit/themes/mocha/<accent>.yml` | point `lg` config at it, or merge the `themes-mergable` variant |
| glow | `glow/catppuccin-mocha.json` | a glamour style — pass with `glow -s <path>` |
| zsh-syntax-highlighting | `zsh-syntax-highlighting/themes/…mocha….zsh` | source it before `zsh-syntax-highlighting.zsh` |
| Slack | `slack/README.md` | copy the comma-separated hex string → Slack ▸ Preferences ▸ Themes ▸ paste |
| Zen | `zen/themes/Mocha/<Accent>/userChrome.css` (+ `userContent.css`) | pick an accent folder, copy into your Zen `chrome/` dir |
| Obsidian | `obsidian/Nebelung/` | copy the folder into a vault's `.obsidian/themes/`, then choose Nebelung under Settings ▸ Appearance ▸ Themes (dark mode recommended) |
| opencode | `opencode/nebelung.json` | copy into `~/.config/opencode/themes/`, then `theme = "nebelung"` in `opencode.json` |
| VS Code / Cursor | `vscode/settings.json` | merge into your user `settings.json` (needs the Catppuccin extension) |
| Stylus | `stylus/nebelung-stylus.json` (+ README) | import via the Stylus browser extension ▸ Manage ▸ Import (see `stylus/README.md`) |

VS Code uses the extension's native `catppuccin.colorOverrides` setting — no
build, the palette is just injected via settings. Set `catppuccin.accentColor`
yourself if you want a non-default accent.

## Nix

You don't need to install any of the above by hand if you consume this repo as
a flake — that's how the [nebelhaus](https://github.com/nebelhaus/nebelhaus)
rice themes everything:

```nix
inputs.nebelung.url = "github:nebelhaus/nebelung";
```

Outputs:

- `packages.<system>.default` — the whole `dist/` tree, built reproducibly
  (no committed artifacts involved). Source files from
  `${nebelung.packages.<system>.default}/<port>/…`, or
  `…/<variants.<name>.dir>/<port>/…` for a variant.
- `palette` — the raw `name → "#hex"` attrset for the default variant, for
  configs Nix generates itself (a starship palette table, pounce's baked-in
  colors).
- `palettes` — the same shape for every variant, keyed by variant name. What a
  consumer following a light-mode or contrast setting reads.
- `variants` — `name → { flavor, dir }`. `flavor` is the catppuccin flavor the
  variant rendered as, which is what a consumer needs to build the flavor-named
  paths whiskers emits (`catppuccin-latte.conf` vs `catppuccin-mocha.conf`);
  `dir` is its subdirectory, `""` for the default.
- `checks.<system>` — `nix flake check` runs the palette unit tests +
  `build.sh` shellcheck (the same as CI's `unit` job), so `nix flake check`
  == CI without pushing.

Inside the rice, picking an accent and applying it is a single option — see
[Theming & accents](https://nebelhaus.com/guides/theming/) on nebelhaus.com.

Hacking on the palette inside the wider rice? `bench try` in the
[workshop](https://github.com/nebelhaus/workshop) rebuilds your machine
against this local checkout — no push/re-lock loop. CI keeps the committed
`dist/` honest by rebuilding and diffing on every push.

### Tuning the palette

Edit the `CONFIG` block at the top of `scripts/generate-palette.mjs`:

| knob | meaning |
| --- | --- |
| `neutralHue` | hue (°) of the grey tint (only matters when chroma > 0) |
| `neutralChroma` | tint strength — the default `0` is pure neutral grey |
| `accentChromaScale` | accent calming — 0.9 = 10% less saturated |

Re-run `node scripts/generate-palette.mjs` (or `./build.sh`) and re-open
`preview/nebelung.html` to judge.

## Requirements

- [`whiskers`](https://whiskers.catppuccin.com) — `brew install catppuccin/tap/whiskers`
- Node (for the palette generator)
