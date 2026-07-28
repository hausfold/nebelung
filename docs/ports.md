# nebelung ports

Paths below are the default (Mocha) variant. A variant's files sit under its
`dist/` subdir and are named after **its** flavor — Ghostty's light-mode theme is
`dist/latte/ghostty/themes/catppuccin-latte.conf`, not `catppuccin-mocha.conf`.

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
| Helix | `helix/themes/default/catppuccin_mocha.toml` (+ `no_italics/`) | copy into `~/.config/helix/themes/`, set `theme = "catppuccin_mocha"` (or `inherits` it) |
| Xcode | `xcode/themes/Catppuccin Mocha.xccolortheme` | copy into `~/Library/Developer/Xcode/UserData/FontAndColorThemes/`, pick it under Settings ▸ Themes |
| gh-dash | `gh-dash/themes/mocha/catppuccin-mocha-<accent>.yml` | merge the `theme:` block into `~/.config/gh-dash/config.yml` |
| bottom | `bottom/themes/mocha.toml` | merge the `[styles.*]` tables into `~/.config/bottom/bottom.toml` |
| gitui | `gitui/themes/catppuccin-mocha.ron` | copy as `~/.config/gitui/theme.ron` |
| micro | `micro/themes/catppuccin-mocha.micro` (+ `-transparent`) | copy into `~/.config/micro/colorschemes/`, set `"colorscheme": "catppuccin-mocha"` |
| Rio | `rio/themes/catppuccin-mocha.toml` | copy into `~/.config/rio/themes/`, set `theme = "catppuccin-mocha"` |
| Warp | `warp/themes/catppuccin_mocha.yml` | copy into `~/.warp/themes/`, pick it under Settings ▸ Appearance |
| fish | `fish/themes/catppuccin-mocha.theme` (+ `static/`) | copy into `~/.config/fish/themes/`, then `fish_config theme choose catppuccin-mocha` (the theme name is the filename) — the light variants ship `static/` only (upstream's dynamic theme is dark-flavor-only) |
| mpv | `mpv/themes/mocha/<accent>.conf` | `include=` the accent you want from `~/.config/mpv/mpv.conf` (colors the OSD/OSC) |
| Raycast | `raycast/README.md` | click the theme deeplink in it (needs Raycast Pro) |
| Dark Reader | `dark-reader/README.md` | paste the three hexes into Dark Reader ▸ Colors (set Selection to `Custom`) |
| Zed | `zed/themes/catppuccin-<accent>.json` (+ `catppuccin-no-italics-<accent>.json`) | copy into `~/.config/zed/themes/`, pick it under Settings ▸ Theme |
| Emacs | `emacs/catppuccin-definitions.el` | drop it beside `catppuccin-theme.el` (it replaces the upstream definitions), then `(setq catppuccin-flavor 'mocha)` |
| Sublime Text | `sublime-text/themes/Catppuccin Mocha.sublime-color-scheme` | copy into `Packages/User/`, set `"color_scheme"` in your preferences |
| JetBrains | `jetbrains/themes/mocha.xml` + `mocha.theme.json` (+ `-no-italics` / `-islands`) | import the `.xml` under Settings ▸ Editor ▸ Color Scheme ▸ Import Scheme; the `.theme.json` is the UI half and needs the plugin layout to load |
| Kakoune | `kakoune/colors/catppuccin_mocha.kak` | copy into `~/.config/kak/colors/`, then `colorscheme catppuccin_mocha` |
| k9s | `k9s/themes/catppuccin-mocha.yaml` (+ `-transparent`) | copy into `~/.config/k9s/skins/`, set `ui.skin` |
| skim | `skim/README.md` | copy the `SKIM_DEFAULT_OPTIONS` snippet into your shell rc |
| foot | `foot/themes/catppuccin-mocha.ini` | `include=` it from `~/.config/foot/foot.ini` |
| Konsole | `konsole/themes/catppuccin-mocha.colorscheme` | copy into `~/.local/share/konsole/`, pick it in the profile |
| Tabby | `tabby/themes/catppuccin-mocha.yaml` | Settings ▸ Color scheme ▸ add it as a custom scheme |
| Xresources | `xresources/themes/mocha.Xresources` | `#include` from `~/.Xresources`, then `xrdb -merge ~/.Xresources` |
| zathura | `zathura/themes/catppuccin-mocha` | `include` it from `~/.config/zathura/zathurarc` |
| OBS | `obs/themes/Catppuccin_Mocha.ovt` **and** `obs/themes/Catppuccin.obt` | copy **both** into OBS's theme dir (`~/Library/Application Support/obs-studio/themes/`), pick it under Appearance — the `.ovt` extends the `.obt` |
| spotify-player | `spotify-player/theme.toml` | copy into `~/.config/spotify-player/`, set `theme = "Catppuccin-mocha"` |
| chroma | `chroma/themes/mocha-chroma-style.css` (+ `.xml`) | serve the CSS from your Hugo/chroma site, or feed the XML to `chroma --style` |
| zsh-fsh | `zsh-fsh/themes/catppuccin-mocha.ini` | copy into `~/.config/fsh/`, then `fast-theme XDG:catppuccin-mocha` |
| sc-im | `sc-im/themes/mocha` | copy as `~/.config/sc-im/scimrc` colours, or `load` it from your `scimrc` |
| tty | `tty/themes/mocha.txt` | the Linux console's 16 colours — `cat` it into `setvtrgb` (`setvtrgb < mocha.txt`) |
| Telegram | `telegram/themes/mocha/{android,desktop,ios,macos}` | per-client palette source: rename `android` to `Nebelung.attheme` and open it in Telegram Android; the other three are inputs to that client's packaging (see [catppuccin/telegram](https://github.com/catppuccin/telegram)) |
| qBittorrent | `qbittorrent/themes/catppuccin-mocha/` (+ `themes/icons/`) | compile it: `cd qbittorrent/themes/catppuccin-mocha && rcc -binary resources.qrc -o nebelung.qbtheme`, then point Options ▸ Behavior ▸ "Use custom UI theme" at the `.qbtheme` |
| VS Code / Cursor | `vscode/settings.json` | merge into your user `settings.json` (needs the Catppuccin extension) |
| Stylus | `stylus/nebelung-stylus.json` (+ README) | import via the Stylus browser extension ▸ Manage ▸ Import (see `stylus/README.md`) |

VS Code uses the extension's native `catppuccin.colorOverrides` setting — no
build, the palette is just injected via settings. Set `catppuccin.accentColor`
yourself if you want a non-default accent.

Slack, Raycast, Dark Reader and skim are **paste-a-string** ports: the template
renders a README carrying the payload rather than a config file.

## One flavor per render

`--color-overrides` rewrites exactly one Catppuccin flavor — the one the render
targets. Any template that emits *several* flavors into one file therefore ships
stock Catppuccin alongside the Nebelung part. Every such template here is patched
to emit only the rendered flavor; search **`NEBELUNG PATCH`** in `templates/` to
find them. Today that means:

- **README ports** (Slack, Raycast, Dark Reader, skim) — one flavor block, not four.
- **multi-flavor config files** (delta's gitconfig, Zed's theme family, Emacs's
  palette alist, spotify-player's `theme.toml`) — one section, not four. For Zed
  this also cuts the port from 3.3 MB to 0.8 MB per variant.
- **light+dark-in-one-file themes** (fish, foot) — upstream's "dynamic" mode
  carries a `[light]` / `[colors-light]` half built from Latte, which a Mocha
  render can't reach. Only the static theme is rendered, and it lands directly in
  `themes/` (no `static/` subdir, since there is nothing to disambiguate from).

A few templates also had upstream's own build layout stripped from their output
path (`dist/`, `build/`, `src/main/resources/`) so everything lands under
`dist/<port>/` here. Same marker.

The one deliberate exception is **Stylus**: its import JSON is a userstyles
bundle where picking a flavor per site is the feature, so it keeps all four.

Re-vendoring any of those templates from upstream drops the patch — re-apply it.

Ports can also ship colour-free companion files: anything under
`templates/<port>/static/` is copied into the port's output verbatim (OBS's base
`.obt`, which the rendered `.ovt` extends). Assets that *do* carry colour get a
template instead — `templates/qbittorrent/icons.tera` has no upstream
counterpart, because upstream ships those SVGs static with the flavor's `text`
and `overlay1` baked into the `fill`. The path data is upstream's; only the fill
is templated.

## Missing a port?

Catppuccin has ~350 ports; Nebelung carries the ones its author uses plus the
widely-used rest. Not carried today, mostly for want of a user: aerc, Cider,
Contour, Element, Halloy, HexChat, imv, Mailspring, process-compose. Anything
Catppuccin themes with a
[whiskers](https://whiskers.catppuccin.com) template can be added in about three
lines — **[open an issue](https://github.com/nebelhaus/nebelung/issues/new) or a
PR** with the port name and it goes in. Ports without a whiskers template (nvim,
Discord, …) need a hand-written template first; say so in the issue and it can
still happen.

## Rendering

```bash
./build.sh             # regenerate palette + render all ports → dist/
./build.sh --no-gen    # render only (palette unchanged)
```

Requirements:

- [`whiskers`](https://whiskers.catppuccin.com) — `brew install catppuccin/tap/whiskers`
- Node (for the palette generator)

The port manifest is [`ports.conf`](../ports.conf): `name | template | output |
extra args`. Vendored upstream `.tera` templates live in
[`templates/`](../templates).

CI keeps the committed `dist/` honest by rebuilding and diffing on every push.
