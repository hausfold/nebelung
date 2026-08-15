#!/usr/bin/env node
// Generate the Nebelung palette as a whiskers `--color-overrides` file.
//
// Strategy (all math in OKLCH so perceptual lightness is preserved):
//   1. Neutral ramp  -> strip the ~240° blue, replace with a faint warm grey.
//      Lightness (L) is kept exactly; only hue + chroma are rewritten.
//   2. Accents       -> keep hue + lightness, scale chroma down so they sit
//      calmly against true-neutral greys instead of the slightly-blue base.
//
// The strategy is polarity-agnostic, which is what makes light mode possible at
// all: it never assumes "text is light, base is dark", only that the neutrals
// form a ramp. Point it at Latte instead of Mocha and the same two rules produce
// the same theme in the other polarity.
//
// Knobs live in CONFIG below — tweak and re-run; everything downstream rebuilds.

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
export const CONFIG = {
	// Which Catppuccin flavor to strip the blue out of — a key of FLAVORS below.
	// This is also the whiskers flavor the variant renders as (`whiskers -f`), so
	// its templates take the right light/dark branches and name their output
	// files after it (catppuccin-latte.conf vs catppuccin-mocha.conf).
	flavor: "mocha",
	// Warm grey: hue in degrees (≈70° = warm, between orange and yellow) and a
	// small constant chroma. Bigger chroma => more obvious tint.
	neutralHue: 70,
	neutralChroma: 0, // pure neutral grey (R=G=B); hue is irrelevant at 0
	// Accents: multiply OKLCH chroma. 0.90 = 10% calmer. Range 0.85–0.95.
	accentChromaScale: 0.9,
	// Neutral contrast. 0 = the ramp the source flavor ships. Above 0, push each
	// neutral's OKLCH lightness AWAY from the ramp's midpoint, so text and
	// backgrounds separate while every step keeps its order and spacing. Done in
	// OKLCH rather than sRGB so the result is perceptually even instead of
	// crushing the dark end.
	contrastBoost: 0,
};

// Palette variants: the FLAVOR axis (mocha = dark, latte = light) crossed with
// the CONTRAST axis. `nebelung` is the theme as it has always been, and stays
// byte-identical — its files keep their paths, so nothing downstream moves.
// Every other variant renders alongside it rather than replacing it.
//
// The two contrast boosts differ ON PURPOSE, and it isn't a tuning whim: a boost
// pushes the ramp outward from its midpoint, and Mocha has ~0.2 of OKLCH
// headroom below its `base` while Latte has only ~0.04 above its. Pushed by
// 0.35, Latte's base/mantle/crust all clamp into the same white — the ramp
// silently loses a step of hierarchy. 0.20 is the most Latte takes while keeping
// all twelve steps distinct; the tests assert both properties rather than
// trusting these numbers.
export const VARIANTS = {
	nebelung: CONFIG,
	// For anyone who needs the interface to separate cleanly from its
	// background: same hues, same accents, a ramp pulled apart. Verified against
	// WCAG AAA in the tests rather than tuned by eye.
	"nebelung-high-contrast": { ...CONFIG, contrastBoost: 0.35 },
	// Light mode. Not a transform of the dark palette — a different SOURCE
	// palette (Catppuccin Latte) run through the identical two rules.
	"nebelung-latte": { ...CONFIG, flavor: "latte" },
	"nebelung-latte-high-contrast": { ...CONFIG, flavor: "latte", contrastBoost: 0.2 },
};

// Where each variant's rendered ports live inside the themes package, relative
// to its root. The default variant keeps the root itself so every path that
// existed before any variant did still resolves. MIRRORED in two places that
// must agree with this one: `render_ports` in build.sh (which reads the
// generated palette/variants.json) and haus's modules/lib/nebelung.nix
// (which builds the same subdir from haus.theme.flavor/contrast).
export const variantDir = (name) => (name === "nebelung" ? "" : name.replace(/^nebelung-/, ""));

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

