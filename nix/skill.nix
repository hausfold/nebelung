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
# Shape is fixed by the family standard (the workshop's notes/agent-surface.md):
# `$out/<name>/SKILL.md`, plus `references/` beside it. Skill names are globally
# unique across the family — they all land in one shared `~/.claude/skills/`.
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

    # Guards. A skill with no frontmatter is invisible — every client routes on
    # `name` and `description` — and a palette reference that rendered empty
    # would teach the agent this machine has no colours, which is worse than
    # having no skill at all. Fail the build rather than ship either.
    head -1 "$out/nebelung/SKILL.md" | grep -qx -- '---' \
      || { echo "ai/SKILL.md does not open with YAML frontmatter" >&2; exit 1; }
    grep -q '^name: nebelung$' "$out/nebelung/SKILL.md" \
      || { echo "ai/SKILL.md has no 'name: nebelung' line" >&2; exit 1; }
    grep -q '^description: .\{80,\}' "$out/nebelung/SKILL.md" \
      || { echo "ai/SKILL.md's description is missing or too short to route on" >&2; exit 1; }
    grep -q '^| `base` | `#' "$ref" \
      || { echo "references/palette.md rendered no base colour — the render is broken" >&2; exit 1; }
  ''
