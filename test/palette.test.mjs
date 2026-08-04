// Tests for the OKLCH palette generator. Run with `node --test`.
//
// These pin the two things that actually matter for a theme: the perceptual
// invariants the strategy promises (neutrals go true-grey but keep lightness;
// accents keep hue + lightness and only lose chroma), and that the committed
// palette/*.json is what the current code produces (drift guard — the repo
// commits generated output, so a stale checkout is a real failure mode).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
	buildOverrides,
	hexToRgb,
	rgbToHex,
	hexToLch,
	lchToHex,
	MOCHA,
	LATTE,
	FLAVORS,
	NEUTRALS,
	ACCENTS,
	VARIANTS,
	CONFIG,
	variantDir,
} from "../scripts/generate-palette.mjs";

const HEX6 = /^[0-9a-f]{6}$/;
const near = (a, b, eps) => Math.abs(a - b) <= eps;

test("covers every mocha color exactly once, all valid 6-digit hex", () => {
	const { out } = buildOverrides();
	assert.equal(Object.keys(out).length, NEUTRALS.length + ACCENTS.length);
	assert.equal(Object.keys(out).length, Object.keys(MOCHA).length);
	for (const [name, hex] of Object.entries(out)) {
		assert.match(hex, HEX6, `${name} -> ${hex} is not 6-digit hex`);
	}
});

test("neutrals become true grey (R=G=B) — chroma stripped", () => {
	const { out } = buildOverrides();
	for (const name of NEUTRALS) {
		const [r, g, b] = hexToRgb(out[name]);
		assert.ok(r === g && g === b, `${name} -> ${out[name]} is not neutral grey`);
	}
});

test("neutrals preserve OKLCH lightness", () => {
	const { out } = buildOverrides();
	for (const name of NEUTRALS) {
		const before = hexToLch(MOCHA[name])[0];
		const after = hexToLch(out[name])[0];
		assert.ok(near(before, after, 0.01), `${name} lightness drifted ${before} -> ${after}`);
	}
});

test("accents keep hue + lightness and only scale chroma down", () => {
	const { out } = buildOverrides();
	for (const name of ACCENTS) {
		const [L0, C0, h0] = hexToLch(MOCHA[name]);
		const [L1, C1, h1] = hexToLch(out[name]);
		assert.ok(near(L0, L1, 0.01), `${name} lightness drifted`);
		assert.ok(near(h0, h1, 0.05), `${name} hue drifted ${h0} -> ${h1}`);
		assert.ok(C1 < C0, `${name} chroma should shrink (${C0} -> ${C1})`);
		assert.ok(near(C1, C0 * CONFIG.accentChromaScale, 0.02), `${name} chroma not scaled by config`);
	}
});

test("config knobs drive the output", () => {
	// scale 1.0 leaves accent chroma ~unchanged...
	const identity = buildOverrides({ ...CONFIG, accentChromaScale: 1 });
	for (const name of ACCENTS) {
		const c0 = hexToLch(MOCHA[name])[1];
		const c1 = hexToLch(identity.out[name])[1];
		assert.ok(near(c0, c1, 0.02), `${name} should be ~unchanged at scale 1`);
	}
	// ...and scale 0 flattens accents to grey too.
	const flat = buildOverrides({ ...CONFIG, accentChromaScale: 0 });
	for (const name of ACCENTS) {
		const [r, g, b] = hexToRgb(flat.out[name]);
		assert.ok(r === g && g === b, `${name} should be grey at scale 0`);
	}
});

test("hex<->rgb round-trips", () => {
	for (const hex of Object.values(MOCHA)) {
		assert.equal(rgbToHex(hexToRgb(hex)), hex);
	}
});

test("hex<->OKLCH round-trips within 8-bit rounding", () => {
	for (const hex of Object.values(MOCHA)) {
		const back = hexToRgb(lchToHex(hexToLch(hex)));
		const fwd = hexToRgb(hex);
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(back[i] - fwd[i]) <= 1, `${hex} round-trip off at channel ${i}`);
		}
	}
});

test("committed palette/nebelung.hex.json matches generator output (drift guard)", () => {
	const committed = JSON.parse(
		readFileSync(new URL("../palette/nebelung.hex.json", import.meta.url)),
	);
	assert.deepEqual(committed, buildOverrides().out);
});

test("committed palette/nebelung.json matches generator output (drift guard)", () => {
	const committed = JSON.parse(
		readFileSync(new URL("../palette/nebelung.json", import.meta.url)),
	);
	assert.deepEqual(committed, { mocha: buildOverrides().out });
});

