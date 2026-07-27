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
	NEUTRALS,
	ACCENTS,
	VARIANTS,
	CONFIG,
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

test("high-contrast variant clears WCAG AAA for body text", () => {
	const { out } = buildOverrides(VARIANTS["nebelung-high-contrast"]);
	const ratio = contrastRatio(out.text, out.base);
	assert.ok(
		ratio >= 7,
		`text on base is ${ratio.toFixed(2)}:1, below the 7:1 AAA floor this variant promises`,
	);
});

test("high-contrast is actually higher contrast than the default", () => {
	const base = buildOverrides(VARIANTS.nebelung).out;
	const hi = buildOverrides(VARIANTS["nebelung-high-contrast"]).out;
	assert.ok(
		contrastRatio(hi.text, hi.base) > contrastRatio(base.text, base.base),
		"the high-contrast variant must beat the default it is derived from",
	);
});

test("boosting contrast does not collapse the neutral ramp", () => {
	// The failure mode that matters: clamping at the light end merging `text`
	// into `subtext1`, silently costing the theme a step of hierarchy.
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

test("every variant keeps the accents identical", () => {
	// Contrast is a property of the NEUTRALS. If a variant moved the accents too,
	// it would be a different theme rather than the same theme, read more easily.
	const base = buildOverrides(VARIANTS.nebelung).out;
	for (const [name, cfg] of Object.entries(VARIANTS)) {
		const { out } = buildOverrides(cfg);
		for (const a of ACCENTS) {
			assert.equal(out[a], base[a], `${name}: accent ${a} drifted from the default palette`);
		}
	}
});
