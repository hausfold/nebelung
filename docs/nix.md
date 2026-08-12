# nebelung on Nix

You don't need to install any port by hand if you consume this repo as a flake —
that's how the [nebelhaus](https://github.com/hausfold/haus) rice themes
everything.

```nix
inputs.nebelung.url = "github:hausfold/nebelung";
```

## Outputs

- **`packages.<system>.default`** — the whole `dist/` tree, built reproducibly
  (no committed artifacts involved). Source files from
  `${nebelung.packages.<system>.default}/<port>/…`, or
  `…/<variants.<name>.dir>/<port>/…` for a variant.

- **`palette`** — the raw `name → "#hex"` attrset for the default variant, for
  configs Nix generates itself (a starship palette table, pounce's baked-in
  colors).

- **`palettes`** — the same shape for every variant, keyed by variant name. What
  a consumer following a light-mode or contrast setting reads.

- **`variants`** — `name → { flavor, dir }`. `flavor` is the catppuccin flavor
  the variant rendered as, which is what a consumer needs to build the
  flavor-named paths whiskers emits (`catppuccin-latte.conf` vs
  `catppuccin-mocha.conf`); `dir` is its subdirectory, `""` for the default.

- **`checks.<system>`** — `nix flake check` runs the palette unit tests +
  `build.sh` shellcheck (the same as CI's `unit` job), so `nix flake check` == CI
  without pushing.

## Inside the rice

Picking an accent and applying it is a single option — see
[Theming & accents](https://nebelhaus.com/guides/theming/) on nebelhaus.com.

Hacking on the palette inside the wider rice? `bench try` in the
[workshop](https://github.com/hausfold/workshop) rebuilds your machine against
this local checkout — no push/re-lock loop.
