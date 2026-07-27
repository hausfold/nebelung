{
  description = "Nebelung — Catppuccin Mocha with the blue stripped (theme builder)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    # whiskers (the Catppuccin templating CLI) is not in nixpkgs; it ships from
    # the catppuccin flake. This is the same input the consuming nix config
    # already has, so `follows` there keeps a single whiskers in the closure.
    catppuccin.url = "github:catppuccin/nix";
    # NOTE: the catppuccin userstyles export (import.json) is VENDORED at
    # vendor/catppuccin-userstyles-export.json instead of fetched. Upstream's
    # "all-userstyles-export" release asset is a ROLLING URL whose narHash drifts
    # whenever catppuccin republishes it — which silently broke every consumer's
    # CI (local builds pass from cache; fresh CI fetches don't). Vendoring pins it
    # for real. Re-vendor by hand (re-download that URL) to pick up a newer export.
  };

  outputs =
    { self, nixpkgs, catppuccin }:
    let
      systems = [ "aarch64-darwin" "x86_64-darwin" "aarch64-linux" "x86_64-linux" ];
      forSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      # The Nebelung palette as a plain name -> "#hex" attrset, read from the
      # committed hex map. Nix-native consumers that can't take a rendered file
      # (e.g. a starship `[palettes.*]` table) inject this directly — no
      # duplication, the JSON stays the single source of truth.
      palette = builtins.mapAttrs (_: v: "#${v}") (
        builtins.fromJSON (builtins.readFile ./palette/nebelung.hex.json)
      );

      # Every variant, by name, in the same name -> "#hex" shape. `palette`
      # above stays the default one so existing consumers are untouched; a
      # consumer that wants to follow a contrast setting reads from here.
      # Rendered port files live under the matching subdir of the themes
      # package (dist/ for the default, dist/high-contrast/ for the variant).
      palettes = {
        nebelung = builtins.mapAttrs (_: v: "#${v}") (
          builtins.fromJSON (builtins.readFile ./palette/nebelung.hex.json)
        );
        nebelung-high-contrast = builtins.mapAttrs (_: v: "#${v}") (
          builtins.fromJSON (builtins.readFile ./palette/nebelung-high-contrast.hex.json)
        );
      };

      # `nix flake check` runs these — the same palette unit tests + shellcheck
      # that CI's `unit` job runs, so local check == CI without pushing.
      checks = forSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          palette-tests = pkgs.runCommand "nebelung-palette-tests" {
            nativeBuildInputs = [ pkgs.nodejs ];
          } ''
            cd ${self}
            node --test
            touch $out
          '';
          shellcheck = pkgs.runCommand "nebelung-shellcheck" {
            nativeBuildInputs = [ pkgs.shellcheck ];
          } ''
            shellcheck ${./build.sh}
            touch $out
          '';
        }
      );

      packages = forSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          whiskers = catppuccin.packages.${system}.whiskers;

          nebelung-themes = pkgs.stdenv.mkDerivation {
            pname = "nebelung-themes";
            version = "1.0.0";
            src = ./.;

            # node -> regenerate the palette + emit the vscode snippet;
            # whiskers -> render every port template. Both must be on PATH;
            # find/sed/cut/paste/xargs come from stdenv.
            nativeBuildInputs = [ pkgs.nodejs whiskers ];

            # No network, no npm deps (scripts use only Node built-ins).
            buildPhase = ''
              runHook preBuild
              export CATPPUCCIN_USERSTYLES_EXPORT="$PWD/vendor/catppuccin-userstyles-export.json"
              bash build.sh
              runHook postBuild
            '';

            # dist/<port>/... mirrors the layout home-manager sources from;
            # preview + palette JSON tag along for reference.
            installPhase = ''
              runHook preInstall
              mkdir -p "$out/preview"
              cp -R dist/. "$out/"
              cp preview/nebelung.html "$out/preview/"
              cp palette/nebelung*.json "$out/"
              runHook postInstall
            '';
          };
        in
        {
          default = nebelung-themes;
          nebelung-themes = nebelung-themes;
        }
      );
    };
}
