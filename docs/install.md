# installing nebelung

Every port is the same two moves: **drop a rendered file, name it in a config.**
Which file and which setting, per port, is the [ports table](ports.md) — this
page is the shape all of them share.

## by hand

Ghostty, start to finish:

```bash
git clone --depth 1 https://github.com/hausfold/nebelung
mkdir -p ~/.config/ghostty/themes
cp nebelung/dist/ghostty/themes/catppuccin-mocha.conf ~/.config/ghostty/themes/
echo 'theme = catppuccin-mocha' >> ~/.config/ghostty/config
```

Reload Ghostty (`cmd+shift+,`) and you're in Nebelung.

The file keeps its upstream **Catppuccin** name on purpose: Nebelung renders into
the flavor slot each template already has, so `catppuccin-mocha` *is* the Nebelung
theme. Nothing else about the port changes.

## picking a variant

The default variant owns the `dist/` root; every other one nests in a subdir and
is named after the catppuccin flavor it rendered as — light mode is
`catppuccin-latte`:

```bash
cp nebelung/dist/latte-high-contrast/ghostty/themes/catppuccin-latte.conf \
   ~/.config/ghostty/themes/
echo 'theme = catppuccin-latte' >> ~/.config/ghostty/config
```

| variant | source | `dist/` subdir | text on base |
| --- | --- | --- | --- |
| `nebelung` | Mocha | *(the root)* | 11.3:1 |
| `nebelung-high-contrast` | Mocha | `high-contrast/` | 19.9:1 |
| `nebelung-latte` | Latte | `latte/` | 7.0:1 |
| `nebelung-latte-high-contrast` | Latte | `latte-high-contrast/` | 9.9:1 |

The default keeps the tree root so every path that existed before variants did
still resolves.

## as a flake

Consuming the flake skips the copying — that's how the rice themes everything:

```nix
inputs.nebelung.url = "github:hausfold/nebelung";
```

```nix
# in a home-manager module — the rendered file, straight out of the store
xdg.configFile."ghostty/themes/catppuccin-mocha.conf".source =
  "${nebelung.packages.${pkgs.system}.default}/ghostty/themes/catppuccin-mocha.conf";

# or the raw colors, for configs Nix generates itself
programs.starship.settings.palettes.nebelung = nebelung.palette;

# variants are data, not paths to guess — this one is
# { dir = "latte-high-contrast"; flavor = "latte"; }
lightTheme = with nebelung.variants."nebelung-latte-high-contrast";
  "${nebelung.packages.${pkgs.system}.default}/${dir}/ghostty/themes/catppuccin-${flavor}.conf";
```

Every output — `palette`, `palettes`, `variants`, `ports`, `checks` — is in
[Nix outputs](nix.md).

## on the web

The `css` port is the odd one out: there's no app to point at a file, you just
import it. Two shapes per variant, take one — plain custom properties, or a
Tailwind v4 `@theme` (v4 has no JS config; a theme *is* CSS).

```css
/* any stylesheet → var(--nebelung-mauve), var(--nebelung-accent), … */
@import url("nebelung-mocha.css");

/* …or Tailwind v4 → bg-nebelung-base, text-nebelung-mauve, … */
@import "tailwindcss";
@import "./nebelung-mocha.tailwind.css";
```

Light + dark from one sheet: import each flavor behind its own media query, so
only one of them ever defines `:root`. They render into sibling dirs —
`dist/css/` and `dist/latte/css/` — so copy both out and the paths are yours.

```css
@import url("nebelung-mocha.css") (prefers-color-scheme: dark);
@import url("nebelung-latte.css") (prefers-color-scheme: light);
```

## build it yourself

```bash
./build.sh             # regenerate palette + render all ports → dist/
./build.sh --no-gen    # render only (palette unchanged)
```

Needs [`whiskers`](https://whiskers.catppuccin.com)
(`brew install catppuccin/tap/whiskers`) and Node for the palette generator.
Recoloring: edit `palette/`, run `nix build`, and every port follows in one pass
— [the palette internals](palette.md) has the knobs.