test("every variant's committed palette files match generator output (drift guard)", () => {
	for (const [variant, cfg] of Object.entries(VARIANTS)) {
		const { out } = buildOverrides(cfg);
		const flavor = cfg.flavor ?? "mocha";
		const hex = JSON.parse(
			readFileSync(new URL(`../palette/${variant}.hex.json`, import.meta.url)),
		);
		const overrides = JSON.parse(
			readFileSync(new URL(`../palette/${variant}.json`, import.meta.url)),
		);
		assert.deepEqual(hex, out, `${variant}.hex.json is stale`);
		// The whiskers override file is keyed by the flavor it overrides — get
		// this wrong and `whiskers -f latte` silently renders STOCK latte.
		assert.deepEqual(overrides, { [flavor]: out }, `${variant}.json is stale`);
	}
});

test("committed palette/variants.json matches VARIANTS (drift guard)", () => {
	// build.sh renders from this manifest, so a stale one means a variant either
	// doesn't get rendered or gets rendered as the wrong catppuccin flavor.
	const committed = JSON.parse(
		readFileSync(new URL("../palette/variants.json", import.meta.url)),
	);
	const expected = Object.fromEntries(
		Object.entries(VARIANTS).map(([name, cfg]) => [
			name,
			{
				flavor: cfg.flavor ?? "mocha",
				contrast: cfg.contrastBoost ? "high" : "normal",
				dir: variantDir(name),
			},
		]),
	);
	assert.deepEqual(committed, expected);
});

test("every contrast has both flavors (stylus pairs them)", () => {
	// gen-stylus renders ONE bundle per contrast carrying both the mocha and the
	// latte slot, because a userstyle picks between them by the browser's colour
	// scheme rather than by anything we render. A contrast missing a flavor would
	// leave half of every style resolving to upstream Catppuccin — the exact bug
	// that let light mode go un-nebelung'd for as long as it did.
	const byContrast = {};
	for (const [name, cfg] of Object.entries(VARIANTS)) {
		const contrast = cfg.contrastBoost ? "high" : "normal";
		(byContrast[contrast] ??= new Set()).add(cfg.flavor ?? "mocha");
	}
	for (const [contrast, flavors] of Object.entries(byContrast)) {
		assert.deepEqual(
			[...flavors].sort(),
			["latte", "mocha"],
			`contrast "${contrast}" needs a mocha AND a latte variant`,
		);
	}
});

test("the default variant is unambiguously the plain nebelung one", () => {
	// dist/ is the default variant's root and every other variant nests under it.
	// If `nebelung` ever gained a dir, every consumer path in the family would
	// move at once — the one change this repo must never make silently.
	assert.equal(variantDir("nebelung"), "");
	for (const name of Object.keys(VARIANTS)) {
		if (name !== "nebelung") assert.notEqual(variantDir(name), "", `${name} needs a dist subdir`);
	}
});

// ---------------------------------------------------------------------------
// Palette variants. The high-contrast variant exists to be measurably more
// legible, so it's asserted against WCAG rather than eyeballed — a contrast
// theme that merely *looks* punchier is the kind of thing that ships broken.
// ---------------------------------------------------------------------------

