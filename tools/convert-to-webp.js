#!/usr/bin/env node
/*
 * Convierte todas las imágenes JPG/PNG de aires-acondicionados/img a WebP.
 * Mantiene los originales (no se borran). Calidad 85 (sin pérdida visible).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.resolve(__dirname, '..', 'aires-acondicionados', 'img');
const QUALITY = 85;

async function main() {
  const files = fs.readdirSync(IMG_DIR);
  const targets = files.filter(f => /\.(jpe?g|png)$/i.test(f));
  console.log(`Convirtiendo ${targets.length} imágenes a WebP (q=${QUALITY})...`);

  let totalIn = 0, totalOut = 0;
  for (const file of targets) {
    const src = path.join(IMG_DIR, file);
    const dst = path.join(IMG_DIR, file.replace(/\.(jpe?g|png)$/i, '.webp'));
    const inStat = fs.statSync(src);
    await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(dst);
    const outStat = fs.statSync(dst);
    totalIn += inStat.size;
    totalOut += outStat.size;
    const pct = ((1 - outStat.size / inStat.size) * 100).toFixed(0);
    console.log(`  ${file} (${(inStat.size/1024).toFixed(0)}K) -> ${path.basename(dst)} (${(outStat.size/1024).toFixed(0)}K)  -${pct}%`);
  }
  const totalPct = ((1 - totalOut / totalIn) * 100).toFixed(0);
  console.log(`Total: ${(totalIn/1024).toFixed(0)}K -> ${(totalOut/1024).toFixed(0)}K  ahorro ${totalPct}%`);
}

main().catch(err => { console.error(err); process.exit(1); });
