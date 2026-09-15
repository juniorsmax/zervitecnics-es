#!/usr/bin/env node
/**
 * Reescribe meta desc y og:description de las 10 marcas raíz.
 * Idempotente: skip si ya contiene el texto canónico F6.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARCAS = require('./data/marcas.json');

let updated = 0, skipped = 0;

for (const m of MARCAS) {
  const filePath = path.join(ROOT, 'aires-acondicionados/marcas', `${m.slug}.html`);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  const nombreVisible = m.nombre;  // "Daikin", "Mitsubishi Electric", etc.
  const tagline = m.tagline.charAt(0).toLowerCase() + m.tagline.slice(1);  // primera minúscula
  const modelo = m.modeloRecomendado;

  // Meta desc canónica F6 (155-165 chars ideal)
  const metaDesc = `Instalación de aires acondicionados ${nombreVisible} en Barcelona: ${tagline}. Recomendamos la serie ${modelo}. Instaladores certificados. Presupuesto gratis en 24h.`;

  // og:description (más corta)
  const ogDesc = `${nombreVisible} en Barcelona: ${m.tagline}. Recomendamos ${modelo}. Instaladores certificados con parte de trabajo firmado.`;

  // Marker de idempotencia (frase distintiva única F6)
  const marker = `Recomendamos la serie ${modelo}. Instaladores certificados. Presupuesto gratis en 24h.`;
  if (content.includes(marker)) { skipped++; continue; }

  // Reemplaza meta description
  const metaRe = /<meta name="description" content="[^"]*">/;
  content = content.replace(metaRe, `<meta name="description" content="${metaDesc}">`);

  // Reemplaza og:description
  const ogRe = /<meta property="og:description" content="[^"]*">/;
  content = content.replace(ogRe, `<meta property="og:description" content="${ogDesc}">`);

  fs.writeFileSync(filePath, content);
  updated++;
}

console.log(`✓ Meta desc actualizadas: ${updated}`);
console.log(`  Ya canónicas (skip): ${skipped}`);
