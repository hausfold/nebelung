#!/usr/bin/env node
// Renders the README hero: two real screenshots of the same session — one
// running Catppuccin Mocha, one running Nebelung — stacked 4:5 for a phone.
//
//   node scripts/gen-hero.mjs            → assets/mocha-vs-nebelung.png
//   node scripts/gen-hero.mjs --html     → stop at the (throwaway) HTML
//
// The screenshots themselves live in assets/scenes/ (whole window, 2048px
// wide) and are the only hand-made part — the frame and label type around them
// are Nebelung's own surface0/text/subtext0, read from palette/. Reshooting them:
// same window, same zellij session, flip the theme, same crop.
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


const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 1080;
const HEIGHT = 1350; // 4:5 portrait — a phone-shaped hero

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const nebelung = readJson("palette/nebelung.hex.json");
const dataUri = (rel) =>
	`data:image/png;base64,${readFileSync(join(ROOT, rel)).toString("base64")}`;

const scene = ({ name, desc, shot }) => `
  <section class="scene">
    <div class="label">
      <span class="name">${name}</span><span class="sep">·</span>
      <span class="desc">${desc}</span>
    </div>
    <div class="shot"><img src="${dataUri(shot)}" alt=""></div>
  </section>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>nebelung hero</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: #${nebelung.surface0};
    font: 400 16px/1.5 "JetBrainsMono Nerd Font", "JetBrains Mono",
          ui-monospace, "SF Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
    color: #${nebelung.text};
    padding: 20px 48px;
    display: flex; flex-direction: column; justify-content: center; gap: 14px;
  }

  .scene { display: flex; flex-direction: column; gap: 7px; }
  .label { display: flex; align-items: baseline; gap: 10px; padding: 0 2px; }
  .label .name { font-size: 21px; font-weight: 700; letter-spacing: -.2px; color: #${nebelung.text}; }
  .label .sep { color: #${nebelung.surface2}; }
  .label .desc { font-size: 18px; color: #${nebelung.subtext0}; }
  .shot { border-radius: 11px; overflow: hidden; }
  .shot img { display: block; width: 100%; }

</style></head>
<body>
${scene({
	name: "Catppuccin Mocha",
	desc: "blue-tinted neutrals",
	shot: "assets/scenes/mocha.png",
})}
${scene({
	name: "Nebelung",
	desc: "true-gray neutrals",
	shot: "assets/scenes/nebelung.png",
})}
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
