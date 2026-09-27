#!/usr/bin/env node
/* Elimina las menciones "Desplazamiento: +X€" y equivalentes en las páginas
   de zonas geográficas. Uso puntual: se puede borrar tras el commit. */

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'aires-acondicionados', 'zonas');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let touched = 0;

for (const file of files) {
  const p = path.join(dir, file);
  const original = fs.readFileSync(p, 'utf8');
  let out = original;

  // 1) Párrafo intro: quitar coletilla "Desplazamiento: ..." (cualquier valor).
  out = out.replace(
    /\s*Desplazamiento:\s*<strong[^>]*>[^<]+<\/strong>\s*\([^)]+\)\./g,
    ''
  );

  // 2) Bloque "info de cobertura": quitar los <div> Desplazamiento + Nota.
  out = out.replace(
    /\s*<div><span[^>]*>Desplazamiento:<\/span><br><strong[^>]*>[^<]+<\/strong><\/div>(?:\s*<div><span[^>]*>Nota:<\/span><br><strong>[^<]+<\/strong><\/div>)?/g,
    ''
  );

  if (out !== original) {
    fs.writeFileSync(p, out);
    touched++;
  }
}

console.log(`Archivos modificados: ${touched}`);
