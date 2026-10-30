import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const assets = Object.values(
  JSON.parse(await fs.readFile(path.join(root, 'scripts/stitch-assets.json'), 'utf8')),
);
let succeeded = 0,
  failed = 0;
// Modest concurrency: keep the original Google-hosted images, do not replace the design.
const queue = [...assets];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const asset = queue.shift();
      const file = path.join(root, 'public', asset.local);
      try {
        try {
          if ((await fs.stat(file)).size > 500) {
            succeeded++;
            continue;
          }
        } catch {}
        const response = await fetch(asset.url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
          throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(file, buffer);
        succeeded++;
      } catch {
        failed++;
      }
    }
  }),
);
console.log(
  `Images available locally: ${succeeded}/${assets.length}; unavailable: ${failed}. React images use a local SVG fallback.`,
);
if (failed) process.exitCode = 1;
