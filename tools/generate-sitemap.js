#!/usr/bin/env node
/*
 * Generador de sitemaps — escanea el repo, asigna prioridades por patrón
 * y emite sitemap.xml (todo) + sitemap-guias.xml (guías). Re-ejecutable tras
 * añadir/quitar páginas.
 *
 * - Incluye cualquier .html del sitio (sin listas manuales de carpetas).
 * - Excluye automáticamente las páginas con <meta name="robots" content="noindex…">.
 * - lastmod = fecha del último commit que tocó el archivo (git log). Si el
 *   archivo tiene cambios sin commitear o no está en git, se usa la fecha de hoy.
 *
 * Uso:
 *   node tools/generate-sitemap.js              → escribe sitemap.xml y sitemap-guias.xml en la raíz
 *   node tools/generate-sitemap.js --out <dir>  → escribe en <dir> (para comparar sin tocar los reales)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { REPO, BASE, collectHtmlFiles, relPath, urlFor, isNoindex } = require('./lib/site-pages');

const TODAY = new Date().toISOString().slice(0, 10);

const outArg = process.argv.indexOf('--out');
const OUT_DIR = outArg > -1 ? path.resolve(process.argv[outArg + 1]) : REPO;

// Páginas que van a sitemap-guias.xml en vez de sitemap.xml
const isGuia = url => url.startsWith('/aires-acondicionados/guias/');

function priorityFor(relUrl) {
  // relUrl: e.g. "/aires-acondicionados/marcas/daikin-barcelona.html" or "/"
  if (relUrl === '/' || relUrl === '/index.html') {
    return { priority: '1.0', changefreq: 'monthly' };
  }
  if (relUrl === '/aires-acondicionados/' || relUrl === '/aires-acondicionados/index.html') {
    return { priority: '0.9', changefreq: 'weekly' };
  }
  if (/\/aires-acondicionados\/(ofertas|instalacion-personalizada|mantenimiento)\.html$/.test(relUrl)) {
    return { priority: '0.9', changefreq: 'weekly' };
  }
  if (/\/aires-acondicionados\/(subvenciones|precios)\.html$/.test(relUrl)) {
    return { priority: '0.9', changefreq: 'monthly' };
  }
  if (/\/aires-acondicionados\/categorias\//.test(relUrl)) {
    return { priority: '0.9', changefreq: 'monthly' };
  }
  if (/\/aires-acondicionados\/mantenimiento-(zonas|marcas)\//.test(relUrl)) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (relUrl === '/aires-acondicionados/guias/') {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (isGuia(relUrl)) {
    return { priority: '0.7', changefreq: 'monthly' };
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

// Fecha (AAAA-MM-DD) del último commit de cada archivo, en una sola pasada de git log
function gitLastmodMap() {
  const map = new Map();
  try {
    // En un clon superficial (git clone --depth N) los archivos sin cambios recientes
    // recibirían la fecha del commit más antiguo descargado, no la real.
    const shallow = execFileSync('git', ['-C', REPO, 'rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim();
    if (shallow === 'true') console.warn('Aviso: clon superficial de git; las fechas de archivos sin cambios recientes pueden salir más nuevas de lo real (usa un clon completo: git fetch --unshallow).');

    const log = execFileSync('git', ['-C', REPO, 'log', '--format=@%cs', '--name-only', '--no-renames', '--', '*.html'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    let date = null;
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) date = line.slice(1);
      else if (line && date && !map.has(line)) map.set(line, date); // el primero que aparece es el más reciente
    }
    // Archivos con cambios sin commitear o sin seguimiento → hoy
    const status = execFileSync('git', ['-C', REPO, 'status', '--porcelain', '--', '*.html'], { encoding: 'utf8' });
    for (const line of status.split('\n')) {
      const file = line.slice(3).trim();
      if (file) map.set(file, TODAY);
    }
  } catch (e) {
    console.warn('Aviso: no se pudo leer git log; lastmod = fecha de hoy para todo.', e.message);
  }
  return map;
}

const lastmods = gitLastmodMap();
const excluded = [];
const entries = collectHtmlFiles()
  .filter(f => {
    if (isNoindex(fs.readFileSync(f, 'utf8'))) { excluded.push(urlFor(f)); return false; }
    return true;
  })
  .map(f => {
    const url = urlFor(f);
    return { file: f, url, lastmod: lastmods.get(relPath(f)) || TODAY, ...priorityFor(url) };
  })
  // Orden estable: por URL
  .sort((a, b) => a.url.localeCompare(b.url));

function urlset(list) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    ...list.map(e =>
      [
        '  <url>',
        `    <loc>${BASE}${e.url}</loc>`,
        `    <lastmod>${e.lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        '  </url>'
      ].join('\n')
    ),
    '',
    '</urlset>',
    ''
  ].join('\n');
}

const main = entries.filter(e => !isGuia(e.url));
const guias = entries.filter(e => isGuia(e.url));
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), urlset(main), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'sitemap-guias.xml'), urlset(guias), 'utf8');

// Resumen por patrón
const summary = entries.reduce((a, e) => {
  const key = (() => {
    if (e.url === '/') return 'root';
    if (isGuia(e.url)) return 'guias';
    if (/\/categorias\//.test(e.url)) return 'categorias';
    if (/\/mantenimiento-(zonas|marcas)\//.test(e.url)) return 'mantenimiento geo/marca';
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

const where = OUT_DIR === REPO ? '' : ` en ${OUT_DIR}`;
console.log(`sitemap.xml regenerado con ${main.length} URLs y sitemap-guias.xml con ${guias.length}${where}`);
console.log('Resumen por tipo:');
Object.entries(summary).sort().forEach(([k, v]) => console.log(`  ${k.padEnd(24)} ${v}`));
console.log(`Excluidas por noindex (${excluded.length}): ${excluded.join(', ')}`);
