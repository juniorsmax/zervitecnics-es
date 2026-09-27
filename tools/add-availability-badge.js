#!/usr/bin/env node
/* Añade un badge "Consultar disponibilidad — llamar para confirmar" bajo el
   <h1> de cada página en categorias/*.html. Uso puntual: se puede borrar. */

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'aires-acondicionados', 'categorias');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const BADGE = `\n    <div class="availability-badge" style="display:inline-flex;align-items:center;gap:8px;background:#FEF3C7;color:#92400E;font-weight:600;font-size:.88rem;padding:8px 16px;border-radius:9999px;margin:14px 0 4px;border:1px solid #FDE68A"><svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;flex-shrink:0" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span>Consultar disponibilidad — llamar para confirmar</span></div>`;

let touched = 0;
const failures = [];

for (const file of files) {
  const p = path.join(dir, file);
  const original = fs.readFileSync(p, 'utf8');
  if (original.includes('availability-badge')) continue; // ya presente
  // Insertar tras el primer </h1> dentro de <section class="page-hero">
  const heroMatch = original.match(/<section class="page-hero"[^>]*>[\s\S]*?<\/h1>/);
  if (!heroMatch) { failures.push(file); continue; }
  const insertAt = heroMatch.index + heroMatch[0].length;
  const out = original.slice(0, insertAt) + BADGE + original.slice(insertAt);
  fs.writeFileSync(p, out);
  touched++;
}

console.log(`Archivos modificados: ${touched}/${files.length}`);
if (failures.length) console.log('Fallos:', failures);
