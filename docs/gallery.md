# nebelung in use

Five shots — the ports you can't judge from a hex list. Everything colour-level
(the ramp, the accents, every variant side by side) is in the
[preview](https://hausfold.github.io/nebelung/preview/), which is generated and
always current; this page is the part that needs a real window open.

Shots are the default `nebelung` variant (Mocha) unless a caption says otherwise.

> **Two of the five are still placeholders.** Slack and Obsidian show a *shot
> pending* tile — both need their content picked by hand, because the real windows
> are full of private messages and notes. The other three are real.

## the browser

<img src="../assets/gallery/zen-github.png" alt="The nebelung repo on GitHub, recoloured to Nebelung, in Zen" width="100%">

This repo's own page on GitHub, recoloured by [Stylus](ports.md#p-stylus). No
browser chrome in frame, and that's not a crop — this profile runs
[Zen](ports.md#p-zen)'s compact mode, which hides the tab strip and URL bar
entirely, so what Zen's `userChrome.css` paints only appears on hover. The port is
installed; the shot just can't show it standing still.

<img src="../assets/gallery/zen-youtube.png" alt="YouTube recoloured to Nebelung, in a logged-out Zen window" width="100%">

Same userstyle on a page that fights back. Shot in a **private window on purpose**,
so the sidebar carries YouTube's own nav rather than somebody's subscription list —
which is also why the Sign in button is still YouTube blue. The mauve `Latest` pill
is Nebelung's accent surviving contact with it.

## the terminal

<img src="../assets/gallery/terminal.png" alt="Ghostty running Zellij, Starship and lazygit in Nebelung" width="100%">

Four ports in one frame: [Ghostty](ports.md#p-ghostty) draws the sixteen colours,
[Zellij](ports.md#p-zellij) the tab bar and the status ribbon along the bottom,
[Starship](ports.md#p-starship) the prompt, [lazygit](ports.md#p-lazygit) the commit
patch. [lsd](ports.md#p-lsd) and [bat](ports.md#p-bat) fill the right pane — and
what bat is rendering is `palette/nebelung.hex.json`, the file every other colour on
the screen came out of.

## the apps

<img src="../assets/gallery/slack.png" alt="placeholder tile — Slack, shot pending" width="100%">

[Slack](ports.md#p-slack) — a paste-a-string port: ten hexes into
Preferences ▸ Themes. That string only reaches the sidebar and the top bar, so this
is the whole of what the port can do.

<img src="../assets/gallery/obsidian.png" alt="placeholder tile — Obsidian, shot pending" width="100%">

[Obsidian](ports.md#p-obsidian) — a full theme folder, so unlike Slack it reaches
the editor, headings and code blocks. Dark mode; the theme renders for light too,
but Obsidian's own light defaults leak through more.

## what isn't here

Deliberately, not by omission:

- **the other terminals, and every TUI** — Kitty, Alacritty, btop, yazi, delta and
  friends. They're all the same sixteen colours in a different frame, and a wall of
  near-identical screenshots teaches less than the
  [preview](https://hausfold.github.io/nebelung/preview/) does. These are the ones
  worth auto-generating later ([VHS](https://github.com/charmbracelet/vhs) tapes in
  CI, keyed on the palette + template hash) — a job for its own PR.
- **the licence- and login-gated apps** — Xcode, JetBrains, Raycast, Warp. Each
  needs a logged-in machine to shoot and a re-shoot every time that app's own UI
  moves, which is churn this repo doesn't need to carry.

## how these were taken

Not by hand, and not by a screenshot farm — by
[`scripts/shoot.sh`](../scripts/shoot.sh):

```bash
scripts/shoot.sh 'Ghostty' assets/gallery/terminal.png
```

It finds the window by title, parks it alone on an empty
[AeroSpace](https://github.com/nikitabobko/AeroSpace) workspace so nothing tiles
beside it, captures it by window id (`screencapture -o -x -l<id>`, which grabs the
window rather than the screen), centre-crops to 16:10, fits to 2400×1500, and puts
the window back where it came from — including if it fails partway. macOS only, and
it wants AeroSpace; everything else ships with the OS.

What the script can't do is compose the frame. The terminal shot is a throwaway
Zellij session built from a layout file rather than a live one, so it never carries
session content that shouldn't be public, and the YouTube frame is a private window
for the same reason. Pick the frame, then run the script.

That makes a re-shoot a re-run — which is what makes the auto-generated terminal
tier above worth building rather than just wishing for.

## missing a shot?

If you add a port with a UI worth seeing, this page needs a frame for it — see the
*Add a themed tool* note in [AGENTS.md](../AGENTS.md). Shots go in
`assets/gallery/` at 2400×1500 (2× of 1200×750), named after the port.
