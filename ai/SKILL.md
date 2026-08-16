---
name: nebelung
description: The colour palette this Mac is themed with — the exact hex for the background, the text, the accent, and every named role, in dark and light. Use whenever you are about to pick a colour for something the user will look at on this machine: an HTML page, a chart, a diagram, a terminal script's output, a status line, a generated image. Also when they say "what's my background colour", "use my theme colours", "match my terminal", "what accent am I using", or mention nebelung, catppuccin, mocha or latte.
---

# Nebelung — the palette

Nebelung is a silver-mist Catppuccin variant: Mocha with the blue stripped out
of the greys. It is the single source of truth for colour across everything on
this machine — the terminal, the bar, the palette window, the file shelf, the
editor.

**The point of this skill is that you stop inventing colours.** When you build
something the user will look at, take the hex from
`references/palette.md` in this skill directory. It carries all four variants,
every named role, verbatim from the source.

## The four variants

| name | when it's showing |
|---|---|
| `nebelung` | the default — dark |
| `nebelung-latte` | light |
| `nebelung-high-contrast` | dark, high contrast |
| `nebelung-latte-high-contrast` | light, high contrast |

On a machine running haus, which one is live follows `haus.theme.*`. If you
can't tell, **support both** — emit CSS custom properties with a
`prefers-color-scheme: dark` block rather than picking one.

## The roles, and how to use them

Twelve greys, ordered darkest-surface to lightest-text, then fourteen accents.

| role | use it for |
|---|---|
| `crust`, `mantle`, `base` | page/window background — `base` is the main one |
| `surface0`, `surface1`, `surface2` | cards, panels, borders, hover states |
| `overlay0`, `overlay1`, `overlay2` | muted text, disabled, gridlines |
| `subtext0`, `subtext1`, `text` | body text — `text` is the primary |
| `rosewater` `flamingo` `pink` `mauve` `red` `maroon` `peach` `yellow` `green` `teal` `sky` `sapphire` `blue` `lavender` | accents, series colours, semantic states |

**Pick by role, never by eye.** `base` for a background and `text` for
foreground is correct in every variant at once; a literal `#202020` is correct
in exactly one and wrong in the other three.

Conventional semantics: `red` error · `peach` warning · `green` success ·
`sapphire` or `lavender` info/links. The user's own accent is a haus setting
(`haus.theme.accent`), so ask or read it rather than assuming `mauve`.

## When to reach for this

- building an HTML page, chart, diagram or dashboard the user will view here
- writing a script that emits colour to the terminal
- generating an image, wallpaper or slide that has to sit next to their setup
- "what's my background colour?" / "what accent am I on?"

## When NOT to

- **The colour is going somewhere else.** A client's site, a public README, an
  app with its own brand — those have their own palette, and this one is a
  personal theme.
- **Accessibility is the actual requirement.** Nebelung's normal variants are
  not guaranteed WCAG AA for every pairing; the high-contrast variants exist for
  that. Check the contrast ratio rather than assuming.
- **You want to change how a tool is themed.** That's a template in the nebelung
  repo (agents work there from a checkout) or a `haus.theme.*` setting — not
  something to hand-edit into a dotfile, which the next rebuild reverts.
- **You want to change which theme is active.** `haus.theme.*`, then `haus
  rebuild`.

## Traps

- **There is no `nebelung` command.** The palette is data — this skill's
  `references/palette.md`, and the repo's `palette/*.hex.json`. Don't tell the
  user to run something that doesn't exist.
- **The JSON stores hex without `#`.** `"base": "202020"`. Every consumer adds
  the hash itself; `references/palette.md` has already added it.
- **Blue is deliberately desaturated.** Nebelung is Mocha *with the blue
  stripped* — if a colour looks flatter than the Catppuccin you remember, that
  is the theme, not a bug.
- **Don't hand-edit a rendered theme file** in `~/.config`. On a haus machine
  they are generated, and the next rebuild overwrites them.
