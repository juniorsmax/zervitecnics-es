#!/usr/bin/env node
/* Genera las páginas principales en catalán:
     /ca/aire-condicionat/index.html          portada catalana (enlaza los 10 distritos)
     /ca/aire-condicionat/zones/<slug>.html    una por distrito de Barcelona

   Contenido propio de cada distrito: tools/data/distritos-ca.json (mismos campos que
   distritos.json + "title"). Los bloques de contenido los pinta apply-distritos.js
   con lang = 'ca'; aquí va la plantilla fija (cabecera, servicios, pie...).
   El resto del sitio (guías, marcas, formulario) sigue en castellano y se enlaza
   con rutas absolutas.

   También pone hreflang es/ca/x-default y el enlace de idioma en las versiones
   en castellano (zona y hub). Se puede volver a ejecutar.

   Las reseñas no se copian: las guardadas están traducidas al castellano y no
   tenemos el texto original en catalán; se enlaza a Google.

   Uso: node tools/build-catala.js   (después: node tools/generate-sitemap.js) */

const fs = require('fs');
const path = require('path');
const { esc, deCa, applyZona } = require('./apply-distritos');

const REPO = path.join(__dirname, '..');
const ES = path.join(REPO, 'aires-acondicionados');
const OUT = path.join(REPO, 'ca', 'aire-condicionat');
const SITE = 'https://zervitecnics.es';
const A = '/aires-acondicionados/';
const CA_HUB = '/ca/aire-condicionat/';
const V_CSS = '20261021b', V_JS = '20261021a';

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'distritos-ca.json'), 'utf8'));
// Zonas sin página propia de mantenimiento (Ciutat Vella, Horta-Guinardó): se toma de la versión en castellano.
const DATA_ES = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'distritos.json'), 'utf8'));
for (const d of DATA) { const es = DATA_ES.find(e => e.slug === d.slug); if (es && es.mantenimientoUrl) d.mantenimientoUrl = es.mantenimientoUrl; }
const REV = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'reviews.json'), 'utf8'));
const hub = fs.readFileSync(path.join(ES, 'index.html'), 'utf8');

const pick = (html, re, what) => { const m = html.match(re); if (!m) throw new Error(`no encuentro ${what}`); return m[0]; };
// Bloques que se copian tal cual de la web en castellano (analítica, CSP, fuentes, iconos).
const ref = fs.readFileSync(path.join(ES, 'zonas', 'gracia.html'), 'utf8');
const ANALYTICS = pick(ref, /<!-- ZRV-ANALYTICS-START -->[\s\S]*?<!-- ZRV-ANALYTICS-END -->/, 'analítica')
  .replace(/\n\s*<!-- reCAPTCHA v3 -->/, '');
