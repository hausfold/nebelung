# CLAUDE.md

**Nebelung** — a silver-mist Catppuccin variant (Mocha with the blue stripped),
built with [whiskers](https://github.com/catppuccin/whiskers). The single source of
truth for colors across the whole [nebelhaus](https://github.com/nebelhaus) family.

## Am I in the right repo? (routing)

**This repo (`~/code/workshop/nebelung`) owns THE COLORS** — the palette and the
per-tool theme templates. Nothing about *how* tools are configured, only how they're
colored.

| Want to change… | Repo |
|---|---|
| colors / the palette, or how a tool is themed | `~/code/workshop/nebelung` ← **you are here** |
| which tools exist / how they're configured (shell, bar, WM) | `~/code/workshop/nebelhaus` |
| the pounce app | `~/code/workshop/pounce` |
| this machine's config | `~/.config/nix` |

> **Claude: enforce this.** If a request is about a tool's *behavior/config* (not its
> colors), STOP — that's a rice change in `~/code/workshop/nebelhaus`. Only palette
> and theme-template changes belong here.

## How it works

- `palette/nebelung.hex.json` → the `name → #hex` map. The flake exposes it as the
  `palette` output; consumers inject it directly (e.g. a starship `[palettes.*]` table).
- `templates/` → whiskers templates, one per tool (bat, delta, ghostty, zellij, …),
  vendored from upstream **verbatim except where marked `NEBELUNG PATCH`**. Nearly
  every patch is the same fix: `--color-overrides` rewrites only the flavor being
  rendered, so a template that emits *all four* catppuccin flavors into one file
  ships stock Catppuccin next to the Nebelung part. Grep the marker before
  re-vendoring — a fresh copy from upstream silently drops it. Details and the
  full list: [`docs/ports.md`](docs/ports.md). Colour-free companion files a port
  needs go in `templates/<port>/static/`, copied into its output verbatim.
- `ports.conf` → which ports get rendered.
- `ports.meta.json` → what INSTALLING each rendered port takes: `dest`, how it gets
  there (`install`), what makes it the active theme (`select`), and the derived
  `tier` — `auto` (a rebuild can do the whole thing), `activate` (the "which theme"
  setting lives in a file the app rewrites, so it needs an idempotent activation
  patch), `manual` (no file interface for selecting it; a human clicks or pastes).
  Exposed as the flake's `ports` output so `nebelhaus` can wire what it can and
  *report* what it can't. Hand-written, but fenced by tests: the ports.conf and
  ports.meta.json port sets must match, `tier` must agree with `select`/`install`,
  and every advertised path must exist in `dist/`. The ports table in
  `docs/ports.md` is **generated** from it — `node scripts/gen-ports-doc.mjs` after
  editing, or `node --test` fails.
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
local checkout: `--override-input nebelhaus/nebelung "path:$HOME/code/workshop/nebelung"`.

When you open the PR for a `worktree-*` branch, give it a **What / Why / Verify / Watch-out**
body (see the workshop ship skill's Step 3) — the session that wrote the code is gone by the
time the change is feel-tested, so a bug found later has to be recoverable from `gh pr view`
alone, and the **Verify** block is exactly what the workshop's `bench try-batch` checklist
points back to when it feels several PRs together.

## Add a themed tool

Add a whiskers template under `templates/`, register it in `ports.conf`, add its entry
to `ports.meta.json` (the tests fail without one), run `node scripts/gen-ports-doc.mjs`,
rebuild. Then wire the rendered file into the tool's config over in `nebelhaus`
(usually `hearth`).

## Conventions

- MIT, public. The palette is the source of truth — don't hardcode hex values in
  `nebelhaus`; inject `nebelung.palette` or reference the rendered theme tree (`packages.<system>.default`).
- **`trill` can't consume the flake.** The family's Swift/Xcode Messages client
  builds outside Nix, so it hand-copies these hex literals into its own `Rice.swift`
  — a palette change here must be mirrored into trill by hand, or it silently drifts.
