/*
 * Utilidades compartidas por generate-sitemap.js y check-seo.js:
 * qué archivos HTML forman el sitio, qué URL tiene cada uno y si es indexable.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const BASE = 'https://zervitecnics.es';

// Carpetas que no son parte del sitio publicado
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tools', 'docs']);

function collectHtmlFiles(dir = REPO, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(p, out);
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Ruta relativa al repo con "/" ("aires-acondicionados/zonas/gracia.html")
function relPath(absPath) {
  return path.relative(REPO, absPath).split(path.sep).join('/');
}

// URL pública relativa: index.html → carpeta/
function urlFor(absPath) {
  const rel = relPath(absPath);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

// <meta name="robots" content="noindex…"> (en cualquier orden de atributos)
function isNoindex(html) {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  return metas.some(tag => /\bname\s*=\s*["']robots["']/i.test(tag) && /\bcontent\s*=\s*["'][^"']*noindex/i.test(tag));
}

module.exports = { REPO, BASE, collectHtmlFiles, relPath, urlFor, isNoindex };
