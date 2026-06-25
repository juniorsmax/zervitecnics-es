#!/usr/bin/env node
/*
 * Generador Fase 4 — páginas SEO long-tail por geografía.
 *
 * Produce dos cruces a partir de tools/data/{marcas,capacidades,ciudades}.json:
 *   1) marca × ciudad     → aires-acondicionados/marcas/{marca-slug}-{ciudad-slug}.html
 *   2) capacidad × ciudad → aires-acondicionados/capacidades/{frig}-frigorias-{ciudad-slug}.html
 *
 * Con N=10 marcas, M=4 capacidades, C=40 ciudades genera N·C + M·C = 560 páginas.
 *
 * Para añadir/quitar ciudades edita tools/data/ciudades.json y re-ejecuta este script
 * (no toques el código). Lo mismo para marcas y capacidades.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT_MARCAS = path.join(REPO, 'aires-acondicionados', 'marcas');
const OUT_CAP = path.join(REPO, 'aires-acondicionados', 'capacidades');
const CACHE_BUST = 'v=20260625a';

const MARCAS = require('./data/marcas.json');
const CAPACIDADES = require('./data/capacidades.json');
const CIUDADES = require('./data/ciudades.json');

const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';

const BRANDS_GRID_HTML = MARCAS.map(m =>
  `      <div class="brand-item" title="Instalación ${m.nombre} Barcelona"><a href="${m.slug}.html"><div class="brand-svg" style="color:${m.color};font-size:1.1rem;font-weight:700">${m.nombre.toUpperCase()}</div></a></div>`
).join('\n');

function distanciaTxt(km) {
  if (km === 0) return 'sin desplazamiento (servicio local en Barcelona ciudad)';
  if (km <= 10) return `a unos ${km} km de Barcelona, dentro del Área Metropolitana inmediata`;
  if (km <= 25) return `a unos ${km} km del centro de Barcelona, con cobertura habitual`;
  if (km <= 40) return `a unos ${km} km de Barcelona, dentro de nuestra zona ampliada`;
  return `a unos ${km} km de Barcelona; consultamos disponibilidad de fecha previamente`;
}

function paginaMarcaCiudad(marca, ciudad) {
  const fileName = `${marca.slug}-${ciudad.slug}.html`;
  const url = `https://zervitecnics.es/aires-acondicionados/marcas/${fileName}`;
  const title = `Aire Acondicionado ${marca.nombre} en ${ciudad.nombre} | Instalación y Mantenimiento`;
  const desc = `Instalación y mantenimiento de aire acondicionado ${marca.nombre} en ${ciudad.nombre} (${ciudad.comarca}). Técnico autorizado, presupuesto gratis en 24h.`;
  const h1 = `Aire acondicionado <span style="color:${marca.color}">${marca.nombre}</span> en ${ciudad.nombre}`;
  const lightBg = marca.color + '22';
  const borderBg = marca.color + '44';
  const checklistHTML = marca.checklist.map(item => `<li class="service-check-item">${CHECK_SVG}${item}</li>`).join('\n');

  const priceCardsHTML = CAPACIDADES.map((cap, i) => `
<div class="price-card${i === 1 ? ' featured' : ''}">
  ${i === 1 ? "<div class='price-badge'>Más vendido</div>" : ''}
  <div class="price-name">${marca.modeloRecomendado} ${cap.kw} kW</div>
  <div class="price-desc">${cap.frig} frigorías · ${cap.m2Min}-${cap.m2Max} m²</div>
  <div class="price-amount"><sup>€</sup>${cap.precioDesde.toLocaleString('es-ES')}</div>
  <div class="price-from">Pack completo · IVA incluido</div>
  <ul class="price-features">
    <li class="price-feature">${CHECK_SVG} Equipo + instalación</li>
    <li class="price-feature">${CHECK_SVG} Certificación profesional</li>
    <li class="price-feature">${CHECK_SVG} Doble garantía incluida</li>
  </ul>
  <a href="${marca.slug}-${cap.frig}-frigorias.html" class="btn btn-primary w-full">Ver ${cap.frig} frigorías</a>
</div>`).join('\n');

  const waText = encodeURIComponent(`Hola, me interesa instalar un aire acondicionado ${marca.nombre} en ${ciudad.nombre}.`);
  const distTxt = distanciaTxt(ciudad.kmDesdeBarcelona);

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://zervitecnics.es/' },
        { '@type': 'ListItem', position: 2, name: marca.nombre, item: `https://zervitecnics.es/aires-acondicionados/marcas/${marca.slug}.html` },
        { '@type': 'ListItem', position: 3, name: ciudad.nombre }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: `Instalación de aire acondicionado ${marca.nombre}`,
      provider: {
        '@type': 'LocalBusiness',
        name: 'Zervitecnics',
        telephone: '+34625215983',
        address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' }
      },
      areaServed: {
        '@type': 'City',
        name: ciudad.nombre,
        containedInPlace: { '@type': 'AdministrativeArea', name: ciudad.comarca }
      },
      url
    }
  ];

  return template({
    url, title, desc, h1, lightBg, borderBg,
    waText,
    breadcrumbHTML: `<a href="../index.html">Inicio</a><span class="sep">›</span><a href="${marca.slug}.html">${marca.nombre}</a><span class="sep">›</span><span class="current">${ciudad.nombre}</span>`,
    badgeTxt: marca.tagline,
    badgeColor: marca.color,
    heroIntro: `Servicio de instalación y mantenimiento de aire acondicionado <strong>${marca.nombre}</strong> en <strong>${ciudad.nombre}</strong> (${ciudad.comarca}). ${capitalize(distTxt)}. Atendemos tu solicitud con presupuesto sin compromiso en menos de 24h.`,
    sectionLabel: `${marca.nombre} en ${ciudad.nombre}`,
    sectionTitle: `${marca.nombre} en ${ciudad.nombre}: instalación y servicio técnico`,
    sectionParas: [
      marca.descripcion,
      `<strong>${ciudad.nombre}</strong> (${ciudad.comarca}) es ${ciudad.notas}, ${distTxt}. Trabajamos toda la zona con desplazamiento ágil y técnico certificado oficial. Para los equipos ${marca.nombre} aplicamos los procedimientos de instalación recomendados por el fabricante: vacío, prueba de estanqueidad y carga complementaria de refrigerante si la línea frigorífica supera la carga precargada.`,
      `Para que esta página te sirva como referencia: los precios "desde" aplican a viviendas de ${ciudad.nombre} con instalación estándar (split de pared, dos máquinas a menos de 5 metros de distancia, tirada lineal de tubería frigorífica). En instalaciones que requieran taladros en hormigón armado, cubierta de pizarra o subida con grúa, el técnico te indicará el coste adicional antes de empezar.`
    ],
    checklistHTML,
    priceSectionLabel: `Modelos ${marca.nombre} para ${ciudad.nombre}`,
    priceSectionTitle: `Precios orientativos de ${marca.nombre} en ${ciudad.nombre}`,
    priceCardsHTML,
    capacityInfoLabel: `Servicio técnico ${marca.nombre} en ${ciudad.nombre}`,
    capacityInfoTitle: `Mantenimiento y reparación de equipos ${marca.nombre} en ${ciudad.nombre}`,
    capacityInfoParas: [
      `Además de la instalación, ofrecemos <strong>mantenimiento preventivo</strong>, <strong>reparación de averías</strong> y <strong>recargas de gas refrigerante</strong> para equipos ${marca.nombre} en ${ciudad.nombre} y resto de ${ciudad.comarca}. El mantenimiento periódico es la principal causa de longevidad del equipo y prolonga la vigencia de la garantía de instalación.`,
      `<strong>Tiempo de respuesta orientativo</strong> para ${ciudad.nombre}: visitas técnicas habitualmente disponibles en 24-72 horas según temporada. En picos de temporada alta (junio-agosto) recomendamos solicitar el servicio cuanto antes para asegurar fecha.`,
      `Trabajamos exclusivamente con repuestos originales o equivalentes homologados. Tras cualquier intervención entregamos <strong>parte de trabajo</strong> con el material utilizado y las pruebas realizadas, válido para reclamación de garantía del fabricante si fuera necesario.`
    ],
    ctaTitle: `¿Necesitas instalar o reparar un ${marca.nombre} en ${ciudad.nombre}?`,
    ctaLocation: `${marca.slug}-${ciudad.slug}`,
    jsonld
  });
}

function paginaCapacidadCiudad(cap, ciudad) {
  const fileName = `${cap.frig}-frigorias-${ciudad.slug}.html`;
  const url = `https://zervitecnics.es/aires-acondicionados/capacidades/${fileName}`;
  const title = `Aire Acondicionado ${cap.frig} Frigorías en ${ciudad.nombre} | Instalación`;
  const desc = `Instalación de aire acondicionado de ${cap.frig} frigorías (${cap.btu} BTU) en ${ciudad.nombre} (${ciudad.comarca}). Ideal para ${cap.descripcionUso} de ${cap.m2Min} a ${cap.m2Max} m². Presupuesto en 24h.`;
  const h1 = `Aire acondicionado de <span style="color:#0066FF">${cap.frig} frigorías</span> en ${ciudad.nombre}`;
  const lightBg = '#0066FF22';
  const borderBg = '#0066FF44';

  // Sample 3 brand cards: Daikin, Mitsubishi, LG (representative tiers)
  const featuredBrands = ['daikin', 'mitsubishi', 'lg'].map(s => MARCAS.find(m => m.slug === s));
  const priceCardsHTML = featuredBrands.map((m, i) => `
<div class="price-card${i === 1 ? ' featured' : ''}">
  ${i === 1 ? "<div class='price-badge'>Más vendido</div>" : ''}
  <div class="price-name">${m.modeloRecomendado} ${cap.kw} kW</div>
  <div class="price-desc">${cap.frig} frigorías · ${m.nombre}</div>
  <div class="price-amount"><sup>€</sup>${(cap.precioDesde + i * 100).toLocaleString('es-ES')}</div>
  <div class="price-from">Pack completo · IVA incluido</div>
  <ul class="price-features">
    <li class="price-feature">${CHECK_SVG} Equipo + instalación</li>
    <li class="price-feature">${CHECK_SVG} Certificación profesional</li>
    <li class="price-feature">${CHECK_SVG} Doble garantía incluida</li>
  </ul>
  <a href="../marcas/${m.slug}-${cap.frig}-frigorias.html" class="btn btn-primary w-full">Ver ${m.nombre}</a>
</div>`).join('\n');

  // Brand grid relative paths from /capacidades/ folder go to ../marcas/
  const brandsGridRelative = MARCAS.map(m =>
    `      <div class="brand-item" title="Instalación ${m.nombre} ${ciudad.nombre}"><a href="../marcas/${m.slug}.html"><div class="brand-svg" style="color:${m.color};font-size:1.1rem;font-weight:700">${m.nombre.toUpperCase()}</div></a></div>`
  ).join('\n');

  const waText = encodeURIComponent(`Hola, me interesa instalar un aire acondicionado de ${cap.frig} frigorías en ${ciudad.nombre}.`);
  const distTxt = distanciaTxt(ciudad.kmDesdeBarcelona);

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://zervitecnics.es/' },
        { '@type': 'ListItem', position: 2, name: 'Aire acondicionado', item: 'https://zervitecnics.es/aires-acondicionados/' },
        { '@type': 'ListItem', position: 3, name: `${cap.frig} frigorías en ${ciudad.nombre}` }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: `Instalación de aire acondicionado de ${cap.frig} frigorías`,
      provider: {
        '@type': 'LocalBusiness',
        name: 'Zervitecnics',
        telephone: '+34625215983',
        address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' }
      },
      areaServed: {
        '@type': 'City',
        name: ciudad.nombre,
        containedInPlace: { '@type': 'AdministrativeArea', name: ciudad.comarca }
      },
      url
    }
  ];

  return template({
    url, title, desc, h1, lightBg, borderBg,
    waText,
    relPrefix: '../', // /capacidades/ is sibling of /marcas/, both inside /aires-acondicionados/
    breadcrumbHTML: `<a href="../index.html">Inicio</a><span class="sep">›</span><a href="../index.html#precios">Capacidades</a><span class="sep">›</span><span class="current">${cap.frig} frigorías en ${ciudad.nombre}</span>`,
    badgeTxt: `${cap.btu.toLocaleString('es-ES')} BTU · ${cap.kw} kW`,
    badgeColor: '#0066FF',
    heroIntro: `Instalación de aire acondicionado de <strong>${cap.frig} frigorías</strong> (${cap.btu.toLocaleString('es-ES')} BTU · ${cap.kw} kW) en <strong>${ciudad.nombre}</strong> (${ciudad.comarca}). Capacidad recomendada para ${cap.descripcionUso} de ${cap.m2Min} a ${cap.m2Max} m². ${capitalize(distTxt)}.`,
    sectionLabel: `${cap.frig} frigorías en ${ciudad.nombre}`,
    sectionTitle: `Aire acondicionado de ${cap.frig} frigorías en ${ciudad.nombre}: ¿es lo que necesitas?`,
    sectionParas: [
      `La capacidad de <strong>${cap.frig} frigorías/h</strong> (${cap.btu.toLocaleString('es-ES')} BTU/h · ${cap.kw} kW térmicos) es la recomendada para refrigerar <strong>${cap.descripcionUso}</strong> de <strong>${cap.m2Min} a ${cap.m2Max} m²</strong> con altura estándar (2,5 m).`,
      `En <strong>${ciudad.nombre}</strong> (${ciudad.comarca}, ${distTxt}) las estancias con orientación sur o ventanales amplios al Mediterráneo pueden requerir subir a la siguiente capacidad. ${capitalize(ciudad.notas)}: tenlo en cuenta si el inmueble es de obra antigua sin aislamiento renovado, o si está en una planta alta con mucha exposición solar.`,
      `<strong>Cálculo orientativo</strong>: en torno a <strong>100 frigorías por m²</strong>, ajustando según orientación, aislamiento, número de ventanas y altura del techo. Antes de presupuestar realizamos siempre el cálculo de carga térmica personalizado en tu vivienda de ${ciudad.nombre}.`
    ],
    checklistHTML: [
      'Cálculo de carga térmica personalizado',
      'Equipo de marca premium con garantía oficial',
      'Instalación documentada con informe técnico',
      'Doble garantía: fabricante + instalación',
      `Servicio postventa en ${ciudad.nombre}`
    ].map(item => `<li class="service-check-item">${CHECK_SVG}${item}</li>`).join('\n'),
    priceSectionLabel: `Precios orientativos 2026`,
    priceSectionTitle: `Aire de ${cap.frig} frigorías en ${ciudad.nombre} — packs completos`,
    priceCardsHTML,
    capacityInfoLabel: `¿Qué son ${cap.frig} frigorías?`,
    capacityInfoTitle: `Capacidad ${cap.frig} frigorías (${cap.btu.toLocaleString('es-ES')} BTU · ${cap.kw} kW)`,
    capacityInfoParas: [
      `Una unidad de aire acondicionado de <strong>${cap.frig} frigorías/hora</strong> (${cap.btu.toLocaleString('es-ES')} BTU/h en sistema imperial) ofrece una potencia frigorífica aproximada de <strong>${cap.kw} kilovatios térmicos</strong>. Esta capacidad es la adecuada para refrigerar ${cap.descripcionUso} de <strong>${cap.m2Min} a ${cap.m2Max} m²</strong>.`,
      `<strong>Equivalencias</strong>: ${cap.frig} frigorías = ${cap.btu.toLocaleString('es-ES')} BTU = ${cap.kw} kW frigoríficos. La potencia eléctrica consumida es muy inferior (en torno a ${(cap.kw / 3.8).toFixed(1)} kW) gracias a la tecnología inverter de los equipos modernos.`,
      `<strong>Marcas que instalamos en ${ciudad.nombre}</strong> en esta capacidad: ${MARCAS.map(m => m.nombre).join(', ')}. Cada fabricante tiene su modelo recomendado en la gama de ${cap.frig} frigorías — solicítanos un comparativo personalizado.`
    ],
    ctaTitle: `¿Quieres un aire acondicionado de ${cap.frig} frigorías en ${ciudad.nombre}?`,
    ctaLocation: `${cap.frig}-${ciudad.slug}`,
    jsonld,
    brandsGridOverride: brandsGridRelative
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function template(p) {
  const prefix = p.relPrefix || '../';
  const brandsGrid = p.brandsGridOverride || BRANDS_GRID_HTML;
  const jsonldHTML = p.jsonld.map(obj =>
    `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`
  ).join('\n  ');
  const sectionParasHTML = p.sectionParas.map(t => `        <p>${t}</p>`).join('\n');
  const capacityInfoParasHTML = p.capacityInfoParas.map(t => `      <p>${t}</p>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${prefix}favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png">
  <meta name="theme-color" content="#1E90FF">
  <!-- ZRV-ANALYTICS-START -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent','default',{
      'analytics_storage':'denied',
      'ad_storage':'denied',
      'ad_user_data':'denied',
      'ad_personalization':'denied',
      'wait_for_update':500
    });
  </script>
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-P6C8L3VX');</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-N4C8H8KMFD"></script>
  <script>
    gtag('js', new Date());
    gtag('config','G-N4C8H8KMFD',{ anonymize_ip:true, send_page_view:true });
  </script>
  <script src="https://www.google.com/recaptcha/api.js?render=6LcESzAtAAAAAEhvnT0Zmh07PJUOkjYiC0qeed4S" async defer></script>
  <!-- ZRV-ANALYTICS-END -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com https://www.clarity.ms https://*.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com https://*.clarity.ms https://www.clarity.ms; connect-src 'self' https://api.emailjs.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://*.bing.com; frame-src https://www.googletagmanager.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'">
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}">
  <link rel="canonical" href="${p.url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.desc}">
  <meta property="og:image" content="https://zervitecnics.es/aires-acondicionados/img/hero_main.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- ZRV-FONTS -->
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"></noscript>
  <!-- /ZRV-FONTS -->
  <link rel="stylesheet" href="${prefix}css/shared.css?${CACHE_BUST}">
  <link rel="stylesheet" href="${prefix}css/pages.css?${CACHE_BUST}">
  ${jsonldHTML}
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P6C8L3VX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<div class="urgency-bar">🌡️ <strong>Temporada alta:</strong> Agenda tu instalación ahora. <a href="tel:+34625215983"> Llamar: 625 215 983</a></div>
<header class="site-header">
  <div class="header-inner">
    <a href="/aires-acondicionados/" class="logo"><picture><source srcset="${prefix}img/logo_zervitecnics.webp" type="image/webp"><img src="${prefix}img/logo_zervitecnics.png" alt="Zervitecnics" width="40" height="40" style="height:56px;width:auto;object-fit:contain"></picture></a>
    <nav class="main-nav"><a href="${prefix}index.html#servicios">Servicios</a><a href="${prefix}index.html#precios">Precios</a><a href="${prefix}subvenciones.html">Subvenciones</a><a href="${prefix}index.html#zonas">Zonas</a><a href="${prefix}index.html#faq">FAQ</a><a href="${prefix}index.html#presupuesto">Presupuesto</a></nav>
    <div class="header-cta">
      <a href="tel:+34625215983" class="btn-phone" data-location="header-${p.ctaLocation}"><svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>625 215 983</a>
      <a href="https://wa.me/34625215983?text=${p.waText}" class="btn-whatsapp-header" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>WhatsApp</span></a>
    </div>
    <button class="hamburger" aria-label="Menú"><span></span><span></span><span></span></button>
  </div>
  <nav class="mobile-nav"><a href="${prefix}index.html">Inicio</a><a href="${prefix}index.html#servicios">Servicios</a><a href="${prefix}index.html#precios">Precios</a><a href="${prefix}subvenciones.html">Subvenciones</a><div class="mobile-nav-cta"><a href="tel:+34625215983" class="btn btn-secondary btn-sm">Llamar</a><a href="https://wa.me/34625215983" class="btn btn-green btn-sm" target="_blank" rel="noopener">WhatsApp</a></div></nav>
</header>

<section class="page-hero" style="background:linear-gradient(135deg, #0B1E3D 0%, ${p.lightBg} 100%)">
  <div class="page-hero-content">
    <nav class="breadcrumb">${p.breadcrumbHTML}</nav>
    <div style="display:inline-block;background:${p.lightBg};border:1px solid ${p.borderBg};border-radius:9999px;padding:6px 16px;font-size:.8rem;font-weight:700;color:${p.badgeColor};margin-bottom:16px;letter-spacing:.06em;text-transform:uppercase">${p.badgeTxt}</div>
    <h1>${p.h1}</h1>
    <p>${p.heroIntro}</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a href="${prefix}index.html#presupuesto" class="btn btn-primary">Pedir presupuesto gratis</a>
      <a href="tel:+34625215983" class="btn btn-secondary" data-location="hero-${p.ctaLocation}">625 215 983</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="service-detail-grid fade-up">
      <div class="service-detail-img"><picture><source srcset="${prefix}img/hero_split.webp" type="image/webp"><img src="${prefix}img/hero_split.jpg" alt="${p.sectionLabel}" loading="lazy"></picture></div>
      <div class="service-detail-content">
        <span class="section-label">${p.sectionLabel}</span>
        <h2>${p.sectionTitle}</h2>
${sectionParasHTML}
        <ul class="service-checklist">
${p.checklistHTML}
        </ul>
        <a href="${prefix}index.html#presupuesto" class="btn btn-primary mt-24">Solicitar presupuesto gratis</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-gray">
  <div class="container">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">${p.priceSectionLabel}</span>
      <h2 class="section-title">${p.priceSectionTitle}</h2>
      <p class="section-subtitle">Pack completo: equipo + instalación + informe técnico incluido. IVA incluido. El precio final dependerá del modelo concreto y la complejidad de la instalación.</p>
    </div>
    <div class="grid grid-3 fade-up">
${p.priceCardsHTML}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">${p.capacityInfoLabel}</span>
      <h2 class="section-title">${p.capacityInfoTitle}</h2>
    </div>
    <div style="max-width:780px;margin:0 auto;color:var(--gray-600);line-height:1.8">
${capacityInfoParasHTML}
    </div>
  </div>
</section>

<section class="section cta-section">
  <div class="container">
    <div class="cta-inner fade-up">
      <h2 class="cta-title">${p.ctaTitle}</h2>
      <p class="cta-subtitle">Presupuesto gratuito en menos de 24 horas. Técnico autorizado.</p>
      <div class="cta-buttons">
        <a href="tel:+34625215983" class="btn btn-primary btn-lg" data-location="cta-${p.ctaLocation}">Llamar: 625 215 983</a>
        <a href="https://wa.me/34625215983?text=${p.waText}" class="btn btn-green btn-lg" target="_blank" rel="noopener">WhatsApp ahora</a>
      </div>
    </div>
  </div>
</section>

<!-- ── MARCAS ── -->
<section class="brands-section" style="padding:32px 0">
  <div class="container">
    <p class="brands-label">Marcas que instalamos</p>
    <div class="brands-grid">
${brandsGrid}
    </div>
  </div>
</section>

<!-- ── GARANTÍAS UNIFICADAS ── -->
<section style="padding:32px 0;background:#EBF4FF;border-top:2px solid #DBEAFE">
  <div style="max-width:900px;margin:0 auto;padding:0 24px">
    <h3 style="font-size:1.1rem;font-weight:700;color:#0B1E3D;margin-bottom:16px;text-align:center">Condiciones de garantía</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
      <div style="background:white;border-radius:12px;padding:20px;border-left:4px solid #0066FF">
        <strong style="color:#0066FF;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em">Garantía del fabricante</strong>
        <p style="margin-top:8px;font-size:.88rem;color:#374151;line-height:1.6"><strong>3 años de garantía directamente con el fabricante.</strong> El fabricante gestiona y cubre todos los defectos de fabricación del equipo. Zervitecnics te acompaña en el proceso de reclamación si fuera necesario.</p>
      </div>
      <div style="background:white;border-radius:12px;padding:20px;border-left:4px solid #00C896">
        <strong style="color:#00C896;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em">Garantía de instalación Zervitecnics</strong>
        <p style="margin-top:8px;font-size:.88rem;color:#374151;line-height:1.6"><strong>3 años de garantía por nuestra instalación.</strong> Cubre cualquier problema derivado del trabajo realizado: sistema de drenaje, carga de gas, conexiones eléctricas y correcta puesta en marcha del equipo.</p>
      </div>
      <div style="background:white;border-radius:12px;padding:20px;border-left:4px solid #F59E0B">
        <strong style="color:#F59E0B;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em">Condiciones de mantenimiento</strong>
        <p style="margin-top:8px;font-size:.88rem;color:#374151;line-height:1.6">Para mantener vigente la garantía de instalación de 3 años, el equipo deberá recibir los <strong>mantenimientos preventivos recomendados</strong>. La falta de mantenimiento periódico podrá suponer la pérdida de la garantía ofrecida por Zervitecnics.</p>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><div class="logo"><picture><source srcset="${prefix}img/logo_zervitecnics.webp" type="image/webp"><img src="${prefix}img/logo_zervitecnics.png" alt="Zervitecnics" style="height:56px;width:auto;object-fit:contain"></picture></div><p style="margin-top:16px">Instalación profesional de aire acondicionado en Barcelona. Técnico certificado.</p></div><div class="footer-col"><h4>Servicios</h4><ul><li><a href="${prefix}categorias/split.html">Split 1×1</a></li><li><a href="${prefix}categorias/multisplit.html">Multisplit</a></li><li><a href="${prefix}categorias/conductos.html">Por Conductos</a></li><li><a href="${prefix}subvenciones.html">Subvenciones</a></li></ul></div><div class="footer-col"><h4>Marcas</h4><ul><li><a href="${prefix}marcas/daikin.html">Daikin</a></li><li><a href="${prefix}marcas/mitsubishi.html">Mitsubishi</a></li><li><a href="${prefix}marcas/fujitsu.html">Fujitsu</a></li><li><a href="${prefix}marcas/lg.html">LG</a></li><li><a href="${prefix}marcas/samsung.html">Samsung</a></li><li><a href="${prefix}marcas/hisense.html">Hisense</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><div class="footer-contact-item"><svg viewBox="0 0 24 24" fill="var(--blue)" style="width:18px;height:18px"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg><a href="tel:+34625215983" style="color:rgba(255,255,255,.6)">625 215 983</a></div></div></div><div class="footer-bottom"><p>© 2026 Zervitecnics Barcelona.</p><div class="footer-legal"><a href="${prefix}legal/privacidad.html">Privacidad</a><a href="${prefix}legal/cookies.html">Cookies</a><a href="${prefix}legal/aviso-legal.html">Aviso legal</a></div></div></footer>
<a class="whatsapp-float" href="https://wa.me/34625215983" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp"><svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
<div class="cookie-banner"><div class="cookie-text">Usamos cookies. <a href="${prefix}legal/cookies.html">Más info</a></div><div class="cookie-actions"><button class="btn-cookie-accept">Aceptar</button><button class="btn-cookie-necessary">Solo necesarias</button></div></div>
<script src="${prefix}js/shared.js?${CACHE_BUST}"></script>
<script src="${prefix}js/pages.js?${CACHE_BUST}"></script>

<!-- ── NOTA LEGAL MARCAS ── -->
<div style="background:#F8F9FA;border-top:1px solid #E5E7EB;padding:16px 0;font-size:.75rem;color:#6B7280;line-height:1.6">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <strong style="color:#374151">Aviso legal sobre marcas comerciales:</strong>
    Zervitecnics no tiene relación comercial, societaria ni representación oficial con ninguna de las marcas mostradas en este sitio web, salvo indicación expresa en contrario.
    Los nombres comerciales, marcas registradas y logotipos de fabricantes (Daikin, Mitsubishi Electric, Fujitsu, LG, Samsung, Hisense, Haier, Panasonic, Toshiba, Midea y otras) se utilizan únicamente con carácter descriptivo e informativo, con el fin de facilitar al usuario la identificación de los productos con los que Zervitecnics presta sus servicios de suministro, instalación, mantenimiento y reparación.
    El uso referencial de estas marcas no implica asociación, patrocinio, autorización ni representación oficial por parte de los fabricantes, y se realiza al amparo del artículo 37 de la Ley 17/2001 de Marcas y la normativa comunitaria aplicable.
  </div>
</div>

</body>
</html>
`;
}

// ── Ejecución ──

if (!fs.existsSync(OUT_CAP)) fs.mkdirSync(OUT_CAP, { recursive: true });

let count = 0;
const breakdown = { 'marca×ciudad': 0, 'capacidad×ciudad': 0 };

for (const marca of MARCAS) {
  for (const ciudad of CIUDADES) {
    const fileName = `${marca.slug}-${ciudad.slug}.html`;
    fs.writeFileSync(path.join(OUT_MARCAS, fileName), paginaMarcaCiudad(marca, ciudad), 'utf8');
    count++;
    breakdown['marca×ciudad']++;
  }
}

for (const cap of CAPACIDADES) {
  for (const ciudad of CIUDADES) {
    const fileName = `${cap.frig}-frigorias-${ciudad.slug}.html`;
    fs.writeFileSync(path.join(OUT_CAP, fileName), paginaCapacidadCiudad(cap, ciudad), 'utf8');
    count++;
    breakdown['capacidad×ciudad']++;
  }
}

console.log(`Fase 4 generada: ${count} páginas`);
console.log(`  - marca × ciudad:     ${breakdown['marca×ciudad']} en aires-acondicionados/marcas/`);
console.log(`  - capacidad × ciudad: ${breakdown['capacidad×ciudad']} en aires-acondicionados/capacidades/`);
