// Convert every supplied Stitch screen to native JSX for design reference.
// The application pages refactor these designs into reusable, stateful components.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';

const root = path.resolve(import.meta.dirname, '..');
const source = path.resolve(
  root,
  '../stitch_smartphone_ai_e_commerce_platform/stitch_smartphone_ai_e_commerce_platform',
);
const targets = {
  trang_ch_smartphone_ai: ['HomeDesign', '/'],
  danh_m_c_i_n_tho_i_smartphone_ai: ['CatalogDesign', '/products'],
  chi_ti_t_s_n_ph_m_iphone_16_pro_max_smartphone_ai: [
    'ProductDetailDesign',
    '/products/iphone-16-pro-max',
  ],
  so_s_nh_i_n_tho_i_smartphone_ai: ['ComparisonDesign', '/compare'],
  dang_ki: ['AuthDesign', '/register'],
  gi_h_ng_c_a_b_n_smartphone_ai: ['CartDesign', '/cart'],
  t_h_ng_cod_smartphone_ai: ['CheckoutDesign', '/checkout'],
  ch_n_ch_ai_smartphone_ai: ['TopicsDesign', '/ai'],
  tr_l_ai_x_c_nh_n_chuy_n_ch_smartphone_ai: ['ChatDesign', '/ai'],
  t_ng_quan_smartphone_ai_admin: ['DashboardDesign', '/admin'],
  qu_n_l_s_n_ph_m_smartphone_ai_admin: ['ProductsAdminDesign', '/admin/products'],
  qu_n_l_n_h_ng_smartphone_ai_admin: ['OrdersAdminDesign', '/admin/orders'],
  kho_ki_n_th_c_ai_smartphone_ai_admin: ['KnowledgeDesign', '/admin/knowledge'],
  c_u_h_nh_ai_smartphone_ai_admin: ['AiSettingsDesign', '/admin/ai-settings'],
};
const props = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  spellcheck: 'spellCheck',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  viewbox: 'viewBox',
  'font-size': 'fontSize',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'clip-path': 'clipPath',
  'font-family': 'fontFamily',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  contenteditable: 'contentEditable',
};
const booleans = new Set([
  'disabled',
  'required',
  'multiple',
  'selected',
  'checked',
  'readOnly',
  'autoFocus',
  'hidden',
  'open',
]);
const voids = new Set([
  'img',
  'input',
  'br',
  'hr',
  'meta',
  'link',
  'area',
  'base',
  'col',
  'embed',
  'param',
  'source',
  'track',
  'wbr',
]);
const assets = {};
const theme = {};
const report = [];
const productImages = {};
await fs.mkdir(path.join(root, 'src/design/stitch'), { recursive: true });
await fs.mkdir(path.join(root, 'src/design/components'), { recursive: true });
await fs.mkdir(path.join(root, 'public/images'), { recursive: true });

