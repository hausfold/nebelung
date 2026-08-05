// Stylus — the port that can't be a stylesheet.
//
// Catppuccin's userstyles are LESS, compiled inside the browser, so unlike
// every other port there is no rendered CSS to drop somewhere. What ships
// instead is the upstream Stylus export with a LESS override block injected
// after each style's `lib.less` import, redefining the four Catppuccin flavor
// palettes. A style then resolves `@catppuccin[@mocha][@mauve]` to OUR hex.
//
// Two axes to serve, and they're served differently:
//
//   flavor    Every style carries `lightFlavor` / `darkFlavor` select vars and
//             picks between them by the browser's colour scheme. So one bundle
//             holds BOTH — the mocha slot and the latte slot are filled from
//             the nebelung palettes of the same contrast, and which you see is
//             the consumer's choice (via those vars), not ours. Until this,
//             only @mocha was overridden and light mode quietly rendered
//             upstream Catppuccin Latte — nebelung's palette simply wasn't
//             there.
//
//   contrast  Genuinely different hexes, so genuinely different bundles: one
//             per contrast, each landing in that contrast's variant dir like
//             every other port.
//
// Which leaves the flavor dirs. `latte/stylus` and `stylus` would be identical
// files — the bundle spans both flavors — and at 3 MB apiece that's a quarter
// of dist/ duplicated to say nothing new. They're symlinked at their contrast
// twin instead, so `<variant-dir>/stylus/` resolves for EVERY variant (which
// is what lets a consumer path stay uniform) without the package paying twice.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const variants = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'palette', 'variants.json'), 'utf-8'),
);

const hexes = (variant) =>
  JSON.parse(
    fs.readFileSync(path.join(ROOT, 'palette', `${variant}.hex.json`), 'utf-8'),
  );

// Upstream Catppuccin, kept verbatim for the two flavors nebelung doesn't
// render. A style whose lightFlavor/darkFlavor points at frappe or macchiato
// still has to resolve to SOMETHING, and silently handing it mocha's greys
// would be a worse lie than giving it the palette it actually asked for.
const FRAPPE =
  '{ @rosewater: #f2d5cf; @flamingo: #eebebe; @pink: #f4b8e4; @mauve: #ca9ee6; @red: #e78284; @maroon: #ea999c; @peach: #ef9f76; @yellow: #e5c890; @green: #a6d189; @teal: #81c8be; @sky: #99d1db; @sapphire: #85c1dc; @blue: #8caaee; @lavender: #babbf1; @text: #c6d0f5; @subtext1: #b5bfe2; @subtext0: #a5adce; @overlay2: #949cbb; @overlay1: #838ba7; @overlay0: #737994; @surface2: #626880; @surface1: #51576d; @surface0: #414559; @base: #303446; @mantle: #292c3c; @crust: #232634; }';
const MACCHIATO =
  '{ @rosewater: #f4dbd6; @flamingo: #f0c6c6; @pink: #f5bde6; @mauve: #c6a0f6; @red: #ed8796; @maroon: #ee99a0; @peach: #f5a97f; @yellow: #eed49f; @green: #a6da95; @teal: #8bd5ca; @sky: #91d7e3; @sapphire: #7dc4e4; @blue: #8aadf4; @lavender: #b7bdf8; @text: #cad3f5; @subtext1: #b8c0e0; @subtext0: #a5adcb; @overlay2: #939ab7; @overlay1: #8087a2; @overlay0: #6e738d; @surface2: #5b6078; @surface1: #494d64; @surface0: #363a4f; @base: #24273a; @mantle: #1e2030; @crust: #181926; }';

const SLOTS = [
  'rosewater', 'flamingo', 'pink', 'mauve', 'red', 'maroon', 'peach', 'yellow',
  'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender', 'text', 'subtext1',
  'subtext0', 'overlay2', 'overlay1', 'overlay0', 'surface2', 'surface1',
  'surface0', 'base', 'mantle', 'crust',
];

const lessBlock = (palette) => {
  const missing = SLOTS.filter((s) => !palette[s]);
  if (missing.length) {
    throw new Error(`palette is missing ${missing.join(', ')} — a style would resolve it to nothing`);
  }
  return `{ ${SLOTS.map((s) => `@${s}: #${palette[s]};`).join(' ')} }`;
};

// The bundle's input is the VENDORED upstream export, never a live download.
// Upstream's "all-userstyles-export" asset is a rolling URL: it used to be the
// fallback here, so a plain `bash build.sh` outside Nix silently bundled a
// NEWER export than the one the Nix build (and therefore CI) uses, and the
// committed dist/ drifted the moment someone ran the build without the env var
// set. Same input, or no build. Re-vendor by re-downloading that URL into
// vendor/ deliberately — see the note in flake.nix.
const VENDORED_EXPORT = path.join(ROOT, 'vendor', 'catppuccin-userstyles-export.json');

function readImportJson() {
  const src = process.env.CATPPUCCIN_USERSTYLES_EXPORT || VENDORED_EXPORT;
  if (!fs.existsSync(src)) {
    throw new Error(
      `userstyles export not found at ${src}. It is vendored, not fetched — ` +
      `restore vendor/catppuccin-userstyles-export.json (or point ` +
      `CATPPUCCIN_USERSTYLES_EXPORT at a copy) and re-run.`,
    );
  }
  return JSON.parse(fs.readFileSync(src, 'utf-8'));
}

