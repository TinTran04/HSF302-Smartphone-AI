import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const manifestUrl = new URL('./images.json', import.meta.url);
const assetRoot = new URL('../../FE/public/images/phones/', import.meta.url);

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,
      (_, hex, decimal) => String.fromCodePoint(parseInt(hex ?? decimal, hex ? 16 : 10)));
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map(([, name, doubleQuoted, singleQuoted, unquoted]) => [name.toLowerCase(), decodeHtml(doubleQuoted ?? singleQuoted ?? unquoted)]));
}

export function inspectPage(html, phone) {
  const pageTitle = decodeHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (pageTitle !== phone.sourceName) throw new Error(`Page model mismatch: ${pageTitle}`);
  const links = [...html.matchAll(/<link\b[^>]+>/gi)].map(([tag]) => attributes(tag));
  if (!links.some(link => link.rel === 'canonical' && link.href === phone.sourceUrl)) {
    throw new Error('Page canonical URL mismatch');
  }
  const metadata = [...html.matchAll(/<meta\b[^>]+>/gi)].map(([tag]) => attributes(tag));
  const imageUrl = metadata.find(meta => meta.property === 'og:image')?.content;
  if (!/^https:\/\/www\.mobiledokan\.co\/wp-content\/uploads\/[\w./-]+\.(?:webp|png|jpe?g)$/i.test(imageUrl ?? '')) {
    throw new Error('Unsupported image URL');
  }
  return { pageTitle, imageUrl };
}

async function download(url, maximumBytes, expectedContentType) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(25_000), redirect: 'error',
    headers: { 'User-Agent': 'smartphone-ai-dataset-image-import/1.0', Accept: expectedContentType },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get('content-type')?.split(';')[0].trim();
  if (!expectedContentType.split(',').includes(contentType)) throw new Error(`Unexpected content type: ${contentType}`);
  if (Number(response.headers.get('content-length')) > maximumBytes) throw new Error('Response too large');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maximumBytes) throw new Error('Response too large');
    chunks.push(chunk);
  }
  return { bytes: Buffer.concat(chunks), contentType };
}

export function imageExtension(bytes, contentType) {
  if (contentType === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (contentType === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (contentType === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  throw new Error('Image signature does not match its content type');
}

async function main() {
  const { products } = JSON.parse(await readFile(new URL('./catalog.json', import.meta.url), 'utf8'));
  const aliases = JSON.parse(await readFile(new URL('./image-source-aliases.json', import.meta.url), 'utf8'));
  const existing = JSON.parse(await readFile(manifestUrl, 'utf8').catch(() => '{"images":[]}'));
  const cached = new Map(existing.images.map(image => [image.sourceUrl, image]));
  const images = [];
  const failures = [];
  await mkdir(assetRoot, { recursive: true });
  let cursor = 0;
  async function worker() {
    while (cursor < products.length) {
      const phone = products[cursor++];
      try {
        const previous = cached.get(phone.sourceUrl);
        if (previous?.sourceName === phone.sourceName) {
          const saved = await readFile(new URL(`../../FE/public${previous.localPath}`, import.meta.url)).catch(() => null);
          if (saved && createHash('sha256').update(saved).digest('hex') === previous.sha256) {
            images.push(previous);
            continue;
          }
        }
        if (!/^https:\/\/www\.mobiledokan\.co\/product\/[a-z0-9-]+\/$/.test(phone.sourceUrl)) throw new Error('Unsupported source URL');
        const alias = aliases.find(alias => alias.sourceUrl === phone.sourceUrl && alias.sourceName === phone.sourceName);
        if (alias) {
          const redirect = await fetch(phone.sourceUrl, { redirect: 'manual', signal: AbortSignal.timeout(25_000) });
          await redirect.body?.cancel();
          if (redirect.status !== 301 || redirect.headers.get('location') !== alias.resolvedPageUrl) throw new Error('Audited source redirect changed');
        }
        const reference = alias ? { sourceUrl: alias.resolvedPageUrl, sourceName: alias.resolvedName } : phone;
        const page = await download(reference.sourceUrl, 2_000_000, 'text/html');
        const source = inspectPage(page.bytes.toString('utf8'), reference);
        if (alias && source.imageUrl !== alias.originalPageImageUrl) throw new Error('Audited source image changed');
        const { bytes, contentType } = await download(source.imageUrl, 5_000_000, 'image/webp,image/png,image/jpeg');
        if (bytes.length < 1000) throw new Error('Image is too small');
        const extension = imageExtension(bytes, contentType);
        const slug = new URL(phone.sourceUrl).pathname.split('/').filter(Boolean).at(-1);
        const localPath = `/images/phones/${slug}.${extension}`;
        await writeFile(new URL(`${slug}.${extension}`, assetRoot), bytes);
        images.push({ sourceUrl: phone.sourceUrl, sourceName: phone.sourceName, ...source, localPath,
          ...(alias ? { resolvedPageUrl: alias.resolvedPageUrl, verification: alias.evidence } : {}),
          retrievedAt: new Date().toISOString().slice(0, 10), contentType, bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex') });
      } catch (error) {
        failures.push({ sourceUrl: phone.sourceUrl, sourceName: phone.sourceName, reason: error.message });
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  images.sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl, 'en'));
  failures.sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl, 'en'));
  await writeFile(manifestUrl, JSON.stringify({
    attribution: 'Product images obtained from the referenced MobileDokan product pages. Original image rights belong to their respective owners.',
    license: 'No separate photo redistribution license was verified. The dataset MIT declaration applies to the specification dataset.',
    images, failures,
  }, null, 2) + '\n');
  console.log(JSON.stringify({ selectedProducts: products.length, downloadedImages: images.length, failures }));
  if (failures.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
