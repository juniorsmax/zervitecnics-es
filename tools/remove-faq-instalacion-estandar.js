#!/usr/bin/env node
/* Elimina la FAQ "instalación estándar 350€/450€ + metro adicional 50€/65€"
   de todas las páginas marcas/[marca]-[ciudad].html — tanto el bloque JSON-LD
   como el bloque HTML visible. Uso puntual: se puede borrar tras el commit. */

const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '..', 'aires-acondicionados', 'marcas'),
  path.join(__dirname, '..', 'aires-acondicionados', 'zonas'),
];
const files = dirs.flatMap(d =>
  fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => path.join(d, f))
);

// Tres variantes del marker (marca-ciudad, marca raíz, zonas).
const MARKERS = [
  'La instalación estándar tiene precio fijo según la potencia',
  'La instalación estándar de un equipo',
  'La instalación estándar en <strong>',
];

let touched = 0;
const failures = [];

for (const p of files) {
  const file = path.basename(p);
  const original = fs.readFileSync(p, 'utf8');
  if (!MARKERS.some(m => original.includes(m))) continue;

  let out = original;

  // 1) Quitar el objeto Question dentro del JSON-LD.
  //    Encontrar el "{" que abre el bloque cuyo text contiene el MARKER,
  //    y su "}" de cierre. También quitar la coma anterior si es el último.
  const questionRegex =
    /,\s*\{\s*"@type":\s*"Question",\s*"name":\s*"¿Cuánto cuesta[^"]*",\s*"acceptedAnswer":\s*\{\s*"@type":\s*"Answer",\s*"text":\s*"La instalación estándar (tiene precio fijo|de un equipo|en <strong>)[\s\S]*?"\s*\}\s*\}/;
  const beforeJSON = out;
  out = out.replace(questionRegex, '');
  const jsonOk = out !== beforeJSON;

  // 2) Quitar el <div class="faq-item"> HTML.
  const faqItemRegex =
    /\s*<div class="faq-item">\s*<div class="faq-question"[^>]*>¿Cuánto cuesta[^<]*<div class="faq-icon">[\s\S]*?<\/div><\/div>\s*<div class="faq-answer"><div class="faq-answer-inner">La instalación estándar (tiene precio fijo|de un equipo|en <strong>)[\s\S]*?<\/div><\/div>\s*<\/div>/;
  const beforeHTML = out;
  out = out.replace(faqItemRegex, '');
  const htmlOk = out !== beforeHTML;

  if (!jsonOk || !htmlOk) {
    failures.push({ file, jsonOk, htmlOk });
    continue;
  }

  fs.writeFileSync(p, out);
  touched++;
}

console.log(`Archivos modificados: ${touched}`);
if (failures.length) {
  console.log(`Fallos (${failures.length}):`);
  failures.slice(0, 10).forEach(f => console.log('  ', f));
}
