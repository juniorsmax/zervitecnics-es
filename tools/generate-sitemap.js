#!/usr/bin/env node
/*
 * Generador de sitemap.xml — escanea el repo, asigna prioridades por patrón
 * y emite el sitemap completo. Re-ejecutable tras añadir/quitar páginas.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const BASE = 'https://zervitecnics.es';
const LASTMOD = new Date().toISOString().slice(0, 10);

// Carpetas a escanear y carpetas/archivos a excluir
const SCAN_ROOTS = ['.', 'aires-acondicionados'];
const SCAN_SUBDIRS = ['categorias', 'marcas', 'capacidades', 'zonas', 'legal'];
const EXCLUDE_FILES = new Set([
  '404.html',
  'gracias.html',
  // legal pages se incluyen pero con baja prioridad
]);

function priorityFor(relUrl) {
  // relUrl: e.g. "/aires-acondicionados/marcas/daikin-barcelona.html" or "/"
  if (relUrl === '/' || relUrl === '/index.html') {
    return { priority: '1.0', changefreq: 'monthly' };
  }
  if (relUrl === '/aires-acondicionados/' || relUrl === '/aires-acondicionados/index.html') {
    return { priority: '0.9', changefreq: 'weekly' };
  }
  if (/\/aires-acondicionados\/(subvenciones|precios)\.html$/.test(relUrl)) {
    return { priority: '0.9', changefreq: 'monthly' };
  }
  if (/\/aires-acondicionados\/categorias\//.test(relUrl)) {
    return { priority: '0.9', changefreq: 'monthly' };
  }
  // Brand hub: marcas/{slug}.html — exactly one segment, no dash inside that's NOT part of recognized brand
  // Distinguimos por presencia o no de "-" y "frigorias"
  const marcaMatch = relUrl.match(/\/aires-acondicionados\/marcas\/([^/]+)\.html$/);
  if (marcaMatch) {
    const file = marcaMatch[1]; // sin .html
    if (/-frigorias$/.test(file)) {
      // daikin-2000-frigorias → marca×capacidad
      return { priority: '0.6', changefreq: 'monthly' };
    }
    if (/-/.test(file)) {
      // daikin-barcelona, mitsubishi-sant-cugat-del-valles → marca×ciudad
      return { priority: '0.5', changefreq: 'monthly' };
    }
    // daikin, lg, samsung → hub de marca
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (/\/aires-acondicionados\/capacidades\//.test(relUrl)) {
    return { priority: '0.5', changefreq: 'monthly' };
  }
  if (/\/aires-acondicionados\/zonas\//.test(relUrl)) {
    return { priority: '0.7', changefreq: 'monthly' };
  }
  if (/\/legal\//.test(relUrl)) {
    return { priority: '0.3', changefreq: 'yearly' };
  }
  return { priority: '0.5', changefreq: 'monthly' };
}

function urlFor(absPath) {
  let rel = path.relative(REPO, absPath).split(path.sep).join('/');
  // index.html → carpeta/
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function collectHtmlFiles() {
  const out = [];

  // Raíz
  for (const f of fs.readdirSync(REPO)) {
    if (!f.endsWith('.html')) continue;
    if (EXCLUDE_FILES.has(f)) continue;
    out.push(path.join(REPO, f));
  }

  // aires-acondicionados/
  const air = path.join(REPO, 'aires-acondicionados');
  for (const f of fs.readdirSync(air)) {
    const p = path.join(air, f);
    const st = fs.statSync(p);
    if (st.isFile() && f.endsWith('.html')) {
      if (!EXCLUDE_FILES.has(f)) out.push(p);
    } else if (st.isDirectory() && SCAN_SUBDIRS.includes(f)) {
      for (const f2 of fs.readdirSync(p)) {
        if (!f2.endsWith('.html')) continue;
        if (EXCLUDE_FILES.has(f2)) continue;
        out.push(path.join(p, f2));
      }
    }
  }

  return out;
}

const files = collectHtmlFiles();
const entries = files
  .map(f => ({ file: f, url: urlFor(f) }))
  .map(e => ({ ...e, ...priorityFor(e.url) }))
  // Orden estable: por URL
  .sort((a, b) => a.url.localeCompare(b.url));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '',
  ...entries.map(e =>
    [
      '  <url>',
      `    <loc>${BASE}${e.url}</loc>`,
      `    <lastmod>${LASTMOD}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      '  </url>'
    ].join('\n')
  ),
  '',
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(REPO, 'sitemap.xml'), xml, 'utf8');

// Resumen por patrón
const summary = entries.reduce((a, e) => {
  const key = (() => {
    if (e.url === '/') return 'root';
    if (/\/categorias\//.test(e.url)) return 'categorias';
    if (/\/marcas\/[^/]+-frigorias\.html$/.test(e.url)) return 'marca×capacidad';
    if (/\/marcas\/[^/]+-[^/]+\.html$/.test(e.url) && !/-frigorias\.html$/.test(e.url)) return 'marca×ciudad';
    if (/\/marcas\/[^/]+\.html$/.test(e.url)) return 'marca hub';
    if (/\/capacidades\//.test(e.url)) return 'capacidad×ciudad';
    if (/\/zonas\//.test(e.url)) return 'zona';
    if (/\/legal\//.test(e.url)) return 'legal';
    return 'otros';
  })();
  a[key] = (a[key] || 0) + 1;
  return a;
}, {});

console.log(`sitemap.xml regenerado con ${entries.length} URLs`);
console.log('Resumen por tipo:');
Object.entries(summary).sort().forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v}`));
