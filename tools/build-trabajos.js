#!/usr/bin/env node
/*
 * build-trabajos.js — Genera la galería «Trabajos realizados» (una página por
 * trabajo + un índice) a partir de data/trabajos.json.
 *
 * REGLAS (para que la galería sea siempre real):
 *   - Cada trabajo necesita "permiso_cliente": true.
 *   - Cada foto necesita archivo existente y "alt" descriptivo de lo que se ve.
 *   - Sin trabajos en data/trabajos.json no se genera nada.
 *
 * Campos de un trabajo:
 *   slug, titulo, tipo (split | multisplit | conductos | cassette | suelo-techo | otro),
 *   marca, zona, fecha ("2026-10"), descripcion, puntos [..], fotos [{archivo, alt, pie}],
 *   permiso_cliente, indexar (false por defecto → noindex), resena {autor, texto} (opcional)
 *
 * Las fotos van en trabajos/img/<slug>/<archivo>.
 *
 * Uso:  node tools/build-trabajos.js
 *       node tools/build-trabajos.js --data <json> --out <carpeta>   (pruebas)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const DATA = arg('--data') ? path.resolve(arg('--data')) : path.join(REPO, 'data', 'trabajos.json');
const OUT = arg('--out') ? path.resolve(arg('--out')) : path.join(REPO, 'trabajos');
const IMG_ROOT = arg('--img') ? path.resolve(arg('--img')) : path.join(REPO, 'trabajos', 'img');
const BASE = 'https://zervitecnics.es/trabajos/';
const WA = '34625215983';
const TIPOS = { split: 'Split', multisplit: 'Multisplit', conductos: 'Conductos', cassette: 'Cassette', 'suelo-techo': 'Suelo-techo', otro: 'Otros' };

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fecha = f => { const m = /^(\d{4})-(\d{2})$/.exec(f || ''); return m ? `${MESES[+m[2] - 1]} de ${m[1]}` : ''; };

function head(title, desc, canonical, noindex) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#1E90FF">
  <meta name="robots" content="${noindex ? 'noindex,nofollow' : 'index,follow'}">
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent','default',{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});
  </script>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-P6C8L3VX');</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <link rel="stylesheet" href="/aires-acondicionados/css/shared.css?v=20260625a">
</head>
<body class="trb-body">
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P6C8L3VX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <header class="trb-top"><a class="trb-brand" href="/aires-acondicionados/"><img src="/aires-acondicionados/img/logo_zervitecnics.png" alt="Zervitecnics" width="168" height="36"></a>
  <a class="trb-back" href="/aires-acondicionados/">← Volver a la web</a></header>
`;
}

const cta = `  <section class="trb-cta">
    <h2>¿Quieres un trabajo así en tu casa?</h2>
    <p>Respuesta en menos de 2 horas en horario de atención. Presupuesto sin compromiso.</p>
    <p><a class="btn btn-primary" href="/aires-acondicionados/#presupuesto" data-evento="trabajos_cta_presupuesto">Pedir presupuesto</a>
    <a class="btn btn-outline" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola, he visto vuestros trabajos realizados y me gustaría pedir presupuesto.')}" target="_blank" rel="noopener" data-evento="trabajos_cta_whatsapp">WhatsApp</a></p>
  </section>
</body>
</html>
`;

function validar(t) {
  const errs = [];
  if (!t.slug || !/^[a-z0-9-]+$/.test(t.slug)) errs.push('slug inválido');
  if (t.permiso_cliente !== true) errs.push('falta "permiso_cliente": true');
  if (!Array.isArray(t.fotos) || !t.fotos.length) errs.push('sin fotos');
  (t.fotos || []).forEach((f, i) => {
    if (!f.alt || f.alt.trim().length < 8) errs.push(`foto ${i + 1}: falta alt descriptivo`);
    if (!fs.existsSync(path.join(IMG_ROOT, t.slug, f.archivo || ''))) errs.push(`foto ${i + 1}: no existe ${f.archivo}`);
  });
  return errs;
}

function paginaTrabajo(t) {
  const tipo = TIPOS[t.tipo] || TIPOS.otro;
  const canonical = BASE + t.slug + '.html';
  const titulo = `${t.titulo} — Trabajos realizados | Zervitecnics`;
  const desc = (t.descripcion || '').slice(0, 155);
  const imgBase = `/trabajos/img/${t.slug}/`;
  const fotos = t.fotos.map((f, i) => `    <figure class="trb-fig${i === 0 ? ' trb-fig-main' : ''}">
      <img src="${imgBase}${esc(f.archivo)}" alt="${esc(f.alt)}" loading="${i === 0 ? 'eager' : 'lazy'}">
      ${f.pie ? `<figcaption>${esc(f.pie)}</figcaption>` : ''}
    </figure>`).join('\n');
  const puntos = (t.puntos || []).map(p => `      <li>${esc(p)}</li>`).join('\n');
  const resena = t.resena && t.resena.texto ? `    <blockquote class="trb-resena">«${esc(t.resena.texto)}»<footer>— ${esc(t.resena.autor || 'Cliente')}, reseña en Google</footer></blockquote>` : '';
  return head(titulo, desc, canonical, t.indexar !== true) + `  <main class="trb-wrap">
    <nav class="trb-crumb"><a href="/trabajos/">Trabajos realizados</a> › ${esc(t.titulo)}</nav>
    <h1>${esc(t.titulo)}</h1>
    <p class="trb-meta"><span>${esc(tipo)}</span>${t.marca ? `<span>${esc(t.marca)}</span>` : ''}${t.zona ? `<span>${esc(t.zona)}</span>` : ''}${t.fecha ? `<span>${esc(fecha(t.fecha))}</span>` : ''}</p>
    <div class="trb-fotos">
${fotos}
    </div>
    <p class="trb-desc">${esc(t.descripcion || '')}</p>
${puntos ? `    <h2>Qué se hizo</h2>\n    <ul class="trb-puntos">\n${puntos}\n    </ul>` : ''}
${resena}
  </main>
` + cta;
}

function paginaIndice(trabajos) {
  const tipos = [...new Set(trabajos.map(t => t.tipo || 'otro'))];
  const chips = tipos.length > 1 ? `    <div class="trb-chips" role="group" aria-label="Filtrar por tipo">
      <button class="trb-chip is-on" data-f="todos" type="button">Todos</button>
${tipos.map(k => `      <button class="trb-chip" data-f="${esc(k)}" type="button">${esc(TIPOS[k] || TIPOS.otro)}</button>`).join('\n')}
    </div>` : '';
  const cards = trabajos.map(t => `      <li class="trb-card" data-tipo="${esc(t.tipo || 'otro')}">
        <a href="/trabajos/${t.slug}.html" data-evento="trabajos_ver_trabajo">
          <img src="/trabajos/img/${t.slug}/${esc(t.fotos[0].archivo)}" alt="${esc(t.fotos[0].alt)}" loading="lazy">
          <div class="trb-card-body">
            <h2>${esc(t.titulo)}</h2>
            <p class="trb-meta"><span>${esc(TIPOS[t.tipo] || TIPOS.otro)}</span>${t.zona ? `<span>${esc(t.zona)}</span>` : ''}${t.fecha ? `<span>${esc(fecha(t.fecha))}</span>` : ''}</p>
          </div>
        </a>
      </li>`).join('\n');
  const script = tipos.length > 1 ? `  <script>
    document.querySelectorAll('.trb-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.trb-chip').forEach(function (c) { c.classList.toggle('is-on', c === b); });
        var f = b.getAttribute('data-f');
        document.querySelectorAll('.trb-card').forEach(function (c) { c.hidden = !(f === 'todos' || c.getAttribute('data-tipo') === f); });
      });
    });
  </script>\n` : '';
  const noindex = !trabajos.some(t => t.indexar === true);
  return head('Trabajos realizados | Zervitecnics', 'Instalaciones de aire acondicionado reales de Zervitecnics en Barcelona: fotos de cada trabajo, equipo instalado y zona.', BASE, noindex) + `  <main class="trb-wrap">
    <h1>Trabajos realizados</h1>
    <p class="trb-intro">Fotos reales de instalaciones hechas por Zervitecnics, con permiso de cada cliente.</p>
${chips}
    <ul class="trb-grid">
${cards}
    </ul>
  </main>
` + script + cta;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const trabajos = (data.trabajos || []).filter(t => !t.ejemplo);
  if (!trabajos.length) { console.log('[trabajos] sin trabajos en data/trabajos.json: no se genera nada.'); return; }
  let fallos = 0;
  for (const t of trabajos) {
    const e = validar(t);
    if (e.length) { fallos++; console.error(`[trabajos] ✘ ${t.slug || '(sin slug)'}: ${e.join('; ')}`); }
  }
  if (fallos) { console.error('[trabajos] corrige los errores y vuelve a ejecutar.'); process.exit(1); }
  trabajos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  fs.mkdirSync(OUT, { recursive: true });
  for (const t of trabajos) fs.writeFileSync(path.join(OUT, t.slug + '.html'), paginaTrabajo(t));
  fs.writeFileSync(path.join(OUT, 'index.html'), paginaIndice(trabajos));
  console.log(`[trabajos] generadas ${trabajos.length} página(s) + índice en ${OUT}`);
}
main();
