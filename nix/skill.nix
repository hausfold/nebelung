# nebelung's agent skill, as a derivation.
#
# WHY HALF OF IT IS GENERATED
# ---------------------------
# Same split haus's skill uses, for the same reason. The hand-written half
# (`ai/SKILL.md`) is what doesn't drift: which role means what, pick by role
# rather than by eye, support both schemes when you can't tell. The half that
# WOULD drift — every name and every hex, in four variants — is rendered here
# from `palette/*.hex.json`, the same files the flake's `palette` output reads.
#
# That matters more here than anywhere else in the family: a skill that names a
# colour is only useful if the colour is *right*, and a hand-copied hex is wrong
# the first time the palette is regenerated. An agent quoting a stale `base` at
# the user is worse than an agent with no palette at all, because it looks
# deliberate.
#
# `$out/<tool>/SKILL.md` plus `references/` beside it is the family standard's
# The layout the family standard fixes (the workshop's docs/agent-surface.md): one nesting level, named
# for the skill, so a consumer links a directory already called the right thing.
# haus's own skill is flat, `$out/SKILL.md` — it predates the standard and is
# the one exception rather than the pattern. Skill names are globally unique
# across the family: they all land in one shared `~/.claude/skills/`.
{
  lib,
  runCommand,
  jq,
}:

let
  variants = builtins.fromJSON (builtins.readFile ../palette/variants.json);
  names = builtins.attrNames variants;
in
runCommand "nebelung-skill"
  {
    nativeBuildInputs = [ jq ];
    meta = {
      description = "Agent skill giving a coding agent this machine's exact palette";
      license = lib.licenses.mit;
      platforms = lib.platforms.all;
    };
  }
  ''
    mkdir -p "$out/nebelung/references"
    cp ${../ai/SKILL.md} "$out/nebelung/SKILL.md"

    ref="$out/nebelung/references/palette.md"
    {
      echo "# The Nebelung palette"
      echo
      echo "Generated from \`palette/*.hex.json\` at build time — these are the"
      echo "exact values this machine's theme is rendered with. Take colours from"
      echo "here rather than inventing them, and take them **by role**: \`base\`"
      echo "for a background is right in all four variants at once, where a"
      echo "literal hex is right in exactly one."
      echo
    } > "$ref"

    ${lib.concatMapStringsSep "\n" (name: ''
      {
        echo "## \`${name}\`"
        echo
        echo "${
          let
            v = variants.${name};
          in
          "catppuccin ${v.flavor}, ${v.contrast} contrast"
        }"
        echo
        echo "| role | hex |"
        echo "|---|---|"
        jq -r 'to_entries[] | "| `\(.key)` | `#\(.value)` |"' \
          ${../palette + "/${name}.hex.json"}
        echo
      } >> "$ref"
    '') names}

    skill="$out/nebelung/SKILL.md"

    # The frontmatter, and ONLY the frontmatter. Every client routes on `name`
    # and `description`, so a header that is missing, never closed, or whose
    # keys only appear down in the body produces a skill that installs, lists,
    # and never loads — indistinguishable, from the user's side, from the agent
    # not knowing nebelung exists.
    head -1 "$skill" | grep -qx -- '---' \
      || { echo "ai/SKILL.md does not open with YAML frontmatter" >&2; exit 1; }
    front="$(tail -n +2 "$skill" | sed -n '1,/^---$/p')"
    printf '%s\n' "$front" | grep -qx -- '---' \
      || { echo "ai/SKILL.md's frontmatter block is never closed" >&2; exit 1; }

    printf '%s\n' "$front" | grep -q '^name: nebelung$' \
      || { echo "ai/SKILL.md's frontmatter has no 'name: nebelung' line" >&2; exit 1; }
    # One PHYSICAL line, by design: these guards are grep, and a description
    # written as a YAML folded scalar (`>-` plus an indented body) is valid YAML
    # that would silently stop being checked. The standard says one line.
    printf '%s\n' "$front" | grep -qE '^description: .{80,}' \
      || { echo "ai/SKILL.md's description is missing, too short to route on, or wrapped onto a second line" >&2; exit 1; }

    # A routing document that grew into a manual stops being read as one.
    lines=$(wc -l < "$skill")
    [ "$lines" -le 150 ] \
      || { echo "ai/SKILL.md is $lines lines; the standard caps a routing document at 150" >&2; exit 1; }

    # And the generated half. A palette reference that rendered empty would
    # teach the agent this machine has no colours — which it would then act on,
    # inventing them, which is the exact thing this whole file exists to stop.
    grep -q '^| `base` | `#' "$ref" \
      || { echo "references/palette.md rendered no base colour — the render is broken" >&2; exit 1; }
    for v in ${lib.concatStringsSep " " names}; do
      grep -q "^## \`$v\`$" "$ref" \
        || { echo "references/palette.md is missing the $v variant" >&2; exit 1; }
    done
  ''
