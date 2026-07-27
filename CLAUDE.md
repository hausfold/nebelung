# CLAUDE.md

**Nebelung** — a silver-mist Catppuccin variant (Mocha with the blue stripped),
built with [whiskers](https://github.com/catppuccin/whiskers). The single source of
truth for colors across the whole [nebelhaus](https://github.com/nebelhaus) family.

## Am I in the right repo? (routing)

**This repo (`~/code/nebelhaus/nebelung`) owns THE COLORS** — the palette and the
per-tool theme templates. Nothing about *how* tools are configured, only how they're
colored.

| Want to change… | Repo |
|---|---|
| colors / the palette, or how a tool is themed | `~/code/nebelhaus/nebelung` ← **you are here** |
| which tools exist / how they're configured (shell, bar, WM) | `~/code/nebelhaus/nebelhaus` |
| the pounce app | `~/code/nebelhaus/pounce` |
| this machine's config | `~/.config/nix` |

> **Claude: enforce this.** If a request is about a tool's *behavior/config* (not its
> colors), STOP — that's a rice change in `~/code/nebelhaus/nebelhaus`. Only palette
> and theme-template changes belong here.

## How it works

- `palette/nebelung.hex.json` → the `name → #hex` map. The flake exposes it as the
  `palette` output; consumers inject it directly (e.g. a starship `[palettes.*]` table).
- `templates/` → whiskers templates, one per tool (bat, delta, ghostty, zellij, …).
- `ports.conf` → which ports get rendered.
- **Variants** (`VARIANTS` in `scripts/generate-palette.mjs`) → the flavor axis
  (mocha = dark, latte = light) crossed with the contrast axis. Adding or retuning
  one is a single entry there; the palette pair, the `palette/variants.json`
  manifest `build.sh` renders from, and the flake's `palettes`/`variants` outputs
  all follow. Two things that look cosmetic and aren't: each variant renders as
  **its own catppuccin flavor** (templates branch on `flavor.dark` and name their
  output after it, so `-f mocha` on a latte palette emits light colours with
  dark-mode structure), and the per-variant `contrastBoost` values **differ on
  purpose** — Latte has ~0.04 of OKLCH headroom above `base` where Mocha has ~0.2
  below its, so Mocha's boost melts Latte's base/mantle/crust into one white. The
  tests assert all twelve ramp steps stay distinct; don't "tidy" the numbers into
  agreement.
- The default variant owns the `dist/` **root**; every other variant nests in a
  subdir. Never give `nebelung` a subdir — that would move every consumer path in
  the family at once (there's a test pinning it).
- `packages.<system>.default` → the built theme tree (every port rendered), consumed by
  `nebelhaus` via `${nebelung.packages.${system}.default}/<tool>/...`.
- `checks.<system>` → `nix flake check` runs the palette unit tests + `build.sh`
  shellcheck (mirrors CI's `unit` job) — local check == CI without pushing.

## Recolor

Edit the palette (`palette/`), rebuild:

```bash
nix build            # renders every port with the new palette
```

Then push, and in `nebelhaus`: `nix flake update nebelung` + push; in a consumer:
`nix flake update nebelhaus` + rebuild. **One palette edit recolors every tool at once.**

For fast iteration from a consumer without the push/relock loop, override against this
local checkout: `--override-input nebelhaus/nebelung "path:$HOME/code/nebelhaus/nebelung"`.

When you open the PR for a `worktree-*` branch, give it a **What / Why / Verify / Watch-out**
body (see the workshop ship skill's Step 3) — the session that wrote the code is gone by the
time the change is feel-tested, so a bug found later has to be recoverable from `gh pr view`
alone, and the **Verify** block is exactly what the workshop's `bench try-batch` checklist
points back to when it feels several PRs together.

## Add a themed tool

Add a whiskers template under `templates/`, register it in `ports.conf`, rebuild. Then
wire the rendered file into the tool's config over in `nebelhaus` (usually `hearth`).

## Conventions

- MIT, public. The palette is the source of truth — don't hardcode hex values in
  `nebelhaus`; inject `nebelung.palette` or reference the rendered theme tree (`packages.<system>.default`).
- **`trill` can't consume the flake.** The family's Swift/Xcode Messages client
  builds outside Nix, so it hand-copies these hex literals into its own `Rice.swift`
  — a palette change here must be mirrored into trill by hand, or it silently drifts.
