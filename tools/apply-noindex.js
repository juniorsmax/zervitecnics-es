#!/usr/bin/env node
/* Aplica (o quita) el noindex temporal de tools/data/noindex-temporal.json.

   Las páginas de la lista llevan <meta name="robots" content="noindex, follow">:
   siguen en la web y enlazadas, pero Google no las indexa y salen del sitemap
   (generate-sitemap.js excluye las noindex). Una página que se quita de la lista
   recupera el indexado al volver a ejecutar este script.

   Uso: node tools/apply-noindex.js   (después: node tools/generate-sitemap.js) */

const fs = require('fs');
const path = require('path');
const { collectHtmlFiles, relPath } = require('./lib/site-pages');

const REPO = path.join(__dirname, '..');
const { paginas } = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'noindex-temporal.json'), 'utf8'));
const lista = new Set(paginas);
const TAG = '<meta name="robots" content="noindex, follow"><!-- noindex-temporal -->';
const TAG_RE = /\s*<meta name="robots" content="noindex, follow"><!-- noindex-temporal -->/;

let puestas = 0, quitadas = 0;
for (const file of collectHtmlFiles()) {
  const rel = relPath(file);
  let html = fs.readFileSync(file, 'utf8');
  const tiene = TAG_RE.test(html);
  if (lista.has(rel) && !tiene) {
    if (/<meta name="robots"/i.test(html)) { console.warn('✗ ya tiene meta robots propia:', rel); continue; }
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  ${TAG}`);
    fs.writeFileSync(file, html); puestas++;
  } else if (!lista.has(rel) && tiene) {
    fs.writeFileSync(file, html.replace(TAG_RE, '')); quitadas++;
  }
}
for (const p of lista) if (!fs.existsSync(path.join(REPO, p))) console.warn('✗ no existe:', p);
console.log(`noindex puesto en ${puestas} páginas, quitado en ${quitadas}. En la lista: ${lista.size}.`);
