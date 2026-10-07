#!/usr/bin/env node
/*
 * Auditoría de imágenes (SOLO LECTURA: no modifica páginas ni imágenes).
 *
 * Recorre todos los HTML del repo y genera docs/auditoria-imagenes.csv con una
 * fila por cada imagen usada en cada página (<img> y og:image):
 *   página, tipo de página, localidad, marca, capacidad, origen, imagen, existe,
 *   tamaño en KB, formato, ancho_px, alto_px, WebP servido, WebP en disco,
 *   alt, texto alt, width/height, loading lazy, línea, repetida en N páginas.
 *
 * Uso: node tools/audit-images.js
 * No necesita dependencias: las medidas en píxeles se leen de la cabecera del
 * archivo (JPEG, PNG, WebP).
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'docs', 'auditoria-imagenes.csv');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tools', 'docs']);

const ciudades = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ciudades.json'), 'utf8'));
const CITY_SLUGS = ciudades.map(c => c.slug).sort((a, b) => b.length - a.length);
const CITY_NAME = Object.fromEntries(ciudades.map(c => [c.slug, c.nombre]));

function findHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtmlFiles(full, acc);
    else if (/\.html?$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

/* ── Tipo de página a partir de la ruta ── */
function classify(rel) {
  const base = path.basename(rel, '.html');
  let m;
  const r = { tipo: 'otra', localidad: '', marca: '', capacidad: '' };
  if (rel === 'index.html') r.tipo = 'portada-dominio';
  else if (rel === 'aires-acondicionados/index.html') r.tipo = 'portada-vertical';
  else if (rel.startsWith('aires-acondicionados/capacidades/')) {
    r.tipo = 'capacidad/ciudad';
    m = base.match(/^(\d+)-frigorias-(.+)$/);
    if (m) { r.capacidad = m[1]; r.localidad = m[2]; }
  } else if (rel.startsWith('aires-acondicionados/marcas/')) {
    if ((m = base.match(/^(.+?)-(\d{4})-frigorias$/))) { r.tipo = 'marca/capacidad'; r.marca = m[1]; r.capacidad = m[2]; }
    else {
      const city = CITY_SLUGS.find(s => base.endsWith('-' + s));
      if (city) { r.tipo = 'marca/ciudad'; r.localidad = city; r.marca = base.slice(0, -(city.length + 1)); }
      else { r.tipo = 'marca/raiz'; r.marca = base; }
    }
  } else if (rel.startsWith('aires-acondicionados/zonas/')) { r.tipo = 'zona'; r.localidad = base; }
  else if (rel.startsWith('aires-acondicionados/mantenimiento-zonas/')) { r.tipo = 'mantenimiento/zona'; r.localidad = base; }
  else if (rel.startsWith('aires-acondicionados/mantenimiento-marcas/')) { r.tipo = 'mantenimiento/marca'; r.marca = base; }
  else if (rel.startsWith('aires-acondicionados/categorias/')) r.tipo = 'categoria';
  else if (rel.startsWith('aires-acondicionados/guias/')) r.tipo = 'guia';
  else if (rel.startsWith('aires-acondicionados/legal/')) r.tipo = 'legal';
  else if (/404\.html$/.test(rel) || /gracias\.html$/.test(rel)) r.tipo = 'sistema';
  else if (rel.startsWith('aires-acondicionados/')) r.tipo = 'servicio';
  if (CITY_NAME[r.localidad]) r.localidad = CITY_NAME[r.localidad];
  return r;
}

