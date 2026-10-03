/*
 * Helpers compartidos para el enlazado interno (tanda 1).
 * Lo consumen: tools/generate-geo-pages.js, tools/generate-marca-capacidad.js
 *              y tools/add-cross-links.js.
 *
 * Reglas:
 *  - Solo enlaza páginas de las ciudades en tools/data/round1-cities.json.
 *  - Variación de anchor-text entre 4-6 plantillas por contexto, nunca con
 *    el patrón canónico "aire acondicionado {marca} {ciudad}" (que sigue
 *    siendo exclusivo del title/H1 para no autocanibalizar).
 *  - Nunca incluye el modelo (marca.modeloRecomendado) en anchors.
 */

const path = require('path');
const ROUND1_SLUGS = require(path.join(__dirname, '..', 'data', 'round1-cities.json'));
const MARCAS = require(path.join(__dirname, '..', 'data', 'marcas.json'));
const CAPACIDADES = require(path.join(__dirname, '..', 'data', 'capacidades.json'));
const CIUDADES = require(path.join(__dirname, '..', 'data', 'ciudades.json'));

// Mapeo ciudad → slug de zona (solo para ciudades con /zonas/{slug}.html propia).
// Barcelona NO tiene zona única (sus 8 distritos están por separado).
const ZONA_DE_CIUDAD = {
  'badalona': 'badalona',
  'hospitalet-de-llobregat': 'hospitalet',
  'cornella-de-llobregat': 'cornella',
  'sant-cugat-del-valles': 'sant-cugat',
  'castelldefels': 'castelldefels',
  'sabadell': 'sabadell',
  'terrassa': 'terrassa'
};

const ROUND1_CITIES = ROUND1_SLUGS
  .map(s => CIUDADES.find(c => c.slug === s))
  .filter(Boolean);

function isRound1(slug) { return ROUND1_SLUGS.includes(slug); }

// ─── Pools de plantillas de anchor (sin modeloRecomendado) ───

const POOL_HUB_CAP = [
  'Aire acondicionado en {ciudad}',
  'Cobertura en {ciudad}',
  'Instalación en {ciudad}',
  'Climatización en {ciudad}',
  'También instalamos en {ciudad}'
];

const POOL_ZONA_MARCA = [
  '{marca} en {ciudad}',
  'Instalar {marca} en {ciudad}',
  '{marca} para {ciudad}',
  '{marca} a domicilio en {ciudad}',
  'Equipos {marca} en {ciudad}'
];

const POOL_ZONA_CAP = [
  '{cap} frigorías en {ciudad}',
  'Potencia {cap} frig. · {ciudad}',
  'Equipos de {cap} frigorías para {ciudad}',
  '{cap} frigorías ({kw} kW) en {ciudad}'
];

const POOL_RAIZ_CIUDAD = [
  '{marca} en {ciudad}',
  'Instalar {marca} en {ciudad}',
  '{marca} para {ciudad}',
  '{marca} a domicilio en {ciudad}',
  'Cobertura {marca} · {ciudad}',
  'Equipos {marca} en {ciudad}'
];

const POOL_MC_OTRAS_MARCAS = [
  '{marca} en {ciudad}',
  'Alternativa {marca} en {ciudad}',
  'Instalar {marca} en {ciudad}',
  '{marca} para {ciudad}',
  '{marca} a domicilio en {ciudad}'
];

const POOL_MC_CAPACIDADES = [
  '{cap} frigorías en {ciudad}',
  'Potencia {cap} frig. · {ciudad}',
  'Equipos de {cap} frigorías para {ciudad}',
  '{cap} frig. ({kw} kW) en {ciudad}'
];

const POOL_MCAP_CIUDAD = [
  '{marca} en {ciudad}',
  '{marca} {cap} frig. · {ciudad}',
  'Instalar {marca} en {ciudad}',
  '{marca} para {ciudad}',
  'Equipos {marca} en {ciudad}'
];

const POOL_CC_MARCAS = [
  '{marca} en {ciudad}',
  '{marca} de {cap} frig. para {ciudad}',
  'Instalar {marca} en {ciudad}',
  '{marca} a domicilio en {ciudad}',
  '{marca} para {ciudad}'
];

