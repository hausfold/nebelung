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
| VS Code / Cursor | `vscode/settings.json` | merge into your user `settings.json` (needs the Catppuccin extension) |
| Stylus | `stylus/nebelung-stylus.json` (+ README) | import via the Stylus browser extension ▸ Manage ▸ Import (see `stylus/README.md`) |

VS Code uses the extension's native `catppuccin.colorOverrides` setting — no
build, the palette is just injected via settings. Set `catppuccin.accentColor`
yourself if you want a non-default accent.

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
