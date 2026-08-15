import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const palette = JSON.parse(
  await readFile(new URL('../palette/nebelung.hex.json', import.meta.url), 'utf8'),
);
const theme = await readFile(
  new URL('../dist/obsidian/Nebelung/theme.css', import.meta.url),
  'utf8',
);
const manifest = JSON.parse(
  await readFile(
    new URL('../dist/obsidian/Nebelung/manifest.json', import.meta.url),
    'utf8',
  ),
);

test('Obsidian output is an installable Nebelung theme', () => {
  assert.equal(manifest.name, 'Nebelung');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.match(manifest.minAppVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.author, 'hausfold');
  assert.match(theme, /body\.theme-dark,\s*body\.theme-light/);
});

test('Obsidian theme exposes and uses the complete Nebelung palette', () => {
  for (const [name, hex] of Object.entries(palette)) {
    assert.match(
      theme,
      new RegExp(`--neb-${name.replace(/([a-z])([0-9])/g, '$1-$2')}: #${hex}`, 'i'),
      `${name} should be exposed as a theme token`,
    );
    assert.match(theme, new RegExp(`#${hex}`, 'i'), `${name} should be used`);
  }

  assert.match(theme, new RegExp(`--titlebar-background: #${palette.mantle}`, 'i'));
  assert.match(theme, new RegExp(`--ribbon-background: #${palette.mantle}`, 'i'));
  assert.match(theme, new RegExp(`--tab-container-background: #${palette.mantle}`, 'i'));
  assert.match(theme, new RegExp(`--background-primary: #${palette.base}`, 'i'));
});

test('Obsidian chrome is flat and free of gradient or blur effects', () => {
  assert.doesNotMatch(theme, /(?:linear|radial|conic)-gradient\(/i);
  assert.doesNotMatch(theme, /backdrop-filter\s*:/i);
  assert.match(theme, /--background-modifier-border:\s*transparent/i);
  assert.match(theme, /--divider-color:\s*transparent/i);
  assert.match(theme, /--status-bar-border-color:\s*transparent/i);
});