// One contrast's bundle: the upstream export with our overrides injected.
// Deep-copied per contrast rather than mutated in place, because the injection
// rewrites `sourceCode` and doing it twice would nest one override block inside
// the next.
function bundleFor(importJson, mochaPalette, lattePalette) {
  const styles = JSON.parse(JSON.stringify(importJson));

  const lessOverrides = `
@catppuccin: {
  @latte:     ${lessBlock(lattePalette)};
  @frappe:    ${FRAPPE};
  @macchiato: ${MACCHIATO};
  @mocha:     ${lessBlock(mochaPalette)};
};
`;

  for (const style of styles) {
    if (!style.usercssData || !style.sourceCode) continue;

    // 1. Remove @updateURL so Stylus doesn't auto-update and revert our changes
    style.sourceCode = style.sourceCode.replace(/^@updateURL\s+.*$/m, '');
    if (style.updateUrl) {
      delete style.updateUrl;
    }

    // 2. Append our Nebelung overrides directly after the lib.less import
    // Note: Sometimes there might be multiple imports, we want to inject it after the lib.less one.
    const importRegex = /@import\s+("https:\/\/userstyles\.catppuccin\.com\/lib\/lib\.less"|'https:\/\/userstyles\.catppuccin\.com\/lib\/lib\.less');/i;
    style.sourceCode = style.sourceCode.replace(importRegex, (match) => {
      return match + '\n' + lessOverrides;
    });

    // Also change the name slightly so the user knows it's the Nebelung version
    style.name = style.name.replace('Catppuccin', 'Nebelung');
    style.usercssData.name = style.usercssData.name.replace('Catppuccin', 'Nebelung');
    if (style.sourceCode.match(/^@name\s+(.*)$/m)) {
      style.sourceCode = style.sourceCode.replace(/^@name\s+.*$/m, `@name ${style.name}`);
    }
  }

  return styles;
}

const readme = (contrast) => `# Stylus (Nebelung Port${contrast === 'high' ? ', high contrast' : ''})

This port modifies the official [Catppuccin Userstyles](https://github.com/catppuccin/userstyles) to use the Nebelung palette.

Because Catppuccin styles are written in LESS and compiled dynamically in the browser, they cannot be natively injected into \`userContent.css\`.

## Installation

1. Install the [Stylus extension](https://add0n.com/stylus.html) in your browser (Zen/Firefox).
2. Open the Stylus dashboard/settings.
3. On the left sidebar under "Manage", click **Import**.
4. Select the \`nebelung-stylus.json\` file located in this directory.
5. Stylus will import all Nebelung-flavored styles and automatically apply them!

*(Auto-updates for these styles have been disabled to prevent them from reverting to the default Catppuccin Mocha colors).*

## What this bundle is, and isn't

It carries **both** flavors — the mocha slot and the latte slot are both
Nebelung, at ${contrast === 'high' ? 'high' : 'normal'} contrast — so light and
dark both look right. Which one a style uses is that style's own
\`lightFlavor\` / \`darkFlavor\` var, and the **accent** is likewise a per-style
\`accentColor\` var defaulting to \`mauve\`. Those live in Stylus's own storage,
not in this file: set them in the Stylus UI, or have your rice stamp them into
the bundle before importing.
`;

function main() {
  const importJson = readImportJson();

  // Group the variants by contrast: one bundle per contrast, and within a
  // contrast the two flavors share it.
  const byContrast = new Map();
  for (const [name, v] of Object.entries(variants)) {
    // A variant with no `contrast` would land every variant in one group,
    // whose last mocha and last latte quietly win and whose primary dir is
    // then whichever the sort happened to surface — every other dir a symlink
    // at it. That failure looks like a working build and reads as "the whole
    // tree is high contrast", so it has to be an error, not a default.
    if (!v.contrast) {
      throw new Error(
        `variants.json: "${name}" has no \`contrast\`. Stylus renders one bundle ` +
        `per contrast, so it can't place this variant without knowing which.`,
      );
    }
    const group = byContrast.get(v.contrast) ?? { dirs: [] };
    group[v.flavor] = name;
    group.dirs.push({ dir: v.dir, flavor: v.flavor });
    byContrast.set(v.contrast, group);
  }

  for (const [contrast, group] of byContrast) {
    if (!group.mocha || !group.latte) {
      throw new Error(
        `variants.json: contrast "${contrast}" has no ${group.mocha ? 'latte' : 'mocha'} ` +
        `variant, so its bundle could only fill half its flavors.`,
      );
    }

    const styles = bundleFor(importJson, hexes(group.mocha), hexes(group.latte));
    // The mocha-flavored dir holds the real file; its latte twin links at it.
    const rank = (d) => (d.flavor === 'mocha' ? 0 : 1);
    const [primary, ...twins] = [...group.dirs].sort((a, b) => rank(a) - rank(b));

    const outdir = path.join(ROOT, 'dist', primary.dir, 'stylus');
    fs.rmSync(outdir, { recursive: true, force: true });
    fs.mkdirSync(outdir, { recursive: true });
    fs.writeFileSync(
      path.join(outdir, 'nebelung-stylus.json'),
      JSON.stringify(styles, null, 2),
    );
    fs.writeFileSync(path.join(outdir, 'README.md'), readme(contrast));
    console.log(`✓ stylus → dist/${primary.dir || '.'}/stylus/ (${contrast} contrast, both flavors)`);

    for (const twin of twins) {
      const link = path.join(ROOT, 'dist', twin.dir, 'stylus');
      // Byte-identical to its contrast twin — the bundle spans both flavors.
      // Relative, so it stays valid once dist/ is copied into the Nix store.
      const target = path.relative(path.dirname(link), outdir);
      fs.mkdirSync(path.dirname(link), { recursive: true });
      fs.rmSync(link, { recursive: true, force: true });
      fs.symlinkSync(target, link);
      console.log(`✓ stylus → dist/${twin.dir}/stylus -> ${target} (same contrast, other flavor)`);
    }
  }
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
