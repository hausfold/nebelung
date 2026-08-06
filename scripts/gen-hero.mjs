#!/usr/bin/env node
// Renders the README hero: two real screenshots of the same session — one
// running Catppuccin Mocha, one running Nebelung — stacked 4:5 for a phone,
// over a footer carrying the four variant ramps and the port count.
//
//   node scripts/gen-hero.mjs            → assets/mocha-vs-nebelung.png
//   node scripts/gen-hero.mjs --html     → stop at the (throwaway) HTML
//
// The screenshots themselves live in assets/scenes/ (2048px wide, cropped to
// 2:1) and are the only hand-made part — everything drawn around them comes
// from palette/ and ports.meta.json, so a recolor or a new port can't leave
// the hero lying. Reshooting them: same window, same zellij session, flip the
// theme, crop to the same rect.
//
// Needs Google Chrome for the screenshot (headless) and `sips` to downscale.

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
	Object.keys(variants).map((name) => [
		name,
		readJson(`palette/${name}.hex.json`),
	]),
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

// The claim in each chip, measured rather than asserted.
const chroma = (hex) => hexToLch(hex)[1].toFixed(3).replace(/^0/, "");

const dataUri = (rel) =>
	`data:image/png;base64,${readFileSync(join(ROOT, rel)).toString("base64")}`;

const RAMPS = [
	["dark", "nebelung"],
	["dark · high contrast", "nebelung-high-contrast"],
	["light", "nebelung-latte"],
	["light · high contrast", "nebelung-latte-high-contrast"],
];

const scene = ({ name, desc, base, shot }) => `
  <section class="scene">
    <div class="label">
      <span class="name">${name}</span><span class="sep">·</span>
      <span class="desc">${desc}</span>
      <span class="chip">base <b>#${base}</b> · chroma ${chroma(base)}</span>
    </div>
    <div class="shot"><img src="${dataUri(shot)}" alt=""></div>
  </section>`;

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
    padding: 24px 26px 22px;
    display: flex; flex-direction: column; gap: 14px;
  }

  .scene { display: flex; flex-direction: column; gap: 8px; }
  .label { display: flex; align-items: baseline; gap: 10px; padding: 0 2px; }
  .label .name { font-size: 21px; font-weight: 700; letter-spacing: -.2px; color: #ececec; }
  .label .sep { color: #5c5c5c; }
  .label .desc { font-size: 18px; color: #b4b4b4; }
  .label .chip {
    margin-left: auto; font-size: 13px; color: #8a8a8a;
    border: 1px solid #2c2c2c; border-radius: 6px; padding: 3px 9px;
  }
  .label .chip b { color: #b4b4b4; font-weight: 400; }

  /* The crop lands mid-line in three panes at once — fade it instead of
     pretending a terminal ends there. */
  .shot { border-radius: 11px; overflow: hidden; }
  .shot img {
    display: block; width: 100%;
    -webkit-mask-image: linear-gradient(to bottom, #000 91%, transparent 100%);
  }

  footer {
    display: flex; align-items: center; gap: 26px;
    border-top: 1px solid #232323; padding-top: 14px; margin-top: auto;
  }
  .count { line-height: 1.15; }
  .count b { display: block; font-size: 34px; font-weight: 700; color: #ececec; letter-spacing: -.5px; }
  .count span { font-size: 13.5px; color: #8a8a8a; }
  .ramps { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 9px 22px; }
  .ramp-label { font-size: 12px; color: #8a8a8a; margin-bottom: 4px; }
  .ramp-bar {
    display: flex; height: 15px; border-radius: 4px; overflow: hidden;
    box-shadow: inset 0 0 0 1px #232323;
  }
  .ramp-bar span { flex: 1; }
</style></head>
<body>
${scene({
	name: "Catppuccin Mocha",
	desc: "blue-tinted neutrals",
	base: MOCHA.base,
	shot: "assets/scenes/mocha.png",
})}
${scene({
	name: "Nebelung",
	desc: "true-gray neutrals",
	base: palettes.nebelung.base,
	shot: "assets/scenes/nebelung.png",
})}
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