/* ── Medidas en píxeles leyendo la cabecera ── */
function imageSize(file) {
  try {
    const b = fs.readFileSync(file);
    if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = b.toString('ascii', 12, 16);
      if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
      if (chunk === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
      if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        const len = b.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
  } catch (e) { /* archivo ilegible: se deja vacío */ }
  return ['', ''];
}

function attr(tag, name) {
  const m = tag.match(new RegExp('\\s' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i'));
  return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
}
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

function resolveLocal(pageRel, src) {
  if (!src) return null;
  const clean = src.split('?')[0].split('#')[0];
  if (/^https:\/\/zervitecnics\.es\//.test(clean)) return clean.replace('https://zervitecnics.es/', '');
  if (/^(https?:|data:|\/\/)/i.test(clean)) return null;
  return clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(pageRel), clean));
}

const sizeCache = new Map();
function fileInfo(rel) {
  if (sizeCache.has(rel)) return sizeCache.get(rel);
  const abs = path.join(REPO, rel);
  let info = { exists: false, kb: '', w: '', h: '' };
  if (fs.existsSync(abs)) {
    const [w, h] = imageSize(abs);
    info = { exists: true, kb: Math.round(fs.statSync(abs).size / 1024), w, h };
  }
  sizeCache.set(rel, info);
  return info;
}

/* ── Recorrido ── */
const rows = [];
const htmlFiles = findHtmlFiles(REPO).sort();
for (const file of htmlFiles) {
  const rel = path.relative(REPO, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const meta = classify(rel);

  // Rangos de <picture> con <source type="image/webp"> para saber si el <img> se sirve en WebP
  const pictures = [];
  const picRe = /<picture\b[\s\S]*?<\/picture>/gi;
  let pm;
  while ((pm = picRe.exec(html))) pictures.push({ start: pm.index, end: pm.index + pm[0].length, webp: /<source[^>]*type=["']image\/webp["']/i.test(pm[0]) });

  const imgRe = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(html))) {
    const tag = m[0];
    const src = attr(tag, 'src');
    const local = resolveLocal(rel, src);
    const inPic = pictures.find(p => m.index >= p.start && m.index < p.end);
    const alt = attr(tag, 'alt');
    rows.push({
      ...meta, pagina: rel, origen: inPic ? 'picture' : 'img', imagen: local || src || '', line: lineOf(html, m.index),
      webpServido: /\.webp$/i.test(src || '') || !!(inPic && inPic.webp),
      alt: alt !== null && alt.trim() !== '', altTexto: alt || '',
      wh: !!(attr(tag, 'width') && attr(tag, 'height')),
      lazy: (attr(tag, 'loading') || '').toLowerCase() === 'lazy',
    });
  }
  const og = html.match(/<meta\s+property=["']og:image["'][^>]*>/i);
  if (og) {
    const src = attr(og[0], 'content');
    rows.push({ ...meta, pagina: rel, origen: 'og:image', imagen: resolveLocal(rel, src) || src, line: lineOf(html, og.index),
      webpServido: /\.webp$/i.test(src || ''), alt: null, altTexto: '', wh: null, lazy: null });
  }
}

// Repetición: en cuántas páginas distintas aparece cada imagen (solo <img>/<picture>, sin og:image)
const pagesByImg = new Map();
for (const r of rows) {
  if (r.origen === 'og:image') continue;
  if (!pagesByImg.has(r.imagen)) pagesByImg.set(r.imagen, new Set());
  pagesByImg.get(r.imagen).add(r.pagina);
}

const si = v => (v === null ? '' : v ? 'sí' : 'no');
const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const header = ['pagina', 'tipo_pagina', 'localidad', 'marca', 'capacidad_frigorias', 'origen', 'imagen', 'existe', 'tamano_kb', 'formato',
  'ancho_px', 'alto_px', 'webp_servido', 'webp_en_disco', 'alt', 'texto_alt', 'width_height', 'loading_lazy', 'linea', 'repetida_en_paginas'];
const lines = [header.join(',')];
for (const r of rows) {
  const info = fileInfo(r.imagen);
  const fmt = (path.extname(r.imagen).slice(1) || '').toLowerCase();
  const webpDisk = /\.webp$/i.test(r.imagen) || fileInfo(r.imagen.replace(/\.(jpe?g|png)$/i, '.webp')).exists;
  const rep = pagesByImg.has(r.imagen) ? pagesByImg.get(r.imagen).size : '';
  lines.push([r.pagina, r.tipo, r.localidad, r.marca, r.capacidad, r.origen, r.imagen, si(info.exists), info.kb, fmt,
    info.w, info.h, si(r.webpServido), si(webpDisk), si(r.alt), r.altTexto, si(r.wh), si(r.lazy), r.line, rep].map(csvCell).join(','));
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, '\ufeff' + lines.join('\n') + '\n', 'utf8');
console.log(`Páginas: ${htmlFiles.length} · filas: ${rows.length} · imágenes distintas usadas: ${pagesByImg.size}`);
console.log(`CSV escrito en ${path.relative(REPO, OUT)}`);
