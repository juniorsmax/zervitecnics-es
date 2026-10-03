#!/usr/bin/env node
/**
 * Añade los bloques de enlazado interno (tanda 1) en las páginas hand-written:
 *   - 1 hub           → aires-acondicionados/index.html
 *   - 7 zonas metro   → aires-acondicionados/zonas/{badalona,castelldefels,cornella,hospitalet,sabadell,sant-cugat,terrassa}.html
 *   - 8 zonas distrito Barcelona → aires-acondicionados/zonas/{eixample,gracia,sants,sarria,les-corts,sant-andreu,sant-marti,nou-barris}.html
 *                        (todas enlazan al mismo set de 14 páginas de Barcelona,
 *                        con subtítulo e introducción propios por distrito)
 *   - 10 marcas raíz  → aires-acondicionados/marcas/{slug}.html
 *
 * Idempotente: si ya existe el marker (<!-- XLINK-… -->), skip.
 * Patrón heredado de tools/add-mantenimiento-crosslinks.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARCAS = require('./data/marcas.json');
const INTERLINK = require('./lib/interlink.js');

// Mapeo (slug ciudad real) → (slug zona). Solo las zonas con 1-a-1 ciudad.
const ZONAS_METRO = [
  { zonaSlug: 'badalona',       ciudadSlug: 'badalona' },
  { zonaSlug: 'castelldefels',  ciudadSlug: 'castelldefels' },
  { zonaSlug: 'cornella',       ciudadSlug: 'cornella-de-llobregat' },
  { zonaSlug: 'hospitalet',     ciudadSlug: 'hospitalet-de-llobregat' },
  { zonaSlug: 'sabadell',       ciudadSlug: 'sabadell' },
  { zonaSlug: 'sant-cugat',     ciudadSlug: 'sant-cugat-del-valles' },
  { zonaSlug: 'terrassa',       ciudadSlug: 'terrassa' }
];

const CIUDADES = require('./data/ciudades.json');

let inserted = 0, skipped = 0, errors = 0;

// 1) Hub: insertar bloque "También instalamos en" tras </section> del bloque "ZONAS"
{
  const file = path.join(ROOT, 'aires-acondicionados', 'index.html');
  const txt = fs.readFileSync(file, 'utf8');
  const marker = '<!-- ── XLINK-HUB-MUNICIPIOS ── -->';
  if (txt.includes(marker)) {
    skipped++;
    console.log(`skip hub (ya tiene bloque)`);
  } else {
    // Anchor: después del <section id="zonas"> ... </section> y antes de "<!-- ── PROCESO ── -->"
    const anchor = '<!-- ── PROCESO ── -->';
    const idx = txt.indexOf(anchor);
    if (idx === -1) {
      errors++;
      console.error(`✗ hub: anchor ${anchor} no encontrado`);
    } else {
      const nuevo = txt.slice(0, idx) + INTERLINK.bloqueHubMunicipios() + '\n' + txt.slice(idx);
      fs.writeFileSync(file, nuevo);
      inserted++;
      console.log(`✓ hub (bloque "También instalamos en" insertado)`);
    }
  }
}

// 2) Zonas metro
for (const z of ZONAS_METRO) {
  const file = path.join(ROOT, 'aires-acondicionados', 'zonas', `${z.zonaSlug}.html`);
  if (!fs.existsSync(file)) { errors++; console.error(`✗ zona ${z.zonaSlug}: archivo no existe`); continue; }
  const txt = fs.readFileSync(file, 'utf8');
  const marker = `<!-- ── XLINK-ZONA-${z.ciudadSlug.toUpperCase()} ── -->`;
  if (txt.includes(marker)) { skipped++; console.log(`skip zona ${z.zonaSlug}`); continue; }

  // Anchor: antes de la sección cross-link de mantenimiento (ya existente) o del CTA.
  const anchor1 = '<!-- ── CROSS-LINK MANTENIMIENTO ── -->';
  const anchor2 = '<section class="section cta-section">';
  const idx = txt.includes(anchor1) ? txt.indexOf(anchor1) : txt.indexOf(anchor2);
  if (idx === -1) { errors++; console.error(`✗ zona ${z.zonaSlug}: ningún anchor`); continue; }

  const ciudad = CIUDADES.find(c => c.slug === z.ciudadSlug);
  if (!ciudad) { errors++; console.error(`✗ zona ${z.zonaSlug}: ciudad ${z.ciudadSlug} no en ciudades.json`); continue; }

  const bloque = INTERLINK.bloqueZonaMetro(ciudad);
  const nuevo = txt.slice(0, idx) + bloque + '\n' + txt.slice(idx);
  fs.writeFileSync(file, nuevo);
  inserted++;
  console.log(`✓ zona ${z.zonaSlug} → ciudad ${ciudad.nombre}`);
}

// 3) Zonas de distrito de Barcelona (8 páginas) → enlazan al mismo set de 14 páginas de Barcelona
for (const d of INTERLINK.DISTRITOS_BARCELONA) {
  const file = path.join(ROOT, 'aires-acondicionados', 'zonas', `${d.slug}.html`);
  if (!fs.existsSync(file)) { errors++; console.error(`✗ distrito ${d.slug}: archivo no existe`); continue; }
  const txt = fs.readFileSync(file, 'utf8');
  const marker = `<!-- ── XLINK-DISTRITO-${d.slug.toUpperCase()} ── -->`;
  if (txt.includes(marker)) { skipped++; console.log(`skip distrito ${d.slug}`); continue; }

  const anchor1 = '<!-- ── CROSS-LINK MANTENIMIENTO ── -->';
  const anchor2 = '<section class="section cta-section">';
  const idx = txt.includes(anchor1) ? txt.indexOf(anchor1) : txt.indexOf(anchor2);
  if (idx === -1) { errors++; console.error(`✗ distrito ${d.slug}: ningún anchor`); continue; }

  const bloque = INTERLINK.bloqueZonaDistritoBarcelona(d);
  const nuevo = txt.slice(0, idx) + bloque + '\n' + txt.slice(idx);
  fs.writeFileSync(file, nuevo);
  inserted++;
  console.log(`✓ distrito ${d.slug} → Barcelona`);
}

// 4) Marcas raíz: 10 páginas
for (const m of MARCAS) {
  const file = path.join(ROOT, 'aires-acondicionados', 'marcas', `${m.slug}.html`);
  if (!fs.existsSync(file)) { errors++; console.error(`✗ marca raíz ${m.slug}: archivo no existe`); continue; }
  const txt = fs.readFileSync(file, 'utf8');
  const marker = `<!-- ── XLINK-RAIZ-${m.slug.toUpperCase()} ── -->`;
  if (txt.includes(marker)) { skipped++; console.log(`skip raíz ${m.slug}`); continue; }

  // Anchor idéntico al de zonas metro.
  const anchor1 = '<!-- ── CROSS-LINK MANTENIMIENTO ── -->';
  const anchor2 = '<section class="section cta-section">';
  const idx = txt.includes(anchor1) ? txt.indexOf(anchor1) : txt.indexOf(anchor2);
  if (idx === -1) { errors++; console.error(`✗ raíz ${m.slug}: ningún anchor`); continue; }

  const bloque = INTERLINK.bloqueMarcaRaiz(m);
  const nuevo = txt.slice(0, idx) + bloque + '\n' + txt.slice(idx);
  fs.writeFileSync(file, nuevo);
  inserted++;
  console.log(`✓ raíz ${m.slug}`);
}

console.log(`\n== Resumen ==`);
console.log(`  Insertados: ${inserted}`);
console.log(`  Skipped (ya existían): ${skipped}`);
console.log(`  Errores: ${errors}`);
process.exit(errors ? 1 : 0);
