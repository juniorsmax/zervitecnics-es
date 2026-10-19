#!/usr/bin/env node
/* Reescribe las páginas de zona (aires-acondicionados/zonas/*.html) de los distritos
   de Barcelona y de los municipios con zona propia, con contenido propio de cada uno: barrios, viviendas, normativa, preguntas
   frecuentes, distritos vecinos y fuentes.

   Datos: tools/data/distritos.json (uno por zona, investigados y con fuentes;
   "tipo": "municipio" cambia el schema y algunos títulos).
   Solo toca bloques concretos de la página; el resto (cabecera, reseñas, enlaces
   a marcas, pie) se queda igual. Se puede volver a ejecutar: los bloques nuevos
   van entre marcadores <!-- DISTRITO:... -->.

   Los bloques también se generan en catalán (tools/build-catala.js usa este módulo
   con lang = 'ca'); los textos fijos de cada idioma están en TXT.

   Uso: node tools/apply-distritos.js [slug ...]   (sin argumentos: todos) */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'aires-acondicionados');
const BASE = 'https://zervitecnics.es/aires-acondicionados/';
const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
const FAQ_ICON = '<div class="faq-icon"><svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 1v10M1 6h10"/></svg></div>';

// «de» en catalán: «d'Horta-Guinardó», «de Gràcia», «de l'Eixample».
const deCa = n => /^[aeiouàèéíïòóúüh]/i.test(n) ? `d'${n}` : `de ${n}`;

// Textos fijos y rutas por idioma. Las páginas en catalán viven en /ca/aire-condicionat/zones/.
const TXT = {
  es: {
    img: '../img/', guias: '../guias/', presupuesto: '../index.html#presupuesto', mant: s => `../mantenimiento-zonas/${s}.html`,
    url: s => `${BASE}zonas/${s}.html`, servicio: 'Instalación de aire acondicionado',
    distrito: 'distrito de Barcelona', cobertura: 'Cobertura en', h2: 'Instalación de Aire Acondicionado en',
    info: 'Información de cobertura', barriosK: 'Barrios:', municipio: 'todo el municipio', todos: n => `${n} barrios, todos cubiertos`,
    cp: 'Códigos postales más habituales:', calles: 'Calles principales:', horarioK: 'Horario:', horario: 'Lun-Vie 8-20h · Sáb 9-14h',
    nota: 'Un código postal puede incluir calles de distritos vecinos. Sin coste adicional de desplazamiento.',
    checks: ['Instalación en 1 día', 'Instalación documentada incluida',
      'Garantía: 1 año en la instalación y 3 años del fabricante en el equipo', 'Precio cerrado sin sorpresas'],
    pedir: 'Solicitar presupuesto gratis', barriosLabel: 'Barrios',
    barriosMuni: n => `Barrios de ${n} y cómo se instala en cada uno`, barriosDist: (k, n) => `Los ${k} barrios de ${n} y cómo se instala en cada uno`,
    vivienda: 'Viviendas:', instalacion: 'Instalación:', normaLabel: 'Normativa y comunidad',
    guiaNorma: 'Más detalle en la guía <a href="../guias/normativa-comunidad-vecinos-barcelona.html" style="color:var(--blue);text-decoration:underline">normativa para instalar aire acondicionado en Barcelona</a>.',
    faqT: n => `Preguntas frecuentes en ${n}`, cercaT: n => `Cerca de ${n}`, cerca: 'Cerca', vecinos: 'Distritos vecinos',
    guiasT: n => `Guías útiles para ${n}`, equipo: '¿Ya tienes equipo?', mantT: n => `Mantenimiento de aire acondicionado en ${n}`,
    fuentes: 'Fuentes de esta página'
  },
  ca: {
    img: '/aires-acondicionados/img/', guias: '/aires-acondicionados/guias/', presupuesto: '/aires-acondicionados/index.html#presupuesto',
    mant: s => `/aires-acondicionados/mantenimiento-zonas/${s}.html`,
    url: s => `https://zervitecnics.es/ca/aire-condicionat/zones/${s}.html`, servicio: "Instal·lació d'aire condicionat",
    distrito: 'districte de Barcelona', cobertura: 'Cobertura a', h2: "Instal·lació d'aire condicionat a",
    info: 'Informació de cobertura', barriosK: 'Barris:', municipio: 'tot el municipi', todos: n => `${n} barris, tots coberts`,
    cp: 'Codis postals més habituals:', calles: 'Carrers principals:', horarioK: 'Horari:', horario: 'Dl-Dv 8-20 h · Ds 9-14 h',
    nota: 'Un codi postal pot incloure carrers de districtes veïns. Sense cost addicional de desplaçament.',
    checks: ["Instal·lació en 1 dia", "Instal·lació documentada inclosa",
      "Garantia: 1 any a la instal·lació i 3 anys del fabricant a l'equip", 'Preu tancat sense sorpreses'],
    pedir: 'Demana pressupost gratuït', barriosLabel: 'Barris',
    barriosMuni: n => `Barris ${deCa(n)} i com s'hi instal·la`, barriosDist: (k, n) => `Els ${k} barris ${deCa(n)} i com s'instal·la a cadascun`,
    vivienda: 'Habitatges:', instalacion: "Instal·lació:", normaLabel: 'Normativa i comunitat',
    guiaNorma: 'Més detall a la guia <a href="/aires-acondicionados/guias/normativa-comunidad-vecinos-barcelona.html" style="color:var(--blue);text-decoration:underline">normativa per instal·lar aire condicionat a Barcelona</a> (en castellà).',
    faqT: n => `Preguntes freqüents a ${n}`, cercaT: n => `A prop ${deCa(n)}`, cerca: 'A prop', vecinos: 'Districtes veïns',
    guiasT: n => `Guies útils per a ${n} (en castellà)`, equipo: 'Ja tens equip?', mantT: n => `Manteniment d'aire condicionat a ${n} (en castellà)`,
    fuentes: "Fonts d'aquesta pàgina"
  }
};

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