const POOL_CC_OTRAS_CAP = [
  '{cap} frigorías en {ciudad}',
  'Equipos de {cap} frigorías para {ciudad}',
  'Potencia {cap} frig. ({kw} kW) · {ciudad}',
  '{cap} frig. en {ciudad}'
];

function pick(pool, idx) { return pool[((idx % pool.length) + pool.length) % pool.length]; }

function tpl(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

// ─── Builders de bloque HTML ───

// Grid uniforme usado por todos los bloques (igual look & feel que las zone-cards)
function linkGrid(items) {
  const rows = items.map(it => {
    const dl = it.dataLoc ? ` data-location="${it.dataLoc}"` : '';
    return `      <a href="${it.href}" class="xlink-item"${dl}>${it.anchor}</a>`;
  }).join('\n');
  return `    <div class="xlink-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;max-width:900px;margin:0 auto">
${rows}
    </div>`;
}

function sectionWrap({ id, label, title, subtitle, body, bg }) {
  const sub = subtitle ? `      <p class="section-subtitle">${subtitle}</p>` : '';
  const bgClass = bg === 'gray' ? ' section-gray' : '';
  return `<section class="section${bgClass}" aria-labelledby="${id}-title">
  <div class="container">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">${label}</span>
      <h2 class="section-title" id="${id}-title">${title}</h2>
${sub}
    </div>
${body}
  </div>
</section>`;
}

// ─── Bloques por contexto ───

// Bloque usado en marca × ciudad: "Otras marcas en {ciudad}" + "Capacidades en {ciudad}" + "Zona en {ciudad}" (opcional)
// relPrefix: '' si está en /marcas/, '../' si estamos en /capacidades/.
function bloqueMarcaCiudad(marca, ciudad) {
  const otrasMarcas = MARCAS.filter(m => m.slug !== marca.slug);
  const otrasMarcasItems = otrasMarcas.map((m, i) => ({
    href: `${m.slug}-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_MC_OTRAS_MARCAS, i + MARCAS.findIndex(x => x.slug === marca.slug)), { marca: m.nombre, ciudad: ciudad.nombre }),
    dataLoc: `xlink-mc-${marca.slug}-${ciudad.slug}-${m.slug}`
  }));

  const capItems = CAPACIDADES.map((c, i) => ({
    href: `../capacidades/${c.frig}-frigorias-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_MC_CAPACIDADES, i + MARCAS.findIndex(x => x.slug === marca.slug)), { cap: c.frig, kw: c.kw, ciudad: ciudad.nombre }),
    dataLoc: `xlink-mc-${marca.slug}-${ciudad.slug}-cap${c.frig}`
  }));

  const zonaSlug = ZONA_DE_CIUDAD[ciudad.slug];
  const zonaItem = zonaSlug ? [{
    href: `../zonas/${zonaSlug}.html`,
    anchor: `Ver zona de ${ciudad.nombre}`,
    dataLoc: `xlink-mc-${marca.slug}-${ciudad.slug}-zona`
  }] : [];

  const body = `    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:0 auto 10px;text-align:left">Otras marcas que instalamos en ${ciudad.nombre}</h3>
${linkGrid(otrasMarcasItems)}
    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:28px auto 10px;text-align:left">Capacidades para ${ciudad.nombre}</h3>
${linkGrid(capItems)}${zonaItem.length ? `
    <p style="text-align:center;margin-top:24px"><a href="${zonaItem[0].href}" data-location="${zonaItem[0].dataLoc}" class="btn btn-secondary btn-sm">${zonaItem[0].anchor} →</a></p>` : ''}`;

  return `
<!-- ── XLINK: ${marca.slug.toUpperCase()}-${ciudad.slug.toUpperCase()} ── -->
${sectionWrap({
    id: `xlink-${marca.slug}-${ciudad.slug}`,
    label: `Otras opciones en ${ciudad.nombre}`,
    title: `Alternativas en ${ciudad.nombre}, por marca y por potencia`,
    body
  })}
`;
}

