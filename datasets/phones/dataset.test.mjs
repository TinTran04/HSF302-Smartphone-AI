import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const catalogPath = fileURLToPath(new URL('./catalog.json', import.meta.url));
const catalog = () => JSON.parse(readFileSync(catalogPath, 'utf8'));

test('catalog is included and contains a usable smartphone sample', () => {
  assert.ok(existsSync(catalogPath), 'catalog.json must be generated from the source dataset');
  assert.ok(catalog().products.length >= 50);
});

test('catalog keeps source attribution and marks converted prices as illustrative', () => {
  const data = catalog();
  assert.equal(data.source.currency, 'BDT');
  assert.equal(data.source.license, 'MIT');
  assert.equal(data.conversion.illustrative, true);
  assert.equal(data.conversion.targetCurrency, 'VND');
  const urls = new Set();
  for (const phone of data.products) {
    assert.ok(!urls.has(phone.sourceUrl));
    urls.add(phone.sourceUrl);
    assert.match(phone.sourceUrl, /^https:\/\//);
    assert.match(phone.description, /minh họa/);
    assert.equal(phone.price, Math.round(phone.sourcePriceBdt * data.conversion.bdtToVnd / 10_000) * 10_000);
    assert.ok(phone.price > 0);
    assert.match(phone.storage, /^\d+(GB|TB)$/);
    assert.match(phone.specifications.RAM, /^\d+ GB$/);
    for (const [name, value] of Object.entries(phone.specifications)) {
      assert.ok(name.length <= 255 && value.length <= 255);
    }
  }
});

test('raw file matches the recorded checksum', () => {
  const metadata = JSON.parse(readFileSync(new URL('./source.json', import.meta.url), 'utf8'));
  const checksum = createHash('sha256').update(readFileSync(new URL('./raw.csv', import.meta.url))).digest('hex');
  assert.equal(checksum, metadata.rawSha256);
  assert.equal(metadata.rows, 6620);
});

test('SQL imports in one transaction and includes repeat-import protection', () => {
  const sql = readFileSync(new URL('./import.sql', import.meta.url), 'utf8');
  assert.match(sql, /BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /NOT EXISTS/);
  assert.equal(sql.match(/ON COMMIT DROP/g)?.length, 2);
  assert.doesNotMatch(sql, /\b(TRUNCATE|DELETE|UPDATE)\b|DROP\s+(TABLE|SCHEMA|DATABASE)/i);
});
