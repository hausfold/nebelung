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
# We force `-f mocha` so only the Nebelung (overridden) flavor is produced.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PALETTE="$ROOT/palette/nebelung.json"
FLAVOR="mocha"

if [[ "${1:-}" != "--no-gen" ]]; then
  echo "→ generating palette"
  node scripts/generate-palette.mjs >/dev/null
fi
[[ -f "$PALETTE" ]] || { echo "missing $PALETTE"; exit 1; }

# Clean dist once so ports that emit into a shared tree (e.g. zen's two
# templates) don't wipe each other.
rm -rf dist

# render_ports <palette-file> <dist-root>
render_ports() {
  local palette="$1" root_out="$2" name template outdir produced
  count=0
  while IFS='|' read -r name template outdir; do
    name="$(echo "$name" | xargs)"
    [[ -z "$name" || "$name" == \#* ]] && continue
    template="$ROOT/$(echo "$template" | xargs)"
    outdir="$root_out/$(echo "$outdir" | xargs)"

    if [[ ! -f "$template" ]]; then
      echo "✗ $name: template not found ($template) — skipping"; continue
    fi
    mkdir -p "$outdir"
    ( cd "$outdir" && whiskers "$template" -f "$FLAVOR" --color-overrides "$palette" >/dev/null )
    produced="$(find "$outdir" -type f | sed "s|^$outdir/||" | paste -sd' ' - | cut -c1-80)"
    echo "✓ $name → $outdir/ ($produced)"
    count=$((count + 1))
  done < ports.conf
}

count=0
render_ports "$PALETTE" "dist"

# VS Code / Cursor: native catppuccin.colorOverrides snippet (no whiskers).
node scripts/gen-vscode.mjs

# Stylus: userstyles import json modifier (no whiskers).
node scripts/gen-stylus.mjs

# Visual preview (plain stdout template, rendered separately).
whiskers templates/preview.html.tera -f "$FLAVOR" --color-overrides "$PALETTE" > preview/nebelung.html
echo "✓ preview → preview/nebelung.html"

echo "rendered $count port(s) against the nebelung palette"

# Extra palette variants render ALONGSIDE the default, into dist/<variant>/.
# Deliberately not dist/nebelung/ + dist/high-contrast/: moving the default
# would break every consumer path for the sake of symmetry.
for extra in "$ROOT"/palette/nebelung-*.json; do
  [[ -e "$extra" ]] || continue
  case "$extra" in *.hex.json) continue ;; esac
  variant="$(basename "$extra" .json)"      # nebelung-high-contrast
  short="${variant#nebelung-}"              # high-contrast
  echo "→ variant: $short"
  render_ports "$extra" "dist/$short"
  echo "rendered $count port(s) against the $short palette"
done
