#!/usr/bin/env node
/*
 * build-opiniones-section.js — Renderiza la sección «Opiniones de clientes»
 * (HTML estático) a partir de data/reviews.json y la inyecta en todos los
 * archivos HTML del repo que contengan los marcadores:
 *
 *   <!-- opiniones:start -->
 *   ... contenido autogenerado ...
 *   <!-- opiniones:end -->
 *
 * Si data/reviews.json no existe o no hay reseñas, la sección queda vacía
 * (solo un comentario discreto). Nunca falla el build por falta de reseñas.
 *
 * Fuente única del enlace "Deja una reseña": data/reviews.json → reviewUrl
 * (poblado desde config/reviews.json → REVIEW_URL).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const REVIEWS_PATH = path.join(REPO, 'data', 'reviews.json');
const START = '<!-- opiniones:start -->';
const END = '<!-- opiniones:end -->';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stars(rating) {
  const r = Math.round(Number(rating) || 0);
  const full = '★'.repeat(Math.max(0, Math.min(5, r)));
  const empty = '☆'.repeat(5 - full.length);
  return `<span class="rev-stars" aria-label="${r} de 5 estrellas">${full}${empty}</span>`;
}

const GLOGO = '<span class="rev-g" aria-label="Google" title="Google">G</span>';

function renderReview(r, mapsUri) {
  const name = escapeHtml(r.author?.name || 'Cliente de Google');
  const initial = escapeHtml((r.author?.name || 'G').trim().charAt(0).toUpperCase());
  const text = escapeHtml((r.text || '').trim());
  const when = r.relative
    ? escapeHtml(r.relative)
    : (r.publishTime ? new Date(r.publishTime).toISOString().slice(0, 10) : '');
  return `  <li class="rev-item">
    <div class="rev-head">
      <span class="rev-avatar" aria-hidden="true">${initial}</span>
      <div class="rev-who"><cite class="rev-author">${name}</cite><span class="rev-when">${when}</span></div>
      ${GLOGO}
    </div>
    ${stars(r.rating)}
    <blockquote class="rev-text">${text}</blockquote>
  </li>`;
}

function renderSection(data) {
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  if (!reviews.length) return '<!-- opiniones: sin datos -->';

  const place = data.place || {};
  const avg = place.rating ? Number(place.rating).toFixed(1) : null;
  const count = place.userRatingCount || null;
  const reviewUrl = data.reviewUrl || '';
  const mapsUri = place.googleMapsUri || '';

  const header =
    (avg ? `<p class="rev-summary"><strong>${avg}/5</strong>` : '<p class="rev-summary">') +
    (count ? ` sobre ${count} reseñas` : '') +
    ' en <a href="' + escapeHtml(mapsUri || 'https://www.google.com/maps') + '" rel="nofollow noopener" target="_blank">Google</a>.</p>';

  const list = reviews.map(r => renderReview(r, mapsUri)).join('\n');

  const cta = reviewUrl
    ? `  <p class="rev-cta"><a class="btn btn-outline" href="${escapeHtml(reviewUrl)}" rel="nofollow noopener" target="_blank">Deja tu reseña en Google</a></p>`
    : '';

  return `<section class="section" id="opiniones" aria-labelledby="opiniones-title">
  <div class="container-sm">
    <div class="text-center mb-32 fade-up">
      <span class="section-label">Opiniones de clientes</span>
      <h2 class="section-title" id="opiniones-title">Lo que dicen sobre nosotros</h2>
      ${header}
    </div>
    <ul class="rev-list fade-up">
${list}
    </ul>
${cta}
    <p class="rev-attrib">Reseñas publicadas por los autores en Google. Zervitecnics no modifica el contenido.</p>
  </div>
</section>`;
}

function readReviews() {
  if (!fs.existsSync(REVIEWS_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf8'));
  } catch (err) {
    console.warn(`[build-opiniones] no se pudo parsear ${REVIEWS_PATH}: ${err.message}`);
    return null;
  }
}

function walk(dir, acc) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    if (entry.name === 'node_modules' || entry.name === 'graphify-out') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function injectInto(filePath, sectionHtml) {
  const original = fs.readFileSync(filePath, 'utf8');
  const startIdx = original.indexOf(START);
  const endIdx = original.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return false;

  const before = original.slice(0, startIdx + START.length);
  const after = original.slice(endIdx);
  const next = before + '\n' + sectionHtml + '\n' + after;
  if (next === original) return false;
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
}

function main() {
  const data = readReviews();
  const sectionHtml = data ? renderSection(data) : '<!-- opiniones: data/reviews.json ausente -->';

  const files = walk(REPO, []);
  let touched = 0;
  for (const f of files) {
    if (injectInto(f, sectionHtml)) touched++;
  }
  console.log(`[build-opiniones] actualizados ${touched} archivo(s).`);
}

main();