function walk(node, fn) {
  fn(node);
  for (const child of node.childNodes || []) walk(child, fn);
}
function textOf(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(textOf).join('');
}
function attr(node, key) {
  return node.attrs?.find((a) => a.name === key)?.value;
}
function imagePath(url) {
  const id = createHash('sha256').update(url).digest('hex').slice(0, 16);
  assets[id] = { url, local: `/images/${id}.webp` };
  return `/images/${id}.webp`;
}
function jsx(node, depth = 0) {
  if (node.nodeName === '#comment') return '';
  if (node.nodeName === '#text')
    return node.value.trim() ? `{${JSON.stringify(node.value.replace(/\s+/g, ' '))}}` : '';
  if (!node.tagName) return (node.childNodes || []).map((n) => jsx(n, depth)).join('\n');
  if (['script', 'style', 'noscript'].includes(node.tagName)) return '';
  const tag = node.tagName;
  const attributes = [];
  for (const a of node.attrs || []) {
    if (/^on/i.test(a.name) || a.name === 'data-active-classes') continue;
    if (tag === 'option' && a.name === 'selected') continue;
    let name = props[a.name] || a.name;
    let value = a.value;
    if (name === 'style') {
      const style = Object.fromEntries(
        value
          .split(';')
          .filter((x) => x.includes(':'))
          .map((x) => {
            const [key, ...rest] = x.split(':');
            return [
              key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
              rest.join(':').trim(),
            ];
          }),
      );
      attributes.push(`style={${JSON.stringify(style)}}`);
      continue;
    }
    if (tag === 'img' && name === 'src' && /^https:/.test(value)) value = imagePath(value);
    if (name === 'checked') name = 'defaultChecked';
    if (name === 'value' && ['input', 'textarea', 'select'].includes(tag)) name = 'defaultValue';
    if (
      ['rows', 'cols', 'maxLength', 'minLength', 'tabIndex', 'colSpan', 'rowSpan'].includes(name)
    ) {
      attributes.push(`${name}={${Number(value)}}`);
      continue;
    }
    if (booleans.has(props[a.name] || a.name)) attributes.push(`${name}={true}`);
    else attributes.push(`${name}={${JSON.stringify(value)}}`);
  }
  if (tag === 'img' && !attr(node, 'alt'))
    attributes.push(
      `alt={${JSON.stringify((attr(node, 'data-alt') || 'SmartPhone AI').slice(0, 160))}}`,
    );
  if (tag === 'button' && !attr(node, 'type')) attributes.push('type="button"');
  if (tag === 'textarea' && attr(node, 'value') === undefined)
    attributes.push(`defaultValue={${JSON.stringify(textOf(node))}}`);
  if (tag === 'select' && attr(node, 'value') === undefined) {
    const selected = [];
    walk(node, (child) => {
      if (child.tagName === 'option' && attr(child, 'selected') !== undefined)
        selected.push(attr(child, 'value') ?? textOf(child));
    });
    if (selected.length)
      attributes.push(
        `defaultValue={${JSON.stringify(attr(node, 'multiple') !== undefined ? selected : selected[0])}}`,
      );
  }
  const indent = '  '.repeat(depth);
  const opening = `${indent}<${tag}${attributes.length ? ' ' + attributes.join(' ') : ''}`;
  if (voids.has(tag) || tag === 'textarea') return `${opening} />`;
  return `${opening}>\n${(node.childNodes || [])
    .map((n) => jsx(n, depth + 1))
    .filter(Boolean)
    .join('\n')}\n${indent}</${tag}>`;
}

