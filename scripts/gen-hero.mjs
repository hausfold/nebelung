#!/usr/bin/env node
// Renders the README hero: one scene, twice — Catppuccin Mocha on top,
// Nebelung below — plus the four variant ramps in the footer.
//
//   node scripts/gen-hero.mjs            → assets/mocha-vs-nebelung.png
//
// Needs Google Chrome for the screenshot (headless) and `sips` (macOS) to
// downscale the 2x render. Pass --html to stop at the (throwaway) HTML.

import { execFileSync, spawn } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { MOCHA, hexToLch } from "./generate-palette.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 1080;
const HEIGHT = 1350; // 4:5 portrait — a phone-shaped hero

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const variants = readJson("palette/variants.json");
const palettes = Object.fromEntries(
	Object.keys(variants).map((name) => [name, readJson(`palette/${name}.hex.json`)]),
);
const portCount = Object.keys(readJson("ports.meta.json")).length;

const NEUTRALS = [
	"crust",
	"mantle",
	"base",
	"surface0",
	"surface1",
	"surface2",
	"overlay0",
	"overlay1",
	"overlay2",
	"subtext0",
	"subtext1",
	"text",
];

// The objective claim under each label, computed rather than asserted.
const chroma = (hex) => hexToLch(hex)[1];
const mochaChroma = chroma(MOCHA.base).toFixed(3).replace(/^0/, "");
const nebChroma = chroma(palettes.nebelung.base).toFixed(3).replace(/^0/, "");

const withHash = (p) =>
	Object.fromEntries(Object.entries(p).map(([k, v]) => [k, `#${v}`]));

const vars = (p) =>
	Object.entries(withHash(p))
		.map(([k, v]) => `--${k}:${v}`)
		.join(";");

const RAMPS = [
	["dark", "nebelung"],
	["dark · high contrast", "nebelung-high-contrast"],
	["light", "nebelung-latte"],
	["light · high contrast", "nebelung-latte-high-contrast"],
];

// ── the scene ────────────────────────────────────────────────────────────
// Identical markup in both halves; only the custom properties change.
const scene = () => `
<div class="win">
  <div class="chrome">
    <span class="dot" style="background:var(--red)"></span>
    <span class="dot" style="background:var(--yellow)"></span>
    <span class="dot" style="background:var(--green)"></span>
    <span class="path">~/code/nebelung</span>
    <span class="app">ghostty</span>
  </div>

  <div class="pane editor">
    <div class="code">
${[
	[1, `<i class="cmt">// nebelung — strip the blue, keep the cat</i>`],
	[
		2,
		`<i class="kw">import</i> { flavors } <i class="kw">from</i> <i class="str">"@catppuccin/palette"</i>`,
	],
	[3, ``],
	[
		4,
		`<i class="kw">export function</i> <i class="fn">neutralize</i>(hex<i class="op">:</i> <i class="ty">string</i>)<i class="op">:</i> <i class="ty">string</i> {`,
	],
	[
		5,
		`  <i class="kw">const</i> { l, c } <i class="op">=</i> <i class="fn">oklch</i>(hex)`,
	],
	[
		6,
		`  <i class="kw">return</i> <i class="fn">formatHex</i>({ l, c<i class="op">:</i> c <i class="op">*</i> <i class="num">0.9</i>, h<i class="op">:</i> <i class="num">70</i> })`,
	],
	[7, `}`],
	[8, ``],
	[
		9,
		`<i class="kw">const</i> misty <i class="op">=</i> <i class="fn">map</i>(flavors.mocha.colors, neutralize)`,
		true,
	],
]
	.map(
		([n, html, sel]) =>
			`      <div class="row${sel ? " sel" : ""}"><span class="ln">${n}</span>${html}</div>`,
	)
	.join("\n")}
    </div>
    <div class="status">
      <span class="mode">NOR</span>
      <span class="file">neutralize.ts</span>
      <span class="spacer"></span>
      <span class="dim">1 sel</span>
      <span class="dim">9:41</span>
      <span class="dim">LF</span>
      <span class="dim">typescript</span>
      <span class="app">helix</span>
    </div>
  </div>

  <div class="pane term">
    <div class="row"><span class="p-dir">~/code/nebelung</span> <span class="dim">on</span> <span class="p-git">main</span> <span class="p-ok">❯</span> ./build.sh</div>
    <div class="row"><span class="ok">✓</span> rendered <span class="hl">${portCount}</span> ports <span class="dim">·</span> 4 variants <span class="dim">→ dist/</span></div>
    <div class="row"><span class="p-dir">~/code/nebelung</span> <span class="dim">on</span> <span class="p-git">main</span> <span class="p-dirty">✚</span> <span class="p-ok">❯</span> git diff</div>
    <div class="row diffhdr">palette/nebelung.hex.json <span class="dim">──────────────────────────</span></div>
    <div class="row del"><span class="dln">23</span><span class="dsign">-</span>  "base": "1e1e2e",</div>
    <div class="row add"><span class="dln">23</span><span class="dsign">+</span>  "base": "202020",</div>
    <div class="row"><span class="app term-app">starship + delta</span></div>
  </div>