// Bloque usado en capacidad × ciudad: "Marcas en {ciudad}" + "Otras capacidades en {ciudad}" + "Zona en {ciudad}" (opcional)
function bloqueCapacidadCiudad(cap, ciudad) {
  const marcasItems = MARCAS.map((m, i) => ({
    href: `../marcas/${m.slug}-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_CC_MARCAS, i + CAPACIDADES.findIndex(x => x.frig === cap.frig)), { marca: m.nombre, cap: cap.frig, ciudad: ciudad.nombre }),
    dataLoc: `xlink-cc-${cap.frig}-${ciudad.slug}-${m.slug}`
  }));

  const otrasCap = CAPACIDADES.filter(c => c.frig !== cap.frig);
  const otrasCapItems = otrasCap.map((c, i) => ({
    href: `${c.frig}-frigorias-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_CC_OTRAS_CAP, i + CAPACIDADES.findIndex(x => x.frig === cap.frig)), { cap: c.frig, kw: c.kw, ciudad: ciudad.nombre }),
    dataLoc: `xlink-cc-${cap.frig}-${ciudad.slug}-cap${c.frig}`
  }));

  const zonaSlug = ZONA_DE_CIUDAD[ciudad.slug];
  const zonaItem = zonaSlug ? [{
    href: `../zonas/${zonaSlug}.html`,
    anchor: `Ver zona de ${ciudad.nombre}`,
    dataLoc: `xlink-cc-${cap.frig}-${ciudad.slug}-zona`
  }] : [];

  const body = `    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:0 auto 10px;text-align:left">Marcas que instalamos en ${ciudad.nombre}</h3>
${linkGrid(marcasItems)}
    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:28px auto 10px;text-align:left">Otras capacidades en ${ciudad.nombre}</h3>
${linkGrid(otrasCapItems)}${zonaItem.length ? `
    <p style="text-align:center;margin-top:24px"><a href="${zonaItem[0].href}" data-location="${zonaItem[0].dataLoc}" class="btn btn-secondary btn-sm">${zonaItem[0].anchor} →</a></p>` : ''}`;

  return `
<!-- ── XLINK: CAP${cap.frig}-${ciudad.slug.toUpperCase()} ── -->
${sectionWrap({
    id: `xlink-${cap.frig}-${ciudad.slug}`,
    label: `Elige marca para ${ciudad.nombre}`,
    title: `Instaladores de ${cap.frig} frigorías en ${ciudad.nombre}`,
    body
  })}
`;
}

// Bloque usado en marca × capacidad: "{marca} de {cap} frig por municipio" → 17 marca-ciudad
function bloqueMarcaCapacidad(marca, cap) {
  const items = ROUND1_CITIES.map((c, i) => ({
    href: `${marca.slug}-${c.slug}.html`,
    anchor: tpl(pick(POOL_MCAP_CIUDAD, i + MARCAS.findIndex(x => x.slug === marca.slug)), { marca: marca.nombre, cap: cap.frig, ciudad: c.nombre }),
    dataLoc: `xlink-mcap-${marca.slug}-${cap.frig}-${c.slug}`
  }));

  const body = linkGrid(items);
  return `
<!-- ── XLINK: ${marca.slug.toUpperCase()}-${cap.frig}-POR-MUNICIPIO ── -->
${sectionWrap({
    id: `xlink-${marca.slug}-${cap.frig}`,
    label: `${marca.nombre} ${cap.frig} frigorías`,
    title: `Instalación de ${marca.nombre} de ${cap.frig} frigorías por municipio`,
    subtitle: `Área Metropolitana de Barcelona — selecciona tu municipio para ver los detalles de servicio.`,
    body,
    bg: 'gray'
  })}
`;
}

