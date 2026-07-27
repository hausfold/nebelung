#!/usr/bin/env node
// Generate the Nebelung palette as a whiskers `--color-overrides` file.
//
// Strategy (all math in OKLCH so perceptual lightness is preserved):
//   1. Neutral ramp  -> strip the ~240° blue, replace with a faint warm grey.
//      Lightness (L) is kept exactly; only hue + chroma are rewritten.
//   2. Accents       -> keep hue + lightness, scale chroma down so they sit
//      calmly against true-neutral greys instead of the slightly-blue base.
//
// Knobs live in CONFIG below — tweak and re-run; everything downstream rebuilds.

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
export const CONFIG = {
	// Warm grey: hue in degrees (≈70° = warm, between orange and yellow) and a
	// small constant chroma. Bigger chroma => more obvious tint.
	neutralHue: 70,
	neutralChroma: 0, // pure neutral grey (R=G=B); hue is irrelevant at 0
	// Accents: multiply OKLCH chroma. 0.90 = 10% calmer. Range 0.85–0.95.
	accentChromaScale: 0.9,
	// Neutral contrast. 0 = the ramp Mocha ships. Above 0, push each neutral's
	// OKLCH lightness AWAY from the ramp's midpoint, so text gets lighter and
	// backgrounds darker while every step keeps its order and spacing. Done in
	// OKLCH rather than sRGB so the result is perceptually even instead of
	// crushing the dark end.
	contrastBoost: 0,
};

// Palette variants. `nebelung` is the theme as it has always been, and stays
// byte-identical — its files keep their paths, so nothing downstream moves.
// Additional variants render alongside it rather than replacing it.
export const VARIANTS = {
	nebelung: CONFIG,
	// For anyone who needs the interface to separate cleanly from its
	// background: same hues, same accents, a ramp pulled apart. Verified against
	// WCAG AAA in the tests rather than tuned by eye.
	"nebelung-high-contrast": { ...CONFIG, contrastBoost: 0.35 },
};

// Canonical Catppuccin Mocha palette (source of truth we override from).
export const MOCHA = {
	rosewater: "f5e0dc",
	flamingo: "f2cdcd",
	pink: "f5c2e7",
	mauve: "cba6f7",
	red: "f38ba8",
	maroon: "eba0ac",
	peach: "fab387",
	yellow: "f9e2af",
	green: "a6e3a1",
	teal: "94e2d5",
	sky: "89dceb",
	sapphire: "74c7ec",
	blue: "89b4fa",
	lavender: "b4befe",
	text: "cdd6f4",
	subtext1: "bac2de",
	subtext0: "a6adc8",
	overlay2: "9399b2",
	overlay1: "7f849c",
	overlay0: "6c7086",
	surface2: "585b70",
	surface1: "45475a",
	surface0: "313244",
	base: "1e1e2e",
	mantle: "181825",
	crust: "11111b",
};

// The neutral ramp (everything that carries the ~240° blue). Order = light→dark.
export const NEUTRALS = [
	"text",
	"subtext1",
	"subtext0",
	"overlay2",
	"overlay1",
	"overlay0",
	"surface2",
	"surface1",
	"surface0",
	"base",
	"mantle",
	"crust",
];
export const ACCENTS = [
	"rosewater",
	"flamingo",
	"pink",
	"mauve",
	"red",
	"maroon",
	"peach",
	"yellow",
	"green",
	"teal",
	"sky",
	"sapphire",
	"blue",
	"lavender",
];

// ---------------------------------------------------------------------------
// Color math: sRGB <-> OKLab <-> OKLCH  (Björn Ottosson)
// ---------------------------------------------------------------------------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const srgbToLinear = (c) => {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const linearToSrgb = (c) => {
	const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
	return Math.round(clamp01(v) * 255);
};
export const hexToRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgbToHex = (rgb) =>
	rgb.map((c) => c.toString(16).padStart(2, "0")).join("");