</div>`;

const ramp = (label, name) => `
  <div class="ramp">
    <div class="ramp-label">${label}</div>
    <div class="ramp-bar">${NEUTRALS.map(
			(k) => `<span style="background:#${palettes[name][k]}"></span>`,
		).join("")}</div>
  </div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>nebelung hero</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: #0b0b0b;
    font: 400 16px/1.5 "JetBrainsMono Nerd Font", "JetBrains Mono",
          ui-monospace, "SF Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
    color: #d7d7d7;
    padding: 26px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* ── labels ─────────────────────────────────────────────── */
  .scene { display: flex; flex-direction: column; gap: 9px; flex: 1; }
  .label { display: flex; align-items: baseline; gap: 10px; padding: 0 2px; }
  .label .name { font-size: 20px; font-weight: 700; letter-spacing: -.2px; color: #ececec; }
  .label .sep { color: #5c5c5c; }
  .label .desc { font-size: 18px; color: #b4b4b4; }
  .label .chip {
    margin-left: auto; font-size: 13px; color: #8a8a8a;
    border: 1px solid #2c2c2c; border-radius: 6px; padding: 3px 9px;
  }
  .label .chip b { color: #b4b4b4; font-weight: 400; }

  /* ── the window ─────────────────────────────────────────── */
  .win {
    flex: 1; min-height: 0; overflow: hidden;
    border-radius: 12px; border: 1px solid var(--surface0);
    background: var(--base); color: var(--text);
    display: flex; flex-direction: column;
    font-size: 15.5px; line-height: 25px;
  }
  .chrome {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 14px; background: var(--mantle);
    border-bottom: 1px solid var(--surface0); font-size: 13.5px;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .chrome .path { margin-left: 8px; color: var(--subtext0); }
  .app {
    margin-left: auto; font-size: 12px; letter-spacing: .5px;
    color: var(--overlay1); text-transform: lowercase;
  }
  .pane { padding: 10px 16px; }
  .editor { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .code { flex: 1; }
  .row { white-space: pre; }
  .ln {
    display: inline-block; width: 34px; color: var(--overlay0);
    text-align: right; padding-right: 18px;
  }
  .sel { background: var(--surface0); border-radius: 4px; }
  i { font-style: normal; }
  .cmt { color: var(--overlay1); font-style: italic; }
  .kw  { color: var(--mauve); }
  .fn  { color: var(--blue); }
  .str { color: var(--green); }
  .num { color: var(--peach); }
  .ty  { color: var(--yellow); }
  .op  { color: var(--sky); }

  .status {
    display: flex; align-items: center; gap: 16px;
    margin: 8px -16px -10px; padding: 5px 16px;
    background: var(--mantle); font-size: 13px; color: var(--subtext0);
  }
  .status .mode {
    background: var(--lavender); color: var(--base);
    padding: 1px 9px; border-radius: 4px; font-weight: 700;
  }
  .status .spacer { flex: 1; }
  .status .dim { color: var(--overlay1); }
  .status .app { margin-left: 0; }

  .term {
    background: var(--crust); border-top: 1px solid var(--surface0);
    color: var(--subtext1); position: relative;
  }
  .term .ok { color: var(--green); }
  .term .hl { color: var(--yellow); }
  .term .dim { color: var(--overlay0); }
  .p-dir { color: var(--teal); }
  .p-git { color: var(--mauve); }
  .p-dirty { color: var(--peach); }
  .p-ok { color: var(--green); }
  .diffhdr { color: var(--blue); }
  .dln { display: inline-block; width: 30px; color: var(--overlay0); }
  .dsign { display: inline-block; width: 16px; }
  .add { background: color-mix(in srgb, var(--green) 14%, transparent); color: var(--green); }
  .del { background: color-mix(in srgb, var(--red) 14%, transparent); color: var(--red); }
  .term-app { display: block; text-align: right; margin-top: 2px; }

  /* ── footer ─────────────────────────────────────────────── */
  footer {
    display: flex; align-items: center; gap: 26px;
    border-top: 1px solid #232323; padding-top: 16px;
  }
  .count { line-height: 1.15; }
  .count b { display: block; font-size: 34px; font-weight: 700; color: #ececec; letter-spacing: -.5px; }
  .count span { font-size: 13.5px; color: #8a8a8a; }
  .ramps { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 22px; }
  .ramp-label { font-size: 12px; color: #8a8a8a; margin-bottom: 4px; }
  .ramp-bar { display: flex; height: 15px; border-radius: 4px; overflow: hidden;
              box-shadow: inset 0 0 0 1px #232323; }
  .ramp-bar span { flex: 1; }
</style></head>
<body>

  <section class="scene" style="${vars(MOCHA)}">
    <div class="label">
      <span class="name">Catppuccin Mocha</span><span class="sep">·</span>
      <span class="desc">blue-tinted neutrals</span>
      <span class="chip">base <b>#${MOCHA.base}</b> · chroma ${mochaChroma}</span>
    </div>
    ${scene()}
  </section>

  <section class="scene" style="${vars(palettes.nebelung)}">
    <div class="label">
      <span class="name">Nebelung</span><span class="sep">·</span>
      <span class="desc">true-gray neutrals</span>
      <span class="chip">base <b>#${palettes.nebelung.base}</b> · chroma ${nebChroma}</span>
    </div>
    ${scene()}
  </section>

  <footer>
    <div class="count"><b>${portCount} ports</b><span>one palette · four variants</span></div>
    <div class="ramps">${RAMPS.map(([l, n]) => ramp(l, n)).join("")}</div>
  </footer>

</body></html>`;

// The HTML is scaffolding, not an artifact — only the PNG is committed.
const shotDir = mkdtempSync(join(tmpdir(), "nebelung-hero-"));
const htmlPath = join(shotDir, "hero.html");
const shot = join(shotDir, "hero.png");
writeFileSync(htmlPath, html);
console.log(`wrote ${htmlPath}`);

if (process.argv.includes("--html")) process.exit(0);

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = join(ROOT, "assets", "mocha-vs-nebelung.png");

// Chrome writes the PNG and then lingers (its updater keeps the process
// alive), so: spawn detached, wait for the file to stop growing, kill it.
const chrome = spawn(
	CHROME,
	[
		"--headless",
		"--disable-gpu",
		"--no-sandbox",
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-networking",
		"--disable-component-update",
		"--hide-scrollbars",
		"--force-device-scale-factor=2",
		`--window-size=${WIDTH},${HEIGHT}`,
		`--screenshot=${shot}`,
		`--user-data-dir=${join(shotDir, "profile")}`,
		`file://${htmlPath}`,
	],
	{ stdio: "ignore", detached: true },
);

const sleep = (ms) => execFileSync("/bin/sleep", [String(ms / 1000)]);
let size = -1;
for (let i = 0; i < 60; i++) {
	sleep(500);
	const now = existsSync(shot) ? statSync(shot).size : -1;
	if (now > 0 && now === size) break;
	size = now;
}
try {
	process.kill(-chrome.pid, "SIGKILL");
} catch {}
if (!existsSync(shot)) {
	console.error("chrome produced no screenshot");
	process.exit(1);
}
// Rendered at 2x, delivered at 1x — the downscale is the antialiasing.
execFileSync("sips", ["-z", String(HEIGHT), String(WIDTH), shot, "--out", out], {
	stdio: "ignore",
});
console.log(`wrote ${out}`);
