#!/usr/bin/env node
/*
 * Comprobación de sitemaps y robots.txt (SOLO LECTURA). Sale con código 1 si hay errores.
 *
 * Errores:
 *  - robots.txt sin líneas "Sitemap:" o que apuntan a un archivo que no existe
 *  - páginas indexables (sin noindex) que no están en ningún sitemap
 *  - URLs de los sitemaps que no corresponden a ningún archivo
 *  - páginas con noindex dentro de un sitemap
 *  - URLs repetidas (en el mismo sitemap o en dos distintos) o fuera de https://zervitecnics.es
 * Avisos (no hacen fallar):
 *  - lastmod con formato raro o con fecha futura
 *  - página indexable cuyo canonical apunta a otra URL
 *
 * Uso:
 *   node tools/check-seo.js                 → revisa robots.txt y los sitemaps de la raíz
 *   node tools/check-seo.js --dir <carpeta> → revisa los sitemaps de esa carpeta (p. ej. una prueba
 *                                             con generate-sitemap.js --out), contra las páginas del repo
 *   npm --prefix tools run check:seo
 */
const fs = require('fs');
const path = require('path');
const { REPO, BASE, collectHtmlFiles, relPath, urlFor, isNoindex } = require('./lib/site-pages');

const dirArg = process.argv.indexOf('--dir');
const SITEMAP_DIR = dirArg > -1 ? path.resolve(process.argv[dirArg + 1]) : REPO;

const errors = [];
const warnings = [];
const TODAY = new Date().toISOString().slice(0, 10);

/* ── robots.txt → lista de sitemaps ── */
const robots = fs.readFileSync(path.join(REPO, 'robots.txt'), 'utf8');
const sitemapUrls = robots.split('\n').map(l => l.match(/^\s*Sitemap:\s*(\S+)/i)).filter(Boolean).map(m => m[1]);
if (!sitemapUrls.length) errors.push('robots.txt no tiene ninguna línea "Sitemap:"');

function localFileFor(url) {
  if (!url.startsWith(BASE + '/')) return null;
  return path.join(SITEMAP_DIR, url.slice(BASE.length + 1));
}

/* ── Leer sitemaps (siguiendo índices de sitemaps si los hubiera) ── */
const inSitemap = new Map(); // url relativa → archivo de sitemap
function readSitemap(url, depth = 0) {
  const file = localFileFor(url);
  if (!file) return errors.push(`Sitemap fuera del dominio: ${url}`);
  if (!fs.existsSync(file)) return errors.push(`El sitemap ${url} no existe (${path.relative(REPO, file)})`);
  const xml = fs.readFileSync(file, 'utf8');
  const name = path.basename(file);
  if (/<sitemapindex\b/.test(xml)) {
    if (depth > 0) return errors.push(`${name}: un índice de sitemaps no puede contener otro índice`);
    for (const m of xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>[\s\S]*?<\/sitemap>/g)) readSitemap(m[1], depth + 1);
    return;
  }
  if (!/<urlset\b/.test(xml)) return errors.push(`${name}: no es un <urlset> ni un <sitemapindex>`);
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  if (blocks.length > 50000) errors.push(`${name}: ${blocks.length} URLs (máximo 50.000 por sitemap)`);
  for (const b of blocks) {
    const loc = (b.match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
    if (!loc) { errors.push(`${name}: hay un <url> sin <loc>`); continue; }
    if (!loc.startsWith(BASE + '/')) { errors.push(`${name}: URL fuera de ${BASE}: ${loc}`); continue; }
    const rel = loc.slice(BASE.length);
    if (inSitemap.has(rel)) errors.push(`URL repetida: ${rel} (en ${inSitemap.get(rel)} y ${name})`);
    else inSitemap.set(rel, name);
    const lastmod = (b.match(/<lastmod>([^<]*)<\/lastmod>/) || [])[1];
    if (lastmod && !/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2}))?$/.test(lastmod)) warnings.push(`${name}: lastmod con formato raro en ${rel}: ${lastmod}`);
    else if (lastmod && lastmod.slice(0, 10) > TODAY) warnings.push(`${name}: lastmod en el futuro en ${rel}: ${lastmod}`);
  }
}
sitemapUrls.forEach(u => readSitemap(u));

/* ── Cruzar con las páginas reales ── */
const pages = new Map(); // url relativa → { rel, noindex, canonical }
for (const f of collectHtmlFiles()) {
  const html = fs.readFileSync(f, 'utf8');
  const can = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  const canonical = can ? (can.match(/href=["']([^"']+)["']/i) || [])[1] : null;
  pages.set(urlFor(f), { rel: relPath(f), noindex: isNoindex(html), canonical });
}

for (const [url, p] of pages) {
  if (p.noindex) {
    if (inSitemap.has(url)) errors.push(`Página con noindex dentro de ${inSitemap.get(url)}: ${p.rel}`);
    continue;
  }
  if (!inSitemap.has(url)) errors.push(`Página indexable fuera de los sitemaps: ${p.rel}`);
  if (p.canonical && p.canonical !== BASE + url) warnings.push(`Canonical distinto de la propia URL en ${p.rel}: ${p.canonical}`);
}
for (const [url, name] of inSitemap) {
  if (!pages.has(url)) errors.push(`URL de ${name} sin archivo en el repo: ${url}`);
}

/* ── Resultado ── */
const indexables = [...pages.values()].filter(p => !p.noindex).length;
console.log(`robots.txt → ${sitemapUrls.length} sitemap(s): ${sitemapUrls.map(u => u.replace(BASE, '')).join(', ')}`);
console.log(`Páginas HTML: ${pages.size} (indexables: ${indexables}, noindex: ${pages.size - indexables}) · URLs en sitemaps: ${inSitemap.size}`);
if (warnings.length) {
  console.log(`\nAvisos (${warnings.length}):`);
  warnings.slice(0, 50).forEach(w => console.log('  ⚠ ' + w));
  if (warnings.length > 50) console.log(`  … y ${warnings.length - 50} más`);
}
if (errors.length) {
  console.log(`\nErrores (${errors.length}):`);
  errors.slice(0, 100).forEach(e => console.log('  ✗ ' + e));
  if (errors.length > 100) console.log(`  … y ${errors.length - 100} más`);
  process.exit(1);
}
console.log('\n✓ Sin errores');