function rgbToOklab([r, g, b]) {
	const lr = srgbToLinear(r),
		lg = srgbToLinear(g),
		lb = srgbToLinear(b);
	const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
	const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
	const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
	const l_ = Math.cbrt(l),
		m_ = Math.cbrt(m),
		s_ = Math.cbrt(s);
	return [
		0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
	];
}
function oklabToRgb([L, a, b]) {
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;
	const l = l_ ** 3,
		m = m_ ** 3,
		s = s_ ** 3;
	return [
		linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
	];
}
const oklabToLch = ([L, a, b]) => [L, Math.hypot(a, b), Math.atan2(b, a)];
const lchToOklab = ([L, C, h]) => [L, C * Math.cos(h), C * Math.sin(h)];

export const hexToLch = (h) => oklabToLch(rgbToOklab(hexToRgb(h)));
export const lchToHex = (lch) => rgbToHex(oklabToRgb(lchToOklab(lch)));

// ---------------------------------------------------------------------------
// Build the override map — pure (MOCHA + config -> { out, table }), no I/O, so
// tests can call it directly and the CLI block below writes what it returns.
// ---------------------------------------------------------------------------
export function buildOverrides(config = CONFIG) {
	const warmHueRad = (config.neutralHue * Math.PI) / 180;
	const out = {};
	const table = [];

	// Midpoint of the neutral ramp, so a boost expands symmetrically instead of
	// dragging the whole ramp lighter or darker.
	const ramp = NEUTRALS.map((n) => hexToLch(MOCHA[n])[0]);
	const mid = (Math.min(...ramp) + Math.max(...ramp)) / 2;
	const boost = config.contrastBoost ?? 0;

	for (const name of NEUTRALS) {
		const [L0] = hexToLch(MOCHA[name]);
		const L = Math.min(1, Math.max(0, mid + (L0 - mid) * (1 + boost)));
		const hex = lchToHex([L, config.neutralChroma, warmHueRad]);
		out[name] = hex;
		table.push([
			name,
			MOCHA[name],
			hex,
			boost ? `neutral→warm grey, contrast ×${1 + boost}` : "neutral→warm grey",
		]);
	}
	for (const name of ACCENTS) {
		const [L, C, h] = hexToLch(MOCHA[name]);
		const hex = lchToHex([L, C * config.accentChromaScale, h]);
		out[name] = hex;
		table.push([name, MOCHA[name], hex, `chroma ×${config.accentChromaScale}`]);
	}
	return { out, table };
}

// ---------------------------------------------------------------------------
// CLI entry: write the palette files + print a preview. Guarded on isMain so
// importing this module (from the tests) has no side effects.
// ---------------------------------------------------------------------------
import { writeFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const isMain =
	process.argv[1] &&
	realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));

if (isMain) {
	const root = join(dirname(fileURLToPath(import.meta.url)), "..");

	// One pair of files per variant. `nebelung` keeps its existing filenames, so
	// every downstream path stays exactly where it was.
	for (const [variant, cfg] of Object.entries(VARIANTS)) {
		const { out: vOut } = buildOverrides(cfg);
		writeFileSync(
			join(root, "palette", `${variant}.json`),
			JSON.stringify({ mocha: vOut }, null, 2) + "\n",
		);
		// Also a flat hex map for docs/reference.
		writeFileSync(
			join(root, "palette", `${variant}.hex.json`),
			JSON.stringify(vOut, null, 2) + "\n",
		);
	}

	const { out, table } = buildOverrides();

	// Pretty console preview with true-color swatches.
	const swatch = (hex) => {
		const [r, g, b] = hexToRgb(hex);
		return `\x1b[48;2;${r};${g};${b}m      \x1b[0m`;
	};
	console.log(
		`\n  Nebelung palette — neutralHue=${CONFIG.neutralHue}° ` +
			`chroma=${CONFIG.neutralChroma} accentScale=${CONFIG.accentChromaScale}\n`,
	);
	console.log(
		`  ${"name".padEnd(11)} mocha     ${"".padEnd(6)}  nebelung   ${"".padEnd(6)}`,
	);
	for (const [name, from, to, note] of table) {
		console.log(
			`  ${name.padEnd(11)} #${from} ${swatch(from)}  #${to} ${swatch(to)}  ${note}`,
		);
	}
	console.log("\n  Wrote palette/nebelung.json and palette/nebelung.hex.json\n");
}
