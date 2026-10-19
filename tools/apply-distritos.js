#!/usr/bin/env node
/* Reescribe las páginas de zona (aires-acondicionados/zonas/*.html) de los distritos
   de Barcelona y de los municipios con zona propia, con contenido propio de cada uno: barrios, viviendas, normativa, preguntas
   frecuentes, distritos vecinos y fuentes.

   Datos: tools/data/distritos.json (uno por zona, investigados y con fuentes;
   "tipo": "municipio" cambia el schema y algunos títulos).
   Solo toca bloques concretos de la página; el resto (cabecera, reseñas, enlaces
   a marcas, pie) se queda igual. Se puede volver a ejecutar: los bloques nuevos
   van entre marcadores <!-- DISTRITO:... -->.

   Uso: node tools/apply-distritos.js [slug ...]   (sin argumentos: todos) */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'aires-acondicionados');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'distritos.json'), 'utf8'));
const BASE = 'https://zervitecnics.es/aires-acondicionados/';
const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
const FAQ_ICON = '<div class="faq-icon"><svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 1v10M1 6h10"/></svg></div>';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Texto con enlaces en formato [texto](ruta) → HTML. El resto se escapa.
const rich = s => esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}" style="color:var(--blue);text-decoration:underline">${t}</a>`);
const plain = s => String(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

function replaceBlock(html, name, re, block, file) {
  const start = `<!-- DISTRITO:${name}:start -->`, end = `<!-- DISTRITO:${name}:end -->`;
  const marked = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (marked.test(html)) return html.replace(marked, `${start}\n${block}\n${end}`);
  if (!re.test(html)) throw new Error(`${file}: no encuentro el bloque ${name}`);
  return html.replace(re, `${start}\n${block}\n${end}`);
}

function schemaService(d) {
  return `  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Instalación de aire acondicionado',
    name: `Instalación de aire acondicionado en ${d.nombre}`,
    url: `${BASE}zonas/${d.slug}.html`,
    provider: { '@type': 'HVACBusiness', name: 'Zervitecnics Barcelona', url: BASE, telephone: '+34625215983' },
    areaServed: d.tipo === 'municipio'
      ? { '@type': 'City', name: d.nombre }
      : { '@type': 'AdministrativeArea', name: `${d.nombre} (distrito de Barcelona)`, containedInPlace: { '@type': 'City', name: 'Barcelona' } }
  }, null, 2)}
  </script>`;
}

function schemaFaq(d) {
  return `  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: plain(f.r) } }))
  }, null, 2)}
  </script>`;
}

function intro(d) {
  const checks = ['Instalación en 1 día', 'Instalación documentada incluida',
    'Garantía: 1 año en la instalación y 3 años del fabricante en el equipo', 'Precio cerrado sin sorpresas'];
  return `<section class="section">
  <div class="container">
    <div class="service-detail-grid fade-up">
      <div class="service-detail-img"><picture><source srcset="../img/${d.imagen.archivo}.webp" type="image/webp"><img width="${d.imagen.w}" height="${d.imagen.h}" src="../img/${d.imagen.archivo}.jpg" alt="${esc(d.imagen.alt)}" loading="lazy" style="border-radius:var(--radius-xl);width:100%;object-fit:cover;height:400px;background:linear-gradient(135deg,#EBF4FF,#F0FFF8)"></picture></div>
      <div class="service-detail-content">
        <span class="section-label">Cobertura en ${esc(d.nombre)}</span>
        <h2>Instalación de Aire Acondicionado en ${esc(d.nombre)}</h2>
${d.intro.map(p => `        <p>${rich(p)}</p>`).join('\n')}
        <div style="background:var(--gray-50);border-radius:var(--radius-lg);padding:20px;margin:20px 0">
          <div style="font-weight:700;color:var(--navy);margin-bottom:12px">Información de cobertura</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.9rem">
            <div><span style="color:var(--gray-500)">Barrios:</span><br><strong>${d.tipo === 'municipio' ? 'todo el municipio' : `${d.barrios.length} barrios, todos cubiertos`}</strong></div>
            <div><span style="color:var(--gray-500)">Códigos postales más habituales:</span><br><strong style="font-size:.8rem">${esc(d.cp)}</strong></div>
            <div><span style="color:var(--gray-500)">Calles principales:</span><br><strong style="font-size:.85rem">${esc(d.ejes)}</strong></div>
            <div><span style="color:var(--gray-500)">Horario:</span><br><strong>Lun-Vie 8-20h · Sáb 9-14h</strong></div>
          </div>
          <p style="font-size:.78rem;color:var(--gray-500);margin:12px 0 0">Un código postal puede incluir calles de distritos vecinos. Sin coste adicional de desplazamiento.</p>
        </div>
        <ul class="service-checklist">
${checks.map(c => `          <li class="service-check-item">${CHECK_SVG}${c}</li>`).join('\n')}
        </ul>
        <a href="../index.html#presupuesto" class="btn btn-primary mt-24">Solicitar presupuesto gratis</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-gray" id="barrios" aria-labelledby="barrios-title">
  <div class="container">
    <div class="text-center mb-32 fade-up"><span class="section-label">Barrios</span><h2 class="section-title" id="barrios-title">${d.tipo === 'municipio' ? `Barrios de ${esc(d.nombre)} y cómo se instala en cada uno` : `Los ${d.barrios.length} barrios de ${esc(d.nombre)} y cómo se instala en cada uno`}</h2><p class="section-subtitle">${rich(d.barriosIntro)}</p></div>
    <div class="grid-auto fade-up" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
${d.barrios.map(b => `      <div class="diff-card" style="text-align:left">
        <h3 class="diff-title">${esc(b.nombre)}</h3>
        <p class="diff-desc"><strong>Viviendas:</strong> ${rich(b.vivienda)}</p>
        <p class="diff-desc"><strong>Instalación:</strong> ${rich(b.instalacion)}</p>
        <p class="diff-desc" style="font-size:.85rem;color:var(--gray-500)">${rich(b.referencias)}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section" id="normativa" aria-labelledby="normativa-title">
  <div class="container" style="max-width:860px">
    <span class="section-label">Normativa y comunidad</span>
    <h2 class="section-title" id="normativa-title">${esc(d.normativa.titulo)}</h2>
${d.normativa.parrafos.map(p => `    <p style="margin-bottom:12px">${rich(p)}</p>`).join('\n')}
    <ul class="service-checklist" style="margin-top:16px">
${d.normativa.consejos.map(c => `      <li class="service-check-item">${CHECK_SVG}${rich(c)}</li>`).join('\n')}
    </ul>
    <p style="margin-top:16px">Más detalle en la guía <a href="../guias/normativa-comunidad-vecinos-barcelona.html" style="color:var(--blue);text-decoration:underline">normativa para instalar aire acondicionado en Barcelona</a>.</p>
  </div>
</section>`;
}

function faq(d) {
  return `<section class="section">
  <div class="container">
    <div class="text-center mb-32 fade-up"><span class="section-label">FAQ</span><h2 class="section-title">Preguntas frecuentes en ${esc(d.nombre)}</h2></div>
    <div class="faq-list fade-up">
${d.faq.map(f => `      <div class="faq-item">
        <div class="faq-question" tabindex="0">${esc(f.p)}${FAQ_ICON}</div>
        <div class="faq-answer"><div class="faq-answer-inner">${rich(f.r)}</div></div>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section-sm" id="cerca" aria-labelledby="cerca-title">
  <div class="container" style="max-width:860px">
    <h2 class="section-title" id="cerca-title" style="font-size:1.4rem">Cerca de ${esc(d.nombre)}</h2>
    <p><strong>${d.tipo === 'municipio' ? 'Cerca' : 'Distritos vecinos'}:</strong> ${d.vecinos.map(v => `<a href="${v.slug}.html" style="color:var(--blue)">${esc(v.nombre)}</a>`).join(' · ')}</p>
    <p><strong>Guías útiles para ${esc(d.nombre)}:</strong> ${d.guias.map(g => `<a href="../guias/${g.slug}.html" style="color:var(--blue)">${esc(g.nombre)}</a>`).join(' · ')}</p>
    <p><strong>¿Ya tienes equipo?</strong> <a href="${d.mantenimientoUrl || `../mantenimiento-zonas/${d.slug}.html`}" style="color:var(--blue)">Mantenimiento de aire acondicionado en ${esc(d.nombre)}</a></p>
    ${d.fuentes.length ? '' : '<!-- sin fuentes externas -->'}<details style="margin-top:12px;font-size:.85rem;color:var(--gray-500)${d.fuentes.length ? '' : ';display:none'}"><summary style="cursor:pointer">Fuentes de esta página</summary>
      <ul style="margin:8px 0 0;padding-left:18px">
${d.fuentes.map(f => `        <li><a href="${f.url}" target="_blank" rel="noopener">${esc(f.nombre)}</a></li>`).join('\n')}
      </ul>
    </details>
  </div>
</section>`;
}

const only = process.argv.slice(2);
for (const d of DATA) {
  if (only.length && !only.includes(d.slug)) continue;
  const file = path.join(ROOT, 'zonas', `${d.slug}.html`);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(d.metaDesc)}">`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${esc(d.metaDesc)}$2`);
  html = replaceBlock(html, 'schema-servicio',
    /  <script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema.org",\s*"@type": "LocalBusiness"[\s\S]*?<\/script>/, schemaService(d), file);
  html = replaceBlock(html, 'schema-faq',
    /  <script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/, schemaFaq(d), file);
  html = replaceBlock(html, 'contenido',
    /<section class="section">\s*<div class="container">\s*<div class="service-detail-grid fade-up">[\s\S]*?<\/section>/, intro(d), file);
  html = replaceBlock(html, 'faq',
    /<section class="section">\s*<div class="container">\s*<div class="text-center mb-32 fade-up"><span class="section-label">FAQ<\/span>[\s\S]*?<\/section>/, faq(d), file);
  if (d.heroSub) html = html.replace(/(<section class="page-hero">[\s\S]*?<\/h1>\s*<p>)[^<]*(<\/p>)/, `$1${esc(d.heroSub)}$2`);
  fs.writeFileSync(file, html);
  console.log('✓', d.slug);
}