for (const [folder, [component, route]] of Object.entries(targets)) {
  const html = await fs.readFile(path.join(source, folder, 'code.html'), 'utf8');
  const doc = parse(html);
  const stats = {
    folder,
    component,
    route,
    bytes: Buffer.byteLength(html),
    headings: [],
    scriptsRemoved: 0,
    inlineHandlersRemoved: 0,
    images: 0,
    controls: [],
  };
  let body;
  walk(doc, (n) => {
    if (n.tagName === 'body') body = n;
    if (/^h[1-4]$/.test(n.tagName || ''))
      stats.headings.push(textOf(n).replace(/\s+/g, ' ').trim());
    if (n.tagName === 'img') stats.images++;
    if (['button', 'input', 'select', 'form'].includes(n.tagName))
      stats.controls.push({
        tag: n.tagName,
        id: attr(n, 'id'),
        type: attr(n, 'type'),
        text: textOf(n).trim().replace(/\s+/g, ' ').slice(0, 160),
      });
    stats.inlineHandlersRemoved += (n.attrs || []).filter((a) => /^on/i.test(a.name)).length;
    if (n.tagName === 'script') {
      stats.scriptsRemoved++;
      if (attr(n, 'id') === 'tailwind-config') {
        const context = { tailwind: {} };
        vm.runInNewContext(textOf(n), context, { timeout: 1000 });
        for (const [key, value] of Object.entries(context.tailwind.config?.theme?.extend || {}))
          theme[key] = { ...theme[key], ...value };
      }
    }
  });
  if (component === 'CatalogDesign') {
    const productNames = {
      'iPhone 16 Pro Max': 'iphone-16-pro-max',
      'Galaxy S24 Ultra': 'galaxy-s24-ultra',
      'iPhone 16 Pro': 'iphone-16-pro',
      'Xiaomi 14 Ultra': 'xiaomi-14-ultra',
      'OPPO Find X7 Ultra': 'oppo-find-x7-ultra',
      'vivo X100 Pro': 'vivo-x100-pro',
    };
    walk(body, (n) => {
      const id = /^h[1-4]$/.test(n.tagName || '') && productNames[textOf(n).trim()];
      if (!id) return;
      let parent = n.parentNode;
      while (parent && parent !== body) {
        const urls = [];
        walk(parent, (x) => {
          if (x.tagName === 'img' && /^https:/.test(attr(x, 'src') || ''))
            urls.push(imagePath(attr(x, 'src')));
        });
        if (urls.length) {
          productImages[id] = [...new Set(urls)];
          break;
        }
        parent = parent.parentNode;
      }
    });
  }
  const output = `// Converted from ${folder}/code.html. Read-only design reference.\n// Inline scripts were replaced by React state in src/pages and src/features.\nexport default function ${component}() {\n  return (\n    <div className=${JSON.stringify(attr(body, 'class') || '')}>\n${body.childNodes
    .map((n) => jsx(n, 3))
    .filter(Boolean)
    .join('\n')}\n    </div>\n  );\n}\n`;
  await fs.writeFile(path.join(root, `src/design/stitch/${component}.tsx`), output);
  // Reuse the original hero composition in the live storefront.
  if (component === 'HomeDesign') {
    let hero;
    walk(body, (n) => {
      if (!hero && n.tagName === 'section') hero = n;
    });
    let converted = jsx(hero, 2).replace(/<a /g, '<Link ').replace(/<\/a>/g, '</Link>');
    converted = converted
      .replace(/data-path=\{"chi-tiet-san-pham"\} href=\{"#"\}/g, 'to="/products"')
      .replace(/data-path=\{"chon-chu-de-ai"\} href=\{"#"\}/g, 'to="/ai"');
    converted = converted
      .replaceAll('RAG 2.0', 'SmartPhone AI')
      .replaceAll('AI Photo Assist', 'Khám phá camera')
      .replaceAll('Chip 3nm mạnh mẽ', 'So sánh hiệu năng')
      .replaceAll('Pin 54 tiếng liên tục', 'Khám phá thông số pin')
      .replaceAll(
        'Khám phá điện thoại mới nhất và tìm chiếc máy phù hợp với bạn cùng trợ lý AI thông minh tích hợp công nghệ RAG độc quyền từ dữ liệu chính hãng.',
        'Khám phá điện thoại và tìm chiếc máy phù hợp với bạn cùng thông tin sản phẩm rõ ràng và trợ lý AI.',
      )
      .replace(
        'text-display-hero text-on-surface',
        'text-display-hero-mobile md:text-display-hero text-on-surface',
      );
    await fs.writeFile(
      path.join(root, 'src/design/components/HomeHero.tsx'),
      `import { Link } from 'react-router-dom';\nexport function HomeHero() { return (\n${converted}\n); }\n`,
    );
  }
  report.push(stats);
}
await fs.writeFile(path.join(root, 'src/design/theme.json'), JSON.stringify(theme, null, 2));
await fs.writeFile(
  path.join(root, 'src/design/product-images.json'),
  JSON.stringify(productImages, null, 2),
);
await fs.writeFile(path.join(root, 'scripts/stitch-assets.json'), JSON.stringify(assets, null, 2));
await fs.mkdir(path.join(root, 'docs'), { recursive: true });
await fs.writeFile(path.join(root, 'docs/stitch-audit.json'), JSON.stringify(report, null, 2));
console.log(
  `Read and converted ${report.length} complete HTML screens (${report.reduce((n, r) => n + r.bytes, 0)} bytes). Found ${Object.keys(assets).length} unique images.`,
);
