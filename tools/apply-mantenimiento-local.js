#!/usr/bin/env node
/* Añade a cada página de mantenimiento por zona (aires-acondicionados/mantenimiento-zonas/*.html)
   un bloque propio de la zona: qué revisamos más allí, barrios cubiertos y enlaces a la
   página de instalación y a las zonas vecinas.

   Datos: tools/data/mantenimiento-zonas-local.json. El bloque va entre los marcadores
   <!-- MANT-LOCAL:start --> y <!-- MANT-LOCAL:end -->, antes de "Cuándo pedir
   mantenimiento". Se puede volver a ejecutar.

   Uso: node tools/apply-mantenimiento-local.js */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'aires-acondicionados', 'mantenimiento-zonas');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mantenimiento-zonas-local.json'), 'utf8'));
const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
const START = '<!-- MANT-LOCAL:start -->', END = '<!-- MANT-LOCAL:end -->';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function block(slug, d) {
  const vecinas = d.vecinas.filter(v => DATA[v]).map(v =>
    `<a href="${v}.html" style="color:var(--blue)">${esc(DATA[v].nombre)}</a>`).join(' · ');
  return `<section class="section" id="mantenimiento-local" aria-labelledby="mant-local-title">
  <div class="container" style="max-width:860px">
    <span class="section-label">Mantenimiento en ${esc(d.nombre)}</span>
    <h2 class="section-title" id="mant-local-title">Lo que más revisamos en ${esc(d.nombre)}</h2>
    <ul class="service-checklist" style="margin-top:12px">
${d.revisamos.map(r => `      <li class="service-check-item">${CHECK_SVG}${esc(r)}</li>`).join('\n')}
    </ul>
    <p style="margin-top:16px"><strong>Barrios que cubrimos:</strong> ${esc(d.barrios)}.</p>
    <p><strong>¿Aún no tienes equipo?</strong> <a href="../zonas/${slug}.html" style="color:var(--blue)">Instalación de aire acondicionado en ${esc(d.nombre)}</a></p>
    ${vecinas ? `<p><strong>Mantenimiento cerca:</strong> ${vecinas}</p>` : ''}
  </div>
</section>`;
}

for (const [slug, d] of Object.entries(DATA)) {
  const file = path.join(DIR, `${slug}.html`);
  if (!fs.existsSync(file)) { console.warn('✗ no existe', file); continue; }
  let html = fs.readFileSync(file, 'utf8');
  const b = `${START}\n${block(slug, d)}\n${END}`;
  if (html.includes(START)) {
    html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), b);
  } else {
    const anchor = '<section class="section" style="background:#F8FAFF">\n  <div class="container">\n\n    <h2 class="section-title">Cuándo pedir mantenimiento';
    if (!html.includes(anchor)) { console.warn('✗ sin ancla', slug); continue; }
    html = html.replace(anchor, `${b}\n\n${anchor}`);
  }
  fs.writeFileSync(file, html);
  console.log('✓', slug);
}
