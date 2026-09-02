# Stylus (Nebelung Port, high contrast)

This port modifies the official [Catppuccin Userstyles](https://github.com/catppuccin/userstyles) to use the Nebelung palette.

Because Catppuccin styles are written in LESS and compiled dynamically in the browser, they cannot be natively injected into `userContent.css`.

## Installation

1. Install the [Stylus extension](https://add0n.com/stylus.html) in your browser (Zen/Firefox).
2. Open the Stylus dashboard/settings.
3. On the left sidebar under "Manage", click **Import**.
4. Select the `nebelung-stylus.json` file located in this directory.
5. Stylus will import all Nebelung-flavored styles and automatically apply them!

*(Auto-updates for these styles have been disabled to prevent them from reverting to the default Catppuccin Mocha colors).*

## What this bundle is, and isn't

It carries **both** flavors — the mocha slot and the latte slot are both
Nebelung, at high contrast — so light and
dark both look right. Which one a style uses is that style's own
`lightFlavor` / `darkFlavor` var, and the **accent** is likewise a per-style
`accentColor` var defaulting to `mauve`. Those live in Stylus's own storage,
not in this file: set them in the Stylus UI, or have your desktop stamp them into
the bundle before importing.
