import assert from 'node:assert/strict';
import test from 'node:test';

test('image source discovery accepts only the exact referenced product and an uploaded image', async () => {
  const { inspectPage } = await import('./fetch-images.mjs');
  const phone = { sourceName: 'OnePlus N6', sourceUrl: 'https://www.mobiledokan.co/product/oneplus-n6/' };
  const html = `<link rel="canonical" href="${phone.sourceUrl}"><h1 class="aps-main-title">OnePlus N6</h1>
    <meta property="og:image" content="https://www.mobiledokan.co/wp-content/uploads/2026/06/OnePlus-N6.webp">`;
  assert.deepEqual(inspectPage(html, phone), {
    pageTitle: 'OnePlus N6',
    imageUrl: 'https://www.mobiledokan.co/wp-content/uploads/2026/06/OnePlus-N6.webp',
  });
  assert.equal(inspectPage(html.replace('rel="canonical"', 'rel=canonical').replace(`href="${phone.sourceUrl}"`, `href=${phone.sourceUrl} `), phone).pageTitle, 'OnePlus N6');
  assert.throws(() => inspectPage(html.replace('>OnePlus N6<', '>OnePlus N5<'), phone), /model/i);
  assert.throws(() => inspectPage(html.replace('rel="canonical" href="https://www.mobiledokan.co/product/oneplus-n6/"', 'rel="canonical" href="https://www.mobiledokan.co/product/oneplus-n5/"'), phone), /canonical/i);
  assert.throws(() => inspectPage(html.replace('https://www.mobiledokan.co/wp-content/uploads/', 'https://example.com/'), phone), /image URL/i);
});

test('download validation rejects HTML masquerading as an image and mismatched image MIME types', async () => {
  const { imageExtension } = await import('./fetch-images.mjs');
  const webp = Buffer.from('RIFF1234WEBPdata');
  assert.equal(imageExtension(webp, 'image/webp'), 'webp');
  assert.throws(() => imageExtension(Buffer.from('<html>error</html>'), 'image/webp'), /signature/i);
  assert.throws(() => imageExtension(webp, 'image/png'), /signature/i);
});