const CSP = pick(ref, /<meta http-equiv="Content-Security-Policy"[^>]*>/, 'CSP');
const FONTS = pick(ref, /<!-- ZRV-FONTS -->[\s\S]*?<!-- \/ZRV-FONTS -->/, 'fuentes');
const PHONE_SVG = pick(ref, /<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px">[\s\S]*?<\/svg>/, 'icono teléfono');
const WA_SVG = pick(ref, /<svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px">[\s\S]*?<\/svg>/, 'icono WhatsApp');
const WA_FLOAT_SVG = pick(ref, /<svg viewBox="0 0 24 24" fill="white">[\s\S]*?<\/svg>/, 'icono WhatsApp flotante');
const BRANDS = pick(ref, /<div class="brands-grid">[\s\S]*?\n    <\/div>/, 'marcas').replace(/href="\.\.\//g, `href="${A}`);
// Iconos de las tarjetas de zona de la portada (los mismos que el hub en castellano).
const EMOJI = { gracia: '🌳', eixample: '🏙️', sants: '🎨', 'les-corts': '🌺', sarria: '🏡', 'nou-barris': '🏘️',
  'sant-andreu': '🚂', 'sant-marti': '🌆', 'ciutat-vella': '🏛️', 'horta-guinardo': '⛰️' };

const wa = msg => `https://wa.me/34625215983?text=${encodeURIComponent(msg)}`;
const esUrl = slug => slug ? `${SITE}${A}zonas/${slug}.html` : `${SITE}${A}`;
const caUrl = slug => slug ? `${SITE}${CA_HUB}zones/${slug}.html` : `${SITE}${CA_HUB}`;
const hreflang = slug => `  <link rel="alternate" hreflang="es" href="${esUrl(slug)}">
  <link rel="alternate" hreflang="ca" href="${caUrl(slug)}">
  <link rel="alternate" hreflang="x-default" href="${esUrl(slug)}">`;

function head({ title, desc, canonical, slug, schemas }) {
  return `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${A}favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${A}favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="${A}apple-touch-icon.png">
  <meta name="theme-color" content="#1E90FF">
  ${ANALYTICS}
  ${CSP}
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${canonical}">
${hreflang(slug)}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ca_ES">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}${A}img/barcelona_aerial.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${FONTS}
  <link rel="stylesheet" href="${A}css/shared.css?v=${V_CSS}">
  <link rel="stylesheet" href="${A}css/pages.css?v=20260625a">
${schemas}
</head>`;
}

function header({ urgency, esHref, loc, waMsg }) {
  const nav = `<a href="${A}index.html#servicios">Serveis</a><a href="${A}index.html#precios">Preus</a><a href="${A}subvenciones.html">Subvencions</a><a href="${CA_HUB}#zones">Zones</a><a href="${A}index.html#presupuesto">Pressupost</a><a href="${esHref}" hreflang="es" lang="es" class="lang-link">Castellano</a>`;
  return `<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P6C8L3VX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<div class="urgency-bar">🌡️ <strong>Temporada alta:</strong> ${urgency} <a href="tel:+34625215983"> Truca: 625 215 983</a></div>
<header class="site-header">
  <div class="header-inner">
    <a href="${CA_HUB}" class="logo"><picture><source srcset="${A}img/logo_zervitecnics.webp" type="image/webp"><img width="560" height="120" src="${A}img/logo_zervitecnics.png" alt="Zervitecnics"  style="height:56px;width:auto;object-fit:contain"></picture></a>
    <nav class="main-nav">${nav}</nav>
    <div class="header-cta">
      <a href="tel:+34625215983" class="btn-phone" data-location="header-${loc}">${PHONE_SVG}625 215 983</a>
      <a href="${wa(waMsg)}" class="btn-whatsapp-header" target="_blank" rel="noopener">${WA_SVG}<span>WhatsApp</span></a>
    </div>
    <button class="hamburger" aria-label="Menú"><span></span><span></span><span></span></button>
  </div>
  <nav class="mobile-nav"><a href="${CA_HUB}">Inici</a><a href="${A}index.html#servicios">Serveis</a><a href="${A}index.html#precios">Preus</a><a href="${A}subvenciones.html">Subvencions</a><a href="${esHref}" hreflang="es" lang="es">Castellano</a><div class="mobile-nav-cta"><a href="tel:+34625215983" class="btn btn-secondary btn-sm">Truca</a><a href="https://wa.me/34625215983" class="btn btn-green btn-sm" target="_blank" rel="noopener">WhatsApp</a></div></nav>
</header>`;
}

// Reseñas en su idioma original (data/reviews.json → "original"). Si falta alguna en catalán
// (solo tenemos la traducción), se muestra la nota y el enlace a Google, sin carrusel.
function opinions() {
  const p = REV.place || {};
  const n = p.userRatingCount, avg = p.rating ? Number(p.rating).toFixed(1) : null;
  const revs = REV.reviews || [];
  const complete = revs.length && revs.every(r => r.original);
  const mes = s => String(s || '').replace(/\s*·.*$/, '').replace(/^(\w+) (\d{4})$/, '$1 de $2');
  const item = r => `  <li class="rev-item">
    <div class="rev-head">
      <span class="rev-avatar" aria-hidden="true">${esc(r.author.name.trim().charAt(0).toUpperCase())}</span>
      <div class="rev-who"><cite class="rev-author">${esc(r.author.name)}</cite><span class="rev-when">${esc(mes(r.relative))}</span></div>
      <span class="rev-g" aria-label="Google" title="Google">G</span>
    </div>
    <span class="rev-stars" aria-label="${r.rating} de 5 estrelles">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
    <blockquote class="rev-text"${r.idioma && r.idioma !== 'ca' ? ` lang="${r.idioma}"` : ''}>${esc(r.original)}</blockquote>
  </li>`;
  return `<section class="section" id="opinions" aria-labelledby="opinions-title">
  <div class="container">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">Opinions de clients</span>
      <h2 class="section-title" id="opinions-title">Què diuen de nosaltres</h2>
      ${avg ? `<p class="rev-summary"><strong>${avg}/5</strong>${n ? ` amb ${n} ressenyes` : ''} a <a href="${esc(p.googleMapsUri || REV.reviewUrl)}" rel="nofollow noopener" target="_blank">Google</a>.</p>` : ''}
    </div>
${complete ? `    <div class="rev-marquee">
      <ul class="rev-list rev-track">
${revs.map(item).join('\n')}
      </ul>
    </div>
    <p class="rev-cta"><a class="btn btn-outline" href="${esc(REV.reviewUrl)}" rel="nofollow noopener" target="_blank">Deixa la teva ressenya a Google</a></p>
    <p class="rev-attrib">Ressenyes publicades pels autors a Google, en la llengua original. Zervitecnics no en modifica el contingut.</p>` : `    <p class="rev-cta text-center"><a class="btn btn-outline" href="${esc(p.googleMapsUri || REV.reviewUrl)}" rel="nofollow noopener" target="_blank">Llegeix les ressenyes a Google</a></p>`}
  </div>
</section>`;
}

function footer() {
  return `<section class="brands-section" style="padding:32px 0">
  <div class="container">
    <p class="brands-label">Instal·lem totes les marques líders</p>
    ${BRANDS}
  </div>
</section>

<footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><div class="logo"><picture><source srcset="${A}img/logo_zervitecnics.webp" type="image/webp"><img width="560" height="120" src="${A}img/logo_zervitecnics.png" alt="Zervitecnics"  style="height:56px;width:auto;object-fit:contain"></picture></div><p style="margin-top:16px">Instal·lació professional d'aire condicionat a Barcelona i l'àrea metropolitana.</p></div><div class="footer-col"><h4>Zones</h4><ul>${DATA.map(d => `<li><a href="${CA_HUB}zones/${d.slug}.html">${esc(d.nombre.charAt(0).toUpperCase() + d.nombre.slice(1))}</a></li>`).join('')}</ul></div><div class="footer-col"><h4>Serveis (en castellà)</h4><ul><li><a href="${A}categorias/split.html">Split 1×1</a></li><li><a href="${A}categorias/multisplit.html">Multisplit</a></li><li><a href="${A}categorias/conductos.html">Per conductes</a></li><li><a href="${A}guias/index.html">Guies</a></li><li><a href="${A}mantenimiento.html">Manteniment</a></li><li><a href="${A}subvenciones.html">Subvencions</a></li></ul></div><div class="footer-col"><h4>Contacte</h4><div class="footer-contact-item">${PHONE_SVG.replace('fill="currentColor" style="width:16px;height:16px"', 'fill="var(--blue)" style="width:18px;height:18px"')}<a href="tel:+34625215983" style="color:rgba(255,255,255,.6)">625 215 983</a></div></div></div><div class="footer-bottom"><p>© 2026 Zervitecnics Barcelona.</p><div class="footer-legal"><a href="${A}legal/privacidad.html">Privadesa</a><a href="${A}legal/cookies.html">Galetes</a><a href="${A}legal/aviso-legal.html">Avís legal</a></div></div></footer>
<a class="whatsapp-float" href="https://wa.me/34625215983" target="_blank" rel="noopener" aria-label="Contacta per WhatsApp">${WA_FLOAT_SVG}</a>
<div class="cookie-banner"><div class="cookie-text">Fem servir galetes. <a href="${A}legal/cookies.html">Més informació</a></div><div class="cookie-actions"><button class="btn-cookie-accept">Accepta</button><button class="btn-cookie-necessary">Només les necessàries</button></div></div>
<script src="${A}js/shared.js?v=${V_JS}"></script>
<script src="${A}js/pages.js?v=20260625a"></script>

<!-- ── NOTA LEGAL MARQUES ── -->
<div style="background:#F8F9FA;border-top:1px solid #E5E7EB;padding:16px 0;font-size:.75rem;color:#6B7280;line-height:1.6">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <strong style="color:#374151">Avís legal sobre marques comercials:</strong>
    Zervitecnics no té relació comercial, societària ni representació oficial amb cap de les marques que es mostren en aquest lloc web, llevat d'indicació expressa en contra.
    Els noms comercials, les marques registrades i els logotips de fabricants (Daikin, Mitsubishi Electric, Fujitsu, LG, Samsung, Hisense, Haier, Panasonic, Toshiba, Midea, Dicore i altres) s'utilitzen només amb caràcter descriptiu i informatiu, per facilitar a l'usuari la identificació dels productes amb què Zervitecnics presta els seus serveis de subministrament, instal·lació i manteniment.
    L'ús referencial d'aquestes marques no implica associació, patrocini, autorització ni representació oficial per part dels fabricants, i es fa a l'empara de l'article 37 de la Llei 17/2001 de Marques i la normativa comunitària aplicable.
  </div>
</div>

</body>
</html>
`;
}

const breadcrumb = items => `  <script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item }))
}, null, 2)}
  </script>`;

// Bloques vacíos con marcadores: applyZona los rellena con el contenido del distrito.
const slot = name => `<!-- DISTRITO:${name}:start -->\n<!-- DISTRITO:${name}:end -->`;

function zonePage(d) {
  const n = esc(d.nombre), loc = d.slug;
  const waMsg = `Hola, m'interessa instal·lar aire condicionat a ${d.nombre}.`;
  const html = `${head({
    title: d.title, desc: d.metaDesc, canonical: caUrl(d.slug), slug: d.slug,
    schemas: `${slot('schema-servicio')}\n${slot('schema-faq')}\n${breadcrumb([['Inici', caUrl()], ['Zones', `${caUrl()}#zones`], [d.nombre, caUrl(d.slug)]])}`
  })}
${header({ urgency: `Reserva ja la teva instal·lació a ${n}.`, esHref: `${A}zonas/${d.slug}.html`, loc, waMsg })}

<section class="page-hero">
  <div class="page-hero-content">
    <nav class="breadcrumb"><a href="${CA_HUB}">Inici</a><span class="sep">›</span><a href="${CA_HUB}#zones">Zones</a><span class="sep">›</span><span class="current">${n}</span></nav>
    <div class="zona-tag">${n} · Barcelona</div>
    <h1>Instal·lació d'aire condicionat<br>a ${n}</h1>
    <p></p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="${A}index.html#presupuesto" class="btn btn-primary">Demana pressupost gratuït</a>
      <a href="tel:+34625215983" class="btn btn-secondary" data-location="hero-${loc}">625 215 983</a>
    </div>
  </div>
</section>

${slot('contenido')}

<section class="section section-gray">
  <div class="container">
    <div class="text-center mb-32 fade-up"><span class="section-label">Serveis</span><h2 class="section-title">Què instal·lem a ${n}?</h2></div>
    <div class="grid grid-3 fade-up">
      <a href="${A}categorias/split.html" class="service-card" style="text-decoration:none">
        <picture><source srcset="${A}img/hero_split.webp" type="image/webp"><img width="1200" height="900" src="${A}img/hero_split.jpg" alt="Imatge il·lustrativa: split de paret en un menjador" class="service-img" loading="lazy"></picture>
        <div class="service-body"><h3 class="service-title">Split 1×1</h3><p class="service-desc">Per a habitacions i menjadors. Instal·lació en 1 dia. Consulta el preu.</p><span class="service-link">Veure preus →</span></div>
      </a>
      <a href="${A}categorias/multisplit.html" class="service-card" style="text-decoration:none">
        <picture><source srcset="${A}img/multisplit_service.webp" type="image/webp"><img width="1200" height="675" src="${A}img/multisplit_service.jpg" alt="Imatge il·lustrativa: instal·lació multisplit" class="service-img" loading="lazy"></picture>
        <div class="service-body"><h3 class="service-title">Multisplit</h3><p class="service-desc">Per a tot el pis. Una unitat exterior i diverses d'interiors. Des de 1.487 € + IVA.</p><span class="service-link">Veure preus →</span></div>
      </a>
      <a href="${A}categorias/conductos.html" class="service-card" style="text-decoration:none">
        <picture><source srcset="${A}img/conductos_service.webp" type="image/webp"><img width="1200" height="675" src="${A}img/conductos_service.jpg" alt="Imatge il·lustrativa: aire condicionat per conductes" class="service-img" loading="lazy"></picture>
        <div class="service-body"><h3 class="service-title">Per conductes</h3><p class="service-desc">Climatització invisible. Ideal per a reformes. Des de 2.397 € + IVA.</p><span class="service-link">Veure preus →</span></div>
      </a>
    </div>
    <p class="text-center" style="font-size:.85rem;color:var(--gray-500);margin-top:16px">Les fitxes de preus i el formulari de pressupost són en castellà.</p>
  </div>
</section>

<section class="section" id="com-triar" aria-labelledby="triar-title">
  <div class="container">
    <h2 class="section-title" id="triar-title">Empresa instal·ladora d'aire condicionat a ${n}: com triar un bon instal·lador</h2>
    <p class="section-subtitle">Abans de contractar, comprova que l'instal·lador que et visita sigui el mateix que instal·la i certifica, que valori l'habitatge abans de donar un preu tancat i que ofereixi garantia per escrit. A ${n} treballem així: visita prèvia, preu clar, garantia d'instal·lació d'1 any i resposta en menys de 2 h en horari d'atenció.</p>
  </div>
</section>
${opinions()}
${slot('faq')}

<!-- ── CROSS-LINK MANTENIMENT ── -->
<section style="padding:32px 0;background:#F0FDF4;border-top:1px solid #DCFCE7;border-bottom:1px solid #DCFCE7">
  <div class="container" style="text-align:center">
    <p style="font-size:1rem;color:#166534;margin-bottom:14px;max-width:640px;margin-left:auto;margin-right:auto">
      <strong>Ja tens aire condicionat instal·lat?</strong> També fem manteniment preventiu (70 € + IVA), correctiu (130 € + IVA) i diagnòstic tècnic a ${n}.
    </p>
    <a href="${d.mantenimientoUrl ? `${A}mantenimiento.html` : `${A}mantenimiento-zonas/${d.slug}.html`}" class="btn btn-secondary" data-location="crosslink-mant-${loc}">${d.mantenimientoUrl ? "Manteniment d'aire condicionat" : `Manteniment a ${n}`} (en castellà) →</a>
  </div>
</section>

<section class="section cta-section">
  <div class="container">
    <div class="cta-inner fade-up">
      <h2 class="cta-title">Necessites instal·lar aire condicionat a ${n}?</h2>
      <p class="cta-subtitle">Resposta en menys de 2 h en horari d'atenció. Sense compromís.</p>
      <div class="cta-buttons">
        <a href="tel:+34625215983" class="btn btn-primary btn-lg" data-location="cta-${loc}">Truca: 625 215 983</a>
        <a href="${wa(waMsg)}" class="btn btn-green btn-lg" target="_blank" rel="noopener">WhatsApp ara</a>
      </div>
    </div>
  </div>
</section>

${footer()}`;
  return applyZona(html, d, 'ca', `ca/aire-condicionat/zones/${d.slug}.html`);
}

function hubPage() {
  const title = "Instal·lació d'aire condicionat a Barcelona | Zervitecnics";
  const desc = "Instal·lació d'aire condicionat a Barcelona, districte per districte: barris, tipus d'habitatge i normativa. Pressupost gratuït. ☎ 625 215 983";
  const schemas = breadcrumb([['Inici', caUrl()]]);
  return `${head({ title, desc, canonical: caUrl(), slug: null, schemas })}
${header({ urgency: "Reserva ja la teva instal·lació a Barcelona.", esHref: A, loc: 'ca-hub', waMsg: "Hola, m'interessa instal·lar aire condicionat a Barcelona." })}

<section class="page-hero">
  <div class="page-hero-content">
    <div class="zona-tag">Barcelona i àrea metropolitana</div>
    <h1>Instal·lació d'aire condicionat<br>a Barcelona</h1>
    <p>El tècnic que instal·la és el que certifica. Sense intermediaris. Resposta en menys de 2 h en horari d'atenció.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="${A}index.html#presupuesto" class="btn btn-primary">Demana pressupost gratuït</a>
      <a href="tel:+34625215983" class="btn btn-secondary" data-location="hero-ca-hub">625 215 983</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px">
    <h2 class="section-title">Com treballem</h2>
    <ul class="service-checklist">
      <li class="service-check-item">Visita prèvia i preu tancat abans de començar.</li>
      <li class="service-check-item">Instal·lació en 1 dia en la majoria d'habitatges.</li>
      <li class="service-check-item">Garantia: 1 any a la instal·lació i 3 anys del fabricant a l'equip.</li>
      <li class="service-check-item">Split, multisplit i conductes de totes les marques líders.</li>
    </ul>
    <p style="margin-top:16px">Cada districte de Barcelona té els seus edificis, els seus barris i les seves normes de comunitat. A la pàgina de cada districte t'expliquem com s'instal·la a cada barri i què has de tenir en compte abans de començar.</p>
  </div>
</section>

<section class="section section-gray" id="zones" aria-labelledby="zones-title">
  <div class="container">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">Cobertura</span>
      <h2 class="section-title" id="zones-title">Els districtes de Barcelona</h2>
      <p class="section-subtitle">També treballem a l'àrea metropolitana: <a href="${A}index.html#zonas" style="color:var(--blue)">vegeu totes les zones (en castellà)</a>.</p>
    </div>
    <div class="zones-grid fade-up">
${DATA.map(d => `      <a href="zones/${d.slug}.html" class="zone-card">
        <div class="zone-icon">${EMOJI[d.slug]}</div>
        <div class="zone-name">${esc(d.nombre.charAt(0).toUpperCase() + d.nombre.slice(1))}</div>
      </a>`).join('\n')}
    </div>
  </div>
</section>
${opinions()}
<section class="section cta-section">
  <div class="container">
    <div class="cta-inner fade-up">
      <h2 class="cta-title">Necessites instal·lar aire condicionat a Barcelona?</h2>
      <p class="cta-subtitle">Resposta en menys de 2 h en horari d'atenció. Sense compromís.</p>
      <div class="cta-buttons">
        <a href="tel:+34625215983" class="btn btn-primary btn-lg" data-location="cta-ca-hub">Truca: 625 215 983</a>
        <a href="${wa("Hola, m'interessa instal·lar aire condicionat a Barcelona.")}" class="btn btn-green btn-lg" target="_blank" rel="noopener">WhatsApp ara</a>
      </div>
    </div>
  </div>
</section>

${footer()}`;
}

// Versión en castellano: hreflang en <head> y enlace «Català» en el menú.
function linkSpanish(file, slug) {
  let html = fs.readFileSync(file, 'utf8');
  const tags = `<!-- HREFLANG:start -->\n${hreflang(slug)}\n  <!-- HREFLANG:end -->`;
  if (/<!-- HREFLANG:start -->[\s\S]*?<!-- HREFLANG:end -->/.test(html)) html = html.replace(/<!-- HREFLANG:start -->[\s\S]*?<!-- HREFLANG:end -->/, tags);
  else html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n  ${tags}`);
  const href = slug ? `${CA_HUB}zones/${slug}.html` : CA_HUB;
  if (!html.includes('class="lang-link"')) {
    const link = `<a href="${href}" hreflang="ca" lang="ca" class="lang-link">Català</a>`;
    // El menú del hub ya va justo de ancho en escritorio: allí el enlace va al pie.
    if (slug) html = html.replace(/(<nav class="main-nav"[^>]*>[\s\S]*?)(\s*<\/nav>)/, `$1${link}$2`);
    else html = html.replace(/(<div class="footer-legal">)/, `$1${link}`);
    html = html.replace(/(<nav class="mobile-nav"[^>]*>[\s\S]*?)(\s*<div class="mobile-nav-cta">)/, `$1${link}$2`);
  }
  fs.writeFileSync(file, html);
}

fs.mkdirSync(path.join(OUT, 'zones'), { recursive: true });
for (const d of DATA) {
  fs.writeFileSync(path.join(OUT, 'zones', `${d.slug}.html`), zonePage(d));
  linkSpanish(path.join(ES, 'zonas', `${d.slug}.html`), d.slug);
  console.log('✓ ca/aire-condicionat/zones/' + d.slug + '.html');
}
fs.writeFileSync(path.join(OUT, 'index.html'), hubPage());
linkSpanish(path.join(ES, 'index.html'), null);
console.log('✓ ca/aire-condicionat/index.html');
