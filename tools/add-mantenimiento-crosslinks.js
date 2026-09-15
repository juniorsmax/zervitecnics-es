#!/usr/bin/env node
/**
 * Añade cross-link a mantenimiento en zonas/*.html y marcas/*.html.
 * Idempotente: si ya está insertado (data-location="crosslink-mant-${slug}"), skip.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ZONAS_DATA = require('./data/mantenimiento-zonas.json');
const MARCAS_DATA = require('./data/mantenimiento-marcas.json');

function crosslinkZona(slug, nombre) {
  return `<!-- ── CROSS-LINK MANTENIMIENTO ── -->
<section style="padding:32px 0;background:#F0FDF4;border-top:1px solid #DCFCE7;border-bottom:1px solid #DCFCE7">
  <div class="container" style="text-align:center">
    <p style="font-size:1rem;color:#166534;margin-bottom:14px;max-width:640px;margin-left:auto;margin-right:auto">
      <strong>¿Ya tienes aire acondicionado instalado?</strong> También hacemos mantenimiento preventivo (70€), correctivo (130€) y diagnóstico técnico en ${nombre}.
    </p>
    <a href="../mantenimiento-zonas/${slug}.html" class="btn btn-secondary" data-location="crosslink-mant-${slug}">Ver mantenimiento en ${nombre} →</a>
  </div>
</section>

`;
}

function crosslinkMarca(slug, nombre) {
  return `<!-- ── CROSS-LINK MANTENIMIENTO ── -->
<section style="padding:32px 0;background:#F0FDF4;border-top:1px solid #DCFCE7;border-bottom:1px solid #DCFCE7">
  <div class="container" style="text-align:center">
    <p style="font-size:1rem;color:#166534;margin-bottom:14px;max-width:640px;margin-left:auto;margin-right:auto">
      <strong>¿Ya tienes un ${nombre} instalado?</strong> También hacemos mantenimiento preventivo (70€), correctivo (130€) y diagnóstico técnico específico para equipos ${nombre}.
    </p>
    <a href="../mantenimiento-marcas/${slug}.html" class="btn btn-secondary" data-location="crosslink-mant-${slug}">Ver mantenimiento ${nombre} →</a>
  </div>
</section>

`;
}

let inserted = 0, skipped = 0, missing = 0;

// Zonas
for (const z of ZONAS_DATA) {
  const filePath = path.join(ROOT, 'aires-acondicionados/zonas', `${z.slug}.html`);
  if (!fs.existsSync(filePath)) { missing++; continue; }
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = `data-location="crosslink-mant-${z.slug}"`;
  if (content.includes(marker)) { skipped++; continue; }

  // Insertar antes de <section class="section cta-section">
  const anchor = '<section class="section cta-section">';
  const idx = content.indexOf(anchor);
  if (idx === -1) {
    console.warn(`⚠️  ${z.slug}: no se encontró anchor CTA`);
    continue;
  }
  const nuevo = content.slice(0, idx) + crosslinkZona(z.slug, z.nombre) + content.slice(idx);
  fs.writeFileSync(filePath, nuevo);
  inserted++;
}

// Marcas
for (const m of MARCAS_DATA) {
  const filePath = path.join(ROOT, 'aires-acondicionados/marcas', `${m.slug}.html`);
  if (!fs.existsSync(filePath)) { missing++; continue; }
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = `data-location="crosslink-mant-${m.slug}"`;
  if (content.includes(marker)) { skipped++; continue; }

  const anchor = '<section class="section cta-section">';
  const idx = content.indexOf(anchor);
  if (idx === -1) {
    console.warn(`⚠️  ${m.slug}: no se encontró anchor CTA`);
    continue;
  }
  const nuevo = content.slice(0, idx) + crosslinkMarca(m.slug, m.nombre) + content.slice(idx);
  fs.writeFileSync(filePath, nuevo);
  inserted++;
}

console.log(`✓ Cross-links insertados: ${inserted}`);
console.log(`  Ya presentes (skip): ${skipped}`);
if (missing) console.log(`  ⚠️  Archivos no encontrados: ${missing}`);
