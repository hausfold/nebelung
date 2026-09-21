# AGENTS.md

**Nebelung** — Catppuccin Mocha with the blue stripped, built with
[whiskers](https://github.com/catppuccin/whiskers): the
[hausfold](https://github.com/hausfold) family's source of truth for colour.
The README is the manual; never cut it to a door. Per-client wiring:
[`.agents/`](./.agents/README.md).

## Routing

**A tool's behaviour or config goes to haus** even when a template could
carry it; only colour lives here.

| Change… | Repo |
|---|---|
| the palette, a tool's theme | `~/code/workshop/nebelung` — here |
| which tools exist or how they're configured | `~/code/workshop/haus` |
| this machine | `~/.config/nix` |
| anything else | the routing table in `~/code/workshop/AGENTS.md` |

## Layout

- `palette/nebelung.hex.json` — the `name → #hex` map, the flake's `palette`
  output. Every output is in [`docs/nix.md`](docs/nix.md).
- `VARIANTS` in `scripts/generate-palette.mjs` — one entry per variant. Never
  tidy the `contrastBoost` values into agreement (Mocha's melts Latte's
  `base`/`mantle`/`crust` into one white; the tests hold all twelve ramp steps
  distinct). [`docs/palette.md`](docs/palette.md).
- `nebelung` owns the `dist/` root; never give it a subdir — every consumer
  path in the family would move. A test pins it.
- `templates/` — vendored whiskers templates, verbatim except where marked
  `NEBELUNG PATCH`; grep the marker before re-vendoring, a fresh copy drops it.
  Companion files: `templates/<port>/static/`. [`docs/ports.md`](docs/ports.md).
- `ports.conf` — which ports render. `ports.meta.json` — what installing each
  takes (`category`, `dest`, `install`, `select`, `platform`, `alsoPlace`,
  `pathNote`, and `tier`: `auto`, `activate` or `manual`, derived from
  `select`/`install`), the flake's `ports` output; `node --test` fences it
  against `ports.conf`, `dist/`, `CATEGORIES` in `scripts/gen-ports-doc.mjs`
  and the `tier` rule. A file a port needs is `alsoPlace`, never a `pathNote`
  (`(+ …)`).
- New port: a template, a `ports.conf` line, a `ports.meta.json` entry,
  `node scripts/gen-ports-doc.mjs`, rebuild, then wire it in `haus` (usually
  `terminal`). The script writes `docs/ports.md` and `README.md` between
  `ports:begin`/`ports:end`; never hand-edit inside (`node --test` catches a
  stale one).
- `templates/preview.html.tera` → `preview/<variant>.html`; `preview/index.html`
  is hand-written and `.nojekyll` keeps Pages static. Pages serves **main**'s
  root, so `hausfold.github.io/nebelung/preview/…` moves on merge.

## Recolor

Edit `palette/`, `nix build`. Ripple: `bench ship nebelung` (a consumer
outside the workshop: `nix flake update <its name for the haus input>`).
`bench try` overrides the consumer's `haus/nebelung` input at this checkout,
named off its `flake.lock`, because Nix silently ignores an override for an
unknown input.

## The agent surface (`ai/SKILL.md`)

For an agent *using* the palette with no checkout, to the workshop's
[`docs/agent-surface.md`](https://github.com/hausfold/workshop/blob/main/docs/agent-surface.md):
≤150 lines, a `description` naming the phrases a user says.

- `nix/skill.nix` renders `references/palette.md` from `palette/*.hex.json`
  and refuses a render missing `base` or a `palette/variants.json` variant.
  Never hand-write a hex into `ai/SKILL.md`.
- Its `haus.*` names are hand-written; nothing here notices a rename (the Trap
  points at haus's generated `references/options.md`). Prefer not to add more.
- `pkgs.nebelung-skill` is its own derivation, apart from `nebelung-themes`;
  haus's AI room installs it.

## Verify

`nix flake check` (`checks.<system>`) is `node --test` plus shellcheck of
`build.sh` — CI's `unit` job, and nothing else. The `build` job is where the
rest is: `nix build .#default .#nebelung-skill` renders every port and runs
`nix/skill.nix`'s frontmatter guards, and two steps after it diff the
committed `dist/` and `preview/*.html` against that result. Commit the
rendered output with the edit.

## Before you open a PR

Workshop rules apply (`bench overlap`, the Step 2.5 assurance subagent, the
What / Why / Verify / Watch-out body). Here the subagent hunts tool behaviour
behind a colour change, a palette name renamed without the templates that read
it, and a recolor that moves a tool's contrast unchecked.

## Conventions

- MIT, public. Consumers take tokens, never a hand-picked hex or 256-colour
  index: `nebelung.palette` or the rendered tree (`packages.<system>.default`).
- `trill` is Swift and takes no flake input: it reads
  `~/.config/trill/theme.json`, which haus writes from the palette, and its
  icon and banner PNGs bake four hexes a recolor never reaches — trill's
  AGENTS.md has the recipe.
