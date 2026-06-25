#!/usr/bin/env node
/*
 * Recorre todos los HTML y reemplaza referencias <img src="...X.jpg|png"> a
 * imágenes que tengan versión WebP por:
 *   <picture><source srcset="...X.webp" type="image/webp"><img src="...X.jpg" ...></picture>
 *
 * Solo afecta a las imágenes para las que existe el .webp en disco.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const IMG_DIR = path.join(REPO, 'aires-acondicionados', 'img');

// Mapa nombreSinExt -> { ext_original, has_webp }
const webpAvailable = new Set();
fs.readdirSync(IMG_DIR).forEach(f => {
  if (/\.webp$/i.test(f)) webpAvailable.add(f.replace(/\.webp$/i, ''));
});
console.log(`WebP disponibles: ${Array.from(webpAvailable).join(', ')}`);

function findHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtmlFiles(full, acc);
    else if (/\.html?$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

const htmlFiles = findHtmlFiles(REPO);
console.log(`HTML a procesar: ${htmlFiles.length}`);

const IMG_RE = /<img\s+[^>]*?src="([^"]+\/img\/([^"\/]+)\.(jpe?g|png))"[^>]*?>/gi;

let totalReplacements = 0;
let filesChanged = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  let replacedInFile = 0;
  html = html.replace(IMG_RE, (match, fullSrc, baseName, ext) => {
    if (!webpAvailable.has(baseName)) return match;
    if (match.includes('</picture>')) return match;
    const webpSrc = fullSrc.replace(/\.(jpe?g|png)$/i, '.webp');
    replacedInFile++;
    return `<picture><source srcset="${webpSrc}" type="image/webp">${match}</picture>`;
  });
  if (replacedInFile > 0) {
    fs.writeFileSync(file, html, 'utf8');
    filesChanged++;
    totalReplacements += replacedInFile;
    console.log(`  ${path.relative(REPO, file)}: ${replacedInFile} reemplazo(s)`);
  }
}

console.log(`\nTotal: ${totalReplacements} reemplazos en ${filesChanged} archivos.`);