function schemaService(d, lang = 'es') {
  const T = TXT[lang];
  return `  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: T.servicio,
    name: `${T.servicio} ${lang === 'ca' ? 'a' : 'en'} ${d.nombre}`,
    url: T.url(d.slug),
    inLanguage: lang,
    provider: { '@type': 'HVACBusiness', name: 'Zervitecnics Barcelona', url: BASE, telephone: '+34625215983' },
    areaServed: d.tipo === 'municipio'
      ? { '@type': 'City', name: d.nombre }
      : { '@type': 'AdministrativeArea', name: `${d.nombre} (${T.distrito})`, containedInPlace: { '@type': 'City', name: 'Barcelona' } }
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

function intro(d, lang = 'es') {
  const T = TXT[lang];
  return `<section class="section">
  <div class="container">
    <div class="service-detail-grid fade-up">
      <div class="service-detail-img"><picture><source srcset="${T.img}${d.imagen.archivo}.webp" type="image/webp"><img width="${d.imagen.w}" height="${d.imagen.h}" src="${T.img}${d.imagen.archivo}.jpg" alt="${esc(d.imagen.alt)}" loading="lazy" style="border-radius:var(--radius-xl);width:100%;object-fit:cover;height:400px;background:linear-gradient(135deg,#EBF4FF,#F0FFF8)"></picture></div>
      <div class="service-detail-content">
        <span class="section-label">${T.cobertura} ${esc(d.nombre)}</span>
        <h2>${T.h2} ${esc(d.nombre)}</h2>
${d.intro.map(p => `        <p>${rich(p)}</p>`).join('\n')}
        <div style="background:var(--gray-50);border-radius:var(--radius-lg);padding:20px;margin:20px 0">
          <div style="font-weight:700;color:var(--navy);margin-bottom:12px">${T.info}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.9rem">
            <div><span style="color:var(--gray-500)">${T.barriosK}</span><br><strong>${d.tipo === 'municipio' ? T.municipio : T.todos(d.barrios.length)}</strong></div>
            <div><span style="color:var(--gray-500)">${T.cp}</span><br><strong style="font-size:.8rem">${esc(d.cp)}</strong></div>
            <div><span style="color:var(--gray-500)">${T.calles}</span><br><strong style="font-size:.85rem">${esc(d.ejes)}</strong></div>
            <div><span style="color:var(--gray-500)">${T.horarioK}</span><br><strong>${T.horario}</strong></div>
          </div>
          <p style="font-size:.78rem;color:var(--gray-500);margin:12px 0 0">${T.nota}</p>
        </div>
        <ul class="service-checklist">
${T.checks.map(c => `          <li class="service-check-item">${CHECK_SVG}${c}</li>`).join('\n')}
        </ul>
        <a href="${T.presupuesto}" class="btn btn-primary mt-24">${T.pedir}</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-gray" id="barrios" aria-labelledby="barrios-title">
  <div class="container">
    <div class="text-center mb-32 fade-up"><span class="section-label">${T.barriosLabel}</span><h2 class="section-title" id="barrios-title">${d.tipo === 'municipio' ? T.barriosMuni(esc(d.nombre)) : T.barriosDist(d.barrios.length, esc(d.nombre))}</h2><p class="section-subtitle">${rich(d.barriosIntro)}</p></div>
    <div class="grid-auto fade-up" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">
${d.barrios.map(b => `      <div class="diff-card" style="text-align:left">
        <h3 class="diff-title">${esc(b.nombre)}</h3>
        <p class="diff-desc"><strong>${T.vivienda}</strong> ${rich(b.vivienda)}</p>
        <p class="diff-desc"><strong>${T.instalacion}</strong> ${rich(b.instalacion)}</p>
        <p class="diff-desc" style="font-size:.85rem;color:var(--gray-500)">${rich(b.referencias)}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<section class="section" id="normativa" aria-labelledby="normativa-title">
  <div class="container" style="max-width:860px">
    <span class="section-label">${T.normaLabel}</span>
    <h2 class="section-title" id="normativa-title">${esc(d.normativa.titulo)}</h2>
${d.normativa.parrafos.map(p => `    <p style="margin-bottom:12px">${rich(p)}</p>`).join('\n')}
    <ul class="service-checklist" style="margin-top:16px">
${d.normativa.consejos.map(c => `      <li class="service-check-item">${CHECK_SVG}${rich(c)}</li>`).join('\n')}
    </ul>
    <p style="margin-top:16px">${T.guiaNorma}</p>
  </div>
</section>`;
}

function faq(d, lang = 'es') {
  const T = TXT[lang];
  return `<section class="section">
  <div class="container">
    <div class="text-center mb-32 fade-up"><span class="section-label">FAQ</span><h2 class="section-title">${T.faqT(esc(d.nombre))}</h2></div>
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
    <h2 class="section-title" id="cerca-title" style="font-size:1.4rem">${T.cercaT(esc(d.nombre))}</h2>
    <p><strong>${d.tipo === 'municipio' ? T.cerca : T.vecinos}:</strong> ${d.vecinos.map(v => `<a href="${v.slug}.html" style="color:var(--blue)">${esc(v.nombre)}</a>`).join(' · ')}</p>
    <p><strong>${T.guiasT(esc(d.nombre))}:</strong> ${d.guias.map(g => `<a href="${T.guias}${g.slug}.html" style="color:var(--blue)">${esc(g.nombre)}</a>`).join(' · ')}</p>
    <p><strong>${T.equipo}</strong> <a href="${lang === 'es' && d.mantenimientoUrl ? d.mantenimientoUrl : (d.mantenimientoUrl ? '/aires-acondicionados/mantenimiento.html' : T.mant(d.slug))}" style="color:var(--blue)">${T.mantT(esc(d.nombre))}</a></p>
    ${d.fuentes.length ? '' : '<!-- sin fuentes externas -->'}<details style="margin-top:12px;font-size:.85rem;color:var(--gray-500)${d.fuentes.length ? '' : ';display:none'}"><summary style="cursor:pointer">${T.fuentes}</summary>
      <ul style="margin:8px 0 0;padding-left:18px">
${d.fuentes.map(f => `        <li><a href="${f.url}" target="_blank" rel="noopener">${esc(f.nombre)}</a></li>`).join('\n')}
      </ul>
    </details>
  </div>
</section>`;
}

const RE = {
  'schema-servicio': /  <script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema.org",\s*"@type": "LocalBusiness"[\s\S]*?<\/script>/,
  'schema-faq': /  <script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/,
  contenido: /<section class="section">\s*<div class="container">\s*<div class="service-detail-grid fade-up">[\s\S]*?<\/section>/,
  faq: /<section class="section">\s*<div class="container">\s*<div class="text-center mb-32 fade-up"><span class="section-label">FAQ<\/span>[\s\S]*?<\/section>/
};

// Aplica los bloques de una zona a una página (cualquier idioma).
function applyZona(html, d, lang, file) {
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(d.metaDesc)}">`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${esc(d.metaDesc)}$2`);
  html = replaceBlock(html, 'schema-servicio', RE['schema-servicio'], schemaService(d, lang), file);
  html = replaceBlock(html, 'schema-faq', RE['schema-faq'], schemaFaq(d), file);
  html = replaceBlock(html, 'contenido', RE.contenido, intro(d, lang), file);
  html = replaceBlock(html, 'faq', RE.faq, faq(d, lang), file);
  if (d.heroSub) html = html.replace(/(<section class="page-hero">[\s\S]*?<\/h1>\s*<p>)[^<]*(<\/p>)/, `$1${esc(d.heroSub)}$2`);
  return html;
}

module.exports = { TXT, esc, deCa, applyZona };

if (require.main === module) {
  const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'distritos.json'), 'utf8'));
  const only = process.argv.slice(2);
  for (const d of DATA) {
    if (only.length && !only.includes(d.slug)) continue;
    const file = path.join(ROOT, 'zonas', `${d.slug}.html`);
    fs.writeFileSync(file, applyZona(fs.readFileSync(file, 'utf8'), d, 'es', file));
    console.log('✓', d.slug);
  }
}