// Bloque usado en zona (metro) para enlazar sus 10 marca-ciudad + 4 cap-ciudad
// ciudadSlug = slug de la ciudad real asociada a la zona (ej. 'hospitalet-de-llobregat' para zonas/hospitalet.html)
function bloqueZonaMetro(ciudad) {
  const marcasItems = MARCAS.map((m, i) => ({
    href: `../marcas/${m.slug}-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_ZONA_MARCA, i), { marca: m.nombre, ciudad: ciudad.nombre }),
    dataLoc: `xlink-zona-${ciudad.slug}-${m.slug}`
  }));

  const capItems = CAPACIDADES.map((c, i) => ({
    href: `../capacidades/${c.frig}-frigorias-${ciudad.slug}.html`,
    anchor: tpl(pick(POOL_ZONA_CAP, i), { cap: c.frig, kw: c.kw, ciudad: ciudad.nombre }),
    dataLoc: `xlink-zona-${ciudad.slug}-cap${c.frig}`
  }));

  const body = `    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:0 auto 10px;text-align:left">Instalación por marca en ${ciudad.nombre}</h3>
${linkGrid(marcasItems)}
    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:28px auto 10px;text-align:left">Capacidades disponibles en ${ciudad.nombre}</h3>
${linkGrid(capItems)}`;

  return `
<!-- ── XLINK-ZONA-${ciudad.slug.toUpperCase()} ── -->
${sectionWrap({
    id: `xlink-zona-${ciudad.slug}`,
    label: `Elige marca o tamaño`,
    title: `Instalación por marca y potencia en ${ciudad.nombre}`,
    body
  })}
`;
}

// Bloque usado en marca raíz: "Dónde instalamos {marca}" → 17 marca-ciudad
function bloqueMarcaRaiz(marca) {
  const items = ROUND1_CITIES.map((c, i) => ({
    href: `${marca.slug}-${c.slug}.html`,
    anchor: tpl(pick(POOL_RAIZ_CIUDAD, i), { marca: marca.nombre, ciudad: c.nombre }),
    dataLoc: `xlink-raiz-${marca.slug}-${c.slug}`
  }));
  const body = linkGrid(items);

  return `
<!-- ── XLINK-RAIZ-${marca.slug.toUpperCase()} ── -->
${sectionWrap({
    id: `xlink-raiz-${marca.slug}`,
    label: `Cobertura ${marca.nombre}`,
    title: `Dónde instalamos ${marca.nombre}`,
    subtitle: `Barcelona ciudad y municipios del Área Metropolitana donde ya atendemos equipos ${marca.nombre}.`,
    body,
    bg: 'gray'
  })}
`;
}

// 8 distritos de Barcelona (zonas de distrito) — todos enlazan al mismo set
// de 14 páginas de Barcelona (10 marca-barcelona + 4 cap-barcelona). El
// `seed` desplaza la rotación de plantillas para que las frases cambien
// entre distritos; el subtítulo es específico de cada distrito.
const DISTRITOS_BARCELONA = [
  { slug: 'eixample', nombre: "L'Eixample", seed: 0,
    subtitulo: "Para pisos del Eixample con galería interior, patio o fachada protegida: elige la marca o la potencia que necesitas de la red Barcelona." },
  { slug: 'gracia', nombre: 'Gràcia', seed: 1,
    subtitulo: "Fincas antiguas de Gràcia, pisos sin ascensor y entornos de plazas interiores: cualquier marca o potencia de nuestro catálogo Barcelona está disponible aquí." },
  { slug: 'sants', nombre: 'Sants-Montjuïc', seed: 2,
    subtitulo: "Bloques residenciales de Sants, Hostafrancs y la Marina del Prat Vermell: elige marca o potencia dentro de la red Barcelona." },
  { slug: 'sarria', nombre: 'Sarrià-Sant Gervasi', seed: 3,
    subtitulo: "Viviendas unifamiliares y pisos amplios de Sarrià-Sant Gervasi: todas las marcas y potencias del catálogo Barcelona disponibles." },
  { slug: 'les-corts', nombre: 'Les Corts', seed: 4,
    subtitulo: "Pisos residenciales de Les Corts y entorno de Pedralbes: la marca y potencia que elijas, con la cobertura de Barcelona." },
  { slug: 'sant-andreu', nombre: 'Sant Andreu', seed: 5,
    subtitulo: "Fincas de Sant Andreu, La Sagrera y Bon Pastor: toda la red de marcas y potencias de Barcelona disponible en el distrito." },
  { slug: 'sant-marti', nombre: 'Sant Martí', seed: 6,
    subtitulo: "Bloques modernos de Sant Martí, Poblenou y Diagonal Mar: cualquier marca o potencia de nuestro catálogo Barcelona." },
  { slug: 'nou-barris', nombre: 'Nou Barris', seed: 7,
    subtitulo: "Fincas de Nou Barris, Vall d'Hebron y Virrei Amat: toda la red de marcas y potencias que atendemos en Barcelona." }
];

function bloqueZonaDistritoBarcelona(distrito) {
  const seed = distrito.seed;

  const marcasItems = MARCAS.map((m, i) => ({
    href: `../marcas/${m.slug}-barcelona.html`,
    anchor: tpl(pick(POOL_ZONA_MARCA, i + seed), { marca: m.nombre, ciudad: 'Barcelona' }),
    dataLoc: `xlink-distrito-${distrito.slug}-${m.slug}`
  }));

  const capItems = CAPACIDADES.map((c, i) => ({
    href: `../capacidades/${c.frig}-frigorias-barcelona.html`,
    anchor: tpl(pick(POOL_ZONA_CAP, i + seed), { cap: c.frig, kw: c.kw, ciudad: 'Barcelona' }),
    dataLoc: `xlink-distrito-${distrito.slug}-cap${c.frig}`
  }));

  const intro = `${distrito.nombre} forma parte de la ciudad de Barcelona; cuando entres a una ficha de marca o de potencia verás la página general de Barcelona con las condiciones de servicio aplicables también a ${distrito.nombre}.`;

  const body = `    <p style="max-width:900px;margin:0 auto 24px;color:var(--gray-600);line-height:1.7;text-align:center">${intro}</p>
    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:0 auto 10px;text-align:left">Instalación por marca disponible para ${distrito.nombre}</h3>
${linkGrid(marcasItems)}
    <h3 style="font-size:1rem;color:#0B1E3D;max-width:900px;margin:28px auto 10px;text-align:left">Capacidades disponibles para ${distrito.nombre}</h3>
${linkGrid(capItems)}`;

  return `
<!-- ── XLINK-DISTRITO-${distrito.slug.toUpperCase()} ── -->
${sectionWrap({
    id: `xlink-distrito-${distrito.slug}`,
    label: `${distrito.nombre} · Barcelona`,
    title: `Elige marca o potencia para tu instalación en ${distrito.nombre}`,
    subtitle: distrito.subtitulo,
    body
  })}
`;
}

// Bloque hub: "También instalamos en" → 9 municipios NUEVOS (no los 8 con zona)
function bloqueHubMunicipios() {
  const nuevosSlugs = [
    'santa-coloma-de-gramenet','sant-adria-de-besos','esplugues-de-llobregat',
    'sant-just-desvern','sant-joan-despi','sant-boi-de-llobregat',
    'gava','viladecans','el-prat-de-llobregat'
  ];
  const items = nuevosSlugs.map((slug, i) => {
    const c = CIUDADES.find(x => x.slug === slug);
    return {
      href: `capacidades/2500-frigorias-${slug}.html`,
      anchor: tpl(pick(POOL_HUB_CAP, i), { ciudad: c.nombre }),
      dataLoc: `xlink-hub-${slug}`
    };
  });
  const body = linkGrid(items);

  return `
<!-- ── XLINK-HUB-MUNICIPIOS ── -->
${sectionWrap({
    id: `xlink-hub-municipios`,
    label: `Cobertura ampliada`,
    title: `También instalamos en`,
    subtitle: `Además de los distritos de Barcelona y las ciudades con página de zona propia, atendemos estos municipios del Barcelonès y Baix Llobregat.`,
    body
  })}
`;
}

module.exports = {
  ROUND1_SLUGS,
  ROUND1_CITIES,
  ZONA_DE_CIUDAD,
  DISTRITOS_BARCELONA,
  isRound1,
  bloqueMarcaCiudad,
  bloqueCapacidadCiudad,
  bloqueMarcaCapacidad,
  bloqueZonaMetro,
  bloqueZonaDistritoBarcelona,
  bloqueMarcaRaiz,
  bloqueHubMunicipios
};
