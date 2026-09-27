#!/usr/bin/env node
/* Recalcula precios "IVA incluido" a base sin IVA (÷ 1,21, redondeo al euro)
   y añade sufijo "+IVA" en las tarjetas de precio y subtítulos.
   Uso puntual: se puede borrar tras el commit. */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'aires-acondicionados');

// Archivos y carpetas a EXCLUIR (ya usan +IVA o son intocables en esta sesión).
const EXCLUDES = new Set([
  path.join(root, 'ofertas.html'),
  path.join(root, 'mantenimiento.html'),
  path.join(root, 'instalacion-personalizada.html'),
]);
const EXCLUDE_DIRS = [
  path.join(root, 'mantenimiento-marcas'),
  path.join(root, 'mantenimiento-zonas'),
];

function isExcluded(p) {
  if (EXCLUDES.has(p)) return true;
  return EXCLUDE_DIRS.some(d => p.startsWith(d + path.sep));
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (!isExcluded(full)) out.push(full);
    }
  }
  return out;
}

// Convierte X.XXX o XXXX a número entero.
function parseEurStr(s) {
  return parseInt(s.replace(/\./g, ''), 10);
}
// Formatea entero -> "1.099", "247" (español).
function fmtEur(n) {
  return n.toLocaleString('es-ES');
}
// Divide entre 1.21 y redondea al entero más cercano.
function toBase(priceIvaIncl) {
  return Math.round(priceIvaIncl / 1.21);
}

const files = walk(root);
let touched = 0;
let cardCount = 0, cellCount = 0, subtitleCount = 0, fromCount = 0;

for (const p of files) {
  const orig = fs.readFileSync(p, 'utf8');
  let out = orig;

  // 1) Tarjetas de precio: <div class="price-amount"><sup>€</sup>NNN</div>
  //    seguido en las siguientes líneas de <div class="price-from">...IVA incluido</div>
  out = out.replace(
    /<div class="price-amount"><sup>€<\/sup>([\d\.]+)<\/div>(\s*<div class="price-from">)([^<]*?)(IVA incluido)([^<]*?)(<\/div>)/g,
    (m, priceStr, gap, fromLeft, _iva, fromRight, close) => {
      const base = toBase(parseEurStr(priceStr));
      cardCount++;
      const baseStr = fmtEur(base);
      // limpia " · IVA incluido" para transformar el price-from
      let newFrom = (fromLeft + fromRight).replace(/\s*·\s*$/, '').trim();
      if (!newFrom) newFrom = 'Pack completo';
      return `<div class="price-amount"><sup>€</sup>${baseStr}<span class="iva-suffix">+IVA</span></div>${gap}${newFrom} · precio orientativo${close}`;
    }
  );

  // 2) price-from con "IVA incluido" pero SIN price-amount arriba (residuo).
  out = out.replace(
    /<div class="price-from">([^<]*?)IVA incluido([^<]*?)<\/div>/g,
    (m, left, right) => {
      fromCount++;
      let newFrom = (left + right).replace(/\s*·\s*$/, '').trim();
      if (!newFrom) newFrom = 'Precio orientativo';
      else newFrom += ' · precio orientativo';
      return `<div class="price-from">${newFrom}</div>`;
    }
  );

  // 3) Tabla en precios.html: <td class="price-cell">Desde X.XXX €</td>
  //    Solo aplica en precios.html porque otras páginas no tienen "IVA incluido"
  //    asociado a las filas. Detectamos por contexto de archivo.
  if (p.endsWith('precios.html')) {
    out = out.replace(
      /<td class="price-cell">Desde ([\d\.]+) €<\/td>/g,
      (m, priceStr) => {
        const val = parseEurStr(priceStr);
        // Excepciones: 80 (desinstalación) y 60 (mantenimiento) — no son
        // "IVA incluido" según el patrón visible en la web; se dejan como están.
        // Todos los demás se recalculan.
        if (val === 80 || val === 60) return m;
        const base = toBase(val);
        cellCount++;
        return `<td class="price-cell">Desde ${fmtEur(base)} €<span class="iva-suffix">+IVA</span></td>`;
      }
    );
  }

  // 4) Subtítulos y notas con "IVA incluido" — reemplazo textual seguro.
  //    Cambia sólo la palabra, dejando el resto del texto igual.
  out = out.replace(
    /(<p class="section-subtitle">[^<]*?)IVA incluido\.?([^<]*?<\/p>)/g,
    (m, left, right) => {
      subtitleCount++;
      // Elimina la mención y limpia dobles espacios/puntos.
      let s = (left + right).replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').replace(/\.\s*\./g, '.');
      return s;
    }
  );

  // 5) Sub-subtítulos varios ("El precio final dependerá..."): añadir mención
  //    "precio orientativo" si el subtítulo mencionaba "IVA incluido" y ya no
  //    la lleva. En la práctica esto es cosmético — lo dejamos para futuro.

  if (out !== orig) {
    fs.writeFileSync(p, out);
    touched++;
  }
}

console.log(`Archivos modificados: ${touched}`);
console.log(`Cards recalculadas:   ${cardCount}`);
console.log(`Cells recalculadas:   ${cellCount}`);
console.log(`price-from limpios:   ${fromCount}`);
console.log(`Subtítulos limpios:   ${subtitleCount}`);
