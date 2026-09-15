#!/usr/bin/env node
/**
 * Añade JSON-LD BreadcrumbList a páginas sin él.
 * Idempotente: skip si ya contiene "BreadcrumbList".
 * Excluye 404.html y gracias.html (no rankean).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AA = path.join(ROOT, 'aires-acondicionados');
const BASE = 'https://zervitecnics.es';

const ZONAS_NOMBRE = {
  'badalona': 'Badalona',
  'castelldefels': 'Castelldefels',
  'cornella': 'Cornellà de Llobregat',
  'eixample': 'Eixample',
  'gracia': 'Gràcia',
  'hospitalet': "L'Hospitalet",
  'les-corts': 'Les Corts',
  'nou-barris': 'Nou Barris',
  'sabadell': 'Sabadell',
  'sant-andreu': 'Sant Andreu',
  'sant-cugat': 'Sant Cugat',
  'sant-marti': 'Sant Martí',
  'sants': 'Sants',
  'sarria': 'Sarrià',
  'terrassa': 'Terrassa',
};

const CATEGORIAS_NOMBRE = {
  'split': 'Split 1×1',
  'multisplit': 'Multisplit',
  'conductos': 'Por Conductos',
  'cassette': 'Cassette',
  'suelo-techo': 'Suelo-Techo',
  'dicore': 'Dicore',
  'marca-blanca': 'Marca Blanca',
};

const MARCAS_NOMBRE = {
  'daikin': 'Daikin',
  'fujitsu': 'Fujitsu',
  'haier': 'Haier',
  'hisense': 'Hisense',
  'lg': 'LG',
  'midea': 'Midea',
  'mitsubishi': 'Mitsubishi Electric',
  'panasonic': 'Panasonic',
  'samsung': 'Samsung',
  'toshiba': 'Toshiba',
};

const RAIZ_NOMBRE = {
  'index': 'Aires Acondicionados',
  'ofertas': 'Ofertas',
  'precios': 'Precios',
  'subvenciones': 'Subvenciones',
  'mantenimiento': 'Mantenimiento',
  'instalacion-personalizada': 'Instalación Personalizada',
};

const LEGAL_NOMBRE = {
  'aviso-legal': 'Aviso Legal',
  'cookies': 'Política de Cookies',
  'privacidad': 'Política de Privacidad',
};

const EXCLUIDOS = new Set(['404.html', 'gracias.html']);

function breadcrumbJsonLd(items) {
  const list = items.map((it, i) => `      { "@type": "ListItem", "position": ${i + 1}, "name": ${JSON.stringify(it.name)}, "item": "${it.item}" }`).join(',\n');
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
${list}
    ]
  }
  </script>
`;
}

function breadcrumbsFor(relPath) {
  const inicio = { name: 'Inicio', item: `${BASE}/aires-acondicionados/` };
  const url = `${BASE}/${relPath}`;

  // aires-acondicionados/index.html
  if (relPath === 'aires-acondicionados/index.html') {
    return [inicio];  // solo Inicio (es el propio hub)
  }

  const rest = relPath.replace(/^aires-acondicionados\//, '');
  const parts = rest.split('/');

  // Raíz aires-acondicionados/*.html
  if (parts.length === 1) {
    const slug = parts[0].replace(/\.html$/, '');
    if (RAIZ_NOMBRE[slug]) {
      return [inicio, { name: RAIZ_NOMBRE[slug], item: url }];
    }
    return null;
  }

  // aires-acondicionados/{dir}/{slug}.html
  const dir = parts[0];
  const slug = parts[1].replace(/\.html$/, '');

  if (dir === 'legal' && LEGAL_NOMBRE[slug]) {
    return [
      inicio,
      { name: 'Legal', item: `${BASE}/aires-acondicionados/legal/aviso-legal.html` },
      { name: LEGAL_NOMBRE[slug], item: url },
    ];
  }

  if (dir === 'categorias' && CATEGORIAS_NOMBRE[slug]) {
    return [
      inicio,
      { name: 'Servicios', item: `${BASE}/aires-acondicionados/#servicios` },
      { name: CATEGORIAS_NOMBRE[slug], item: url },
    ];
  }

  if (dir === 'zonas' && ZONAS_NOMBRE[slug]) {
    return [
      inicio,
      { name: 'Zonas', item: `${BASE}/aires-acondicionados/#zonas` },
      { name: ZONAS_NOMBRE[slug], item: url },
    ];
  }

  if (dir === 'marcas') {
    // Marca raíz (slug es solo la marca)
    if (MARCAS_NOMBRE[slug]) {
      return [
        inicio,
        { name: 'Marcas', item: `${BASE}/aires-acondicionados/#marcas` },
        { name: MARCAS_NOMBRE[slug], item: url },
      ];
    }
    // Marca-capacidad: {marca}-{num}-frigorias
    const m = slug.match(/^([a-z]+)-(\d+)-frigorias$/);
    if (m && MARCAS_NOMBRE[m[1]]) {
      const marca = m[1];
      const cap = m[2];
      return [
        inicio,
        { name: 'Marcas', item: `${BASE}/aires-acondicionados/#marcas` },
        { name: MARCAS_NOMBRE[marca], item: `${BASE}/aires-acondicionados/marcas/${marca}.html` },
        { name: `${cap} frigorías`, item: url },
      ];
    }
  }

  return null;
}

// Recolección de candidatos
function walk(dir, base = ROOT) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

const allHtml = walk(AA).filter(rel => !EXCLUIDOS.has(path.basename(rel)));

let inserted = 0, skipped = 0, noMap = 0;

for (const relPath of allHtml) {
  const fullPath = path.join(ROOT, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  if (content.includes('"@type": "BreadcrumbList"') || content.includes('"@type":"BreadcrumbList"')) {
    skipped++;
    continue;
  }

  const bc = breadcrumbsFor(relPath);
  if (!bc) {
    noMap++;
    console.warn(`⚠️  Sin mapeo: ${relPath}`);
    continue;
  }

  const snippet = breadcrumbJsonLd(bc);
  const idx = content.indexOf('</head>');
  if (idx === -1) {
    console.warn(`⚠️  Sin </head>: ${relPath}`);
    continue;
  }
  const nuevo = content.slice(0, idx) + snippet + content.slice(idx);
  fs.writeFileSync(fullPath, nuevo);
  inserted++;
}

console.log(`✓ BreadcrumbList insertado: ${inserted}`);
console.log(`  Ya presentes (skip): ${skipped}`);
if (noMap) console.log(`  Sin mapeo: ${noMap}`);
