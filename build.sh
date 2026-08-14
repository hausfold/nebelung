#!/usr/bin/env bash
# Render every port template against the Nebelung palette.
#
#   ./build.sh            # regenerate palette, then render all ports + preview
#   ./build.sh --no-gen   # skip palette regeneration, just render
#
# Ports are declared in ports.conf (pipe-separated):
#   name | template path | output subdir under dist/
# Each port's whiskers template owns its output filename (via its `filename:`
# frontmatter); we render from inside dist/<subdir>/ so those paths land there.
#
# WHICH variants get rendered, from WHICH catppuccin flavor, into WHICH dist
# subdir is not decided here — it's read from palette/variants.json, generated
# from the VARIANTS table in scripts/generate-palette.mjs. The flavor is
# load-bearing, not cosmetic: templates branch on `flavor.dark` (ghostty's ANSI
# 0/7/8/15, kitty's tab colours, zen's prefers-color-scheme) and name their
# output after it, so a latte palette rendered with `-f mocha` would emit
# light colours wearing dark-mode structure under mocha's filenames.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

MANIFEST="$ROOT/palette/variants.json"

if [[ "${1:-}" != "--no-gen" ]]; then
  echo "→ generating palette"
  node scripts/generate-palette.mjs >/dev/null
fi
[[ -f "$MANIFEST" ]] || { echo "missing $MANIFEST (run without --no-gen)"; exit 1; }

# How many ports there are is a fact about ports.meta.json, not something the
# preview template should carry a copy of — it goes in as a render override.
PORT_COUNT="$(node -e '
  const { readFileSync } = require("node:fs");
  console.log(Object.keys(JSON.parse(readFileSync(process.argv[1], "utf8"))).length);
' "$ROOT/ports.meta.json")"

# Clean dist once so ports that emit into a shared tree (e.g. zen's two
# templates) don't wipe each other.
rm -rf dist

# Strip leading/trailing whitespace from $1. Deliberately NOT `xargs`: xargs
# also does shell-style quote parsing, so a ports.conf comment containing an
# apostrophe ("btop's sibling") died with "unterminated quote" and took the
# whole build down with it.
trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  printf '%s' "${s%"${s##*[![:space:]]}"}"
}

# render_ports <palette-file> <flavor> <dist-root>
render_ports() {
  local palette="$1" flavor="$2" root_out="$3" name template outdir produced static_dir
  count=0
  while IFS='|' read -r name template outdir; do
    name="$(trim "$name")"
    [[ -z "$name" || "$name" == \#* ]] && continue
    template="$ROOT/$(trim "$template")"
    outdir="$root_out/$(trim "$outdir")"

    if [[ ! -f "$template" ]]; then
      echo "✗ $name: template not found ($template) — skipping"; continue
    fi
    mkdir -p "$outdir"
    ( cd "$outdir" && whiskers "$template" -f "$flavor" --color-overrides "$palette" >/dev/null )
    # A port can ship colour-free companion files its rendered output needs —
    # OBS renders a .ovt that `extends` a base .obt carrying only structure.
    # Anything under templates/<port>/static/ is copied in verbatim, mirroring
    # the output layout.
    static_dir="$(dirname "$template")/static"
    if [[ -d "$static_dir" ]]; then
      cp -R "$static_dir/." "$outdir/"
    fi
    produced="$(find "$outdir" -type f | sed "s|^$outdir/||" | paste -sd' ' - | cut -c1-80)"
    echo "✓ $name → $outdir/ ($produced)"
    count=$((count + 1))
  done < ports.conf
}

# The default variant renders at the dist ROOT and every other one into
# dist/<dir>/ alongside it (dir comes from the manifest). Deliberately not
# dist/nebelung/ + dist/latte/: moving the default would break every consumer
# path for the sake of symmetry.
count=0
while IFS='|' read -r variant flavor dir; do
  [[ -n "$variant" ]] || continue
  palette="$ROOT/palette/$variant.json"
  [[ -f "$palette" ]] || { echo "missing $palette"; exit 1; }
  out="dist${dir:+/$dir}"
  echo "→ variant: $variant (catppuccin $flavor → $out/)"
  render_ports "$palette" "$flavor" "$out"
  # One preview per variant — light mode especially is a thing you check by eye,
  # and the default keeps its historical preview/nebelung.html path. The variant
  # name and its dist subdir go in as frontmatter overrides so the page can mark
  # its own pill in the switcher and print the dist/ path it actually rendered
  # to; preview/index.html is hand-written and never rendered here.
  whiskers templates/preview.html.tera -f "$flavor" --color-overrides "$palette" \
    --overrides "{\"variant\":\"$variant\",\"dir\":\"$dir\",\"ports\":$PORT_COUNT}" \
    > "preview/$variant.html"
  echo "✓ preview → preview/$variant.html"
  echo "rendered $count port(s) against the $variant palette"
done < <(node -e '
  const { readFileSync } = require("node:fs");
  const manifest = JSON.parse(readFileSync(process.argv[1], "utf8"));
  for (const [name, v] of Object.entries(manifest)) {
    console.log([name, v.flavor, v.dir].join("|"));
  }
' "$MANIFEST")

# VS Code / Cursor: native catppuccin.colorOverrides snippet (no whiskers).
# Both of these are default-palette-only — they patch upstream catppuccin
# artifacts that are themselves flavor-keyed, so a variant has nowhere to land.
node scripts/gen-vscode.mjs

# Stylus: userstyles import json modifier (no whiskers).
node scripts/gen-stylus.mjs