// WCAG 2.x relative luminance + contrast ratio (sRGB, not OKLCH: the standard
// is defined in sRGB and we're checking conformance, not perceptual intent).
const relLuminance = (hex) => {
	const [r, g, b] = hexToRgb(hex).map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastRatio = (a, b) => {
	const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

// Every high-contrast variant, paired with the same-flavor variant it's derived
// from — so adding a flavor adds its contrast assertions automatically instead of
// quietly shipping an unmeasured one.
const CONTRAST_PAIRS = Object.keys(VARIANTS)
	.filter((name) => name.endsWith("-high-contrast"))
	.map((name) => [name, name.replace(/-high-contrast$/, "")]);

test("every high-contrast variant clears WCAG AAA for body text", () => {
	assert.ok(CONTRAST_PAIRS.length > 0, "expected at least one high-contrast variant");
	for (const [hiName] of CONTRAST_PAIRS) {
		const { out } = buildOverrides(VARIANTS[hiName]);
		const ratio = contrastRatio(out.text, out.base);
		assert.ok(
			ratio >= 7,
			`${hiName}: text on base is ${ratio.toFixed(2)}:1, below the 7:1 AAA floor it promises`,
		);
	}
});

test("every high-contrast variant beats the variant it is derived from", () => {
	for (const [hiName, baseName] of CONTRAST_PAIRS) {
		assert.ok(VARIANTS[baseName], `${hiName} has no same-flavor base variant ${baseName}`);
		const base = buildOverrides(VARIANTS[baseName]).out;
		const hi = buildOverrides(VARIANTS[hiName]).out;
		assert.ok(
			contrastRatio(hi.text, hi.base) > contrastRatio(base.text, base.base),
			`${hiName} must beat ${baseName}, the variant it is derived from`,
		);
	}
});

test("boosting contrast does not collapse the neutral ramp", () => {
	// The failure mode that matters: clamping at one end merging two steps,
	// silently costing the theme a level of hierarchy. This is exactly what a
	// naive "same boost for every flavor" does to Latte — it has ~0.04 of OKLCH
	// headroom above `base` where Mocha has ~0.2 below its, so Mocha's 0.35 melts
	// Latte's base/mantle/crust into one white. This test is why the two boosts
	// differ, and it fails if someone "tidies" them into agreement.
	for (const [name, cfg] of Object.entries(VARIANTS)) {
		const { out } = buildOverrides(cfg);
		const ramp = NEUTRALS.map((n) => out[n]);
		assert.equal(
			new Set(ramp).size,
			ramp.length,
			`${name}: neutral ramp has duplicate steps — ${ramp.join(" ")}`,
		);
	}
});

test("every variant keeps its own flavor's accents identical", () => {
	// Contrast is a property of the NEUTRALS. If a contrast variant moved the
	// accents too, it would be a different theme rather than the same theme read
	// more easily. Compared WITHIN a flavor: latte and mocha accents are supposed
	// to differ (different source palettes), and that's the point of §5.1.
	for (const [name, cfg] of Object.entries(VARIANTS)) {
		const flavor = cfg.flavor ?? "mocha";
		const reference = buildOverrides({ ...CONFIG, flavor }).out;
		const { out } = buildOverrides(cfg);
		for (const a of ACCENTS) {
			assert.equal(out[a], reference[a], `${name}: accent ${a} drifted from plain ${flavor}`);
		}
	}
});

// ---------------------------------------------------------------------------
// Light mode. The whole claim of the latte variants is "the same theme in the
// other polarity" — so both halves get asserted: that it really is light, and
// that it really is the same treatment rather than an inverted dark palette.
// ---------------------------------------------------------------------------

test("every source flavor covers exactly the same slots", () => {
	// A flavor missing a slot would render a template with an undefined colour,
	// which whiskers happily emits as empty rather than failing.
	for (const [name, source] of Object.entries(FLAVORS)) {
		assert.deepEqual(
			Object.keys(source).sort(),
			[...NEUTRALS, ...ACCENTS].sort(),
			`${name} does not cover the ramp + accents exactly`,
		);
		for (const [slot, hex] of Object.entries(source)) {
			assert.match(hex, HEX6, `${name}.${slot} -> ${hex} is not 6-digit hex`);
		}
	}
});

test("latte variants are light and mocha variants are dark", () => {
	for (const [name, cfg] of Object.entries(VARIANTS)) {
		const { out } = buildOverrides(cfg);
		const light = relLuminance(out.base) > relLuminance(out.text);
		assert.equal(
			light,
			(cfg.flavor ?? "mocha") === "latte",
			`${name}: base ${out.base} vs text ${out.text} has the wrong polarity`,
		);
	}
});

test("latte gets the same treatment as mocha, not an inversion", () => {
	// The two rules the theme is: neutrals go true grey keeping their lightness,
	// accents keep hue + lightness and only lose chroma. If light mode were
	// implemented by inverting the dark ramp instead of running Latte through the
	// same transform, the lightness check below is what would fail.
	const { out } = buildOverrides(VARIANTS["nebelung-latte"]);
	for (const name of NEUTRALS) {
		const [r, g, b] = hexToRgb(out[name]);
		assert.ok(r === g && g === b, `latte ${name} -> ${out[name]} is not neutral grey`);
		assert.ok(
			near(hexToLch(LATTE[name])[0], hexToLch(out[name])[0], 0.01),
			`latte ${name} lightness drifted from its source`,
		);
	}
	for (const name of ACCENTS) {
		const [L0, C0, h0] = hexToLch(LATTE[name]);
		const [L1, C1, h1] = hexToLch(out[name]);
		assert.ok(near(L0, L1, 0.01), `latte accent ${name} lightness drifted`);
		assert.ok(near(h0, h1, 0.05), `latte accent ${name} hue drifted`);
		assert.ok(near(C1, C0 * CONFIG.accentChromaScale, 0.02), `latte accent ${name} chroma not scaled`);
	}
});

test("latte's default is already legible without the contrast variant", () => {
	// Worth pinning as a property rather than a happy accident: stripping the
	// blue out of Latte lands body text at ~7:1, so plain light mode is usable on
	// its own and `contrast = "high"` is a sharpening rather than a rescue.
	const { out } = buildOverrides(VARIANTS["nebelung-latte"]);
	const ratio = contrastRatio(out.text, out.base);
	assert.ok(ratio >= 7, `plain latte text on base is only ${ratio.toFixed(2)}:1`);
});
