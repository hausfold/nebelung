#!/usr/bin/env bash
# Capture one window for docs/gallery.md, at the size that page expects.
#
#   scripts/shoot.sh <title-regex> <out.png>
#   scripts/shoot.sh 'Ghostty' assets/gallery/terminal.png
#
# The window is parked alone on an empty AeroSpace workspace first, so nothing
# tiles beside it and the frame is the app rather than the desktop. It goes back
# to the workspace it came from on the way out, including on failure.
#
# macOS only, and it wants AeroSpace — this is the machine that runs the ports,
# not CI. Everything else (screencapture, sips) ships with the OS.
set -euo pipefail

readonly OUT_W=2400 OUT_H=1500 # 2x of the 1200x750 the gallery renders at
readonly SETTLE=${SHOOT_SETTLE:-4}

die() {
	echo "shoot: $*" >&2
	exit 1
}

[ $# -eq 2 ] || die "usage: shoot.sh <title-regex> <out.png>"
readonly match=$1 out=$2

command -v aerospace >/dev/null || die "needs aerospace on PATH"

# window-id | workspace | app | title — match against the whole line, so either
# the app name or the window title can be the thing you grep for.
line=$(aerospace list-windows --all \
	--format '%{window-id}|%{workspace}|%{app-name}|%{window-title}' |
	grep -iE -- "$match" | head -1) || true
[ -n "$line" ] || die "no window matching '$match' — try: aerospace list-windows --all"

id=${line%%|*}
rest=${line#*|}
home_ws=${rest%%|*}
echo "shoot: window $id ('${line##*|}') on workspace $home_ws"

stage=$(aerospace list-workspaces --monitor all --empty | head -1)
[ -n "$stage" ] || die "no empty workspace to stage the shot on"
back=$(aerospace list-workspaces --focused)

restore() {
	aerospace fullscreen off --window-id "$id" 2>/dev/null || true
	aerospace move-node-to-workspace --window-id "$id" "$home_ws" 2>/dev/null || true
	aerospace workspace "$back" 2>/dev/null || true
}
trap restore EXIT

tmp=$(mktemp -t shoot).png
aerospace move-node-to-workspace --window-id "$id" "$stage"
aerospace workspace "$stage"
sleep 2
aerospace focus --window-id "$id"
aerospace fullscreen on
sleep "$SETTLE"
screencapture -o -x -l"$id" "$tmp"

# Centre-crop to the gallery's 16:10, then fit. sips -c takes height first.
read -r w h < <(sips -g pixelWidth -g pixelHeight "$tmp" |
	awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w, h}')
if [ $((w * OUT_H)) -gt $((h * OUT_W)) ]; then
	sips -c "$h" $((h * OUT_W / OUT_H)) "$tmp" >/dev/null
else
	sips -c $((w * OUT_H / OUT_W)) "$w" "$tmp" >/dev/null
fi
sips -z "$OUT_H" "$OUT_W" "$tmp" --out "$out" >/dev/null
rm -f "$tmp"

echo "shoot: $out (${w}x${h} -> ${OUT_W}x${OUT_H})"
echo "shoot: pngquant --force --ext .png '$out' will roughly halve it, losslessly enough"
