// Tests for the port metadata. Run with `node --test`.
//
// ports.meta.json is a hand-written file that a consumer (nebelhaus) reads from
// the flake's `ports` output to decide what it can wire on its own. Nothing
// generates it, so these are the guards that keep it honest: it covers exactly
// the ports that get rendered, its stored tiers match the rule that defines
// them, the paths it advertises actually exist in dist/, and docs/ports.md is
// the same data rather than a second copy that drifted.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  INSTALL_KINDS,
  SELECT_KINDS,
  TIERS,
  deriveTier,
  readMeta,
  readConfPorts,
  portOrder,
  renderDoc,
} from "../scripts/gen-ports-doc.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const meta = readMeta();

// vscode and stylus are rendered by their own scripts rather than whiskers, so
// they're deliberately absent from ports.conf (see its trailing comment).
const NON_WHISKERS = ["vscode", "stylus"];

test("metadata covers exactly the rendered ports", () => {
  for (const name of readConfPorts()) {
    assert.ok(meta[name], `${name} is in ports.conf but has no ports.meta.json entry`);
  }
  const conf = readConfPorts();
  for (const name of Object.keys(meta)) {
    if (conf.includes(name)) continue;
    assert.ok(
      NON_WHISKERS.includes(name),
      `${name} has metadata but is rendered by nothing — stale entry?`,
    );
  }
});

test("every entry is well-formed", () => {
  for (const [name, p] of Object.entries(meta)) {
    for (const field of ["title", "path", "install", "select", "tier", "howto"]) {
      assert.equal(typeof p[field], "string", `${name}.${field} must be a string`);
      assert.ok(p[field].length, `${name}.${field} must not be empty`);
    }
    assert.ok("dest" in p, `${name} must declare dest (null when there is no fixed one)`);
    assert.ok(
      p.dest === null || typeof p.dest === "string",
      `${name}.dest must be a string or null`,
    );
    assert.ok(INSTALL_KINDS.includes(p.install), `${name}.install: ${p.install}`);
    assert.ok(SELECT_KINDS.includes(p.select), `${name}.select: ${p.select}`);
    assert.ok(TIERS.includes(p.tier), `${name}.tier: ${p.tier}`);
    if (p.requires !== undefined) {
      assert.ok(Array.isArray(p.requires), `${name}.requires must be an array`);
    }
  }
});

// The flake reads `tier` verbatim so it doesn't have to reimplement the rule in
// Nix. That's only safe while the stored value agrees with the rule.
test("stored tier matches the rule that defines it", () => {
  for (const [name, p] of Object.entries(meta)) {
    assert.equal(p.tier, deriveTier(p), `${name} tier disagrees with select/install`);
  }
});

test("a select of gui is the only thing that makes a port manual", () => {
  for (const [name, p] of Object.entries(meta)) {
    assert.equal(p.tier === "manual", p.select === "gui", name);
  }
});

// A port that advertises an output path nobody renders is worse than no
// metadata — a consumer would build a broken symlink from it. Placeholder paths
// (accent matrices, brace expansions) can't be checked this way and are skipped.
test("advertised output paths exist in dist/", () => {
  const skipped = [];
  for (const [name, p] of Object.entries(meta)) {
    if (/[<>{}]/.test(p.path)) {
      skipped.push(name);
      continue;
    }
    assert.ok(
      existsSync(join(root, "dist", p.path)),
      `${name}: dist/${p.path} does not exist`,
    );
  }
  // Every accent-matrix port renders under a directory we can still check: trim
  // the path back to the last slash before the placeholder and assert that
  // directory exists and rendered something.
  for (const name of skipped) {
    const dir = meta[name].path.split(/[<>{]/)[0].replace(/[^/]*$/, "");
    assert.ok(existsSync(join(root, "dist", dir)), `${name}: dist/${dir} does not exist`);
    assert.ok(readdirSync(join(root, "dist", dir)).length, `${name}: dist/${dir} is empty`);
  }
});

test("docs/ports.md is generated from the metadata, not maintained beside it", () => {
  const { doc, next } = renderDoc();
  assert.equal(next, doc, "docs/ports.md is stale — run `node scripts/gen-ports-doc.mjs`");
});

test("the doc table lists every port once, in ports.conf order", () => {
  const order = portOrder(meta);
  assert.equal(order.length, Object.keys(meta).length);
  assert.equal(new Set(order).size, order.length);
  assert.deepEqual(order.slice(-NON_WHISKERS.length), NON_WHISKERS);
});
