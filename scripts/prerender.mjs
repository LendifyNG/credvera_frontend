// Writes a ready-made HTML file for every public page after `vite build`, so
// search engines, AI assistants and link previews (WhatsApp, X, LinkedIn) see
// each page's words, title, description and share image without running
// JavaScript. In the browser the app then starts as usual.
//
// Also writes:
//   shell*.html  the bare app for private pages (dashboard, /pay, /c, /s, /verify), never indexed
//   404.html     the not-found page, which Vercel serves with a 404 status
//   sitemap.xml  every public page, from src/lib/seo.ts
//   llms.txt     a plain summary of the site for AI assistants
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const { render, headTags, indexablePaths, lastModified, metaFor, SITE_URL } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
);

const template = await readFile(join(dist, 'index.html'), 'utf8');
const SEO = /<!--seo-->[\s\S]*?<!--\/seo-->/;
if (!SEO.test(template)) throw new Error('index.html is missing the <!--seo--> block');

const page = (meta, html = '') =>
  // Functions, so a '$' in the page's words is never read as a replacement pattern.
  template.replace(SEO, () => headTags(meta)).replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);

async function write(file, contents) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

// The bare app for private pages: no page content, noindex. Gift and payment
// links get their own title, for the preview when someone shares one.
const shell = (title, description) => page({ ...metaFor('/'), title, description, noindex: true, jsonLd: [] });
await write(join(dist, 'shell.html'), shell('Credvera', metaFor('/').description));
await write(join(dist, 'shell-gift.html'), shell('Send a gift | Credvera', 'Send a gift to this celebration with Credvera.'));
await write(join(dist, 'shell-pay.html'), shell('Pay | Credvera', 'Pay this request with Credvera.'));

for (const path of indexablePaths) {
  const html = render(path);
  if (!html.includes('<h1')) console.warn(`prerender: ${path} has no <h1>`);
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  await write(file, page(metaFor(path), html));
}

const missing = '/this-page-does-not-exist';
await write(join(dist, '404.html'), page(metaFor(missing), render(missing)));

const urls = indexablePaths
  .map((p) => {
    const loc = `${SITE_URL}${p === '/' ? '/' : p}`;
    const mod = lastModified[p] ? `<lastmod>${lastModified[p]}</lastmod>` : '';
    return `  <url><loc>${loc}</loc>${mod}</url>`;
  })
  .join('\n');
await write(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

const line = (p) => {
  const m = metaFor(p);
  return `- [${m.title.split(' | ')[0]}](${m.url}): ${m.description}`;
};
const isBiz = (p) => p === '/business' || p.startsWith('/business/');
const home = metaFor('/');
await write(
  join(dist, 'llms.txt'),
  [
    '# Credvera',
    '',
    `> ${home.description}`,
    '',
    'Credvera is a mobile and web app from Credvera Technologies Limited (Lagos, Nigeria) for individuals and businesses in Nigeria.',
    '',
    '## Personal',
    '',
    ...indexablePaths.filter((p) => !isBiz(p)).map(line),
    '',
    '## Business',
    '',
    ...indexablePaths.filter(isBiz).map(line),
    '',
  ].join('\n'),
);

await rm(ssrDir, { recursive: true, force: true });
console.log(`prerender: ${indexablePaths.length} pages, shell.html, 404.html, sitemap.xml, llms.txt`);
