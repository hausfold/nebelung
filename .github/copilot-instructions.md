# Copilot instructions

**Read [`AGENTS.md`](../AGENTS.md) at the repo root first — it is the full,
authoritative instruction set for every agent working here, and this file is
only a pointer to it.** (Copilot doesn't follow file imports, hence the
duplication below; if the two ever disagree, `AGENTS.md` wins.)

The short version:

- Nebelung is a silver-mist Catppuccin variant built with
  [whiskers](https://github.com/catppuccin/whiskers), and the **single source of
  truth for colors** across the [hausfold](https://github.com/hausfold) family.
- **This repo owns the colors and nothing else.** A change about a tool's
  *behavior or config* — which tools exist, how the shell/bar/WM are set up —
  belongs in the rice (`nebelhaus`), even if it would work here. Palette and
  theme-template changes only.
- **Vendored templates are verbatim except where marked `NEBELUNG PATCH`.**
  Re-vendoring from upstream silently drops those patches — grep the marker
  first. Details in [`docs/ports.md`](../docs/ports.md).
- **`ports.meta.json` is fenced by tests**, and *two* files are generated from
  it: the per-category tables in `docs/ports.md` and the port board in
  `README.md`. Both sit between `ports:begin`/`ports:end` markers — never
  hand-edit inside those. Run `node scripts/gen-ports-doc.mjs` after editing, or
  `node --test` fails.
- **Per-variant `contrastBoost` values differ on purpose** (Latte has ~0.04 of
  OKLCH headroom above `base` where Mocha has ~0.2 below its). Don't "tidy" them
  into agreement — the tests assert all twelve ramp steps stay distinct.
- Never hardcode a hex value in a consumer repo; inject `nebelung.palette` or
  reference the rendered theme tree.

For review comments, the same bar applies as anywhere in the family:
correctness and boundaries (does this change belong in *this* repo?) over style.
