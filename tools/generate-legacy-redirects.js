#!/usr/bin/env node
/*
 * Reemplaza cada HTML en /pages/ por un stub de redirect SEO-friendly
 * (canonical + meta refresh + noindex + JS replace) hacia su equivalente
 * en /aires-acondicionados/. GitHub Pages no soporta 301 reales; este patrón
 * es el que Google trata como equivalente a 301 cuando hay canonical consistente.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const LEGACY_DIR = path.join(REPO, 'pages');
const BASE = 'https://zervitecnics.es';

// Mapa: nombre de archivo legacy → ruta nueva (sin barra inicial)
const MAP = {
  // Legales
  'aviso-legal.html': 'aires-acondicionados/legal/aviso-legal.html',
  'cookies.html':     'aires-acondicionados/legal/cookies.html',
  'privacidad.html':  'aires-acondicionados/legal/privacidad.html',

  // Categorías / servicios
  'conductos.html':     'aires-acondicionados/categorias/conductos.html',
  'dicore.html':        'aires-acondicionados/categorias/dicore.html',
  'marca-blanca.html':  'aires-acondicionados/categorias/marca-blanca.html',
  'multisplit.html':    'aires-acondicionados/categorias/multisplit.html',
  'split.html':         'aires-acondicionados/categorias/split.html',

  // Marcas
  'daikin.html':     'aires-acondicionados/marcas/daikin.html',
  'fujitsu.html':    'aires-acondicionados/marcas/fujitsu.html',
  'haier.html':      'aires-acondicionados/marcas/haier.html',
  'hisense.html':    'aires-acondicionados/marcas/hisense.html',
  'lg.html':         'aires-acondicionados/marcas/lg.html',
  'midea.html':      'aires-acondicionados/marcas/midea.html',
  'mitsubishi.html': 'aires-acondicionados/marcas/mitsubishi.html',
  'panasonic.html':  'aires-acondicionados/marcas/panasonic.html',
  'samsung.html':    'aires-acondicionados/marcas/samsung.html',
  'toshiba.html':    'aires-acondicionados/marcas/toshiba.html',

  // Zonas (barrios Barcelona + área metropolitana)
  'badalona.html':      'aires-acondicionados/zonas/badalona.html',
  'castelldefels.html': 'aires-acondicionados/zonas/castelldefels.html',
  'cornella.html':      'aires-acondicionados/zonas/cornella.html',
  'eixample.html':      'aires-acondicionados/zonas/eixample.html',
  'gracia.html':        'aires-acondicionados/zonas/gracia.html',
  'hospitalet.html':    'aires-acondicionados/zonas/hospitalet.html',
  'les-corts.html':     'aires-acondicionados/zonas/les-corts.html',
  'nou-barris.html':    'aires-acondicionados/zonas/nou-barris.html',
  'sabadell.html':      'aires-acondicionados/zonas/sabadell.html',
  'sant-andreu.html':   'aires-acondicionados/zonas/sant-andreu.html',
  'sant-cugat.html':    'aires-acondicionados/zonas/sant-cugat.html',
  'sant-marti.html':    'aires-acondicionados/zonas/sant-marti.html',
  'sants.html':         'aires-acondicionados/zonas/sants.html',
  'sarria.html':        'aires-acondicionados/zonas/sarria.html',
  'terrassa.html':      'aires-acondicionados/zonas/terrassa.html',

  // Sueltas
  'precios.html':       'aires-acondicionados/precios.html',
  'subvenciones.html':  'aires-acondicionados/subvenciones.html',
};

function stubHtml(newPath) {
  const url = '/' + newPath;
  const absUrl = BASE + url;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Redirigiendo… | Zervitecnics Barcelona</title>
  <link rel="canonical" href="${absUrl}">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${url}">
  <script>window.location.replace(${JSON.stringify(url)});</script>
  <style>body{font-family:system-ui,sans-serif;max-width:560px;margin:80px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}</style>
</head>
<body>
  <p>Esta página se ha movido. Si no se redirige automáticamente, <a href="${url}">haz click aquí</a>.</p>
</body>
</html>
`;
}

// Sanity check: todas las URLs destino tienen que existir
const missing = [];
for (const [legacy, target] of Object.entries(MAP)) {
  const abs = path.join(REPO, target);
  if (!fs.existsSync(abs)) missing.push({ legacy, target });
}
if (missing.length) {
  console.error('ERROR: destinos no encontrados:');
  missing.forEach(m => console.error(`  ${m.legacy} → ${m.target}`));
  process.exit(1);
}

// Sanity check: no quedan legacy sin mapear
const onDisk = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.html'));
const unmapped = onDisk.filter(f => !MAP[f]);
if (unmapped.length) {
  console.error('ERROR: páginas legacy sin mapeo:', unmapped);
  process.exit(1);
}

// Reescribir
let count = 0;
for (const [legacy, target] of Object.entries(MAP)) {
  const abs = path.join(LEGACY_DIR, legacy);
  fs.writeFileSync(abs, stubHtml(target), 'utf8');
  count++;
}

console.log(`✓ ${count} páginas legacy reemplazadas por stubs de redirect`);
console.log(`  Patrón: /pages/X.html → ${BASE}/aires-acondicionados/.../X.html`);
