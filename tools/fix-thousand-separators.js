#!/usr/bin/env node
/* Corrige los precios de 4-5 dígitos que quedaron sin separador de millares
   tras apply-iva-format.js (Node sin locales españoles).
   Uso puntual: se puede borrar tras el commit. */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'aires-acondicionados');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function fmtEur(n) {
  // Formato español: 1234 -> 1.234, 12345 -> 12.345.
  const s = String(n);
  if (s.length <= 3) return s;
  return s.slice(0, -3) + '.' + s.slice(-3);
}

const files = walk(root);
let cardCount = 0, tableCount = 0, touched = 0;

for (const p of files) {
  const orig = fs.readFileSync(p, 'utf8');
  let out = orig;

  // 1) Tarjetas: <sup>€</sup>NNNN<span class="iva-suffix"> → añadir punto.
  out = out.replace(
    /<sup>€<\/sup>(\d{4,5})(<span class="iva-suffix">)/g,
    (m, n, tail) => { cardCount++; return `<sup>€</sup>${fmtEur(parseInt(n,10))}${tail}`; }
  );

  // 2) Tablas: Desde NNNN €<span class="iva-suffix"> → añadir punto.
  out = out.replace(
    /Desde (\d{4,5}) €(<span class="iva-suffix">)/g,
    (m, n, tail) => { tableCount++; return `Desde ${fmtEur(parseInt(n,10))} €${tail}`; }
  );

  if (out !== orig) {
    fs.writeFileSync(p, out);
    touched++;
  }
}

console.log(`Archivos modificados: ${touched}`);
console.log(`Tarjetas corregidas:  ${cardCount}`);
console.log(`Celdas corregidas:    ${tableCount}`);
