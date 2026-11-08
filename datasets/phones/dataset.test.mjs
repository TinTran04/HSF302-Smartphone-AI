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

test('catalog uses checked-in exact-model images with recorded provenance', () => {
  const manifestUrl = new URL('./images.json', import.meta.url);
  assert.ok(existsSync(manifestUrl), 'image provenance must be included');
  const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'));
  const aliases = JSON.parse(readFileSync(new URL('./image-source-aliases.json', import.meta.url), 'utf8'));
  const sources = new Map(manifest.images.map(image => [image.sourceUrl, image]));
  assert.equal(sources.size, manifest.images.length);
  for (const phone of catalog().products) {
    const image = sources.get(phone.sourceUrl);
    if (!image) {
      assert.equal(phone.image, '/images/placeholder.svg', `unverified image for ${phone.sourceName}`);
      continue;
    }
    assert.equal(image.sourceName, phone.sourceName);
    const alias = aliases.find(alias => alias.sourceUrl === phone.sourceUrl);
    assert.equal(image.pageTitle, alias?.resolvedName ?? phone.sourceName);
    if (alias) {
      assert.equal(image.resolvedPageUrl, alias.resolvedPageUrl);
      assert.equal(image.imageUrl, alias.originalPageImageUrl);
    }
    assert.equal(image.localPath, phone.image);
    assert.match(phone.image, /^\/images\/phones\/[a-z0-9-]+\.(webp|png|jpg)$/);
    const bytes = readFileSync(new URL(`../../FE/public${phone.image}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.ok(bytes.length > 1000 && bytes.length <= 5_000_000);
    assert.ok(
      (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') ||
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255),
      `invalid image bytes for ${phone.sourceName}`,
    );
  }
});

test('SQL imports in one transaction and includes repeat-import protection', () => {
  const sql = readFileSync(new URL('./import.sql', import.meta.url), 'utf8');
  assert.match(sql, /BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /NOT EXISTS/);
  assert.equal(sql.match(/ON COMMIT DROP/g)?.length, 3);
  assert.doesNotMatch(sql, /\b(TRUNCATE|DELETE)\b|DROP\s+(TABLE|SCHEMA|DATABASE)/i);
});
