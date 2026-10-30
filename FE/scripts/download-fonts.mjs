import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const dest = path.resolve(import.meta.dirname, '../public/fonts');
await fs.mkdir(dest, { recursive: true });
const response = await fetch(
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght@400&display=swap',
  {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(20000),
  },
);
if (!response.ok) throw new Error(`Font CSS HTTP ${response.status}`);
let css = await response.text();
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
for (const url of urls) {
  const name = `${createHash('sha256').update(url).digest('hex').slice(0, 16)}.${url.endsWith('.woff2') ? 'woff2' : 'ttf'}`;
  const result = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!result.ok) throw new Error(`Font download HTTP ${result.status}`);
  await fs.writeFile(path.join(dest, name), Buffer.from(await result.arrayBuffer()));
  css = css.replaceAll(url, `/fonts/${name}`);
}
await fs.writeFile(path.join(dest, 'fonts.css'), css);
console.log(`Saved ${urls.length} font files locally, including Vietnamese character subsets.`);