// Canonical Catppuccin Latte palette — the light-mode source. Same 26 slot
// names, the ramp running the other way (`text` is the dark end, `base` the
// light one). Read out of whiskers itself rather than transcribed from docs, so
// it is the same data the templates render against.
export const LATTE = {
	rosewater: "dc8a78",
	flamingo: "dd7878",
	pink: "ea76cb",
	mauve: "8839ef",
	red: "d20f39",
	maroon: "e64553",
	peach: "fe640b",
	yellow: "df8e1d",
	green: "40a02b",
	teal: "179299",
	sky: "04a5e5",
	sapphire: "209fb5",
	blue: "1e66f5",
	lavender: "7287fd",
	text: "4c4f69",
	subtext1: "5c5f77",
	subtext0: "6c6f85",
	overlay2: "7c7f93",
	overlay1: "8c8fa1",
	overlay0: "9ca0b0",
	surface2: "acb0be",
	surface1: "bcc0cc",
	surface0: "ccd0da",
	base: "eff1f5",
	mantle: "e6e9ef",
	crust: "dce0e8",
};

// The source flavors a variant can be built from, by `config.flavor`.
export const FLAVORS = { mocha: MOCHA, latte: LATTE };

// The neutral ramp (everything that carries the ~240° blue). Order is Mocha's
// light→dark; Latte runs the other way. Nothing below depends on the direction —
// the contrast transform works off the ramp's min/max, not its order.
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
	const flavor = config.flavor ?? "mocha";
	const source = FLAVORS[flavor];
	if (!source) {
		throw new Error(`unknown source flavor "${flavor}" — expected one of ${Object.keys(FLAVORS)}`);
	}
	const warmHueRad = (config.neutralHue * Math.PI) / 180;
	const out = {};
	const table = [];

	// Midpoint of the neutral ramp, so a boost expands symmetrically instead of
	// dragging the whole ramp lighter or darker. Taken from THIS variant's source
	// flavor: Latte's midpoint sits far higher than Mocha's, and using Mocha's
	// would drag the whole light ramp dark instead of expanding it in place.
	const ramp = NEUTRALS.map((n) => hexToLch(source[n])[0]);
	const mid = (Math.min(...ramp) + Math.max(...ramp)) / 2;
	const boost = config.contrastBoost ?? 0;

	for (const name of NEUTRALS) {
		const [L0] = hexToLch(source[name]);
		const L = Math.min(1, Math.max(0, mid + (L0 - mid) * (1 + boost)));
		const hex = lchToHex([L, config.neutralChroma, warmHueRad]);
		out[name] = hex;
		table.push([
			name,
			source[name],
			hex,
			boost ? `neutral→warm grey, contrast ×${1 + boost}` : "neutral→warm grey",
		]);
	}
	for (const name of ACCENTS) {
		const [L, C, h] = hexToLch(source[name]);
		const hex = lchToHex([L, C * config.accentChromaScale, h]);
		out[name] = hex;
		table.push([name, source[name], hex, `chroma ×${config.accentChromaScale}`]);
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
	// every downstream path stays exactly where it was. The whiskers override file
	// is keyed by the flavor it overrides, so a latte variant writes { latte: … }
	// and must be rendered with `whiskers -f latte`.
	const manifest = {};
	for (const [variant, cfg] of Object.entries(VARIANTS)) {
		const flavor = cfg.flavor ?? "mocha";
		const { out: vOut } = buildOverrides(cfg);
		writeFileSync(
			join(root, "palette", `${variant}.json`),
			JSON.stringify({ [flavor]: vOut }, null, 2) + "\n",
		);
		// Also a flat hex map for docs/reference.
		writeFileSync(
			join(root, "palette", `${variant}.hex.json`),
			JSON.stringify(vOut, null, 2) + "\n",
		);
		// `contrast` is derived, not declared: a variant IS high-contrast exactly
		// when it asked for a boost. It's in the manifest because the two axes
		// are independent for any consumer that has to PAIR variants up —
		// gen-stylus renders one bundle per contrast carrying both flavors, and
		// without this it would have to re-derive the pairing from the name.
		manifest[variant] = {
			flavor,
			contrast: cfg.contrastBoost ? "high" : "normal",
			dir: variantDir(variant),
		};
	}

	// The manifest build.sh renders from. Generated rather than hand-listed so
	// "which variants exist, from which flavor, into which dist subdir" has one
	// answer — VARIANTS above — instead of one per consumer.
	writeFileSync(
		join(root, "palette", "variants.json"),
		JSON.stringify(manifest, null, 2) + "\n",
	);

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
	console.log(
		`\n  Wrote ${Object.keys(VARIANTS).length} variant(s) + palette/variants.json: ` +
			`${Object.keys(VARIANTS).join(", ")}\n`,
	);
}
